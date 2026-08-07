# next-intl + Tolgee Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `next-intl` for locale routing, navigation, request locale context, and localized SEO while keeping Tolgee as the only UI translation runtime and translation editing source.

**Architecture:** A single `i18n/routing.ts` defines supported locales and default locale. `proxy.ts`, localized navigation, and the `[locale]` layout consume that definition through `next-intl`. Tolgee continues to load the checked-in `i18n/translations/{zh,en,am}.ts` bundles for UI strings; server metadata uses the same bundles through the `next-intl` request adapter, so no second message source is introduced.

**Tech Stack:** Next.js 16, vinext, `next-intl`, Tolgee React/Core, Cloudflare Workers, Bun Test, Playwright, TypeScript.

---

## File map

Create:

- `i18n/routing.ts` — the one `next-intl` routing definition.
- `i18n/request.ts` — server request-locale and shared static message adapter.
- `i18n/metadata.ts` — localized metadata and alternate URL construction.
- `app/[locale]/layout.tsx` — locale validation and static locale params.
- `tests/unit/i18n-routing.test.ts` — routing configuration contract tests.
- `tests/unit/i18n-metadata.test.ts` — metadata and alternate URL tests.
- `tests/unit/locale-link.test.tsx` — localized navigation adapter tests.

Modify:

- `package.json`, `bun.lock` — add the peer-compatible `next-intl` dependency.
- `i18n/config.ts` — re-export locale values/types from `i18n/routing.ts`.
- `proxy.ts` — preserve API/static passthrough and portal special handling while delegating normal locale resolution to `next-intl`.
- `i18n/LocaleLink.tsx` — adapt the existing public component to `next-intl` navigation.
- `app/layout.tsx` — keep global fonts/chrome while moving locale metadata responsibility to the localized route tree.
- every localized page wrapper under `app/[locale]/` — add page-specific `generateMetadata` using `i18n/metadata.ts`.
- `i18n/translations/{zh,en,am}.ts` — add the `seo` key namespace through the existing Tolgee bundle workflow.
- `README.md` — document routing ownership, metadata behavior, and the Tolgee/next-intl seam.
- `tests/unit/proxy-i18n-locale.test.ts` and `tests/e2e/localized-journey.spec.ts` — assert the unchanged routing contract.

Delete only after replacement tests pass:

- the custom Accept-Language resolution implementation in `proxy.ts`;
- locale-prefix construction logic inside `i18n/LocaleLink.tsx`;
- any now-unused locale helpers or imports reported by Knip.

## Task 1: Running compatibility spike

**Files:**

- Modify: `package.json`, `bun.lock`
- Create: `i18n/routing.ts`, `i18n/request.ts`
- Create: `tests/unit/i18n-routing.test.ts`
- Modify: `vite.config.ts` only if the spike proves the package needs an explicit Vite/vinext alias

- [ ] **Step 1: Add the dependency with the package manager**

Run:

```bash
bun add next-intl
```

Expected: `package.json` contains `next-intl` under `dependencies`, `bun.lock` records the
resolved version, and the install reports a peer-compatible `next` version.

- [ ] **Step 2: Write the routing contract test**

Create `tests/unit/i18n-routing.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { defaultLocale, locales, routing } from "../../i18n/routing";

describe("i18n routing contract", () => {
  test("uses the three public locales and English as the default", () => {
    expect(routing.locales).toEqual(["zh", "en", "am"]);
    expect(routing.defaultLocale).toBe("en");
    expect(locales).toEqual(routing.locales);
    expect(defaultLocale).toBe(routing.defaultLocale);
  });

  test("always emits locale-prefixed public URLs", () => {
    expect(routing.localePrefix).toBe("always");
  });
});
```

- [ ] **Step 3: Run the new test before implementing the module**

Run:

```bash
bun test tests/unit/i18n-routing.test.ts
```

Expected: FAIL because `i18n/routing.ts` and its exports do not exist yet.

- [ ] **Step 4: Implement the canonical routing module**

