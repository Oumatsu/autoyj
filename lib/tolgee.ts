import { Tolgee, DevTools, FormatSimple } from "@tolgee/react";
import { defaultLocale, locales } from "@/i18n/config";
import { TOLGEE_PROJECT_ID_FALLBACK, TOLGEE_API_URL_DEFAULT } from "@/lib/constants";
import zh from "@/i18n/translations/zh";
import en from "@/i18n/translations/en";
import am from "@/i18n/translations/am";

// Re-export from config so callers that imported from here still work
const defaultLanguage = defaultLocale;
const availableLanguages = locales;

// Map of locale → static translation bundle (update here when adding a language)
const staticData: Record<string, unknown> = { zh, en, am };

export function createTolgee(initialLocale: string = defaultLanguage) {
  const language = (availableLanguages as readonly string[]).includes(initialLocale)
    ? initialLocale
    : defaultLanguage;

  const projectIdRaw = import.meta.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID;
  const parsedProjectId = projectIdRaw ? Number(projectIdRaw) : TOLGEE_PROJECT_ID_FALLBACK;
  const projectId = Number.isNaN(parsedProjectId) ? TOLGEE_PROJECT_ID_FALLBACK : parsedProjectId;

  return Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      language,
      defaultLanguage,
      fallbackLanguage: defaultLanguage,
      apiUrl: import.meta.env.NEXT_PUBLIC_TOLGEE_API_URL || TOLGEE_API_URL_DEFAULT,
      apiKey: import.meta.env.NEXT_PUBLIC_TOLGEE_API_KEY,
      projectId,
      staticData,
    });
}
