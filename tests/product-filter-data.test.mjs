import assert from "node:assert/strict";
import test from "node:test";

import { buildProductFilterData } from "../worker/productFilters.ts";

test("maps new Base snake_case fields into structured product filter data", () => {
  assert.deepEqual(
    buildProductFilterData({
      vehicle_class: ["Premium SUV"],
      segment: "Ignored fallback",
      battery_chemistry_auto: "LFP/NCM + Semi-solid-state",
      cltc_range_min_km_auto: "480",
      cltc_range_max_km_auto: 720,
      guide_price_min_usd_auto: "34900",
      guide_price_max_usd_auto: 65100,
      steering_setup: ["LHD", "RHD"],
      powertrain_type: "BEV",
      inventory_status: "Production 30 days",
      voltage_platform_v: 800,
      v2l_availability: "Yes",
      drivetrain_display_auto: "AWD / 4WD",
      ground_clearance_mm: "205",
    }),
    {
      vehicleClasses: ["Premium SUV"],
      batteryChemistries: ["LFP", "NCM", "Semi-solid-state"],
      rangeKm: { min: 480, max: 720 },
      priceUsd: { min: 34900, max: 65100 },
      steeringSetups: ["LHD", "RHD"],
      powertrainTypes: ["BEV"],
      inventoryStatuses: ["Production 30 days"],
      voltagePlatforms: ["800V"],
      v2lAvailability: ["Yes"],
      drivetrains: ["AWD", "4WD"],
      groundClearanceMm: { min: 205, max: 205 },
    },
  );
});

test("uses segment only as a vehicle-class fallback and preserves unknowns", () => {
  assert.deepEqual(buildProductFilterData({ segment: "Cargo Van" }), {
    vehicleClasses: ["Cargo Van"],
    batteryChemistries: [],
    rangeKm: null,
    priceUsd: null,
    steeringSetups: [],
    powertrainTypes: [],
    inventoryStatuses: [],
    voltagePlatforms: [],
    v2lAvailability: [],
    drivetrains: [],
    groundClearanceMm: null,
  });
});

test("normalizes reversed numeric bounds without inventing zero values", () => {
  const data = buildProductFilterData({
    cltc_range_min_km_auto: 600,
    cltc_range_max_km_auto: 500,
    guide_price_min_usd_auto: "not available",
    guide_price_max_usd_auto: 20000,
  });

  assert.deepEqual(data.rangeKm, { min: 500, max: 600 });
  assert.deepEqual(data.priceUsd, { min: 20000, max: 20000 });
});