Create `i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["zh", "en", "am"],
  defaultLocale: "en",
  localePrefix: "always",
});

export const locales = routing.locales;
export type Locale = (typeof locales)[number];
export const defaultLocale = routing.defaultLocale;

export function isLocale(value: string | undefined): value is Locale {
  return value ? locales.includes(value as Locale) : false;
}
```

Refactor `i18n/config.ts` to import `defaultLocale`, `locales`, and `Locale` from
`./routing`, then keep only `localeLabels` in that file:

```ts
import { defaultLocale, locales, type Locale } from "./routing";

export { defaultLocale, locales };
export type { Locale };

export const localeLabels: Record<
  Locale,
  { name: string; flag: string; code: string; dir: "ltr" | "rtl" }
> = {
  zh: { name: "中文", flag: "🇨🇳", code: "ZH", dir: "ltr" },
  en: { name: "English", flag: "🇬🇧", code: "EN", dir: "ltr" },
  am: { name: "አማርኛ", flag: "🇪🇹", code: "AM", dir: "ltr" },
};
```

- [ ] **Step 5: Add the shared server request adapter**

Create `i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { isLocale, routing } from "./routing";
import { translations } from "./translations";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : routing.defaultLocale;

  return {
    locale,
    messages: translations[locale],
  };
});
```

This adapter is server-only. It must not initialize a second client provider or make a network
request to Tolgee.

- [ ] **Step 6: Run the spike build and routing tests**

Run:

```bash
bun test tests/unit/i18n-routing.test.ts
bun run build
```

Expected: both commands pass. If vinext cannot resolve `next-intl/server` or the request adapter,
record the exact error, remove `i18n/request.ts` from the compatibility slice, keep
`i18n/routing.ts`, and implement metadata with the static bundle helper in Task 4 without adding
a `next.config.ts` plugin. Do not proceed with a broken build. In that fallback branch,
`next-intl` still owns routing/navigation while the metadata helper directly reads the same
Tolgee-generated bundles.

- [ ] **Step 7: Commit the compatibility slice**

```bash
git add package.json bun.lock i18n/routing.ts i18n/request.ts i18n/config.ts tests/unit/i18n-routing.test.ts
git commit -m "feat: add canonical next-intl routing"
```

## Task 2: Migrating proxy locale resolution

**Files:**

- Modify: `proxy.ts`
- Modify: `tests/unit/proxy-i18n-locale.test.ts`
- Modify: `tests/e2e/localized-journey.spec.ts`

- [ ] **Step 1: Add pure helper tests for paths that must bypass next-intl**

Extend `tests/unit/proxy-i18n-locale.test.ts` with assertions for exported helpers:

```ts
import { isLocaleProxySkipPath, isPortalLocaleOverridePath } from "@/proxy";

describe("proxy ownership boundaries", () => {
  test("skips API, scheduled, Next internals, and static assets", () => {
    for (const path of [
      "/api/portal/session",
      "/__scheduled",
      "/_next/static/chunk.js",
      "/images/hero.webp",
      "/favicon.ico",
    ]) {
      expect(isLocaleProxySkipPath(path)).toBe(true);
    }
  });

  test("keeps bare portal and dashboard paths on the English override", () => {
    expect(isPortalLocaleOverridePath("/portal")).toBe(true);
    expect(isPortalLocaleOverridePath("/portal/vehicle_models")).toBe(true);
    expect(isPortalLocaleOverridePath("/dashboard")).toBe(true);
    expect(isPortalLocaleOverridePath("/products")).toBe(false);
  });
});
```

- [ ] **Step 2: Run the new proxy tests before changing implementation**

Run:

```bash
bun test tests/unit/proxy-i18n-locale.test.ts
```

Expected: FAIL because the two pure helpers are not exported yet.

- [ ] **Step 3: Wrap next-intl middleware without changing special paths**

In `proxy.ts`, import `createMiddleware` and the canonical `routing`, then define:

```ts
const nextIntlProxy = createMiddleware(routing);

export function isLocaleProxySkipPath(pathname: string): boolean {
  return (
    pathname === "/__scheduled" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    /\.[a-z0-9]+$/i.test(pathname)
  );
}

export function isPortalLocaleOverridePath(pathname: string): boolean {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/portal" ||
    pathname.startsWith("/portal/")
  );
}
```

