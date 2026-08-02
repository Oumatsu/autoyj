import { Tolgee, DevTools, FormatSimple } from "@tolgee/react";
import zh from "@/i18n/translations/zh";
import en from "@/i18n/translations/en";
import am from "@/i18n/translations/am";

export const defaultLanguage = "zh";
export const availableLanguages = ["zh", "en", "am"] as const;

export function createTolgee(initialLocale: string = defaultLanguage) {
  const language = availableLanguages.includes(initialLocale as any) ? initialLocale : defaultLanguage;

  const projectIdRaw = import.meta.env.NEXT_PUBLIC_TOLGEE_PROJECT_ID;
  const parsedProjectId = projectIdRaw ? Number(projectIdRaw) : 33857;
  const projectId = Number.isNaN(parsedProjectId) ? 33857 : parsedProjectId;

  return Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      language,
      defaultLanguage: "zh",
      fallbackLanguage: "zh",
      apiUrl: import.meta.env.NEXT_PUBLIC_TOLGEE_API_URL || "https://app.tolgee.io",
      apiKey: import.meta.env.NEXT_PUBLIC_TOLGEE_API_KEY,
      projectId,
      staticData: {
        zh,
        en,
        am,
      },
    });
}
