const CACHE_NAME = "youguard-pwa-v3";
const PRECACHE_ASSETS = [
  "/favicon.ico",
  "/favicon.png",
  "/favicon.svg",
  "/logo.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Support external instant force-update signal
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Standard W3C Web Push Notification handler
self.addEventListener("push", (event) => {
  let data = {
    title: "Youguard Auto",
    body: "You have a new update regarding your vehicle quotation or order.",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
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

  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192.png",
    badge: data.badge || "/icons/icon-192.png",
    data: data.data || { url: "/portal" },
    vibrate: [100, 50, 100],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// Notification click -> focus or open target portal URL
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/portal";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only intercept GET requests
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // Never intercept API routes, dev sessions, or webhook paths
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Static Assets (Cache-First): Images, CSS, JS chunks, SVG icons
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/pic/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML / Page Navigation (Strict Network-First with Offline Cache Fallback)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/en")))
    );
  }
});
