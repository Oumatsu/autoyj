import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

const INQUIRY = {
  id: "inq-1",
  inquiry_no: "INQ-2026-001",
  customer_id: "CUS-002",
  vehicle_id: "V-001",
  vehicle_model: "BYD Seal",
  title: "Test",
  quantity: 5,
  destination_port: "Djibouti",
  trade_term: "FOB",
  target_price: 25000,
  initial_note: "",
  vehicle_snapshot_json: "{}",
  is_public: 0,
  status: "Quoted",
  source: "Customer Portal",
  deleted_at: null,
  created_at: "2026-08-14T00:00:00Z",
  updated_at: "2026-08-14T00:00:00Z",
};

const QUOTE = {
  id: "q-1",
  quote_no: "YG-2026-001",
  inquiry_no: "INQ-2026-001",
  customer_id: "CUS-002",
  vehicle_id: "V-001",
  price: 28000,
  unit_price: 28000,
  quantity: 5,
  currency: "USD",
  version: 1,
  status: "Pending",
  created_at: "2026-08-14T00:00:00Z",
};

function makeDb(inquiry = INQUIRY, quote = QUOTE) {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql,
        bound: [] as unknown[],
        bind(...v: unknown[]) {
          this.bound = v;
          return this;
        },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return inquiry as T;
          if (/FROM\s+quotes/i.test(sql)) return quote as T;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return {
              id: "CUS-002",
              role: "customer",
              account_type: "external",
              customer_id: "CUS-002",
              name: "VIP Customer",
              email: "customer@example.com",
              price_tier: "vip",
              status: "Active",
            } as T;
          }
          return null;
        },
        async all<T>() {
          return { results: [] as T[] };
        },
        async run() {
          written.push({ sql, values: this.bound });
          return { success: true, meta: {} };
        },
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

describe("POST /api/portal/quotes/:id/counter", () => {
  test("customer can submit counter-offer price", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes/YG-2026-001/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ counterPrice: 26000 }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean };
    expect(body.ok).toBe(true);

    const negotiationWrite = db.written.some(({ sql }) => /INSERT INTO negotiations/i.test(sql));
    expect(negotiationWrite).toBe(true);

    const statusUpdate = db.written.some(({ sql }) => /UPDATE quotes SET status=/i.test(sql));
    expect(statusUpdate).toBe(true);
  });

  test("returns 400 if counteroffer price and message are missing", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes/YG-2026-001/counter", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/portal/quotes/:id/accept", () => {
  test("customer accepting a quote writes a Draft order row", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/quotes/YG-2026-001/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(res.status).toBe(201);
    const body = (await res.json()) as { orderNo: string };
    expect(typeof body.orderNo).toBe("string");
    expect(body.orderNo.length).toBeGreaterThan(0);

    const orderWrite = db.written.some(({ sql }) => /orders/i.test(sql));
    expect(orderWrite).toBe(true);

    const quoteStatusUpdate = db.written.some(({ sql }) => /UPDATE quotes SET status=/i.test(sql));
    expect(quoteStatusUpdate).toBe(true);
  });
});
