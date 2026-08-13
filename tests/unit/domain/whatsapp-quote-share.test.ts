import { describe, expect, test } from "bun:test";
import { buildWhatsAppQuoteShareUrl } from "../../../lib/quotation-pricing";

describe("buildWhatsAppQuoteShareUrl", () => {
  test("generates WhatsApp share link with phone number and formatted quote message", () => {
    const url = buildWhatsAppQuoteShareUrl({
      phone: "+251 91 123 4567",
      quoteNo: "YG-2026-001",
      customer: "Addis Motors",
      vehicleModel: "BYD Seal Premium / White",
      quantity: 3,
      unitPrice: 28000,
      cifTotal: "USD 84,000.00",
    });

    expect(url.startsWith("https://wa.me/251911234567?text=")).toBe(true);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Dear Addis Motors");
    expect(decoded).toContain("YG-2026-001");
    expect(decoded).toContain("BYD Seal Premium / White");
    expect(decoded).toContain("3 unit(s)");
    expect(decoded).toContain("USD 28,000.00");
    expect(decoded).toContain("CIF Total: USD 84,000.00");
  });

  test("generates link without phone number using generic customer name fallback", () => {
    const url = buildWhatsAppQuoteShareUrl({
      quoteNo: "YG-2026-002",
      vehicleModel: "BYD Han",
      quantity: 1,
      unitPrice: 32000,
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Dear Customer");
    expect(decoded).toContain("YG-2026-002");
    expect(decoded).toContain("USD 32,000.00");
  });
});
