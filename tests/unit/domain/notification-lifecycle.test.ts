import { describe, it, expect } from "bun:test";
import { notifyInquiryStakeholdersDualChannel } from "../../../server/services/notifications";
import type { PortalEnv } from "../../../server/types";

describe("Notification Lifecycle & Eviction Domain Tests", () => {
  it("purges expired 410/404 push subscriptions from database automatically and uses inquiry tag", async () => {
    const deletedEndpoints: string[] = [];
    const receivedPayloads: any[] = [];
    const pushSubscriptions = [
      {
        id: "sub_1",
        user_id: "PARTNER-001",
        endpoint: "https://push.example.com/expired-token",
        p256dh: "key_p256dh",
        auth: "key_auth",
        user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)",
      },
    ];

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
                inquiry_no: "INQ-2026-TEST",
                customer_id: "CUS-001",
                vehicle_model: "Zeekr 001",
                title: "Zeekr 001 Sourcing",
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
            if (/FROM\s+inquiry_notes/i.test(sql) || /FROM\s+negotiations/i.test(sql) || /FROM\s+portal_users/i.test(sql)) {
              return { results: [] } as T;
            }
            if (/FROM\s+user_push_subscriptions/i.test(sql)) {
              const userId = String(boundValues[0]);
              const results = pushSubscriptions.filter((s) => s.user_id === userId);
              return { results } as T;
            }
            return { results: [] } as T;
          },
          async run() {
            if (/DELETE\s+FROM\s+user_push_subscriptions\s+WHERE\s+endpoint/i.test(sql)) {
              deletedEndpoints.push(String(boundValues[0]));
            }
            return { success: true };
          },
        };
        return stmt;
      },
    };

    const env: PortalEnv = {
      PORTAL_DB: db,
    };

    const result = await notifyInquiryStakeholdersDualChannel(env, {
      inquiryNo: "INQ-2026-TEST",
      authorUserId: "CUS-001",
      authorName: "Test Customer",
      authorRole: "customer",
      bodyText: "Is this vehicle available?",
      isPublic: true,
      mockSendWebPush: async (_sub, payload) => {
        receivedPayloads.push(payload);
        return { success: false, expired: true, status: 410, errorText: "Endpoint expired" };
      },
    });

    expect(result.webPushAttempted).toBe(1);
    expect(result.webPushExpired).toBe(1);
    expect(deletedEndpoints).toContain("https://push.example.com/expired-token");
    expect(receivedPayloads[0]?.tag).toBe("inq-INQ-2026-TEST");
  });
});
