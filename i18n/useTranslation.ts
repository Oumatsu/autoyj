"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslate } from "@tolgee/react";
import { Locale } from "./config";
import { getLocaleFromPath, getNestedValue } from "./utils";
import { messages } from "./messages";

export { useTranslate, useTolgee, T } from "@tolgee/react";
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
      const staticValue = getNestedValue(messages[locale], key);
      const resolvedDefault =
        typeof staticValue === "string" ? staticValue : defaultValue;
      return tolgeeT(key, { defaultValue: resolvedDefault });
    },
    [locale, tolgeeT]
  );

  const tArray = useCallback(
    (key: string, fallback: any[] = []): any[] => {
      const source = getNestedValue(messages[locale], key);
      if (source === undefined || source === null) return fallback;

      const value = localizeStructuredValue(source, key, tolgeeT);
      return Array.isArray(value) ? value : fallback;
    },
    [locale, tolgeeT]
  );

  const tObject = useCallback(
    (key: string): Record<string, unknown> => {
      const source = getNestedValue(messages[locale], key);
      if (!source || typeof source !== "object" || Array.isArray(source)) return {};
      const value = localizeStructuredValue(source, key, tolgeeT);
      return value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    },
    [locale, tolgeeT]
  );

  return { t, tArray, tObject, locale };
}

export function localizeStructuredValue(
  value: unknown,
  key: string,
  translate: (key: string, options?: { defaultValue?: string }) => string
): unknown {
  if (typeof value === "string") {
    return translate(key, { defaultValue: value });
  }
  if (Array.isArray(value)) {
    return value.map((item, index) =>
      localizeStructuredValue(item, `${key}.${index}`, translate)
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        localizeStructuredValue(childValue, `${key}.${childKey}`, translate),
      ])
    );
  }
  return value;
}
