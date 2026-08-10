/**
 * Unit: Rich-Text Color Tags — Theme/Accent Tag Integrity
 *
 * Guards against:
 * 1. Unbalanced <theme>/<accent> open/close pairs
 * 2. Residual old <accent1>/<accent2> tags from previous refactor
 * 3. Tag count mismatch between zh and en for the same key (mismatched highlight)
 * 4. Entirely mono-wrapped headings (whole heading inside ONE tag = lost multi-color)
 * 5. br tag structure must be self-closing <br></br> not bare <br>
 */
import { describe, expect, test } from "bun:test";
import zh from "../../i18n/translations/zh.json";
import en from "../../i18n/translations/en.json";
import am from "../../i18n/translations/am.json";

type Dict = Record<string, unknown>;

/** Flatten a nested dict to dot-path → string value map (only string leaves) */
function flatten(obj: Dict, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") {
      result.set(key, v);
    } else if (Array.isArray(v)) {
      v.forEach((item, idx) => {
        if (typeof item === "string") result.set(`${key}.${idx}`, item);
        else if (item && typeof item === "object") {
          for (const [ck, cv] of flatten(item as Dict, `${key}.${idx}`)) {
            result.set(ck, cv);
          }
        }
      });
    } else if (v && typeof v === "object") {
      for (const [ck, cv] of flatten(v as Dict, key)) {
        result.set(ck, cv);
      }
    }
  }
  return result;
}

const zhMap = flatten(zh as Dict);
const enMap = flatten(en as Dict);
const amMap = flatten(am as Dict);

function countTag(val: string, tag: string): number {
  // count opening tags only
  return (val.match(new RegExp(`<${tag}>`, "g")) || []).length;
}

function closeTag(val: string, tag: string): number {
  return (val.match(new RegExp(`</${tag}>`, "g")) || []).length;
}

describe("Rich-Text Color Tags — No Legacy accent1/accent2", () => {
  for (const [langName, map] of [["zh", zhMap], ["en", enMap], ["am", amMap]] as const) {
    test(`[${langName}] No <accent1> or <accent2> tags remain in any translation value`, () => {
      const violations: string[] = [];
      for (const [key, val] of map) {
        if (val.includes("<accent1>") || val.includes("</accent1>") ||
            val.includes("<accent2>") || val.includes("</accent2>")) {
          violations.push(`${key}: ${val.substring(0, 80)}`);
        }
      }
      expect(violations).toEqual([]);
    });
  }
});

describe("Rich-Text Color Tags — Balanced Open/Close Pairs", () => {
  for (const [langName, map] of [["zh", zhMap], ["en", enMap], ["am", amMap]] as const) {
    for (const tag of ["theme", "accent"] as const) {
      test(`[${langName}] All <${tag}> tags have matching closing </${tag}> tags`, () => {
        const unbalanced: string[] = [];
        for (const [key, val] of map) {
          const opens = countTag(val, tag);
          const closes = closeTag(val, tag);
          if (opens !== closes) {
            unbalanced.push(`${key}: opens=${opens} closes=${closes} — "${val.substring(0, 80)}"`);
          }
        }
        expect(unbalanced).toEqual([]);
      });
    }
  }
});

describe("Rich-Text Color Tags — No Wholly-Wrapped Single Color Headings", () => {
  /**
   * A heading that looks like "<theme>entire text here</theme>" is suspicious:
   * it means the entire heading is one color — likely the old multi-key merge lost a tag.
   * We check that heading keys (containing "heading" or "title") with >= 4 CJK/Latin chars
   * inside a tag are NOT wrapping the entire trimmed value.
   */
  test("[zh] Heading keys must not have entire content wrapped in a single theme/accent tag", () => {
    const suspicious: string[] = [];
    for (const [key, val] of zhMap) {
      if (!key.includes("heading") && !key.includes("title")) continue;
      const trimmed = val.trim();
      // Whole string is <theme>...</theme> or <accent>...</accent> with no other tags outside
      const fullyWrappedTheme = /^<theme>[^<]{4,}<\/theme>$/.test(trimmed);
      const fullyWrappedAccent = /^<accent>[^<]{4,}<\/accent>$/.test(trimmed);
      if (fullyWrappedTheme || fullyWrappedAccent) {
        suspicious.push(`${key}: "${trimmed.substring(0, 100)}"`);
      }
    }
    // Report — these should not exist after the multi-color restoration
    expect(suspicious).toEqual([]);
  });
});

