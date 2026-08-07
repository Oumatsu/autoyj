import { defineRouting } from "next-intl/routing";
import { COOKIE_TTL_1Y, LOCALE_COOKIE_NAME } from "@/lib/constants";

export const locales = ["zh", "en", "am"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: COOKIE_TTL_1Y,
    sameSite: "lax",
    path: "/",
  },
  // Metadata emits the canonical and hreflang tags with the locale-prefixed
  // x-default URL; avoid a second, conflicting Link response header.
  alternateLinks: false,
});
