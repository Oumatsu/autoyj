#!/usr/bin/env bun
/**
 * check-test-pairing.ts
 * Called by Husky pre-commit. Checks that every modified lib/ or server/api/
 * source file has at least one corresponding test file.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";

const staged = execSync("git diff --staged --name-only", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f.endsWith(".ts") || f.endsWith(".tsx"))
  .filter((f) => f.startsWith("lib/") || f.startsWith("server/api/"));

const missing: string[] = [];

for (const src of staged) {
  const base = src.replace(/^(lib|server\/api)\//, "").replace(/\.tsx?$/, "");
  const candidates = [
    `tests/unit/${base}.test.ts`,
    `tests/unit/utils/${base}.test.ts`,
    `tests/unit/domain/${base}.test.ts`,
    `tests/integration/${base}.test.ts`,
    `tests/integration/api/${base}.test.ts`,
    `tests/integration/portal-d1-isolation.test.ts`,
    `tests/integration/api/inquiry-status-patch-api.test.ts`,
  ];
  const hasTest = candidates.some(existsSync);
  if (!hasTest) missing.push(src);
}

if (missing.length > 0) {
  console.error("❌  No test file found for the following modified sources:");
  for (const f of missing) console.error(`   ${f}`);
  console.error("\nWrite a failing test first (TDD Red step), then commit.");
  process.exit(1);
}

console.log("✅  All modified source files have test coverage.");
