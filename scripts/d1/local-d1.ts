import { Database } from "bun:sqlite";
import { existsSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

export const LOCAL_D1_DIRECTORY = resolve(
  import.meta.dir,
  "../../.wrangler/state/v3/d1/miniflare-D1DatabaseObject"
);

export function fail(message: string): never {
  console.error(message);
  process.exit(1);
}

export function getLocalD1Path(): string {
  if (!existsSync(LOCAL_D1_DIRECTORY)) {
    fail(
      [
        "Local D1 state directory was not found.",
        "Run `bun run db:local:init` first to initialize local D1 state.",
      ].join(" ")
    );
  }

  const sqliteFiles = readdirSync(LOCAL_D1_DIRECTORY)
    .filter((entry) => entry.endsWith(".sqlite") && entry !== "metadata.sqlite")
    .map((entry) => ({
      entry,
      path: resolve(LOCAL_D1_DIRECTORY, entry),
      mtimeMs: statSync(resolve(LOCAL_D1_DIRECTORY, entry)).mtimeMs,
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs);

  const latest = sqliteFiles[0];
  if (!latest) {
    fail(
      [
        "No local D1 SQLite file was found.",
        'Run `bun run db:local:init` first.',
      ].join(" ")
    );
  }

  return latest.path;
}

export function printUsage() {
  console.log(
    [
      "Usage:",
      "  bun scripts/d1/local-d1.ts --path",
      "  bun scripts/d1/local-d1.ts --tables",
      '  bun scripts/d1/local-d1.ts --sql "SELECT count(*) FROM portal_inquiries;"',
    ].join("\n")
  );
}

export function main(args = process.argv.slice(2)): void {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    return;
  }

  const dbPath = getLocalD1Path();

  if (args.includes("--path")) {
    console.log(dbPath);
    return;
  }

  const db = new Database(dbPath, { readonly: true });

  if (args.includes("--tables")) {
    const tables = db
      .query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
      .all() as Array<{ name: string }>;
    console.log("Local D1 Tables:\n" + tables.map((t) => ` - ${t.name}`).join("\n"));
    return;
  }

  const sqlIndex = args.indexOf("--sql");
  if (sqlIndex !== -1 && args[sqlIndex + 1]) {
    const sql = args[sqlIndex + 1];
    const rows = db.query(sql).all();
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  printUsage();
}

if (import.meta.main) {
  main();
}
