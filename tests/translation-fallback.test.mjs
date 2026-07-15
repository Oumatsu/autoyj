import assert from "node:assert/strict";
import test from "node:test";

import { asStringArray, resolveTranslationValue } from "../i18n/translationFallback.ts";

test("missing dynamic translation falls back to the static locale value", () => {
  const staticTags = ["Market Analysis", "African EV Market"];

  assert.deepEqual(
    resolveTranslationValue(
      "insightsDetail.tags.market",
      [{ insights: {} }, { insightsDetail: { tags: { market: staticTags } } }],
    ),
    staticTags,
  );
});

test("dynamic translation still overrides the static locale value", () => {
  assert.equal(
    resolveTranslationValue("catalog.title", [
      { catalog: { title: "Live title" } },
      { catalog: { title: "Static title" } },
    ]),
    "Live title",
  );
});

test("tag normalization always returns a string array", () => {
  const fallback = ["Market Analysis", "Industry Report"];

  assert.deepEqual(asStringArray("insightsDetail.tags.market", fallback), fallback);
  assert.deepEqual(asStringArray(["Market Analysis", 42], fallback), fallback);
  assert.deepEqual(asStringArray(["Market Analysis", "Industry Report"], fallback), [
    "Market Analysis",
    "Industry Report",
  ]);
});
