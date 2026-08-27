import { describe, expect, test } from "bun:test";
import { urlBase64ToUint8Array, ensurePushSubscriptionSynced } from "../../../lib/push-client";

describe("Web Push Client Utilities (lib/push-client.ts)", () => {
  test("urlBase64ToUint8Array properly decodes standard VAPID public key base64url string", () => {
    const vapidKey = "BP0GXeFrbM_8mHeCf5zHF7irR1cuX9JWz_NVhfk1UH-ThIypM-L7_5mSBRF1Q3lwLvY_bzwB5mIFtNutt_1rIlU";
    const bytes = urlBase64ToUint8Array(vapidKey);
    expect(bytes).toBeInstanceOf(Uint8Array);
    expect(bytes.length).toBe(65);
    expect(bytes[0]).toBe(0x04); // NIST P-256 uncompressed public key prefix 0x04
  });

  test("ensurePushSubscriptionSynced handles serverless/non-browser environment gracefully", async () => {
    const res = await ensurePushSubscriptionSynced();
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
