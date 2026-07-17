import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  detailModelKey,
  detailValueKey,
  detailVariantKey,
  translatedDetailArray,
  translatedDetailValue,
  translatedDetailValues,
  translatedDetailString,
} from "../views/products/detailTranslations.ts";
import {
  sharedDetailTranslations,
  translateAutomotivePhrase,
  translateTrimName,
} from "../scripts/product-detail-i18n-data.mjs";

test("detail translation keys use stable normalized vehicle identifiers", () => {
  assert.equal(
    detailModelKey("AITO-M9", "heroDescription"),
    "productsDetail.models.aito-m9.heroDescription",
  );
  assert.equal(
    detailVariantKey("MDL-019-1234-6", "trimName"),
    "productsDetail.variants.mdl-019-1234-6.trimName",
  );
});

test("shared detail value keys are stable and reuse identical source text", () => {
  assert.equal(detailValueKey("Verified"), detailValueKey("Verified"));
  assert.match(detailValueKey("Verified"), /^productsDetail\.values\.[0-9a-f]{8}$/);
  assert.notEqual(detailValueKey("Verified"), detailValueKey("TBC"));
});

test("shared detail value resolvers preserve invariant fallback and empty arrays", () => {
  assert.equal(translatedDetailValue(() => undefined, "120 kW / 250 N-m"), "120 kW / 250 N-m");
  assert.deepEqual(translatedDetailValues(() => undefined, []), []);
  assert.deepEqual(
    translatedDetailValues((key) => key === detailValueKey("Verified") ? "已核实" : undefined, ["Verified", "120 kW"]),
    ["已核实", "120 kW"],
  );
});

test("detail string translation falls back when the resolved value is not text", () => {
  const translated = translatedDetailString(
    (key, fallback) => key.endsWith("title") ? "已翻译" : fallback,
    "productsDetail.ui.title",
    "Title",
  );
  const fallback = translatedDetailString(
    () => ["not", "text"],
    "productsDetail.ui.title",
    "Title",
  );

  assert.equal(translated, "已翻译");
  assert.equal(fallback, "Title");
});

test("detail array translation preserves English fallback for malformed values", () => {
  const source = ["Range: 520 km", "Battery: LFP"];
  assert.deepEqual(
    translatedDetailArray(() => ["续航：520 km", "电池：LFP"], "key", source),
    ["续航：520 km", "电池：LFP"],
  );
  assert.deepEqual(
    translatedDetailArray(() => "not-an-array", "key", source),
    source,
  );
  assert.deepEqual(
    translatedDetailArray(() => ["wrong length"], "key", source),
    source,
  );
});

test("public product detail payload exposes stable model and Trim identities", async () => {
  const source = await readFile(
    new URL("../worker/portal.ts", import.meta.url),
    "utf8",
  );

  assert.match(
    source,
    /trimConfigId:\s*asText\(fields\.trim_config_id\)/,
  );
  assert.match(source, /const data = \{\s*modelId,\s*slug,/s);
});

test("automotive phrase grammar translates inherited, labelled, upgraded and list values", () => {
  const source = "Carried from 410km Explorer Edition: Front seat functions: heating -> heating; ventilation";
  const zh = translateAutomotivePhrase(source, "zh");
  const am = translateAutomotivePhrase(source, "am");
  assert.match(zh, /继承自/);
  assert.match(zh, /前排座椅功能/);
  assert.match(zh, /加热.*通风/);
  assert.match(am, /የተወረሰ/);
  assert.match(am, /የፊት መቀመጫ/);
  assert.match(am, /ማሞቂያ.*አየር/);
  assert.equal(translateTrimName("480km Explorer+ Edition", "zh"), "480km Explorer+ 版");
});

test("shared detail translation manifest covers every active UI key", async () => {
  const source = await readFile(new URL("../app/products/_VehicleDetail.tsx", import.meta.url), "utf8");
  const usedKeys = [...source.matchAll(/productsDetail\.ui\.([A-Za-z0-9]+)/g)].map((match) => `productsDetail.ui.${match[1]}`);
  const manifestKeys = new Set(sharedDetailTranslations.map((record) => record.Key));
  assert.ok(usedKeys.length >= 45);
  assert.deepEqual([...new Set(usedKeys)].filter((key) => !manifestKeys.has(key)), []);
});

test("detail renderer does not consume redundant Gallery, label, status or whole-array keys", async () => {
  const source = await readFile(new URL("../app/products/_VehicleDetail.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(source, /modelText\(`galleryImages\./);
  assert.doesNotMatch(source, /variantArray\(/);
  assert.doesNotMatch(source, /variantText\("(?:sourceStatus|batteryChemistry|motorDisplay|drivetrainDisplay|chargingDisplay)/);
  assert.doesNotMatch(source, /modelText\("stat[123]Label/);
  assert.match(source, /translatedDetailValue/);
  assert.match(source, /translatedDetailValues/);
});

test("detail sync prunes only owned detail namespaces and can mark undeletable rows", async () => {
  const source = await readFile(new URL("../scripts/sync-product-detail-i18n.mjs", import.meta.url), "utf8");
  assert.match(source, /key\.startsWith\("productsDetail\.models\."\)/);
  assert.match(source, /key\.startsWith\("productsDetail\.variants\."\)/);
  assert.match(source, /key\.startsWith\("productsDetail\.values\."\)/);
  assert.match(source, /key\.startsWith\("productsDetail\.ui\."\)/);
  assert.doesNotMatch(source, /key\.startsWith\("productsDetail\."\)/);
  assert.match(source, /"\+record-delete"/);
  assert.match(source, /Module:\s*"待删除-车型详情"/);
  assert.match(source, /detailValueKey\(EN\)/);
  assert.match(source, /new Set\(\[\.\.\.item\.linkedModelIds, \.\.\.linkIds\(current\.fields\["Linked Vehicle Model"\]\)\]\)/);
  assert.match(source, /ownedDuplicates\.push\(\{ key, recordId:/);
  assert.match(source, /\.concat\(existing\.ownedDuplicates\)/);
});
