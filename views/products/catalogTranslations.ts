export type CatalogModelTranslationField = "displayName" | "cardHighlight";

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
