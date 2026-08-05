import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../worker/portal";

const env = {
  DEV: true,
  PORTAL_SESSION_SECRET: "test-session-secret",
  FEISHU_APP_ID: "test-app-id",
  FEISHU_APP_SECRET: "test-app-secret",
  FEISHU_BASE_APP_TOKEN: "test-base-token",
  FEISHU_TABLE_VEHICLES: "source-table",
  FEISHU_TABLE_VEHICLE_MODELS: "model-table",
  FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS: "variant-table",
};

async function catalogForRole(role: "admin" | "partner" | "customer") {
  const loginResponse = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),
    env,
  );
  const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
  expect(cookie).toBeTruthy();

  const response = await handlePortalRequest(
    new Request("http://localhost/api/portal/catalog", { headers: { cookie: cookie! } }),
    env,
  );
  return response.json() as Promise<{ vehicles: Array<{ price: number | null; fobUsd?: number | null; exwUsd?: number | null; fcaUsd?: number | null; priceTermsList: Array<{ term: string; amount: number }> }> }>;
}

describe("Integration: Portal price terms by account role", () => {
  test("Partner and customer catalog prices expose only their automatic FOB price", async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (input) => {
      const url = String(input);
      if (url.endsWith("/auth/v3/tenant_access_token/internal")) {
        return Response.json({ code: 0, tenant_access_token: "test-token", expire: 7200 });
      }
      if (url.includes("/tables/source-table/records")) {
        return Response.json({
          code: 0,
          data: {
            items: [{
              record_id: "rec-price",
              fields: {
                "审核api用字段": "已接入网站",
                "品牌": "BYD",
                "型号": "Seal",
                "FOB美金价": 23000,
                "customerFOB美金报价（自动计算）": 24600,
                "EXW美金价": 22000,
                "FCA美金价": 22500,
                "partnerEXW美金报价（自动计算）": 22100,
                "partnerFCA美金报价（自动计算）": 22600,
                "customerEXW美金报价（自动计算）": 23205,
                "customerFCA美金报价（自动计算）": 23730,
              },
            }],
            has_more: false,
          },
        });
      }
      return Response.json({ code: 0, data: { items: [], has_more: false } });
    };

    try {
      const [adminCatalog, partnerCatalog, customerCatalog] = await Promise.all([
        catalogForRole("admin"),
        catalogForRole("partner"),
        catalogForRole("customer"),
      ]);

      expect(adminCatalog.vehicles[0]).toMatchObject({
        price: 23000,
        fobUsd: 23000,
        exwUsd: 22000,
        fcaUsd: 22500,
        priceTermsList: [
          { term: "FOB", amount: 23000 },
          { term: "EXW", amount: 22000 },
          { term: "FCA", amount: 22500 },
        ],
      });
      expect(partnerCatalog.vehicles[0]).toMatchObject({
        price: 24600,
        fobUsd: 24600,
        exwUsd: null,
        fcaUsd: null,
        priceTermsList: [{ term: "FOB", amount: 24600 }],
      });
      expect(customerCatalog.vehicles[0]).toMatchObject({
        price: 24600,
        fobUsd: 24600,
        exwUsd: null,
        fcaUsd: null,
        priceTermsList: [{ term: "FOB", amount: 24600 }],
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
