import { expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

function makeDb() {
  const writes: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      return {
        bound: [] as unknown[],
        bind(...values: unknown[]) { this.bound = values; return this; },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return { inquiry_no: "INQ-1", deleted_at: null } as T;
          if (/FROM\s+vehicles/i.test(sql)) return {
            id: "V-1", "品牌": "BYD", "型号": "Seal", "细分型号": "Premium", "外饰颜色": "Black",
            "partnerFOB美金报价（自动计算）": "23000", "customerFOB美金报价（自动计算）": "24000",
          } as T;
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { writes.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
    },
    writes,
  };
  return db as unknown as D1Database & { writes: typeof writes };
}

async function partnerToken(env: Env) {
  const login = await handlePortalRequest(new Request("http://localhost/api/portal/dev-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "partner" }) }), env);
  return decodeURIComponent((login.headers.get("set-cookie") || "").match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] || "");
}

test("creates an inquiry request from the Feishu-synced Chinese FOB columns", async () => {
  const db = makeDb();
  const env = { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as Env;
  const token = await partnerToken(env);
  const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-1/requests", {
    method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
    body: JSON.stringify({ vehicleId: "V-1", quantity: 2, contactName: "Partner", country: "Ethiopia", email: "partner@example.com" }),
  }), env);

  expect(response.status).toBe(201);
  const body = await response.json() as { request: { vehicleLabel: string } };
  expect(body.request.vehicleLabel).toBe("BYD Seal Premium Black");
  expect(db.writes.some(({ sql }) => /INSERT INTO inquiry_requests/i.test(sql))).toBe(true);
});
