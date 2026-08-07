import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const database = process.env.PORTAL_DB_NAME || "autoyj-portal";
const persistTo = process.env.MINIFLARE_PERSIST_PATH || ".wrangler/state";
const wrangler = process.env.WRANGLER_BIN || path.join(
  root,
  "node_modules",
  ".bin",
  process.platform === "win32" ? "wrangler.cmd" : "wrangler",
);
const schemaPath = path.join(root, "server", "db", "schema.sql");
const tempDir = mkdtempSync(path.join(os.tmpdir(), "autoyj-d1-sync-"));
const dumpPath = path.join(tempDir, "remote-snapshot.sql");
const backupPath = path.join(tempDir, "local-backup.sql");

function runWrangler(args) {
  execFileSync(wrangler, args, {
    cwd: root,
    stdio: "inherit",
  });
}

function tableNamesFromSql(sql) {
  return [...sql.matchAll(
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:"([^"]+)"|`([^`]+)`|([A-Za-z_][\w]*))/gi,
  )].map((match) => match[1] || match[2] || match[3]);
}

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

function dropLocalTables(tableNames) {
  const statements = [
    "PRAGMA foreign_keys=OFF;",
    ...[...new Set(tableNames)].reverse().map((table) => `DROP TABLE IF EXISTS ${quoteIdentifier(table)};`),
    "PRAGMA foreign_keys=ON;",
  ];
  runWrangler([
    "d1",
    "execute",
    database,
    "--local",
    "--persist-to",
    persistTo,
    "--command",
    statements.join("\n"),
    "--yes",
  ]);
}

try {
  console.log(`[d1:local] Initializing the persisted Miniflare schema for ${database}...`);
  runWrangler([
    "d1",
    "execute",
    database,
    "--local",
    "--persist-to",
    persistTo,
    "--file",
    schemaPath,
    "--yes",
  ]);

  console.log(`[d1:local] Exporting the schema and data from the remote ${database} database...`);
  runWrangler([
    "d1",
    "export",
    database,
    "--remote",
    "--output",
    dumpPath,
    "--skip-confirmation",
  ]);

  console.log("[d1:local] Backing up the current local Miniflare snapshot...");
  runWrangler([
    "d1",
    "export",
    database,
    "--local",
    "--output",
    backupPath,
    "--skip-confirmation",
  ]);

  const remoteTables = tableNamesFromSql(readFileSync(dumpPath, "utf8"));
  const backupTables = tableNamesFromSql(readFileSync(backupPath, "utf8"));
  if (remoteTables.length === 0) {
    throw new Error("The remote D1 export did not contain any CREATE TABLE statements.");
  }

  console.log(`[d1:local] Replacing ${remoteTables.length} local tables with the remote snapshot...`);
  // Keep local-only tables such as public_contact_submissions; replace every
  // table present in the remote export so schema drift cannot block imports.
  try {
    dropLocalTables(remoteTables);
    runWrangler([
      "d1",
      "execute",
      database,
      "--local",
      "--persist-to",
      persistTo,
      "--file",
      dumpPath,
      "--yes",
    ]);
  } catch (error) {
    console.error("[d1:local] Remote snapshot import failed; restoring the local backup...");
    dropLocalTables([...remoteTables, ...backupTables]);
    runWrangler([
      "d1",
      "execute",
      database,
      "--local",
      "--persist-to",
      persistTo,
      "--file",
      backupPath,
      "--yes",
    ]);
    throw error;
  }
  console.log("[d1:local] Local Miniflare D1 is synchronized with remote D1.");
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
