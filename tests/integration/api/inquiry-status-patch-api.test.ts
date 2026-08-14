import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

// Minimal fakeD1 that supports inquiry lookup and write operations
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
  target_price: 25000, initial_note: "Test inquiry", vehicle_snapshot_json: "{}",
  is_public: 0, status: "New Inquiry", source: "Customer Portal",
  deleted_at: null, created_at: "2026-08-14T00:00:00.000Z", updated_at: "2026-08-14T00:00:00.000Z",
};

describe("PATCH /api/portal/inquiries/:id/status", () => {
  test("returns 400 for illegal status transition (New Inquiry → Accepted)", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ status: "Accepted", reason: "skipping steps" }),
      }),
      env,
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { error?: string };
    expect(body.error).toMatch(/transition|invalid|not allowed/i);
  });

  test("returns 403 when customer role tries to change status", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ status: "Quoted", reason: "customer trying to self-quote" }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });

  test("returns 200 and writes status history for valid transition (New Inquiry → Quoted)", async () => {
    const db = makeDb(OPEN_INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ status: "Quoted", reason: "quote sent" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const historyWrite = db.written.some(({ sql }) => /inquiry_status_history/i.test(sql));
    expect(historyWrite).toBe(true);
  });
});
