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

export type TranslationFn = (key: string) => unknown;

function requireTranslation(
  t: TranslationFn,
  key: string,
): string {
  const translated = t(key);
  if (typeof translated !== "string" || !translated || translated === key) {
    throw new Error(`[Strict i18n Error] Missing required translation key in dictionary: "${key}"`);
  }
  return translated;
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
    name: requireTranslation(t, catalogModelKey(slug, "displayName")),
    desc: requireTranslation(t, catalogModelKey(slug, "cardHighlight")),
    tag: requireTranslation(t, catalogModelKey(slug, "cardTag")),
    label: requireTranslation(t, catalogModelKey(slug, "cardLabel")),
    tags: tags.map((tag) =>
      requireTranslation(t, catalogCardValueKey(tag)),
    ),
  };
}
