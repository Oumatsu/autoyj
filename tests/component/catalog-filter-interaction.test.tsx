import { describe, expect, test } from "bun:test";
import {
  buildCatalogFilterGroups,
  filterCatalogProducts,
} from "../../views/products/catalogFilters";

describe("Component: Catalog Filter Interactive Selection State", () => {
  const sampleProducts = [
    {
      name: "BYD Seagull 2025",
      filterData: {
        vehicleClasses: ["Compact SUV"],
        batteryChemistries: ["LFP"],
        priceUsd: { min: 12000, max: 15000 },
        powertrainTypes: ["BEV"],
      },
    },
    {
      name: "Geely Galaxy E5",
      filterData: {
        vehicleClasses: ["Midsize SUV"],
        batteryChemistries: ["NCM"],
        priceUsd: { min: 22000, max: 28000 },
        powertrainTypes: ["BEV"],
      },
    },
    {
      name: "BYD Shark Pickup",
      filterData: {
        vehicleClasses: ["Pickup Truck"],
        batteryChemistries: ["LFP"],
        priceUsd: { min: 32000, max: 38000 },
        powertrainTypes: ["PHEV"],
      },
    },
  ];

  test("User selecting multiple filter chips filters product list accurately", () => {
    const groups = buildCatalogFilterGroups("revenue-king", sampleProducts, (_k, f) => f ?? "");

    const activeFilters = {
      batteryChemistry: new Set(["value:LFP"]),
    };

    const filtered = filterCatalogProducts(sampleProducts, activeFilters, groups);
    expect(filtered.map((p) => p.name)).toEqual(["BYD Seagull 2025", "BYD Shark Pickup"]);
  });

  test("User deselecting all filters restores complete product catalog", () => {
    const groups = buildCatalogFilterGroups("revenue-king", sampleProducts, (_k, f) => f ?? "");
    const emptyFilters = {};

    const filtered = filterCatalogProducts(sampleProducts, emptyFilters, groups);
    expect(filtered.length).toBe(3);
  });
});
