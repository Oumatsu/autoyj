#!/usr/bin/env bun
/**
 * check-coverage.ts
 * Reads coverage/coverage-summary.json or coverage/lcov.info produced by `bun test --coverage`
 * and enforces per-directory thresholds. Exit 1 if any threshold is missed.
 */
import { readFileSync, existsSync } from "node:fs";

const SUMMARY_PATH = "coverage/coverage-summary.json";
const LCOV_PATH = "coverage/lcov.info";

let summary: Record<string, { statements: { pct: number }; branches: { pct: number } }> = {};

if (existsSync(SUMMARY_PATH)) {
  summary = JSON.parse(readFileSync(SUMMARY_PATH, "utf8"));
} else if (existsSync(LCOV_PATH)) {
  const lcovText = readFileSync(LCOV_PATH, "utf8");
  const records = lcovText.split("end_of_record");
  for (const record of records) {
    const lines = record.trim().split("\n");
    let sf = "";
    let lf = 0;
    let lh = 0;
    let brf = 0;
    let brh = 0;
    for (const line of lines) {
      if (line.startsWith("SF:")) sf = line.slice(3).trim();
      else if (line.startsWith("LF:")) lf = parseInt(line.slice(3).trim(), 10) || 0;
      else if (line.startsWith("LH:")) lh = parseInt(line.slice(3).trim(), 10) || 0;
      else if (line.startsWith("BRF:")) brf = parseInt(line.slice(4).trim(), 10) || 0;
      else if (line.startsWith("BRH:")) brh = parseInt(line.slice(4).trim(), 10) || 0;
    }
    if (sf) {
      const stmtPct = lf > 0 ? (lh / lf) * 100 : 100;
      const branchPct = brf > 0 ? (brh / brf) * 100 : stmtPct;
      summary[sf] = {
        statements: { pct: stmtPct },
        branches: { pct: branchPct },
      };
    }
  }
} else {
  console.error("❌  Neither coverage/coverage-summary.json nor coverage/lcov.info found. Run: bun run test:coverage");
  process.exit(1);
}

const thresholds: Array<{ prefix: string; statements: number; branches: number }> = [
  { prefix: "lib/", statements: 85, branches: 80 },
  { prefix: "server/api/", statements: 80, branches: 75 },
  { prefix: "server/inquiries/", statements: 90, branches: 85 },
];

let failed = false;

for (const { prefix, statements: stmtMin, branches: branchMin } of thresholds) {
  const matching = Object.entries(summary)
    .filter(([path]) => path.includes(prefix) && path !== "total");

  for (const [path, metrics] of matching) {
    const stmtPct = metrics?.statements?.pct ?? 0;
    const branchPct = metrics?.branches?.pct ?? 0;
    if (stmtPct < stmtMin) {
      console.error(`❌  ${path}: statements ${stmtPct.toFixed(1)}% < required ${stmtMin}%`);
      failed = true;
    }
    if (branchPct < branchMin) {
      console.error(`❌  ${path}: branches ${branchPct.toFixed(1)}% < required ${branchMin}%`);
      failed = true;
    }
  }
}

if (failed) {
  console.error("\nCoverage thresholds not met. Add tests before deploying.");
  process.exit(1);
} else {
  console.log("✅  All coverage thresholds met.");
}
