#!/usr/bin/env bun
/**
 * deploy-preview.ts
 *
 * 部署 autoyj 翻译预览服务器到 152.32.175.18:8080（Docker 方式 + rsync 增量传输）
 *
 * ─────────────────────────────────────────────────────────────────
 * ⚠️  与 Cloudflare 正式部署完全独立，不影响正式环境
 *
 * 正式环境：bun run deploy         → Cloudflare Pages（静态，不连 Tolgee）
 * 预览环境：bun run deploy:preview  → 服务器 Docker:8080（本脚本）
 * ─────────────────────────────────────────────────────────────────
 *
 * 翻译人员工作流：
 *   1. 访问 http://152.32.175.18:8080
 *   2. Alt+点击文字 → 打开 Tolgee 编辑框
 *   3. 修改翻译 → 自动保存到 http://152.32.175.18:8085
 *   4. 运维：bun run deploy → 翻译进入 Cloudflare 正式部署
 */

import { execFileSync, execSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync, mkdirSync, cpSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

// ─── 配置（从 .env.preview 读取）────────────────────────────────
const SSH_HOST = process.env.PREVIEW_SERVER_HOST ?? "152.32.175.18";
const SSH_USER = process.env.PREVIEW_SERVER_USER ?? "ubuntu";
const SSH_PASS = process.env.PREVIEW_SERVER_PASS ?? "";
const SERVER_PORT = process.env.PREVIEW_SERVER_PORT ?? "8080";
const DEPLOY_DIR = process.env.PREVIEW_DEPLOY_DIR ?? "/opt/autoyj-preview";

const SSH_OPTS = "-o StrictHostKeyChecking=no -o PubkeyAuthentication=no -o PreferredAuthentications=password -o PasswordAuthentication=yes -o ControlMaster=auto -o ControlPath=/tmp/ssh-preview-%r@%h:%p -o ControlPersist=60s";

function sh(cmd: string, opts?: { cwd?: string; env?: NodeJS.ProcessEnv }) {
  execSync(cmd, { stdio: "inherit", cwd: opts?.cwd ?? ROOT, env: { ...process.env, ...opts?.env } });
}

function ssh(command: string) {
  const cmd = `sshpass -p '${SSH_PASS}' ssh ${SSH_OPTS} ${SSH_USER}@${SSH_HOST} "${command.replace(/"/g, '\\"')}"`;
  execSync(cmd, { stdio: "inherit", cwd: ROOT });
}

// ─── Main ─────────────────────────────────────────────────────────
console.log("🚀  部署翻译预览服务器（Docker + rsync 模式）\n");
console.log(`   目标：http://${SSH_HOST}:${SERVER_PORT}`);
console.log(`   Tolgee：${process.env.NEXT_PUBLIC_TOLGEE_API_URL ?? "http://152.32.175.18:8085"}`);
console.log(`   部署目录：${DEPLOY_DIR}\n`);

// 1. 先拉取最新翻译
console.log("📥  Step 1: 拉取最新翻译...");
sh("bun --env-file=.env.preview run scripts/tolgee/pull-translations.ts");
console.log("");

// 2. 用 .env.preview + standalone 模式构建
console.log("🔨  Step 2: 构建预览版本（standalone Node.js + Tolgee in-context 模式）...");
console.log("   - BUILD_TARGET=standalone → 产物：dist/standalone/server.js");
console.log("   - NEXT_PUBLIC_TOLGEE_API_KEY 已注入 bundle，Alt+点击将连接 Tolgee 8085\n");
sh("bun --env-file=.env.preview run vinext build", {
  env: { ...process.env, BUILD_TARGET: "standalone" },
});
console.log("");

// 3. 准备上传目录
console.log("📦  Step 3: 准备部署文件...");
const tmpDir = "/tmp/autoyj-preview-pkg";
if (existsSync(tmpDir)) sh(`rm -rf ${tmpDir}`);
mkdirSync(tmpDir, { recursive: true });

cpSync(resolve(ROOT, "dist", "standalone"), `${tmpDir}/standalone`, { recursive: true });
cpSync(resolve(ROOT, "public"), `${tmpDir}/public`, { recursive: true });
cpSync(resolve(ROOT, "deploy/preview/Dockerfile"), `${tmpDir}/Dockerfile`);
cpSync(resolve(ROOT, "deploy/preview/docker-compose.yml"), `${tmpDir}/docker-compose.yml`);
cpSync(resolve(ROOT, "package.json"), `${tmpDir}/package.json`);
if (existsSync(resolve(ROOT, "bun.lockb"))) cpSync(resolve(ROOT, "bun.lockb"), `${tmpDir}/bun.lockb`);
if (existsSync(resolve(ROOT, "wrangler.toml"))) cpSync(resolve(ROOT, "wrangler.toml"), `${tmpDir}/wrangler.toml`);
console.log("   准备完成\n");

// 4. rsync 快速增量上传
console.log("📤  Step 4: rsync 同步文件至服务器...");
ssh(`sudo mkdir -p ${DEPLOY_DIR} && sudo chown -R ubuntu:ubuntu ${DEPLOY_DIR}`);
const rsyncCmd = `sshpass -p '${SSH_PASS}' rsync -avz --delete -e "ssh ${SSH_OPTS}" ${tmpDir}/ ${SSH_USER}@${SSH_HOST}:${DEPLOY_DIR}/`;
execSync(rsyncCmd, { stdio: "inherit" });
console.log("   同步完成\n");

// 5. 服务器：docker compose up
console.log("🐳  Step 5: 服务器 Docker 启动预览服务...");
ssh([
  `cd ${DEPLOY_DIR}`,
  `sudo docker compose down 2>/dev/null || true`,
  `sudo docker compose build`,
  `sudo docker compose up -d`,
  `sleep 3`,
  `sudo docker ps --filter name=autoyj-preview --format "table {{.Names}}\t{{.Ports}}\t{{.Status}}"`,
].join(" && "));

console.log(`\n✅  预览服务器部署完成！`);
console.log(`   🌐  http://${SSH_HOST}:${SERVER_PORT}  （翻译 in-context 编辑）`);
console.log(`   📝  Alt+点击 → 编辑翻译 → 保存到 http://${SSH_HOST}:8085`);
console.log(`   📋  Tolgee 管理：http://${SSH_HOST}:8085  admin/TolgeeAdmin_Autoyj_2024`);
