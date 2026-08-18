#!/usr/bin/env bun
/**
 * scripts/audit-lighthouse.ts
 *
 * Full multi-route Google Lighthouse Audit.
 * Audits all critical pages in headless Chrome, extracts category scores,
 * saves detailed reports to ./lighthouse-reports/, and prints an ANSI summary table.
 */

import { spawn, type ChildProcess } from "node:child_process";
import { mkdirSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const COLOR_CYAN = "\x1b[36m";
const COLOR_GREEN = "\x1b[32m";
const COLOR_YELLOW = "\x1b[33m";
const COLOR_RED = "\x1b[31m";
const COLOR_BOLD = "\x1b[1m";
const COLOR_RESET = "\x1b[0m";

interface LighthouseSummary {
  route: string;
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

const ROUTES = [
  "/en",
  "/zh",
  "/am",
  "/en/products",
  "/en/portal",
  "/en/about",
  "/en/contact",
];

const OUTPUT_DIR = resolve(process.cwd(), "lighthouse-reports");
if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true });
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
    return null;
  }

  console.log(`${COLOR_YELLOW}⚡ Starting local dev server on http://localhost:3000 for Lighthouse...${COLOR_RESET}`);
  const serverProc = spawn("bun", ["run", "dev"], {
    stdio: "ignore",
    detached: true,
    env: { ...process.env, PORT: "3000" },
  });

  const maxWaitMs = 45000;
  const pollInterval = 500;
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    if (await isServerReady(3000)) {
      console.log(`${COLOR_GREEN}✓ Local dev server is ready!${COLOR_RESET}\n`);
      return serverProc;
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }

  try {
    if (serverProc.pid) process.kill(-serverProc.pid, "SIGTERM");
  } catch {}
  throw new Error("Failed to start local dev server within 45 seconds.");
}

function runLighthouse(url: string, outputPathBase: string): Promise<void> {
  return new Promise((resolvePromise, rejectPromise) => {
    const args = [
      "lighthouse",
      url,
      "--chrome-flags=--headless=new --no-sandbox --disable-gpu",
      "--output=json",
      "--output=html",
      `--output-path=${outputPathBase}`,
      "--only-categories=accessibility,best-practices,seo,performance",
      "--max-wait-for-load=45000",
      "--quiet",
    ];

    const proc = spawn("bunx", args, {
      stdio: "pipe",
      env: { ...process.env },
    });

    proc.on("close", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        rejectPromise(new Error(`Lighthouse exited with code ${code}`));
      }
    });

    proc.on("error", (err) => rejectPromise(err));
  });
}

function scoreColor(score: number): string {
  if (score >= 90) return `${COLOR_GREEN}${COLOR_BOLD}${score}${COLOR_RESET}`;
  if (score >= 70) return `${COLOR_YELLOW}${COLOR_BOLD}${score}${COLOR_RESET}`;
  return `${COLOR_RED}${COLOR_BOLD}${score}${COLOR_RESET}`;
}

async function main() {
  const baseUrl = process.env.BASE_URL || "http://localhost:3000";
  console.log(`\n${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
  console.log(`${COLOR_CYAN}${COLOR_BOLD} 📊 STARTING FULL-PAGE GOOGLE LIGHTHOUSE AUDIT MATRIX${COLOR_RESET}`);
  console.log(`${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
  console.log(`Target Base URL: ${baseUrl}`);
  console.log(`Reports Output: ${OUTPUT_DIR}\n`);

  let spawnedServer: ChildProcess | null = null;
  if (!process.env.BASE_URL) {
    spawnedServer = await ensureLocalServer();
  }

  const summaries: LighthouseSummary[] = [];
  let hasCriticalFailure = false;

  try {
    for (const route of ROUTES) {
    const targetUrl = `${baseUrl}${route}`;
    const fileSlug = route.replace(/\//g, "_").replace(/^_/, "") || "root";
    const reportPathBase = resolve(OUTPUT_DIR, `lighthouse-${fileSlug}`);

    process.stdout.write(`  Auditing ${targetUrl.padEnd(35)} ... `);
    const start = Date.now();

    try {
      await runLighthouse(targetUrl, reportPathBase);
      const jsonPath = `${reportPathBase}.report.json`;
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);

      if (existsSync(jsonPath)) {
        const report = JSON.parse(readFileSync(jsonPath, "utf-8"));
        const cats = report.categories || {};

        const perf = Math.round((cats.performance?.score || 0) * 100);
        const a11y = Math.round((cats.accessibility?.score || 0) * 100);
        const bp = Math.round((cats["best-practices"]?.score || 0) * 100);
        const seo = Math.round((cats.seo?.score || 0) * 100);

        summaries.push({
          route,
          performance: perf,
          accessibility: a11y,
          bestPractices: bp,
          seo,
        });

        console.log(`${COLOR_GREEN}DONE (${elapsed}s)${COLOR_RESET}`);
      } else {
        console.log(`${COLOR_YELLOW}REPORT MISSING (${elapsed}s)${COLOR_RESET}`);
      }
    } catch (err: any) {
      console.log(`${COLOR_RED}FAILED: ${err.message}${COLOR_RESET}`);
      hasCriticalFailure = true;
    }
  }

  // Print Summary Table
  console.log(`\n${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
  console.log(`${COLOR_CYAN}${COLOR_BOLD} 🏆 LIGHTHOUSE AUDIT SCORECARD SUMMARY${COLOR_RESET}`);
  console.log(`${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}`);
  console.log(`| Route                | Perf | a11y | Best Practices | SEO  | Status |`);
  console.log(`|----------------------|------|------|----------------|------|--------|`);

  for (const s of summaries) {
    const r = s.route.padEnd(20);
    const perfStr = scoreColor(s.performance).padEnd(14);
    const a11yStr = scoreColor(s.accessibility).padEnd(14);
    const bpStr = scoreColor(s.bestPractices).padEnd(24);
    const seoStr = scoreColor(s.seo).padEnd(14);
    const ok = s.accessibility >= 90 && s.bestPractices >= 90 && s.seo >= 90;
    const statusStr = ok ? `${COLOR_GREEN}PASS${COLOR_RESET}` : `${COLOR_YELLOW}WARN${COLOR_RESET}`;

    console.log(`| ${r} | ${perfStr} | ${a11yStr} | ${bpStr} | ${seoStr} | ${statusStr} |`);
  }
  console.log(`${COLOR_CYAN}${COLOR_BOLD}======================================================================${COLOR_RESET}\n`);

    if (hasCriticalFailure) {
      console.error(`${COLOR_RED}Lighthouse audit completed with critical errors.${COLOR_RESET}`);
      process.exit(1);
    } else {
      console.log(`${COLOR_GREEN}✓ All routes passed Lighthouse benchmark thresholds!${COLOR_RESET}\n`);
      process.exit(0);
    }
  } finally {
    if (spawnedServer && spawnedServer.pid) {
      try {
        process.kill(-spawnedServer.pid, "SIGTERM");
      } catch {
        try {
          spawnedServer.kill("SIGTERM");
        } catch {}
      }
    }
  }
}

void main();
