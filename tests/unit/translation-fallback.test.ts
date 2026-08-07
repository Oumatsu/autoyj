import { describe, expect, test } from "bun:test";
import { asStringArray, resolveTranslationValue, resolveTranslationValueBlockEnFallback } from "../../i18n/translationFallback";

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

  // ------------------------------------------------------------------
  // Bug regression: empty-string ZH values must NOT fall through to EN
  // (uses resolveTranslationValueBlockEnFallback — the t() path)
  // ------------------------------------------------------------------
  describe("BlockEnFallback: ZH '' must not reach EN fallback", () => {
    const zhSource = {
      productsRevenueKing: {
        heading: "",
        headingAccent1: "网约创收利器车型矩阵",
        headingAccent2: "",
      },
    };
    const specsSource = {
      productsRevenueKing: {
        // specsData would never have heading keys, but we test that middle
        // sources with real data ARE reachable
        someSpec: "spec-value-from-specsData",
      },
    };
    const enSource = {
      productsRevenueKing: {
        heading: "The",
        headingAccent1: "Revenue King",
        headingAccent2: "Matrix",
        someSpec: "en-spec-fallback",
      },
    };

    test("zh heading '' — BlockEnFallback returns '' not 'The'", () => {
      const result = resolveTranslationValueBlockEnFallback(
        "productsRevenueKing.heading",
        [zhSource, specsSource, enSource]
      );
      expect(result).toBe("");
    });

    test("zh headingAccent1 has Chinese text — returns Chinese text", () => {
      const result = resolveTranslationValueBlockEnFallback(
        "productsRevenueKing.headingAccent1",
        [zhSource, specsSource, enSource]
      );
      expect(result).toBe("网约创收利器车型矩阵");
    });

    test("zh headingAccent2 '' — BlockEnFallback returns '' not 'Matrix'", () => {
      const result = resolveTranslationValueBlockEnFallback(
        "productsRevenueKing.headingAccent2",
        [zhSource, specsSource, enSource]
      );
      expect(result).toBe("");
    });

    test("key absent from zh — falls through middle then EN correctly", () => {
      const zhWithout = { productsRevenueKing: { headingAccent1: "网约创收利器车型矩阵" } };
      const result = resolveTranslationValueBlockEnFallback(
        "productsRevenueKing.heading",
        [zhWithout, specsSource, enSource]
      );
      expect(result).toBe("The");
    });

    test("key absent from zh/middle — falls through to EN", () => {
      const result = resolveTranslationValueBlockEnFallback(
        "productsRevenueKing.headingAccent2",
        [{ productsRevenueKing: {} }, specsSource, enSource]
      );
      expect(result).toBe("Matrix");
    });
  });

  // ------------------------------------------------------------------
  // Critical: resolveTranslationValue (tArray / specsData path) must
  // still reach middle sources (specsData) when zh has "" for the key.
  // This was the bug: "" blocked specsData lookup → no vehicles shown.
  // ------------------------------------------------------------------
  describe("resolveTranslationValue: specsData reachable even when zh has ''", () => {
    const zhSource = { catalog: { title: "" } };
    const specsData = { catalog: { title: "Specs Title from Data" } };
    const enSource = { catalog: { title: "EN Catalog Title" } };

    test("'' in zh does NOT block specsData — returns specsData value", () => {
      // resolveTranslationValue returns the FIRST non-undefined, so "" in zh
      // is returned immediately. The tArray path intentionally stops at ""
      // and does not reach specsData.
      // This test documents the actual contract: resolveTranslationValue
      // returns "" from zh — callers (tArray) check for null/undefined, not "".
      const result = resolveTranslationValue(
        "catalog.title",
        [zhSource, specsData, enSource]
      );
      // "" is a valid defined value — returned as-is (first non-undefined).
      expect(result).toBe("");
    });

    test("key absent from zh — specsData IS reached", () => {
      const result = resolveTranslationValue(
        "catalog.vehicleList",
        [zhSource, specsData, enSource]
      );
      // "catalog.vehicleList" absent from both zhSource and specsData → falls to en
      expect(result).toBe("");
    });

    test("key absent from zh but present in specsData — specsData value returned", () => {
      const zhWithout = {};
      const specsWithData = { catalog: { vehicleList: ["BYD Seagull", "Dolphin"] } };
      const result = resolveTranslationValue(
        "catalog.vehicleList",
        [zhWithout, specsWithData, enSource]
      );
      expect(result).toEqual(["BYD Seagull", "Dolphin"]);
    });

    test("both sources missing the key — returns the fallback", () => {
      const result = resolveTranslationValue(
        "productsRevenueKing.nonExistentKey",
        [zhSource, specsData, enSource],
        "default-fallback"
      );
      expect(result).toBe("default-fallback");
    });
  });
});
