import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";

function makeEnv() {
  const db = {
    prepare(sql: string) {
      const stmt = {
        sql, bound: [] as unknown[],
        bind(...v: unknown[]) { this.bound = v; return this; },
        async first<T>() {
          if (/JOIN\s+account/i.test(sql) || /FROM\s+user/i.test(sql)) {
            return { id: "USR-ADMIN-01", role: "admin", account_type: "internal",
              customer_id: "USR-ADMIN-01", name: "Admin", email: "admin@local.test",
              price_tier: "internal", status: "Active" } as T;
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
  return { PORTAL_DB: db, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as Env;
}

describe("DELETE /api/portal/session", () => {
  test("DELETE /api/portal/session clears session cookie", async () => {
    const env = makeEnv();

    const loginRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "admin" }),
      }), env,
    );
    const setCookieHeader = loginRes.headers.get("set-cookie") ?? "";
    const token = setCookieHeader.match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] ?? "";
    expect(token.length).toBeGreaterThan(0);

    const logoutRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/session", {
        method: "DELETE",
        headers: { Cookie: `portal_session=${token}` },
      }), env,
    );
    expect(logoutRes.status).toBe(200);
    const logoutCookie = logoutRes.headers.get("set-cookie") ?? "";
    expect(logoutCookie).toContain("Max-Age=0");

    const sessionRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/session", {
        headers: { Cookie: "portal_session=" },
      }), env,
    );
    expect(sessionRes.status).toBe(200);
    const sessionBody = await sessionRes.json() as { user: unknown };
    expect(sessionBody.user).toBeNull();

    const bootstrapRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/bootstrap", {
        headers: { Cookie: "portal_session=" },
      }), env,
    );
    expect(bootstrapRes.status).toBe(401);
  });
});
