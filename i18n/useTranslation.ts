"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Locale } from "./config";
import { translations as staticTranslations } from "./translations";
import { specsData } from "./data/specsData";
import { getLocaleFromPath } from "./utils";
import { resolveTranslationValue } from "./translationFallback";

export function useLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}

export function useTranslation() {
  const locale = useLocale();

  const t = useCallback(
    (key: string, fallback?: string): any => {
      return resolveTranslationValue(
        key,
        [
          staticTranslations[locale] as Record<string, unknown>,
          (specsData[locale] || {}) as Record<string, unknown>,
          (specsData.en || {}) as Record<string, unknown>,
          staticTranslations.en as Record<string, unknown>,
        ],
        fallback
      );
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
