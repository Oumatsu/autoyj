import { expect, test } from "bun:test";

test("inquiry request storage is created by a versioned D1 migration before deployment", async () => {
  const migration = await Bun.file("migrations/0001_inquiry_requests.sql").text();
  const packageJson = await Bun.file("package.json").json() as { scripts: Record<string, string> };

  expect(migration).toContain("CREATE TABLE IF NOT EXISTS inquiry_requests");
  expect(packageJson.scripts["db:local:init"]).toContain("d1 migrations apply");
  expect(packageJson.scripts["db:migrate:remote"]).toContain("scripts/d1/apply-remote-migrations.mjs");
  expect(packageJson.scripts.deploy).toContain("db:migrate:remote");
});

test("local D1 snapshot sync uses Bun to invoke Wrangler on Windows", async () => {
  const syncScript = await Bun.file("scripts/d1/sync-local.mjs").text();
  const normalizedSyncScript = syncScript.replaceAll("\r\n", "\n");
  const packageJson = await Bun.file("package.json").json() as { scripts: Record<string, string> };
  expect(normalizedSyncScript).toContain('process.platform === "win32" ? "bun"');
  expect(normalizedSyncScript).toContain('["x", "wrangler", ...args]');
  expect(normalizedSyncScript).toContain('"--output",\n    backupPath,\n    "--persist-to",\n    persistTo');
  expect(normalizedSyncScript).toContain('|| ".wrangler/local-d1"');
  expect(packageJson.scripts["db:local:init"]).toContain(".wrangler/local-d1");
});

test("Wrangler pins the account that owns the configured portal D1 database", async () => {
  const wranglerConfig = await Bun.file("wrangler.jsonc").text();
  const migrationScript = await Bun.file("scripts/d1/apply-remote-migrations.mjs").text();
  expect(wranglerConfig).toContain('"account_id": "f236185f93c49e07d4a6d364cf82c165"');
  expect(migrationScript).toContain("CLOUDFLARE_ACCOUNT_ID: config.account_id");
  expect(migrationScript).toContain('"d1", "migrations", "apply", "autoyj-portal", "--remote"');
});
