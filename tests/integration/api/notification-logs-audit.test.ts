import { describe, it, expect } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import {
  notifyInquiryStakeholdersDualChannel,
  recordNotificationLog,
} from "../../../server/services/notifications";
import type { PortalEnv } from "../../../server/types";

function createMockNotificationDb() {
  const notificationLogs: any[] = [];
  const pushSubscriptions = [
    {
      id: "sub_1",
      user_id: "PARTNER-001",
      endpoint: "https://fcm.googleapis.com/fcm/send/device_123",
      p256dh: "key_p256dh",
      auth: "key_auth",
      user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15",
    },
  ];
  const telegramBindings = new Map<string, any>([
    ["CUS-002", { user_id: "CUS-002", chat_id: "9988776655", telegram_username: "vip_customer_tg", first_name: "VIP Customer" }],
  ]);

  const db: any = {
    prepare(sql: string) {
      let boundValues: any[] = [];
      const stmt = {
        bind(...args: any[]) {
          boundValues = args;
          return stmt;
        },
        async first<T = any>() {
          if (/FROM\s+inquiries\s+WHERE\s+inquiry_no/i.test(sql)) {
            return {
              inquiry_no: "INQ-AUDIT-001",
              customer_id: "CUS-002",
              vehicle_model: "Avatr 11 Flagship",
              title: "Avatr 11 Sourcing",
            } as T;
          }
          if (/FROM\s+user_telegram_bindings\s+WHERE\s+user_id/i.test(sql)) {
            const userId = String(boundValues[0]);
            return (telegramBindings.get(userId) || null) as T;
          }
          if (/FROM\s+user/i.test(sql) || /JOIN\s+account/i.test(sql)) {
            return {
              id: "CUS-002",
              user_id: "CUS-002",
              role: "customer",
              account_type: "external",
              customer_id: "CUS-002",
              name: "VIP Customer",
              email: "customer@example.com",
              status: "Active",
            } as T;
          }
          return null as T;
        },
        async all<T = any>() {
          if (/FROM\s+inquiry_participants/i.test(sql)) {
            return {
              results: [{ user_id: "PARTNER-001", role: "partner" }],
            } as T;
          }
          if (/FROM\s+inquiry_notes/i.test(sql)) {
            return { results: [] } as T;
          }
          if (/FROM\s+negotiations/i.test(sql)) {
            return { results: [] } as T;
          }
          if (/FROM\s+user_push_subscriptions/i.test(sql)) {
            const userId = String(boundValues[0]);
            const results = pushSubscriptions.filter((s) => s.user_id === userId);
            return { results } as T;
          }
          if (/FROM\s+notification_logs/i.test(sql)) {
            let results = [...notificationLogs];
            let paramIdx = 0;
            if (sql.includes("recipient_user_id = ?")) {
              const val = boundValues[paramIdx++];
              results = results.filter((r) => r.recipient_user_id === val);
            }
            if (sql.includes("inquiry_no = ?")) {
              const val = boundValues[paramIdx++];
              results = results.filter((r) => r.inquiry_no === val);
            }
            if (sql.includes("channel = ?")) {
              const val = boundValues[paramIdx++];
              results = results.filter((r) => r.channel === val);
            }
            return { results } as T;
          }
          return { results: [] } as T;
        },
        async run() {
          if (/INSERT INTO notification_logs/i.test(sql)) {
            const [
              id,
              channel,
              recipient_user_id,
              inquiry_no,
              device_info,
              destination,
              title,
              body,
              status,
              http_status,
              error_message,
              created_at,
            ] = boundValues;
            notificationLogs.push({
              id,
              channel,
              recipient_user_id,
              inquiry_no,
              device_info,
              destination,
              title,
              body,
              status,
              http_status,
              error_message,
              created_at,
            });
            return { success: true };
          }
          return { success: true };
        },
      };
      return stmt;
    },
  };

  return { db, notificationLogs };
}

