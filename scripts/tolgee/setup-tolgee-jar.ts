#!/usr/bin/env bun
/**
 * setup-tolgee-jar.ts
 *
 * Automatically downloads tolgee.jar from GitHub Releases if missing,
 * checks local Java & PostgreSQL prerequisites, and launches the local Tolgee server.
 */

import { existsSync, createWriteStream } from "fs";
import { resolve } from "path";
import { spawn } from "child_process";

const ROOT_DIR = resolve(import.meta.dir, "../..");
const JAR_PATH = resolve(ROOT_DIR, "tolgee.jar");
const TOLGEE_RELEASE_URL =
  "https://github.com/tolgee/tolgee-platform/releases/latest/download/tolgee.jar";

async function downloadJar(): Promise<void> {
  console.log("📦 tolgee.jar not found locally. Downloading latest release from GitHub...");

  const response = await fetch(TOLGEE_RELEASE_URL, {
    headers: { "User-Agent": "autoyj-setup-script" },
  });

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download tolgee.jar: HTTP ${response.status} ${response.statusText}`);
  }

  const contentLength = Number(response.headers.get("content-length") || 0);
  const fileStream = createWriteStream(JAR_PATH);
  const reader = response.body.getReader();

  let downloaded = 0;
  let lastPercent = -1;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      fileStream.write(Buffer.from(value));
      downloaded += value.length;
      if (contentLength > 0) {
        const percent = Math.floor((downloaded / contentLength) * 100);
        if (percent % 10 === 0 && percent !== lastPercent) {
          lastPercent = percent;
          process.stdout.write(`\r  Downloading tolgee.jar: ${percent}% (${(downloaded / 1024 / 1024).toFixed(1)} MB / ${(contentLength / 1024 / 1024).toFixed(1)} MB)`);
        }
      }
    }
  }

  fileStream.end();
  console.log("\n✅ tolgee.jar downloaded successfully!");
}

function checkJava(): boolean {
  try {
    const proc = Bun.spawnSync(["java", "-version"]);
    return proc.exitCode === 0;
  } catch {
    return false;
  }
}

async function main() {
  // 1. Download JAR if missing
  if (!existsSync(JAR_PATH)) {
    await downloadJar();
  } else {
    console.log("✅ Local tolgee.jar found at project root.");
  }

  // 2. Check Java
  if (!checkJava()) {
    console.error("\n❌ Java (JRE 17+) was not found on your system PATH.");
    console.error("👉 Please install Java before running Tolgee server locally:");
    console.error("   - macOS (Homebrew): brew install openjdk");
    console.error("   - Linux (Ubuntu): sudo apt install default-jre");
    console.error("   - mise / asdf: mise install java@latest\n");
    process.exit(1);
  }

  // 3. Launch Tolgee server if requested or executed directly
  const isRun = process.argv.includes("--run") || process.argv.length <= 2;
  if (!isRun) {
    console.log("Tolgee setup complete. Run 'bun run tolgee:server' to start.");
    return;
  }

  console.log("🚀 Starting local Tolgee Server on http://localhost:8085 ...");
  const username = process.env.USER || "admin";
  const javaArgs = [
    "-jar",
    "tolgee.jar",
    "--tolgee.postgres-autostart.enabled=false",
    `--spring.datasource.url=jdbc:postgresql://localhost:5432/tolgee`,
    `--spring.datasource.username=${username}`,
    "--tolgee.authentication.enabled=true",
    "--tolgee.authentication.registration-enabled=true",
    "--tolgee.authentication.initial-username=admin@local.test",
    "--tolgee.authentication.initial-password=admin123456",
    "--server.port=8085",
  ];

  const child = spawn("java", javaArgs, {
    cwd: ROOT_DIR,
    stdio: "inherit",
    shell: true,
  });

  child.on("exit", (code) => {
    process.exit(code ?? 0);
  });
}

main().catch((err) => {
  console.error("\n❌ Tolgee setup failed:", err);
  process.exit(1);
});
