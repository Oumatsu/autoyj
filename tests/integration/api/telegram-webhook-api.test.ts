import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv as Env } from "../../../server/types";

function makeMockTelegramDb() {
  const bindings = new Map<string, { user_id: string; chat_id: string; telegram_username?: string; first_name?: string }>();

  const db = {
    prepare(sql: string) {
      let boundValues: unknown[] = [];
      const stmt = {
        bind(...values: unknown[]) {
          boundValues = values;
          return stmt;
        },
        async first<T = Record<string, unknown>>() {
          if (sql.includes("FROM user_telegram_bindings WHERE user_id = ?")) {
            const userId = String(boundValues[0]);
            return (bindings.get(userId) || null) as T;
          }
          return null;
        },
        async run() {
          if (sql.includes("INSERT INTO user_telegram_bindings")) {
            const [userId, chatId, username, firstName] = boundValues;
            bindings.set(String(userId), {
              user_id: String(userId),
              chat_id: String(chatId),
              telegram_username: username ? String(username) : undefined,
              first_name: firstName ? String(firstName) : undefined,
            });
          }
          return { success: true };
        },
      };
      return stmt;
    },
  };

  return { db: db as unknown as D1Database, bindings };
}

describe("Telegram Webhook & Binding API", () => {
  const { db, bindings } = makeMockTelegramDb();
  const env: Env = {
    PORTAL_DB: db,
    TELEGRAM_BOT_TOKEN: "mock_bot_token",
    TELEGRAM_BOT_USERNAME: "youguard_ev_bot",
  };

  test("POST /api/portal/webhook/telegram handles /start bind_<userId>", async () => {
    const webhookPayload = {
      message: {
        chat: { id: 987654321 },
        from: { id: 987654321, username: "dawit_bekele", first_name: "Dawit" },
        text: "/start bind_USR-CUS-001",
      },
    };

    const req = new Request("http://localhost:3000/api/portal/webhook/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    const res = await handlePortalRequest(req, env);
    expect(res.status).toBe(200);
    const data = (await res.json()) as { ok: boolean };
    expect(data.ok).toBe(true);

    const saved = bindings.get("USR-CUS-001");
    expect(saved).toBeDefined();
    expect(saved?.chat_id).toBe("987654321");
    expect(saved?.telegram_username).toBe("dawit_bekele");
  });

  test("POST /api/portal/webhook/telegram ignores non-start messages gracefully", async () => {
    const webhookPayload = {
      message: {
        chat: { id: 987654321 },
        text: "Hello there",
      },
    };

    const req = new Request("http://localhost:3000/api/portal/webhook/telegram", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(webhookPayload),
    });

    const res = await handlePortalRequest(req, env);
    expect(res.status).toBe(200);
  });
});
