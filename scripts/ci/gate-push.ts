#!/usr/bin/env bun
/**
 * scripts/ci/gate-push.ts
 * Gate: PUSH (pre-push) — D1 init + Tier 1-3 tests + Tier 4 Playwright E2E suite
 */
import { spawn, type ChildProcess } from "node:child_process";
import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

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

async function isServerReady(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:3000/en", { method: "HEAD", signal: AbortSignal.timeout(2000) });
    return res.status < 500;
  } catch { return false; }
}

async function ensureLocalServer(): Promise<ChildProcess | null> {
  if (await isServerReady()) { console.log(`${G}ℹ Local server already up and running${R}`); return null; }
  console.log(`${Y}⚡ Starting local dev server for E2E...${R}`);
  const srv = spawn("bun", ["run", "dev"], { stdio: "ignore", detached: true, env: { ...process.env, PORT: "3000" } });
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (await isServerReady()) { console.log(`${G}✓ Dev server ready${R}\n`); return srv; }
    await new Promise((r) => setTimeout(r, 500));
  }
  try { if (srv.pid) process.kill(-srv.pid, "SIGTERM"); } catch {}
  throw new Error("Dev server failed to start within 45s");
}

async function main() {
  console.log(`\n${C}${B}🔒 GATE:PUSH — D1 Schema + Tier 1-3 Unit/Integration + Tier 4 Playwright E2E${R}\n`);
  const t = Date.now();
  let srv: ChildProcess | null = null;
  try {
    if (schemaChanged()) {
      console.log(`${Y}⚡ schema.sql changed — running D1 local init${R}`);
      await run("bun", ["run", "db:local:init"], "D1 Schema Init");
    } else {
      console.log(`${G}ℹ schema.sql unchanged — D1 init skipped${R}`);
    }
    
    // Tier 1-3
    await run("bun", ["test", "tests/unit", "tests/component", "tests/integration"], "Tier 1-3 Tests (Unit, Component, Integration)");
    
    // Tier 4 E2E
    srv = await ensureLocalServer();
    try { rmSync("test-results", { recursive: true, force: true }); } catch {}
    await run("bun", ["run", "test:e2e"], "Tier 4: Playwright Comprehensive E2E Tests");

    console.log(`\n${G}${B}✅ PUSH gate passed in ${((Date.now() - t) / 1000).toFixed(1)}s — 100% verified${R}\n`);
  } catch (e: any) {
    console.error(`\n${RE}${B}🚫 PUSH gate failed: ${e?.message}${R}\n`);
    process.exit(1);
  } finally {
    try { rmSync("test-results", { recursive: true, force: true }); } catch {}
    if (srv?.pid) { try { process.kill(-srv.pid, "SIGTERM"); } catch { try { srv?.kill("SIGTERM"); } catch {} } }
  }
}
void main();
