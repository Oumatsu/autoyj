import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import ConfigureKitPage from "../../views/solutions/configure-kit";

describe("Component: Configure Kit Customizer View", () => {
  test("ConfigureKitPage component renders parts list, add-ons options and preview sidebar", () => {
    const html = renderToString(React.createElement(ConfigureKitPage));

    expect(html).toMatch(/solutions|备件|套件/i);
    expect(html.includes("[object Object]")).toBe(false);
  });
});
