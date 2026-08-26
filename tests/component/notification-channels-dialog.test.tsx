import { describe, expect, test } from "bun:test";
import React from "react";
import { createRoot } from "react-dom/client";
import { act } from "react";
import { NotificationChannelsDialog } from "../../components/NotificationChannelsDialog";

describe("NotificationChannelsDialog Component Tests", () => {
  test("renders closed without mounting DOM dialog element", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <NotificationChannelsDialog
          isOpen={false}
          onClose={() => {}}
          telegramBinding={{ bound: false }}
        />
      );
    });

    expect(container.querySelector('[role="dialog"]')).toBeNull();
    await act(async () => root.unmount());
    container.remove();
  });

  test("renders open with Telegram and Web Push status cards", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    let closed = false;
    await act(async () => {
      root.render(
        <NotificationChannelsDialog
          isOpen={true}
          onClose={() => { closed = true; }}
          telegramBinding={{
            bound: true,
            telegramUsername: "salesteam_bot",
            bindingUrl: "https://t.me/YouguardBot?start=bind_user_123",
          }}
          locale="en"
        />
      );
    });

    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(container.textContent).toContain("Telegram Bot");
    expect(container.textContent).toContain("PWA Web Push");
    expect(container.textContent).toContain("@salesteam_bot");

    const linkAction = container.querySelector('[data-testid="link-telegram-action"]');
    expect(linkAction).not.toBeNull();
    expect(linkAction?.getAttribute("href")).toBe("https://t.me/YouguardBot?start=bind_user_123");

    const closeBtn = container.querySelector('[data-testid="close-notification-dialog"]') as HTMLButtonElement;
    expect(closeBtn).not.toBeNull();
    await act(async () => closeBtn.click());
    expect(closed).toBe(true);

    await act(async () => root.unmount());
    container.remove();
  });
});
