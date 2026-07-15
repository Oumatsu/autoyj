"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Locale, defaultLocale, locales } from "./config";
import { translations as staticTranslations } from "./translations";
import { getLocaleFromPath } from "./utils";
import { resolveTranslationValue } from "./translationFallback";

let globalDynamicTranslations: any = null;
let globalTranslationListeners = new Set<() => void>();
let isLoadingStarted = false;

function loadDynamicTranslations() {
  if (isLoadingStarted) return;
  isLoadingStarted = true;
  fetch("/api/portal/public/translations")
    .then((r) => r.json())
    .then((data) => {
      if (data && data.zh) {
        globalDynamicTranslations = data;
        globalTranslationListeners.forEach((l) => l());
      }
    })
    .catch((err) => {
      console.warn("Failed to load live translations from Feishu. Falling back to static dictionary:", err.message);
    });
}

export function useLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}

export function useTranslation() {
  const locale = useLocale();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadDynamicTranslations();
      const listener = () => setTick((t) => t + 1);
      globalTranslationListeners.add(listener);
      return () => {
        globalTranslationListeners.delete(listener);
      };
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): any => {
      return resolveTranslationValue(key, [
        globalDynamicTranslations?.[locale],
        staticTranslations[locale] as Record<string, unknown>,
        globalDynamicTranslations?.en,
        staticTranslations.en as Record<string, unknown>,
      ], fallback);
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
