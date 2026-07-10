import { Locale, defaultLocale, locales } from "./config";

export function getLocaleFromPath(pathname: string | null): Locale {
  if (!pathname) return defaultLocale;
  const segment = pathname.split("/")[1];
  return locales.includes(segment as Locale)
    ? (segment as Locale)
    : defaultLocale;
}

export function getNestedValue(
  obj: Record<string, unknown>,
  key: string
): unknown {
  return key.split(".").reduce<unknown>((o, k) => {
    if (o && typeof o === "object") {
      if (Array.isArray(o)) {
        const idx = parseInt(k, 10);
        return isNaN(idx) ? undefined : o[idx];
      }
      return (o as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

