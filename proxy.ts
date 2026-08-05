/**
 * proxy.ts — Next.js 16+ official route intercept entry point.
 *
 * Replaces the deprecated middleware.ts. This file must export `proxy` (not
 * `middleware`) and must be named proxy.ts in the project root.
 *
 * Locale resolution priority:
 *   1. Cookie (NEXT_LOCALE) — persisted from previous visit / language switch
 *   2. Accept-Language header — browser preference, weighted quality values
 *   3. defaultLocale from i18n/config — hard fallback
 */
import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales, type Locale } from "./i18n/config";
import { COOKIE_TTL_1Y, LOCALE_COOKIE_NAME } from "./lib/constants";

/**
 * Parse the best-matching locale from Accept-Language header.
 * Supports weighted quality values (e.g. "zh-CN,zh;q=0.9,en;q=0.8").
 */
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
    // Exact match first: "en" → "en"
    const exact = locales.find((l) => l === tag);
    if (exact) return exact;
    // Language-prefix match: "zh-CN" → "zh"
    const prefix = locales.find((l) => tag.startsWith(l));
    if (prefix) return prefix;
  }
  return null;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Skip paths that must not be redirected ---
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/portal") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/logo") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/fonts") ||
    pathname.match(/\.[a-z0-9]+$/i) // static files
  ) {
    return NextResponse.next();
  }

  // --- 2. If path already has a valid locale prefix, persist cookie & continue ---
  const segments = pathname.split("/").filter(Boolean);
  const pathLocale = segments[0];

  if (locales.includes(pathLocale as Locale)) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE_NAME, pathLocale, {
      maxAge: COOKIE_TTL_1Y,
      path: "/",
      sameSite: "lax",
    });
    return response;
  }

  // --- 3. No locale in path → detect preferred locale ---
  const cookieLocale = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const acceptLocale = getLocaleFromAcceptLanguage(
    request.headers.get("accept-language")
  );

  const targetLocale: Locale =
    (locales.includes(cookieLocale as Locale) ? (cookieLocale as Locale) : null) ??
    acceptLocale ??
    defaultLocale;

  // Redirect to /<locale>/<rest-of-path>
  const url = request.nextUrl.clone();
  url.pathname = `/${targetLocale}${pathname === "/" ? "" : pathname}`;

  const response = NextResponse.redirect(url, { status: 307 });
  response.cookies.set(LOCALE_COOKIE_NAME, targetLocale, {
    maxAge: COOKIE_TTL_1Y,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static, _next/image (Next.js internals)
     * - api routes
     * - Files with extensions (images, fonts, woff, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|eot|map)).*)",
  ],
};