The `proxy` function must:

1. return `NextResponse.next()` for `isLocaleProxySkipPath`;
2. preserve the existing `/portal` and `/dashboard` redirect to `/en/...`, including the
   `LOCALE_COOKIE_NAME` and one-year cookie settings;
3. return `nextIntlProxy(request)` for all other paths.

Do not retain a second Accept-Language parser or a second cookie/default resolution chain after
the next-intl middleware is active. Keep `config.matcher` broad enough for next-intl to see page
paths and keep the explicit runtime skip list for assets/API routes.

- [ ] **Step 4: Update unit tests to test the actual ownership split**

Keep tests for the existing `getLocaleFromAcceptLanguage` only if it remains an exported
compatibility helper. Otherwise remove those tests and assert next-intl behavior through E2E.
Retain tests for:

- valid locale prefixes;
- invalid locale fallback through the middleware;
- cookie precedence;
- Accept-Language precedence;
- default locale fallback;
- portal/dashboard English override;
- static/API passthrough;
- matcher coverage.

- [ ] **Step 5: Run unit and E2E routing tests**

Run:

```bash
bun test tests/unit/proxy-i18n-locale.test.ts
bunx playwright test tests/e2e/localized-journey.spec.ts
```

Expected: `/products` follows the browser locale/cookie, `/` resolves to `/zh` when unsupported,
`/about` resolves to the detected locale, and bare `/portal`/`/dashboard` still resolve to
`/en/portal` and `/en/dashboard`.

- [ ] **Step 6: Commit the proxy slice**

```bash
git add proxy.ts tests/unit/proxy-i18n-locale.test.ts tests/e2e/localized-journey.spec.ts
git commit -m "feat: delegate locale resolution to next-intl"
```

## Task 3: Adapting localized navigation

**Files:**

- Modify: `i18n/LocaleLink.tsx`
- Create: `tests/unit/locale-link.test.tsx`
- Modify: callers only if TypeScript reports a changed `next-intl` href type

- [ ] **Step 1: Add navigation behavior tests**

Create `tests/unit/locale-link.test.tsx` around an exported pure normalization helper and assert:

```ts
import { describe, expect, test } from "bun:test";
import { localizeHref } from "../../i18n/LocaleLink";

describe("LocaleLink href normalization", () => {
  test("adds the active locale to internal paths", () => {
    expect(localizeHref("/products", "en")).toBe("/en/products");
  });

  test("does not double-prefix an already localized path", () => {
    expect(localizeHref("/zh/about", "en")).toBe("/zh/about");
  });

  test("preserves query strings and hashes", () => {
    expect(localizeHref("/products?tab=all#catalog", "am")).toBe(
      "/am/products?tab=all#catalog",
    );
  });

  test("leaves external and protocol-relative URLs unchanged", () => {
    expect(localizeHref("https://example.com", "en")).toBe("https://example.com");
    expect(localizeHref("//cdn.example.com/a", "en")).toBe("//cdn.example.com/a");
  });
});
```

- [ ] **Step 2: Run the navigation tests before implementation**

Run:

```bash
bun test tests/unit/locale-link.test.tsx
```

Expected: FAIL because `localizeHref` is not exported.

- [ ] **Step 3: Implement the next-intl navigation adapter**

Use `createNavigation(routing)` and keep `LocaleLink` as the stable seam:

```tsx
"use client";

import Link from "next/link";
import { createNavigation } from "next-intl/navigation";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { type Locale, routing } from "./routing";
import { getLocaleFromPath } from "./utils";

const { Link: IntlLink } = createNavigation(routing);

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const [path, suffix = ""] = href.split(/([?#].*)/, 2);
  const segments = path.split("/");
  if (routing.locales.includes(segments[1] as Locale)) return href;
  return `/${locale}${path}${suffix}`;
}

export function LocaleLink({ href, prefetch = false, ...props }: React.ComponentProps<typeof Link>) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
  const localizedHref = useMemo(
    () => (typeof href === "string" ? localizeHref(href, locale) : href),
    [href, locale],
  );

  if (typeof localizedHref !== "string" || !localizedHref.startsWith("/")) {
    return <Link href={localizedHref} prefetch={prefetch} {...props} />;
  }

  const withoutLocale = localizedHref.replace(/^\/(?:zh|en|am)(?=\/|$)/, "") || "/";
  return <IntlLink href={withoutLocale} locale={locale} prefetch={prefetch} {...props} />;
}
```

