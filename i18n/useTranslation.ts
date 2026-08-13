"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslate, useTolgee } from "@tolgee/react";
import { defaultLocale, locales, Locale } from "./config";
import { getLocaleFromPath, getNestedValue } from "./utils";
import { getTolgeeTargetLanguage, getLastCreatedTolgeeLanguage } from "@/lib/tolgee";
import { messages } from "./messages";

export { useTranslate, useTolgee, T } from "@tolgee/react";
export type { TFnType } from "@tolgee/react";

type MessageTree = typeof messages.en;
type TranslationOptionValue = string | number | bigint | Date;
type TranslationOptions = {
  defaultValue?: string;
  [key: string]: TranslationOptionValue | undefined;
};

type PathValue<Tree, Path extends string> = Path extends `${infer Head}.${infer Tail}`
  ? Head extends keyof Tree
    ? PathValue<Tree[Head], Tail>
    : unknown
  : Path extends keyof Tree
    ? Tree[Path]
    : unknown;

type NumericKey<Value> = Extract<keyof Value, `${number}`>;

type OptionalObjectUnion<Value> = {
  [Key in Value extends unknown ? keyof Value : never]?: Value extends Record<
    Key,
    infer Item
  >
    ? Item
    : never;
};

type NormalizeMessageValue<Value> = Value extends readonly (infer Item)[]
  ? NormalizeMessageValue<Item>[]
  : Value extends Record<string, unknown>
    ? keyof Value extends `${number}`
      ? Value[NumericKey<Value>] extends string | number | boolean
        ? Value[NumericKey<Value>][]
        : OptionalObjectUnion<Value[NumericKey<Value>]>[]
      : { [Key in keyof Value]: NormalizeMessageValue<Value[Key]> }
    : Value;

export type TranslationValue<Path extends string> = NormalizeMessageValue<
  PathValue<MessageTree, Path>
>;

export type TranslationArray<Path extends string> = Extract<
  TranslationValue<Path>,
  readonly unknown[]
>;

export type TranslationObject<Path extends string> = Extract<
  TranslationValue<Path>,
  Record<string, unknown>
>;

export type TranslationObjectKey<Path extends string> = keyof Extract<
  TranslationValue<Path>,
  Record<string, unknown>
>;

export type TranslationObjectItem<
  Path extends string,
  Key extends TranslationObjectKey<Path>,
> = Extract<
  NormalizeMessageValue<PathValue<MessageTree, Path>>,
  object
>[Key];

export function useLocale(): Locale {
  // useTolgee MUST be called unconditionally (rules of hooks) before any early return
  let tolgee: ReturnType<typeof useTolgee> | undefined;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tolgee = useTolgee();
  } catch {
    // Outside TolgeeProvider context — tolgee remains undefined
  }

  const pathname = usePathname();
  if (pathname) {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    if (firstSegment && (locales as readonly string[]).includes(firstSegment as Locale)) {
      return firstSegment as Locale;
    }
  }

  if (tolgee) {
    const lang =
      (tolgee as any)?.getInitialOptions?.()?.language ||
      (tolgee as any)?.getLanguage?.() ||
      (tolgee as any)?.getPendingLanguage?.() ||
      getTolgeeTargetLanguage(tolgee);
    if (lang && (locales as readonly string[]).includes(lang)) {
      return lang as Locale;
    }
  }

  const lastLang = getLastCreatedTolgeeLanguage();
  if (lastLang && (locales as readonly string[]).includes(lastLang)) {
    return lastLang as Locale;
  }
  return defaultLocale;
}

