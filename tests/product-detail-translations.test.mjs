import assert from "node:assert/strict";
import test from "node:test";

import {
  detailModelKey,
  detailVariantKey,
  translatedDetailArray,
  translatedDetailString,
} from "../views/products/detailTranslations.ts";

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
