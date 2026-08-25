import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const config = JSON.parse(readFileSync(new URL("../../wrangler.jsonc", import.meta.url), "utf8"));

if (!config.account_id || !config.d1_databases?.some((database) => database.binding === "PORTAL_DB" && database.database_name === "autoyj-portal")) {
  throw new Error("wrangler.jsonc must identify the target account and PORTAL_DB before remote migrations can run.");
}

execFileSync(process.platform === "win32" ? "bun.exe" : "bun", [
  "x", "wrangler", "d1", "migrations", "apply", "autoyj-portal", "--remote", "--config", "wrangler.jsonc",
], {
  cwd: process.cwd(),
  env: { ...process.env, CLOUDFLARE_ACCOUNT_ID: config.account_id },
  stdio: "inherit",
});
