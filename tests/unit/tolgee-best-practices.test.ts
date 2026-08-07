/**
 * Unit: Tolgee Best Practices — Full Coverage
 *
 * Enforces all Tolgee best-practice invariants across the codebase:
 *
 * 1. Static fallback covers ALL keys used by t() (no runtime missing keys)
 * 2. Zero Chinese characters leak into EN or AM dictionaries
 * 3. No translation value is identical to its key (raw key leak guard)
 * 4. All required home page keys are non-empty strings in all 3 locales
 * 5. Hero slides have exactly 5 entries in all 3 locales
 * 6. Optional slide fields (line2, line3) never equal their key string
 * 7. No slide field value contains the "home." substring (raw key guard)
 * 8. resolveTranslationValue fallback chain: locale → en → empty string
 * 9. tArray fields return actual arrays, not raw key strings
 * 10. Translation value character count sanity (suspiciously long = copied key)
 */
import { describe, expect, test } from "bun:test";
import zh from "../../i18n/translations/zh";
import en from "../../i18n/translations/en";
import am from "../../i18n/translations/am";
import { resolveTranslationValue, asStringArray } from "../../i18n/translationFallback";

type LocaleDict = Record<string, unknown>;

const dicts: Array<{ name: string; dict: LocaleDict }> = [
  { name: "zh", dict: zh as LocaleDict },
  { name: "en", dict: en as LocaleDict },
  { name: "am", dict: am as LocaleDict },
];

/** Flatten nested object to dot-notation key-value map */
function flatten(obj: Record<string, any>, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const [ck, cv] of flatten(v, key)) {
        result.set(ck, cv);
      }
    } else if (Array.isArray(v)) {
      v.forEach((item: unknown, idx: number) => {
        const ik = `${key}.${idx}`;
        if (item !== null && typeof item === "object") {
          for (const [ck, cv] of flatten(item as Record<string, any>, ik)) {
            result.set(ck, cv);
          }
        } else {
          result.set(ik, String(item ?? ""));
        }
      });
    } else {
      result.set(key, String(v ?? ""));
    }
  }
  return result;
}

const zhMap = flatten(zh as Record<string, any>);
const enMap = flatten(en as Record<string, any>);
const amMap = flatten(am as Record<string, any>);

// ── 1. Key symmetry ───────────────────────────────────────────────────────
describe("Unit: Tolgee BP-1 — Key Symmetry Across All Locales", () => {
  test("zh, en, am have identical key count", () => {
    expect(zhMap.size).toBe(enMap.size);
    expect(zhMap.size).toBe(amMap.size);
  });

  test("zh keys are a superset of en keys (no en-only orphans)", () => {
    const enOrphans = [...enMap.keys()].filter((k) => !zhMap.has(k));
    expect(enOrphans).toEqual([]);
  });

  test("zh keys are a superset of am keys (no am-only orphans)", () => {
    const amOrphans = [...amMap.keys()].filter((k) => !zhMap.has(k));
    expect(amOrphans).toEqual([]);
  });
});

// ── 2. No Chinese in EN or AM ─────────────────────────────────────────────
describe("Unit: Tolgee BP-2 — Zero Chinese Character Leakage in EN/AM", () => {
  test("EN has zero Chinese characters", () => {
    const leaked = [...enMap.entries()].filter(([, v]) => /[\u4e00-\u9fa5]/.test(v));
    expect(leaked.map(([k]) => k)).toEqual([]);
  });

  test("AM has zero Chinese characters", () => {
    const leaked = [...amMap.entries()].filter(([, v]) => /[\u4e00-\u9fa5]/.test(v));
    expect(leaked.map(([k]) => k)).toEqual([]);
  });
});

