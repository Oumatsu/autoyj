# Post-refactor UI regression repair design

## Problem

The Feishu-to-D1 refactor changed data shapes and request boundaries without preserving the
pre-refactor view contracts. Public pages now lose fields when D1 contains sparse rows, dynamic
images can become route-relative URLs or 404 gallery paths, and unknown slugs can display the
first unrelated item. The cron can also delete good content after a failed or empty Feishu
response, while portal/auth handlers still contain request-time Feishu assumptions.

The repair must restore the existing page structure from the pre-refactor commits while keeping
the new architecture: Tolgee owns editable user-facing translations, Feishu is accessed only by
scheduled synchronization, and website requests read D1 or verified local baselines.

## Scope

The scope includes all localized public routes, dynamic product/insight/academy routes, shared
chrome and forms, `/portal`, `/dashboard`, the public API handlers, D1 repositories, and the
scheduled synchronization path. Existing user changes in the worktree are preserved.

## Chosen approach

Use a typed D1 public-content repository with static-manifest fallback:

1. Read D1 rows through typed repository functions.
2. Normalize identity, categories, JSON fields, status, dates, and image URLs.
3. Overlay valid D1 values onto the existing static product/article/academy baseline by stable
   slug.
4. Return the complete shapes already consumed by views.
5. Return 404 for unknown dynamic slugs rather than substituting the first baseline item.

This is preferred over page-by-page patches because it creates one stable seam between database
schema and UI, and over reverting to static pages because it preserves D1 as the website data
source.

## Architecture

### Public content repository

Create `server/db/public-content.ts` with functions:

- `listPublicProducts(db)`
- `getPublicProduct(db, slug)`
- `listPublicInsights(db)`
- `getPublicInsight(db, slug)`
- `listPublicAcademy(db)`
- `getPublicAcademyLesson(db, category, slug)`

The module owns D1 row parsing and fallback merging. It exports card/detail contracts aligned
with `app/products/_VehicleDetail.tsx`, `views/insights.tsx`, and academy views. Views never
interpret raw D1 columns.

### Normalization

Create `lib/content-normalizers.ts` for:

- canonical product slugs;
- `revenue-king`, `elite-flagship`, and `utility-pro` category aliases;
- typed JSON parsing;
- non-empty scalar selection;
- local/trusted asset URL validation.

Raw values such as `hero.webp`, Feishu download URLs, and route-relative paths are never emitted
as public image sources.

### Asset resolution

Extend `lib/static-assets.ts` to be the only resolver for dynamic public images. Vehicle covers
and galleries use explicit verified manifest entries. Academy and insight images use slug maps and
verified fallbacks. Gallery generation never assumes `/1.webp`, `/2.webp`, or `/3.webp` exists;
each emitted path must exist in `public/pic`.

### API and request boundary

Public API handlers call only the repository and return normalized contracts. List endpoints may
use the static baseline when D1 is empty. Detail endpoints return `404` for unknown identities.
Contact POST is explicitly routed, validated, and persisted to D1.

Normal request handlers must not call Feishu helpers or construct Feishu auth clients. This
includes public content, catalog, login, inquiry, quote, negotiation, and order paths. A protected
manual sync trigger may invoke the same cron function but is never required by a page request.

### Sync safety

Cron groups fetch, validate, and stage source rows before changing live D1 data. Unexpected empty
sources and transport/auth errors preserve last-good rows. Accepted rows are upserted and stale
IDs deleted through an atomic D1 statement batch. Cache invalidation occurs only after the group
commits, and sync status/counts are logged (and stored when the portal needs a last-success time).

The login query joins `user` to `account.password`, matching `server/db/schema.sql`; it does not
query legacy `access_code` or `password_hash` columns.

### Tolgee

User-facing repaired copy—loading, errors, empty states, not-found states, submit states, and
portal sync status—is represented by keys in `i18n/translations/zh.ts`, `en.ts`, and `am.ts`.
Static bundles remain an SSR/offline fallback, while Tolgee is the editable source used by the
local server at port 8085. Product names, brand names, and technical units remain data values.

## Page behavior

- Home, products, solutions, about, company, markets, legal, QR, and shared chrome retain their
  pre-refactor layout and use verified static assets.
- Product overview and category pages use normalized cards, preserve curated order/filter/sort
  behavior, and merge sparse D1 rows with the matching static model.
- Product detail receives a complete `DetailData` contract, uses verified cover/gallery paths,
  and displays a not-found state for an unknown slug.
- Insight and academy lists use normalized images and metadata. Detail pages never fall back to
  another article/lesson.
- Contact uses one submit handler, names every field, persists all submitted values to D1, and
  renders translated success/error state.
- Portal/dashboard preserve role-specific layout, price visibility, and actions while reading
  catalog, session, inquiry, quote, negotiation, and order data from D1 only.

## Error handling

Malformed JSON is logged with source/table context and mapped to typed empty fields; it must not
crash the page or produce a success-shaped response. Database failures return an explicit API
error and a translated UI error state. Empty or unavailable sync data displays a translated
temporary-unavailable state while preserving the last valid D1 rows. Image load failures use a
single verified local fallback and do not retry indefinitely.

## Validation

Unit tests cover normalizers, asset existence, public contract merging, not-found behavior, and
sync preservation. Integration tests cover D1-only public handlers, contact persistence, login
schema, role-based prices, and transactional portal paths. Playwright covers all three locales,
dynamic product/insight/academy routes, not-found pages, rendered `<img>` and CSS image URLs, and
translation leakage. Existing `bun run test`, `bun run check`, `bun run lint`, `bun run build`, and
`bun run test:e2e` remain the final gates.

## Acceptance criteria

1. Every localized route preserves its existing major sections and interactions.
2. Sparse D1 rows do not create blank cards, missing detail sections, wrong categories, or wrong
   article/lesson content.
3. Every emitted local image returns HTTP 200; no route-relative `hero.webp` survives.
4. Unknown dynamic slugs return 404/not-found UI.
5. Failed or empty Feishu fetches do not erase valid D1 content.
6. No normal request path calls Feishu.
7. Login and portal role/price behavior matches the existing contract using D1 schema fields.
8. Tolgee remains editable on `localhost:8085` and unavailable Tolgee connectivity does not blank
   the rendered UI.
