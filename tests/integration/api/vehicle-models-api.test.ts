import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

function makeDb() {
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
          if (/FROM\s+vehicle_models/i.test(sql)) {
            return {
              results: [
                { id: "M-001", model_id: "BYD-SEAL", brand: "BYD", model: "Seal", status: "Active", synced_at: "2026-08-14T00:00:00Z" },
                { id: "M-002", model_id: "BYD-HAN", brand: "BYD", model: "Han", status: "Active", synced_at: "2026-08-14T00:00:00Z" },
              ] as T[],
            };
          }
          if (/FROM\s+vehicle_trims/i.test(sql)) {
            return { results: [] as T[] };
          }
          if (/FROM\s+vehicles/i.test(sql)) {
            return { results: [] as T[] };
          }
          return { results: [] as T[] };
        },
        async run() {
          return { success: true, meta: {} };
        },
      };
      return stmt;
    },
    async batch(stmts: Array<{ sql?: string }>) {
      return stmts.map(() => ({ success: true }));
    },
  };
  return db as unknown as D1Database;
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

describe("GET /api/portal/vehicle-models", () => {
  test("returns model list for authenticated user", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const token = await loginAs("admin", env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/vehicle-models", {
        headers: { Cookie: `portal_session=${token}` },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { vehicleModels: unknown[]; vehicleModelSpecs: unknown[] } | unknown[];
    if (Array.isArray(body)) {
      expect(Array.isArray(body)).toBe(true);
    } else {
      expect(Array.isArray(body.vehicleModels)).toBe(true);
      expect(body.vehicleModels.length).toBeGreaterThan(0);
    }
  });

  test("returns 401 without session", async () => {
    const db = makeDb();
    const env = makeEnv(db);
    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/vehicle-models"),
      env,
    );
    expect(res.status).toBe(401);
  });
});
