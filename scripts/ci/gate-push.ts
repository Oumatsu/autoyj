#!/usr/bin/env bun
/**
 * scripts/ci/gate-push.ts
 * Gate: PUSH (pre-push) — D1 init (smart skip) + Tier 1-3 tests, target < 90s
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";

const R = "\x1b[0m", G = "\x1b[32m", Y = "\x1b[33m", C = "\x1b[36m", RE = "\x1b[31m", B = "\x1b[1m";

function run(cmd: string, args: string[], label: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = Date.now();
    const p = spawn(cmd, args, { stdio: "inherit", env: { ...process.env, FORCE_COLOR: "1" } });
    p.on("close", (code) => {
      const s = ((Date.now() - t) / 1000).toFixed(1);
      if (code === 0) { console.log(`${G}✓ ${label} (${s}s)${R}`); resolve(); }
      else { console.error(`${RE}✗ ${label} failed (${s}s)${R}`); reject(new Error(label)); }
    });
    p.on("error", (e) => reject(e));
  });
}

/** true if schema.sql changed in the latest commit or is dirty */
function schemaChanged(): boolean {
  try {
    const diff = execSync("git diff --name-only HEAD~1 HEAD -- server/db/schema.sql 2>/dev/null", { encoding: "utf8" }).trim();
    if (diff.length > 0) return true;
    const dirty = execSync("git status --short server/db/schema.sql", { encoding: "utf8" }).trim();
    return dirty.length > 0;
  } catch { return true; }
}

async function main() {
  console.log(`\n${C}${B}🔒 GATE:PUSH — D1 schema + Tier 1-3 tests${R}\n`);
  const t = Date.now();
  try {
    if (schemaChanged()) {
      console.log(`${Y}⚡ schema.sql changed — running D1 local init${R}`);
      await run("bun", ["run", "db:local:init"], "D1 Schema Init");
    } else {
      console.log(`${G}ℹ schema.sql unchanged — D1 init skipped${R}`);
    }
    await run("bun", ["test", "tests/unit", "tests/component", "tests/integration"], "Tier 1-3 Tests");
    console.log(`\n${G}${B}✅ PUSH gate passed in ${((Date.now() - t) / 1000).toFixed(1)}s${R}\n`);
  } catch (e: any) {
    console.error(`\n${RE}${B}🚫 PUSH gate failed: ${e?.message}${R}\n`);
    process.exit(1);
  }
}
void main();
