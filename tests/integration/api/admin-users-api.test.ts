import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

function makeMockAdminDb() {
  const users = new Map<string, Record<string, unknown>>();
  const bindings = new Map<string, Record<string, unknown>>();

  // Seed default admin and customer
  users.set("USR-ADMIN-01", {
    user_id: "USR-ADMIN-01",
    customer_id: "USR-ADMIN-01",
    name: "Admin Manager",
    email: "admin@local.test",
    company: "Youguard Operations",
    whatsapp: "+8613800000000",
    telegram_chat_id: "123456",
    telegram_username: "admin_youguard",
    account_type: "internal",
    role: "admin",
    access_code: "admin-demo-2026",
    status: "Active",
    created_at: "2026-08-01T00:00:00Z",
    updated_at: "2026-08-01T00:00:00Z",
  });

  const db = {
    prepare(sql: string) {
      let boundValues: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          boundValues = values;
          return stmt;
        },
        async first<T = Record<string, unknown>>() {
          if (sql.includes("FROM portal_users WHERE user_id = ?")) {
            const userId = String(boundValues[0]);
            return (users.get(userId) || null) as T;
          }
          if (sql.includes("FROM portal_users WHERE LOWER(email) = LOWER(?)")) {
            const email = String(boundValues[0]).toLowerCase();
            for (const u of users.values()) {
              if (String(u.email).toLowerCase() === email) return u as T;
            }
            return null;
          }
          if (sql.includes("FROM user_telegram_bindings WHERE user_id = ?")) {
            const userId = String(boundValues[0]);
            return (bindings.get(userId) || null) as T;
          }
          return null;
        },
        async all<T = Record<string, unknown>>() {
          if (sql.includes("FROM portal_users")) {
            return { results: Array.from(users.values()) as T[] };
          }
          return { results: [] };
        },
        async run() {
          if (sql.includes("INSERT INTO portal_users")) {
            const [userId, customerId, name, email, company, whatsapp, telegramChatId, telegramUsername, accountType, role, accessCode] = boundValues;
            users.set(String(userId), {
              user_id: String(userId),
              customer_id: String(customerId),
              name: String(name),
              email: String(email),
              company: String(company),
              whatsapp: String(whatsapp),
              telegram_chat_id: String(telegramChatId),
              telegram_username: String(telegramUsername),
              account_type: String(accountType),
              role: String(role),
              access_code: String(accessCode),
              status: "Active",
            });
          }
          if (sql.includes("UPDATE portal_users SET telegram_chat_id = ''")) {
            const userId = String(boundValues[1]);
            const existing = users.get(userId);
            if (existing) {
              users.set(userId, {
                ...existing,
                telegram_chat_id: "",
                telegram_username: "",
              });
            }
          } else if (sql.includes("UPDATE portal_users SET")) {
            const userId = String(boundValues[10]);
            const existing = users.get(userId);
            if (existing) {
              const [name, email, company, role, accessCode, whatsapp, telegramChatId, telegramUsername, status] = boundValues;
              users.set(userId, {
                ...existing,
                name: String(name),
                email: String(email),
                company: String(company),
                role: String(role),
                access_code: String(accessCode),
                whatsapp: String(whatsapp),
                telegram_chat_id: String(telegramChatId),
                telegram_username: String(telegramUsername),
                status: String(status),
              });
            }
          }
          if (sql.includes("INSERT INTO user_telegram_bindings")) {
            const [userId, chatId, username, firstName] = boundValues;
            bindings.set(String(userId), {
              user_id: String(userId),
              chat_id: String(chatId),
              telegram_username: username ? String(username) : null,
              first_name: firstName ? String(firstName) : null,
            });
          }
          if (sql.includes("DELETE FROM portal_users WHERE user_id = ?")) {
            users.delete(String(boundValues[0]));
          }
          if (sql.includes("DELETE FROM user_telegram_bindings WHERE user_id = ?")) {
            bindings.delete(String(boundValues[0]));
          }
          return { success: true };
        },
      };
      return stmt;
    },
  };

  return { db: db as unknown as D1Database, users, bindings };
}

