export const locales = ["zh", "en", "am"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const fallbackLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value ? locales.includes(value as Locale) : false;
}

export const localeLabels: Record<
  Locale,
  { name: string; flag: string; code: string; dir: "ltr" | "rtl" }
> = {
  zh: { name: "中文", flag: "🇨🇳", code: "ZH", dir: "ltr" },
  en: { name: "English", flag: "🇬🇧", code: "EN", dir: "ltr" },
  am: { name: "አማርኛ", flag: "🇪🇹", code: "AM", dir: "ltr" },
};
