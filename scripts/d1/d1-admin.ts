import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { fail, getLocalD1Path } from "./local-d1";

const REPO_ROOT = resolve(import.meta.dir, "../..");
const WRANGLER_CONFIG_PATH = resolve(REPO_ROOT, "wrangler.jsonc");
const D1_DATABASE_NAME = "autoyj-portal";
const EXPORT_DIRECTORY = resolve(REPO_ROOT, "tmp/d1");
const BUNX_BINARY = process.platform === "win32" ? "bunx.cmd" : "bunx";

function getTokenOnlyEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.CLOUDFLARE_API_KEY;
  delete env.CLOUDFLARE_EMAIL;
  return env;
}

type Scope = "local" | "remote";

function printUsage(): void {
  console.log(
    [
      "🛠️ AutoYJ D1 Database Administration Suite",
      "",
      "Usage:",
      "  bun scripts/d1/d1-admin.ts export <local|remote> [--output ./tmp/d1/file.sql]",
      "  bun scripts/d1/d1-admin.ts import <local|remote> --file ./tmp/d1/file.sql",
      "  bun scripts/d1/d1-admin.ts import remote --file ./tmp/d1/file.sql --allow-remote-write",
      "  bun scripts/d1/d1-admin.ts pull-remote [--output ./tmp/d1/remote.sql]",
      "",
      "Examples:",
      "  bun run db:export:remote",
      "  bun run db:import:local -- --file ./tmp/d1/remote-latest.sql",
      "  bun run db:pull:remote",
    ].join("\n")
  );
}

function getScopeFlag(scope: Scope): `--${Scope}` {
  return scope === "local" ? "--local" : "--remote";
}

function getFlagValue(args: string[], flag: string): string | null {
  const index = args.indexOf(flag);
  if (index === -1) return null;
  return args[index + 1] ?? null;
}

function timestamp(): string {
  return new Date().toISOString().replaceAll(":", "-");
}

function getDefaultExportPath(scope: Scope): string {
  mkdirSync(EXPORT_DIRECTORY, { recursive: true });
  return resolve(EXPORT_DIRECTORY, `${scope}-${timestamp()}.sql`);
}

function runWrangler(args: string[]): void {
  const result = spawnSync(BUNX_BINARY, ["wrangler", ...args], {
    cwd: REPO_ROOT,
    stdio: "inherit",
    env: getTokenOnlyEnv(),
  });

  if (result.error) {
    throw new Error(`Failed to start Wrangler: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(`Wrangler exited with status ${result.status ?? 1}`);
  }
}

export function exportDatabase(scope: Scope, outputPath?: string): string {
  const resolvedOutput = resolve(outputPath ?? getDefaultExportPath(scope));
  mkdirSync(resolve(resolvedOutput, ".."), { recursive: true });

  runWrangler([
    "d1",
    "export",
    D1_DATABASE_NAME,
    getScopeFlag(scope),
    "--config",
    WRANGLER_CONFIG_PATH,
    "--output",
    resolvedOutput,
    "--skip-confirmation",
  ]);

  console.log(`✅ Exported ${scope} D1 to ${resolvedOutput}`);
  return resolvedOutput;
}

export function importDatabase(scope: Scope, filePath: string): void {
  const resolvedFile = resolve(filePath);
  if (!existsSync(resolvedFile)) {
    fail(`Import file does not exist: ${resolvedFile}`);
  }

  if (scope === "remote" && !process.argv.includes("--allow-remote-write")) {
    fail(
      "Remote import is gated. Re-run with --allow-remote-write if you really want to overwrite remote D1."
    );
  }

  if (scope === "local") {
    // Ensure Wrangler creates/initializes the active local D1 sqlite first.
    runWrangler([
      "d1",
      "execute",
      D1_DATABASE_NAME,
      getScopeFlag(scope),
      "--config",
      WRANGLER_CONFIG_PATH,
      "--command",
      "SELECT 1;",
      "--yes",
    ]);

    const localDbPath = getLocalD1Path();
    const sqlPayload = `PRAGMA foreign_keys=OFF;\n${readFileSync(resolvedFile, "utf8")}\nPRAGMA foreign_keys=ON;\n`;
    const sqliteResult = spawnSync("sqlite3", [localDbPath], {
      input: sqlPayload,
      encoding: "utf8",
    });

    if (sqliteResult.error) {
      throw new Error(`Failed to run sqlite3 import: ${sqliteResult.error.message}`);
    }

    if (sqliteResult.status !== 0) {
      throw new Error(
        `sqlite3 local import failed (${sqliteResult.status ?? 1}): ${
          sqliteResult.stderr?.trim() || "unknown error"
        }`
      );
    }

    console.log(`✅ Imported SQL into local D1 SQLite: ${localDbPath}`);
    return;
  }

  runWrangler([
    "d1",
    "execute",
    D1_DATABASE_NAME,
    getScopeFlag(scope),
    "--config",
    WRANGLER_CONFIG_PATH,
    "--file",
    resolvedFile,
    "--yes",
  ]);
  console.log(`✅ Imported SQL into remote D1: ${resolvedFile}`);
}

export function pullRemote(outputPath?: string): string {
  const tempDir = mkdtempSync(resolve(tmpdir(), "autoyj-d1-pull-"));
  const tempExportPath = resolve(tempDir, `remote-${timestamp()}.sql`);
  const finalExportPath = outputPath ? resolve(outputPath) : getDefaultExportPath("remote");

  try {
    exportDatabase("remote", tempExportPath);
    copyFileSync(tempExportPath, finalExportPath);
    console.log(`📦 Stored remote snapshot at ${finalExportPath}`);

    importDatabase("local", tempExportPath);
    console.log("🚀 Pulled remote D1 snapshot into local D1 environment successfully.");
    return finalExportPath;
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
}

export function main(args = process.argv.slice(2)): void {
  const [command, scopeArg] = args;

  if (!command || args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  if (command === "pull-remote") {
    pullRemote(getFlagValue(args, "--output") ?? undefined);
    return;
  }

  const scope = scopeArg as Scope;
  if (scope !== "local" && scope !== "remote") {
    fail(`Invalid scope '${scopeArg}'. Expected 'local' or 'remote'.`);
  }

  if (command === "export") {
    exportDatabase(scope, getFlagValue(args, "--output") ?? undefined);
    return;
  }

  if (command === "import") {
    const file = getFlagValue(args, "--file");
    if (!file) {
      fail("Missing required flag --file <path>");
    }
    importDatabase(scope, file);
    return;
  }

  fail(`Unknown command '${command}'.`);
}

if (import.meta.main) {
  main();
}
