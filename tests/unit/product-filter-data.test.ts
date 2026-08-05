import { describe, expect, test } from "bun:test";
import { buildProductFilterData } from "../../server/api/productFilters";

describe("Unit: Product Filter Data Transformer", () => {
  test("maps new Base snake_case fields into structured product filter data", () => {
    expect(
      buildProductFilterData({
        vehicle_class: ["Premium SUV"],
        segment: "Ignored fallback",
        battery_chemistry_auto: "LFP/NCM + Semi-solid-state",
        cltc_range_min_km_auto: "480",
        cltc_range_max_km_auto: 720,
        guide_price_min_usd_auto: "34900",
        guide_price_max_usd_auto: 65100,
        display_price_low: 42000,
        display_price_high: 58000,
        steering_setup: ["LHD", "RHD"],
        powertrain_type: "BEV",
        inventory_status: "Production 30 days",
        voltage_platform_v: 800,
        v2l_availability: "Yes",
        drivetrain_display_auto: "AWD / 4WD",
        ground_clearance_mm: "205",
      })
    ).toEqual({
      vehicleClasses: ["Premium SUV"],
      batteryChemistries: ["LFP", "NCM", "Semi-solid-state"],
      rangeKm: { min: 480, max: 720 },
      priceUsd: { min: 42000, max: 58000 },
      steeringSetups: ["LHD", "RHD"],
      powertrainTypes: ["BEV"],
      inventoryStatuses: ["Production 30 days"],
      voltagePlatforms: ["800V"],
      v2lAvailability: ["Yes"],
      drivetrains: ["AWD", "4WD"],
      groundClearanceMm: { min: 205, max: 205 },
    });
  });

  test("uses segment only as a vehicle-class fallback and preserves unknowns", () => {
    expect(buildProductFilterData({ segment: "Cargo Van" })).toEqual({
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

    expect(data.rangeKm).toEqual({ min: 500, max: 600 });
    expect(data.priceUsd).toEqual({ min: 20000, max: 20000 });
  });
});
