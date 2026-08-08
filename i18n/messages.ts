import type { Locale } from "./config";
import am from "./translations/am";
import en from "./translations/en";
import zh from "./translations/zh";

export type TranslationMessages = Record<string, unknown>;

/**
 * These are the only checked-in translation bundles. Tolgee pulls and publishes
 * the complete UI and vehicle-detail key tree from these modules.
 */
export const messages = { zh, en, am } satisfies Record<Locale, TranslationMessages>;

type TolgeeStaticTree = {
  [key: string]: string | TolgeeStaticTree;
};

function toTolgeeValue(value: unknown): string | TolgeeStaticTree {
  if (value && typeof value === "object") {
    return toTolgeeTree(value);
  }
  return value === null || value === undefined ? "" : String(value);
}

function toTolgeeTree(value: object): TolgeeStaticTree {
  return Object.fromEntries(
    Object.entries(value).map(([key, childValue]) => [
      key,
      toTolgeeValue(childValue),
    ])
  );
}

const staticDataCache: Partial<Record<Locale, TolgeeStaticTree>> = {};

function getTolgeeTree(locale: Locale): TolgeeStaticTree {
  if (!staticDataCache[locale]) {
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
