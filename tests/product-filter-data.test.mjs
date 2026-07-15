import assert from "node:assert/strict";
import test from "node:test";

import { buildProductFilterData } from "../worker/productFilters.ts";

test("maps existing Feishu fields into structured product filter data", () => {
  assert.deepEqual(
    buildProductFilterData({
      "Vehicle Class": ["Premium SUV"],
      Segment: "Ignored fallback",
      "Battery Chemistry Auto": "LFP/NCM + Semi-solid-state",
      "CLTC Range Min KM Auto": "480",
      "CLTC Range Max KM Auto": 720,
      "Guide Price Min USD Auto": "34900",
      "Guide Price Max USD Auto": 65100,
      "Steering Setup": ["LHD", "RHD"],
      "Powertrain Type": "BEV",
      "Inventory Status": "Production 30 days",
      "Voltage Platform (V)": 800,
      "V2L Availability": "Yes",
      "Drivetrain Display Auto": "AWD / 4WD",
      "Ground Clearance (mm)": "205",
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

test("uses Segment only as a vehicle-class fallback and preserves unknowns", () => {
  assert.deepEqual(buildProductFilterData({ Segment: "Cargo Van" }), {
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
    "CLTC Range Min KM Auto": 600,
    "CLTC Range Max KM Auto": 500,
    "Guide Price Min USD Auto": "not available",
    "Guide Price Max USD Auto": 20000,
  });

  assert.deepEqual(data.rangeKm, { min: 500, max: 600 });
  assert.deepEqual(data.priceUsd, { min: 20000, max: 20000 });
});
