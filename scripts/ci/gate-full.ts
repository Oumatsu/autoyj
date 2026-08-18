#!/usr/bin/env bun
/**
 * scripts/ci/gate-full.ts
 * Gate: FULL (manual, pre-release) — W3C + Playwright E2E + Lighthouse
 * Usage: bun run gate:full
 */
import { spawn, type ChildProcess } from "node:child_process";
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

async function isServerReady(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:3000/en", { method: "HEAD", signal: AbortSignal.timeout(2000) });
    return res.status < 500;
  } catch { return false; }
}

async function ensureLocalServer(): Promise<ChildProcess | null> {
  if (await isServerReady()) { console.log(`${G}ℹ Server already up${R}`); return null; }
  console.log(`${Y}⚡ Starting dev server...${R}`);
  const srv = spawn("bun", ["run", "dev"], { stdio: "ignore", detached: true, env: { ...process.env, PORT: "3000" } });
  const deadline = Date.now() + 45_000;
  while (Date.now() < deadline) {
    if (await isServerReady()) { console.log(`${G}✓ Server ready${R}\n`); return srv; }
    await new Promise((r) => setTimeout(r, 500));
  }
  try { if (srv.pid) process.kill(-srv.pid, "SIGTERM"); } catch {}
  throw new Error("Server failed to start within 45s");
}

async function main() {
  console.log(`\n${C}${B}🚀 GATE:FULL — W3C + E2E + Lighthouse (manual / pre-release)${R}\n`);
  const t = Date.now();
  let srv: ChildProcess | null = null;
  try {
    srv = await ensureLocalServer();
    await run("bun", ["run", "audit:w3c"], "W3C & PWA Audit");
    try { rmSync("test-results", { recursive: true, force: true }); } catch {}
    await run("bun", ["run", "test:e2e"], "Playwright E2E");
    await run("bun", ["run", "audit:lighthouse"], "Lighthouse 100/100");
    console.log(`\n${G}${B}✅ FULL gate passed in ${((Date.now() - t) / 1000).toFixed(1)}s — release ready${R}\n`);
  } catch (e: any) {
    console.error(`\n${RE}${B}🚫 FULL gate failed: ${e?.message}${R}\n`);
    process.exit(1);
  } finally {
    try { rmSync("test-results", { recursive: true, force: true }); } catch {}
    if (srv?.pid) { try { process.kill(-srv.pid, "SIGTERM"); } catch { try { srv?.kill("SIGTERM"); } catch {} } }
  }
}
void main();
