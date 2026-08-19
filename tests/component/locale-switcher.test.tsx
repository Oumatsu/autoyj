import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { LocaleSwitcher } from "../../i18n/LocaleSwitcher";

describe("Component: Responsive Segmented LocaleSwitcher", () => {
  test("renders compact segmented control with ZH, EN, AM pills", () => {
    const html = renderToString(<LocaleSwitcher variant="compact" />);
    expect(html).toContain("ZH");
    expect(html).toContain("EN");
    expect(html).toContain("AM");
    expect(html).toContain("aria-label=\"Language selection\"");
  });

  test("renders full-width 3-segment touch bar for mobile drawer", () => {
    const html = renderToString(<LocaleSwitcher variant="full" />);
    expect(html).toContain("中文");
    expect(html).toContain("English");
    expect(html).toContain("አማርኛ");
    expect(html).toContain("min-h-[44px]");
  });
});
