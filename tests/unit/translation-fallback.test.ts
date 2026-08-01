import { describe, expect, test } from "bun:test";
import { asStringArray, resolveTranslationValue } from "../../i18n/translationFallback";

describe("Unit: Translation Fallback & Resolver Logic", () => {
  test("missing dynamic translation falls back to static locale value", () => {
    const staticTags = ["Market Analysis", "African EV Market"];

    expect(
      resolveTranslationValue("insightsDetail.tags.market", [
        { insights: {} },
        { insightsDetail: { tags: { market: staticTags } } },
      ])
    ).toEqual(staticTags);
  });

  test("dynamic translation overrides static locale value", () => {
    expect(
      resolveTranslationValue("catalog.title", [
        { catalog: { title: "Live title" } },
        { catalog: { title: "Static title" } },
      ])
    ).toBe("Live title");
  });

  test("tag normalization always returns a clean string array", () => {
    const fallback = ["Market Analysis", "Industry Report"];

    expect(asStringArray("insightsDetail.tags.market", fallback)).toEqual(fallback);
    expect(asStringArray(["Market Analysis", 42], fallback)).toEqual(fallback);
    expect(asStringArray(["Market Analysis", "Industry Report"], fallback)).toEqual([
      "Market Analysis",
      "Industry Report",
    ]);
  });
});
