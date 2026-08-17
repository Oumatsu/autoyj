import { expect, test } from "bun:test";
import { handlePortalRequest } from "../../server/api/portal";
import type { PortalEnv } from "../../server/types";

function makeDb() {
  const written: Array<{ sql: string; values: unknown[] }> = [];
  return {
    prepare(sql: string) {
      return {
        sql,
        bound: [] as unknown[],
        bind(...values: unknown[]) { this.bound = values; return this; },
        async first<T>() {
          if (/FROM\s+inquiry_notes/i.test(sql)) return { note_id: "parent", inquiry_no: "INQ-1" } as T;
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) return { id: "USR-ADMIN-01", role: "admin", account_type: "internal", customer_id: "USR-ADMIN-01", name: "Admin", email: "admin@local.test", price_tier: "internal", status: "Active" } as T;
          return null;
        },
        async all<T>() {
          if (/SELECT\s+note_id,\s*parent_note_id\s+FROM\s+inquiry_notes/i.test(sql)) {
            return { results: [
              { note_id: "parent", parent_note_id: null },
              { note_id: "child", parent_note_id: "parent" },
              { note_id: "grandchild", parent_note_id: "child" },
              { note_id: "other", parent_note_id: null },
            ] as T[] };
          }
          return { results: [] as T[] };
        },
        async run() { written.push({ sql, values: this.bound }); return { success: true, meta: {} }; },
      };
    },
    written,
  } as unknown as D1Database & { written: typeof written };
}

async function adminSession(env: PortalEnv) {
  const login = await handlePortalRequest(new Request("http://localhost/api/portal/dev-session", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role: "admin" }) }), env);
  const cookie = login.headers.get("set-cookie") || "";
  return decodeURIComponent(cookie.match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] || "");
}

test("cascade comment closure writes the parent and all nested replies in one soft-delete", async () => {
  const db = makeDb();
  const env = { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as PortalEnv;
  const token = await adminSession(env);
  const response = await handlePortalRequest(new Request("http://localhost/api/portal/inquiry-content/note/parent", { method: "DELETE", headers: { "Content-Type": "application/json", Cookie: `portal_session=${token}` }, body: JSON.stringify({ mode: "cascade" }) }), env);

  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ mode: "cascade", closedNoteIds: ["parent", "child", "grandchild"] });
  const update = db.written.find((item) => /UPDATE\s+inquiry_notes\s+SET\s+deleted_at/i.test(item.sql));
  expect(update?.sql).toContain("note_id IN (?,?,?)");
  expect(update?.values).toContain("parent");
  expect(update?.values).toContain("child");
  expect(update?.values).toContain("grandchild");
});
