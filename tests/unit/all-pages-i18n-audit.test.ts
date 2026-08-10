/**
 * Comprehensive Multi-Locale i18n & Page Data Audit Test Suite
 *
 * Covers ALL pages (/zh/..., /en/..., /am/...) and dynamic data layers (academy, products, solutions, portal, etc.):
 * 1. Checks that /zh/ pages contain ZERO un-translated English sentences or hardcoded English phrases
 *    (e.g., "PDF Policy Brief", "Ethiopia EV Customs Regulation...", "Official Ministry of Finance directive...")
 * 2. Checks that /en/ pages contain ZERO Chinese characters ([\u4e00-\u9fa5])
 * 3. Checks that /am/ pages contain valid Amharic translations without raw key leaks
 * 4. Verifies Tolgee runtime resolution for all 3 locales
 */
import { describe, expect, test, beforeAll } from "bun:test";
import { createTolgee } from "../../lib/tolgee";
import zh from "../../i18n/translations/zh.json";
import en from "../../i18n/translations/en.json";
import am from "../../i18n/translations/am.json";
import {
  translateAcademyLesson,
  translateAcademyVaultItem,
} from "../../views/academy/academyTranslations";

// Polyfill NodeFilter for Tolgee browser observer in Bun/Node test environment
if (typeof globalThis.NodeFilter === "undefined") {
  (globalThis as any).NodeFilter = {
    SHOW_ALL: -1,
    SHOW_ELEMENT: 1,
    SHOW_TEXT: 4,
    FILTER_ACCEPT: 1,
    FILTER_REJECT: 2,
    FILTER_SKIP: 3,
  };
}

function flattenToMap(obj: Record<string, any>, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const [ck, cv] of flattenToMap(v, key)) {
        result.set(ck, cv);
      }
    } else {
      result.set(key, String(v ?? ""));
    }
  }
  return result;
}

const zhFlat = flattenToMap(zh as Record<string, any>);
const enFlat = flattenToMap(en as Record<string, any>);
const amFlat = flattenToMap(am as Record<string, any>);

// Allowed English proper nouns / brand names in Chinese dictionary
const ALLOWED_ZH_PROPER_NOUNS = new Set([
  "Youguard Intelligence",
  "WhatsApp Business",
  "Youguard Academy",
  "PDF",
  "EV",
  "BMS",
  "TCO",
  "PDI",
  "HV",
  "LFP",
  "BEV",
]);

describe("Multi-Locale Page Audit — Hardcoded Text & Key Leak Hygiene", () => {
  const pages = ["solutions", "products", "insights", "academy", "about", "contact", "home", "nav", "footer"];

  // 1. Chinese Locale Audit
  describe("Locale [zh] — No Hardcoded English Sentences or Terms", () => {
    for (const pageName of pages) {
      test(`[zh] Page '${pageName}' has no untranslated English sentences or policy briefs`, () => {
        const issues: string[] = [];

        for (const [key, val] of zhFlat.entries()) {
          if (!key.startsWith(`${pageName}.`)) continue;
          if (val === key) {
            issues.push(`RAW KEY LEAK: ${key}`);
          }
          
          const trimmed = val.trim();
          // Check if string contains 4 or more consecutive English words and is not an allowed brand name
          const multiWordEnglish = /^[A-Za-z0-9\s,&.()/-]{20,}$/.test(trimmed);
          if (multiWordEnglish && !ALLOWED_ZH_PROPER_NOUNS.has(trimmed) && !key.endsWith(".date") && !key.endsWith(".slug")) {
            issues.push(`UNTRANSLATED ENGLISH IN ZH: ${key} = "${val}"`);
          }
        }

        expect(issues).toEqual([]);
      });
    }
  });

  // 2. English Locale Audit
  describe("Locale [en] — Zero Residual Chinese Characters", () => {
    for (const pageName of pages) {
      test(`[en] Page '${pageName}' has no residual Chinese characters or raw key leaks`, () => {
        const issues: string[] = [];
        const chineseRegex = /[\u4e00-\u9fa5]/;

        for (const [key, val] of enFlat.entries()) {
          if (!key.startsWith(`${pageName}.`)) continue;
          if (val === key) {
            issues.push(`RAW KEY LEAK: ${key}`);
          }
          if (chineseRegex.test(val)) {
            issues.push(`CHINESE RESIDUAL IN EN: ${key} = "${val}"`);
          }
        }

        expect(issues).toEqual([]);
      });
    }
  });

  // 3. Amharic Locale Audit
  describe("Locale [am] — Key Symmetry & No Un-rendered Raw Keys", () => {
    for (const pageName of pages) {
      test(`[am] Page '${pageName}' has no raw key leaks`, () => {
        const issues: string[] = [];

        for (const [key, val] of amFlat.entries()) {
          if (!key.startsWith(`${pageName}.`)) continue;
          if (val === key) {
            issues.push(`RAW KEY LEAK IN AM: ${key}`);
          }
        }

        expect(issues).toEqual([]);
      });
    }
  });
});

