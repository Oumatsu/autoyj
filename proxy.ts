/**
 * @deprecated DEAD CODE — Next.js middleware entry point is now `middleware.ts`.
 * This file is kept for reference only. Do NOT use or import it.
 * The locale cookie name here (`youguard_locale`) differs from middleware.ts (`NEXT_LOCALE`).
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { defaultLocale, locales, Locale } from "./i18n/config";
import { COOKIE_TTL_1Y } from "./lib/constants";

function detectLocaleFromRequest(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get("youguard_locale")?.value;
  if (cookieLocale && locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  const acceptLang = request.headers.get("accept-language");
  if (!acceptLang) return defaultLocale;

  const preferred = acceptLang
    .split(",")
    .map((entry) => {
      const [lang, q = "1"] = entry.trim().split(";q=");
      return {
        lang: lang.split("-")[0].toLowerCase(),
        q: parseFloat(q) || 0,
      };
    })
    .sort((a, b) => b.q - a.q);

  for (const { lang } of preferred) {
    const matched = locales.find((l) => l === lang);
    if (matched) return matched;
  }

  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const firstSegment = pathname.split("/")[1] as Locale | undefined;

  if (firstSegment && locales.includes(firstSegment)) {
    const response = NextResponse.next();
    response.headers.set("x-locale", firstSegment);
    response.cookies.set("youguard_locale", firstSegment, {
      path: "/",
      maxAge: COOKIE_TTL_1Y,
    });
    return response;
  }

  const locale = detectLocaleFromRequest(request);
  const redirectUrl = new URL(`/${locale}${pathname}`, request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/((?!api|_next|_vinext|portal|dashboard|.*\\..*$).*)"],
};
