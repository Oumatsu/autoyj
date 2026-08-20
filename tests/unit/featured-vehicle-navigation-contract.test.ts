import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const portalPage = readFileSync("app/portal/page.tsx", "utf8");

test("featured vehicle navigation only runs from its click action and targets a complete stock row", () => {
  const vehiclesStart = portalPage.indexOf("function AdminVehicles");
  const vehiclesEnd = portalPage.indexOf("function AdminQuotes", vehiclesStart);
  const vehicles = portalPage.slice(vehiclesStart, vehiclesEnd);

  expect(vehicles).toContain("FeaturedVehicleCarousel");
  expect(vehicles).toContain("featuredVehicleId");
  expect(vehicles).not.toContain("new URLSearchParams(window.location.search)");
  expect(vehicles).not.toContain("window.history.pushState");
  expect(vehicles).toContain("rowIds");
  expect(portalPage).toContain("animate-featured-resource-flash");
});