export function humanizeRawKeyPath(key: string): string {
  if (!key || typeof key !== "string") return "";
  const parts = key.split(".");
  const lastPart = parts[parts.length - 1] || key;
  return lastPart
    .replace(/[-_]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/**
 * Convenience hook that returns Tolgee's standard t() function and current locale.
 * Components can use this or standard `useTranslate()` directly.
 */
export function useTranslation() {
  const { t: tolgeeT } = useTranslate();
  const locale = useLocale();

  const t = useCallback(
    (
      key: string,
      defaultValueOrOptions?: string | TranslationOptions,
      extraOptions?: TranslationOptions,
    ): string => {
      const staticValue = getNestedValue(messages[locale], key);
      const explicitDefault =
        typeof defaultValueOrOptions === "string"
          ? defaultValueOrOptions
          : defaultValueOrOptions?.defaultValue;
      const resolvedDefault =
        typeof staticValue === "string" ? staticValue : explicitDefault;
      const options =
        typeof defaultValueOrOptions === "object"
          ? defaultValueOrOptions
          : extraOptions;
      const val = tolgeeT(key, {
        ...options,
        defaultValue: resolvedDefault,
      });

      const hasTolgeeSecret = typeof val === "string" && val.includes("\u200B");
      if (hasTolgeeSecret) {
        return val;
      }

      const isRawKeyLeak =
        val === key ||
        (typeof val === "string" &&
          (val.startsWith("catalog.") ||
            val.startsWith("productsDetail.") ||
            val.startsWith("products.") ||
            val.startsWith("common.") ||
            val.startsWith("home.") ||
            val.startsWith("nav.") ||
            val.startsWith("insights.") ||
            val.startsWith("academy.") ||
            val.startsWith("solutions.") ||
            val.startsWith("about.") ||
            val.startsWith("contact.") ||
            val.startsWith("marketsEthiopia.") ||
            val.startsWith("privacy.") ||
            val.startsWith("terms.") ||
            val.startsWith("qr.") ||
            /^[a-z0-9_-]+(\.[a-z0-9_-]+)+$/i.test(val)));

      if (isRawKeyLeak) {
        if (typeof staticValue === "string" && staticValue !== key) {
          return staticValue;
        }
        if (typeof explicitDefault === "string" && explicitDefault.length > 0 && explicitDefault !== key) {
          if (/^[a-z0-9-]+$/.test(explicitDefault) && explicitDefault.includes("-")) {
            return humanizeRawKeyPath(explicitDefault);
          }
          return explicitDefault;
        }
        const zhVal = getNestedValue(messages.zh, key);
        if (typeof zhVal === "string" && zhVal.length > 0 && zhVal !== key) {
          return zhVal;
        }
        const enVal = getNestedValue(messages.en, key);
        if (typeof enVal === "string" && enVal.length > 0 && enVal !== key) {
          return enVal;
        }
        return humanizeRawKeyPath(key);
      }
      return val;
    },
    [locale, tolgeeT]
  );

  const tArray = useCallback(
    <Path extends string>(
      key: Path,
      fallback: TranslationArray<Path> = []
    ): TranslationArray<Path> => {
      const source = getNestedValue(messages[locale], key);
      if (source === undefined || source === null) return fallback;

      const value = normalizeStructuredArrays(
        localizeStructuredValue(source, key, tolgeeT)
      );
      return isTranslationArray<Path>(value) ? value : fallback;
    },
    [locale, tolgeeT]
  );

  const tObject = useCallback(
    <Path extends string>(key: Path): TranslationObject<Path> => {
      const source = getNestedValue(messages[locale], key);
      if (!source || typeof source !== "object" || Array.isArray(source)) return {};
      const value = normalizeStructuredArrays(
        localizeStructuredValue(source, key, tolgeeT)
      );
      return isTranslationObject<Path>(value) ? value : {};
    },
    [locale, tolgeeT]
  );

  return { t, tArray, tObject, locale };
}

function isTranslationArray<Path extends string>(
  value: unknown
): value is TranslationArray<Path> {
  return Array.isArray(value);
}

function isTranslationObject<Path extends string>(
  value: unknown
): value is TranslationObject<Path> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
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

export function normalizeStructuredArrays(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(normalizeStructuredArrays);
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, childValue]) => [
      key,
      normalizeStructuredArrays(childValue),
    ] as const);
    const isNumericKeyedObject =
      entries.length > 0 && entries.every(([key]) => /^\d+$/.test(key));

    if (isNumericKeyedObject) {
      const array: unknown[] = [];
      for (const [key, childValue] of entries) {
        array[Number(key)] = childValue;
      }
      return array;
    }

    return Object.fromEntries(entries);
  }

  return value;
}
