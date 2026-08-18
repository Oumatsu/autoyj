import { Tolgee } from "@tolgee/web";
import { FormatIcu } from "@tolgee/format-icu";
import { defaultLocale, fallbackLocale, locales } from "@/i18n/config";
import { tolgeeStaticData } from "@/i18n/messages";

// Re-export from config so callers that imported from here still work
const defaultLanguage = defaultLocale;
const availableLanguages = locales;

const instanceLanguageMap = new WeakMap<object, string>();
const tolgeeInstanceCache = new Map<string, ReturnType<typeof createTolgeeInstance>>();
let lastCreatedLanguage: string = defaultLanguage;

export function getLastCreatedTolgeeLanguage(): string {
  return lastCreatedLanguage;
}

export function getTolgeeTargetLanguage(tolgee: object | null | undefined): string | undefined {
  if (!tolgee) return undefined;
  return instanceLanguageMap.get(tolgee);
}

function createTolgeeInstance(language: string) {
  const instance = Tolgee().use(FormatIcu());
  instanceLanguageMap.set(instance, language);
  const res = instance.init({
    language,
    defaultLanguage,
    fallbackLanguage: fallbackLocale,
    observerType: "invisible",
    staticData: tolgeeStaticData as any,
  });
  instanceLanguageMap.set(res, language);
  void res.run();
  return res;
}

export function createTolgee(
  initialLocale: string = defaultLanguage,
  _options: { remote?: boolean } = {}
) {
  const language = (availableLanguages as readonly string[]).includes(initialLocale)
    ? initialLocale
    : defaultLanguage;

  lastCreatedLanguage = language;

  let instance = tolgeeInstanceCache.get(language);
  if (!instance) {
    instance = createTolgeeInstance(language);
    tolgeeInstanceCache.set(language, instance);
  }
  return instance;
}
