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
import { resolve } from "node:path";
import { execFileSync, execSync } from "node:child_process";

const ROOT = resolve(import.meta.dir, "../..");
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

// 3. Harmonize key symmetry across all locales
console.log("  Harmonizing key symmetry across zh, en, am...");
const zhFile = resolve(OUT_DIR, "zh.json");
const enFile = resolve(OUT_DIR, "en.json");
const amFile = resolve(OUT_DIR, "am.json");

const zhData = JSON.parse(await Bun.file(zhFile).text());
const enData = JSON.parse(await Bun.file(enFile).text());
const amData = JSON.parse(await Bun.file(amFile).text());

function flattenKeys(obj: Record<string, any>, prefix = ""): Map<string, any> {
  const map = new Map<string, any>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      for (const [subK, subV] of flattenKeys(v, key)) {
        map.set(subK, subV);
      }
    } else {
      map.set(key, v);
    }
  }
  return map;
}

function setNestedKey(obj: Record<string, any>, keyPath: string, value: any): void {
  const parts = keyPath.split(".");
  let curr = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!curr[p] || typeof curr[p] !== "object") {
      curr[p] = {};
    }
    curr = curr[p];
  }
  curr[parts[parts.length - 1]] = value;
}

const zhFlat = flattenKeys(zhData);
const enFlat = flattenKeys(enData);
const amFlat = flattenKeys(amData);

const allKeys = new Set([...zhFlat.keys(), ...enFlat.keys(), ...amFlat.keys()]);

for (const key of allKeys) {
  const zhVal = zhFlat.get(key);
  const enVal = enFlat.get(key);
  const amVal = amFlat.get(key);

  const fallback = zhVal ?? enVal ?? amVal;

  if (zhVal === undefined) setNestedKey(zhData, key, fallback);
  if (enVal === undefined) setNestedKey(enData, key, fallback);
  if (amVal === undefined) setNestedKey(amData, key, fallback);
}

await writeFile(zhFile, JSON.stringify(zhData, null, 2) + "\n");
await writeFile(enFile, JSON.stringify(enData, null, 2) + "\n");
await writeFile(amFile, JSON.stringify(amData, null, 2) + "\n");
console.log(`✓ Key symmetry harmonized (${allKeys.size} total keys across zh, en, am)`);

// 4. Cleanup
ssh(`rm -rf ${REMOTE_DIR}`);

console.log("\n✅  Translation pull complete. Files ready for build.");