describe("Rich-Text Color Tags — Tag Count Consistency Across Locales", () => {
  test("Keys present in both zh and en must have the same number of <theme> tags", () => {
    const mismatches: string[] = [];
    for (const [key, zhVal] of zhMap) {
      const enVal = enMap.get(key);
      if (!enVal || enVal.trim().length === 0) continue;
      const zhTheme = countTag(zhVal, "theme");
      const enTheme = countTag(enVal, "theme");
      if (zhTheme !== enTheme) {
        mismatches.push(`${key}: zh has ${zhTheme} <theme>, en has ${enTheme}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  test("Keys present in both zh and en must have the same number of <accent> tags", () => {
    const mismatches: string[] = [];
    for (const [key, zhVal] of zhMap) {
      const enVal = enMap.get(key);
      if (!enVal || enVal.trim().length === 0) continue;
      const zhAccent = countTag(zhVal, "accent");
      const enAccent = countTag(enVal, "accent");
      if (zhAccent !== enAccent) {
        mismatches.push(`${key}: zh has ${zhAccent} <accent>, en has ${enAccent}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});

describe("Rich-Text Color Tags — Critical Heading Spot Checks", () => {
  const criticalHeadings: Array<{ lang: "zh" | "en" | "am"; key: string; mustHave: string[] }> = [
    // Home page section headings
    { lang: "zh", key: "home.products.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "zh", key: "home.process.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "zh", key: "home.tco.heading", mustHave: ["<theme>", "<accent>", "<br></br>"] },
    { lang: "zh", key: "home.insights.heading", mustHave: ["<theme>", "<br></br>"] },
    { lang: "zh", key: "home.leadMagnet.heading", mustHave: ["<theme>", "<br></br>"] },
    { lang: "en", key: "home.products.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "en", key: "home.process.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "en", key: "home.tco.heading", mustHave: ["<theme>", "<accent>", "<br></br>"] },
    { lang: "en", key: "home.insights.heading", mustHave: ["<theme>", "<br></br>"] },
    { lang: "en", key: "home.leadMagnet.heading", mustHave: ["<theme>", "<br></br>"] },
    // Products Overview
    { lang: "zh", key: "products.utilityPro.heading", mustHave: ["<theme>", "<accent>", "</theme>", "</accent>"] },
    { lang: "zh", key: "products.eliteFlagship.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "zh", key: "products.revenueKing.heading", mustHave: ["<theme>", "<accent>"] },
    // Product detail headings
    { lang: "zh", key: "productsEliteFlagship.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "zh", key: "productsRevenueKing.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "zh", key: "productsUtilityPro.heading", mustHave: ["<theme>", "<accent>"] },
    // Solutions page
    { lang: "zh", key: "solutions.hero.heading", mustHave: ["<theme>", "<accent>"] },
    { lang: "en", key: "solutions.hero.heading", mustHave: ["<theme>", "<accent>"] },
    // Home hero slides must have both colors
    { lang: "zh", key: "home.hero.slides.s0.heading", mustHave: ["<theme>"] },
    // Footer heading
    { lang: "zh", key: "footer.heading", mustHave: ["<theme>"] },
    { lang: "en", key: "footer.heading", mustHave: ["<theme>"] },
  ];

  const maps = { zh: zhMap, en: enMap, am: amMap };

  for (const { lang, key, mustHave } of criticalHeadings) {
    test(`[${lang}] ${key} contains required tags: ${mustHave.join(", ")}`, () => {
      const val = maps[lang].get(key) ?? "";
      expect(val.length).toBeGreaterThan(0); // key exists and is non-empty
      for (const tag of mustHave) {
        expect(val).toContain(tag);
      }
    });
  }
});

describe("Rich-Text Color Tags — br tag format", () => {
  /**
   * Tolgee ICU format requires <br></br> not bare <br /> or <br> in translation strings.
   * The component passes br: <br /> as a param, so the string must use <br></br> syntax.
   */
  test("[zh] All <br> usages follow Tolgee paired <br></br> format (not bare <br>)", () => {
    const malformed: string[] = [];
    for (const [key, val] of zhMap) {
      // If it has <br> but NOT <br></br> format (self-closing or unpaired)
      if (val.includes("<br>") && !val.includes("<br></br>")) {
        malformed.push(`${key}: "${val.substring(0, 80)}"`);
      }
      if (val.includes("<br/>") || val.includes("<br />")) {
        malformed.push(`${key}: bare self-closing: "${val.substring(0, 80)}"`);
      }
    }
    expect(malformed).toEqual([]);
  });

  test("[en] All <br> usages follow Tolgee paired <br></br> format", () => {
    const malformed: string[] = [];
    for (const [key, val] of enMap) {
      if (val.includes("<br>") && !val.includes("<br></br>")) {
        malformed.push(`${key}: "${val.substring(0, 80)}"`);
      }
      if (val.includes("<br/>") || val.includes("<br />")) {
        malformed.push(`${key}: bare self-closing: "${val.substring(0, 80)}"`);
      }
    }
    expect(malformed).toEqual([]);
  });
});
