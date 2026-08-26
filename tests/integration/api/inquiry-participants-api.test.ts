import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

const INQUIRY = {
  id: "inq-1", inquiry_no: "INQ-SHARED-001", customer_id: "CUS-CREATOR", creator_user_id: "CUS-CREATOR",
  vehicle_id: "V-001", vehicle_model: "BYD Seal", title: "Shared procurement", quantity: 2,
  destination_port: "Djibouti", trade_term: "FOB", target_price: null, initial_note: "",
  vehicle_snapshot_json: "{}", is_public: 0, status: "open", source: "Customer Portal",
  deleted_at: null, created_at: "2026-08-26T00:00:00.000Z", updated_at: "2026-08-26T00:00:00.000Z",
};

function makeDb() {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql,
        bound: [] as unknown[],
        bind(...values: unknown[]) { this.bound = values; return this; },
        async first<T>() {
          if (/FROM\s+inquiries/i.test(sql)) return INQUIRY as T;
          if (/SELECT\s+user_id,\s*access_source\s+FROM\s+inquiry_participants/i.test(sql)) {
            return {
              user_id: this.bound[1] === "CUS-CREATOR" ? "CUS-CREATOR" : "CUS-ADDED",
              access_source: this.bound[1] === "CUS-CREATOR" ? "Creator" : "Added by staff",
            } as T;
          }
          if (/FROM\s+portal_users/i.test(sql)) return {
            user_id: "CUS-ADDED", customer_id: "CUS-ADDED", name: "Added Customer", email: "added@example.test",
            company: "Added Motors", role: "customer", status: "Active",
          } as T;
          if (/FROM\s+inquiry_participants/i.test(sql)) return null;
          return null;
        },
        async all<T>() {
          if (/FROM\s+inquiries\s+i/i.test(sql)) {
            if (/EXISTS\s*\(\s*SELECT\s+1\s+FROM\s+inquiry_participants/i.test(sql)) return { results: [INQUIRY] as T[] };
            return { results: [] as T[] };
          }
          if (/FROM\s+inquiry_participants/i.test(sql)) return { results: [] as T[] };
          if (/FROM\s+portal_users/i.test(sql)) return { results: [] as T[] };
          return { results: [] as T[] };
        },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string; bound?: unknown[] }>) {
      for (const stmt of stmts) if (stmt?.sql) written.push({ sql: stmt.sql, values: stmt.bound ?? [] });
      return stmts.map(() => ({ success: true }));
    },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function makeEnv(db: D1Database) {
  return { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as Env;
}

async function loginAs(role: "admin" | "sales" | "sourcing" | "partner" | "customer", env: ReturnType<typeof makeEnv>) {
  const response = await handlePortalRequest(new Request("http://localhost/api/portal/dev-session", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }),
  }), env);
  const cookie = response.headers.get("set-cookie") ?? "";
  return decodeURIComponent(cookie.match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] ?? "");
}

describe("inquiry participant management", () => {
  test("sales can add an active customer to one inquiry topic", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants", {
      method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` }, body: JSON.stringify({ userId: "CUS-ADDED" }),
    }), env);

    expect(response.status).toBe(201);
    const body = await response.json() as { participant: { userId: string; role: string } };
    expect(body.participant).toEqual(expect.objectContaining({ userId: "CUS-ADDED", role: "customer" }));
    expect(db.written.some(({ sql, values }) => /INSERT INTO inquiry_participants/i.test(sql) && values.includes("CUS-ADDED") && values.includes("Added by staff"))).toBe(true);
  });

  test("admin can add an active customer to one inquiry topic", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants", {
      method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` }, body: JSON.stringify({ userId: "CUS-ADDED" }),
    }), env);

    expect(response.status).toBe(201);
  });

  test("sales can remove an invited participant from one inquiry topic", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("sales", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants/CUS-ADDED", {
      method: "DELETE", headers: { Cookie: `portal_session=${token}` },
    }), env);

    expect(response.status).toBe(204);
    expect(db.written.some(({ sql, values }) => /DELETE FROM inquiry_participants/i.test(sql) && values.includes("INQ-SHARED-001") && values.includes("CUS-ADDED"))).toBe(true);
  });

  test("admin cannot remove the inquiry creator through participant management", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants/CUS-CREATOR", {
      method: "DELETE", headers: { Cookie: `portal_session=${token}` },
    }), env);

    expect(response.status).toBe(409);
    expect(db.written.some(({ sql }) => /DELETE FROM inquiry_participants/i.test(sql))).toBe(false);
  });

  test("customer cannot add a participant", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants", {
      method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` }, body: JSON.stringify({ userId: "CUS-ADDED" }),
    }), env);

    expect(response.status).toBe(403);
    expect(db.written.some(({ sql }) => /INSERT INTO inquiry_participants/i.test(sql))).toBe(false);
  });

  test("customer cannot remove a participant", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants/CUS-ADDED", {
      method: "DELETE", headers: { Cookie: `portal_session=${token}` },
    }), env);

    expect(response.status).toBe(403);
    expect(db.written.some(({ sql }) => /DELETE FROM inquiry_participants/i.test(sql))).toBe(false);
  });

  test("an unsupported staff role cannot establish a participant-management session", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("sourcing", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiries/INQ-SHARED-001/participants", {
      method: "POST", headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` }, body: JSON.stringify({ userId: "CUS-ADDED" }),
    }), env);

    expect(response.status).toBe(401);
  });

  test("a topic participant receives the shared topic through bootstrap while unrelated users stay excluded", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);
    const response = await handlePortalRequest(new Request("http://localhost/api/portal/bootstrap", {
      headers: { Cookie: `portal_session=${token}` },
    }), env);

    expect(response.status).toBe(200);
    const body = await response.json() as { inquiries: Array<{ inquiryNo: string }> };
    expect(body.inquiries).toEqual([expect.objectContaining({ inquiryNo: "INQ-SHARED-001" })]);
  });
});