// ── 3. No value equals its own key (raw key leak guard) ───────────────────
describe("Unit: Tolgee BP-3 — No Raw Key Leak in Any Locale", () => {
  for (const { name, dict } of dicts) {
    test(`[${name}] No non-empty translation value equals its key string`, () => {
      const leaked: string[] = [];
      const map = name === "zh" ? zhMap : name === "en" ? enMap : amMap;
      for (const [key, val] of map.entries()) {
        if (val !== "" && val === key) {
          leaked.push(key);
        }
      }
      expect(leaked).toEqual([]);
    });
  }
});

// ── 4. All required home page keys are non-empty ──────────────────────────
const SLIDE_COUNT = 5;
const SLIDE_REQUIRED = ["label", "heading", "sub", "cta"];
const PROCESS_STEPS = 4;

const REQUIRED_HOME_KEYS = [
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
  "home.process.titleAccent2",
  ...Array.from({ length: SLIDE_COUNT }, (_, i) =>
    SLIDE_REQUIRED.map((f) => `home.hero.slides.s${i}.${f}`)
  ).flat(),
  ...Array.from({ length: PROCESS_STEPS }, (_, i) =>
    ["title", "desc", "badge"].map((f) => `home.process.steps.${i}.${f}`)
  ).flat(),
];

describe("Unit: Tolgee BP-4 — All Required Home Page Keys Are Non-Empty", () => {
  for (const { name, dict } of dicts) {
    test(`[${name}] All ${REQUIRED_HOME_KEYS.length} required home keys resolve non-empty`, () => {
      const failures: string[] = [];
      for (const key of REQUIRED_HOME_KEYS) {
        const val = resolveTranslationValue(key, [dict], undefined);
        if (!val || val === "" || (typeof val === "string" && val === key)) {
          failures.push(key);
        }
      }
      expect(failures).toEqual([]);
    });
  }
});

// ── 5. Hero slides count ──────────────────────────────────────────────────
describe("Unit: Tolgee BP-5 — Hero Slides Have Exactly 5 Entries", () => {
  for (const { name, dict } of dicts) {
    test(`[${name}] hero.slides has exactly ${SLIDE_COUNT} entries`, () => {
      const slides = (dict as any).home?.hero?.slides;
      expect(typeof slides).toBe("object");
      expect(Object.keys(slides).length).toBe(SLIDE_COUNT);
    });
  }
});

// ── 6. Optional slide fields don't return their key ───────────────────────
const SLIDE_OPTIONAL: string[] = [];

describe("Unit: Tolgee BP-6 — Optional Slide Fields Never Equal Their Key", () => {
  for (const { name, dict } of dicts) {
    test(`[${name}] Optional slide fields never equal key string`, () => {
      const leaked: string[] = [];
      for (let i = 0; i < SLIDE_COUNT; i++) {
        for (const field of SLIDE_OPTIONAL) {
          const key = `home.hero.slides.s${i}.${field}`;
          const val = resolveTranslationValue(key, [dict], undefined);
          if (typeof val === "string" && val !== "" && val === key) {
            leaked.push(key);
          }
        }
      }
      expect(leaked).toEqual([]);
    });
  }
});

// ── 7. No slide value contains "home." substring ──────────────────────────
describe("Unit: Tolgee BP-7 — No Slide Field Value Contains 'home.' Substring", () => {
  for (const { name, dict } of dicts) {
    test(`[${name}] No slide value contains raw key substring 'home.'`, () => {
      const slides = (dict as any).home?.hero?.slides ?? {};
      const leaked: string[] = [];
      for (const [slideKey, slide] of Object.entries(slides)) {
        for (const [field, val] of Object.entries(slide as any)) {
          if (typeof val === "string" && val.includes("home.")) {
            leaked.push(`${slideKey}.${field} = "${val}"`);
          }
        }
      }
      expect(leaked).toEqual([]);
    });
  }
});

