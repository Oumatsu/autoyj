import { describe, expect, test } from "bun:test";
import {
  detailModelKey,
  detailValueKey,
  detailVariantKey,
  translatedDetailArray,
  translatedDetailValue,
} from "../../views/products/detailTranslations";

describe("Unit: Automotive Specification & Hash Key Normalization", () => {
  test("detailValueKey produces stable hex-hashed translation keys for spec strings", () => {
    const hash1 = detailValueKey("LFP Blade Battery 61.4kWh");
    const hash2 = detailValueKey("LFP Blade Battery 61.4kWh");
    const hash3 = detailValueKey("800V Ultra-Fast Charge");

    expect(hash1).toBe(hash2);
    expect(hash1).toMatch(/^productsDetail\.values\.[0-9a-f]{8}$/);
    expect(hash1).not.toBe(hash3);
  });

  test("detailModelKey and detailVariantKey normalize slug and field IDs cleanly", () => {
    expect(detailModelKey("BYD Seagull 2025", "title")).toBe("productsDetail.models.byd-seagull-2025.title");
    expect(detailVariantKey("Standard Range 305km", "price")).toBe("productsDetail.variants.standard-range-305km.price");
  });

  test("translatedDetailValue falls back gracefully when translation key is missing", () => {
    const mockTranslate = (_key: string, fallback?: string) => fallback;
    const result = translatedDetailValue(mockTranslate, "Custom Spec 123");
    expect(result).toBe("Custom Spec 123");
  });

  test("translatedDetailArray returns translated array when array lengths match exactly", () => {
    const fallbackArray = ["Feature A", "Feature B"];
    const mockTranslate = () => ["特性 A", "特性 B"];

    const result = translatedDetailArray(mockTranslate, "some.key", fallbackArray);
    expect(result).toEqual(["特性 A", "特性 B"]);
  });
});