describe("Notification Logs & Device Audit Trail", () => {
  it("records Telegram and PWA delivery logs with client device metadata when sales replies", async () => {
    const { db, notificationLogs } = createMockNotificationDb();
    const env: PortalEnv = {
      PORTAL_DB: db,
      TELEGRAM_BOT_TOKEN: "mock_test_token",
    } as any;

    const result = await notifyInquiryStakeholdersDualChannel(env, {
      inquiryNo: "INQ-AUDIT-001",
      vehicleModel: "Avatr 11 Flagship",
      noteBody: "Official FOB quotation of $38,500 has been uploaded.",
      authorUserId: "USR-SALES-01",
      authorName: "Sales Lead",
      authorRole: "sales",
      isPublic: true,
      mockSendTelegram: async () => true,
      mockSendWebPush: async () => ({ success: true }),
    });

    expect(result.telegramSent).toBe(1);
    expect(result.webPushSent).toBe(1);

    expect(notificationLogs.length).toBe(2);

    const tgLog = notificationLogs.find((l) => l.channel === "telegram");
    expect(tgLog).toBeDefined();
    expect(tgLog.recipient_user_id).toBe("CUS-002");
    expect(tgLog.device_info).toContain("@vip_customer_tg");
    expect(tgLog.destination).toBe("9988776655");
    expect(tgLog.status).toBe("sent");
    expect(tgLog.http_status).toBe(200);

    const pushLog = notificationLogs.find((l) => l.channel === "pwa_push");
    expect(pushLog).toBeDefined();
    expect(pushLog.recipient_user_id).toBe("PARTNER-001");
    expect(pushLog.device_info).toContain("iPhone");
    expect(pushLog.destination).toContain("fcm.googleapis.com");
    expect(pushLog.status).toBe("sent");
  });

  it("records failed status when push delivery fails or is expired", async () => {
    const { db, notificationLogs } = createMockNotificationDb();
    const env: PortalEnv = {
      PORTAL_DB: db,
      TELEGRAM_BOT_TOKEN: "mock_test_token",
    } as any;

    await notifyInquiryStakeholdersDualChannel(env, {
      inquiryNo: "INQ-AUDIT-001",
      noteBody: "Testing expired device token fallback",
      authorUserId: "USR-SALES-01",
      authorName: "Sales Lead",
      authorRole: "sales",
      isPublic: true,
      mockSendTelegram: async () => false,
      mockSendWebPush: async () => ({ success: false, expired: true }),
    });

    const failedPush = notificationLogs.find((l) => l.channel === "pwa_push" && l.status === "expired");
    expect(failedPush).toBeDefined();
    expect(failedPush.http_status).toBe(410);

    const failedTg = notificationLogs.find((l) => l.channel === "telegram" && l.status === "failed");
    expect(failedTg).toBeDefined();
    expect(failedTg.http_status).toBe(500);
  });

  it("allows querying notification audit logs via GET /api/portal/notification-logs", async () => {
    const { db } = createMockNotificationDb();
    const env: PortalEnv = {
      PORTAL_DB: db,
      ENVIRONMENT: "test",
      PORTAL_COOKIE_NAME: "portal_session",
    } as any;

    // Write test log
    await recordNotificationLog(db, {
      channel: "pwa_push",
      recipientUserId: "CUS-002",
      inquiryNo: "INQ-AUDIT-001",
      deviceInfo: "Chrome on macOS",
      destination: "https://push.example.com/test",
      title: "Test Alert",
      body: "Test Body",
      status: "sent",
      httpStatus: 200,
    });

    const loginRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "customer" }),
      }),
      env
    );
    const setCookie = loginRes.headers.get("set-cookie") ?? "";
    const match = setCookie.match(/(?:portal_session|youguard_portal)=([^;]+)/);
    const token = match ? decodeURIComponent(match[1]) : "";

    const req = new Request("http://localhost/api/portal/notification-logs?inquiryNo=INQ-AUDIT-001", {
      headers: {
        Cookie: `portal_session=${token}`,
      },
    });

    const res = await handlePortalRequest(req, env);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { ok: boolean; logs: any[] };
    expect(body.ok).toBe(true);
    expect(body.logs.length).toBeGreaterThanOrEqual(1);
    expect(body.logs[0].deviceInfo).toBe("Chrome on macOS");
    expect(body.logs[0].status).toBe("sent");
  });
});
