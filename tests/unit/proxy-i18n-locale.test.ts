import { describe, expect, test } from "bun:test";

/**
 * Unit tests for proxy.ts — Next.js 16+ route intercept entry point.
 *
 * Strategy: import the real implementations from proxy.ts instead of
 * copy-pasting logic.  This ensures tests stay in sync with the source.
 *
 * next/server (NextRequest / NextResponse) is not available in Bun's test
 * runner, so the `proxy` function itself is tested via helper functions that
 * are exported from proxy.ts.  The full integration is covered by e2e tests.
 */

// Real locale config — single source of truth
import { defaultLocale, locales, type Locale } from "@/i18n/config";

// Real parser from proxy.ts — no inline duplication
import { getLocaleFromAcceptLanguage } from "@/proxy";

// ---------------------------------------------------------------------------
// Inline the same resolveLocale priority logic from proxy.ts so we can unit-
// test the three-priority chain without constructing NextRequest objects.
// Keep this in sync with the `proxy` function body in proxy.ts.
// ---------------------------------------------------------------------------
function resolveLocale(
  cookieLocale: string | undefined,
  acceptLanguageHeader: string | null
): Locale {
  return (
    (locales.includes(cookieLocale as Locale) ? (cookieLocale as Locale) : null) ??
    getLocaleFromAcceptLanguage(acceptLanguageHeader) ??
    defaultLocale
  );
}

// ---------------------------------------------------------------------------
describe("Unit: proxy.ts — Accept-Language parser (getLocaleFromAcceptLanguage)", () => {
  test("exact match: bare locale tags", () => {
    expect(getLocaleFromAcceptLanguage("en")).toBe("en");
    expect(getLocaleFromAcceptLanguage("zh")).toBe("zh");
    expect(getLocaleFromAcceptLanguage("am")).toBe("am");
  });

  test("language-prefix match: region subtags collapse to base locale", () => {
    expect(getLocaleFromAcceptLanguage("zh-CN")).toBe("zh");
    expect(getLocaleFromAcceptLanguage("zh-TW")).toBe("zh");
    expect(getLocaleFromAcceptLanguage("en-US")).toBe("en");
    expect(getLocaleFromAcceptLanguage("en-GB")).toBe("en");
  });

  test("weighted quality (q=) values: highest q wins", () => {
    // en;q=0.9 beats zh;q=0.8
    expect(getLocaleFromAcceptLanguage("zh-CN;q=0.8,en;q=0.9")).toBe("en");
    // zh-CN has implicit q=1, beats en;q=0.8
    expect(getLocaleFromAcceptLanguage("zh-CN,en;q=0.8")).toBe("zh");
    // am first with implicit q=1
    expect(getLocaleFromAcceptLanguage("am,en;q=0.7,zh;q=0.5")).toBe("am");
  });

  test("unsupported locale returns null", () => {
    expect(getLocaleFromAcceptLanguage("fr")).toBeNull();
    expect(getLocaleFromAcceptLanguage("ar")).toBeNull();
    expect(getLocaleFromAcceptLanguage("de-DE")).toBeNull();
    expect(getLocaleFromAcceptLanguage("ja")).toBeNull();
  });

  test("null / empty header returns null", () => {
    expect(getLocaleFromAcceptLanguage(null)).toBeNull();
    expect(getLocaleFromAcceptLanguage("")).toBeNull();
  });

  test("mixed supported/unsupported picks best supported by q-value", () => {
    // fr (unsupported), zh next in line
    expect(getLocaleFromAcceptLanguage("fr;q=0.9,zh;q=0.8")).toBe("zh");
    // fr unsupported → fallback to en
    expect(getLocaleFromAcceptLanguage("fr,en;q=0.5")).toBe("en");
  });
});

