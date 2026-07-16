import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import am from "../i18n/translations/am.ts";
import en from "../i18n/translations/en.ts";
import zh from "../i18n/translations/zh.ts";

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

test("Chinese and Amharic Academy topbars do not reuse English labels or route slugs", () => {
  for (const locale of [zh, am]) {
    for (const key of tabKeys) {
      assert.notEqual(locale.academy.tabs[key], en.academy.tabs[key], `${key} must be localized`);
      assert.doesNotMatch(locale.academy.tabs[key], /^(?:ev-fundamentals|dealer-playbook|technical-workshop)$/);
    }
  }
});

test("Chinese and Amharic Academy category headings do not retain English category words", () => {
  const keys = [
    ["academyEvFundamentals", "headingAccent"],
    ["academyDealerPlaybook", "heading"],
    ["academyDealerPlaybook", "headingAccent"],
    ["academyTechnicalWorkshop", "heading"],
    ["academyTechnicalWorkshop", "headingAccent"],
  ];

  for (const locale of [zh, am]) {
    for (const [section, key] of keys) {
      assert.notEqual(locale[section][key], en[section][key], `${section}.${key} must be localized`);
    }
  }
});

test("Academy overview localizes lesson and vault API copy before rendering", async () => {
  const source = await readFile(new URL("../views/academy.tsx", import.meta.url), "utf8");

  assert.match(source, /translateAcademyLesson/);
  assert.match(source, /translateAcademyVaultItem/);
  assert.doesNotMatch(source, /\{a\.title\}/);
  assert.doesNotMatch(source, /\{a\.desc\}/);
  assert.doesNotMatch(source, /\{a\.tag\}/);
  assert.doesNotMatch(source, /\{item\.title\}/);
  assert.doesNotMatch(source, /\{item\.desc\}/);
  assert.doesNotMatch(source, /\{item\.type\}/);
});

test("Academy translation helpers use stable lesson slugs and vault record IDs", async () => {
  let helpers;
  try {
    helpers = await import("../views/academy/academyTranslations.ts");
  } catch {
    assert.fail("Academy translation helpers must exist");
  }

  const values = {
    "academy.lessons.ev-range.title": "电动汽车续航详解",
    "academy.lessons.ev-range.tag": "基础设施",
    "academy.lessons.ev-range.description": "面向非洲市场的说明",
    "academy.lessons.ev-range.date": "2026 年 5 月 17 日",
    "academy.lessons.ev-range.content": "完整中文课程正文",
    "academy.vault.recvault.title": "车队投资回报率计算器",
    "academy.vault.recvault.type": "Excel 模型",
    "academy.vault.recvault.description": "五年成本对比",
  };
  const t = (key, fallback) => values[key] ?? fallback;

  assert.deepEqual(
    helpers.translateAcademyLesson(
      {
        slug: "ev-range",
        title: "Title",
        tag: "Tag",
        desc: "Description",
        date: "May 17, 2026",
        content: "English lesson body",
      },
      t,
    ),
    {
      slug: "ev-range",
      title: "电动汽车续航详解",
      tag: "基础设施",
      desc: "面向非洲市场的说明",
      date: "2026 年 5 月 17 日",
      content: "完整中文课程正文",
    },
  );
  assert.deepEqual(
    helpers.translateAcademyVaultItem(
      { translationId: "recvault", title: "Title", type: "Type", desc: "Description" },
      t,
    ),
    { translationId: "recvault", title: "车队投资回报率计算器", type: "Excel 模型", desc: "五年成本对比" },
  );
});

test("Every Academy category page localizes API article title, description, and date", async () => {
  for (const page of ["ev-fundamentals", "dealer-playbook", "technical-workshop"]) {
    const source = await readFile(new URL(`../views/academy/${page}.tsx`, import.meta.url), "utf8");

    assert.match(source, /translateAcademyLesson/);
    assert.match(source, /getAcademyLessonDate/);
    assert.match(source, /localizedArticles\.map/);
    assert.doesNotMatch(source, /\{articles\.map/);
    assert.doesNotMatch(source, /\{getDate\(a\.slug\)\}/);
    assert.doesNotMatch(source, /\{t\("academyTechnicalWorkshop\.date"\)\}/);
  }
});

test("Academy category translations cover all published lesson slugs and dates", () => {
  const publishedSlugs = [
    "high-altitude-dust-ethiopia-ev",
    "ev-range-explained-africa",
    "how-ev-batteries-degrade",
    "ev-objections-african-dealers",
    "tco-conversation-guide",
    "ev-test-drive-guide",
    "high-voltage-safety-ev-technicians",
    "chinese-ev-diagnostic-tools",
    "12v-auxiliary-battery-ev",
    "ev-wont-charge-troubleshooting",
    "common-fault-patterns-ethiopia",
    "voltage-fluctuation-ev-charger-ethiopia",
  ];

  for (const locale of [zh, am]) {
    for (const slug of publishedSlugs) {
      const lesson = locale.academy.lessons[slug];
      assert.equal(typeof lesson?.title, "string", `${slug} title must be localized`);
      assert.equal(typeof lesson?.description, "string", `${slug} description must be localized`);
      assert.equal(typeof lesson?.date, "string", `${slug} date must be localized`);
    }
  }
});

test("Academy detail localizes the lesson body and sibling titles before rendering", async () => {
  const source = await readFile(
    new URL("../views/academy/[category]/[slug].tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /translateAcademyLesson/);
  assert.match(source, /getAcademyLessonDate/);
  assert.match(source, /localizedLesson/);
  assert.match(source, /localizedSiblings/);
  assert.doesNotMatch(source, /<MarkdownRenderer content=\{lesson\.content\}/);
  assert.doesNotMatch(source, /\{sib\.title\}/);
});

test("Every published Academy lesson has Chinese and Amharic detail content and tags", () => {
  const publishedSlugs = [
    "high-altitude-dust-ethiopia-ev",
    "ev-range-explained-africa",
    "how-ev-batteries-degrade",
    "ev-objections-african-dealers",
    "tco-conversation-guide",
    "ev-test-drive-guide",
    "high-voltage-safety-ev-technicians",
    "chinese-ev-diagnostic-tools",
    "12v-auxiliary-battery-ev",
    "ev-wont-charge-troubleshooting",
    "common-fault-patterns-ethiopia",
    "voltage-fluctuation-ev-charger-ethiopia",
  ];

  for (const locale of [zh, am]) {
    for (const slug of publishedSlugs) {
      const lesson = locale.academy.lessons[slug];
      assert.equal(typeof lesson?.tag, "string", `${slug} tag must be localized`);
      assert.ok(lesson.tag.trim().length > 0, `${slug} tag must not be empty`);
      assert.equal(typeof lesson?.content, "string", `${slug} content must be localized`);
      assert.ok(lesson.content.length > 500, `${slug} content must contain the full translated article`);
    }
  }
});
