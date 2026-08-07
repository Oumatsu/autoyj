import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

const root = new URL("../../", import.meta.url);

describe("Integration: Worker API Contracts & Feishu Base Schema Rules", () => {
  test("Worker reads the new snake_case Base schema without legacy field fallbacks", async () => {
    const source = await readFile(new URL("server/api/portal.ts", root), "utf8");
    for (const legacyField of [
      "Model ID",
      "Product Path",
      "Inventory Status",
      "Trim Config ID",
      "Trim Name",
      "Access Code",
      "User ID",
      "Account ID",
      "Inquiry No",
      "Quote No",
      "Order No",
      "Created At",
      "Guide Price Min USD Auto",
    ]) {
      const escaped = legacyField.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      expect(source).not.toMatch(new RegExp(`fields\\[\\"${escaped}\\"\\]`));
    }
    for (const newField of [
      "model_id",
      "product_path",
      "inventory_status",
      "trim_config_id",
      "variant",
      "user_id",
      "account_id",
      "inquiry_no",
      "quote_no",
      "order_no",
      "created_at",
      "guide_price_min_usd_auto",
    ]) {
      expect(source).toMatch(new RegExp(`fields\\.${newField}|fields\\[\\"${newField}\\"\\]`));
    }
    expect(source).toMatch(/JOIN account/);
    expect(source).toMatch(/account\.password/);
    expect(source).not.toMatch(/access_code|password_hash/);
  });

  test("translations rely exclusively on static local dictionaries with zero runtime endpoint dependencies", async () => {
    const source = await readFile(new URL("i18n/useTranslation.ts", root), "utf8");
    expect(source).toMatch(/staticTranslations/);
    expect(source).not.toMatch(/fetch\(\"\/api\/portal\/public\/translations\"\)/);
  });

  test("vehicles are mapped from vehicle sources table", async () => {
    const source = await readFile(new URL("server/api/portal.ts", root), "utf8");
    expect(source).toMatch(/mapVehicleSource/);
    expect(source).not.toMatch(/requireEnv\(env, "FEISHU_TABLE_VEHICLES"\)/);
    expect(source).not.toMatch(/fields\["Is Listed"\]/);
  });

  test("Worker deployment points at the new Base and new table IDs", async () => {
    const primary = await readFile(new URL("wrangler.jsonc", root), "utf8");
    const expected = {
      FEISHU_BASE_APP_TOKEN: "Is6Xb3btbazhFhsDXgFcqFG1nRc",
      FEISHU_TABLE_INTERNAL_USERS: "tblzuCupuStUvBwM",
      FEISHU_TABLE_VEHICLE_MODELS: "tblxVNjP9dnJ7b3o",
      FEISHU_TABLE_VEHICLES: "tblte61W3fKoXmSw",
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
    for (const [key, value] of Object.entries(expected)) {
      expect(primary).toMatch(new RegExp(`"${key}"\\s*:\\s*"${value}"`));
    }
    expect(primary).not.toMatch(/FEISHU_TABLE_VEHICLE_MODEL_SPECS/);
  });

  test("production builds do not require Feishu credentials", async () => {
    const pkg = JSON.parse(await readFile(new URL("package.json", root), "utf8"));
    expect(pkg.scripts.build).toBe("vinext build");
  });

  test("catalog and detail prices prefer company display prices", async () => {
    const source = await readFile(new URL("server/api/portal.ts", root), "utf8");
    expect(source).toMatch(/fields\.display_price_low/);
    expect(source).toMatch(/fields\.display_price_high/);
    expect(source).toMatch(/if \(displayPrice\) return displayPrice/);
  });
});