Use the actual `next-intl` `Link` href type reported by the installed version if it rejects a
generic string; do not cast the whole component to `any`. Preserve relative internal links,
external URLs, protocol-relative URLs, query strings, hashes, and `prefetch={false}`.

- [ ] **Step 4: Run component and navigation tests**

Run:

```bash
bun test tests/unit/locale-link.test.tsx tests/component/route-console-error-traversal.test.tsx
```

Expected: all existing route render traversals pass and no localized link loses its prefix.

- [ ] **Step 5: Commit the navigation slice**

```bash
git add i18n/LocaleLink.tsx tests/unit/locale-link.test.tsx
git commit -m "feat: use next-intl navigation for localized links"
```

## Task 4: Adding shared metadata and SEO helpers

**Files:**

- Create: `i18n/metadata.ts`
- Create: `tests/unit/i18n-metadata.test.ts`
- Modify: `i18n/translations/zh.ts`, `i18n/translations/en.ts`, `i18n/translations/am.ts`
- Modify: `scripts/tolgee/sync.ts` only if the new namespace needs an explicit export assertion

- [ ] **Step 1: Define the metadata key contract in tests**

Create `tests/unit/i18n-metadata.test.ts`:

```ts
import { describe, expect, test } from "bun:test";
import { defaultLocale, locales } from "../../i18n/routing";
import { buildLocalizedMetadata } from "../../i18n/metadata";

describe("localized metadata", () => {
  test("returns non-empty localized title and description", async () => {
    for (const locale of locales) {
      const metadata = await buildLocalizedMetadata(locale, "home", "/");
      expect(typeof metadata.title).toBe("string");
      expect(String(metadata.title).length).toBeGreaterThan(0);
      expect(typeof metadata.description).toBe("string");
      expect(String(metadata.description).length).toBeGreaterThan(0);
    }
  });

  test("emits canonical and hreflang URLs for every locale", async () => {
    const metadata = await buildLocalizedMetadata("en", "about", "/about");
    expect(metadata.alternates?.canonical).toBe("/en/about");
    expect(metadata.alternates?.languages).toEqual({
      zh: "/zh/about",
      en: "/en/about",
      am: "/am/about",
      "x-default": "/en/about",
    });
  });

  test("uses the default locale for x-default", async () => {
    const metadata = await buildLocalizedMetadata("am", "contact", "/contact");
    expect(metadata.alternates?.languages?.["x-default"]).toBe(`/en/contact`);
    expect(defaultLocale).toBe("en");
  });
});
```

- [ ] **Step 2: Run the metadata tests before implementation**

Run:

```bash
bun test tests/unit/i18n-metadata.test.ts
```

Expected: FAIL because the metadata module and `seo` keys do not exist.

- [ ] **Step 3: Add the `seo` namespace through the Tolgee bundle workflow**

Add these exact key paths to all three bundles, using the actual translated values managed in
Tolgee:

```text
seo.site.title
seo.site.description
seo.pages.home.title
seo.pages.home.description
seo.pages.about.title
seo.pages.about.description
seo.pages.company.title
seo.pages.company.description
seo.pages.contact.title
seo.pages.contact.description
seo.pages.academy.title
seo.pages.academy.description
seo.pages.insights.title
seo.pages.insights.description
seo.pages.products.title
seo.pages.products.description
seo.pages.solutions.title
seo.pages.solutions.description
seo.pages.markets.title
seo.pages.markets.description
seo.pages.privacy.title
seo.pages.privacy.description
seo.pages.terms.title
seo.pages.terms.description
seo.pages.qr.title
seo.pages.qr.description
seo.pages.portal.title
seo.pages.portal.description
```

