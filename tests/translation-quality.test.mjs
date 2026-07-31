import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import am from "../i18n/translations/am.ts";
import zh from "../i18n/translations/zh.ts";

const serializedValues = (value) =>
  Array.isArray(value)
    ? value.map(serializedValues).join("\n")
    : value && typeof value === "object"
      ? Object.values(value).map(serializedValues).join("\n")
      : String(value ?? "");

test("Chinese uses the approved Youguard brand name and faithful page copy", () => {
  assert.equal(zh.about.hero.badge, "双轨战略");
  assert.equal(zh.about.verification.heading, "誉甲");
  assert.match(zh.about.verification.paragraph1, /^誉甲科技有限公司/);
  assert.match(zh.about.verification.paragraph3, /誉甲专注于/);
  assert.match(zh.about.presence.description1, /誉甲与本地合作伙伴/);
  assert.equal(zh.academy.hero.badge, "B2B 经销商赋能");
  assert.equal(zh.academyDetail.authorLabel, "誉甲学院");
  assert.equal(zh.academyDetail.tags.youguard, "誉甲");
  assert.doesNotMatch(serializedValues(zh), /autoyj/i);

  assert.equal(
    zh.solutions.pdi.description,
    "我们采购的每一辆车在运往港口前，都会在指定场地接受全面的交付前检验。我们不只是发运，更会严格核验。",
  );
  assert.equal(
    zh.solutions.partsKit.description,
    "不要让缺少空气滤芯或刹车片磨损影响您的销售。我们根据您的具体车队车型提供预包装保养套件，并与车辆一同装运，以最大限度提升物流效率。",
  );
  assert.equal(
    zh.solutionsRequestQuote.description,
    "从诊断设备到高压作业工具——根据您的经销商规模，获取完整的设备清单和投资估算。",
  );
  assert.equal(zh.solutionsRequestQuote.form.title, "请介绍您的服务设施");
});

test("Amharic preserves or transliterates Youguard and contains no Chinese leakage", () => {
  assert.equal(am.about.verification.heading, "Youguard");
  assert.equal(am.academyDetail.tags.youguard, "Youguard");
  assert.equal(am.contact.email.title, "sales@youguard.com");
  assert.match(am.terms.sections.at(-1).content, /legal@youguard\.com/);
  assert.equal(am.specs["CLTC Range"], "የCLTC የመንዳት ርቀት");
  assert.equal(am.specs["NEDC Range"], "የNEDC የመንዳት ርቀት");
  assert.doesNotMatch(JSON.stringify(am), /[\u3400-\u9fff]/);
  assert.doesNotMatch(JSON.stringify(am), /አንተ ጠባቂ/);
  assert.doesNotMatch(JSON.stringify(am), /@(autoij|autoj)\.com/);
});

test("Solutions headings do not append a second period after translated punctuation", async () => {
  const source = await readFile(
    new URL("../views/solutions.tsx", import.meta.url),
    "utf8",
  );

  assert.doesNotMatch(source, /<\/span>\./);
});