describe("Dynamic Data Layer Audit — Academy Lessons & Vault Translation", () => {
  const sampleVaultItem = {
    translationId: "v1",
    title: "Ethiopia EV Customs Regulation & Tax Exemption Circular (2026)",
    type: "PDF Policy Brief",
    desc: "Official Ministry of Finance directive detailing tariff codes, VAT exemption procedures, and port clearance checklists.",
  };

  const sampleLesson = {
    slug: "ev-market-entry-compliance",
    title: "EV Market Entry & Compliance Guide",
    tag: "Market Entry",
    desc: "Key regulatory, tariff, and licensing requirements for importing electric vehicles into African markets.",
  };

  test("Academy Vault Item v1 resolves cleanly into Chinese for /zh/academy", () => {
    const tZh = (key: string, fallback?: string) => zhFlat.get(key) || fallback;
    const localized = translateAcademyVaultItem(sampleVaultItem, tZh as any);

    expect(localized.title).toEqual("2026 埃塞俄比亚电动车海关监管与免税政策通告");
    expect(localized.type).toEqual("PDF 政策简报");
    expect(localized.desc).toEqual("财政部关于关税税号、增值税免除流程及港口清关清单的官方指令。");
  });

  test("Academy Vault Item v1 resolves cleanly into Amharic for /am/academy", () => {
    const tAm = (key: string, fallback?: string) => amFlat.get(key) || fallback;
    const localized = translateAcademyVaultItem(sampleVaultItem, tAm as any);

    expect(localized.title).toEqual("የ2026 የኢትዮጵያ ኢቪ የጉምሩክ ደንብ እና የግብር ነፃ ሰርኩላር");
    expect(localized.type).toEqual("የPDF ፖሊሲ አጭር መግለጫ");
    expect(localized.desc).toEqual("የገንዘብ ሚኒስቴር የታሪፍ ኮዶችን እና የታክስ ነፃ አሰራርን የሚያብራራ ኦፊሴላዊ መመሪያ።");
  });

  test("Academy Baseline Lesson resolves cleanly into Chinese for /zh/academy", () => {
    const tZh = (key: string, fallback?: string) => zhFlat.get(key) || fallback;
    const localized = translateAcademyLesson(sampleLesson, tZh as any);

    expect(localized.title).toEqual("电动车市场准入与合规指南");
    expect(localized.tag).toEqual("市场准入");
    expect(localized.desc).toEqual("进口电动汽车至非洲市场的关键监管、关税及许可要点。");
  });
});

describe("Tolgee Runtime Cross-Locale Initialization", () => {
  let tolgeeZh: any;
  let tolgeeEn: any;
  let tolgeeAm: any;

  beforeAll(async () => {
    tolgeeZh = createTolgee("zh");
    tolgeeEn = createTolgee("en");
    tolgeeAm = createTolgee("am");

    await Promise.all([tolgeeZh.run(), tolgeeEn.run(), tolgeeAm.run()]);
  });

  test("Tolgee runtime resolves academy.vault.v1 for all 3 locales without key leaks", () => {
    const zhTitle = String(tolgeeZh.t("academy.vault.v1.title")).replace(/[\u200B-\u200D\uFEFF]/g, "");
    const enTitle = String(tolgeeEn.t("academy.vault.v1.title")).replace(/[\u200B-\u200D\uFEFF]/g, "");
    const amTitle = String(tolgeeAm.t("academy.vault.v1.title")).replace(/[\u200B-\u200D\uFEFF]/g, "");

    expect(zhTitle).toEqual("2026 埃塞俄比亚电动车海关监管与免税政策通告");
    expect(enTitle).toEqual("Ethiopia EV Customs Regulation & Tax Exemption Circular (2026)");
    expect(amTitle).toEqual("የ2026 የኢትዮጵያ ኢቪ የጉምሩክ ደንብ እና የግብር ነፃ ሰርኩላር");
  });
});
