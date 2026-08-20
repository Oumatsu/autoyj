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
      await db
      .prepare(
        `UPDATE portal_users SET telegram_chat_id = ?, telegram_username = ?, updated_at = ? WHERE user_id = ?`
      )
      .bind(params.chatId, params.username ?? "", now, params.userId)
      .run()
      .catch(() => {});

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

export type InquiryStakeholderNotificationParams = {
  inquiryNo: string;
  vehicleModel?: string;
  noteBody: string;
  authorUserId: string;
  authorName: string;
  authorRole: string;
  isPublic?: boolean;
};

export async function notifyInquiryStakeholdersTelegram(
  env: PortalEnv,
  params: InquiryStakeholderNotificationParams
): Promise<{ attemptedCount: number; sentCount: number }> {
  const token = getTelegramBotToken(env);
  const db = env.PORTAL_DB;
  if (!token || !db) {
    return { attemptedCount: 0, sentCount: 0 };
  }

  const isPublic = params.isPublic !== false;
  const authorUserId = params.authorUserId;

  // 1. Fetch inquiry to resolve main customer & vehicle
  const inquiry = await db
    .prepare("SELECT inquiry_no, customer_id, vehicle_model, title FROM inquiries WHERE inquiry_no = ?")
    .bind(params.inquiryNo)
    .first<{ inquiry_no: string; customer_id: string; vehicle_model?: string; title?: string }>()
    .catch(() => null);

  const vehicleModel = params.vehicleModel || inquiry?.vehicle_model || inquiry?.title || "Vehicle Inquiry";
  const customerId = inquiry?.customer_id;

  // 2. Fetch all participants for this inquiry
  const participantsRes = await db
    .prepare("SELECT DISTINCT user_id, customer_id, role FROM inquiry_participants WHERE inquiry_no = ?")
    .bind(params.inquiryNo)
    .all<{ user_id: string; customer_id?: string; role: string }>()
    .catch(() => ({ results: [] }));

  const participants = participantsRes?.results || [];

  // 3. Determine recipient user IDs
  const recipientUserIds = new Set<string>();

  if (isPublic) {
    // If public:
    // A) Always add customerId if not author
    if (customerId && customerId !== authorUserId) {
      recipientUserIds.add(customerId);
    }
    // B) Add all partner/customer participants on this inquiry
    for (const p of participants) {
      if (p.user_id && p.user_id !== authorUserId) {
        if (p.role === "customer" || p.role === "partner") {
          recipientUserIds.add(p.user_id);
        }
      }
    }
    // C) If author is customer or partner, notify all internal sales & admin staff with bound Telegram
    if (params.authorRole === "customer" || params.authorRole === "partner") {
      const staffRes = await db
        .prepare("SELECT user_id FROM portal_users WHERE role IN ('sales', 'admin')")
        .all<{ user_id: string }>()
        .catch(() => ({ results: [] }));
      for (const s of staffRes?.results || []) {
        if (s.user_id && s.user_id !== authorUserId) {
          recipientUserIds.add(s.user_id);
        }
      }
    }
  } else {
    // Internal note: ONLY sales & admin staff
    const staffRes = await db
      .prepare("SELECT user_id FROM portal_users WHERE role IN ('sales', 'admin')")
      .all<{ user_id: string }>()
      .catch(() => ({ results: [] }));
    for (const s of staffRes?.results || []) {
      if (s.user_id && s.user_id !== authorUserId) {
        recipientUserIds.add(s.user_id);
      }
    }
  }

  // Remove author
  recipientUserIds.delete(authorUserId);

  if (recipientUserIds.size === 0) {
    return { attemptedCount: 0, sentCount: 0 };
  }

  // 4. Format notification text and link
  const safeBody = (params.noteBody || "").trim();
  const preview = safeBody.length > 200 ? `${safeBody.slice(0, 200)}...` : safeBody;

  const roleLabel =
    params.authorRole === "sales"
      ? "Sales Specialist"
      : params.authorRole === "admin"
        ? "Administrator"
        : params.authorRole === "partner"
          ? "Trade Partner"
          : "Client";

  const text = [
    `🚗 *Youguard Auto · Inquiry Message*`,
    ``,
    `*Inquiry*: \`#${params.inquiryNo}\``,
    `*Vehicle*: *${vehicleModel}*`,
    `*From*: ${params.authorName} (${roleLabel})`,
    ``,
    `💬 _"${preview}"_`,
    ``,
    `👉 Tap the button below to view and reply directly on your Portal:`,
  ].join("\n");

  const portalUrl = `https://youguard.net/portal?inquiry=${encodeURIComponent(params.inquiryNo)}&src=tg`;

  let attemptedCount = 0;
  let sentCount = 0;

  for (const userId of recipientUserIds) {
    const binding = await getTelegramUserBinding(db, userId).catch(() => null);
    if (!binding?.chat_id) continue;

    attemptedCount++;
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
                  text: `🔘 Open Inquiry #${params.inquiryNo}`,
                  url: portalUrl,
                },
              ],
            ],
          },
        }),
        signal: AbortSignal.timeout(10000),
      });

      const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
      if (data.ok) {
        sentCount++;
      }
    } catch (err) {
      console.error(`Failed to send Telegram notification to user ${userId}:`, err);
    }
  }

  return { attemptedCount, sentCount };
}

export async function sendTelegramInquiryUpdateNotification(
  env: PortalEnv,
  params: TelegramInquiryNotificationParams
): Promise<{ sent: boolean; reason?: string; messageId?: number }> {
  const result = await notifyInquiryStakeholdersTelegram(env, {
    inquiryNo: params.inquiryNo,
    vehicleModel: params.vehicleModel,
    noteBody: params.noteBody,
    authorUserId: "",
    authorName: params.authorName,
    authorRole: "sales",
    isPublic: true,
  });

  return { sent: result.sentCount > 0 };
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
