export type InsightTranslationFn = (key: string, fallback?: string) => unknown;

export type TranslatableInsightArticle = {
  slug?: string;
  title?: string;
  overview?: string;
  date?: string;
  content?: string;
};

function translatedText(
  t: InsightTranslationFn,
  key: string,
  fallback: unknown,
): string {
  const source = typeof fallback === "string" ? fallback : "";
  const translated = t(key, source);
  return typeof translated === "string" ? translated : source;
}

export function translateInsightArticle<T extends TranslatableInsightArticle>(
  article: T,
  t: InsightTranslationFn,
): T {
  const slug = typeof article.slug === "string" ? article.slug : "";
  const prefix = `insights.articles.${slug}`;

  return {
    ...article,
    title: translatedText(t, `${prefix}.title`, article.title),
    overview: translatedText(t, `${prefix}.overview`, article.overview),
    date: translatedText(t, `${prefix}.date`, article.date),
    content: translatedText(t, `${prefix}.content`, article.content),
  };
}
