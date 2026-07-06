"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Locale, defaultLocale, locales } from "./config";
import { translations } from "./translations";
import { getLocaleFromPath, getNestedValue } from "./utils";

export function useLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}

export function useTranslation() {
  const locale = useLocale();

  const t = useCallback(
    (key: string, fallback?: string): any => {
      const value = getNestedValue(
        translations[locale] as Record<string, unknown>,
        key
      );
      if (value !== undefined) return value;

      const enValue = getNestedValue(
        translations.en as Record<string, unknown>,
        key
      );
      if (enValue !== undefined) return enValue;

      return fallback ?? key;
    },
    [locale]
  );

  const tArray = useCallback(
    (key: string, fallback: any[] = []): any[] => {
      const val = t(key);
      return Array.isArray(val) ? val : fallback;
    },
    [t]
  );

  return useMemo(() => ({ t, tArray, locale }), [t, tArray, locale]);
}
