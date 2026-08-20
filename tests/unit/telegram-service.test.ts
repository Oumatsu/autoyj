import { describe, expect, test } from "bun:test";
import {
  buildTelegramBindingUrl,
  getTelegramBotToken,
  getTelegramBotUsername,
} from "../../server/services/telegram";

describe("Telegram Notification Service", () => {
  const mockEnv = {
    TELEGRAM_BOT_TOKEN: "8527474898:AAGXxoBBo4yLZyMR-jXNa2KHz7HROXv51RE",
    TELEGRAM_BOT_USERNAME: "youguard_ev_bot",
  };

  test("resolves telegram bot token and username from env", () => {
    expect(getTelegramBotToken(mockEnv)).toBe("8527474898:AAGXxoBBo4yLZyMR-jXNa2KHz7HROXv51RE");
    expect(getTelegramBotUsername(mockEnv)).toBe("youguard_ev_bot");
  });

  test("builds direct telegram start binding URL for user", () => {
    const url = buildTelegramBindingUrl(mockEnv, "USR-CUS-001");
    expect(url).toBe("https://t.me/youguard_ev_bot?start=bind_USR-CUS-001");
  });

  test("builds encoded binding URL for complex user ID", () => {
    const url = buildTelegramBindingUrl(mockEnv, "CUS 2026/01");
    expect(url).toBe("https://t.me/youguard_ev_bot?start=bind_CUS%202026%2F01");
  });

  test("getTelegramUserBinding returns null on empty db or missing user", async () => {
    const { getTelegramUserBinding } = await import("../../server/services/telegram");
    expect(await getTelegramUserBinding(undefined, "USR-123")).toBeNull();
    expect(await getTelegramUserBinding({} as any, "")).toBeNull();
  });
});
