#!/usr/bin/env bun
/**
 * scripts/ci/pre-push-gate.ts
 *
 * Local pre-push Zero-Human-Check Quality Gate.
 * Runs exhaustive local verification before `git push`:
 * 1. Oxlint & Vinext Static Verification
 * 2. Cloudflare D1 Local SQLite Database Schema Init
 * 3. Tier 1-3 Automated Tests (Unit, Component, Integration)
 * 4. W3C & PWA Standards Audit
 * 5. Tier 4 Playwright Full E2E User Journeys
 * 6. Google Lighthouse 100/100 Production Audit
 */

import { spawn, type ChildProcess } from "node:child_process";

const COLOR_CYAN = "\x1b[36m";
const COLOR_GREEN = "\x1b[32m";
const COLOR_YELLOW = "\x1b[33m";
const COLOR_RED = "\x1b[31m";
const COLOR_BOLD = "\x1b[1m";
const COLOR_RESET = "\x1b[0m";

function logHeader(step: number, total: number, title: string) {
  console.log(`\n${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
  console.log(`${COLOR_CYAN}${COLOR_BOLD} [${step}/${total}] ${title}${COLOR_RESET}`);
  console.log(`${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}\n`);
}

function runStep(command: string, args: string[], stepName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const proc = spawn(command, args, {
      stdio: "inherit",
      env: { ...process.env, FORCE_COLOR: "1" },
    });

    proc.on("close", (code) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      if (code === 0) {
        console.log(`\n${COLOR_GREEN}✓ ${stepName} passed in ${elapsed}s${COLOR_RESET}`);
        resolve();
      } else {
        console.error(`\n${COLOR_RED}✗ ${stepName} failed with exit code ${code} after ${elapsed}s${COLOR_RESET}`);
        reject(new Error(`${stepName} failed`));
      }
    });

    proc.on("error", (err) => {
      console.error(`\n${COLOR_RED}✗ ${stepName} process error: ${err.message}${COLOR_RESET}`);
      reject(err);
    });
  });
}

async function isServerReady(port = 3000): Promise<boolean> {
  try {
    const res = await fetch(`http://localhost:${port}/en`, { method: "HEAD", signal: AbortSignal.timeout(2000) });
    return res.status < 500;
  } catch {
    return false;
  }
}

async function ensureLocalServer(): Promise<ChildProcess | null> {
  if (await isServerReady(3000)) {
    console.log(`${COLOR_GREEN}ℹ Local server already listening on http://localhost:3000${COLOR_RESET}`);
    return null;
  }

  console.log(`${COLOR_YELLOW}⚡ Starting local dev server on http://localhost:3000...${COLOR_RESET}`);
  const serverProc = spawn("bun", ["run", "dev"], {
    stdio: "ignore",
    detached: false,
    env: { ...process.env, PORT: "3000" },
  });

  const maxWaitMs = 30000;
  const pollInterval = 500;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    if (await isServerReady(3000)) {
      console.log(`${COLOR_GREEN}✓ Local dev server is ready!${COLOR_RESET}\n`);
      return serverProc;
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  serverProc.kill("SIGTERM");
  throw new Error("Failed to start local dev server within 30 seconds.");
}

async function main() {
  const totalSteps = 6;
  const overallStart = Date.now();
  let spawnedServer: ChildProcess | null = null;

  console.log(`\n${COLOR_CYAN}${COLOR_BOLD}🚀 STARTING AUTOYJ LOCAL PRE-PUSH QUALITY GATE${COLOR_RESET}`);
  console.log(`${COLOR_YELLOW}Executing full 4-tier validation suite (Unit, Component, Integration, E2E, W3C, Lighthouse)...${COLOR_RESET}\n`);

  try {
    // 1. Lint & Static Check
    logHeader(1, totalSteps, "LINT & STATIC COMPATIBILITY CHECK");
    await runStep("bun", ["run", "check"], "Oxlint & Vinext Check");

    // 2. Database Schema Initialization
    logHeader(2, totalSteps, "CLOUDFLARE D1 DATABASE SCHEMA INIT");
    await runStep("bun", ["run", "db:local:init"], "D1 SQLite Local Init");

    // 3. Tier 1 - 3 Automated Tests (Unit, Component, Integration)
    logHeader(3, totalSteps, "TIER 1-3 AUTOMATED TEST SUITE (763+ TESTS)");
    await runStep("bun", ["test", "tests/unit", "tests/component", "tests/integration"], "Tier 1-3 Tests");

    // Ensure server is up for browser-based tests
    spawnedServer = await ensureLocalServer();

    // 4. W3C Standards & PWA Audit
    logHeader(4, totalSteps, "W3C STANDARDS & PWA COMPLIANCE AUDIT");
    await runStep("bun", ["run", "audit:w3c"], "W3C & PWA Audit");

    // 5. Tier 4 Playwright Full E2E User Journeys
    logHeader(5, totalSteps, "TIER 4 PLAYWRIGHT FULL E2E USER JOURNEYS (297 SCENARIOS)");
    await runStep("bun", ["run", "test:e2e"], "Playwright E2E Suite");

    // 6. Google Lighthouse 100/100 Audit
    logHeader(6, totalSteps, "GOOGLE LIGHTHOUSE 100/100 AUDIT");
    await runStep("bun", ["run", "audit:lighthouse"], "Lighthouse Audit");

    const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(1);
    console.log(`\n${COLOR_GREEN}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
    console.log(`${COLOR_GREEN}${COLOR_BOLD}🎉 ALL PRE-PUSH QUALITY GATES PASSED (100% GREEN) IN ${totalElapsed}s${COLOR_RESET}`);
    console.log(`${COLOR_GREEN}${COLOR_BOLD}Git push is approved. Zero regression risks detected.${COLOR_RESET}`);
    console.log(`${COLOR_GREEN}${COLOR_BOLD}======================================================================${COLOR_RESET}\n`);
  } catch (error: any) {
    const totalElapsed = ((Date.now() - overallStart) / 1000).toFixed(1);
    console.error(`\n${COLOR_RED}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
    console.error(`${COLOR_RED}${COLOR_BOLD}🚫 PRE-PUSH QUALITY GATE REJECTED (FAILED AFTER ${totalElapsed}s)${COLOR_RESET}`);
    console.error(`${COLOR_RED}${COLOR_BOLD}Reason: ${error?.message || error}${COLOR_RESET}`);
    console.error(`${COLOR_RED}${COLOR_BOLD}======================================================================${COLOR_RESET}\n`);
    process.exit(1);
  } finally {
    if (spawnedServer && !spawnedServer.killed) {
      spawnedServer.kill("SIGTERM");
    }
  }
}

void main();
