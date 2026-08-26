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

export type NewInquiryStartedDualChannelParams = {
  inquiryNo: string;
  vehicleModel?: string;
  creatorUserId: string;
  creatorName: string;
  creatorRole: string;
  quantity?: number;
  destinationPort?: string;
  tradeTerm?: string;
  targetPrice?: number | null;
  initialNote?: string;
  customerId?: string;
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
 * Deliver inquiry note/reply notifications across Telegram (Primary) AND PWA Web Push (Simultaneous Broadcast)
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

  // 5. Deliver to recipients (Simultaneous Broadcast: Telegram if bound + Web Push for all subscribed devices)
  for (const userId of recipientUserIds) {
    // Channel 1: Telegram
    const binding = await getTelegramUserBinding(db, userId).catch(() => null);
    if (binding?.chat_id) {
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
    }

    // Channel 2: PWA Web Push (Delivers to all active devices registered by this user)
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

  return {
    telegramAttempted,
    telegramSent,
    webPushAttempted,
    webPushSent,
    webPushExpired,
  };
}

/**
 * Deliver new inquiry broadcast notifications across Telegram AND PWA Web Push
 */
export async function notifyNewInquiryStartedDualChannel(
  env: PortalEnv,
  params: NewInquiryStartedDualChannelParams
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

  const isStaffCreator = params.creatorRole === "sales" || params.creatorRole === "admin";
  const recipientUserIds = new Set<string>();

  if (!isStaffCreator) {
    // Notify all sales and admin staff
    const staffRes = await db
      .prepare("SELECT user_id FROM portal_users WHERE role IN ('sales', 'admin')")
      .all<{ user_id: string }>()
      .catch(() => ({ results: [] }));
    for (const s of staffRes?.results || []) {
      if (s.user_id && s.user_id !== params.creatorUserId) {
        recipientUserIds.add(s.user_id);
      }
    }
  } else {
    // Staff代客录入: notify target customer
    if (params.customerId && params.customerId !== params.creatorUserId) {
      recipientUserIds.add(params.customerId);
    }
  }

  if (recipientUserIds.size === 0) {
    return {
      telegramAttempted: 0,
      telegramSent: 0,
      webPushAttempted: 0,
      webPushSent: 0,
      webPushExpired: 0,
    };
  }

  const roleLabel =
    params.creatorRole === "partner"
      ? "Trade Partner"
      : params.creatorRole === "customer"
        ? "Client"
        : params.creatorRole === "sales"
          ? "Sales Specialist"
          : "Administrator";

  const lines = [
    `🚀 *Youguard Auto · New Sourcing Inquiry*`,
    ``,
    `*Inquiry*: \`#${params.inquiryNo}\``,
    `*Vehicle*: *${params.vehicleModel || "Vehicle Inquiry"}*`,
    `*From*: ${params.creatorName} (${roleLabel})`,
    `*Quantity*: ${params.quantity || 1} Units`,
    `*Trade Term*: ${params.tradeTerm || "FOB"}`,
  ];

  if (params.destinationPort) {
    lines.push(`*Destination*: ${params.destinationPort}`);
  }
  if (params.targetPrice) {
    lines.push(`*Target Price*: USD $${params.targetPrice.toLocaleString()}`);
  }
  if (params.initialNote?.trim()) {
    const preview = params.initialNote.trim().length > 180 ? `${params.initialNote.trim().slice(0, 180)}...` : params.initialNote.trim();
    lines.push(``, `💬 _"${preview}"_`);
  }

  lines.push(``, `👉 Tap below to view details and issue quotation:`);

  const telegramText = lines.join("\n");
  const portalUrl = `https://youguard.net/portal?inquiry=${encodeURIComponent(params.inquiryNo)}&src=notification`;
  const pushTitle = `🚀 New Inquiry #${params.inquiryNo} · ${params.vehicleModel || "Vehicle"}`;
  const pushBody = `${params.creatorName} (${roleLabel}) requested ${params.quantity || 1} units (${params.tradeTerm || "FOB"}).`;

  let telegramAttempted = 0;
  let telegramSent = 0;
  let webPushAttempted = 0;
  let webPushSent = 0;
  let webPushExpired = 0;

  const token = getTelegramBotToken(env);

  for (const userId of recipientUserIds) {
    // Channel 1: Telegram
    const binding = await getTelegramUserBinding(db, userId).catch(() => null);
    if (binding?.chat_id) {
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
                inline_keyboard: [[{ text: `🔘 View Inquiry #${params.inquiryNo}`, url: portalUrl }]],
              },
            }),
            signal: AbortSignal.timeout(10000),
          });
          const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
          if (data.ok) telegramSent++;
        } catch (err) {
          console.error(`[notifications] Telegram send failure for new inquiry to user ${userId}:`, err);
        }
      }
    }

    // Channel 2: PWA Web Push
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

  return {
    telegramAttempted,
    telegramSent,
    webPushAttempted,
    webPushSent,
    webPushExpired,
  };
}
