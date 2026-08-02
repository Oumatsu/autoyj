import { Tolgee, DevTools, FormatSimple } from "@tolgee/react";
import zh from "@/i18n/translations/zh";
import en from "@/i18n/translations/en";
import am from "@/i18n/translations/am";

export const defaultLanguage = "zh";
export const availableLanguages = ["zh", "en", "am"] as const;

export function createTolgee(initialLocale: string = defaultLanguage) {
  const language = availableLanguages.includes(initialLocale as any) ? initialLocale : defaultLanguage;
  
  return Tolgee()
    .use(DevTools())
    .use(FormatSimple())
    .init({
      language,
      defaultLanguage: "zh",
      fallbackLanguage: "zh",
      apiUrl: process.env.NEXT_PUBLIC_TOLGEE_API_URL || "http://localhost:8085",
      apiKey: process.env.NEXT_PUBLIC_TOLGEE_API_KEY,
      staticData: {
        zh,
        en,
        am,
      },
    });
}
