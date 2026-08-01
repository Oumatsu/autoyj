import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import ProductsPage from "../../views/products";

describe("Component: Products Overview Utility Showcase", () => {
  test("ProductsPage component renders the 3 Utility Pro showcase vehicles in DOM", () => {
    const html = renderToString(React.createElement(ProductsPage));

    expect(html).toMatch(/\/products\/utility-pro\/byd-shark/);
    expect(html).toMatch(/\/products\/utility-pro\/radar-rd6/);
    expect(html).toMatch(/\/products\/utility-pro\/farizon-xingxiang-v/);
    expect(html.includes("farizon-super-van")).toBe(false);
  });
});
