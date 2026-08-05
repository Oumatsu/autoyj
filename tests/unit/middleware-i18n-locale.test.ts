import { describe, expect, test } from "bun:test";

// ---------------------------------------------------------------------------
// Inline-replicate the middleware's Accept-Language parser so we can unit-test
// it without importing Next.js server internals.
// ---------------------------------------------------------------------------
const locales = ["zh", "en", "am"] as const;
type Locale = (typeof locales)[number];
const defaultLocale: Locale = "zh";

function getLocaleFromAcceptLanguage(header: string | null): Locale | null {
  if (!header) return null;
  const parts = header
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { tag: tag.trim().toLowerCase(), q: parseFloat(q ?? "1") };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of parts) {
    const exact = locales.find((l) => l === tag);
    if (exact) return exact;
    const prefix = locales.find((l) => tag.startsWith(l));
    if (prefix) return prefix;
  }
  return null;
}

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
describe("Unit: Middleware i18n Locale Detection", () => {
  // --- Accept-Language parsing ---
  test("getLocaleFromAcceptLanguage: exact match", () => {
    expect(getLocaleFromAcceptLanguage("en")).toBe("en");
    expect(getLocaleFromAcceptLanguage("zh")).toBe("zh");
    expect(getLocaleFromAcceptLanguage("am")).toBe("am");
  });

  test("getLocaleFromAcceptLanguage: language-prefix match", () => {
    expect(getLocaleFromAcceptLanguage("zh-CN")).toBe("zh");
    expect(getLocaleFromAcceptLanguage("zh-TW")).toBe("zh");
    expect(getLocaleFromAcceptLanguage("en-US")).toBe("en");
    expect(getLocaleFromAcceptLanguage("en-GB")).toBe("en");
  });

  test("getLocaleFromAcceptLanguage: weighted quality selection", () => {
    // en wins over zh because q=0.9 > q=0.8
    expect(getLocaleFromAcceptLanguage("zh-CN;q=0.8,en;q=0.9")).toBe("en");
    // zh-CN is first and has implicit q=1
    expect(getLocaleFromAcceptLanguage("zh-CN,en;q=0.8")).toBe("zh");
  });

  test("getLocaleFromAcceptLanguage: unknown locale returns null", () => {
    expect(getLocaleFromAcceptLanguage("fr")).toBeNull();
    expect(getLocaleFromAcceptLanguage("ar")).toBeNull();
  });

  test("getLocaleFromAcceptLanguage: null/empty returns null", () => {
    expect(getLocaleFromAcceptLanguage(null)).toBeNull();
    expect(getLocaleFromAcceptLanguage("")).toBeNull();
  });

  // --- resolveLocale priority: cookie > Accept-Language > default ---
  test("resolveLocale: cookie takes highest priority", () => {
    expect(resolveLocale("en", "zh-CN,zh;q=0.9")).toBe("en");
    expect(resolveLocale("am", "en-US")).toBe("am");
  });

  test("resolveLocale: falls back to Accept-Language when no cookie", () => {
    expect(resolveLocale(undefined, "en-US")).toBe("en");
    expect(resolveLocale(undefined, "zh-CN,zh;q=0.9,en;q=0.8")).toBe("zh");
  });

  test("resolveLocale: falls back to default locale when no cookie and no valid Accept-Language", () => {
    expect(resolveLocale(undefined, "fr")).toBe("zh");
    expect(resolveLocale(undefined, null)).toBe("zh");
    expect(resolveLocale("fr", null)).toBe("zh"); // invalid cookie locale
  });

  test("resolveLocale: invalid cookie locale is ignored", () => {
    expect(resolveLocale("fr", "en-US")).toBe("en");
    expect(resolveLocale("de", null)).toBe("zh");
  });
});

// ---------------------------------------------------------------------------
describe("Unit: Middleware Path Detection Logic", () => {
  function pathHasLocale(pathname: string): boolean {
    const segments = pathname.split("/").filter(Boolean);
    return locales.includes(segments[0] as Locale);
  }

  test("paths with valid locale prefix are detected correctly", () => {
    expect(pathHasLocale("/zh")).toBe(true);
    expect(pathHasLocale("/en/products")).toBe(true);
    expect(pathHasLocale("/am/about")).toBe(true);
  });

  test("paths without locale prefix are not detected as having a locale", () => {
    expect(pathHasLocale("/")).toBe(false);
    expect(pathHasLocale("/products")).toBe(false);
    expect(pathHasLocale("/fr/page")).toBe(false);
    expect(pathHasLocale("/api/portal/session")).toBe(false);
  });

  test("static file paths should be excluded from middleware", () => {
    const staticPatterns = [
      "/_next/static/chunks/main.js",
      "/_next/image?url=foo",
      "/favicon.ico",
      "/logo.svg",
      "/images/hero.webp",
      "/fonts/inter.woff2",
    ];
    for (const path of staticPatterns) {
      const shouldSkip =
        path.startsWith("/_next") ||
        path.startsWith("/api") ||
        path.startsWith("/favicon") ||
        path.startsWith("/logo") ||
        path.startsWith("/images") ||
        path.startsWith("/fonts") ||
        /\.[a-z0-9]+$/i.test(path);
      expect(shouldSkip).toBe(true);
    }
  });
});
