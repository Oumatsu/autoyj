export type DetailTranslate = (key: string, fallback?: unknown) => unknown;

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

export function translatedDetailString(
  translate: DetailTranslate,
  key: string,
  fallback: string,
): string {
  const value = translate(key, fallback);
  return typeof value === "string" && value ? value : fallback;
}

export function translatedDetailArray<T>(
  translate: DetailTranslate,
  key: string,
  fallback: T[],
): T[] {
  const value = translate(key, fallback);
  return Array.isArray(value) && value.length === fallback.length ? value as T[] : fallback;
}