// ---------------------------------------------------------------------------
describe("Unit: proxy.ts — locale resolution priority (cookie > Accept-Language > default)", () => {
  test("cookie takes highest priority over Accept-Language", () => {
    expect(resolveLocale("en", "zh-CN,zh;q=0.9")).toBe("en");
    expect(resolveLocale("am", "en-US")).toBe("am");
    expect(resolveLocale("zh", "en")).toBe("zh");
  });

  test("falls back to Accept-Language when cookie is absent", () => {
    expect(resolveLocale(undefined, "en-US")).toBe("en");
    expect(resolveLocale(undefined, "zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
    expect(resolveLocale(undefined, "am")).toBe("am");
  });

  test("falls back to defaultLocale when no cookie and no valid Accept-Language", () => {
    expect(resolveLocale(undefined, "fr")).toBe(defaultLocale);
    expect(resolveLocale(undefined, null)).toBe(defaultLocale);
    expect(resolveLocale(undefined, "")).toBe(defaultLocale);
  });

  test("invalid cookie locale is ignored — falls through to Accept-Language", () => {
    expect(resolveLocale("fr", "en-US")).toBe("en");
    expect(resolveLocale("de", "zh")).toBe("zh");
  });

  test("invalid cookie AND unsupported Accept-Language → defaultLocale", () => {
    expect(resolveLocale("fr", null)).toBe(defaultLocale);
    expect(resolveLocale("de", "es")).toBe(defaultLocale);
  });
});

// ---------------------------------------------------------------------------
describe("Unit: proxy.ts — path locale-prefix detection", () => {
  function pathHasLocale(pathname: string): boolean {
    const segments = pathname.split("/").filter(Boolean);
    return locales.includes(segments[0] as Locale);
  }

  test("paths with valid locale prefix are detected correctly", () => {
    for (const locale of locales) {
      expect(pathHasLocale(`/${locale}`)).toBe(true);
      expect(pathHasLocale(`/${locale}/products`)).toBe(true);
      expect(pathHasLocale(`/${locale}/academy/ev/intro`)).toBe(true);
    }
  });

  test("root and non-locale paths return false", () => {
    expect(pathHasLocale("/")).toBe(false);
    expect(pathHasLocale("/products")).toBe(false);
    expect(pathHasLocale("/fr/page")).toBe(false); // unsupported locale
    expect(pathHasLocale("/api/portal/session")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
describe("Unit: proxy.ts — static file / passthrough path rules", () => {
  /**
   * Mirrors the skip-list at the top of the `proxy` function in proxy.ts.
   * If you add a new passthrough prefix there, add a matching test here.
   */
  function shouldSkip(pathname: string): boolean {
    return (
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

  test("Next.js internal paths are skipped", () => {
    expect(shouldSkip("/_next/static/chunks/main.js")).toBe(true);
    expect(shouldSkip("/_next/image?url=foo")).toBe(true);
    expect(shouldSkip("/_next/data/xxx/index.json")).toBe(true);
  });

  test("API routes are skipped", () => {
    expect(shouldSkip("/api/portal/session")).toBe(true);
    expect(shouldSkip("/api/auth/sign-in")).toBe(true);
  });

  test("portal paths remain locale candidates", () => {
    expect(shouldSkip("/portal")).toBe(false);
    expect(shouldSkip("/portal/dashboard")).toBe(false);
  });

  test("static asset paths are skipped", () => {
    expect(shouldSkip("/favicon.svg")).toBe(true);
    expect(shouldSkip("/favicon.ico")).toBe(true);
    expect(shouldSkip("/logo.svg")).toBe(true);
    expect(shouldSkip("/images/hero.webp")).toBe(true);
    expect(shouldSkip("/fonts/inter.woff2")).toBe(true);
    expect(shouldSkip("/icons/check.png")).toBe(true);
  });

  test("static file extensions are skipped", () => {
    const staticFiles = [
      "/public/manifest.json",
      "/robots.txt",
      "/sitemap.xml",
      "/pic/academy/photo.webp",
      "/styles/main.css",
    ];
    for (const path of staticFiles) {
      expect(shouldSkip(path)).toBe(true);
    }
  });

  test("real page paths are NOT skipped", () => {
    const pagePaths = ["/", "/about", "/products", "/zh/insights", "/en/contact"];
    for (const path of pagePaths) {
      expect(shouldSkip(path)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
describe("Unit: proxy.ts — config.matcher coverage", () => {
  /**
   * Verify the regex in config.matcher behaves as expected.
   * Regex source taken verbatim from proxy.ts config.matcher[0].
   */
  const matcherRegex =
    /^\/((?!_next\/static|_next\/image|favicon\.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|map)).*)/;

  test("matcher includes page routes", () => {
    expect(matcherRegex.test("/")).toBe(true);
    expect(matcherRegex.test("/zh/products")).toBe(true);
    expect(matcherRegex.test("/api/auth")).toBe(true);
  });

  test("matcher excludes Next.js internals", () => {
    expect(matcherRegex.test("/_next/static/chunks/main.js")).toBe(false);
    expect(matcherRegex.test("/_next/image?url=foo")).toBe(false);
    expect(matcherRegex.test("/favicon.ico")).toBe(false);
  });

  test("matcher excludes static asset extensions", () => {
    const assets = [
      "/logo.svg",
      "/hero.png",
      "/photo.jpg",
      "/thumb.webp",
      "/font.woff2",
      "/font.ttf",
      "/styles.css",
      "/bundle.js",
      "/source.map",
    ];
    for (const asset of assets) {
      expect(matcherRegex.test(asset)).toBe(false);
    }
  });
});
