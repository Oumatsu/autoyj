import { describe, expect, test } from "bun:test";
import { getLocaleFromPath, getNestedValue } from "../../i18n/utils";

describe("Unit: i18n Path Parsing & Nested Value Navigation", () => {
  test("getLocaleFromPath extracts valid locale segment from URL path", () => {
    expect(getLocaleFromPath("/zh/products/revenue-king")).toBe("zh");
    expect(getLocaleFromPath("/en/solutions")).toBe("en");
    expect(getLocaleFromPath("/am/about")).toBe("am");
  });

  test("getLocaleFromPath falls back to default locale for invalid or empty path", () => {
    expect(getLocaleFromPath("/fr/products")).toBe("en");
    expect(getLocaleFromPath("/")).toBe("en");
    expect(getLocaleFromPath(null)).toBe("en");
  });

  test("getNestedValue safely navigates deeply nested objects and arrays", () => {
    const data = {
      nav: {
        items: [{ title: "Home" }, { title: "Products" }],
      },
    };

    expect(getNestedValue(data, "nav.items.0.title")).toBe("Home");
    expect(getNestedValue(data, "nav.items.1.title")).toBe("Products");
    expect(getNestedValue(data, "nav.missing.key")).toBeUndefined();
  });
});
