import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCatalogFilterGroups,
  filterCatalogProducts,
  intervalsOverlap,
} from "../views/products/catalogFilters.ts";

const translate = (_key, fallback) => fallback;

function product(name, filterData) {
  return { name, filterData };
}

test("numeric intervals match when their inclusive intersection is non-empty", () => {
  assert.equal(intervalsOverlap({ min: 300, max: 450 }, { min: 450, max: 700 }), true);
  assert.equal(intervalsOverlap({ min: 301, max: 449 }, { min: 450, max: 700 }), false);
  assert.equal(intervalsOverlap(null, { min: 0, max: 100 }), false);
});

test("builds categorical values from products and hides options with no matches", () => {
  const translated = new Map([
    ["catalog.filters.vehicleClass.compact-suv", "紧凑型 SUV"],
    ["catalog.filters.batteryChemistry.lfp", "磷酸铁锂"],
    ["catalog.filters.steeringSetup.lhd", "左舵"],
    ["catalog.filters.inventoryStatus.in-stock", "现货"],
  ]);
  const translateCatalog = (key, fallback) => translated.get(key) ?? fallback;
  const groups = buildCatalogFilterGroups("revenue-king", [
    product("City", {
      vehicleClasses: ["Compact SUV"],
      batteryChemistries: ["LFP"],
      rangeKm: { min: 280, max: 320 },
      priceUsd: { min: 14000, max: 16000 },
      steeringSetups: ["LHD"],
      inventoryStatuses: ["In Stock"],
    }),
    product("Unknown", {}),
  ], translateCatalog);

  const byId = Object.fromEntries(groups.map((group) => [group.id, group]));
  assert.deepEqual(byId.vehicleClass.options.map((option) => option.label), ["紧凑型 SUV"]);
  assert.deepEqual(byId.batteryChemistry.options.map((option) => option.label), ["磷酸铁锂"]);
  assert.deepEqual(byId.steeringSetup.options.map((option) => option.label), ["左舵"]);
  assert.deepEqual(byId.inventoryStatus.options.map((option) => option.label), ["现货"]);
  assert.equal(byId.vehicleClass.options[0].id, "value:Compact SUV");
  assert.deepEqual(byId.rangeKm.options.map((option) => option.id), [
    "range-under-300",
    "range-300-450",
  ]);
  assert.equal(groups.some((group) => group.options.length === 0), false);
});

test("uses OR within a group, AND across groups, and keeps result order", () => {
  const products = [
    product("First", {
      vehicleClasses: ["Compact SUV"],
      batteryChemistries: ["LFP"],
      priceUsd: { min: 14500, max: 15500 },
    }),
    product("Second", {
      vehicleClasses: ["Sedan"],
      batteryChemistries: ["LFP"],
      priceUsd: { min: 19000, max: 21000 },
    }),
    product("Third", {
      vehicleClasses: ["Pickup Truck"],
      batteryChemistries: ["NCM"],
      priceUsd: { min: 14500, max: 15500 },
    }),
  ];
  const groups = buildCatalogFilterGroups("revenue-king", products, translate);
  const active = {
    vehicleClass: new Set(["value:Compact SUV", "value:Sedan"]),
    batteryChemistry: new Set(["value:LFP"]),
    priceUsd: new Set(["price-15k-20k"]),
  };

  assert.deepEqual(
    filterCatalogProducts(products, active, groups).map((item) => item.name),
    ["First", "Second"],
  );
});

test("products with unknown fields do not match selected options", () => {
  const products = [product("Known", { vehicleClasses: ["Cargo Van"] }), product("Unknown", {})];
  const groups = buildCatalogFilterGroups("utility-pro", products, translate);

  assert.deepEqual(
    filterCatalogProducts(products, { vehicleClass: new Set(["value:Cargo Van"]) }, groups)
      .map((item) => item.name),
    ["Known"],
  );
});
