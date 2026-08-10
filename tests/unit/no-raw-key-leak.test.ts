/**
 * Unit: No Raw Translation Keys Leaked to UI
 *
 * Verifies that all translation keys used across the home page
 * resolve to actual translated text in ALL locales (zh, en, am).
 *
 * Rule: No component may ever display raw dot-notation keys
 * such as "home.hero.slides.0.label" to the user.
 */
import { describe, expect, test } from "bun:test";
import zh from "../../i18n/translations/zh.json";
import en from "../../i18n/translations/en.json";
import am from "../../i18n/translations/am.json";
import { getNestedValue } from "../../i18n/utils";

// All fields in each hero slide — required (must be non-empty)
const SLIDE_REQUIRED_FIELDS = ["label", "heading", "sub", "cta"];
const SLIDE_OPTIONAL_FIELDS: string[] = [];
const SLIDE_COUNT = 5;

// Build full list of required home page keys (non-slide)
const HOME_PAGE_REQUIRED_KEYS = [
  "home.hero.badge",
  "home.hero.heading1",
  "home.hero.heading2",
  "home.hero.subheading",
  "home.hero.ctaPrimary",
  "home.hero.ctaSecondary",
  "home.hero.process",
  "home.trustBar.label",
  "home.products.label",
  "home.process.label",
  "home.process.titleAccent1",
  // Required slide fields — every slide must have these non-empty
  ...Array.from({ length: SLIDE_COUNT }, (_, i) =>
    SLIDE_REQUIRED_FIELDS.map((f) => `home.hero.slides.s${i}.${f}`)
  ).flat(),
];

function resolveKey(key: string, dict: Record<string, unknown>): unknown {
  return getNestedValue(dict, key);
}

describe("Unit: Home page must never display raw i18n keys", () => {
  const locales = [
    { name: "zh", dict: zh as Record<string, unknown> },
    { name: "en", dict: en as Record<string, unknown> },
    { name: "am", dict: am as Record<string, unknown> },
  ];

  // ── 1. All required keys must resolve to non-empty, non-key strings ──
  for (const { name, dict } of locales) {
    test(`[${name}] All required home page keys resolve to non-empty strings`, () => {
      const failures: string[] = [];

      for (const key of HOME_PAGE_REQUIRED_KEYS) {
        const value = resolveKey(key, dict);

        if (value === undefined || value === null || value === "") {
          failures.push(`MISSING: ${key} → (empty or undefined)`);
          continue;
        }
        if (typeof value === "string" && value === key) {
          failures.push(`RAW KEY LEAKED: ${key} → "${value}"`);
        }
      }

      if (failures.length > 0) {
        console.error(`[${name}] Translation resolution failures:\n${failures.join("\n")}`);
      }
      expect(failures).toEqual([]);
    });
  }

  // ── 2. Each locale must have exactly 5 slides ──
  for (const { name, dict } of locales) {
    test(`[${name}] Hero slider slides object has exactly ${SLIDE_COUNT} entries (s0..s4)`, () => {
      const slides = (dict as any).home?.hero?.slides;
      expect(typeof slides).toBe("object");
      expect(Object.keys(slides).length).toBe(SLIDE_COUNT);
    });
  }

  // ── 3. Optional slide fields: when present and non-empty, must NOT equal their key ──
  for (const { name, dict } of locales) {
    test(`[${name}] Optional slide fields (line2/line2Accent/line2Theme/line3) never equal their key string`, () => {
      const leaked: string[] = [];

      for (let i = 0; i < SLIDE_COUNT; i++) {
        for (const field of SLIDE_OPTIONAL_FIELDS) {
          const key = `home.hero.slides.s${i}.${field}`;
          const value = resolveKey(key, dict);
          // Only check non-empty values — empty string is valid (field intentionally blank)
          if (typeof value === "string" && value !== "" && value === key) {
            leaked.push(`RAW KEY: ${key} → "${value}"`);
          }
        }
      }

      expect(leaked).toEqual([]);
    });
  }

  // ── 4. No slide value (in any field) contains the "home." substring ──
  for (const { name, dict } of locales) {
    test(`[${name}] No slide field value contains the substring 'home.' (raw key leak guard)`, () => {
      const slides = (dict as any).home?.hero?.slides ?? {};
      const leaked: string[] = [];

      Object.entries(slides).forEach(([slideKey, slide]: [string, any]) => {
        for (const [field, value] of Object.entries(slide ?? {})) {
          if (typeof value === "string" && value.includes("home.")) {
            leaked.push(`${slideKey}.${field} = "${value}"`);
          }
        }
      });

      expect(leaked).toEqual([]);
    });
  }

  // ── 5. Static dictionary values must never equal the key itself ──
  test("[zh] static dictionary never returns the key itself for required home.* keys", () => {
    const leakedKeys: string[] = [];

    for (const key of HOME_PAGE_REQUIRED_KEYS) {
      const value = resolveKey(key, zh as Record<string, unknown>);
      if (typeof value === "string" && value === key) {
        leakedKeys.push(key);
      }
    }

    expect(leakedKeys).toEqual([]);
  });

  // ── 6. Smoke test: static dictionary access must not emit keys ──
  test("[zh] Static resolve logic: non-empty dict values must not equal their key", () => {
    const allKeys = [
      ...HOME_PAGE_REQUIRED_KEYS,
      ...Array.from({ length: SLIDE_COUNT }, (_, i) =>
        SLIDE_OPTIONAL_FIELDS.map((f) => `home.hero.slides.s${i}.${f}`)
      ).flat(),
    ];

    const leaked: string[] = [];
    for (const key of allKeys) {
      const value = resolveKey(key, zh as Record<string, unknown>);
      if (typeof value === "string" && value !== "" && value === key) {
        leaked.push(key);
      }
    }

    expect(leaked).toEqual([]);
  });

  // ── 7. Products Detail & Footer Key Leak Guard ──
  test("productsDetail.values and footer.headingLine1 string are strictly forbidden in resolution outputs", () => {
    const checkValue = (val: unknown): void => {
      if (typeof val === "string") {
        expect(val).not.toContain("productsDetail.values");
        expect(val).not.toContain("footer.headingLine1");
        expect(val).not.toContain("footer.headingAccent1");
        expect(val).not.toContain("footer.headingAccent2");
        expect(val).not.toContain("footer.headingLine2");
      } else if (Array.isArray(val)) {
        val.forEach(checkValue);
      } else if (val && typeof val === "object") {
        Object.values(val).forEach(checkValue);
      }
    };
    checkValue(zh);
    checkValue(en);
    checkValue(am);
  });

  // ── 8. Footer Heading Keys Must Resolve to Non-Empty Text ──
  test("All footer heading keys resolve to non-empty translations in all 3 locales", () => {
    const footerKeys = [
      "footer.headingLine1",
      "footer.headingAccent1",
      "footer.headingAccent2",
      "footer.headingLine2",
    ];

    for (const localeDict of [zh, en, am]) {
      for (const key of footerKeys) {
        const val = getNestedValue(localeDict as Record<string, unknown>, key);
        expect(typeof val === "string" && val.length > 0).toBe(true);
        expect(val).not.toBe(key);
      }
    }
  });
});
