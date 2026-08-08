export type DetailTranslate = (key: string, fallback?: string) => unknown;

function normalizeDetailId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function detailModelKey(slug: string, field: string): string {
  return `productsDetail.models.${normalizeDetailId(slug)}.${field}`;
}

export function detailVariantKey(trimConfigId: string, field: string): string {
  return `productsDetail.variants.${normalizeDetailId(trimConfigId)}.${field}`;
}

export function detailValueKey(source: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < source.length; index += 1) {
    hash ^= source.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `productsDetail.values.${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function translatedDetailValue(
  translate: DetailTranslate,
  source: string,
): string {
  if (!source) return source;
  const key = detailValueKey(source);
  const value = translate(key, source);
  if (
    typeof value === "string" &&
    value &&
    value !== key &&
    !value.startsWith("productsDetail.") &&
    !value.includes("productsDetail.values")
  ) {
    return value;
  }
  return source;
}

export function translatedDetailValues(
  translate: DetailTranslate,
  source: string[],
): string[] {
  return source.map((value) => translatedDetailValue(translate, value));
}

export function translatedDetailString(
  translate: DetailTranslate,
  key: string,
  fallback: string,
): string {
  const value = translate(key, fallback);
  if (
    typeof value === "string" &&
    value &&
    value !== key &&
    !value.startsWith("productsDetail.") &&
    !value.includes("productsDetail.values")
  ) {
    return value;
  }
  return fallback;
}

export function translatedDetailArray<T>(
  translate: DetailTranslate,
  key: string,
  fallback: T[],
): T[] {
  const value = translate(key);
  return Array.isArray(value) && value.length === fallback.length ? value as T[] : fallback;
}
