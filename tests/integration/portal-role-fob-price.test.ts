import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../server/api/portal";

function fakeD1() {
  const db = {
    prepare(sql: string) {
      const statement = {
        bind() {
          return statement;
        },
        async all<T>() {
          if (/FROM\s+vehicles/i.test(sql)) {
            return {
              results: [{
                id: "rec-price",
                brand: "BYD",
                model: "Seal",
                variant: "Performance",
                stage: "connected",
                display_price_low: 23000,
                customer_fob_usd: 24600,
                exw_usd: 22000,
                fca_usd: 22500,
                fob_usd: 23000,
                currency: "USD",
              }] as T[],
            };
          }
          return { results: [] as T[] };
        },
        async first<T>() {
          if (/JOIN\s+account/i.test(sql)) {
            return {
              id: "d1-user",
              user_id: "d1-user",
              customer_id: "d1-customer",
              name: "D1 User",
              email: "d1@example.com",
              account_type: "external",
              role: "customer",
              price_tier: "vip",
              status: "Active",
              password: "d1-secret",
            } as T;
          }
          return null;
        },
      };
      return statement;
    },
  };
  return db as unknown as D1Database;
}

const env = (db: D1Database) => ({
  PORTAL_DB: db,
  PORTAL_SESSION_SECRET: "test-session-secret-that-is-long-enough",
});

async function catalogForRole(role: "admin" | "partner" | "customer") {
  const db = fakeD1();
  const loginResponse = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST",
      body: JSON.stringify({ role }),
    }),
    env(db),
  );
  const cookie = loginResponse.headers.get("set-cookie")?.split(";")[0];
  expect(cookie).toBeTruthy();

  const response = await handlePortalRequest(
    new Request("http://localhost/api/portal/catalog", { headers: { cookie: cookie! } }),
    env(db),
  );
  return response.json() as Promise<{
    vehicles: Array<{
      price: number | null;
      fobUsd?: number | null;
      exwUsd?: number | null;
      fcaUsd?: number | null;
      priceTermsList: Array<{ term: string; amount: number }>;
    }>;
  }>;
}

describe("Integration: Portal price terms by account role", () => {
  test("D1 prices preserve role visibility: external accounts only see customer FOB", async () => {
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
  });
});
