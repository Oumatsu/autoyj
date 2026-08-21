import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("Component: Font Optimization & Fallback Chain Rules", () => {
  test("globals.css defines unified --font-global with PingFang SC and Ethiopic fallbacks", () => {
    const css = readFileSync("app/globals.css", "utf8");
    expect(css).toContain("--font-global");
    expect(css).toContain("PingFang SC");
    expect(css).toContain("Noto Sans Ethiopic");
    expect(css).toContain("Kefa");
    expect(css).toContain("Ebrima");
  });

  test("app/layout.tsx imports Google Fonts with display: swap for zero-FOIT rendering", () => {
    const layout = readFileSync("app/layout.tsx", "utf8");
    expect(layout).toContain("display: \"swap\"");
    expect(layout).toContain("font-sans");
    expect(layout).not.toContain("weight: [");
  });
});