Use the existing `bun run tolgee:push`/`bun run tolgee:pull` workflow rather than inventing a
second metadata file. Before committing, verify all three locales contain the same `seo` key
set and that no `seo.*` value is empty.

- [ ] **Step 4: Implement metadata construction**

Create `i18n/metadata.ts` with a typed page id and one URL builder:

```ts
import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "./routing";
import { translations } from "./translations";
import { resolveTranslationValue } from "./translationFallback";

export type MetadataPage =
  | "home"
  | "about"
  | "company"
  | "contact"
  | "academy"
  | "insights"
  | "products"
  | "solutions"
  | "markets"
  | "privacy"
  | "terms"
  | "qr"
  | "portal";

function message(locale: Locale, key: string, fallback: string): string {
  const value = resolveTranslationValue(
    key,
    [translations[locale] as Record<string, unknown>, translations.en as Record<string, unknown>],
    fallback,
  );
  return typeof value === "string" && value.trim() ? value : fallback;
}

export async function buildLocalizedMetadata(
  locale: Locale,
  page: MetadataPage,
  pathname: string,
): Promise<Metadata> {
  const normalizedPath = pathname === "/" ? "" : pathname.replace(/^\/+|\/+$/g, "");
  const localizedPath = `/${locale}${normalizedPath ? `/${normalizedPath}` : ""}`;
  const languages = Object.fromEntries(
    locales.map((candidate) => [
      candidate,
      `/${candidate}${normalizedPath ? `/${normalizedPath}` : ""}`,
    ]),
  );

  return {
    title: message(locale, `seo.pages.${page}.title`, "Youguard"),
    description: message(locale, `seo.pages.${page}.description`, "Youguard"),
    alternates: {
      canonical: localizedPath,
      languages: {
        ...languages,
        "x-default": `/${defaultLocale}${normalizedPath ? `/${normalizedPath}` : ""}`,
      },
    },
  };
}
```

The implementation may use `next-intl/server` request messages for the same lookup if the
compatibility spike proves it stable in vinext, but the fallback must still read the Tolgee
generated bundles and must never use a second message source.

- [ ] **Step 5: Run metadata tests and bundle parity checks**

Run:

```bash
bun test tests/unit/i18n-metadata.test.ts tests/unit/translation-completeness.test.ts
```

Expected: every locale has non-empty SEO values, identical SEO key sets, canonical URLs, and all
alternate URLs.

- [ ] **Step 6: Commit the metadata slice**

```bash
git add i18n/metadata.ts i18n/translations/zh.ts i18n/translations/en.ts i18n/translations/am.ts tests/unit/i18n-metadata.test.ts
git commit -m "feat: add localized metadata and hreflang helpers"
```

## Task 5: Adding the localized route layout

**Files:**

- Create: `app/[locale]/layout.tsx`
- Modify: `app/layout.tsx`
- Modify: `tests/component/route-console-error-traversal.test.tsx`

- [ ] **Step 1: Add layout validation tests**

Add tests that render the localized layout with `zh`, `en`, and `am`, assert
`generateStaticParams()` returns exactly those three values, and assert an unsupported locale
throws the normal Next `notFound()` control-flow error rather than silently rendering Chinese.

- [ ] **Step 2: Implement the localized layout**

Create `app/[locale]/layout.tsx`:

```tsx
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";

function isLocale(value: string): value is Locale {
  return routing.locales.includes(value as Locale);
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return children;
}
```

Do not add another `SiteChrome` or `TolgeeProvider`; the root layout already owns those wrappers.
The localized layout is only the route validation/metadata seam.

- [ ] **Step 3: Move only global metadata defaults out of the root layout**

Keep favicon and a generic fallback in `app/layout.tsx`, but remove any locale-specific title or
description from the root metadata object. The localized page/layout metadata must be the source
of localized SEO values.

- [ ] **Step 4: Run route traversal and build checks**

Run:

```bash
bun test tests/component/route-console-error-traversal.test.tsx
bun run build
```

Expected: all existing route wrappers render across all locales and the build lists a
`/:locale` layout without introducing duplicate page implementations.

