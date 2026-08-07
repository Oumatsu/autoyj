import { describe, expect, test } from "bun:test";
import { buildLocalizedMetadata } from "../../i18n/metadata";
import { defaultLocale, locales } from "../../i18n/config";
import am from "../../i18n/translations/am";
import en from "../../i18n/translations/en";
import zh from "../../i18n/translations/zh";

const translations = { zh, en, am };

describe("Localized metadata", () => {
  test("provides non-empty translated title and description for every locale", () => {
    for (const locale of locales) {
      const metadata = buildLocalizedMetadata(locale, "home", "/");

      expect(typeof metadata.title).toBe("string");
      expect(String(metadata.title)).toContain(translations[locale].seo.pages.home.title);
      expect(typeof metadata.description).toBe("string");
      expect(String(metadata.description).length).toBeGreaterThan(0);
    }
  });

  test("emits canonical and hreflang URLs for the current route", () => {
    const metadata = buildLocalizedMetadata("en", "about", "/about");

    expect(metadata.alternates?.canonical).toBe("/en/about");
    expect(metadata.alternates?.languages).toEqual({
      zh: "/zh/about",
      en: "/en/about",
      am: "/am/about",
      "x-default": "/en/about",
    });
  });

  test("uses the configured default locale for x-default", () => {
    const metadata = buildLocalizedMetadata("am", "contact", "/contact");

    expect(defaultLocale).toBe("en");
    expect(metadata.alternates?.languages?.["x-default"]).toBe(
      `/${defaultLocale}/contact`
    );
  });

  test("keeps the SEO key set complete and symmetric", () => {
    const pageKeys = Object.keys(translations.zh.seo.pages).sort();

    expect(pageKeys).toHaveLength(13);
    expect(Object.keys(translations.en.seo.pages).sort()).toEqual(pageKeys);
    expect(Object.keys(translations.am.seo.pages).sort()).toEqual(pageKeys);

    for (const locale of locales) {
      for (const value of Object.values(translations[locale].seo.pages)) {
        expect(value.title.trim().length).toBeGreaterThan(0);
        expect(value.description.trim().length).toBeGreaterThan(0);
      }
    }
  });
});
