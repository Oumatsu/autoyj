import type { Locale } from "./config";
import am from "./translations/am.json";
import en from "./translations/en.json";
import zh from "./translations/zh.json";

export type TranslationMessages = Record<string, unknown>;

/**
 * These are the only checked-in translation bundles. Tolgee pulls and publishes
 * the complete UI and vehicle-detail key tree from these modules.
 */
export const messages = { zh, en, am } satisfies Record<Locale, TranslationMessages>;

type TolgeeStaticTree = {
  [key: string]: string | TolgeeStaticTree;
};

function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, fullKey));
    } else if (value !== null && value !== undefined) {
      result[fullKey] = String(value);
    }
  }
  return result;
}

function toTolgeeTree(value: object): TolgeeStaticTree {
  return flattenObject(value as Record<string, unknown>) as unknown as TolgeeStaticTree;
}

const staticDataCache: Partial<Record<Locale, TolgeeStaticTree>> = {};

function getTolgeeTree(locale: Locale): TolgeeStaticTree {
  if (process.env.NODE_ENV === "development" || !staticDataCache[locale]) {
    staticDataCache[locale] = toTolgeeTree(messages[locale]);
  }
  return staticDataCache[locale]!;
}

// Tolgee's static-data contract is a string tree. Keep the source messages
// structured for React consumers and normalize only the Tolgee adapter input on demand.
export const tolgeeStaticData: Record<Locale, TolgeeStaticTree> = {
  get zh() {
    return getTolgeeTree("zh");
  },
  get en() {
    return getTolgeeTree("en");
  },
  get am() {
    return getTolgeeTree("am");
  },
};
