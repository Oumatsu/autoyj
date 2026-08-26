import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv } from "../../../server/types";

function makeMockDb() {
  const subscriptions = new Map<string, any>();
  const db = {
    prepare(sql: string) {
      let boundValues: any[] = [];
      return {
        bind(...args: any[]) {
          boundValues = args;
          return this;
        },
        async first<T>() {
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return {
              id: "USR-SALES-01",
              role: "sales",
              account_type: "internal",
              customer_id: "USR-SALES-01",
              name: "Sales Agent",
              email: "sales@example.com",
              price_tier: "internal",
              status: "Active",
            } as T;
          }
          if (/COUNT\(\*\)\s+AS\s+total\s+FROM\s+user_push_subscriptions/i.test(sql)) {
            const userId = boundValues[0];
            const count = Array.from(subscriptions.values()).filter((s) => s.userId === userId).length;
            return { total: count } as T;
          }
          return null;
        },
        async all<T>() {
          if (/FROM\s+user_push_subscriptions\s+WHERE\s+user_id/i.test(sql)) {
            const userId = boundValues[0];
            const results = Array.from(subscriptions.values()).filter((s) => s.userId === userId);
            return { results } as T;
          }
          return { results: [] as T[] };
        },
        async run() {
          if (/INSERT\s+INTO\s+user_push_subscriptions/i.test(sql)) {
            // [id, userId, endpoint, p256dh, auth, userAgent, now, now]
            const [id, userId, endpoint, p256dh, auth, userAgent, createdAt, updatedAt] = boundValues;
            subscriptions.set(endpoint, { id, userId, endpoint, p256dh, auth, userAgent, createdAt, updatedAt });
          }
          if (/DELETE\s+FROM\s+user_push_subscriptions\s+WHERE\s+endpoint/i.test(sql)) {
            const [endpoint] = boundValues;
            subscriptions.delete(endpoint);
          }
          return { success: true };
        },
      };
    },
    subscriptions,
  };
  return db;
}

async function salesSession(targetEnv: PortalEnv) {
  const login = await handlePortalRequest(
    new Request("http://localhost/api/portal/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "sales" }),
    }),
    targetEnv
  );
  return decodeURIComponent(
    login.headers.get("set-cookie")?.match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] || ""
  );
}

describe("PWA Web Push API Endpoints", () => {
  test("GET /api/portal/push/public-key returns standard VAPID public key", async () => {
    const mockDb = makeMockDb();
    const env = { PORTAL_DB: mockDb, ENVIRONMENT: "test" } as unknown as PortalEnv;

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/push/public-key", { method: "GET" }),
      env
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as any;
    expect(json.publicKey).toBeDefined();
    expect(typeof json.publicKey).toBe("string");
    expect(json.publicKey.length).toBeGreaterThan(20);
  });

  test("POST /api/portal/push/subscribe registers a device PushSubscription", async () => {
    const mockDb = makeMockDb();
    const env = { PORTAL_DB: mockDb, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as PortalEnv;
    const token = await salesSession(env);

    const subscriptionPayload = {
      endpoint: "https://fcm.googleapis.com/fcm/send/device-token-123",
      keys: {
        p256dh: "BMm-5Z9g_test_key_sample",
        auth: "auth_secret_sample",
      },
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    };

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `portal_session=${token}`,
        },
        body: JSON.stringify(subscriptionPayload),
      }),
      env
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(mockDb.subscriptions.has("https://fcm.googleapis.com/fcm/send/device-token-123")).toBe(true);
  });

  test("DELETE /api/portal/push/subscribe removes a registered endpoint", async () => {
    const mockDb = makeMockDb();
    mockDb.subscriptions.set("https://fcm.googleapis.com/fcm/send/device-token-123", {
      userId: "USR-SALES-01",
      endpoint: "https://fcm.googleapis.com/fcm/send/device-token-123",
    });

    const env = { PORTAL_DB: mockDb, ENVIRONMENT: "test", PORTAL_COOKIE_NAME: "portal_session" } as unknown as PortalEnv;
    const token = await salesSession(env);

    const res = await handlePortalRequest(
      new Request("http://localhost/api/portal/push/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Cookie: `portal_session=${token}`,
        },
        body: JSON.stringify({ endpoint: "https://fcm.googleapis.com/fcm/send/device-token-123" }),
      }),
      env
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true });
    expect(mockDb.subscriptions.has("https://fcm.googleapis.com/fcm/send/device-token-123")).toBe(false);
  });
});