- [ ] **Step 5: Commit the localized layout**

```bash
git add "app/[locale]/layout.tsx" app/layout.tsx tests/component/route-console-error-traversal.test.tsx
git commit -m "feat: validate localized route segments"
```

## Task 6: Wiring page-level metadata

**Files:**

- Modify:
  - `app/[locale]/page.tsx`
  - `app/[locale]/about/page.tsx`
  - `app/[locale]/company/page.tsx`
  - `app/[locale]/contact/page.tsx`
  - `app/[locale]/academy/page.tsx`
  - `app/[locale]/academy/ev-fundamentals/page.tsx`
  - `app/[locale]/academy/dealer-playbook/page.tsx`
  - `app/[locale]/academy/technical-workshop/page.tsx`
  - `app/[locale]/academy/[category]/[slug]/page.tsx`
  - `app/[locale]/insights/page.tsx`
  - `app/[locale]/insights/[slug]/page.tsx`
  - `app/[locale]/markets/ethiopia/page.tsx`
  - `app/[locale]/privacy/page.tsx`
  - `app/[locale]/terms/page.tsx`
  - `app/[locale]/qr/page.tsx`
  - `app/[locale]/products/page.tsx`
  - `app/[locale]/products/revenue-king/page.tsx`
  - `app/[locale]/products/elite-flagship/page.tsx`
  - `app/[locale]/products/utility-pro/page.tsx`
  - `app/[locale]/products/[category]/[slug]/page.tsx`
  - `app/[locale]/solutions/page.tsx`
  - `app/[locale]/solutions/configure-kit/page.tsx`
  - `app/[locale]/solutions/request-quote/page.tsx`
  - `app/[locale]/dashboard/page.tsx`
  - `app/[locale]/dashboard/[module]/page.tsx`
  - `app/[locale]/portal/page.tsx`
- Modify: `tests/unit/i18n-metadata.test.ts`

- [ ] **Step 1: Add the static page metadata wrapper pattern**

For a non-dynamic page such as `app/[locale]/about/page.tsx`, keep the existing view export and
add:

```tsx
import { notFound } from "next/navigation";
import { buildLocalizedMetadata } from "@/i18n/metadata";
import { isLocale } from "@/i18n/routing";
import ViewPage from "@/views/about";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return buildLocalizedMetadata(locale, "about", "/about");
}

export default ViewPage;
```

Use the exact page id and pathname from the following mapping:

| Route family | Page id | Path |
| --- | --- | --- |
| home | `home` | `/` |
| about | `about` | `/about` |
| company | `company` | `/company` |
| contact | `contact` | `/contact` |
| academy pages | `academy` | `/academy` |
| insights pages | `insights` | `/insights` |
| Ethiopia market | `markets` | `/markets/ethiopia` |
| privacy | `privacy` | `/privacy` |
| terms | `terms` | `/terms` |
| QR | `qr` | `/qr` |
| product catalog/detail | `products` | `/products` |
| solutions pages | `solutions` | `/solutions` |
| portal/dashboard | `portal` | `/portal` |

The unsupported-locale fallback above is only a type guard; the localized layout remains the
runtime 404 authority. Do not render a page for an unsupported locale.

- [ ] **Step 2: Add dynamic metadata wrappers**

For `app/[locale]/insights/[slug]/page.tsx`, `app/[locale]/academy/[category]/[slug]/page.tsx`,
and `app/[locale]/products/[category]/[slug]/page.tsx`, preserve the existing `params` passed to
the view and use the actual normalized dynamic path for alternates:

```tsx
import { notFound } from "next/navigation";
import { buildLocalizedMetadata } from "@/i18n/metadata";
import { isLocale } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale, category, slug } = await params;
  if (!isLocale(locale)) notFound();
  return buildLocalizedMetadata(
    locale,
    "products",
    `/products/${category}/${slug}`,
  );
}
```

