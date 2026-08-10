/**
 * Unit / Page Test: Solutions Page (& All Pages) Tolgee Runtime i18n Verification
 *
 * Verifies that page translation entries via Tolgee runtime (using /en/solutions as primary pattern):
 * 1. Never leak raw translation key identifiers (e.g., "solutions.hero.heading")
 * 2. Contain ZERO Chinese characters in English locale ("en") (e.g. no "严格的出港前品控检测流程 (PDI)")
 */
if (typeof globalThis.NodeFilter === "undefined") {
  (globalThis as any).NodeFilter = { SHOW_ELEMENT: 1 };
}
if (typeof globalThis.document === "undefined") {
  (globalThis as any).document = {
    createTreeWalker: () => ({ nextNode: () => null }),
    querySelectorAll: () => [],
    querySelector: () => null,
  };
}

import { describe, expect, test, beforeAll } from "bun:test";
import { createTolgee } from "../../lib/tolgee";
import en from "../../i18n/translations/en.json";

function flattenKeys(obj: Record<string, any>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, key));
    } else {
      keys.push(key);
    }
  }
  return keys;
}

const allKeys = flattenKeys(en as Record<string, any>);

describe("Page i18n Audit (Tolgee Runtime) — Solutions Page (/en/solutions)", () => {
  let tolgee: any;

  beforeAll(async () => {
    tolgee = createTolgee("en");
    await tolgee.run();
  });

  test("Requirement 1: Solutions page in English must not display raw translation keys (e.g. solutions.hero.heading)", () => {
    const leakedKeys: string[] = [];
    for (const key of allKeys) {
      if (!key.startsWith("solutions.")) continue;
      const val = tolgee.t(key);
      const cleanVal = String(val).replace(/[\u200B-\u200D\uFEFF]/g, "");
      if (cleanVal === key || cleanVal.includes("solutions.hero.heading")) {
        leakedKeys.push(`${key} -> "${cleanVal}"`);
      }
    }
    expect(leakedKeys).toEqual([]);
  });

  test("Requirement 2: Solutions page in English must contain ZERO Chinese characters (e.g. no '严格的出港前品控检测流程 (PDI)')", () => {
    const chineseLeaked: string[] = [];
    const chineseRegex = /[\u4e00-\u9fa5]/;

    for (const key of allKeys) {
      if (!key.startsWith("solutions.")) continue;
      const val = tolgee.t(key);
      const cleanVal = String(val).replace(/[\u200B-\u200D\uFEFF]/g, "");
      if (chineseRegex.test(cleanVal)) {
        chineseLeaked.push(`${key}: "${cleanVal}"`);
      }
    }

    expect(chineseLeaked).toEqual([]);
  });
});

describe("Page i18n Audit (Tolgee Runtime) — All Pages English Character Hygiene", () => {
  let tolgee: any;

  beforeAll(async () => {
    tolgee = createTolgee("en");
    await tolgee.run();
  });

  const pages = ["solutions", "products", "insights", "academy", "about", "contact", "home", "nav", "footer"];

  for (const pageName of pages) {
    test(`[en] Page '${pageName}' has no raw key leaks or residual Chinese characters in Tolgee runtime`, () => {
      const issues: string[] = [];
      const chineseRegex = /[\u4e00-\u9fa5]/;

      for (const key of allKeys) {
        if (!key.startsWith(`${pageName}.`)) continue;
        let val: unknown;
        try {
          val = tolgee.t(key, { amount: "100", current: "1", total: "2", title: "Test", index: "1", count: "10", label: "Test" });
        } catch {
          continue;
        }
        const cleanVal = String(val).replace(/[\u200B-\u200D\uFEFF]/g, "");
        if (cleanVal === key) {
          issues.push(`RAW KEY LEAK: ${key}`);
        }
        if (chineseRegex.test(cleanVal)) {
          issues.push(`CHINESE RESIDUAL: ${key} = "${cleanVal}"`);
        }
      }

      expect(issues).toEqual([]);
    });
  }
});
