import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("Integration: Feishu Base Tables - Profiles & Vehicles Verification", () => {
  test("Feishu Base Tables Verification - Profiles & Vehicles Integration", async () => {
    let envText = "";
    try {
      envText = readFileSync(".dev.vars", "utf8");
    } catch {
      return; // Skip live network call if .dev.vars is missing
    }
    const env = Object.fromEntries(envText.split("\n").filter(Boolean).map((l) => l.split("=")));

    if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET) return;

    const tokenRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
    }).then((r) => r.json());

    if (tokenRes.code !== 0) return;
    const token = tokenRes.tenant_access_token;
    const appToken = env.FEISHU_BASE_APP_TOKEN;

    const modelsRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${env.FEISHU_TABLE_VEHICLE_MODELS}/records/search`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ page_size: 10 }),
      }
    ).then((r) => r.json());

    expect(modelsRes.code).toBe(0);
    expect(Array.isArray(modelsRes.data.items)).toBe(true);

    const sourcesRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${env.FEISHU_TABLE_VEHICLES}/records/search`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ page_size: 10 }),
      }
    ).then((r) => r.json());

    expect(sourcesRes.code).toBe(0);
    expect(Array.isArray(sourcesRes.data.items)).toBe(true);
  });
});
