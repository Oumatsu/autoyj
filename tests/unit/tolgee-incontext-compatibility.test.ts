/**
 * Unit: Tolgee InContext Editor Compatibility
 *
 * Verifies that every key used by t() in components corresponds to
 * an actual entry in the static translation dictionaries.
 * This ensures InContext editing (alt-click) always finds the key,
 * not the "key doesn't exist yet" warning.
 *
 * Keys tested here are the exact strings passed to t() in:
 * - components/HeroSlider.tsx
 * - components/SectionTabs.tsx
 * - components/Navbar.tsx
 * - components/Footer.tsx
 * - views/page.tsx (home page)
 */
import { describe, expect, test } from "bun:test";
import zh from "../../i18n/translations/zh.json";
import en from "../../i18n/translations/en.json";
import am from "../../i18n/translations/am.json";
import { getNestedValue } from "../../i18n/utils";

type LocaleDict = Record<string, unknown>;

const dicts: Record<string, LocaleDict> = {
  zh: zh as LocaleDict,
  en: en as LocaleDict,
  am: am as LocaleDict,
};

function resolve(key: string, locale: string): unknown {
  return getNestedValue(dicts[locale], key);
}

function assertKey(key: string): void {
  for (const locale of ["zh", "en", "am"]) {
    const val = resolve(key, locale);
    if (val === undefined || val === null || val === "") {
      throw new Error(`[${locale}] Key "${key}" resolved to empty/undefined`);
    }
    if (typeof val === "string" && val === key) {
      throw new Error(`[${locale}] Key "${key}" returned its own key string (raw key leak)`);
    }
  }
}

// ── HeroSlider component keys ──────────────────────────────────────────────
const HERO_SLIDE_COUNT = 5;
const heroSlideRequiredFields = ["label", "heading", "sub", "cta"];
const heroSlideOptionalFields: string[] = [];

describe("Unit: Tolgee InContext — HeroSlider keys resolve in all locales", () => {
  test("home.hero.process resolves in all locales", () => {
    assertKey("home.hero.process");
  });

  for (let i = 0; i < HERO_SLIDE_COUNT; i++) {
    for (const field of heroSlideRequiredFields) {
      const key = `home.hero.slides.s${i}.${field}`;
      test(`${key} resolves as non-empty`, () => {
        assertKey(key);
      });
    }

    for (const field of heroSlideOptionalFields) {
      const key = `home.hero.slides.s${i}.${field}`;
      test(`${key} never returns raw key string (may be empty)`, () => {
        for (const locale of ["zh", "en", "am"]) {
          const val = resolve(key, locale);
          if (typeof val === "string" && val === key) {
            throw new Error(`[${locale}] Raw key leak: "${key}"`);
          }
        }
      });
    }
  }
});

// ── HomePage process section keys ─────────────────────────────────────────
const processStepFields = ["title", "desc", "badge"];
const PROCESS_STEP_COUNT = 4;

describe("Unit: Tolgee InContext — Home Process Steps resolve in all locales", () => {
  test("home.process.label resolves", () => assertKey("home.process.label"));
  test("home.process.title resolves", () => assertKey("home.process.title"));

  for (let i = 0; i < PROCESS_STEP_COUNT; i++) {
    for (const field of processStepFields) {
      const key = `home.process.steps.${i}.${field}`;
      test(`${key} resolves as non-empty in all locales`, () => {
        assertKey(key);
      });
    }
  }
});

// ── Trust Bar ─────────────────────────────────────────────────────────────
describe("Unit: Tolgee InContext — Trust Bar keys", () => {
  test("home.trustBar.label resolves in all locales", () => {
    assertKey("home.trustBar.label");
  });
});

// ── Products section keys ─────────────────────────────────────────────────
const PRODUCT_KEYS = [
  "home.products.label",
  "home.products.revenueKing.badge",
  "home.products.revenueKing.category",
  "home.products.revenueKing.title",
  "home.products.revenueKing.desc",
  "home.products.eliteFlagship.badge",
  "home.products.eliteFlagship.category",
  "home.products.eliteFlagship.title",
  "home.products.eliteFlagship.desc",
  "home.products.utilityPro.badge",
  "home.products.utilityPro.category",
  "home.products.utilityPro.title",
  "home.products.utilityPro.desc",
];

describe("Unit: Tolgee InContext — Products section keys resolve in all locales", () => {
  for (const key of PRODUCT_KEYS) {
    test(`${key} resolves in all locales`, () => {
      assertKey(key);
    });
  }
});

// ── Navbar keys ───────────────────────────────────────────────────────────
const NAV_KEYS = [
  "nav.vehicles",
  "nav.solutions",
  "nav.insights",
  "nav.academy",
  "nav.about",
  "nav.contactUs",
  "nav.signIn",
];

describe("Unit: Tolgee InContext — Navbar keys resolve in all locales", () => {
  for (const key of NAV_KEYS) {
    test(`${key} resolves in all locales`, () => {
      assertKey(key);
    });
  }
});

// ── Common keys ───────────────────────────────────────────────────────────
const COMMON_KEYS = ["common.fullCatalog", "common.readMore", "common.cancel"];

describe("Unit: Tolgee InContext — Common keys resolve in all locales", () => {
  for (const key of COMMON_KEYS) {
    test(`${key} resolves in all locales`, () => {
      assertKey(key);
    });
  }
});

// ── Footer keys ───────────────────────────────────────────────────────────
const FOOTER_KEYS = [
  "footer.privacy",
  "footer.terms",
  "footer.aboutUs",
  "footer.solutions",
];

describe("Unit: Tolgee InContext — Footer keys resolve in all locales", () => {
  for (const key of FOOTER_KEYS) {
    test(`${key} resolves in all locales`, () => {
      assertKey(key);
    });
  }
});

// ── Process stats ─────────────────────────────────────────────────────────
const PROCESS_STAT_COUNT = 4;

describe("Unit: Tolgee InContext — Process Stats keys resolve in all locales", () => {
  for (let i = 0; i < PROCESS_STAT_COUNT; i++) {
    for (const field of ["num", "label"]) {
      const key = `home.process.stats.${i}.${field}`;
      test(`${key} resolves in all locales`, () => {
        assertKey(key);
      });
    }
  }
});
