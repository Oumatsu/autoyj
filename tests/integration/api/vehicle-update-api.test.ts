import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

function makeDb() {
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql, bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/FROM\s+vehicles/i.test(sql)) {
            return { id: "V-001", vehicle_id: "V-001", brand: "BYD", model: "Seal" } as T;
          }
          if (/JOIN\s+account/i.test(sql) || /FROM\s+user/i.test(sql)) {
            return { id: "CUS-001", role: "customer", account_type: "external",
              customer_id: "CUS-001", name: "VIP", email: "customer@example.com",
              price_tier: "vip", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) { return stmts.map(() => ({ success: true })); },
  };
  return { PORTAL_DB: db, DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as Env;
}

describe("PATCH /api/portal/vehicles/:id", () => {
  test("customer role cannot update a vehicle (403)", async () => {
    const env = makeDb();
    const loginRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "customer" }),
      }), env,
    );
    const token = (loginRes.headers.get("set-cookie") ?? "").match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] ?? "";
    expect(token.length).toBeGreaterThan(0);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/vehicles/V-001", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ exwUsd: 99999 }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });
});
