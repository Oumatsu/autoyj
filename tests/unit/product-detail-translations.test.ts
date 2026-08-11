import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import {
  detailModelKey,
  detailValueKey,
  detailVariantKey,
  translatedDetailArray,
  translatedDetailValue,
  translatedDetailValues,
  translatedDetailString,
} from "../../views/products/detailTranslations";
import {
  sharedDetailTranslations,
  translateAutomotivePhrase,
  translateTrimName,
} from "../../scripts/i18n/product-detail-data.mjs";

describe("Unit: Product Detail Translation Identifiers & Phrase Grammar", () => {
  test("detail translation keys use stable normalized vehicle identifiers", () => {
    expect(detailModelKey("AITO-M9", "heroDescription")).toBe(
      "productsDetail.models.aito-m9.heroDescription"
    );
    expect(detailVariantKey("MDL-019-1234-6", "trimName")).toBe(
      "productsDetail.variants.mdl-019-1234-6.trimName"
    );
  });

  test("shared detail value keys are stable and reuse identical source text", () => {
    expect(detailValueKey("Verified")).toBe(detailValueKey("Verified"));
    expect(detailValueKey("Verified")).toMatch(/^productsDetail\.values\.[0-9a-f]{8}$/);
    expect(detailValueKey("Verified")).not.toBe(detailValueKey("TBC"));
  });

  test("shared detail value resolvers preserve invariant fallback and empty arrays", () => {
    expect(translatedDetailValue(() => undefined, "120 kW / 250 N-m")).toBe("120 kW / 250 N-m");
    expect(translatedDetailValues(() => undefined, [])).toEqual([]);
    expect(
      translatedDetailValues(
        (key) => (key === detailValueKey("Verified") ? "已核实" : undefined),
        ["Verified", "120 kW"]
      )
    ).toEqual(["已核实", "120 kW"]);
  });

  test("detail string translation falls back when the resolved value is not text", () => {
    const translated = translatedDetailString(
      (key, fallback) => (key.endsWith("title") ? "已翻译" : fallback),
      "productsDetail.ui.title",
      "Title"
    );
    const fallback = translatedDetailString(
      () => ["not", "text"] as any,
      "productsDetail.ui.title",
      "Title"
    );

    expect(translated).toBe("已翻译");
    expect(fallback).toBe("Title");
  });

  test("detail array translation preserves English fallback for malformed values", () => {
    const source = ["Range: 520 km", "Battery: LFP"];
    expect(
      translatedDetailArray(() => ["续航：520 km", "电池：LFP"], "key", source)
    ).toEqual(["续航：520 km", "电池：LFP"]);
    expect(translatedDetailArray(() => "not-an-array" as any, "key", source)).toEqual(source);
    expect(translatedDetailArray(() => ["wrong length"], "key", source)).toEqual(source);
  });

  test("automotive phrase grammar translates inherited, labelled, upgraded and list values", () => {
    const source = "Carried from 410km Explorer Edition: Front seat functions: heating -> heating; ventilation";
    const zh = translateAutomotivePhrase(source, "zh");
    const am = translateAutomotivePhrase(source, "am");
    expect(zh).toMatch(/继承自/);
    expect(zh).toMatch(/前排座椅功能/);
    expect(zh).toMatch(/加热.*通风/);
    expect(am).toMatch(/የተወረሰ/);
    expect(am).toMatch(/የፊት መቀመጫ/);
    expect(am).toMatch(/ማሞቂያ.*አየር/);
    expect(translateTrimName("480km Explorer+ Edition", "zh")).toBe("480km Explorer+ 版");
  });

  test("shared detail translation manifest covers every active UI key", async () => {
    const source = await readFile(new URL("../../app/products/_VehicleDetail.tsx", import.meta.url), "utf8");
    const usedKeys = [...source.matchAll(/productsDetail\.ui\.([A-Za-z0-9]+)/g)].map((match) => `productsDetail.ui.${match[1]}`);
    const manifestKeys = new Set(sharedDetailTranslations.map((record: any) => record.Key));
    expect(usedKeys.length).toBeGreaterThanOrEqual(45);
    expect([...new Set(usedKeys)].filter((key) => !manifestKeys.has(key))).toEqual([]);
  });

  test("translatedDetailValue NEVER returns productsDetail.values key string when key is missing in translate", () => {
    // Simulate translate function returning the raw key when untranslated
    const mockTranslate = (key: string, fallback?: string) => key;
    const result = translatedDetailValue(mockTranslate, "Geely Geome 310km Star Version");
    expect(result).toBe("Geely Geome 310km Star Version");
    expect(result).not.toContain("productsDetail.values");
  });

  test("translatedDetailString NEVER returns productsDetail raw keys when key is missing in translate", () => {
    const mockTranslate = (key: string, fallback?: string) => key;
    const result = translatedDetailString(mockTranslate, "productsDetail.models.geely-geome.heroDesc", "Geely Geome Hero Description");
    expect(result).toBe("Geely Geome Hero Description");
    expect(result).not.toContain("productsDetail");
  });
});
