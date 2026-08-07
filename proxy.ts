/**
 * proxy.ts — Next.js 16+ official route intercept entry point.
 *
 * Replaces the deprecated middleware.ts. This file must export `proxy` (not
 * `middleware`) and must be named proxy.ts in the project root.
 *
 * next-intl owns locale detection, prefixing, and NEXT_LOCALE persistence.
 * This wrapper only preserves the portal/dashboard English entry points and
 * bypasses paths that must never be localized.
 */
import { type NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { COOKIE_TTL_1Y, LOCALE_COOKIE_NAME } from "./lib/constants";

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

function redirectPortalToEnglish(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = `/en${url.pathname}`;
  const response = NextResponse.redirect(url, { status: 307 });
  response.cookies.set(LOCALE_COOKIE_NAME, "en", {
    maxAge: COOKIE_TTL_1Y,
    path: "/",
    sameSite: "lax",
  });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isLocaleProxySkipPath(pathname)) {
    return NextResponse.next();
  }

  if (isPortalLocaleOverridePath(pathname)) {
    return redirectPortalToEnglish(request);
  }

  return nextIntlProxy(request);
}

export const config = {
  matcher: [
    /*
     * Keep this broad enough for next-intl to see every page path. Runtime
     * asset/API exclusions remain explicit in isLocaleProxySkipPath().
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
