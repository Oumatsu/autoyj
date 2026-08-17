import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

function makeDb() {
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
          if (/FROM\s+inquiry_notes/i.test(sql)) {
            return {
              id: "note-1",
              note_id: "note-1",
              inquiry_no: "INQ-2026-001",
              parent_note_id: "",
              author_user_id: "USR-ADMIN-01",
              author_name: "Admin",
              author_role: "admin",
              body: "A note",
              is_public: 1,
              created_at: "2026-08-14T00:00:00Z",
              deleted_at: sql.includes("deleted_at IS NOT NULL") ? "2026-08-14T01:00:00Z" : null,
            } as T;
          }
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return {
              id: "USR-ADMIN-01",
              role: "admin",
              account_type: "internal",
              customer_id: "USR-ADMIN-01",
              name: "Admin",
              email: "admin@local.test",
              price_tier: "internal",
              status: "Active",
            } as T;
          }
          return null;
        },
        async all<T>() {
          if (/FROM\s+inquiry_notes/i.test(sql) && /deleted_at\s+IS\s+NOT\s+NULL/i.test(sql)) {
            return {
              results: [{
                id: "note-1",
                note_id: "note-1",
                inquiry_no: "INQ-2026-001",
                parent_note_id: "",
                author_user_id: "USR-ADMIN-01",
                author_name: "Admin",
                author_role: "admin",
                body: "A note",
                is_public: 1,
                created_at: "2026-08-14T00:00:00Z",
                deleted_at: "2026-08-14T01:00:00Z",
                context_inquiry_no: "INQ-2026-001",
                context_vehicle_model: "BYD Dolphin",
                context_title: "Dolphin sourcing",
                context_quantity: 5,
                context_destination_port: "Djibouti",
                context_trade_term: "FOB",
                context_initial_note: "Need delivery confirmation",
                context_created_at: "2026-08-13T00:00:00Z",
                context_creator_name: "Aebissa G",
              } as T],
            };
          }
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
      for (const s of stmts) if (s?.sql) written.push({ sql: s.sql, values: s.bound ?? [] });
      return stmts.map(() => ({ success: true }));
    },
    written,
  };
  return db as unknown as D1Database & { written: typeof written };
}

function makeEnv(db: D1Database) {
  return { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as Env;
}

async function loginAs(role: "admin" | "customer", env: Env) {
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
  return match ? decodeURIComponent(match[1]) : "";
}

describe("DELETE /api/portal/inquiry-content/note/:id", () => {
  test("admin can soft-delete a note", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiry-content/note/note-1", {
        method: "DELETE",
        headers: { Cookie: `portal_session=${token}` },
        body: JSON.stringify({ reason: "Inappropriate content" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const softDelete = db.written.some(({ sql }) => /UPDATE\s+inquiry_notes\s+SET\s+deleted_at/i.test(sql));
    expect(softDelete).toBe(true);
  });

  test("customer cannot delete notes (403)", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiry-content/note/note-1", {
        method: "DELETE",
        headers: { Cookie: `portal_session=${token}` },
      }),
      env,
    );
    expect(res.status).toBe(403);
  });
});

describe("PATCH /api/portal/inquiry-content/note/:id", () => {
  test("admin can restore a deleted note", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiry-content/note/note-1", {
        method: "PATCH",
        headers: { Cookie: `portal_session=${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const restored = db.written.some(({ sql }) => /UPDATE\s+inquiry_notes\s+SET\s+deleted_at=NULL/i.test(sql));
    expect(restored).toBe(true);
  });

  test("admin can purge a deleted note", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiry-content/note/note-1", {
        method: "PATCH",
        headers: { Cookie: `portal_session=${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "purge" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const purged = db.written.some(({ sql }) => /DELETE\s+FROM\s+inquiry_notes/i.test(sql));
    expect(purged).toBe(true);
  });

  test("customer cannot moderate deleted notes (403)", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiry-content/note/note-1", {
        method: "PATCH",
        headers: { Cookie: `portal_session=${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore" }),
      }),
      env,
    );
    expect(res.status).toBe(403);
  });
});

describe("GET /api/portal/inquiry-content/deleted", () => {
  test("admin receives each deleted comment with its original inquiry context", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiry-content/deleted", {
        headers: { Cookie: `portal_session=${token}` },
      }),
      env,
    );

    expect(res.status).toBe(200);
    const payload = await res.json() as { notes: Array<{ inquiryNo: string; inquiry?: { inquiryNo: string; vehicleModel: string; creatorName: string; createdAt: string } }> };
    expect(payload.notes[0]).toMatchObject({
      inquiryNo: "INQ-2026-001",
      inquiry: {
        inquiryNo: "INQ-2026-001",
        vehicleModel: "BYD Dolphin",
        creatorName: "Aebissa G",
        createdAt: "2026-08-13T00:00:00Z",
      },
    });
    expect(JSON.stringify(payload.notes[0])).not.toContain("deletion_reason");
    expect(JSON.stringify(payload.notes[0])).not.toContain("deleted_by_name");
  });
});
