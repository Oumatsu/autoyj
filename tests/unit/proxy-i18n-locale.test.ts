import { describe, expect, test } from "bun:test";
import {
  isLocaleProxySkipPath,
  isPortalLocaleOverridePath,
} from "../../proxy";
import { defaultLocale, fallbackLocale, locales } from "../../i18n/config";
import { routing } from "../../i18n/routing";

describe("next-intl locale routing configuration", () => {
  test("uses the supported locales and explicit prefixes", () => {
    expect(routing.locales).toEqual(["zh", "en", "am"]);
    expect(routing.defaultLocale).toBe(defaultLocale);
    expect(routing.localePrefix).toBe("always");
    expect(fallbackLocale).toBe("en");
  });

  test("uses the shared NEXT_LOCALE cookie", () => {
    expect(routing.localeCookie).toMatchObject({
      name: "NEXT_LOCALE",
      path: "/",
      sameSite: "lax",
    });
  });
});

describe("proxy path ownership", () => {
  test("skips APIs, scheduled jobs, internal paths, and assets", () => {
    for (const pathname of [
      "/__scheduled",
      "/_next/static/chunks/main.js",
      "/_next/image?url=foo",
      "/api/portal/session",
      "/favicon.svg",
      "/logo.svg",
      "/images/hero.webp",
      "/fonts/inter.woff2",
      "/styles/main.css",
    ]) {
      expect(isLocaleProxySkipPath(pathname)).toBe(true);
    }
  });

  test("keeps page paths under next-intl", () => {
    for (const pathname of ["/", "/about", "/products", "/zh/insights", "/en/contact"]) {
      expect(isLocaleProxySkipPath(pathname)).toBe(false);
    }
  });

  test("keeps portal and dashboard bare paths on English", () => {
    expect(isPortalLocaleOverridePath("/portal")).toBe(true);
    expect(isPortalLocaleOverridePath("/portal/vehicle_models")).toBe(true);
    expect(isPortalLocaleOverridePath("/dashboard")).toBe(true);
    expect(isPortalLocaleOverridePath("/dashboard/vehicle_models")).toBe(true);
    expect(isPortalLocaleOverridePath("/products")).toBe(false);
  });
});

describe("locale configuration", () => {
  test("declares the three supported locale codes", () => {
    expect(locales).toEqual(["zh", "en", "am"]);
  });
});
