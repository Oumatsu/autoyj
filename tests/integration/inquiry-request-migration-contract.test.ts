import { expect, test } from "bun:test";

test("inquiry request storage is created by a versioned D1 migration before deployment", async () => {
  const migration = await Bun.file("migrations/0001_inquiry_requests.sql").text();
  const packageJson = await Bun.file("package.json").json() as { scripts: Record<string, string> };

  expect(migration).toContain("CREATE TABLE IF NOT EXISTS inquiry_requests");
  expect(packageJson.scripts["db:local:init"]).toContain("d1 migrations apply");
  expect(packageJson.scripts.deploy).toContain("db:migrate:remote");
});

test("local D1 snapshot sync uses Bun to invoke Wrangler on Windows", async () => {
  const syncScript = await Bun.file("scripts/d1/sync-local.mjs").text();
  const packageJson = await Bun.file("package.json").json() as { scripts: Record<string, string> };
  expect(syncScript).toContain('process.platform === "win32" ? "bun"');
  expect(syncScript).toContain('["x", "wrangler", ...args]');
  expect(syncScript).toContain('"--output",\n    backupPath,\n    "--persist-to",\n    persistTo');
  expect(syncScript).toContain('|| ".wrangler/local-d1"');
  expect(packageJson.scripts["db:local:init"]).toContain(".wrangler/local-d1");
});

test("Wrangler pins the account that owns the configured portal D1 database", async () => {
  const wranglerConfig = await Bun.file("wrangler.jsonc").text();
  expect(wranglerConfig).toContain('"account_id": "f236185f93c49e07d4a6d364cf82c165"');
});
