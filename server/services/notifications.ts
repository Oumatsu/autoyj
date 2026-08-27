import type { PortalEnv } from "../types";
import { getTelegramBotToken, getTelegramUserBinding, type InquiryStakeholderNotificationParams } from "./telegram";
import { getUserPushSubscriptions, sendWebPushNotification, type PushSubscriptionRecord } from "./web-push";

export type NotificationLogEntry = {
  id?: string;
  channel: "pwa_push" | "telegram";
  recipientUserId: string;
  inquiryNo?: string;
  deviceInfo?: string;
  destination: string;
  title: string;
  body?: string;
  status: "sent" | "failed" | "expired";
  httpStatus?: number;
  errorMessage?: string;
  createdAt?: string;
};

export async function recordNotificationLog(
  db: D1Database | undefined,
  entry: NotificationLogEntry
): Promise<boolean> {
  if (!db) return false;
  const id = entry.id || `notif_${crypto.randomUUID()}`;
  const now = entry.createdAt || new Date().toISOString();
  try {
    await db
      .prepare(
        `INSERT INTO notification_logs (
          id, channel, recipient_user_id, inquiry_no, device_info, destination,
          title, body, status, http_status, error_message, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        entry.channel,
        entry.recipientUserId,
        entry.inquiryNo || null,
        entry.deviceInfo || "",
        entry.destination,
        entry.title,
        entry.body || "",
        entry.status,
        entry.httpStatus || null,
        entry.errorMessage || null,
        now
      )
      .run();
    return true;
  } catch (err) {
    console.error("[notifications] Failed to record notification log:", err);
    return false;
  }
}

export type NotificationLogFilter = {
  recipientUserId?: string;
  inquiryNo?: string;
  channel?: "pwa_push" | "telegram";
  limit?: number;
};

export async function getNotificationLogs(
  db: D1Database | undefined,
  filter: NotificationLogFilter = {}
): Promise<Array<NotificationLogEntry>> {
  if (!db) return [];
  const limit = Math.min(filter.limit || 50, 200);
  const conditions: string[] = [];
  const params: any[] = [];

  if (filter.recipientUserId) {
    conditions.push("recipient_user_id = ?");
    params.push(filter.recipientUserId);
  }
  if (filter.inquiryNo) {
    conditions.push("inquiry_no = ?");
    params.push(filter.inquiryNo);
  }
  if (filter.channel) {
    conditions.push("channel = ?");
    params.push(filter.channel);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  try {
    const res = await db
      .prepare(`SELECT * FROM notification_logs ${whereClause} ORDER BY created_at DESC LIMIT ?`)
      .bind(...params, limit)
      .all<any>();
    return (res.results || []).map((r) => ({
      id: r.id,
      channel: r.channel,
      recipientUserId: r.recipient_user_id,
      inquiryNo: r.inquiry_no || undefined,
      deviceInfo: r.device_info,
      destination: r.destination,
      title: r.title,
      body: r.body,
      status: r.status,
      httpStatus: r.http_status,
      errorMessage: r.error_message,
      createdAt: r.created_at,
    }));
  } catch (err) {
    console.error("[notifications] Failed to fetch notification logs:", err);
    return [];
  }
}

export type DualChannelNotificationParams = InquiryStakeholderNotificationParams & {
  mockSendTelegram?: (chatId: string, text: string, url: string) => Promise<boolean>;
  mockSendWebPush?: (
    subscription: { endpoint: string; p256dh: string; auth: string; user_agent?: string },
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
    subscription: { endpoint: string; p256dh: string; auth: string; user_agent?: string },
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
  const pushTitle = `🚗 Youguard #${params.inquiryNo} · ${params.authorName} (${roleLabel})`;
  const pushBody = preview || "posted a new message on this inquiry";

  let telegramAttempted = 0;
  let telegramSent = 0;
  let webPushAttempted = 0;
  let webPushSent = 0;
  let webPushExpired = 0;

  const token = getTelegramBotToken(env);

  // Parallel dual-channel delivery across all stakeholder recipients
  await Promise.allSettled(
    Array.from(recipientUserIds).map(async (userId) => {
      // Channel 1: Telegram
      const binding = await getTelegramUserBinding(db, userId).catch(() => null);
      if (binding?.chat_id) {
        telegramAttempted++;
        const tgDeviceInfo = `Telegram (${binding.telegram_username ? `@${binding.telegram_username}` : binding.first_name || `chat:${binding.chat_id}`})`;
        if (params.mockSendTelegram) {
          const ok = await params.mockSendTelegram(binding.chat_id, telegramText, portalUrl);
          if (ok) {
            telegramSent++;
            await recordNotificationLog(db, {
              channel: "telegram",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: tgDeviceInfo,
              destination: binding.chat_id,
              title: `Inquiry #${params.inquiryNo} Message`,
              body: preview,
              status: "sent",
              httpStatus: 200,
            }).catch(() => {});
          } else {
            await recordNotificationLog(db, {
              channel: "telegram",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: tgDeviceInfo,
              destination: binding.chat_id,
              title: `Inquiry #${params.inquiryNo} Message`,
              body: preview,
              status: "failed",
              httpStatus: 500,
              errorMessage: "Mock telegram dispatch rejected",
            }).catch(() => {});
          }
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
            if (data.ok) {
              telegramSent++;
              await recordNotificationLog(db, {
                channel: "telegram",
                recipientUserId: userId,
                inquiryNo: params.inquiryNo,
                deviceInfo: tgDeviceInfo,
                destination: binding.chat_id,
                title: `Inquiry #${params.inquiryNo} Message`,
                body: preview,
                status: "sent",
                httpStatus: res.status,
              }).catch(() => {});
            } else {
              await recordNotificationLog(db, {
                channel: "telegram",
                recipientUserId: userId,
                inquiryNo: params.inquiryNo,
                deviceInfo: tgDeviceInfo,
                destination: binding.chat_id,
                title: `Inquiry #${params.inquiryNo} Message`,
                body: preview,
                status: "failed",
                httpStatus: res.status,
                errorMessage: "Telegram API returned ok: false",
              }).catch(() => {});
            }
          } catch (err: any) {
            console.error(`[notifications] Telegram send failure for user ${userId}:`, err);
            await recordNotificationLog(db, {
              channel: "telegram",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: tgDeviceInfo,
              destination: binding.chat_id,
              title: `Inquiry #${params.inquiryNo} Message`,
              body: preview,
              status: "failed",
              httpStatus: 500,
              errorMessage: err?.message || String(err),
            }).catch(() => {});
          }
        }
      }

      // Channel 2: PWA Web Push (Delivers to all active devices registered by this user)
      const pushSubscriptions = await getUserPushSubscriptions(db, userId);
      for (const sub of pushSubscriptions) {
        webPushAttempted++;
        const pwaDeviceInfo = sub.user_agent || "Browser PWA Client";
        if (params.mockSendWebPush) {
          const res = await params.mockSendWebPush(sub, {
            title: pushTitle,
            body: pushBody,
            url: portalUrl,
          });
          if (res.success) {
            webPushSent++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "sent",
              httpStatus: 200,
            }).catch(() => {});
          } else if (res.expired) {
            webPushExpired++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "expired",
              httpStatus: 410,
              errorMessage: "Subscription expired",
            }).catch(() => {});
          } else {
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "failed",
              httpStatus: 500,
              errorMessage: "Mock push delivery failed",
            }).catch(() => {});
          }
        } else {
          const res = await sendWebPushNotification(env, sub, {
            title: pushTitle,
            body: pushBody,
            url: portalUrl,
          });
          if (res.success) {
            webPushSent++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "sent",
              httpStatus: res.status || 200,
            }).catch(() => {});
          } else if (res.expired) {
            webPushExpired++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "expired",
              httpStatus: res.status || 410,
              errorMessage: "Subscription expired or revoked",
            }).catch(() => {});
          } else {
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "failed",
              httpStatus: res.status || 500,
              errorMessage: (res as any).errorText || "Push delivery failed",
            }).catch(() => {});
          }
        }
      }
    })
  );

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
  const pushTitle = `🚀 新询价单 #${params.inquiryNo} · ${params.vehicleModel || "Vehicle Inquiry"}`;
  const pushBody = `${params.creatorName} (${roleLabel}) 发起采购 ${params.quantity || 1} 台 (${params.tradeTerm || "FOB"})${params.destinationPort ? ` · 目的港: ${params.destinationPort}` : ""}${params.targetPrice ? ` · 目标价: $${params.targetPrice.toLocaleString()}` : ""}`;

  let telegramAttempted = 0;
  let telegramSent = 0;
  let webPushAttempted = 0;
  let webPushSent = 0;
  let webPushExpired = 0;

  const token = getTelegramBotToken(env);

  // Parallel dual-channel delivery to all admin & sales staff
  await Promise.allSettled(
    Array.from(recipientUserIds).map(async (userId) => {
      // Channel 1: Telegram
      const binding = await getTelegramUserBinding(db, userId).catch(() => null);
      if (binding?.chat_id) {
        telegramAttempted++;
        const tgDeviceInfo = `Telegram (${binding.telegram_username ? `@${binding.telegram_username}` : binding.first_name || `chat:${binding.chat_id}`})`;
        if (params.mockSendTelegram) {
          const ok = await params.mockSendTelegram(binding.chat_id, telegramText, portalUrl);
          if (ok) {
            telegramSent++;
            await recordNotificationLog(db, {
              channel: "telegram",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: tgDeviceInfo,
              destination: binding.chat_id,
              title: pushTitle,
              body: pushBody,
              status: "sent",
              httpStatus: 200,
            }).catch(() => {});
          } else {
            await recordNotificationLog(db, {
              channel: "telegram",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: tgDeviceInfo,
              destination: binding.chat_id,
              title: pushTitle,
              body: pushBody,
              status: "failed",
              httpStatus: 500,
              errorMessage: "Mock telegram dispatch rejected",
            }).catch(() => {});
          }
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
            if (data.ok) {
              telegramSent++;
              await recordNotificationLog(db, {
                channel: "telegram",
                recipientUserId: userId,
                inquiryNo: params.inquiryNo,
                deviceInfo: tgDeviceInfo,
                destination: binding.chat_id,
                title: pushTitle,
                body: pushBody,
                status: "sent",
                httpStatus: res.status,
              }).catch(() => {});
            } else {
              await recordNotificationLog(db, {
                channel: "telegram",
                recipientUserId: userId,
                inquiryNo: params.inquiryNo,
                deviceInfo: tgDeviceInfo,
                destination: binding.chat_id,
                title: pushTitle,
                body: pushBody,
                status: "failed",
                httpStatus: res.status,
                errorMessage: "Telegram API returned ok: false",
              }).catch(() => {});
            }
          } catch (err: any) {
            console.error(`[notifications] Telegram send failure for new inquiry to user ${userId}:`, err);
            await recordNotificationLog(db, {
              channel: "telegram",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: tgDeviceInfo,
              destination: binding.chat_id,
              title: pushTitle,
              body: pushBody,
              status: "failed",
              httpStatus: 500,
              errorMessage: err?.message || String(err),
            }).catch(() => {});
          }
        }
      }

      // Channel 2: PWA Web Push (Delivers to all active devices registered by this user)
      const pushSubscriptions = await getUserPushSubscriptions(db, userId);
      for (const sub of pushSubscriptions) {
        webPushAttempted++;
        const pwaDeviceInfo = sub.user_agent || "Browser PWA Client";
        if (params.mockSendWebPush) {
          const res = await params.mockSendWebPush(sub, {
            title: pushTitle,
            body: pushBody,
            url: portalUrl,
          });
          if (res.success) {
            webPushSent++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "sent",
              httpStatus: 200,
            }).catch(() => {});
          } else if (res.expired) {
            webPushExpired++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "expired",
              httpStatus: 410,
              errorMessage: "Subscription expired",
            }).catch(() => {});
          } else {
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "failed",
              httpStatus: 500,
              errorMessage: "Mock push delivery failed",
            }).catch(() => {});
          }
        } else {
          const res = await sendWebPushNotification(env, sub, {
            title: pushTitle,
            body: pushBody,
            url: portalUrl,
          });
          if (res.success) {
            webPushSent++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "sent",
              httpStatus: res.status || 200,
            }).catch(() => {});
          } else if (res.expired) {
            webPushExpired++;
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "expired",
              httpStatus: res.status || 410,
              errorMessage: "Subscription expired or revoked",
            }).catch(() => {});
          } else {
            await recordNotificationLog(db, {
              channel: "pwa_push",
              recipientUserId: userId,
              inquiryNo: params.inquiryNo,
              deviceInfo: pwaDeviceInfo,
              destination: sub.endpoint,
              title: pushTitle,
              body: pushBody,
              status: "failed",
              httpStatus: res.status || 500,
              errorMessage: (res as any).errorText || "Push delivery failed",
            }).catch(() => {});
          }
        }
      }
    })
  );

  return {
    telegramAttempted,
    telegramSent,
    webPushAttempted,
    webPushSent,
    webPushExpired,
  };
}
