import { describe, expect, test } from "bun:test";
import {
  notifyInquiryStakeholdersDualChannel,
  notifyNewInquiryStartedDualChannel,
} from "../../server/services/notifications";
import type { PortalEnv } from "../../server/types";

function makeMockDb({
  telegramBindings = {} as Record<string, { chat_id: string; telegram_username: string }>,
  pushSubscriptions = {} as Record<string, Array<{ endpoint: string; p256dh: string; auth: string }>>,
}) {
  const sentTelegramMessages: Array<{ chatId: string; text: string }> = [];
  const sentWebPushes: Array<{ endpoint: string; payload: any }> = [];
  const deletedPushEndpoints: string[] = [];

  const db = {
    prepare(sql: string) {
      let boundValues: any[] = [];
      return {
        bind(...args: any[]) {
          boundValues = args;
          return this;
        },
        async first<T>() {
          if (/FROM\s+inquiries\s+WHERE\s+inquiry_no/i.test(sql)) {
            return {
              inquiry_no: boundValues[0],
              customer_id: "CUST-VIP-01",
              vehicle_model: "BYD Yangwang U8",
              title: "BYD Yangwang U8 Batch Order",
            } as T;
          }
          if (/FROM\s+user_telegram_bindings\s+WHERE\s+user_id/i.test(sql)) {
            const userId = boundValues[0];
            return (telegramBindings[userId] ? { user_id: userId, ...telegramBindings[userId] } : null) as T;
          }
          if (/FROM\s+portal_users\s+WHERE/i.test(sql)) {
            return null;
          }
          return null;
        },
        async all<T>() {
          if (/FROM\s+inquiry_participants\s+WHERE/i.test(sql)) {
            return {
              results: [
                { user_id: "PARTNER-01", role: "partner" },
                { user_id: "SALES-REP-01", role: "sales" },
              ] as T[],
            };
          }
          if (/FROM\s+inquiry_notes\s+WHERE/i.test(sql)) {
            return { results: [] as T[] };
          }
          if (/FROM\s+negotiations\s+WHERE/i.test(sql)) {
            return { results: [] as T[] };
          }
          if (/FROM\s+portal_users\s+WHERE\s+role\s+IN/i.test(sql)) {
            return {
              results: [
                { user_id: "ADMIN-01" },
                { user_id: "SALES-REP-01" },
              ] as T[],
            };
          }
          if (/FROM\s+user_push_subscriptions\s+WHERE\s+user_id/i.test(sql)) {
            const userId = boundValues[0];
            return {
              results: (pushSubscriptions[userId] || []).map((s, idx) => ({
                id: `sub-${idx}`,
                user_id: userId,
                ...s,
              })) as T[],
            };
          }
          return { results: [] as T[] };
        },
        async run() {
          if (/DELETE\s+FROM\s+user_push_subscriptions\s+WHERE\s+endpoint/i.test(sql)) {
            deletedPushEndpoints.push(boundValues[0]);
          }
          return { success: true };
        },
      };
    },
    sentTelegramMessages,
    sentWebPushes,
    deletedPushEndpoints,
  };

  return db;
}

