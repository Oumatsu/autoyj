import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import HomePage from "../../views/page";
import { TolgeeWrapper } from "../../components/TolgeeWrapper";

describe("Component: Real Home Page View & Trust Bar", () => {
  test("HomePage component renders HeroSlider, Trust Bar, and product sections cleanly", () => {
    const html = renderToString(
      React.createElement(TolgeeWrapper as any, { locale: "en" }, React.createElement(HomePage))
    );

    expect(html).toMatch(/Explore Our Process/i);
    expect(html).toContain("COSCO");
    expect(html.includes("[object Object]")).toBe(false);
  });
});
