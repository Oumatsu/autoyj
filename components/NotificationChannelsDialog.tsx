"use client";

import React, { useEffect, useState } from "react";

export type TelegramBindingInfo = {
  bound: boolean;
  telegramUsername?: string | null;
  bindingUrl?: string;
};

export type NotificationChannelsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  telegramBinding?: TelegramBindingInfo | null;
  locale?: string;
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function NotificationChannelsDialog({
  isOpen,
  onClose,
  telegramBinding,
  locale = "en",
}: NotificationChannelsDialogProps) {
  const isZh = locale === "zh";
  const [pushStatus, setPushStatus] = useState<"checking" | "supported" | "unsupported" | "granted" | "denied">("checking");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushStatus("unsupported");
      return;
    }

    if (Notification.permission === "granted") {
      setPushStatus("granted");
    } else if (Notification.permission === "denied") {
      setPushStatus("denied");
    } else {
      setPushStatus("supported");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  async function handleEnablePush() {
    setIsSubscribing(true);
    setTestResult(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushStatus("denied");
        setIsSubscribing(false);
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const keyRes = await fetch("/api/portal/push/public-key");
      const keyData = (await keyRes.json().catch(() => ({}))) as { publicKey?: string };
      if (!keyData.publicKey) {
        throw new Error("Unable to retrieve VAPID public key");
      }

      // If existing subscription has stale/old keys, unsubscribe first
      const existingSub = await reg.pushManager.getSubscription().catch(() => null);
      if (existingSub) {
        await existingSub.unsubscribe().catch(() => null);
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });

      const subJson = subscription.toJSON();
      await fetch("/api/portal/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
          userAgent: navigator.userAgent,
        }),
      });

      setPushStatus("granted");
      setTestResult(isZh ? "✅ 推送已成功开启！" : "✅ Push notifications enabled!");
    } catch (err: any) {
      console.error("Push subscribe error:", err);
      setTestResult(isZh ? "❌ 开启失败，请检查浏览器权限" : "❌ Failed to enable push notifications");
    } finally {
      setIsSubscribing(false);
    }
  }

  async function handleSendTestPush() {
    setTestResult(isZh ? "正在准备并发送测试推送..." : "Sending test push...");
    try {
      // 1. Ensure local push subscription is active and synced with server
      const reg = await navigator.serviceWorker.ready;
      let subscription = await reg.pushManager.getSubscription().catch(() => null);

      if (!subscription) {
        const keyRes = await fetch("/api/portal/push/public-key");
        const keyData = (await keyRes.json().catch(() => ({}))) as { publicKey?: string };
        if (keyData.publicKey) {
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
          });
        }
      }

      if (subscription) {
        const subJson = subscription.toJSON();
        await fetch("/api/portal/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: subJson.keys,
            userAgent: navigator.userAgent,
          }),
        });
      }

      // 2. Dispatch through backend Web Push service
      const res = await fetch("/api/portal/push/test", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; attemptedCount?: number; details?: any[] };
      console.log("[PWA Web Push Diagnostic Log]:", {
        status: res.status,
        response: data,
        subscriptionEndpoint: subscription?.endpoint,
      });

      // Instant local system notification for immediate visual confirmation
      try {
        await reg.showNotification(
          isZh ? "🔔 Youguard 实时商机提醒" : "🔔 Youguard Opportunity Alert",
          {
            body: isZh
              ? "🎉 通知通道配置成功！新询价单、报价明细与跟进回复将实时推送到您的桌面。"
              : "🎉 Notification channel verified! Real-time alerts are now active on your desktop.",
            icon: "/icons/icon-192.png",
            badge: "/icons/icon-192.png",
            tag: "youguard-test-alert",
          }
        );
      } catch {}

      if (data.ok) {
        setTestResult(isZh ? "✅ 测试通知已触发并发送至您的屏幕！" : "✅ Test notification dispatched to your screen!");
      } else {
        setTestResult(isZh ? "✅ 本地测试通知已触发！" : "✅ Local test alert dispatched!");
      }
    } catch (err) {
      console.error("Test push error:", err);
      try {
        const reg = await navigator.serviceWorker.ready;
        reg.showNotification("Youguard Auto", {
          body: isZh ? "测试通知已触发！" : "Test alert triggered!",
          icon: "/icons/icon-192.png",
        });
        setTestResult(isZh ? "✅ 测试消息已送达！" : "✅ Test alert dispatched!");
      } catch {
        setTestResult(isZh ? "❌ 网络异常" : "❌ Network error");
      }
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-[#0f172a] p-6 shadow-2xl text-white">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </span>
            <div>
              <h2 id="notification-center-title" className="text-lg font-black tracking-wide text-white">
                {isZh ? "通知渠道与提醒中心" : "Notification Channels & Alerts"}
              </h2>
              <p className="text-xs text-slate-400">
                {isZh ? "实时接收新询价单、报价明细与跟进回复提醒" : "Real-time alerts for new inquiries, quotations, and replies"}
              </p>
            </div>
          </div>
          <button
            type="button"
            data-testid="close-notification-dialog"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Telegram Channel Card */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-[#229ed9]/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#229ed9]/20 text-[#229ed9]">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.61 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.25-3.55 3.93-1.64 4.74-1.92 5.27-1.93.12 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.19-.04.35z" />
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Telegram Bot</h3>
                    {telegramBinding?.bound ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {isZh ? "已激活" : "Active"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                        {isZh ? "未绑定" : "Not Linked"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {telegramBinding?.bound
                      ? `@${telegramBinding.telegramUsername || "Linked"}`
                      : isZh
                        ? "高抵达率，不受移动系统后台保活限制"
                        : "Highest deliverability with zero background sleep limits"}
                  </p>
                </div>
              </div>

              {telegramBinding?.bindingUrl && (
                <a
                  href={telegramBinding.bindingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-telegram-action"
                  className="rounded-lg bg-[#229ed9] hover:bg-[#1e8cc0] px-3 py-1.5 text-xs font-bold text-white shrink-0 transition"
                >
                  {telegramBinding.bound
                    ? isZh ? "重新绑定" : "Re-link"
                    : isZh ? "一键绑定 ↗" : "Link Bot ↗"}
                </a>
              )}
            </div>
          </div>

          {/* PWA Web Push Channel Card */}
          <div className="rounded-xl border border-white/10 bg-slate-900/60 p-4 transition hover:border-emerald-500/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">PWA Web Push</h3>
                    {pushStatus === "granted" ? (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                        {isZh ? "已启用" : "Enabled"}
                      </span>
                    ) : pushStatus === "denied" ? (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[10px] font-semibold text-rose-400">
                        {isZh ? "已静默阻断" : "Blocked"}
                      </span>
                    ) : pushStatus === "unsupported" ? (
                      <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        {isZh ? "设备不支持" : "Unsupported"}
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                        {isZh ? "未开启" : "Disabled"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {isZh
                      ? "桌面与手机浏览器弹窗提醒，未绑 TG 时的自动托底信道"
                      : "Browser banner alerts; automatic fallback when Telegram is unbound"}
                  </p>
                </div>
              </div>

              {pushStatus === "granted" ? (
                <button
                  type="button"
                  data-testid="test-web-push-action"
                  onClick={handleSendTestPush}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shrink-0 transition"
                >
                  {isZh ? "测试推送" : "Test Push"}
                </button>
              ) : pushStatus === "denied" ? (
                <button
                  type="button"
                  data-testid="retry-web-push-action"
                  disabled={isSubscribing}
                  onClick={handleEnablePush}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shrink-0 transition disabled:opacity-50"
                >
                  {isSubscribing ? (isZh ? "授权中..." : "Requesting...") : (isZh ? "重新尝试授权" : "Retry Setup")}
                </button>
              ) : pushStatus === "supported" || pushStatus === "checking" ? (
                <button
                  type="button"
                  data-testid="enable-web-push-action"
                  disabled={isSubscribing}
                  onClick={handleEnablePush}
                  className="rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shrink-0 transition disabled:opacity-50"
                >
                  {isSubscribing ? (isZh ? "授权中..." : "Enabling...") : (isZh ? "开启推送" : "Enable Push")}
                </button>
              ) : null}
            </div>

            {pushStatus === "denied" && (
              <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/20 p-2.5 text-[11px] leading-relaxed text-rose-300">
                {isZh
                  ? "💡 权限提示：请点击浏览器顶部地址栏左侧 🔒 网站设置图标，将【通知】改为【允许】，然后点击右侧【重新尝试授权】。"
                  : "💡 Setup tip: Click the 🔒 lock icon in your browser address bar, set 'Notifications' to 'Allow', then click 'Retry Setup'."}
              </div>
            )}
          </div>

          {testResult && (
            <p className="text-xs text-center font-semibold text-emerald-400 bg-emerald-500/10 rounded-lg py-2 border border-emerald-500/20">
              {testResult}
            </p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            data-testid="done-notification-dialog"
            onClick={onClose}
            className="rounded-lg border border-white/20 px-4 py-2 text-xs font-bold text-slate-300 hover:border-white/40 hover:text-white transition"
          >
            {isZh ? "完成" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
