import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import {
  OFFICIAL_WHATSAPP_NUMBER,
  OFFICIAL_WHATSAPP_URL,
  buildOfficialWhatsAppUrl,
} from "../../lib/constants";

describe("WhatsApp Deep Links & Interactive QR Integration", () => {
  test("constants build valid official WhatsApp deep link and pre-filled inquiry text", () => {
    expect(OFFICIAL_WHATSAPP_NUMBER).toBeDefined();
    expect(OFFICIAL_WHATSAPP_URL).toBe(`https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}`);

    const emptyUrl = buildOfficialWhatsAppUrl();
    expect(emptyUrl).toBe(OFFICIAL_WHATSAPP_URL);

    const vehicleInquiryUrl = buildOfficialWhatsAppUrl("Hello Youguard team, I want to buy BYD Dolphin.");
    expect(vehicleInquiryUrl).toBe(
      `https://wa.me/${OFFICIAL_WHATSAPP_NUMBER}?text=Hello%20Youguard%20team%2C%20I%20want%20to%20buy%20BYD%20Dolphin.`
    );
  });

  test("views/qr.tsx contains direct deep link, clickable QR, copy action, and save button", async () => {
    const source = await readFile(new URL("../../views/qr.tsx", import.meta.url), "utf8");
    expect(source).toContain("OFFICIAL_WHATSAPP_URL");
    expect(source).toContain("OFFICIAL_WHATSAPP_NUMBER");
    expect(source).toContain("Chat Directly on WhatsApp");
    expect(source).toContain("navigator.clipboard.writeText");
    expect(source).toContain("Save QR Code Image");
  });

  test("components/QrDropdown.tsx renders direct link and direct chat button", async () => {
    const source = await readFile(new URL("../../components/QrDropdown.tsx", import.meta.url), "utf8");
    expect(source).toContain("OFFICIAL_WHATSAPP_URL");
    expect(source).toContain("Chat Directly");
    expect(source).toContain("Click to Open ↗");
  });

  test("components/Footer.tsx provides direct WhatsApp deep link on mobile and desktop", async () => {
    const source = await readFile(new URL("../../components/Footer.tsx", import.meta.url), "utf8");
    expect(source).toContain("OFFICIAL_WHATSAPP_URL");
    expect(source).toMatch(/<a[^>]*href=\{OFFICIAL_WHATSAPP_URL\}[^>]*>\s*<svg/);
  });

  test("components/SectionTabs.tsx uses QrDropdown and direct WhatsApp deep link", async () => {
    const source = await readFile(new URL("../../components/SectionTabs.tsx", import.meta.url), "utf8");
    expect(source).toContain("OFFICIAL_WHATSAPP_URL");
    expect(source).toContain("<QrDropdown>");
  });

  test("app/products/_VehicleDetail.tsx renders direct pre-filled WhatsApp inquiry link", async () => {
    const source = await readFile(new URL("../../app/products/_VehicleDetail.tsx", import.meta.url), "utf8");
    expect(source).toContain("buildOfficialWhatsAppUrl");
    expect(source).toMatch(/href=\{buildOfficialWhatsAppUrl\(`Hello Youguard team/);
  });

  test("views/contact.tsx renders direct WhatsApp deep link alongside QR code shortcut", async () => {
    const source = await readFile(new URL("../../views/contact.tsx", import.meta.url), "utf8");
    expect(source).toContain("OFFICIAL_WHATSAPP_URL");
    expect(source).toMatch(/href=\{OFFICIAL_WHATSAPP_URL\}/);
    expect(source).toContain('href="/qr"');
  });
});
