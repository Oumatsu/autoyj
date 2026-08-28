import { describe, expect, test } from "bun:test";
import { encryptWebPushPayload, base64UrlEncode } from "../../../server/services/web-push";

describe("RFC 8291 Web Push Encryption", () => {
  test("encryptWebPushPayload produces ciphertext that can be decrypted by standard ECDH client", async () => {
    const clientKeypair = await crypto.subtle.generateKey(
      { name: "ECDH", namedCurve: "P-256" },
      true,
      ["deriveBits"]
    );
    const clientPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", clientKeypair.publicKey));
    const rawAuthSecret = crypto.getRandomValues(new Uint8Array(16));

    const clientP256dh = base64UrlEncode(clientPubRaw);
    const clientAuth = base64UrlEncode(rawAuthSecret);

    const payloadText = JSON.stringify({
      title: "🚗 Youguard Test Note",
      body: "Testing real-time inquiry message delivery",
      data: { url: "/portal?inquiry=INQ-123" },
    });

    const encrypted = await encryptWebPushPayload({
      clientP256dh,
      clientAuth,
      payload: payloadText,
    });

    expect(encrypted.contentEncoding).toBe("aes128gcm");
    expect(encrypted.ciphertext.length).toBeGreaterThan(86);

    const body = encrypted.ciphertext;
    const salt = body.slice(0, 16);
    const idlen = body[20];
    expect(idlen).toBe(65);
    const serverEphemeralPubRaw = body.slice(21, 21 + idlen);
    const ciphertext = body.slice(21 + idlen);

    const serverPubKey = await crypto.subtle.importKey(
      "raw",
      serverEphemeralPubRaw,
      { name: "ECDH", namedCurve: "P-256" },
      false,
      []
    );
    const clientSharedBits = await crypto.subtle.deriveBits(
      { name: "ECDH", public: serverPubKey },
      clientKeypair.privateKey,
      256
    );

    const clientIkmKey = await crypto.subtle.importKey("raw", clientSharedBits, "HKDF", false, ["deriveBits"]);
    const authInfo = new Uint8Array(14 + 65 + 65);
    authInfo.set(new TextEncoder().encode("WebPush: info\0"), 0);
    authInfo.set(clientPubRaw, 14);
    authInfo.set(serverEphemeralPubRaw, 14 + 65);

    const clientPrkBits = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt: rawAuthSecret, info: authInfo },
      clientIkmKey,
      256
    );
    const clientPrkKey = await crypto.subtle.importKey("raw", clientPrkBits, "HKDF", false, ["deriveBits", "deriveKey"]);

    const clientCekKey = await crypto.subtle.deriveKey(
      { name: "HKDF", hash: "SHA-256", salt, info: new TextEncoder().encode("Content-Encoding: aes128gcm\0") },
      clientPrkKey,
      { name: "AES-GCM", length: 128 },
      false,
      ["decrypt"]
    );

    const nonceBits = await crypto.subtle.deriveBits(
      { name: "HKDF", hash: "SHA-256", salt, info: new TextEncoder().encode("Content-Encoding: nonce\0") },
      clientPrkKey,
      96
    );

    const decryptedPadded = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: new Uint8Array(nonceBits) },
      clientCekKey,
      ciphertext
    );
    const decryptedBytes = new Uint8Array(decryptedPadded);
    const decryptedText = new TextDecoder().decode(decryptedBytes.slice(0, decryptedBytes.length - 1));

    expect(decryptedText).toBe(payloadText);
  });
});
