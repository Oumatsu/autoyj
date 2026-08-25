import { describe, expect, test } from "bun:test";
import {
  generateVapidHeaders,
  encryptWebPushPayload,
  getVapidPublicKey,
} from "../../server/services/web-push";
import type { PortalEnv } from "../../server/types";

describe("Edge-native Web Push VAPID & Encryption Unit Tests", () => {
  const fakeEnv = {
    VAPID_PUBLIC_KEY: "BEl62iUYgUivxIkv69yViEuiBIa-Ib9-Skv6_Ikv6_Ikv69yViEuiBIa-Ib9-Skv6_Ikv6_Ikv69yViEuiBIa-I",
    VAPID_PRIVATE_KEY: "secret_vapid_key_for_test",
    VAPID_SUBJECT: "mailto:support@youguard.net",
  } as unknown as PortalEnv;

  test("getVapidPublicKey retrieves configured or standard default public key", () => {
    const key = getVapidPublicKey(fakeEnv);
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key.length).toBeGreaterThan(20);
  });

  test("generateVapidHeaders creates valid Authorization and Crypto-Key headers for an endpoint", async () => {
    const endpoint = "https://fcm.googleapis.com/fcm/send/sample-token";
    const headers = await generateVapidHeaders(fakeEnv, endpoint);

    expect(headers).toBeDefined();
    expect(headers.Authorization).toBeDefined();
    expect(headers.Authorization).toMatch(/^(vapid|WebPush)\s+/i);
    expect(headers.TTL).toBe("86400");
    expect(headers.Urgency).toBe("high");
  });

  test("encryptWebPushPayload encrypts JSON notification with standard ECDH + AES-128-GCM format", async () => {
    // Generate sample client P-256 keys (65-byte uncompressed public key + 16-byte auth secret)
    const clientAuth = "q4q8pQ8qZ_g5G9X_8Z12wA"; // base64url ~16 bytes
    const clientP256dh = "BCVxsr7N_eNg62XxpOv4r4hZ3iS5c-Gv1hJ0o8Q_7y0gN2q9l3p8r7u1t5y9x3w5v7u1t5y9x3w5v7u1t5y9x3w"; // base64url ~65 bytes

    const payload = JSON.stringify({
      title: "New Quotation Ready",
      body: "Youguard sales updated quote #QTE-2026-001",
      data: { url: "/portal?quote=QTE-2026-001" },
    });

    const encrypted = await encryptWebPushPayload({
      clientP256dh,
      clientAuth,
      payload,
    });

    expect(encrypted).toBeDefined();
    expect(encrypted.ciphertext).toBeInstanceOf(Uint8Array);
    expect(encrypted.ciphertext.length).toBeGreaterThan(86); // salt(16) + rs(4) + idlen(1) + key(65) + cipher
    expect(encrypted.contentEncoding).toBe("aes128gcm");
  });
});
