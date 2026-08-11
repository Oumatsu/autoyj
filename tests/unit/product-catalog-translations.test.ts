import { describe, expect, test } from "bun:test";
import { readFile } from "node:fs/promises";
import {
  catalogFilterKey,
  catalogModelKey,
  catalogValueId,
} from "../../views/products/catalogTranslations";
import am from "../../i18n/translations/am.json";
import en from "../../i18n/translations/en.json";
import zh from "../../i18n/translations/zh.json";

function leafCount(value: any): number {
  if (!value || typeof value !== "object") return 1;
  return Object.values(value).reduce((total: number, child: any) => total + leafCount(child), 0);
}

describe("Unit: Product Catalog Translation Identifiers & Dictionary Manifest", () => {
  test("catalog translation keys are stable for model slugs and raw filter values", () => {
    expect(catalogValueId("Hatchback (Sub-Compact)")).toBe("hatchback-sub-compact");
    expect(catalogValueId("  800V  ")).toBe("800v");
    expect(catalogModelKey("geely-geome", "displayName")).toBe(
      "catalog.models.geely-geome.displayName"
    );
    expect(catalogFilterKey("batteryChemistry", "Semi-solid-state")).toBe(
      "catalog.filters.batteryChemistry.semi-solid-state"
    );
  });

  test("synced locale dictionaries cover the complete live catalog manifest", () => {
    for (const locale of [zh, en, am]) {
      expect(Object.keys(locale.catalog.models).length).toBe(47);
      expect(leafCount(locale.catalog.models)).toBe(109);
      expect(leafCount(locale.catalog.filters)).toBe(45);
      expect(leafCount(locale.catalog.cardField)).toBe(1);
      expect(leafCount(locale.catalog.cardValues)).toBe(8);
      expect(leafCount(locale.catalog)).toBe(163);
    }

    expect(zh.catalog.models["geely-geome"].displayName).toBe("吉利星愿");
    expect(en.catalog.models["geely-geome"].displayName).toBe("Geely Geome");
    expect(am.catalog.models["geely-geome"].displayName).toBe("Geely Geome");
    expect(zh.catalog.filters.vehicleClass["compact-suv"]).toBe("紧凑型SUV");
    expect(am.catalog.filters.batteryChemistry.lfp).toBe("ሊቲየም ብረት ፎስፌት (LFP)");
  });

  test("Amharic translates catalog descriptions and meaningful filter values", () => {
    for (const slug of Object.keys(en.catalog.models)) {
      expect(am.catalog.models[slug as keyof typeof am.catalog.models].cardHighlight).not.toBe(
        en.catalog.models[slug as keyof typeof en.catalog.models].cardHighlight
      );
    }
  });

  test("all product category cards resolve slug-keyed names and highlights", async () => {
    for (const page of ["revenue-king", "elite-flagship", "utility-pro"]) {
      const source = await readFile(
        new URL(`../../views/products/${page}.tsx`, import.meta.url),
        "utf8"
      );

      expect(source).toMatch(/catalogModelKey\(vehicle\.slug, "displayName"\)/);
      expect(source).toMatch(/catalogModelKey\(vehicle\.slug, "cardHighlight"\)/);
      expect(source).toMatch(/catalog\.cardField\.vehicleHighlights/);
      expect(source).toMatch(/catalogFilterKey\("inventoryStatus", rawStatusText\)/);
    }
  });
});
