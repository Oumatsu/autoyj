import type { PortalEnv } from "../types";
import { getTelegramBotToken, getTelegramUserBinding, type InquiryStakeholderNotificationParams } from "./telegram";
import { getUserPushSubscriptions, sendWebPushNotification } from "./web-push";

export type DualChannelNotificationParams = InquiryStakeholderNotificationParams & {
  mockSendTelegram?: (chatId: string, text: string, url: string) => Promise<boolean>;
  mockSendWebPush?: (
    subscription: { endpoint: string; p256dh: string; auth: string },
    payload: { title: string; body: string; url?: string }
  ) => Promise<{ success: boolean; expired?: boolean }>;
};

export type DualChannelDeliveryResult = {
  telegramAttempted: number;
  telegramSent: number;
  webPushAttempted: number;
  webPushSent: number;
  webPushExpired: number;
};

/**
 * Deliver inquiry notifications across Telegram (Primary) and PWA Web Push (Fallback)
 */
export async function notifyInquiryStakeholdersDualChannel(
  env: PortalEnv,
  params: DualChannelNotificationParams
): Promise<DualChannelDeliveryResult> {
  const db = env.PORTAL_DB;
  if (!db) {
    return {
      telegramAttempted: 0,
      telegramSent: 0,
      webPushAttempted: 0,
      webPushSent: 0,
      webPushExpired: 0,
    };
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

  // 2. Fetch all participants, commenters, and quoters for this inquiry
  const [participantsRes, commentersRes, quotersRes] = await Promise.all([
    db
      .prepare("SELECT DISTINCT user_id, customer_id, role FROM inquiry_participants WHERE inquiry_no = ?")
      .bind(params.inquiryNo)
      .all<{ user_id: string; customer_id?: string; role: string }>()
      .catch(() => ({ results: [] })),
    db
      .prepare("SELECT DISTINCT author_user_id AS user_id FROM inquiry_notes WHERE inquiry_no = ? AND deleted_at IS NULL")
      .bind(params.inquiryNo)
      .all<{ user_id: string }>()
      .catch(() => ({ results: [] })),
    db
      .prepare("SELECT DISTINCT actor_user_id AS user_id FROM negotiations WHERE inquiry_no = ?")
      .bind(params.inquiryNo)
      .all<{ user_id: string }>()
      .catch(() => ({ results: [] })),
  ]);

  const participants = participantsRes?.results || [];
  const commenters = commentersRes?.results || [];
  const quoters = quotersRes?.results || [];

  // 3. Determine recipient user IDs
  const recipientUserIds = new Set<string>();

  if (isPublic) {
    if (customerId && customerId !== authorUserId) {
      recipientUserIds.add(customerId);
    }
    for (const p of participants) {
      if (p.user_id && p.user_id !== authorUserId) {
        recipientUserIds.add(p.user_id);
      }
    }
    for (const c of commenters) {
      if (c.user_id && c.user_id !== authorUserId) {
        recipientUserIds.add(c.user_id);
      }
    }
    for (const q of quoters) {
      if (q.user_id && q.user_id !== authorUserId) {
        recipientUserIds.add(q.user_id);
      }
    }
    // If author is customer/partner, also notify internal staff (sales/admin)
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
    // Internal notes: restrict strictly to sales and admin
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

  // Exclude author
  recipientUserIds.delete(authorUserId);

  if (recipientUserIds.size === 0) {
    return {
      telegramAttempted: 0,
      telegramSent: 0,
      webPushAttempted: 0,
      webPushSent: 0,
      webPushExpired: 0,
    };
  }

  // 4. Format notification contents
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

  const telegramText = [
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

  const portalUrl = `https://youguard.net/portal?inquiry=${encodeURIComponent(params.inquiryNo)}&src=notification`;
  const pushTitle = `Youguard Auto · #${params.inquiryNo}`;
  const pushBody = `${params.authorName} (${roleLabel}): "${preview}"`;

  let telegramAttempted = 0;
  let telegramSent = 0;
  let webPushAttempted = 0;
  let webPushSent = 0;
  let webPushExpired = 0;

  const token = getTelegramBotToken(env);

  // 5. Deliver to recipients
  for (const userId of recipientUserIds) {
    const binding = await getTelegramUserBinding(db, userId).catch(() => null);

    if (binding?.chat_id) {
      // Primary: Telegram Channel
      telegramAttempted++;
      if (params.mockSendTelegram) {
        const ok = await params.mockSendTelegram(binding.chat_id, telegramText, portalUrl);
        if (ok) telegramSent++;
      } else if (token) {
        try {
          const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              chat_id: binding.chat_id,
              text: telegramText,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [[{ text: `🔘 Open Inquiry #${params.inquiryNo}`, url: portalUrl }]],
              },
            }),
            signal: AbortSignal.timeout(10000),
          });
          const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
          if (data.ok) telegramSent++;
        } catch (err) {
          console.error(`[notifications] Telegram send failure for user ${userId}:`, err);
        }
      }
    } else {
      // Fallback: PWA Web Push Channel
      const pushSubscriptions = await getUserPushSubscriptions(db, userId);
      for (const sub of pushSubscriptions) {
        webPushAttempted++;
        if (params.mockSendWebPush) {
          const res = await params.mockSendWebPush(sub, {
            title: pushTitle,
            body: pushBody,
            url: portalUrl,
          });
          if (res.success) webPushSent++;
          if (res.expired) webPushExpired++;
        } else {
          const res = await sendWebPushNotification(env, sub, {
            title: pushTitle,
            body: pushBody,
            url: portalUrl,
          });
          if (res.success) webPushSent++;
          if (res.expired) webPushExpired++;
        }
      }
    }
  }

  return {
    telegramAttempted,
    telegramSent,
    webPushAttempted,
    webPushSent,
    webPushExpired,
  };
}
