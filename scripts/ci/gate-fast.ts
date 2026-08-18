#!/usr/bin/env bun
/**
 * scripts/ci/gate-fast.ts
 * Gate: FAST (pre-commit) — Lint + Typecheck only, target < 15s
 */
import { spawn } from "node:child_process";

const R = "\x1b[0m", G = "\x1b[32m", C = "\x1b[36m", RE = "\x1b[31m", B = "\x1b[1m";

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

async function main() {
  console.log(`\n${C}${B}⚡ GATE:FAST — pre-commit${R}\n`);
  const t = Date.now();
  try {
    await run("bun", ["run", "scripts/tdd/check-test-pairing.ts"], "TDD Test Pairing Check");
    await run("bun", ["run", "lint:fast"], "Oxlint");
    await run("bunx", ["vinext", "check"], "Vinext typecheck");
    console.log(`\n${G}${B}✅ FAST gate passed in ${((Date.now() - t) / 1000).toFixed(1)}s${R}\n`);
  } catch (e: any) {
    console.error(`\n${RE}${B}🚫 FAST gate failed: ${e?.message}${R}\n`);
    process.exit(1);
  }
}
void main();
