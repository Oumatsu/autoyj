import {
  catalogCardValueKey,
  catalogModelKey,
} from "./catalogTranslations.ts";

export type OverviewCard = Record<string, any> & {
  slug?: string;
  link?: string;
  name?: string;
  desc?: string;
  tag?: string;
  label?: string;
  tags?: unknown;
};

export type TranslationFn = (key: string, fallback?: string) => unknown;

function translatedText(
  t: TranslationFn,
  key: string,
  fallback: unknown,
): string {
  const source = typeof fallback === "string" ? fallback : "";
  const translated = t(key, source);
  return typeof translated === "string" ? translated : source;
}

function normalizeTags(tags: unknown): string[] {
  return Array.isArray(tags)
    ? tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim()))
    : [];
}

export function translateOverviewCard<T extends OverviewCard>(
  card: T,
  t: TranslationFn,
): T {
  const slug = String(card.slug || card.link?.split("/").filter(Boolean).pop() || "");

  return {
    ...card,
    name: translatedText(t, catalogModelKey(slug, "displayName"), card.name),
    desc: translatedText(t, catalogModelKey(slug, "cardHighlight"), card.desc),
    tag: translatedText(t, catalogModelKey(slug, "cardTag"), card.tag),
    label: translatedText(t, catalogModelKey(slug, "cardLabel"), card.label),
    tags: normalizeTags(card.tags).map((tag) =>
      translatedText(t, catalogCardValueKey(tag), tag),
    ),
  };
}
