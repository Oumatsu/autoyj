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
  const origin = self.location ? self.location.origin : "";
  const defaultIcon = origin ? `${origin}/icons/icon-192.png` : "/icons/icon-192.png";

  let data = {
    title: "🚗 Youguard Auto",
    body: "You have a new update regarding your vehicle quotation or order.",
    icon: defaultIcon,
    badge: defaultIcon,
    data: { url: "/portal" },
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text();
    }
  }

  const iconUrl = data.icon && data.icon.startsWith("http") ? data.icon : (origin ? `${origin}${data.icon.startsWith("/") ? "" : "/"}${data.icon}` : defaultIcon);

  const options: NotificationOptions = {
    body: data.body,
    icon: iconUrl,
    badge: iconUrl,
    data: data.data || { url: "/portal" },
    requireInteraction: true,
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click -> focus existing tab or open URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || "/portal";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("navigate" in client && "focus" in client) {
          return (client as WindowClient).navigate(targetUrl).then(() => (client as WindowClient).focus());
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
