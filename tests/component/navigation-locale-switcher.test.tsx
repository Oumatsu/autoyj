import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { LocaleLink } from "../../i18n/LocaleLink";

describe("Component: Navigation Bar & Locale Link Component Integrity", () => {
  test("LocaleLink component preserves active locale prefix in href attribute", () => {
    const linkHtml = renderToString(
      React.createElement(LocaleLink, { href: "/products/revenue-king" }, "Revenue King")
    );

    expect(linkHtml).toMatch(/href="\/[a-z]{2}\/products\/revenue-king"/);
    expect(linkHtml.includes("[object Object]")).toBe(false);
  });

  test("LocaleLink preserves external HTTP URLs without modifying path", () => {
    const linkHtml = renderToString(
      React.createElement(LocaleLink, { href: "https://wa.me/8613800000000" }, "WhatsApp")
    );

    expect(linkHtml).toMatch(/href="https:\/\/wa\.me\/8613800000000"/);
  });
});
