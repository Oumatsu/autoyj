# Youguard Auto Domain Model

## Core Concepts

### User & Identity
- **Customer**: African automotive dealers and business buyers sourcing EVs from China.
- **Sales Rep**: Internal Youguard trade specialists managing quotations, specs, and logistics.
- **Administrator**: Privileged internal operations users managing user accounts, permissions, and moderation.
- **Telegram Binding**: The 1:1 cryptographic link between a `portal_users` account and a Telegram `chat_id` via `/start bind_<userId>` for instant push notifications.
- **Push Subscription**: Standard W3C VAPID browser push registration for standalone PWA system notifications.

### Commercial Lifecycle
- **Inquiry Topic**: The shared discussion subject for a vehicle sourcing need. It contains comments and can group multiple Inquiry Requests, but does not store a request's vehicle, quantity, price, or cancellation state.
- **Inquiry Request**: One structured vehicle purchase request submitted under an Inquiry Topic. It identifies the requested brand, model, trim, color, quantity, destination, role-specific FOB estimated price, and editable contact-information snapshot. It is visible only to its submitter, Administrators, and Sales Reps; only its submitter can permanently delete it. Deleting an Inquiry Request does not delete its Inquiry Topic or comments.
- **Public Contact Submission**: A general website contact lead. It is not a vehicle-sourcing Inquiry and must not be represented as a quotation, vehicle request, or repair-service project.
- **Quotation**: Official pricing breakdown issued by Sales Reps or Administrators, specifying trade terms (EXW, FOB, CIF), unit price, discounts, and expiration. A Quotation can combine multiple vehicle line items.
  - *Counter-offer*: Customer proposed price modification submitted for sales review.
- **Order**: A committed transaction created upon quotation acceptance.
  - *Statuses*: `Draft` → `Confirmed` → `Deposit Paid` → `In Production` → `Shipped` → `Customs Cleared` → `Delivered` (or `Cancelled`).
- **PDI (Pre-Delivery Inspection)**: Verified inspection checklist, photos, and battery health report generated before port loading.

### Technical & Platform Architecture
- **PWA (Progressive Web Application)**: A browser-installed standalone client designed for instantaneous quotation alerts, PDI report deliveries, and status tracking (prioritizing real-time network data over stale offline caches).
- **Vinext**: Next.js App Router compatible serverless runtime running on Cloudflare Workers and Vite.
- **Telegram Notification Engine**:
  - *Inquiry Participant Broadcast*: Whenever a reply, quote update, or counteroffer occurs on an Inquiry, all bound Telegram users who belong to that single inquiry (creator, participants, previous commenters, and assigned quoters) receive an instant notification with direct Portal link (excluding the author).
  - *Internal Note Safeguard*: Internal notes (`is_public: false`) strictly notify only internal staff (`admin`/`sales`) associated with the inquiry, preventing sensitive cost/supplier leakages to customers or partners.
  - *New Inquiry Staff Radar*: When a new inquiry is started by a customer or partner, all internal staff with bound Telegram accounts immediately receive a push alert with full specifications and a direct link to quote.
