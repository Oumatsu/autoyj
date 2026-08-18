# Youguard Auto Domain Model

## Core Concepts

### User & Identity
- **Customer**: African automotive dealers and business buyers sourcing EVs from China.
- **Sales Rep**: Internal Youguard trade specialists managing quotations, specs, and logistics.
- **Administrator**: Privileged internal operations users managing user accounts, permissions, and moderation.
- **Telegram Binding**: The 1:1 cryptographic link between a `portal_users` account and a Telegram `chat_id` via `/start bind_<userId>` for instant push notifications.
- **Push Subscription**: Standard W3C VAPID browser push registration for standalone PWA system notifications.

### Commercial Lifecycle
- **Inquiry**: A customer's formal vehicle sourcing request specifying brand, model, target trim, and quantity.
  - *Statuses*: `New Inquiry` → `Quoted` → `Accepted` / `Declined` → `Closed`.
- **Quotation**: Official pricing breakdown issued by sales, specifying trade terms (EXW, FOB, CIF), unit price, discounts, and expiration.
  - *Counter-offer*: Customer proposed price modification submitted for sales review.
- **Order**: A committed transaction created upon quotation acceptance.
  - *Statuses*: `Draft` → `Confirmed` → `Deposit Paid` → `In Production` → `Shipped` → `Customs Cleared` → `Delivered` (or `Cancelled`).
- **PDI (Pre-Delivery Inspection)**: Verified inspection checklist, photos, and battery health report generated before port loading.

### Technical & Platform Architecture
- **PWA (Progressive Web Application)**: A browser-installed standalone client designed for instantaneous quotation alerts, PDI report deliveries, and status tracking (prioritizing real-time network data over stale offline caches).
- **Vinext**: Next.js App Router compatible serverless runtime running on Cloudflare Workers and Vite.
