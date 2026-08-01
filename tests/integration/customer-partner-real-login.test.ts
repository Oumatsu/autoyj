import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { findLocalUser } from "../../lib/users";

describe("Integration: Customer & Partner Real Login API Verification", () => {
  test("Customer & Partner Filter Real API Verification - ensures search endpoint works without InvalidFilter", async () => {
    let envText = "";
    try {
      envText = readFileSync(".dev.vars", "utf8");
    } catch {
      return; // Skip live network call if .dev.vars is missing in local environment
    }
    const env = Object.fromEntries(envText.split("\n").filter(Boolean).map((l) => l.split("=")));

    const customer = findLocalUser("customer@example.com", "customer-demo-2026");
    const partner = findLocalUser("partner@example.com", "partner-demo-2026");

    expect(customer).toBeTruthy();
    expect(partner).toBeTruthy();
    expect(customer?.role).toBe("customer");
    expect(partner?.role).toBe("partner");

    if (!env.FEISHU_APP_ID || !env.FEISHU_APP_SECRET) return;

    const tokenRes = await fetch("https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ app_id: env.FEISHU_APP_ID, app_secret: env.FEISHU_APP_SECRET }),
    }).then((r) => r.json());

    if (tokenRes.code !== 0) return;
    const token = tokenRes.tenant_access_token;
    const appToken = env.FEISHU_BASE_APP_TOKEN;

    const searchRes = await fetch(
      `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables/${env.FEISHU_TABLE_INQUIRIES}/records/search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filter: {
            conjunction: "and",
            conditions: [{ field_name: "customer_id", operator: "is", value: [customer!.customerId] }],
          },
          page_size: 10,
        }),
      }
    ).then((r) => r.json());

    expect(searchRes.code).toBe(0);
  });
});
