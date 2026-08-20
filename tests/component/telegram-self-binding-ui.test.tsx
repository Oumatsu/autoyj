import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { buildTelegramBindingUrl } from "../../server/services/telegram";

describe("Telegram Self-Service 1-Click Binding UI", () => {
  test("buildTelegramBindingUrl constructs exact deep link for any user role", () => {
    const fakeEnv = { TELEGRAM_BOT_USERNAME: "youguard_ev_bot" } as any;
    const partnerUrl = buildTelegramBindingUrl(fakeEnv, "PARTNER-002");
    expect(partnerUrl).toBe("https://t.me/youguard_ev_bot?start=bind_PARTNER-002");

    const salesUrl = buildTelegramBindingUrl(fakeEnv, "USR-SALES-LX");
    expect(salesUrl).toBe("https://t.me/youguard_ev_bot?start=bind_USR-SALES-LX");
  });

  test("app/portal/page.tsx integrates Telegram binding status in header and sidebar without duplicate dashboard banner", async () => {
    const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
    expect(source).not.toContain("Connect Telegram Bot for Instant Push Alerts");
    expect(source).toContain("Link Telegram for Inquiry Alerts ↗");
    expect(source).toContain("data.telegramBinding.bound");
  });

  test("app/portal/page.tsx renders self-service Telegram status in sidebar user profile card", async () => {
    const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
    expect(source).toMatch(/data\.telegramBinding\.bindingUrl/);
    expect(source).toContain("Link Telegram for Alerts ↗");
  });

  test("app/portal/page.tsx maintains header Telegram alert badge for quick access", async () => {
    const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
    expect(source).toContain("Link Telegram for Inquiry Alerts ↗");
    expect(source).toContain("Telegram Active");
  });
});
