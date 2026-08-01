import { describe, expect, test } from "bun:test";
import am from "../../i18n/translations/am";
import en from "../../i18n/translations/en";
import zh from "../../i18n/translations/zh";

function getDeepKeyPaths(obj: Record<string, any>, prefix = ""): Map<string, any> {
  let keys = new Map<string, any>();
  for (const [key, value] of Object.entries(obj)) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const childKeys = getDeepKeyPaths(value, currentPath);
      for (const [childPath, childVal] of childKeys) {
        keys.set(childPath, childVal);
      }
    } else {
      keys.set(currentPath, value);
    }
  }
  return keys;
}

function extractPlaceholders(str: string): string[] {
  if (typeof str !== "string") return [];
  const matches = str.match(/\{[a-zA-Z0-9_]+\}/g);
  return matches ? matches.sort() : [];
}

describe("Unit: i18n Translation Completeness & Key Symmetry", () => {
  const zhMap = getDeepKeyPaths(zh);
  const enMap = getDeepKeyPaths(en);
  const amMap = getDeepKeyPaths(am);

  test("ZH, EN, AM dictionaries have 100% identical translation key count", () => {
    expect(zhMap.size).toBe(enMap.size);
    expect(zhMap.size).toBe(amMap.size);
  });

  test("English dictionary contains no missing keys compared to Chinese", () => {
    const missingKeys: string[] = [];
    for (const key of zhMap.keys()) {
      if (!enMap.has(key)) {
        missingKeys.push(key);
      }
    }
    expect(missingKeys).toEqual([]);
  });

  test("Amharic dictionary contains no missing keys compared to Chinese", () => {
    const missingKeys: string[] = [];
    for (const key of zhMap.keys()) {
      if (!amMap.has(key)) {
        missingKeys.push(key);
      }
    }
    expect(missingKeys).toEqual([]);
  });

  test("Array-type translation fields preserve equal length across all languages", () => {
    const mismatchedArrays: string[] = [];
    for (const [key, zhVal] of zhMap.entries()) {
      if (Array.isArray(zhVal)) {
        const enVal = enMap.get(key);
        const amVal = amMap.get(key);

        if (!Array.isArray(enVal) || enVal.length !== zhVal.length) {
          mismatchedArrays.push(`EN array length mismatch at '${key}' (ZH: ${zhVal.length}, EN: ${Array.isArray(enVal) ? enVal.length : "not-array"})`);
        }
        if (!Array.isArray(amVal) || amVal.length !== zhVal.length) {
          mismatchedArrays.push(`AM array length mismatch at '${key}' (ZH: ${zhVal.length}, AM: ${Array.isArray(amVal) ? amVal.length : "not-array"})`);
        }
      }
    }
    expect(mismatchedArrays).toEqual([]);
  });

  test("Dynamic template placeholders ({var}) are identical across all 3 languages", () => {
    const placeholderMismatches: string[] = [];
    for (const [key, zhVal] of zhMap.entries()) {
      if (typeof zhVal === "string" && zhVal.includes("{")) {
        const zhVars = extractPlaceholders(zhVal);
        const enVars = extractPlaceholders(enMap.get(key));
        const amVars = extractPlaceholders(amMap.get(key));

        if (JSON.stringify(zhVars) !== JSON.stringify(enVars)) {
          placeholderMismatches.push(`EN placeholder mismatch at '${key}': ZH ${JSON.stringify(zhVars)} vs EN ${JSON.stringify(enVars)}`);
        }
        if (JSON.stringify(zhVars) !== JSON.stringify(amVars)) {
          placeholderMismatches.push(`AM placeholder mismatch at '${key}': ZH ${JSON.stringify(zhVars)} vs AM ${JSON.stringify(amVars)}`);
        }
      }
    }
    expect(placeholderMismatches).toEqual([]);
  });
});
