#!/usr/bin/env bun
/**
 * pull-translations.ts
 *
 * BUILD-TIME script: pulls translations from Tolgee server.
 * Exports are done via SSH on the remote server (avoids Bun fetch ECONNRESET),
 * then SCP'd back to i18n/translations/ as build artifacts.
 *
 * Required env vars (.env.build):
 *   TOLGEE_API_URL      http://152.32.175.18:8080
 *   TOLGEE_API_KEY      <project API key>
 *   TOLGEE_PROJECT_ID   <numeric id>
 *   TOLGEE_SSH_HOST     152.32.175.18
 *   TOLGEE_SSH_USER     ubuntu
 *   TOLGEE_SSH_PASS     <password>
 */

import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync, execSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");
const OUT_DIR = resolve(ROOT, "i18n/translations");

const API_URL = (process.env.TOLGEE_API_URL || process.env.NEXT_PUBLIC_TOLGEE_API_URL)?.replace(/\/$/, "") ?? "";
const API_KEY = process.env.TOLGEE_API_KEY || process.env.NEXT_PUBLIC_TOLGEE_API_KEY || "";
const PROJECT_ID = Number(process.env.TOLGEE_PROJECT_ID || process.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID || "0");
const SSH_HOST = process.env.TOLGEE_SSH_HOST ?? "152.32.175.18";
const SSH_USER = process.env.TOLGEE_SSH_USER ?? "ubuntu";
const SSH_PASS = process.env.TOLGEE_SSH_PASS ?? "";
// URL used by curl ON the remote server — always localhost to avoid firewall
const INTERNAL_URL = process.env.TOLGEE_INTERNAL_URL ?? "http://localhost:8080";

const LOCALES = ["zh", "en", "am"] as const;
const REMOTE_DIR = "/tmp/tolgee-pull";

if (!API_URL || !API_KEY || !PROJECT_ID) {
  console.error("❌  Missing TOLGEE_API_URL / TOLGEE_API_KEY / TOLGEE_PROJECT_ID");
  process.exit(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// SSH / SCP helpers (use execFileSync to avoid shell quoting issues)
// ─────────────────────────────────────────────────────────────────────────────
const SSH_COMMON = [
  "-o", "StrictHostKeyChecking=no",
  "-o", "PubkeyAuthentication=no",
  "-o", "PreferredAuthentications=password",
  "-o", "PasswordAuthentication=yes",
  "-o", "ControlMaster=auto",
  "-o", "ControlPath=/tmp/ssh-pull-%r@%h:%p",
  "-o", "ControlPersist=60s",
];

function ssh(command: string): void {
  const args: string[] = SSH_PASS
    ? ["-p", SSH_PASS, "ssh", ...SSH_COMMON, `${SSH_USER}@${SSH_HOST}`, command]
    : ["ssh", ...SSH_COMMON, `${SSH_USER}@${SSH_HOST}`, command];
  const prog = SSH_PASS ? "sshpass" : "ssh";
  execFileSync(prog, args, { stdio: ["pipe", "inherit", "inherit"] });
}

function scpFrom(remotePath: string, localPath: string): void {
  const remote = `${SSH_USER}@${SSH_HOST}:${remotePath}`;
  const args: string[] = SSH_PASS
    ? ["-p", SSH_PASS, "scp", ...SSH_COMMON, remote, localPath]
    : ["scp", ...SSH_COMMON, remote, localPath];
  const prog = SSH_PASS ? "sshpass" : "scp";
  execFileSync(prog, args, { stdio: ["pipe", "inherit", "inherit"] });
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────
console.log(`Pulling translations from ${API_URL} (project ${PROJECT_ID})…\n`);
await mkdir(OUT_DIR, { recursive: true });

// 1. Export all locales on server in a single SSH session
console.log("  Exporting translations on remote Tolgee server...");
const remoteCmds: string[] = [`mkdir -p ${REMOTE_DIR}`];
for (const lang of LOCALES) {
  const exportUrl = `${INTERNAL_URL}/v2/projects/${PROJECT_ID}/export?format=JSON&languages=${lang}&structureDelimiter=.`;
  const zipPath = `${REMOTE_DIR}/${lang}.zip`;
  const jsonPath = `${REMOTE_DIR}/${lang}.json`;
  remoteCmds.push(`curl -sf -H "X-API-Key: ${API_KEY}" "${exportUrl}" -o ${zipPath}`);
  remoteCmds.push(`python3 -c "import zipfile; z=zipfile.ZipFile('${zipPath}'); [open('${jsonPath}','wb').write(z.read(n)) for n in z.namelist() if n.endswith('.json')]"`);
}
ssh(remoteCmds.join(" && "));
console.log("✓ Remote export complete");

// 2. rsync JSON files back locally in a single connection
console.log("  Downloading translation files...");
const rsyncOpts = SSH_COMMON.join(" ");
const rsyncCmd = SSH_PASS
  ? `sshpass -p '${SSH_PASS}' rsync -avz -e 'ssh ${rsyncOpts}' '${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/' '${OUT_DIR}/'`
  : `rsync -avz -e 'ssh ${rsyncOpts}' '${SSH_USER}@${SSH_HOST}:${REMOTE_DIR}/' '${OUT_DIR}/'`;
execSync(rsyncCmd, { stdio: "inherit" });

// 3. Cleanup
ssh(`rm -rf ${REMOTE_DIR}`);

console.log("\n✅  Translation pull complete. Files ready for build.");
