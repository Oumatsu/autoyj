import { describe, expect, test } from "bun:test";
import { TolgeeCore } from "@tolgee/core";
import { fallbackLocale } from "../../i18n/config";
import { tolgeeStaticData } from "../../i18n/messages";

describe("Tolgee framework fallback", () => {
  test("uses English when the active locale does not define a key", () => {
    const tolgee = TolgeeCore().init({
      language: "zh",
      defaultLanguage: "zh",
      fallbackLanguage: fallbackLocale,
      staticData: {
        zh: { greeting: "你好" },
        en: { greeting: "Hello", onlyEnglish: "English fallback" },
      },
    });

    expect(tolgee.t("greeting")).toBe("你好");
    expect(tolgee.t("onlyEnglish")).toBe("English fallback");
  });

  test("keeps an explicit empty translation instead of leaking English", () => {
    const tolgee = TolgeeCore().init({
      language: "zh",
      defaultLanguage: "zh",
      fallbackLanguage: fallbackLocale,
      staticData: {
        zh: { heading: "" },
        en: { heading: "The" },
      },
    });

    expect(tolgee.t("heading")).toBe("");
  });

  test("loads the merged UI and vehicle-detail message bundles", () => {
    const tolgee = TolgeeCore().init({
      language: "zh",
      defaultLanguage: "zh",
      fallbackLanguage: fallbackLocale,
      staticData: tolgeeStaticData,
    });

    expect(tolgee.t("productsDetail.ui.model")).toBe("款");
    expect(tolgee.t("home.hero.badge")).toBeTruthy();
  });
});
