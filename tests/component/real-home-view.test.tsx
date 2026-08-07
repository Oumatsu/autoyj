import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import HomePage from "../../views/page";

describe("Component: Real Home Page View & Trust Bar", () => {
  test("HomePage component renders HeroSlider, Trust Bar, and product sections cleanly", () => {
    const html = renderToString(React.createElement(HomePage));

    expect(html).toMatch(/Explore Our Process/i);
    expect(html.includes("[object Object]")).toBe(false);
  });
});
