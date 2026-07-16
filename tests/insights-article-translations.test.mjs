import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  translateInsightArticle,
} from "../views/insights/articleTranslations.ts";

test("insight articles resolve slug-keyed title, overview, date, and content", () => {
  const article = {
    slug: "africa-emobility-report-2025",
    title: "English title",
    overview: "English overview",
    date: "October 15, 2025",
    content: "English content",
  };
  const translations = {
    "insights.articles.africa-emobility-report-2025.title": "中文标题",
    "insights.articles.africa-emobility-report-2025.overview": "中文简介",
    "insights.articles.africa-emobility-report-2025.date": "2025年10月15日",
    "insights.articles.africa-emobility-report-2025.content": "中文正文",
  };

  assert.deepEqual(
    translateInsightArticle(article, (key, fallback) => translations[key] ?? fallback),
    {
      ...article,
      title: "中文标题",
      overview: "中文简介",
      date: "2025年10月15日",
      content: "中文正文",
    },
  );
});

test("insight article translations fall back safely for malformed values", () => {
  const article = {
    slug: "article",
    title: "Title",
    overview: "Overview",
    date: "Date",
    content: "Content",
  };

  assert.deepEqual(translateInsightArticle(article, () => []), article);
});

test("both insight pages render localized article values", async () => {
  const [listing, detail] = await Promise.all([
    readFile(new URL("../views/insights.tsx", import.meta.url), "utf8"),
    readFile(new URL("../views/insights/[slug].tsx", import.meta.url), "utf8"),
  ]);

  assert.match(listing, /translateInsightArticle/);
  assert.match(detail, /translateInsightArticle/);
  assert.doesNotMatch(detail, /content=\{article\.content\}/);
});

test("Base record pagination follows Feishu page tokens", async () => {
  const source = await readFile(new URL("../worker/portal.ts", import.meta.url), "utf8");
  const searchRecords = source.slice(
    source.indexOf("async function searchRecords"),
    source.indexOf("async function createRecord"),
  );

  assert.match(searchRecords, /page_size/);
  assert.match(searchRecords, /page_token/);
  assert.doesNotMatch(searchRecords, /offset/);
});
