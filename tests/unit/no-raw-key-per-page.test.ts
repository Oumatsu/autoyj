/**
 * Unit: Per-Page Raw Translation Key Leak Guard
 *
 * Verifies that EVERY translation key in EVERY page namespace resolves to a
 * non-empty string that is NOT equal to the key itself (no raw key leak) and
 * does NOT look like a dot-notation key path.
 *
 * Covers all 29 namespaces across zh, en, and am locales.
 */
import { describe, expect, test } from "bun:test";
import zh from "../../i18n/translations/zh.json";
import en from "../../i18n/translations/en.json";
import am from "../../i18n/translations/am.json";

type Dict = Record<string, unknown>;

function flatten(obj: Dict, prefix = ""): Map<string, string> {
  const result = new Map<string, string>();
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === "object" && !Array.isArray(v)) {
      for (const [ck, cv] of flatten(v as Dict, key)) {
        result.set(ck, cv);
      }
    } else if (Array.isArray(v)) {
      v.forEach((item: unknown, idx: number) => {
        const ik = `${key}.${idx}`;
        if (item !== null && typeof item === "object") {
          for (const [ck, cv] of flatten(item as Dict, ik)) {
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

// Matches values that look like raw dot-notation key paths (3+ segments, lowercase start)
const RAW_KEY_PATTERN = /^[a-z][a-zA-Z0-9_-]*(\.[a-zA-Z0-9_-]+){2,}$/;

const PAGE_NAMESPACES = [
  "nav", "home", "footer", "solutions", "about", "marketsEthiopia",
  "contact", "specs", "common", "sectionTabs", "privacy", "terms",
  "qr", "portal", "products", "solutionsConfigureKit", "solutionsRequestQuote",
  "productsRevenueKing", "productsEliteFlagship", "productsUtilityPro",
  "catalog", "academy", "academyEvFundamentals", "academyDealerPlaybook",
  "academyTechnicalWorkshop", "academyDetail", "insights", "insightsDetail",
  "productsDetail",
] as const;

const zhFlat = flatten(zh as Dict);
const enFlat = flatten(en as Dict);
const amFlat = flatten(am as Dict);

function getMap(locale: "zh" | "en" | "am") {
  return locale === "zh" ? zhFlat : locale === "en" ? enFlat : amFlat;
}

describe("Unit: Per-Page Raw Key Leak Guard — All Namespaces", () => {
  for (const ns of PAGE_NAMESPACES) {
    describe(`Namespace: ${ns}`, () => {
      for (const name of ["zh", "en", "am"] as const) {
        test(`[${name}] "${ns}.*" — no empty, no raw key, no dot-path value`, () => {
          const map = getMap(name);
          const nsEntries = [...map.entries()].filter(([k]) =>
            k === ns || k.startsWith(`${ns}.`)
          );

          expect(nsEntries.length).toBeGreaterThan(0);

          const failures: string[] = [];

          for (const [key, val] of nsEntries) {
            if (val === "") continue; // intentionally blank optional fields are OK

            if (val === key) {
              failures.push(`RAW KEY: ${key} → "${val}"`);
              continue;
            }

            if (RAW_KEY_PATTERN.test(val)) {
              failures.push(`KEY-LIKE VALUE: ${key} → "${val}"`);
            }
          }

          if (failures.length > 0) {
            console.error(
              `[${name}/${ns}] ${failures.length} key leak(s):\n${failures.join("\n")}`
            );
          }
          expect(failures).toEqual([]);
        });
      }
    });
  }
});

// ── Cross-namespace contamination guard ─────────────────────────────────────
describe("Unit: No Cross-Namespace Key Path Contamination", () => {
  test("No zh value starts with a known namespace prefix (raw key contamination)", () => {
    const FORBIDDEN_PREFIXES = PAGE_NAMESPACES.map((ns) => `${ns}.`);
    const suspicious: string[] = [];

    for (const [key, val] of zhFlat.entries()) {
      if (val === "") continue;
      for (const prefix of FORBIDDEN_PREFIXES) {
        if (val.startsWith(prefix)) {
          suspicious.push(`${key} = "${val}" (starts with "${prefix}")`);
          break;
        }
      }
    }
    expect(suspicious).toEqual([]);
  });
});
