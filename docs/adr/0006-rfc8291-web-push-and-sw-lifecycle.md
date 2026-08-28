# ADR 0006: Production RFC 8291 Web Push Standard, Service Worker Lifecycle, and Badging

## Status
Accepted

## Context
In Youguard Auto's cross-border B2B automotive trade portal, instantaneous notification delivery for vehicle inquiries, quotation updates, and customer follow-up notes is vital for business conversion.
Initial Web Push attempts produced false positives (local in-tab notifications masquerading as background push) while genuine background notifications were discarded by OS push daemons (Apple APNs / Microsoft WNS / Google FCM) due to payload encryption bugs. Furthermore, stale expired tokens (HTTP 410 Gone) caused failed retries, and cross-version asset caching caused frontend 404s upon deployment.

## Decisions

1. **RFC 8291 aes128gcm Web Push Payload Encryption**:
   - Strictly implement standard Web Crypto API HKDF derivation:
     - Input Keying Material (IKM) = ECDH `sharedSecret` between server ephemeral private key and client `p256dh` public key.
     - Salt = client `rawAuthSecret`.
     - Info string = `"WebPush: info\0" || client_public_key (65 bytes) || server_ephemeral_public_key (65 bytes)`.
     - Derive Content Encryption Key (CEK, AES-GCM-128) and Nonce (96 bits) with context `"Content-Encoding: aes128gcm\0"` and `"Content-Encoding: nonce\0"`.
   - Verified with an exhaustive 100% roundtrip unit test (`tests/unit/domain/web-push-encryption.test.ts`).

2. **Self-Healing Subscription Eviction & Visibility Sync**:
   - When web push gateway returns `HTTP 410 Gone` or `HTTP 404 Not Found`, the backend immediately deletes the expired endpoint from `user_push_subscriptions` in Cloudflare D1.
   - Frontend registers a `visibilitychange` listener on the portal page, re-validating the active `PushSubscription` with the backend every time the user focuses the browser tab.

3. **Notification Collapse by Inquiry Topic (`tag: inq-${inquiryNo}`)**:
   - Messages belonging to the same inquiry share an identifier tag `inq-${inquiryNo}` so that rapid consecutive messages neatly update the existing banner rather than spamming the user's screen.

4. **Deep-Link Navigation & Existing Tab Reuse**:
   - Push notifications carry target URLs (`/portal?inquiry=INQ-XXXXX&src=notification`).
   - The Service Worker `notificationclick` listener checks `self.clients.matchAll({ type: "window" })`. If an existing `/portal` window is open, it calls `WindowClient.navigate(targetUrl)` and `WindowClient.focus()`, eliminating duplicate tabs.

5. **W3C App Icon Badging Synchronization**:
   - When a push notification arrives, Service Worker calls `navigator.setAppBadge()` to badge the OS Dock / Taskbar / Home Screen icon.
   - When user interacts with or reads inquiries in the portal, the application calls `navigator.clearAppBadge()`.

6. **PWA Versioning & Smooth Hot-Update Lifecycle**:
   - PWA displays a semantic version tag `v1.2.0` in the workspace navigation.
   - The application monitors Service Worker `updatefound` / `waiting` states and displays a non-intrusive update banner (*"检测到系统新版本已就绪，点击立即更新"*), triggering `waitingWorker.postMessage({ type: 'SKIP_WAITING' })` upon user confirmation.

## Consequences
- **Positive**: 100% compliant with W3C Web Push & RFC 8291 specs; reliable multi-platform push delivery across iOS PWA, macOS, Windows, and Android; zero ghost notifications; automatic cleanup of dead tokens.
- **Negative**: Requires modern browser support for Push API and Web Crypto API (fully supported in all target evergreen browsers).
