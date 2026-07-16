import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  catalogCardValueKey,
} from "../views/products/catalogTranslations.ts";
import {
  translateOverviewCard,
} from "../views/products/productsOverviewTranslations.ts";
import am from "../i18n/translations/am.ts";
import en from "../i18n/translations/en.ts";
import zh from "../i18n/translations/zh.ts";

const featuredSlugs = [
  "byd-seagull",
  "gac-aion-rt",
  "byd-qin-plus",
  "geely-galaxy-e5",
  "aito-m9",
  "zeekr-001",
  "xiaomi-su7-ultra",
  "byd-shark",
  "radar-rd6",
  "farizon-xingxiang-v",
];

test("overview translation keys are stable", () => {
  assert.equal(
    catalogCardValueKey("405km Range"),
    "catalog.cardValues.405km-range",
  );
});

test("overview cards resolve every translatable API field", () => {
  const rawCard = {
    slug: "aito-m9",
    name: "AITO M9",
    desc: "Huawei's ADS 3.0 tech masterpiece.",
    tag: "Performance King",
    label: "Tech Pinnacle",
    tags: ["405km Range"],
  };
  const translations = {
    "catalog.models.aito-m9.displayName": "问界M9",
    "catalog.models.aito-m9.cardHighlight": "华为 ADS 3.0 技术旗舰",
    "catalog.models.aito-m9.cardTag": "性能旗舰",
    "catalog.models.aito-m9.cardLabel": "科技巅峰",
    "catalog.cardValues.405km-range": "405 公里续航",
  };
  const t = (key, fallback) => translations[key] ?? fallback;

  assert.deepEqual(translateOverviewCard(rawCard, t), {
    ...rawCard,
    name: "问界M9",
    desc: "华为 ADS 3.0 技术旗舰",
    tag: "性能旗舰",
    label: "科技巅峰",
    tags: ["405 公里续航"],
  });
});

test("overview cards tolerate malformed translations and tag payloads", () => {
  const card = {
    slug: "aito-m9",
    name: "AITO M9",
    desc: "Description",
    tag: "Tag",
    label: "Label",
    tags: "not-an-array",
  };
  const malformedT = () => ({ invalid: true });

  assert.deepEqual(translateOverviewCard(card, malformedT), {
    ...card,
    tags: [],
  });
});

test("Chinese and Amharic cover every featured overview card", () => {
  for (const slug of featuredSlugs) {
    assert.equal(typeof zh.catalog.models[slug].displayName, "string");
    assert.equal(typeof am.catalog.models[slug].displayName, "string");
    assert.notEqual(
      zh.catalog.models[slug].cardHighlight,
      en.catalog.models[slug].cardHighlight,
      `${slug} must have a Chinese card description`,
    );
    assert.notEqual(
      am.catalog.models[slug].cardHighlight,
      en.catalog.models[slug].cardHighlight,
      `${slug} must have an Amharic card description`,
    );
    assert.notEqual(
      zh.catalog.models[slug].cardTag,
      en.catalog.models[slug].cardTag,
      `${slug} must have a Chinese card tag`,
    );
    assert.notEqual(
      am.catalog.models[slug].cardTag,
      en.catalog.models[slug].cardTag,
      `${slug} must have an Amharic card tag`,
    );
  }

  for (const slug of [
    "aito-m9",
    "byd-shark",
    "radar-rd6",
    "xiaomi-su7-ultra",
    "zeekr-001",
  ]) {
    assert.notEqual(zh.catalog.models[slug].cardLabel, en.catalog.models[slug].cardLabel);
    assert.notEqual(am.catalog.models[slug].cardLabel, en.catalog.models[slug].cardLabel);
  }

  for (const key of Object.keys(en.catalog.cardValues)) {
    assert.notEqual(zh.catalog.cardValues[key], en.catalog.cardValues[key]);
    assert.notEqual(am.catalog.cardValues[key], en.catalog.cardValues[key]);
  }
});

test("overview category headings match navigation terminology", () => {
  for (const locale of [zh, am]) {
    assert.equal(
      `${locale.products.revenueKing.heading}${locale.products.revenueKing.headingAccent}`,
      locale.nav.revenueKing.replace(/\s/g, ""),
    );
    assert.equal(
      `${locale.products.eliteFlagship.heading}${locale.products.eliteFlagship.headingAccent}`,
      locale.nav.eliteFlagship.replace(/\s/g, ""),
    );
    assert.equal(
      `${locale.products.utilityPro.heading}${locale.products.utilityPro.headingAccent}`,
      locale.nav.utilityPro.replace(/\s/g, ""),
    );
    assert.match(locale.products.savePerMonthTemplate, /\{amount\}/);
    assert.equal(typeof locale.products.hero.imageAlt, "string");
  }
});

test("the products overview does not render raw API card copy", async () => {
  const source = await readFile(
    new URL("../views/products.tsx", import.meta.url),
    "utf8",
  );

  assert.match(source, /translateOverviewCard/);
  assert.doesNotMatch(source, /\{car\.desc\}/);
  assert.doesNotMatch(source, /\{car\.tag\}/);
  assert.doesNotMatch(source, /\{car\.label\}/);
  assert.doesNotMatch(source, /\{car\.name\}/);
});
