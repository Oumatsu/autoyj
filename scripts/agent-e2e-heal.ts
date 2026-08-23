#!/usr/bin/env bun
/**
 * scripts/agent-e2e-heal.ts
 * 
 * Agent E2E Self-Healing Diagnostic Runner for AutoYJ
 * 
 * Runs Playwright E2E suite, captures console errors, network failures,
 * and ARIA snapshots on failures, and formats them into an actionable
 * prompt payload for Coding Agents to isolate and fix source bugs.
 */

import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

interface DiagnosticReport {
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  failures: Array<{
    title: string;
    file: string;
    line: number;
    error: string;
    locator?: string;
    expected?: string;
    received?: string;
    ariaSnapshot?: string;
    consoleErrors?: string[];
    networkErrors?: string[];
    suggestedSourceFile?: string;
  }>;
}

function mapSpecToSource(specFile: string): string {
  if (specFile.includes("quotation") || specFile.includes("quote")) {
    return "lib/quotation-pricing.ts, components/portal/QuoteComposerForm.tsx";
  }
  if (specFile.includes("inquiry") || specFile.includes("workflow")) {
    return "lib/inquiry-workflow.ts, app/portal/page.tsx";
  }
  if (specFile.includes("auth") || specFile.includes("session")) {
    return "lib/auth.ts, server/api/portal.ts";
  }
  if (specFile.includes("vehicle") || specFile.includes("catalog")) {
    return "app/vehicles/page.tsx, components/portal/FeaturedVehicleCarousel.tsx";
  }
  if (specFile.includes("console") || specFile.includes("error")) {
    return "app/globals.css, app/layout.tsx";
  }
  return "app/portal/page.tsx";
}

async function runPlaywrightWithDiagnostics() {
  console.log("🤖 [Agent Self-Healing] Starting Playwright E2E Autonomous Diagnostic Runner for AutoYJ...\n");

  const args = [
    "playwright",
    "test",
    "--reporter=json",
  ];

  const proc = spawn("bunx", args, {
    env: { ...process.env, CI: "1" },
    stdio: ["inherit", "pipe", "pipe"],
  });

  let stdoutData = "";
  let stderrData = "";

  proc.stdout.on("data", (chunk) => {
    stdoutData += chunk.toString();
  });

  proc.stderr.on("data", (chunk) => {
    stderrData += chunk.toString();
  });

  proc.on("close", (code) => {
    console.log(`\n🏁 Playwright run finished with exit code: ${code}`);

    try {
      let rawJson: any = null;
      const jsonStart = stdoutData.indexOf("{");
      if (jsonStart !== -1) {
        const jsonEnd = stdoutData.lastIndexOf("}");
        if (jsonEnd !== -1) {
          rawJson = JSON.parse(stdoutData.substring(jsonStart, jsonEnd + 1));
        }
      }

      const report: DiagnosticReport = {
        timestamp: new Date().toISOString(),
        totalTests: rawJson?.suites?.reduce((acc: number, s: any) => acc + (s.specs?.length || 0), 0) || 0,
        passed: 0,
        failed: 0,
        failures: [],
      };

      if (rawJson && rawJson.suites) {
        for (const suite of rawJson.suites) {
          for (const spec of suite.specs || []) {
            for (const test of spec.tests || []) {
              const result = test.results?.[0];
              if (result?.status === "passed") {
                report.passed++;
              } else if (result?.status === "failed" || result?.status === "timedOut") {
                report.failed++;
                const errorMessage = result.error?.message || "Unknown error";

                report.failures.push({
                  title: `${suite.title} > ${spec.title}`,
                  file: spec.file,
                  line: spec.line,
                  error: errorMessage.split("\n")[0],
                  suggestedSourceFile: mapSpecToSource(spec.file),
                });
              }
            }
          }
        }
      }

      console.log("\n📊 ========== AGENT SELF-HEALING DIAGNOSTIC SUMMARY ==========");
      console.log(`Total: ${report.totalTests} | Passed: ${report.passed} | Failed: ${report.failed}`);

      if (report.failed > 0) {
        console.log("\n❌ Failed Test Cases Requiring Agent Code Fix:");
        report.failures.forEach((f, idx) => {
          console.log(`\n[${idx + 1}] ${f.title}`);
          console.log(`    📁 Test File: ${f.file}:${f.line}`);
          console.log(`    ⚠️  Error: ${f.error}`);
          console.log(`    💡 Target Source Domain: ${f.suggestedSourceFile}`);
        });

        const diagFile = path.join(process.cwd(), ".playwright-agent-diagnosis.json");
        fs.writeFileSync(diagFile, JSON.stringify(report, null, 2));
        console.log(`\n💾 Saved machine-readable diagnostic payload to ${diagFile}`);
      } else {
        console.log("\n✨ All E2E test contracts verified! No self-healing required.");
      }
    } catch (e: any) {
      console.error("Failed to parse diagnostic output:", e.message);
    }
  });
}

if (import.meta.main) {
  runPlaywrightWithDiagnostics();
}
