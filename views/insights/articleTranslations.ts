export type InsightTranslationFn = (key: string) => unknown;

export type TranslatableInsightArticle = {
  slug?: string;
  title?: string;
  overview?: string;
  date?: string;
  content?: string;
};

function requireTranslation(
  t: InsightTranslationFn,
  key: string,
): string {
  const translated = t(key);
  if (typeof translated !== "string" || !translated || translated === key) {
    throw new Error(`[Strict i18n Error] Missing required translation key in dictionary: "${key}"`);
  }
  return translated;
}

export function translateInsightArticle<T extends TranslatableInsightArticle>(
  article: T,
  t: InsightTranslationFn,
): T {
  const slug = typeof article.slug === "string" ? article.slug : "";
  const prefix = `insights.articles.${slug}`;

  return {
    ...article,
    title: requireTranslation(t, `${prefix}.title`),
    overview: requireTranslation(t, `${prefix}.overview`),
    date: requireTranslation(t, `${prefix}.date`),
    content: requireTranslation(t, `${prefix}.content`),
  };
}
