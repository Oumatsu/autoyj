import type { TolgeeStaticDataProp } from "@tolgee/core";
import type { Locale } from "./config";
import am from "./translations/am";
import en from "./translations/en";
import zh from "./translations/zh";
import { specsData } from "./data/specsData";

export type TranslationMessages = Record<string, unknown>;

/**
 * Tolgee owns both the UI bundle and the generated vehicle-detail copy.
 * Keeping the merge here gives Tolgee one static source with framework-managed
 * language fallback instead of a second resolver in every component.
 */
export const messages: Record<Locale, TranslationMessages> = {
  zh: { ...zh, ...specsData.zh },
  en: { ...en, ...specsData.en },
  am: { ...am, ...specsData.am },
};

// Generated bundles contain structured arrays/booleans that Tolgee flattens at
// runtime, while its public type only describes the flattened string tree.
export const tolgeeStaticData = messages as unknown as TolgeeStaticDataProp;
