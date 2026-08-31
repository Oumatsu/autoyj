import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

describe("Admin Manual Feishu Sync API (/api/portal/admin/sync-d1)", () => {
  const env: Env = {
    PORTAL_DB: {
      prepare: () => ({
        bind: () => ({
          first: async () => ({ alive: 1 }),
          all: async () => ({ results: [] }),
          run: async () => ({ success: true }),
        }),
      }),
      batch: async () => [],
    } as any,
    PORTAL_SESSION_SECRET: "test_secret_admin_manual_sync",
    FEISHU_BASE_APP_TOKEN: "mock-token",
    FEISHU_APP_ID: "mock-app",
    FEISHU_TABLE_VEHICLE_MODELS: "tbl-models",
    FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS: "tbl-trims",
    FEISHU_TABLE_VEHICLES: "tbl-vehicles",
  } as any;

  async function getSessionCookie(role: "admin" | "customer") {
    const loginReq = new Request("http://localhost:3050/api/portal/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const loginRes = await handlePortalRequest(loginReq, env);
    return loginRes.headers.get("set-cookie") || "";
  }

  test("POST /api/portal/admin/sync-d1 requires authenticated session (401)", async () => {
    const req = new Request("http://localhost:3050/api/portal/admin/sync-d1", {
      method: "POST",
    });
    const res = await handlePortalRequest(req, env);
    expect(res.status).toBe(401);
  });

  test("POST /api/portal/admin/sync-d1 rejects customer role (403)", async () => {
    const cookie = await getSessionCookie("customer");
    const req = new Request("http://localhost:3050/api/portal/admin/sync-d1", {
      method: "POST",
      headers: { Cookie: cookie },
    });
    const res = await handlePortalRequest(req, env);
    expect(res.status).toBe(403);
  });
});
