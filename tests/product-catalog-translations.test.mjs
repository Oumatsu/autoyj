import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  catalogFilterKey,
  catalogModelKey,
  catalogValueId,
} from "../views/products/catalogTranslations.ts";
import am from "../i18n/translations/am.ts";
import en from "../i18n/translations/en.ts";
import zh from "../i18n/translations/zh.ts";

function leafCount(value) {
  if (!value || typeof value !== "object") return 1;
  return Object.values(value).reduce((total, child) => total + leafCount(child), 0);
}

test("catalog translation keys are stable for model slugs and raw filter values", () => {
  assert.equal(catalogValueId("Hatchback (Sub-Compact)"), "hatchback-sub-compact");
  assert.equal(catalogValueId("  800V  "), "800v");
  assert.equal(
    catalogModelKey("geely-geome", "displayName"),
    "catalog.models.geely-geome.displayName",
  );
  assert.equal(
    catalogFilterKey("batteryChemistry", "Semi-solid-state"),
    "catalog.filters.batteryChemistry.semi-solid-state",
  );
});

test("synced locale dictionaries cover the complete live catalog manifest", () => {
  for (const locale of [zh, en, am]) {
    assert.equal(Object.keys(locale.catalog.models).length, 47);
    assert.equal(leafCount(locale.catalog.models), 109);
    assert.equal(leafCount(locale.catalog.filters), 39);
    assert.equal(leafCount(locale.catalog.cardField), 1);
    assert.equal(leafCount(locale.catalog.cardValues), 8);
    assert.equal(leafCount(locale.catalog), 157);
  }

  assert.equal(zh.catalog.models["geely-geome"].displayName, "吉利星愿");
  assert.equal(en.catalog.models["geely-geome"].displayName, "Geely Geome");
  assert.equal(am.catalog.models["geely-geome"].displayName, "Geely Geome");
  assert.equal(zh.catalog.filters.vehicleClass["compact-suv"], "紧凑型SUV");
  assert.equal(am.catalog.filters.batteryChemistry.lfp, "ሊቲየም ብረት ፎስፌት (LFP)");
  assert.equal(zh.productsEliteFlagship.filterGroups.powertrainType, "动力类型");
  assert.equal(zh.productsEliteFlagship.filterOptions.priceUnder35k, "$35,000 以下");
  assert.equal(zh.productsUtilityPro.filterGroups.drivetrain, "驱动形式");
  assert.equal(zh.productsUtilityPro.filterGroups.v2lAvailability, "V2L 外放电");
  assert.equal(zh.productsUtilityPro.filterGroups.groundClearance, "离地间隙");
  assert.equal(am.productsEliteFlagship.filterGroups.powertrainType, "የኃይል ስርዓት ዓይነት");
  assert.equal(am.productsEliteFlagship.filterOptions.priceUnder35k, "ከ$35,000 በታች");
  assert.equal(am.productsUtilityPro.filterGroups.drivetrain, "የጎማ አንቀሳቃሽ ስርዓት");
  assert.equal(am.productsUtilityPro.filterGroups.v2lAvailability, "የV2L ኃይል ማቅረብ");
  assert.equal(am.productsUtilityPro.filterGroups.groundClearance, "የመሬት ክፍተት");
});

test("Amharic translates catalog descriptions and meaningful filter values", () => {
  for (const slug of Object.keys(en.catalog.models)) {
    assert.notEqual(
      am.catalog.models[slug].cardHighlight,
      en.catalog.models[slug].cardHighlight,
      `${slug} card highlight must not fall back to English`,
    );
  }

  for (const group of [
    "vehicleClass",
    "batteryChemistry",
    "steeringSetup",
    "powertrainType",
    "inventoryStatus",
    "v2lAvailability",
    "drivetrain",
  ]) {
    for (const key of Object.keys(en.catalog.filters[group])) {
      assert.notEqual(
        am.catalog.filters[group][key],
        en.catalog.filters[group][key],
        `${group}.${key} must not fall back to English`,
      );
    }
  }
});

test("Amharic category-page copy preserves placeholders and uses automotive context", () => {
  for (const namespace of ["productsRevenueKing", "productsEliteFlagship", "productsUtilityPro"]) {
    assert.match(am[namespace].showing, /\{start\}/);
    assert.match(am[namespace].showing, /\{end\}/);
    assert.match(am[namespace].showing, /\{total\}/);
    assert.equal(am[namespace].estPrice, "ግምታዊ ዋጋ");
    assert.equal(am[namespace].filterGroups.availability, "የክምችት ሁኔታ");
  }

  assert.equal(am.productsRevenueKing.heading, "የገቢ");
  assert.equal(am.productsRevenueKing.headingAccent1, "ንጉሥ");
  assert.equal(am.productsRevenueKing.filterGroups.bodyStyle, "የመኪና አካል ዓይነት");
  assert.equal(am.productsEliteFlagship.filterGroups.bodyStyle, "የመኪና አካል ዓይነት");
  assert.equal(am.productsRevenueKing.filterGroups.range, "የከተማ የመንዳት ርቀት (NEDC)");
  assert.equal(am.productsEliteFlagship.filterGroups.range, "የመንዳት ርቀት (CLTC)");
  assert.equal(am.productsUtilityPro.filterGroups.range, "የመንዳት ርቀት (NEDC)");
});

test("all product category cards resolve slug-keyed names and highlights", async () => {
  for (const page of ["revenue-king", "elite-flagship", "utility-pro"]) {
    const source = await readFile(
      new URL(`../views/products/${page}.tsx`, import.meta.url),
      "utf8",
    );

    assert.match(source, /catalogModelKey\(vehicle\.slug, "displayName"\)/);
    assert.match(source, /catalogModelKey\(vehicle\.slug, "cardHighlight"\)/);
    assert.match(source, /catalog\.cardField\.vehicleHighlights/);
    assert.match(
      source,
      /catalogFilterKey\("inventoryStatus", rawStatusText\)/,
      `${page} must translate API inventory status text`,
    );
  }
});
