/**
 * Client-side Web Push Utilities & Automatic Token Synchronization
 */

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function arrayBufferToBase64Url(buffer: ArrayBuffer | null): string {
  if (!buffer) return "";
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function getActiveServiceWorkerRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }
  try {
    const readyPromise = navigator.serviceWorker.ready;
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000));
    const reg = await Promise.race([readyPromise, timeoutPromise]);
    if (reg) return reg;

    const existing = await navigator.serviceWorker.getRegistration();
    if (existing) return existing;

    return await navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
  } catch {
    return null;
  }
}

export async function ensurePushSubscriptionSynced(forceRenew: boolean = false): Promise<{
  success: boolean;
  endpoint?: string;
  error?: string;
}> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    return { success: false, error: "Web Push is not supported in this browser environment" };
  }

  if (typeof Notification === "undefined" || Notification.permission !== "granted") {
    return { success: false, error: `Notification permission is ${typeof Notification !== "undefined" ? Notification.permission : "unavailable"}` };
  }

  try {
    const reg = await getActiveServiceWorkerRegistration();
    if (!reg || !reg.pushManager) {
      return { success: false, error: "Service Worker push manager unavailable" };
    }

    const keyRes = await fetch("/api/portal/push/public-key", { signal: AbortSignal.timeout(4000) });
    if (!keyRes.ok) {
      return { success: false, error: `Failed to fetch VAPID key (${keyRes.status})` };
    }
    const keyData = (await keyRes.json().catch(() => ({}))) as { publicKey?: string };
    if (!keyData.publicKey) {
      return { success: false, error: "VAPID public key payload is empty" };
    }

    let sub = await reg.pushManager.getSubscription().catch(() => null);
    if (sub) {
      const existingKeyBuf = sub.options?.applicationServerKey;
      let matches = !forceRenew;
      if (existingKeyBuf && !forceRenew) {
        const existingKeyB64 = arrayBufferToBase64Url(existingKeyBuf);
        matches = existingKeyB64 === keyData.publicKey;
      }
      if (!matches || forceRenew) {
        console.log("[push-client] Renewing push subscription with active VAPID key...");
        await sub.unsubscribe().catch(() => {});
        sub = null;
      }
    }

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
      });
    }

    const subJson = sub.toJSON();
    const saveRes = await fetch("/api/portal/push/subscribe", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subJson.endpoint,
        keys: subJson.keys,
        userAgent: navigator.userAgent,
      }),
    });

    const saveJson = (await saveRes.json().catch(() => ({}))) as { ok?: boolean };
    return {
      success: !!saveJson.ok,
      endpoint: subJson.endpoint,
    };
  } catch (err: any) {
    console.warn("[push-client] Automatic push subscription sync error:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}
