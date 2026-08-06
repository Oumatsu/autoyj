"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslate } from "@tolgee/react";
import { Locale } from "./config";
import { getLocaleFromPath } from "./utils";
import { resolveTranslationValue } from "./translationFallback";
import { translations as staticTranslations } from "./translations";
import { specsData } from "./data/specsData";

export { useTranslate, useTolgee } from "@tolgee/react";
export type { TFnType } from "@tolgee/react";

export function useLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}

/**
 * Convenience hook that returns Tolgee's standard t() function and current locale.
 * Components can use this or standard `useTranslate()` directly.
 */
export function useTranslation() {
  const { t: tolgeeT } = useTranslate();
  const locale = useLocale();

  const t = useCallback(
    (key: string, defaultValue?: string): string => {
      const val = tolgeeT(key, { defaultValue });
      if (typeof val === "string") {
        // Strip Tolgee DevTools zero-width metadata markers to test if key was untranslated
        const cleanVal = val.replace(/[\u200B-\u200D\uFEFF]/g, "");
        if (cleanVal === key) {
          const staticVal = resolveTranslationValue(
            key,
            [
              staticTranslations[locale] as Record<string, unknown>,
              (specsData[locale] || {}) as Record<string, unknown>,
              staticTranslations.en as Record<string, unknown>,
            ],
            defaultValue
          );
          if (typeof staticVal === "string") {
            return staticVal;
          }
        }
      }
      return val;
    },
    [tolgeeT, locale]
  );

  const tArray = useCallback(
    (key: string, fallback: any[] = []): any[] => {
      const val = resolveTranslationValue(
        key,
        [
          staticTranslations[locale] as Record<string, unknown>,
          (specsData[locale] || {}) as Record<string, unknown>,
        ],
        undefined
      );
      if (val === undefined || val === null) {
        return fallback;
      }
      const arrayVal = deepEnsureArray(val);
      return Array.isArray(arrayVal) ? arrayVal : fallback;
    },
    [locale]
  );

  return { t, tArray, locale };
}

function deepEnsureArray(val: unknown): unknown {
  if (val === null || val === undefined) {
    return val;
  }
  if (Array.isArray(val)) {
    return val.map(deepEnsureArray);
  }
  if (typeof val === "object") {
    const keys = Object.keys(val);
    const isNumeric = keys.length > 0 && keys.every((k) => !isNaN(Number(k)));
    if (isNumeric) {
      const arr: any[] = [];
      for (const [k, v] of Object.entries(val)) {
        arr[Number(k)] = deepEnsureArray(v);
      }
      return arr;
    } else {
      const res: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(val)) {
        res[k] = deepEnsureArray(v);
      }
      return res;
    }
  }
  return val;
}
