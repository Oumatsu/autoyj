import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { catalogCardValueKey } from "../../views/products/catalogTranslations";
import { translateOverviewCard } from "../../views/products/productsOverviewTranslations";
import am from "../../i18n/translations/am.json";
import en from "../../i18n/translations/en.json";
import zh from "../../i18n/translations/zh.json";

const featuredSlugs = [
  "byd-seagull",
  "gac-aion-rt",
  "byd-qin-plus",
  "geely-galaxy-e5",
  "aito-m9",
  "zeekr-001",
  "xiaomi-su7-ultra",
  "byd-shark",
  "radar-rd6",
  "farizon-xingxiang-v",
];

describe("Unit: Products Overview Card Translations", () => {
  test("overview translation keys are stable", () => {
    expect(catalogCardValueKey("405km Range")).toBe("catalog.cardValues.405km-range");
  });

  test("overview cards resolve every translatable API field", () => {
    const rawCard = {
      slug: "aito-m9",
      name: "AITO M9",
      desc: "Huawei's ADS 3.0 tech masterpiece.",
      tag: "Performance King",
      label: "Tech Pinnacle",
      tags: ["405km Range"],
    };
    const translations: Record<string, string> = {
      "catalog.models.aito-m9.displayName": "问界M9",
      "catalog.models.aito-m9.cardHighlight": "华为 ADS 3.0 技术旗舰",
      "catalog.models.aito-m9.cardTag": "性能旗舰",
      "catalog.models.aito-m9.cardLabel": "科技巅峰",
      "catalog.cardValues.405km-range": "405 公里续航",
    };
    const t = (key: string, fallback: string) => translations[key] ?? fallback;

    expect(translateOverviewCard(rawCard, t)).toEqual({
      ...rawCard,
      name: "问界M9",
      desc: "华为 ADS 3.0 技术旗舰",
      tag: "性能旗舰",
      label: "科技巅峰",
      tags: ["405 公里续航"],
    });
  });

  test("overview cards throw strict error on malformed translations", () => {
    const card = {
      slug: "aito-m9",
      name: "AITO M9",
      desc: "Description",
      tag: "Tag",
      label: "Label",
      tags: "not-an-array" as any,
    };
    const malformedT = () => ({ invalid: true } as any);

    expect(() => translateOverviewCard(card, malformedT)).toThrow("[Strict i18n Error]");
  });

  test("Chinese and Amharic cover every featured overview card", () => {
    for (const slug of featuredSlugs) {
      expect(typeof zh.catalog.models[slug as keyof typeof zh.catalog.models].displayName).toBe(
        "string"
      );
      expect(typeof am.catalog.models[slug as keyof typeof am.catalog.models].displayName).toBe(
        "string"
      );
      expect(zh.catalog.models[slug as keyof typeof zh.catalog.models].cardHighlight).not.toBe(
        en.catalog.models[slug as keyof typeof en.catalog.models].cardHighlight
      );
      expect(am.catalog.models[slug as keyof typeof am.catalog.models].cardHighlight).not.toBe(
        en.catalog.models[slug as keyof typeof en.catalog.models].cardHighlight
      );
    }
  });

  test("overview category headings match navigation terminology", () => {
    for (const locale of [zh, am]) {
      expect(
        `${locale.products.revenueKing.heading}`.replace(/<[^>]+>/g, "").replace(/\s/g, "")
      ).toBe(locale.nav.revenueKing.replace(/\s/g, ""));
    }
  });

  test("the products overview does not render raw API card copy", async () => {
    const source = await readFile(
      new URL("../../views/products.tsx", import.meta.url),
      "utf8"
    );

    expect(source).toMatch(/translateOverviewCard/);
    expect(source).not.toMatch(/\{car\.desc\}/);
    expect(source).not.toMatch(/\{car\.tag\}/);
    expect(source).not.toMatch(/\{car\.label\}/);
    expect(source).not.toMatch(/\{car\.name\}/);
  });
});