describe("Admin User Management API", () => {
  const { db, users } = makeMockAdminDb();
  const env: Env = {
    PORTAL_DB: db,
    PORTAL_SESSION_SECRET: "test_secret_for_admin_user_mgmt_tests_123",
  };

  async function getAdminCookie() {
    const loginReq = new Request("http://localhost:3000/api/portal/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "admin" }),
    });
    const loginRes = await handlePortalRequest(loginReq, env);
    return loginRes.headers.get("set-cookie") || "";
  }

  async function getCustomerCookie() {
    const loginReq = new Request("http://localhost:3000/api/portal/dev-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "customer" }),
    });
    const loginRes = await handlePortalRequest(loginReq, env);
    return loginRes.headers.get("set-cookie") || "";
  }

  test("GET /api/portal/admin/users allows admin and rejects customer with 403", async () => {
    const customerCookie = await getCustomerCookie();
    const forbiddenReq = new Request("http://localhost:3000/api/portal/admin/users", {
      headers: { cookie: customerCookie },
    });
    const forbiddenRes = await handlePortalRequest(forbiddenReq, env);
    expect(forbiddenRes.status).toBe(403);

    const adminCookie = await getAdminCookie();
    const adminReq = new Request("http://localhost:3000/api/portal/admin/users", {
      headers: { cookie: adminCookie },
    });
    const adminRes = await handlePortalRequest(adminReq, env);
    expect(adminRes.status).toBe(200);
    const data = (await adminRes.json()) as { ok: boolean; users: Record<string, unknown>[] };
    expect(data.ok).toBe(true);
    expect(Array.isArray(data.users)).toBe(true);
  });

  test("POST /api/portal/admin/users creates a new user and configures Telegram chat_id", async () => {
    const adminCookie = await getAdminCookie();
    const createReq = new Request("http://localhost:3000/api/portal/admin/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        cookie: adminCookie,
      },
      body: JSON.stringify({
        name: "Dawit Bekele",
        email: "dawit@addisev.com",
        accessCode: "dawit-pass-2026",
        company: "Addis EV Motors",
        role: "customer",
        priceTier: "vip",
        whatsapp: "+251911234567",
        telegramChatId: "987654321",
        telegramUsername: "dawit_ev",
      }),
    });

    const createRes = await handlePortalRequest(createReq, env);
    expect(createRes.status).toBe(201);
    const data = (await createRes.json()) as { ok: boolean; user: { user_id: string; email: string } };
    expect(data.ok).toBe(true);
    expect(data.user.email).toBe("dawit@addisev.com");
    expect(users.has(data.user.user_id)).toBe(true);
  });

  test("PATCH /api/portal/admin/users/:id updates user details and Telegram credentials", async () => {
    const adminCookie = await getAdminCookie();
    const updateReq = new Request("http://localhost:3000/api/portal/admin/users/USR-ADMIN-01", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: adminCookie,
      },
      body: JSON.stringify({
        company: "Youguard Global Operations",
        telegramChatId: "555666777",
        telegramUsername: "youguard_ops_lead",
      }),
    });

    const updateRes = await handlePortalRequest(updateReq, env);
    expect(updateRes.status).toBe(200);
    const updated = users.get("USR-ADMIN-01");
    expect(updated?.company).toBe("Youguard Global Operations");
    expect(updated?.telegram_chat_id).toBe("555666777");
    expect(updated?.telegram_username).toBe("youguard_ops_lead");
  });

  test("DELETE /api/portal/admin/users/:id/telegram unbinds Telegram and reverts back to Unbound", async () => {
    const adminCookie = await getAdminCookie();
    const unbindReq = new Request("http://localhost:3000/api/portal/admin/users/USR-ADMIN-01/telegram", {
      method: "DELETE",
      headers: { cookie: adminCookie },
    });

    const unbindRes = await handlePortalRequest(unbindReq, env);
    expect(unbindRes.status).toBe(200);
    const updated = users.get("USR-ADMIN-01");
    expect(updated?.telegram_chat_id).toBe("");
    expect(updated?.telegram_username).toBe("");
  });
});
