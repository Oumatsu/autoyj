export type CatalogModelTranslationField =
  | "displayName"
  | "cardHighlight"
  | "cardTag"
  | "cardLabel";

export function catalogValueId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function catalogModelKey(
  slug: string,
  field: CatalogModelTranslationField,
): string {
  return `catalog.models.${catalogValueId(slug)}.${field}`;
}

export function catalogFilterKey(field: string, value: string): string {
  return `catalog.filters.${field}.${catalogValueId(value)}`;
}

export function catalogCardValueKey(value: string): string {
  return `catalog.cardValues.${catalogValueId(value)}`;
}

export function catalogFilterFallback(field: string, value: string): string {
  if (!value) return "";
  const cleaned = value.replace(/^value:/i, "").trim();
  if (/^[a-z0-9-]+$/.test(cleaned) && cleaned.includes("-")) {
    return cleaned
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return cleaned;
}
