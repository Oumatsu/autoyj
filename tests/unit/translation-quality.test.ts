import { describe, expect, test } from "bun:test";
import am from "../../i18n/translations/am";
import en from "../../i18n/translations/en";
import zh from "../../i18n/translations/zh";

function flatten(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) {
      Object.assign(result, flatten(v, key));
    } else {
      result[key] = String(v);
    }
  }
  return result;
}

describe("Unit: Translation Quality & Zero Chinese Leakage Guard", () => {
  const enFlat = flatten(en);
  const amFlat = flatten(am);

  test("English dictionary contains ZERO residual Chinese characters", () => {
    const chineseInEn = Object.entries(enFlat).filter(([, v]) => /[\u4e00-\u9fa5]/.test(v));
    expect(chineseInEn).toEqual([]);
  });

  test("Amharic dictionary contains ZERO residual Chinese characters", () => {
    const chineseInAm = Object.entries(amFlat).filter(([, v]) => /[\u4e00-\u9fa5]/.test(v));
    expect(chineseInAm).toEqual([]);
  });

  test("Solutions headings match localized copy without formatting errors", () => {
    expect(zh.solutions.hero.heading).toContain("一站式经销商赋能体系");
    expect(en.solutions.hero.heading).toContain("Verified");
  });
});
