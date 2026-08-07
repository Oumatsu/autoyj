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

export function mergeOverviewCard<T extends OverviewCard>(
  card: T,
  fallback?: OverviewCard,
): T {
  const merged = { ...fallback, ...card } as T;
  return {
    ...merged,
    name: merged.name || fallback?.name || "",
    desc: merged.desc || merged.charging || fallback?.desc || fallback?.charging || "",
    img: merged.img || fallback?.img || "",
    link: merged.link || fallback?.link,
    tags: normalizeTags(merged.tags).length ? merged.tags : normalizeTags(fallback?.tags),
  };
}

export function translateOverviewCard<T extends OverviewCard>(
  card: T,
  t: TranslationFn,
): T {
  const slug = String(card.slug || card.link?.split("/").filter(Boolean).pop() || "");
  const tags = normalizeTags(card.tags);

  return {
    ...card,
    name: translatedText(t, catalogModelKey(slug, "displayName"), card.name),
    desc: translatedText(t, catalogModelKey(slug, "cardHighlight"), card.desc),
    tag: translatedText(t, catalogModelKey(slug, "cardTag"), card.tag || tags[0]),
    label: translatedText(t, catalogModelKey(slug, "cardLabel"), card.label || tags[1]),
    tags: tags.map((tag) =>
      translatedText(t, catalogCardValueKey(tag), tag),
    ),
  };
}
