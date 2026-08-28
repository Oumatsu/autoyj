/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim } from "workbox-core";

declare let self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{ revision: string | null; url: string }>;
};

// Cleanup old caches from previous versions
cleanupOutdatedCaches();

// Precache all build assets injected by Workbox / VitePWA
precacheAndRoute(self.__WB_MANIFEST);

// Take control of uncontrolled clients immediately
self.skipWaiting();
clientsClaim();

// Listen for custom force skip-waiting message
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Standard Web Push Notification Handler
self.addEventListener("push", (event) => {
  const origin = self.location ? self.location.origin : "https://youguard.net";
  const defaultIcon = `${origin}/icons/icon-192.png`;

  let title = "🚗 Youguard Auto";
  let body = "You have a new update regarding your vehicle quotation or order.";
  let url = "/portal";
  let icon = defaultIcon;
  let badge = defaultIcon;

  let tag = `youguard-${Date.now()}`;
  if (event.data) {
    try {
      const payload = event.data.json();
      if (payload.title) title = payload.title;
      if (payload.body) body = payload.body;
      if (payload.tag) tag = payload.tag;
      else if (payload.inquiryNo) tag = `inq-${payload.inquiryNo}`;
      if (payload.data?.url) url = payload.data.url;
      else if (payload.url) url = payload.url;
      if (payload.icon) {
        icon = payload.icon.startsWith("http") ? payload.icon : `${origin}${payload.icon.startsWith("/") ? "" : "/"}${payload.icon}`;
      }
      if (payload.badge) {
        badge = payload.badge.startsWith("http") ? payload.badge : `${origin}${payload.badge.startsWith("/") ? "" : "/"}${payload.badge}`;
      }
    } catch {
      body = event.data.text() || body;
    }
  }

  // OS App Icon Badge synchronization
  if (typeof navigator !== "undefined" && "setAppBadge" in navigator) {
    try {
      (navigator as any).setAppBadge().catch(() => {});
    } catch {}
  }

  const options: NotificationOptions = {
    body,
    icon,
    badge,
    data: { url },
    tag,
  };

  const reportClientTelemetry = (success: boolean, errMsg?: string) => {
    if (typeof fetch === "function") {
      fetch("/api/portal/push/client-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          url,
          success,
          errorMessage: errMsg,
          userAgent: navigator.userAgent,
        }),
      }).catch(() => {});
    }
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => {
        reportClientTelemetry(true);
      })
      .catch((err) => {
        const errorDetail = err?.message || String(err);
        console.warn("[sw] Standard showNotification failed, retrying minimal options:", errorDetail);
        return self.registration
          .showNotification(title, { body, data: { url }, tag })
          .then(() => {
            reportClientTelemetry(true, `Fallback rendered after standard error: ${errorDetail}`);
          })
          .catch((fallbackErr) => {
            const fallbackDetail = fallbackErr?.message || String(fallbackErr);
            reportClientTelemetry(false, `All showNotification attempts failed: ${fallbackDetail}`);
          });
      })
  );
});

// Notification click -> focus existing tab or open URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Clear OS App Icon Badge on interaction
  if (typeof navigator !== "undefined" && "clearAppBadge" in navigator) {
    try {
      (navigator as any).clearAppBadge().catch(() => {});
    } catch {}
  }

  const rawUrl = (event.notification.data && event.notification.data.url) || "/portal";
  const origin = self.location ? self.location.origin : "https://youguard.net";
  const targetUrl = rawUrl.startsWith("http") ? rawUrl : `${origin}${rawUrl.startsWith("/") ? "" : "/"}${rawUrl}`;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("url" in client && client.url.includes("/portal") && "navigate" in client && "focus" in client) {
          return (client as WindowClient).navigate(targetUrl).then(() => (client as WindowClient).focus());
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
