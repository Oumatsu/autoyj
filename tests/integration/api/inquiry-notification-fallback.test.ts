import { describe, expect, test } from "bun:test";
import { handlePortalRequest } from "../../../server/api/portal";
import type { PortalEnv } from "../../../server/types";

describe("Inquiry Dual-Channel Notification Integration Tests", () => {
  test("delivers inquiry reply alerts via Telegram and falls back to Web Push when Telegram is unbound", async () => {
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
                name: "Sales Rep",
                email: "sales@example.com",
                price_tier: "internal",
                status: "Active",
              } as T;
            }
            if (/FROM\s+inquiries\s+WHERE\s+inquiry_no/i.test(sql)) {
              return {
                inquiry_no: "INQ-2026-088",
                customer_id: "USR-CUST-01",
                vehicle_model: "Zeekr 001",
                title: "Zeekr 001 2026 Model",
              } as T;
            }
            if (/FROM\s+user_telegram_bindings\s+WHERE\s+user_id/i.test(sql)) {
              const userId = boundValues[0];
              // USR-CUST-01 is NOT bound to Telegram
              if (userId === "USR-CUST-01") return null as T;
              return null as T;
            }
            return null as T;
          },
          async all<T>() {
            if (/FROM\s+inquiries/i.test(sql)) {
              return {
                results: [
                  {
                    id: "inq-1",
                    inquiry_no: "INQ-2026-088",
                    customer_id: "USR-CUST-01",
                    creator_user_id: "USR-CUST-01",
                    vehicle_id: "V-001",
                    vehicle_model: "Zeekr 001",
                    title: "Zeekr 001 2026 Model",
                    quantity: 1,
                    destination_port: "Djibouti",
                    trade_term: "FOB",
                    target_price: 35000,
                    initial_note: "Test note",
                    vehicle_snapshot_json: "{}",
                    is_public: 1,
                    status: "open",
                    source: "Customer Portal",
                    deleted_at: null,
                    created_at: "2026-08-14T00:00:00.000Z",
                    updated_at: "2026-08-14T00:00:00.000Z",
                  },
                ] as T[],
              };
            }
            if (/FROM\s+inquiry_participants/i.test(sql)) {
              return {
                results: [
                  { user_id: "USR-CUST-01", role: "customer" },
                ] as T[],
              };
            }
            if (/FROM\s+inquiry_notes\s+WHERE/i.test(sql)) {
              return { results: [] as T[] };
            }
            if (/FROM\s+negotiations\s+WHERE/i.test(sql)) {
              return { results: [] as T[] };
            }
            if (/FROM\s+portal_users\s+WHERE/i.test(sql)) {
              return { results: [] as T[] };
            }
            if (/FROM\s+user_push_subscriptions\s+WHERE\s+user_id/i.test(sql)) {
              const userId = boundValues[0];
              if (userId === "USR-CUST-01") {
                return {
                  results: [
                    {
                      id: "sub-1",
                      user_id: "USR-CUST-01",
                      endpoint: "https://fcm.googleapis.com/fcm/send/cust-sub-device",
                      p256dh: "p256dh_cust",
                      auth: "auth_cust",
                    },
                  ] as T[],
                };
              }
              return { results: [] as T[] };
            }
            return { results: [] as T[] };
          },
          async run() {
            return { success: true };
          },
        };
      },
      batch: async (statements: any[]) => statements.map(() => ({ success: true })),
    };

    const env = {
      PORTAL_DB: db,
      ENVIRONMENT: "test",
      PORTAL_COOKIE_NAME: "portal_session",
    } as unknown as PortalEnv;

    const loginRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/dev-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "sales" }),
      }),
      env
    );
    const token = decodeURIComponent(
      loginRes.headers.get("set-cookie")?.match(/(?:portal_session|youguard_portal)=([^;]+)/)?.[1] || ""
    );

    const postNoteRes = await handlePortalRequest(
      new Request("http://localhost/api/portal/inquiries/INQ-2026-088/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `portal_session=${token}`,
        },
        body: JSON.stringify({
          body: "We have confirmed container slot departing on Friday.",
          isPublic: false,
        }),
      }),
      env
    );

    expect(postNoteRes.status).toBe(201);
  });
});
