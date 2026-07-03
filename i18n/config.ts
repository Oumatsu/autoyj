export const locales = ["zh", "en", "am"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "zh";

export const localeLabels: Record<
  Locale,
  { name: string; flag: string; code: string; dir: "ltr" | "rtl" }
> = {
  zh: { name: "中文", flag: "🇨🇳", code: "ZH", dir: "ltr" },
  en: { name: "English", flag: "🇬🇧", code: "EN", dir: "ltr" },
  am: { name: "አማርኛ", flag: "🇪🇹", code: "AM", dir: "ltr" },
};
