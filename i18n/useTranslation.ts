"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslate } from "@tolgee/react";
import { Locale } from "./config";
import { getLocaleFromPath, getNestedValue } from "./utils";
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
  : Value extends object
    ? Exclude<Extract<keyof Value, string>, `${number}`> extends never
      ? NumericKey<Value> extends never
        ? Value
        : NormalizeNumericObject<Value>
      : {
          [Key in keyof Value]: NormalizeMessageValue<Value[Key]>;
        }
    : Value;

type NormalizeNumericObject<Value> = NormalizeMessageValue<
  Value[NumericKey<Value>]
> extends infer Item
  ? [Item] extends [object]
    ? OptionalObjectUnion<Item>[]
    : Item[]
  : never;

type ArrayItem<Value> = Value extends readonly (infer Item)[] ? Item : never;

type TranslationArray<Path extends string> = Array<
  ArrayItem<NormalizeMessageValue<PathValue<MessageTree, Path>>>
>;

type OptionalTranslationObject<Value> = Value extends object
  ? Value extends readonly unknown[]
    ? Value
    : {
        [Key in keyof Value]?: OptionalTranslationObject<Value[Key]>;
      }
  : Value;

type TranslationObject<Path extends string> = Partial<
  Record<string, unknown>
> & {
  [Key in keyof Extract<
    NormalizeMessageValue<PathValue<MessageTree, Path>>,
    object
  >]?: OptionalTranslationObject<
    Extract<
      NormalizeMessageValue<PathValue<MessageTree, Path>>,
      object
    >[Key]
  >;
};

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
      return tolgeeT(key, {
        ...options,
        defaultValue: resolvedDefault,
      });
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