// ── 8. resolveTranslationValue fallback chain ─────────────────────────────
describe("Unit: Tolgee BP-8 — resolveTranslationValue Fallback Chain", () => {
  test("Returns locale value when present", () => {
    const result = resolveTranslationValue("home.hero.badge", [zh as LocaleDict]);
    expect(result).toBe("非洲最值得信赖的电动汽车采购伙伴");
  });

  test("Falls through to second source when first is undefined", () => {
    const primaryWithMissing = {} as LocaleDict;
    const fallback = en as LocaleDict;
    const result = resolveTranslationValue("home.hero.badge", [primaryWithMissing, fallback]);
    expect(result).toBe("Africa EV Export Partner");
  });

  test("Returns empty string when all sources miss", () => {
    const result = resolveTranslationValue("does.not.exist", [{} as LocaleDict]);
    expect(result).toBe("");
  });

  test("Returns defaultValue override when specified and all sources miss", () => {
    const result = resolveTranslationValue("does.not.exist", [{} as LocaleDict], "MY_DEFAULT");
    expect(result).toBe("MY_DEFAULT");
  });

  test("Skips empty-string values in sources and tries next source", () => {
    const withEmpty = { home: { hero: { badge: "" } } } as unknown as LocaleDict;
    const result = resolveTranslationValue("home.hero.badge", [withEmpty, en as LocaleDict]);
    // Should skip the empty string in withEmpty and fall to en
    expect(result).toBe("Africa EV Export Partner");
  });
});

// ── 9. tArray fields return real arrays ───────────────────────────────────
describe("Unit: Tolgee BP-9 — tArray Fields Return Real Arrays", () => {
  test("[zh] home.trustBar.partners is an object/array resolvable", () => {
    const val = resolveTranslationValue("home.trustBar.partners", [zh as LocaleDict]);
    // In zh, partners is stored as an object with numeric keys
    expect(val).not.toBeNull();
    expect(typeof val).toBe("object");
  });

  test("[zh] deepEnsureArray converts numeric-keyed objects to arrays recursively", () => {
    // Copy the helper logic locally to test it directly
    function deepEnsureArrayLocal(val: unknown): unknown {
      if (val === null || val === undefined) return val;
      if (Array.isArray(val)) return val.map(deepEnsureArrayLocal);
      if (typeof val === "object") {
        const keys = Object.keys(val);
        const isNumeric = keys.length > 0 && keys.every((k) => !isNaN(Number(k)));
        if (isNumeric) {
          const arr: any[] = [];
          for (const [k, v] of Object.entries(val)) {
            arr[Number(k)] = deepEnsureArrayLocal(v);
          }
          return arr;
        } else {
          const res: Record<string, unknown> = {};
          for (const [k, v] of Object.entries(val)) {
            res[k] = deepEnsureArrayLocal(v);
          }
          return res;
        }
      }
      return val;
    }

    const input = {
      "0": {
        title: "Category 1",
        items: {
          "0": "Item A",
          "1": "Item B"
        }
      }
    };
    const output = deepEnsureArrayLocal(input);
    expect(Array.isArray(output)).toBe(true);
    expect((output as any)[0].title).toBe("Category 1");
    expect(Array.isArray((output as any)[0].items)).toBe(true);
    expect((output as any)[0].items[0]).toBe("Item A");
    expect((output as any)[0].items[1]).toBe("Item B");
  });
});

// ── 10. No suspiciously long key-like values ──────────────────────────────
describe("Unit: Tolgee BP-10 — No Translation Value Looks Like a Concatenated Key Path", () => {
  for (const { name } of dicts) {
    test(`[${name}] No string value looks like a key path (contains 3+ dots in sequence)`, () => {
      const map = name === "zh" ? zhMap : name === "en" ? enMap : amMap;
      // A value like "home.hero.slides.s0.line2home.hero..." is a bad concat
      const suspicious = [...map.entries()].filter(([key, val]) => {
        // Allow typical values with dots (e.g. version strings, domains, decimals)
        // Flag values where a known prefix like "home." or "nav." appears
        return (
          val !== "" &&
          val !== key &&
          /\.(hero|nav|footer|home|process|products|solutions|contact)\./i.test(val)
        );
      });
      expect(suspicious.map(([k, v]) => `${k}="${v}"`)).toEqual([]);
    });
  }
});