Use the same pattern with `params: Promise<{ locale: string; slug: string }>` and
`/insights/${slug}` for Insights, and
`params: Promise<{ locale: string; category: string; slug: string }>` and
`/academy/${category}/${slug}` for Academy. Do not fetch D1, Feishu, or a portal API from
metadata generation. A future content-specific metadata project can add a separate server data
adapter.

- [ ] **Step 3: Add metadata assertions for representative route families**

Extend `tests/unit/i18n-metadata.test.ts` to cover:

- `/zh`, `/en`, `/am` home metadata;
- `/en/about` with all four alternate entries;
- `/am/products` with Amharic title/description;
- a dynamic insights/product route using the generic fallback;
- portal metadata without adding the public navbar/footer.

- [ ] **Step 4: Run the complete route and metadata tests**

Run:

```bash
bun test tests/unit/i18n-metadata.test.ts tests/component/route-console-error-traversal.test.tsx
bunx playwright test tests/e2e/localized-journey.spec.ts
```

Expected: every localized route returns a non-empty title, all alternates point to the same
route in each locale, and the existing browser journeys still reach the same pages.

- [ ] **Step 5: Commit page metadata wiring**

```bash
git add "app/[locale]" tests/unit/i18n-metadata.test.ts
git commit -m "feat: wire localized page metadata"
```

## Task 7: Removing replaced duplication and documenting the seam

**Files:**

- Modify: `proxy.ts`, `i18n/LocaleLink.tsx`, `i18n/utils.ts`, `i18n/config.ts`
- Modify: `README.md`
- Modify: `knip.json` only if it reports an intentional public adapter export
- Modify: `tests/unit/proxy-i18n-locale.test.ts`

- [ ] **Step 1: Run Knip to identify safe removals**

Run:

```bash
bun run knip
```

Remove only helpers that are no longer imported:

- the old Accept-Language parser if next-intl owns it;
- old locale-prefix code if `LocaleLink` delegates entirely to `createNavigation`;
- unused locale imports made redundant by `i18n/routing.ts`.

Keep `getLocaleFromPath` if `SiteChrome` and `useLocale` still use it; it is a URL observation
helper, not a second routing resolver.

- [ ] **Step 2: Update README architecture documentation**

Document:

- `i18n/routing.ts` as the canonical locale list/default;
- `proxy.ts` as the composition point for next-intl and portal special handling;
- `app/[locale]/layout.tsx` as the validation/metadata seam;
- Tolgee as the only UI translation runtime and editing source;
- static bundles as the production runtime source;
- the fact that `next-intl` is not used through `useTranslations` in page UI.

- [ ] **Step 3: Add a no-duplicate-source regression test**

Add a test to `tests/unit/i18n-routing.test.ts` that imports `locales` from both
`i18n/config.ts` and `i18n/routing.ts` and asserts strict equality. Add a source-level assertion
that `package.json` contains exactly one `next-intl` dependency and the translation bundles remain
the three Tolgee-managed files.

- [ ] **Step 4: Run all existing validation commands**

Run:

```bash
bun run test
bun run lint
bun run knip
bun run build
```

Expected: all tests pass, lint has no new errors, Knip reports no newly unused files/exports, and
the Worker bundle builds without a Tolgee network dependency.

- [ ] **Step 5: Commit the cleanup and documentation**

```bash
git add proxy.ts i18n README.md knip.json tests
git commit -m "docs: document next-intl and Tolgee boundaries"
```

## Final review checklist

- [ ] `/zh/about`, `/en/about`, and `/am/about` render the same view with locale-specific
  metadata.
- [ ] Bare `/about` still redirects according to cookie/Accept-Language/default locale.
- [ ] Bare `/portal` and `/dashboard` still redirect to English.
- [ ] API, scheduled, Next internals, and static assets never receive locale redirects.
- [ ] Internal links preserve the active locale; external links are unchanged.
- [ ] Every localized page emits `canonical`, `zh`, `en`, `am`, and `x-default` alternates.
- [ ] Tolgee remains the only UI translation runtime and `bun run tolgee:pull` remains the only
  translation bundle publishing path.
- [ ] No production request calls Tolgee.
- [ ] `bun run test`, `bun run lint`, `bun run knip`, and `bun run build` pass.
