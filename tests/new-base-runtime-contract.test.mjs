import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("Worker reads the new snake_case Base schema without legacy field fallbacks", async () => {
  const source = await readFile(new URL("worker/portal.ts", root), "utf8");
  for (const legacyField of [
    "Model ID", "Product Path", "Inventory Status", "Trim Config ID", "Trim Name",
    "Access Code", "User ID", "Account ID", "Inquiry No", "Quote No", "Order No",
    "Created At", "Guide Price Min USD Auto",
  ]) {
    const escaped = legacyField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.doesNotMatch(source, new RegExp(`fields\\[\\"${escaped}\\"\\]`));
  }
  for (const newField of [
    "model_id", "product_path", "inventory_status", "trim_config_id", "variant",
    "access_code", "user_id", "account_id", "inquiry_no", "quote_no", "order_no",
    "created_at", "guide_price_min_usd_auto",
  ]) {
    assert.match(source, new RegExp(`fields\\.${newField}|fields\\[\\"${newField}\\"\\]`));
  }
});

test("dynamic translations resolve i18n_locale and lower-case language fields", async () => {
  const source = await readFile(new URL("worker/portal.ts", root), "utf8");
  assert.match(source, /resolveTableIdByName\(env, "i18n_locale"\)/);
  assert.match(source, /item\.fields\.key/);
  assert.match(source, /item\.fields\.en/);
  assert.match(source, /item\.fields\.zh/);
  assert.match(source, /item\.fields\.am/);
  assert.doesNotMatch(source, /item\.fields\.(?:Key|EN|ZH|AM)/);
});

test("vehicles are mapped from vehicle sources table", async () => {
  const source = await readFile(new URL("worker/portal.ts", root), "utf8");
  assert.match(source, /mapVehicleSource/);
  assert.doesNotMatch(source, /requireEnv\(env, "FEISHU_TABLE_VEHICLES"\)/);
  assert.doesNotMatch(source, /fields\["Is Listed"\]/);
});

test("both Worker deployments point at the new Base and new table IDs", async () => {
  const [primary, secondary] = await Promise.all([
    readFile(new URL("wrangler.jsonc", root), "utf8"),
    readFile(new URL("wrangler.duoduo.jsonc", root), "utf8"),
  ]);
  const expected = {
    FEISHU_BASE_APP_TOKEN: "Is6Xb3btbazhFhsDXgFcqFG1nRc",
    FEISHU_TABLE_INTERNAL_USERS: "tblzuCupuStUvBwM",
    FEISHU_TABLE_VEHICLE_MODELS: "tblxVNjP9dnJ7b3o",
    FEISHU_TABLE_VEHICLES: "tbl6wBgVcvrXN6mz",
    FEISHU_TABLE_INQUIRIES: "tblEL6AHiMiWhkVj",
    FEISHU_TABLE_QUOTES: "tblIY4WdBVqvkZf0",
    FEISHU_TABLE_NEGOTIATIONS: "tblRytSu0oKOmmol",
    FEISHU_TABLE_ORDERS: "tblFxuRqSt2oAu0H",
    FEISHU_TABLE_ARTICLES: "tblYIGaUMC5yX5sj",
    FEISHU_TABLE_ACADEMY_LESSONS: "tbl4wwtdHP8sLUsO",
    FEISHU_TABLE_ACADEMY_VAULT: "tblnMopstEUqjMhu",
    FEISHU_TABLE_I18N: "tblv6UYxgYKSd8y5",
    FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS: "tbl8YzkZkMxvHRoT",
  };
  for (const config of [primary, secondary]) {
    for (const [key, value] of Object.entries(expected)) {
      assert.match(config, new RegExp(`"${key}"\\s*:\\s*"${value}"`));
    }
    assert.doesNotMatch(config, /FEISHU_TABLE_VEHICLE_MODEL_SPECS/);
  }
});

test("production builds do not require Feishu credentials", async () => {
  const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
  assert.equal(pkg.scripts.build, "vinext build");
  assert.equal(pkg.scripts["sync:i18n"], "node scripts/sync-i18n.mjs");
});

test("catalog and detail prices prefer company display prices", async () => {
  const source = await readFile(new URL("worker/portal.ts", root), "utf8");
  assert.match(source, /fields\.display_price_low/);
  assert.match(source, /fields\.display_price_high/);
  assert.match(source, /if \(displayPrice\) return displayPrice/);
});
