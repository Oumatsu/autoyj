import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { findLocalUser } from "../lib/users.ts";

test("Customer & Partner Filter Real API Verification - ensures search endpoint works without InvalidFilter", async () => {
  const envText = readFileSync(".dev.vars", "utf8");
  const env = Object.fromEntries(envText.split("\n").filter(Boolean).map(l => l.split("=")));

  const customer = findLocalUser("customer@example.com", "customer-demo-2026");
  const partner = findLocalUser("partner@example.com", "partner-demo-2026");

  assert.ok(customer, "Customer account exists in local store");
  assert.ok(partner, "Partner account exists in local store");
  assert.equal(customer.role, "customer");
  assert.equal(partner.role, "partner");

  // Fetch tenant access token to test real Feishu Bitable Search API
  const tokenRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET })
  }).then(r => r.json());

  assert.equal(tokenRes.code, 0, "Obtained Feishu access token");
  const token = tokenRes.tenant_access_token;
  const appToken = env.FEISHU_BASE_APP_TOKEN;

  // Perform search with customer_id filter on inquiries table
  const searchRes = await fetch(`https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${env.FEISHU_TABLE_INQUIRIES}/records/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      filter: {
        conjunction: "and",
        conditions: [
          { field_name: "customer_id", operator: "is", value: [customer.customerId] }
        ]
      },
      page_size: 10
    })
  }).then(r => r.json());

  assert.equal(searchRes.code, 0, `Search records API succeeded for customer (${searchRes.msg})`);
});
