import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import am from "../../i18n/translations/am";
import en from "../../i18n/translations/en";
import zh from "../../i18n/translations/zh";
import {
  translateAcademyLesson,
  translateAcademyVaultItem,
} from "../../views/academy/academyTranslations";

const tabKeys = [
  "hub",
  "hubFull",
  "fundamentals",
  "fundamentalsFull",
  "playbook",
  "playbookFull",
  "workshop",
  "workshopFull",
];

describe("Component: Academy Views & Localization Render Contracts", () => {
  test("Chinese and Amharic Academy topbars do not reuse English labels or route slugs", () => {
    for (const locale of [zh, am]) {
      for (const key of tabKeys) {
        expect(locale.academy.tabs[key as keyof typeof locale.academy.tabs]).not.toBe(
          en.academy.tabs[key as keyof typeof en.academy.tabs]
        );
      }
    }
  });

  test("Academy overview localizes lesson and vault API copy before rendering", async () => {
    const source = await readFile(new URL("../../views/academy.tsx", import.meta.url), "utf8");

    expect(source).toMatch(/translateAcademyLesson/);
    expect(source).toMatch(/translateAcademyVaultItem/);
    expect(source).not.toMatch(/\{a\.title\}/);
    expect(source).not.toMatch(/\{a\.desc\}/);
  });

  test("Academy translation helpers use stable lesson slugs and vault record IDs", () => {
    const values: Record<string, string> = {
      "academy.lessons.ev-range.title": "电动汽车续航详解",
      "academy.lessons.ev-range.tag": "基础设施",
      "academy.lessons.ev-range.description": "面向非洲市场的说明",
      "academy.lessons.ev-range.date": "2026 年 5 月 17 日",
      "academy.lessons.ev-range.content": "完整中文课程正文",
      "academy.vault.recvault.title": "车队投资回报率计算器",
      "academy.vault.recvault.type": "Excel 模型",
      "academy.vault.recvault.description": "五年成本对比",
    };
    const t = (key: string, fallback: string) => values[key] ?? fallback;

    expect(
      translateAcademyLesson(
        {
          slug: "ev-range",
          title: "Title",
          tag: "Tag",
          desc: "Description",
          date: "May 17, 2026",
          content: "English lesson body",
        },
        t
      )
    ).toEqual({
      slug: "ev-range",
      title: "电动汽车续航详解",
      tag: "基础设施",
      desc: "面向非洲市场的说明",
      date: "2026 年 5 月 17 日",
      content: "完整中文课程正文",
    });

    expect(
      translateAcademyVaultItem(
        { translationId: "recvault", title: "Title", type: "Type", desc: "Description" },
        t
      )
    ).toEqual({
      translationId: "recvault",
      title: "车队投资回报率计算器",
      type: "Excel 模型",
      desc: "五年成本对比",
    });
  });

  test("Every Academy category page localizes API article title, description, and date", async () => {
    for (const page of ["ev-fundamentals", "dealer-playbook", "technical-workshop"]) {
      const source = await readFile(
        new URL(`../../views/academy/${page}.tsx`, import.meta.url),
        "utf8"
      );

      expect(source).toMatch(/translateAcademyLesson/);
      expect(source).toMatch(/getAcademyLessonDate/);
      expect(source).toMatch(/localizedArticles\.map/);
    }
  });

  test("Academy detail localizes the lesson body and sibling titles before rendering", async () => {
    const source = await readFile(
      new URL("../../views/academy/[category]/[slug].tsx", import.meta.url),
      "utf8"
    );

    expect(source).toMatch(/translateAcademyLesson/);
    expect(source).toMatch(/getAcademyLessonDate/);
    expect(source).toMatch(/localizedLesson/);
    expect(source).toMatch(/localizedSiblings/);
  });
});
