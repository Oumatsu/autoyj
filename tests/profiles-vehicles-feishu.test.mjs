import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

test("Feishu Base Tables Verification - Profiles & Vehicles Integration", async () => {
  const envText = readFileSync(".dev.vars", "utf8");
  const env = Object.fromEntries(envText.split("\n").filter(Boolean).map(l => l.split("=")));

  // Fetch token
  const tokenRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET })
  }).then(r => r.json());

  assert.equal(tokenRes.code, 0, "Obtained Feishu access token");
  const token = tokenRes.tenant_access_token;
  const appToken = env.FEISHU_BASE_APP_TOKEN;

  // Verify Vehicle Models (Profiles - tab=profiles)
  const modelsRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${env.FEISHU_TABLE_VEHICLE_MODELS}/records/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ page_size: 10 })
  }).then(r => r.json());

  assert.equal(modelsRes.code, 0, "Vehicle Models (tblxVNjP9dnJ7b3o) API succeeded");
  assert.ok(Array.isArray(modelsRes.data.items), "Vehicle Models returned items array");

  // Verify Vehicle Sources (Vehicles - tab=vehicles)
  const sourcesRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${env.FEISHU_TABLE_VEHICLES}/records/search`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ page_size: 10 })
  }).then(r => r.json());

  assert.equal(sourcesRes.code, 0, "Vehicle Sources (tbl6wBgVcvrXN6mz) API succeeded");
  assert.ok(Array.isArray(sourcesRes.data.items), "Vehicle Sources returned items array");
});
