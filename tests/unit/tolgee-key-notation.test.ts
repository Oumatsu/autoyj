/**
 * Unit: Tolgee Key Notation Consistency
 *
 * Verifies that the tolgee-sync flattenToDot() function produces
 * dot-notation keys that exactly match what resolveTranslationValue() expects.
 *
 * Root-cause test for the bracket-notation bug where Tolgee stored
 * keys as "home.process.steps[3].title" instead of "home.process.steps.3.title".
 */
import { describe, expect, test } from "bun:test";
import zh from "../../i18n/translations/zh";
import en from "../../i18n/translations/en";
import am from "../../i18n/translations/am";
import { resolveTranslationValue } from "../../i18n/translationFallback";

// Replicate the flattenToDot logic from scripts/tolgee-sync.ts
function flattenToDot(
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value === null || value === undefined) {
      result[fullKey] = "";
    } else if (typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenToDot(value as Record<string, unknown>, fullKey));
    } else if (Array.isArray(value)) {
      (value as unknown[]).forEach((item, idx) => {
        const idxKey = `${fullKey}.${idx}`;
        if (item === null || item === undefined) {
          result[idxKey] = "";
        } else if (typeof item === "object") {
          Object.assign(result, flattenToDot(item as Record<string, unknown>, idxKey));
        } else {
          result[idxKey] = String(item);
        }
      });
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

const zhFlat = flattenToDot(zh as Record<string, unknown>);
const enFlat = flattenToDot(en as Record<string, unknown>);
const amFlat = flattenToDot(am as Record<string, unknown>);

describe("Unit: Tolgee Key Notation — No Bracket Notation", () => {
  test("flattenToDot produces zero bracket-notation keys for zh", () => {
    const bracketKeys = Object.keys(zhFlat).filter((k) => k.includes("["));
    expect(bracketKeys).toEqual([]);
  });

  test("flattenToDot produces zero bracket-notation keys for en", () => {
    const bracketKeys = Object.keys(enFlat).filter((k) => k.includes("["));
    expect(bracketKeys).toEqual([]);
  });

  test("flattenToDot produces zero bracket-notation keys for am", () => {
    const bracketKeys = Object.keys(amFlat).filter((k) => k.includes("["));
    expect(bracketKeys).toEqual([]);
  });

  test("All flat keys are valid dot-notation strings", () => {
    const invalidKeys = Object.keys(zhFlat).filter((k) => /[\[\]]/.test(k) || k.startsWith(".") || k.endsWith("."));
    expect(invalidKeys).toEqual([]);
  });

  test("flattenToDot zh, en, am produce identical key sets", () => {
    const zhKeys = new Set(Object.keys(zhFlat));
    const enKeys = new Set(Object.keys(enFlat));
    const amKeys = new Set(Object.keys(amFlat));

    const inZhNotEn = [...zhKeys].filter((k) => !enKeys.has(k));
    const inZhNotAm = [...zhKeys].filter((k) => !amKeys.has(k));
    expect(inZhNotEn).toEqual([]);
    expect(inZhNotAm).toEqual([]);
  });
});

describe("Unit: Tolgee Key → resolveTranslationValue Round-Trip", () => {
  // Critical process steps (these were the ones showing as "key doesn't exist" in Tolgee UI)
  const processStepKeys = [
    "home.process.steps.0.title",
    "home.process.steps.0.desc",
    "home.process.steps.0.badge",
    "home.process.steps.1.title",
    "home.process.steps.1.desc",
    "home.process.steps.1.badge",
    "home.process.steps.2.title",
    "home.process.steps.2.desc",
    "home.process.steps.2.badge",
    "home.process.steps.3.title",
    "home.process.steps.3.desc",
    "home.process.steps.3.badge",
  ];

  for (const key of processStepKeys) {
    test(`[zh] resolveTranslationValue("${key}") returns non-empty string`, () => {
      const val = resolveTranslationValue(key, [zh as Record<string, unknown>], undefined);
      expect(typeof val).toBe("string");
      expect(val).not.toBe("");
      expect(val).not.toBe(key); // Must not return the key itself
    });
  }

  test("[zh] All process steps have title, desc and badge resolved", () => {
    const missingKeys: string[] = [];
    for (const key of processStepKeys) {
      const val = resolveTranslationValue(key, [zh as Record<string, unknown>], undefined);
      if (!val || val === key) {
        missingKeys.push(key);
      }
    }
    expect(missingKeys).toEqual([]);
  });

  // Stats array (also stored as numeric keys in zh)
  const processStatKeys = [
    "home.process.stats.0.num",
    "home.process.stats.0.label",
    "home.process.stats.1.num",
    "home.process.stats.1.label",
    "home.process.stats.2.num",
    "home.process.stats.2.label",
    "home.process.stats.3.num",
    "home.process.stats.3.label",
  ];

  test("[zh] All process stats resolve with dot-notation", () => {
    const missingKeys: string[] = [];
    for (const key of processStatKeys) {
      const val = resolveTranslationValue(key, [zh as Record<string, unknown>], undefined);
      if (!val || val === key) {
        missingKeys.push(key);
      }
    }
    expect(missingKeys).toEqual([]);
  });

  test("flattenToDot keys always resolvable via resolveTranslationValue", () => {
    // Every key that flattenToDot produces from zh should be resolvable.
    // Note: boolean values (e.g. home.tco.benefits.2.accent = true) are stored
    // as strings in Tolgee but returned as native booleans by resolveTranslationValue.
    // We normalize both sides to string for comparison.
    const unresolvable: string[] = [];
    for (const [key, flatVal] of Object.entries(zhFlat)) {
      if (flatVal === "") continue; // empty string fields are intentionally blank
      const resolved = resolveTranslationValue(key, [zh as Record<string, unknown>], undefined);
      if (String(resolved) !== String(flatVal)) {
        unresolvable.push(`${key}: expected "${flatVal}", got "${String(resolved)}"`);
      }
    }
    expect(unresolvable).toEqual([]);
  });
});

describe("Unit: Tolgee Sync Key Count Sanity", () => {
  test("zh, en, am flat key counts are identical and non-empty", () => {
    const zhCount = Object.keys(zhFlat).length;
    const enCount = Object.keys(enFlat).length;
    const amCount = Object.keys(amFlat).length;
    expect(zhCount).toBeGreaterThan(1000);
    expect(enCount).toBe(zhCount);
    expect(amCount).toBe(zhCount);
  });
});
