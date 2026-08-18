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

// Tolgee's static-data contract is an object tree. messages is already a clean structured tree.
export const tolgeeStaticData = messages as unknown as Record<Locale, TolgeeStaticTree>;
