import { defaultLocale, locales, type Locale } from "./routing";

export { defaultLocale, locales };
export type { Locale };

export const fallbackLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value ? locales.includes(value as Locale) : false;
}

export const localeLabels: Record<
  Locale,
  { name: string; nativeName: string; code: string; dir: "ltr" | "rtl" }
> = {
  en: { name: "English", nativeName: "English", code: "EN", dir: "ltr" },
  zh: { name: "Chinese", nativeName: "中文", code: "ZH", dir: "ltr" },
  am: { name: "Amharic", nativeName: "አማርኛ", code: "AM", dir: "ltr" },
};
