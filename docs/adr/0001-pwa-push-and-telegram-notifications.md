# ADR 0001: PWA Standards, Icon Strategy, and Dual-Channel Notifications

## Status
Accepted

## Context
Youguard Auto serves African automobile dealers and B2B buyers sourcing Chinese electric vehicles. Timely notification of official quotation updates, vehicle arrivals, and PDI inspection reports is critical.

Earlier iterations presented conflicting signals:
1. PWA install prompts emphasized "offline browsing" rather than instant transaction alerts.
2. Icons were distorted due to non-square SVG banners and missing maskable safe-zones on Android.
3. Webpack-dependent PWA frameworks (`next-pwa`) conflict with the Edge / Vinext (Vite + Cloudflare Workers) build pipeline.

## Decisions

1. **Native Web Standards Over Third-Party Webpack Plugins**:
   - Use standard W3C Web App Manifest (`public/manifest.webmanifest`), HTML `<head>` metadata, and custom native Service Worker (`public/sw.js`).
   - For Vite-only standalone builds, `vite-plugin-pwa` is the recognized standard; however, inside the Next.js App Router on Cloudflare Workers (`vinext`), native Web Standards provide the cleanest zero-dependency edge compatibility.

2. **Dual-Channel Proactive Notification Architecture**:
   - **Telegram Bot Channel**: Instant, high-deliverability alerts via webhook (`/start bind_<userId>`) bypassing iOS/Android background execution throttles.
   - **PWA Web Push Channel**: Standard VAPID / Web Push notification with `push` and `notificationclick` handlers opening target portal URLs directly from OS banner notifications.

3. **Matrix Icon Strategy**:
   - **High-DPI Web Favicon**: Prioritize 1:1 vector `logo.svg`.
   - **Android / WebAPK**: Standardized 1:1 raster PNGs (`icon-192.png`, `icon-512.png`, and `maskable-icon-512.png` with 20% safe margin).
   - **iOS Home Screen**: Opaque 180x180 `apple-touch-icon.png` on brand `#0b1425` background.

4. **Network-First Data Integrity**:
   - HTML navigations and `/api/` endpoints operate on a strict Network-First strategy to ensure buyers never view stale quotations or expired vehicle stock.

## Consequences
- Zero webpack build breakage on Cloudflare Workers.
- Crisp, un-distorted icons across iOS, Android, and desktop browsers.
- Clear value proposition in user installation prompts.
