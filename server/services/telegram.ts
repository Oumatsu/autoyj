import type { PortalEnv } from "../types";

export type TelegramBinding = {
  user_id: string;
  chat_id: string;
  telegram_username?: string | null;
  first_name?: string | null;
  bound_at: string;
  updated_at: string;
};

export function getTelegramBotToken(env: PortalEnv): string {
  return env.TELEGRAM_BOT_TOKEN || "8527474898:AAGXxoBBo4yLZyMR-jXNa2KHz7HROXv51RE";
}

export function getTelegramBotUsername(env: PortalEnv): string {
  return env.TELEGRAM_BOT_USERNAME || "youguard_ev_bot";
}

export function buildTelegramBindingUrl(env: PortalEnv, userId: string): string {
  const username = getTelegramBotUsername(env);
  return `https://t.me/${username}?start=bind_${encodeURIComponent(userId)}`;
}

export async function saveTelegramUserBinding(
  db: D1Database | undefined,
  params: {
    userId: string;
    chatId: string;
    username?: string | null;
    firstName?: string | null;
  }
): Promise<boolean> {
  if (!db) return false;
  const now = new Date().toISOString();

  try {
    await db
      .prepare(
        `INSERT INTO user_telegram_bindings (user_id, chat_id, telegram_username, first_name, bound_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           chat_id = excluded.chat_id,
           telegram_username = excluded.telegram_username,
           first_name = excluded.first_name,
           updated_at = excluded.updated_at`
      )
      .bind(
        params.userId,
        params.chatId,
        params.username ?? null,
        params.firstName ?? null,
        now,
        now
      )
      .run();
    return true;
  } catch (err) {
    console.error("Failed to save telegram user binding:", err);
    return false;
  }
}

export async function getTelegramUserBinding(
  db: D1Database | undefined,
  userId: string
): Promise<TelegramBinding | null> {
  if (!db) return null;
  try {
    const row = await db
      .prepare("SELECT * FROM user_telegram_bindings WHERE user_id = ?")
      .bind(userId)
      .first<TelegramBinding>();
    return row || null;
  } catch {
    return null;
  }
}

export type TelegramInquiryNotificationParams = {
  inquiryNo: string;
  customerUserId: string;
  vehicleModel: string;
  noteBody: string;
  authorName: string;
};

export async function sendTelegramInquiryUpdateNotification(
  env: PortalEnv,
  params: TelegramInquiryNotificationParams
): Promise<{ sent: boolean; reason?: string; messageId?: number }> {
  const token = getTelegramBotToken(env);
  if (!token || !env.PORTAL_DB) {
    return { sent: false, reason: "missing_config" };
  }

  const binding = await getTelegramUserBinding(env.PORTAL_DB, params.customerUserId);
  if (!binding || !binding.chat_id) {
    return { sent: false, reason: "not_bound" };
  }

  const safeBody = (params.noteBody || "").trim();
  const preview =
    safeBody.length > 180 ? `${safeBody.slice(0, 180)}...` : safeBody;

  const text = [
    `🚗 *Youguard Auto · Inquiry Update*`,
    ``,
    `*Inquiry*: \`#${params.inquiryNo}\``,
    `*Vehicle*: *${params.vehicleModel}*`,
    `*From*: ${params.authorName}`,
    ``,
    `💬 _"${preview}"_`,
    ``,
    `👉 Tap the button below to review full specifications and reply directly on your Portal:`,
  ].join("\n");

  const portalUrl = `https://youguard.net/portal?inquiry=${encodeURIComponent(params.inquiryNo)}&src=tg`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: binding.chat_id,
        text,
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "🔘 View & Reply on Portal",
                url: portalUrl,
              },
            ],
          ],
        },
      }),
    });

    const data = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      result?: { message_id?: number };
    };
    if (data.ok) {
      return { sent: true, messageId: data.result?.message_id };
    }
    return { sent: false, reason: "api_rejected" };
  } catch (err) {
    console.error("Telegram notification error:", err);
    return { sent: false, reason: "network_error" };
  }
}

export async function handleTelegramWebhook(
  request: Request,
  env: PortalEnv
): Promise<Response> {
  const token = getTelegramBotToken(env);
  const payload = (await request.json().catch(() => ({}))) as {
    message?: {
      chat?: { id?: number | string };
      from?: { id?: number | string; username?: string; first_name?: string };
      text?: string;
    };
  };

  const text = (payload.message?.text || "").trim();
  const chatId = payload.message?.chat?.id;

  if (!chatId) {
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // Handle /start bind_<userId>
  if (text.startsWith("/start bind_")) {
    const rawUserId = text.replace("/start bind_", "").trim();
    const userId = decodeURIComponent(rawUserId);

    if (userId && env.PORTAL_DB) {
      await saveTelegramUserBinding(env.PORTAL_DB, {
        userId,
        chatId: String(chatId),
        username: payload.message?.from?.username,
        firstName: payload.message?.from?.first_name,
      });

      // Send confirmation message
      const welcomeText = [
        `🎉 *Welcome to Youguard Auto!*`,
        ``,
        `Your Telegram account is now *successfully linked* to your Youguard Portal.`,
        ``,
        `✅ You will receive instant notifications here whenever our sales team updates your official vehicle quotations, specifications, or PDI inspection reports.`,
        ``,
        `👉 Access your portal anytime: https://youguard.net/portal`,
      ].join("\n");

      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: welcomeText,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: "🌐 Open Youguard Portal",
                  url: "https://youguard.net/portal",
                },
              ],
            ],
          },
        }),
      }).catch(() => {});
    }
  } else if (text === "/start" || text === "/help") {
    const helpText = [
      `👋 *Hello from Youguard Auto Bot!*`,
      ``,
      `To connect your account, please log in to https://youguard.net/portal and click the *Connect Telegram* button on your dashboard.`,
    ].join("\n");

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: helpText,
        parse_mode: "Markdown",
      }),
    }).catch(() => {});
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
