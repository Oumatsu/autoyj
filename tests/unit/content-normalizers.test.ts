import { describe, expect, test } from "bun:test";
import {
  normalizeAssetUrl,
  normalizeProductCategory,
  normalizeProductSlug,
  parseJsonArray,
} from "../../lib/content-normalizers";

describe("content normalizers", () => {
  test("maps source segment and product path aliases to the three UI categories", () => {
    expect(normalizeProductCategory("ride-hailing", "/products/revenue-king/byd-seagull"))
      .toBe("revenue-king");
    expect(normalizeProductCategory("旗舰", "/products/elite-flagship/byd-seal"))
      .toBe("elite-flagship");
    expect(normalizeProductCategory("commercial", "/products/utility-pro/byd-shark"))
      .toBe("utility-pro");
  });

  test("normalizes route and database product identifiers to the same slug", () => {
    expect(normalizeProductSlug(" /products/revenue-king/BYD Seagull/ ")).toBe("byd-seagull");
    expect(normalizeProductSlug("byd_seagull")).toBe("byd-seagull");
  });

  test("rejects route-relative and Feishu asset URLs", () => {
    expect(normalizeAssetUrl("hero.webp")).toBeNull();
    expect(normalizeAssetUrl("https://open.feishu.cn/file/abc")).toBeNull();
    expect(normalizeAssetUrl("/pic/hero/0.webp")).toBe("/pic/hero/0.webp");
  });

  test("returns a typed empty value for malformed JSON", () => {
    expect(parseJsonArray("{bad json}")).toEqual([]);
    expect(parseJsonArray('["one", 2]')).toEqual(["one"]);
  });
});
