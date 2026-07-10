/**
 * setup-i18n-tables-v2.mjs
 *
 * 在已有的飞书多维表格（Base）中，自动创建单张多语言翻译表：
 *   - I18n Locale（网站多语言翻译）
 *
 * 字段结构：
 *   - Key (主键 - 文本)
 *   - ZH (中文翻译 - 文本)
 *   - EN (英文翻译 - 文本)
 *   - AM (阿姆语翻译 - 文本)
 *   - Notes (运营备注 - 文本)
 *
 * Usage:
 *   node scripts/setup-i18n-tables-v2.mjs
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, resolve } from "node:path";

// ─── 加载 .dev.vars ────────────────────────────────────────────
function loadDevVars(path = ".dev.vars") {
  const fullPath = resolve(process.cwd(), path);
  if (!existsSync(fullPath)) return {};
  const lines = readFileSync(fullPath, "utf8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
  return env;
}

const env = { ...process.env, ...loadDevVars() };

function requireEnv(key) {
  const val = env[key];
  if (!val) throw new Error(`Missing env var: ${key}. Please set in .dev.vars`);
  return val;
}

// ─── lark-cli 封装 ────────────────────────────────────────────
const tempDir = ".lark-tmp";
mkdirSync(tempDir, { recursive: true });

function run(args) {
  const command =
    process.platform === "win32"
      ? "powershell.exe"
      : process.env.LARK_CLI_BIN || "lark-cli";
  const commandArgs =
    process.platform === "win32"
      ? [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          process.env.LARK_CLI_BIN || join(process.env.APPDATA || "", "npm", "lark-cli.ps1"),
          ...args,
        ]
      : args;

  const output = execFileSync(command, commandArgs, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  const start = output.indexOf("{");
  const end = output.lastIndexOf("}");
  if (start === -1 || end === -1)
    throw new Error(`lark-cli returned non-JSON output:\n${output}`);
  return JSON.parse(output.slice(start, end + 1));
}

function jsonFileArg(name, value) {
  const file = join(tempDir, `${name}-${Math.random().toString(36).slice(2)}.json`);
  writeFileSync(file, JSON.stringify(value), "utf8");
  return `@./${file.replaceAll("\\", "/")}`;
}

// ─── 主流程 ───────────────────────────────────────────────────
const baseToken = requireEnv("FEISHU_BASE_APP_TOKEN");
const TABLE_NAME = "I18n Locale";

const FIELDS = [
  { name: "Key",   type: "text" },
  { name: "ZH",    type: "text" },
  { name: "EN",    type: "text" },
  { name: "AM",    type: "text" },
  { name: "Notes", type: "text" },
];

console.log("📋 读取飞书多维表格现有子表列表...");
let tableListData;
try {
  tableListData = run([
    "base", "+table-list",
    "--as", "bot",
    "--base-token", baseToken,
    "--limit", "100",
  ]);
} catch (err) {
  console.error(`❌ 无法列取表格列表: ${err.message}`);
  console.error("   请确认 lark-cli 已正确登录，且 FEISHU_BASE_APP_TOKEN 正确。");
  process.exit(1);
}

const existingTables = tableListData.items || tableListData.tables || tableListData.data?.items || tableListData.data?.tables || [];
const existingMap = {};
for (const t of existingTables) {
  const id = t.table_id || t.id;
  const name = t.name || t.table_name;
  if (id && name) existingMap[name] = id;
}
console.log(`   已找到 ${Object.keys(existingMap).length} 张现有子表。\n`);

let tableId = existingMap[TABLE_NAME];

if (tableId) {
  console.log(`✅ "${TABLE_NAME}" (网站多语言翻译表) 已存在，跳过创建。Table ID: ${tableId}`);
} else {
  console.log(`🆕 创建 "${TABLE_NAME}" (网站多语言翻译表)...`);
  try {
    run([
      "base", "+table-create",
      "--as", "user",
      "--base-token", baseToken,
      "--name", TABLE_NAME,
      "--fields", jsonFileArg(TABLE_NAME, FIELDS),
    ]);
    
    // 重新拉取表列表获取新创建表的 ID
    console.log("📋 重新获取翻译表 ID...");
    const refreshed = run([
      "base", "+table-list",
      "--as", "bot",
      "--base-token", baseToken,
      "--limit", "100",
    ]);
    const refreshedTables = refreshed.items || refreshed.tables || refreshed.data?.items || refreshed.data?.tables || [];
    for (const t of refreshedTables) {
      const id = t.table_id || t.id;
      const tname = t.name || t.table_name;
      if (tname === TABLE_NAME && id) tableId = id;
    }
    console.log(`   ✅ 创建成功！Table ID: ${tableId}`);
  } catch (err) {
    console.error(`   ❌ 创建失败: ${err.message}`);
    process.exit(1);
  }
}

console.log("\n─────────────────────────────────────────");
console.log("🎉 多语言翻译表已就绪！");
console.log("\n请将以下变量添加到 .dev.vars 文件中（并删除旧的三个翻译表变量）：\n");
console.log(`FEISHU_TABLE_I18N=${tableId}`);
console.log("\n配置完成后，运行以下命令将现有本地翻译一键合并并导入飞书：");
console.log("  npm run seed:i18n\n");
console.log("配置完成后，运行以下命令从飞书同步到本地代码：");
console.log("  npm run sync:i18n\n");
