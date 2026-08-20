import { describe, expect, test } from "bun:test";
import { notifyInquiryStakeholdersTelegram } from "../../../server/services/telegram";
import type { PortalEnv as Env } from "../../../server/types";

describe("Telegram Inquiry Stakeholder Notifications", () => {
  const telegramRequests: { chatId: string; text: string; buttonUrl: string }[] = [];

  const originalFetch = globalThis.fetch;
  const mockFetch = (async (url: string | URL | Request, init?: RequestInit) => {
    const urlStr = String(url);
    if (urlStr.includes("api.telegram.org")) {
      const body = JSON.parse(String(init?.body || "{}"));
      telegramRequests.push({
        chatId: String(body.chat_id),
        text: body.text,
        buttonUrl: body.reply_markup?.inline_keyboard?.[0]?.[0]?.url || "",
      });
      return new Response(JSON.stringify({ ok: true, result: { message_id: 12345 } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return originalFetch(url, init);
  }) as typeof fetch;

  function makeMockNotificationDb() {
    const users = [
      { user_id: "USR-CUS-01", role: "customer", customer_id: "CUS-01", name: "Dawit Customer" },
      { user_id: "USR-PRT-01", role: "partner", customer_id: "CUS-01", name: "Kidus Partner" },
      { user_id: "USR-SALES-01", role: "sales", customer_id: "SALES-01", name: "Sarah Sales" },
    ];
    const bindings = new Map<string, { user_id: string; chat_id: string }>([
      ["USR-CUS-01", { user_id: "USR-CUS-01", chat_id: "1001" }],
      ["USR-PRT-01", { user_id: "USR-PRT-01", chat_id: "2002" }],
      ["USR-SALES-01", { user_id: "USR-SALES-01", chat_id: "3003" }],
    ]);
    const inquiries = [
      { inquiry_no: "INQ-2026-001", customer_id: "USR-CUS-01", vehicle_model: "BYD Seal 06 DM-i" },
    ];
    const participants = [
      { inquiry_no: "INQ-2026-001", user_id: "USR-CUS-01", role: "customer" },
      { inquiry_no: "INQ-2026-001", user_id: "USR-PRT-01", role: "partner" },
    ];

    const db = {
      prepare(sql: string) {
        let boundValues: unknown[] = [];
        const stmt = {
          bind(...values: unknown[]) {
            boundValues = values;
            return stmt;
          },
          async first<T = Record<string, unknown>>() {
            if (sql.includes("FROM inquiries WHERE inquiry_no = ?")) {
              const inqNo = String(boundValues[0]);
              return (inquiries.find((i) => i.inquiry_no === inqNo) || null) as T;
            }
            if (sql.includes("FROM user_telegram_bindings WHERE user_id = ?")) {
              const userId = String(boundValues[0]);
              return (bindings.get(userId) || null) as T;
            }
            return null;
          },
          async all<T = Record<string, unknown>>() {
            if (sql.includes("FROM inquiry_participants WHERE inquiry_no = ?")) {
              const inqNo = String(boundValues[0]);
              return { results: (participants.filter((p) => p.inquiry_no === inqNo) || []) as T[] };
            }
            if (sql.includes("FROM user_telegram_bindings")) {
              const allBindings = Array.from(bindings.values());
              return { results: allBindings as T[] };
            }
            if (sql.includes("FROM portal_users WHERE role IN ('sales', 'admin')")) {
              const staff = users.filter((u) => u.role === "sales" || u.role === "admin");
              return { results: staff as T[] };
            }
            return { results: [] };
          },
        };
        return stmt;
      },
    };

    return db as unknown as D1Database;
  }

  test("sales reply notifies bound customer and partner on the inquiry with direct portal link", async () => {
    globalThis.fetch = mockFetch;
    telegramRequests.length = 0;

    const env: Env = {
      PORTAL_DB: makeMockNotificationDb(),
      TELEGRAM_BOT_TOKEN: "mock_token",
      TELEGRAM_BOT_USERNAME: "youguard_ev_bot",
    };

    const result = await notifyInquiryStakeholdersTelegram(env, {
      inquiryNo: "INQ-2026-001",
      vehicleModel: "BYD Seal 06 DM-i",
      noteBody: "The FOB Shanghai price is $16,800. Fast dispatch in 7 days.",
      authorUserId: "USR-SALES-01",
      authorName: "Sarah Sales",
      authorRole: "sales",
      isPublic: true,
    });

    expect(result.sentCount).toBe(2);
    const notifiedChatIds = telegramRequests.map((r) => r.chatId);
    expect(notifiedChatIds).toContain("1001");
    expect(notifiedChatIds).toContain("2002");
    expect(notifiedChatIds).not.toContain("3003");

    const customerMsg = telegramRequests.find((r) => r.chatId === "1001");
    expect(customerMsg?.text).toContain("INQ-2026-001");
    expect(customerMsg?.text).toContain("BYD Seal 06 DM-i");
    expect(customerMsg?.text).toContain("Sarah Sales");
    expect(customerMsg?.text).toContain("FOB Shanghai price is $16,800");
    expect(customerMsg?.buttonUrl).toContain("https://youguard.net/portal?inquiry=INQ-2026-001&src=tg");
  });

  test("customer reply notifies bound partner and internal sales reps", async () => {
    globalThis.fetch = mockFetch;
    telegramRequests.length = 0;

    const env: Env = {
      PORTAL_DB: makeMockNotificationDb(),
      TELEGRAM_BOT_TOKEN: "mock_token",
      TELEGRAM_BOT_USERNAME: "youguard_ev_bot",
    };

    const result = await notifyInquiryStakeholdersTelegram(env, {
      inquiryNo: "INQ-2026-001",
      vehicleModel: "BYD Seal 06 DM-i",
      noteBody: "Can you provide CIF Djibouti quotation for 5 units?",
      authorUserId: "USR-CUS-01",
      authorName: "Dawit Customer",
      authorRole: "customer",
      isPublic: true,
    });

    expect(result.sentCount).toBe(2);
    const notifiedChatIds = telegramRequests.map((r) => r.chatId);
    expect(notifiedChatIds).toContain("2002");
    expect(notifiedChatIds).toContain("3003");
    expect(notifiedChatIds).not.toContain("1001");
  });

  test("internal note (isPublic: false) never notifies customer or partner", async () => {
    globalThis.fetch = mockFetch;
    telegramRequests.length = 0;

    const env: Env = {
      PORTAL_DB: makeMockNotificationDb(),
      TELEGRAM_BOT_TOKEN: "mock_token",
      TELEGRAM_BOT_USERNAME: "youguard_ev_bot",
    };

    const result = await notifyInquiryStakeholdersTelegram(env, {
      inquiryNo: "INQ-2026-001",
      vehicleModel: "BYD Seal 06 DM-i",
      noteBody: "Supplier minimum base cost is $15,200.",
      authorUserId: "USR-ADMIN-01",
      authorName: "Admin",
      authorRole: "admin",
      isPublic: false,
    });

    expect(result.sentCount).toBe(1);
    const notifiedChatIds = telegramRequests.map((r) => r.chatId);
    expect(notifiedChatIds).toContain("3003");
    expect(notifiedChatIds).not.toContain("1001");
    expect(notifiedChatIds).not.toContain("2002");
  });
});