describe("Dual-Channel Notification Delivery Policy Domain Tests", () => {
  const fakeEnv = {
    TELEGRAM_BOT_TOKEN: "fake_token",
    VAPID_PUBLIC_KEY: "fake_pub_key",
    VAPID_PRIVATE_KEY: "fake_priv_key",
    VAPID_SUBJECT: "mailto:support@youguard.net",
  } as unknown as PortalEnv;

  test("delivers via Telegram AND PWA Web Push simultaneously when a user has both configured", async () => {
    const mockDb = makeMockDb({
      telegramBindings: {
        "SALES-REP-01": { chat_id: "TG_111", telegram_username: "sales_rep" },
      },
      pushSubscriptions: {
        "SALES-REP-01": [
          {
            endpoint: "https://fcm.googleapis.com/fcm/send/sales-desktop-device",
            p256dh: "p256dh_sales",
            auth: "auth_sales",
          },
        ],
        "CUST-VIP-01": [
          {
            endpoint: "https://fcm.googleapis.com/fcm/send/cust-device-1",
            p256dh: "p256dh_sample",
            auth: "auth_sample",
          },
        ],
      },
    });

    const env = { ...fakeEnv, PORTAL_DB: mockDb } as unknown as PortalEnv;

    const result = await notifyInquiryStakeholdersDualChannel(env, {
      inquiryNo: "INQ-2026-001",
      vehicleModel: "BYD Yangwang U8",
      noteBody: "Official quote has been issued: $128,000 FOB Shanghai",
      authorUserId: "PARTNER-01",
      authorName: "Partner Aebissa",
      authorRole: "partner",
      isPublic: true,
      mockSendTelegram: async (chatId, text) => {
        mockDb.sentTelegramMessages.push({ chatId, text });
        return true;
      },
      mockSendWebPush: async (sub, payload) => {
        mockDb.sentWebPushes.push({ endpoint: sub.endpoint, payload });
        return { success: true };
      },
    });

    expect(result.telegramAttempted).toBeGreaterThan(0);
    expect(result.webPushAttempted).toBeGreaterThan(0);
    // Sales received Telegram
    expect(mockDb.sentTelegramMessages.some((m) => m.chatId === "TG_111")).toBe(true);
    // Sales ALSO received PWA Web Push on desktop simultaneously
    expect(mockDb.sentWebPushes.some((p) => p.endpoint.includes("sales-desktop-device"))).toBe(true);
    // Customer received PWA Web Push
    expect(mockDb.sentWebPushes.some((p) => p.endpoint.includes("cust-device-1"))).toBe(true);
  });

  test("new inquiry broadcast notifies all sales and admin via both Telegram and PWA Web Push", async () => {
    const mockDb = makeMockDb({
      telegramBindings: {
        "SALES-REP-01": { chat_id: "TG_111", telegram_username: "sales_rep" },
        "ADMIN-01": { chat_id: "TG_999", telegram_username: "admin_user" },
      },
      pushSubscriptions: {
        "SALES-REP-01": [
          {
            endpoint: "https://fcm.googleapis.com/fcm/send/sales-desktop-device",
            p256dh: "p256dh_sales",
            auth: "auth_sales",
          },
        ],
        "ADMIN-01": [
          {
            endpoint: "https://fcm.googleapis.com/fcm/send/admin-desktop-device",
            p256dh: "p256dh_admin",
            auth: "auth_admin",
          },
        ],
      },
    });

    const env = { ...fakeEnv, PORTAL_DB: mockDb } as unknown as PortalEnv;

    const result = await notifyNewInquiryStartedDualChannel(env, {
      inquiryNo: "INQ-2026-NEW-01",
      vehicleModel: "Zeekr 001 2026",
      creatorUserId: "CUST-VIP-01",
      creatorName: "Aebissa Client",
      creatorRole: "customer",
      quantity: 5,
      destinationPort: "Djibouti",
      tradeTerm: "FOB",
      targetPrice: 42000,
      initialNote: "Urgent sourcing needed for fleet expansion",
      mockSendTelegram: async (chatId, text) => {
        mockDb.sentTelegramMessages.push({ chatId, text });
        return true;
      },
      mockSendWebPush: async (sub, payload) => {
        mockDb.sentWebPushes.push({ endpoint: sub.endpoint, payload });
        return { success: true };
      },
    });

    expect(result.telegramAttempted).toBe(2);
    expect(result.telegramSent).toBe(2);
    expect(result.webPushAttempted).toBe(2);
    expect(result.webPushSent).toBe(2);

    // Both sales and admin received Telegram
    expect(mockDb.sentTelegramMessages.some((m) => m.chatId === "TG_111")).toBe(true);
    expect(mockDb.sentTelegramMessages.some((m) => m.chatId === "TG_999")).toBe(true);
    // Both sales and admin received PWA Web Push
    expect(mockDb.sentWebPushes.some((p) => p.endpoint.includes("sales-desktop-device"))).toBe(true);
    expect(mockDb.sentWebPushes.some((p) => p.endpoint.includes("admin-desktop-device"))).toBe(true);
  });

  test("excludes author from receiving notifications on their own notes", async () => {
    const mockDb = makeMockDb({
      telegramBindings: {
        "SALES-REP-01": { chat_id: "TG_111", telegram_username: "sales_rep" },
      },
    });

    const env = { ...fakeEnv, PORTAL_DB: mockDb } as unknown as PortalEnv;

    await notifyInquiryStakeholdersDualChannel(env, {
      inquiryNo: "INQ-2026-001",
      vehicleModel: "BYD Yangwang U8",
      noteBody: "I will check shipping schedule.",
      authorUserId: "SALES-REP-01", // Author is SALES-REP-01
      authorName: "Sales Rep",
      authorRole: "sales",
      isPublic: true,
      mockSendTelegram: async (chatId, text) => {
        mockDb.sentTelegramMessages.push({ chatId, text });
        return true;
      },
    });

    // SALES-REP-01 should not be notified
    expect(mockDb.sentTelegramMessages.some((m) => m.chatId === "TG_111")).toBe(false);
  });
});
