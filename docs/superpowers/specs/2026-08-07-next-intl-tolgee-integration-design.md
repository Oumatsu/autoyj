# next-intl + Tolgee Integration Design

## Decision

Use `next-intl` and Tolgee as complementary adapters with a single translation source:

- `next-intl` owns framework-facing locale concerns: route configuration, locale negotiation
  integration, localized navigation, request locale context, and localized metadata.
- Tolgee owns translation editing, in-context development tools, ICU message formatting, and
  client-side UI translation lookup.
- `i18n/translations/{zh,en,am}.ts` remains the checked-in bundle generated from Tolgee. Both
  adapters read these same modules; neither adapter owns a second message dictionary.

`next-intl` is a third-party Next.js integration, not a replacement for Tolgee or an official
Next.js runtime requirement. The project will not use `next-intl`'s `useTranslations` for page UI
while Tolgee remains the UI runtime.

## Current problem

The project already has working locale-prefixed routes, but the framework-facing behavior is
distributed across custom modules:

- `proxy.ts` detects locale from `NEXT_LOCALE`, `Accept-Language`, and `i18n/config.ts`.
- `i18n/LocaleLink.tsx` constructs locale-prefixed links.
- `i18n/utils.ts` parses the locale from the URL.
- `app/layout.tsx` updates `html[lang]` and font classes in a client-side script/effect.
- Only the root layout has metadata; localized pages do not consistently expose localized titles,
  descriptions, or `alternates.languages`.

Tolgee is already mounted through `components/TolgeeWrapper.tsx`, and `lib/tolgee.ts` loads the
same static bundles used by `i18n/useTranslation.ts`. The migration must preserve this behavior.

## Goals

- Keep `/zh/...`, `/en/...`, and `/am/...` URLs stable.
- Replace duplicated locale-routing and navigation conventions with the `next-intl` routing
  interface where it is compatible with the current `vinext` build.
- Add a localized `[locale]` layout seam that validates locale params and supplies localized
  metadata.
- Generate `hreflang`/alternate links for all supported locales and an `x-default` URL without
  duplicating locale lists.
- Preserve the portal/dashboard rule that bare portal URLs resolve to English.
- Keep production independent of a Tolgee server; production reads only the committed bundles.
- Keep Tolgee DevTools and in-context editing available during local development.

## Non-goals

- Do not replace Tolgee with `next-intl` message hooks.
- Do not add `NextIntlClientProvider` or a second client-side translation fallback chain.
- Do not introduce Tolgee runtime network requests in the Worker or production browser bundle.
- Do not rewrite the existing Tolgee key inventory in this migration.
- Do not migrate D1/Feishu content ownership or product data structures.
- Do not redesign page visuals or change the public URL shape.

## Architecture

### 1. Canonical routing configuration

Create a single `next-intl` routing definition containing `zh`, `en`, `am`, and default locale
`zh`. Refactor `i18n/config.ts` to expose the same values/types rather than maintaining a second
literal locale array. The routing configuration uses always-prefixed public URLs.

The existing `proxy.ts` remains the Worker/Next entry point. It keeps the current static/API
passthrough rules and the portal/dashboard English override, then delegates ordinary locale
resolution to the `next-intl` routing middleware. Cookie name and persistence behavior remain
compatible with `LOCALE_COOKIE_NAME`.

### 2. Localized route layout and navigation

Add `app/[locale]/layout.tsx` as the localized route seam. It validates the route parameter
against the canonical routing configuration, returns `notFound()` for unsupported locale
segments, and exposes `generateStaticParams()` for all supported locales. Existing page wrappers
remain intact; this change does not duplicate page implementations.

Adapt `i18n/LocaleLink.tsx` to the `next-intl` navigation adapter while preserving its current
public component interface. Existing call sites therefore gain consistent locale prefixing
without a repository-wide link rewrite. External URLs, already-localized URLs, query strings, and
hashes remain untouched.

### 3. Translation adapters

Tolgee remains the only UI translation adapter:

1. Tolgee exports are reviewed and committed to the three static TypeScript bundles.
2. `createTolgee()` loads those bundles for server and browser use.
3. `TolgeeWrapper` provides the client runtime and development DevTools.
4. `useTranslation()` remains the compatibility seam for current page code and its existing
   fallback behavior.

`next-intl` may load the same static bundles through its server request configuration only for
metadata helpers and request-locale context. No page component will call both Tolgee and
`next-intl` to resolve the same visible string. `i18n/data/specsData.ts` remains the existing
specialized fallback until a separate translation-source migration is approved.

### 4. Localized metadata and SEO

Create a small metadata module that maps a locale and page identity to title/description keys
from the shared static bundle. Localized layouts and page-level `generateMetadata()` functions
use this module; they do not fetch Feishu or call portal APIs.

Each localized page emits:

- a locale-specific `<title>` and description;
- `alternates.languages` entries for `zh`, `en`, and `am`;
- an `x-default` entry pointing to the default locale;
- the existing favicon and metadata base behavior.

Dynamic product, Academy, and Insights pages use their existing normalized slug/category helpers
to derive metadata keys and fall back to the localized generic page metadata when content is
missing. Metadata generation must never turn a missing translation into an empty document title.

### 5. Compatibility gate

Before changing route behavior, add the dependency and run a minimal spike against the actual
`vinext` build, Worker entry, proxy tests, and localized route rendering. The spike must confirm
that `next-intl` routing imports and its middleware adapter survive client, RSC, SSR, and
Cloudflare Worker builds.

If the middleware/plugin integration is incompatible with `vinext`, retain the current custom
`proxy.ts` implementation and use only the compatible `next-intl` routing/navigation/metadata
modules. Do not ship a dependency that makes `bun run build` or Worker deployment fail.

## Error handling and invariants

- Unsupported locale route segments produce a normal 404, not a fallback to Chinese.
- Bare paths redirect exactly once to `/<locale>/<path>`.
- Portal and dashboard bare paths continue to redirect to English.
- Static assets, API routes, and scheduled routes never receive locale redirects.
- Missing metadata keys use explicit localized fallback values and are logged by existing
  development diagnostics; they do not silently render a raw translation key.
- Tolgee export/pull validation remains unchanged and is the only way translation bundles are
  published.

## Validation

Add or update tests for:

- canonical locale configuration and `next-intl` routing;
- cookie/Accept-Language/default precedence;
- portal/dashboard English override;
- static/API passthrough and no redirect loops;
- localized navigation for internal, localized, external, query, and hash links;
- unsupported locale 404 behavior;
- metadata titles, descriptions, `languages`, and `x-default` for all three locales;
- static bundle parity between Tolgee and metadata adapters.

Run the existing validation commands:

```text
bun run test
bun run lint
bun run knip
bun run build
```

The migration is complete only when all existing route traversal and localized journey tests
continue to pass and the Worker production bundle remains independent of a Tolgee server.

## Rollout

Implement in small commits:

1. Compatibility spike and canonical routing module.
2. Proxy and navigation adapter migration.
3. Localized layout and metadata/SEO helpers.
4. Route/test cleanup and documentation.

Do not remove the old custom locale helpers until the new routing and metadata tests pass. Remove
only code that is proven to be replaced, and keep the Tolgee static-bundle publish workflow
unchanged.
