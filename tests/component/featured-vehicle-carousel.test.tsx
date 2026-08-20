import { expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { FeaturedVehicleCarousel } from "../../components/portal/FeaturedVehicleCarousel";

test("featured vehicle carousel component is available", async () => {
  const loadedModule = await import("../../components/portal/FeaturedVehicleCarousel").catch(() => null);

  expect(loadedModule).not.toBeNull();
  expect(typeof loadedModule?.FeaturedVehicleCarousel).toBe("function");
});

test("renders image-led featured cards and exposes a semantic stock-detail action", () => {
  const html = renderToString(
    <FeaturedVehicleCarousel
      resources={[
        { id: "V-1", brand: "BYD", model: "Seal", trim: "Excellence", imageUrl: "seal.jpg", priceLabel: "$22,000" },
      ]}
      onSelect={() => {}}
    />,
  );

  expect(html).toContain('aria-label="Featured vehicle resources"');
  expect(html).toContain('alt="BYD Seal"');
  expect(html).toContain("$22,000");
  expect(html).toContain('aria-label="View featured vehicle BYD Seal"');
});

test("renders a three-card stage with the active resource centered", () => {
  const html = renderToString(
    <FeaturedVehicleCarousel
      resources={[
        { id: "V-1", brand: "BYD", model: "Seal", imageUrl: "seal.jpg", priceLabel: "$22,000" },
        { id: "V-2", brand: "BYD", model: "Yuan Plus", imageUrl: "yuan.jpg", priceLabel: "$18,000" },
        { id: "V-3", brand: "BYD", model: "Sealion", imageUrl: "sealion.jpg", priceLabel: "$24,000" },
      ]}
      onSelect={() => {}}
    />,
  );

  expect(html).toContain('aria-roledescription="carousel"');
  expect(html).toContain('data-featured-card-position="active"');
  expect((html.match(/data-featured-card-position="adjacent"/g) ?? []).length).toBe(4);
  expect(html).toContain('aria-label="Next featured vehicle"');
});

test("renders a continuous card track with duplicate end cards for seamless looping", () => {
  const html = renderToString(
    <FeaturedVehicleCarousel
      resources={[
        { id: "V-1", brand: "BYD", model: "Seal", imageUrl: "seal.jpg", priceLabel: "$22,000" },
        { id: "V-2", brand: "BYD", model: "Yuan Plus", imageUrl: "yuan.jpg", priceLabel: "$18,000" },
        { id: "V-3", brand: "BYD", model: "Sealion", imageUrl: "sealion.jpg", priceLabel: "$24,000" },
        { id: "V-4", brand: "BYD", model: "Dolphin", imageUrl: "dolphin.jpg", priceLabel: "$16,000" },
      ]}
      onSelect={() => {}}
    />,
  );

  expect(html).toContain('data-featured-carousel-track="true"');
  expect(html).toContain('alt="BYD Dolphin"');
  expect((html.match(/alt="BYD Seal"/g) ?? []).length).toBe(2);
});
