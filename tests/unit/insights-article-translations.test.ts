import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import { translateInsightArticle } from "../../views/insights/articleTranslations";

describe("Unit: Insights Article Translation Resolvers", () => {
  test("insight articles resolve slug-keyed title, overview, date, and content", () => {
    const article = {
      slug: "africa-emobility-report-2025",
      title: "English title",
      overview: "English overview",
      date: "October 15, 2025",
      content: "English content",
    };
    const translations: Record<string, string> = {
      "insights.articles.africa-emobility-report-2025.title": "中文标题",
      "insights.articles.africa-emobility-report-2025.overview": "中文简介",
      "insights.articles.africa-emobility-report-2025.date": "2025年10月15日",
      "insights.articles.africa-emobility-report-2025.content": "中文正文",
    };

    expect(
      translateInsightArticle(article, (key, fallback) => translations[key] ?? fallback)
    ).toEqual({
      ...article,
      title: "中文标题",
      overview: "中文简介",
      date: "2025年10月15日",
      content: "中文正文",
    });
  });

  test("insight article translations fall back safely for malformed values", () => {
    const article = {
      slug: "article",
      title: "Title",
      overview: "Overview",
      date: "Date",
      content: "Content",
    };

    expect(translateInsightArticle(article, () => [] as any)).toEqual(article);
  });

  test("both insight pages render localized article values", async () => {
    const [listing, detail] = await Promise.all([
      readFile(new URL("../../views/insights.tsx", import.meta.url), "utf8"),
      readFile(new URL("../../views/insights/[slug].tsx", import.meta.url), "utf8"),
    ]);

    expect(listing).toMatch(/translateInsightArticle/);
    expect(detail).toMatch(/translateInsightArticle/);
    expect(detail).not.toMatch(/content=\{article\.content\}/);
  });

  test("Base record pagination follows Feishu page tokens", async () => {
    const source = await readFile(new URL("../../server/api/portal.ts", import.meta.url), "utf8");
    const searchRecords = source.slice(
      source.indexOf("async function searchRecords"),
      source.indexOf("async function createRecord")
    );

    expect(searchRecords).toMatch(/page_size/);
    expect(searchRecords).toMatch(/page_token/);
    expect(searchRecords).not.toMatch(/offset/);
  });
});
