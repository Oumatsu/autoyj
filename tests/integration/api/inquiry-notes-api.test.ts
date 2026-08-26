import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

const INQUIRY = {
  id: "inq-1",
  inquiry_no: "INQ-2026-001",
  customer_id: "CUS-002",
  creator_user_id: "CUS-002",
  vehicle_id: "V-001",
  vehicle_model: "BYD Seal",
  title: "Test Inquiry",
  quantity: 5,
  destination_port: "Djibouti",
  trade_term: "FOB",
  target_price: 25000,
  initial_note: "Test note",
  vehicle_snapshot_json: "{}",
  is_public: 1,
  status: "New Inquiry",
  source: "Customer Portal",
  deleted_at: null,
  created_at: "2026-08-14T00:00:00.000Z",
  updated_at: "2026-08-14T00:00:00.000Z",
};

const PARENT_NOTE = {
  id: "note-1",
  note_id: "NOTE-001",
  inquiry_no: "INQ-2026-001",
  parent_note_id: null,
  author_user_id: "USR-SALES-01",
  author_name: "Sales Lead",
  author_role: "sales",
  body: "Initial internal note",
  is_public: 0,
  created_at: "2026-08-14T00:00:00.000Z",
  deleted_at: null,
};

function makeDb(
  role: "sales" | "customer",
  inquiryData: Record<string, unknown> | null = INQUIRY,
  parentNoteData: Record<string, unknown> | null = null
) {
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
          if (/FROM\s+inquiries/i.test(sql)) return inquiryData as T;
          if (/FROM\s+inquiry_notes/i.test(sql)) return parentNoteData as T;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            if (role === "sales") {
              return {
                id: "USR-SALES-01",
                role: "sales",
                account_type: "internal",
                customer_id: "USR-SALES-01",
                name: "Sales Lead",
                email: "sales@local.test",
                price_tier: "internal",
                status: "Active",
              } as T;
            }
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
          if (/FROM\s+inquiries/i.test(sql)) {
            const visibleToSession = role === "sales" || inquiryData?.creator_user_id === "CUS-002";
            return { results: inquiryData && visibleToSession ? [inquiryData as T] : [] };
          }
          if (/FROM\s+inquiry_notes/i.test(sql)) {
            return { results: parentNoteData ? [parentNoteData as T] : [] };
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

async function loginAs(role: "sales" | "customer", env: ReturnType<typeof makeEnv>) {
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

describe("POST /api/portal/inquiries/:id/notes", () => {
  test("sales can post an internal (non-public) note", async () => {
    const db = makeDb("sales", INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "Internal cost breakdown", isPublic: false }),
      }),
      env,
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { ok: boolean; note: { noteId: string; body: string; isPublic: boolean } };
    expect(body.ok).toBe(true);
    expect(body.note.body).toBe("Internal cost breakdown");
    expect(body.note.isPublic).toBe(false);

    const noteWrite = db.written.some(({ sql }) => /INSERT INTO inquiry_notes/i.test(sql));
    expect(noteWrite).toBe(true);
  });

  test("customer cannot post on an inquiry they do not own (returns 404)", async () => {
    const unownedInquiry = { ...INQUIRY, customer_id: "CUS-999", creator_user_id: "CUS-999" };
    const db = makeDb("customer", unownedInquiry);
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "Unauthorized note", isPublic: true }),
      }),
      env,
    );
    expect(res.status).toBe(404);
    const body = await res.json() as { error?: string };
    expect(body.error).toBe("Inquiry not found");
  });

  test("returns 404 when parentNoteId does not exist", async () => {
    const db = makeDb("sales", INQUIRY, null); // no parent note
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "Follow-up note", parentNoteId: "NOTE-NONEXISTENT" }),
      }),
      env,
    );
    expect(res.status).toBe(404);
    const body = await res.json() as { error?: string };
    expect(body.error).toBe("Parent follow-up not found");
  });

  test("allows posting a note with a valid parentNoteId", async () => {
    const db = makeDb("sales", INQUIRY, PARENT_NOTE);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "Valid follow-up reply", parentNoteId: "NOTE-001" }),
      }),
      env,
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { ok: boolean; note: { parentNoteId: string } };
    expect(body.ok).toBe(true);
    expect(body.note.parentNoteId).toBe("NOTE-001");
  });

  test("returns 400 when note body is empty or whitespace", async () => {
    const db = makeDb("sales", INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "   " }),
      }),
      env,
    );
    expect(res.status).toBe(400);
    const body = await res.json() as { error?: string };
    expect(body.error).toBe("Note is required");
  });

  test("customer can post a note on an inquiry they own", async () => {
    const db = makeDb("customer", INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("customer", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "Customer follow-up note" }),
      }),
      env,
    );
    expect(res.status).toBe(201);
    const body = await res.json() as { ok: boolean; note: { authorRole: string } };
    expect(body.ok).toBe(true);
    expect(body.note.authorRole).toBe("customer");
  });

  test("returns 403 when note publishing violates visibility rules (isPublic: true)", async () => {
    const db = makeDb("sales", INQUIRY);
    const env = makeEnv(db);
    const token = await loginAs("sales", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` },
        body: JSON.stringify({ body: "Unauthorized public note", isPublic: true }),
      }),
      env,
    );
    expect(res.status).toBe(403);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe("Public follow-ups require public inquiry content");
  });

  test("asserts note visibility behavior when isPublic: false (internal note) is published vs visible", async () => {
    const db = makeDb("sales", INQUIRY);
    const env = makeEnv(db);
    const salesToken = await loginAs("sales", env);

    // 1. Sales publishes internal note with isPublic: false
    const pubRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${salesToken}` },
        body: JSON.stringify({ body: "Confidential internal note", isPublic: false }),
      }),
      env,
    );
    expect(pubRes.status).toBe(201);
    const pubBody = (await pubRes.json()) as { ok: boolean; note: { isPublic: boolean; body: string } };
    expect(pubBody.ok).toBe(true);
    expect(pubBody.note.isPublic).toBe(false);
    expect(pubBody.note.body).toBe("Confidential internal note");

    // Verify DB insert recorded is_public = 0
    const insertedNote = db.written.find(({ sql }) => /INSERT INTO inquiry_notes/i.test(sql));
    expect(insertedNote).toBeDefined();
    expect(insertedNote?.values).toContain(0);

    // 2. Owner customer can post internal note on owned inquiry
    const ownerDb = makeDb("customer", INQUIRY);
    const ownerEnv = makeEnv(ownerDb);
    const ownerToken = await loginAs("customer", ownerEnv);

    const ownerRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${ownerToken}` },
        body: JSON.stringify({ body: "Customer note", isPublic: false }),
      }),
      ownerEnv,
    );
    expect(ownerRes.status).toBe(201);
    const ownerBody = (await ownerRes.json()) as { ok: boolean; note: { isPublic: boolean } };
    expect(ownerBody.note.isPublic).toBe(false);

    // 3. Unowned customer gets 404 when trying to post note on inquiry they don't own
    const unownedInquiry = { ...INQUIRY, customer_id: "CUS-999", creator_user_id: "CUS-999" };
    const unownedDb = makeDb("customer", unownedInquiry);
    const unownedEnv = makeEnv(unownedDb);
    const unownedToken = await loginAs("customer", unownedEnv);

    const unownedRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-001/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Cookie: `portal_session=${unownedToken}` },
        body: JSON.stringify({ body: "Forbidden attempt", isPublic: false }),
      }),
      unownedEnv,
    );
    expect(unownedRes.status).toBe(404);
  });
});
