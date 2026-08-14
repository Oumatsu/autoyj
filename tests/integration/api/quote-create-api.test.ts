import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

function makeDb(inquiry: Record<string, unknown>) {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql,
        bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return inquiry as T;
          if (/FROM\s+quotes/i.test(sql)) return null;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return { id: "USR-SALES-01", role: "sales", account_type: "internal",
              customer_id: "USR-SALES-01", name: "Sales Lead", email: "sales@local.test",
              price_tier: "internal", status: "Active" } as T;
          }
          return null;
        },
        async all<T>() { return { results: [] as T[] }; },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string; bound?: unknown[] }>) {
      for (const s of stmts) {
        if (s && s.sql) {
          written.push({ sql: s.sql, values: s.bound ?? [] });
        }
      }
      return stmts.map(() => ({ success: true }));
    },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function makeEnv(db: D1Database) {
  return { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as Env;
}

async function loginAs(role: string, env: ReturnType<typeof makeEnv>) {
  const loginRes = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    }),
    env,
  );
  const setCookie = loginRes.headers.get("set-cookie") ?? "";
  const match = setCookie.match(/(?:portal_session|youguard_portal)=([^;]+)/);
  const token = match ? decodeURIComponent(match[1]) : "";
  return token;
}

const OPEN_INQUIRY = {
  id: "inq-1", inquiry_no: "INQ-2026-001", customer_id: "CUS-001",
  vehicle_id: "V-001", vehicle_model: "BYD Seal", title: "Test",
  quantity: 5, destination_port: "Djibouti", trade_term: "FOB",
  target_price: 25000, initial_note: "", vehicle_snapshot_json: "{}",
  is_public: 0, status: "New Inquiry", source: "Customer Portal",
  deleted_at: null, created_at: "2026-08-14T00:00:00.000Z", updated_at: "2026-08-14T00:00:00.000Z",
};

describe("POST /api/portal/quotes", () => {
  test("sales role creates quote and receives quoteNo", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ inquiryNo: "INQ-2026-001", unitPrice: 28000 }),
      }),
      env,
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { quoteNo: string; quantity: number; unitPrice: number };
    expect(typeof body.quoteNo).toBe("string");
    expect(body.quoteNo.length).toBeGreaterThan(0);
    expect(body.quantity).toBe(5);
    expect(body.unitPrice).toBe(28000);
    const quoteWrite = db.written.some(({ sql }) => /INSERT INTO quotes/i.test(sql));
    expect(quoteWrite).toBe(true);
  });

  test("customer role cannot create a quote (403)", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ inquiryNo: "INQ-2026-001", unitPrice: 28000 }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });

  test("missing inquiryNo returns 400", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ unitPrice: 28000 }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  test("zero or negative unit price returns 400", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ inquiryNo: "INQ-2026-001", unitPrice: 0 }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });
});
