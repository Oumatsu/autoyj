import { relations, sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const vehicleModels = sqliteTable(
  "vehicle_models",
  {
    id: text("id").primaryKey(),
    modelId: text("model_id"),
    brand: text("brand"),
    model: text("model"),
    status: text("status"),
    powertrainType: text("powertrain_type"),
    segment: text("segment"),
    vehicleClass: text("vehicle_class"),
    displayPriceLow: real("display_price_low"),
    displayPriceHigh: real("display_price_high"),
    imageUrl: text("image_url"),
    heroDescription: text("hero_description"),
    pageTitle: text("page_title"),
    pageSubtitle: text("page_subtitle"),
    productPath: text("product_path"),
    cltcRangeMinKm: integer("cltc_range_min_km"),
    cltcRangeMaxKm: integer("cltc_range_max_km"),
    batteryCapacityMinKwh: real("battery_capacity_min_kwh"),
    batteryCapacityMaxKwh: real("battery_capacity_max_kwh"),
    motorPowerMinKw: real("motor_power_min_kw"),
    motorPowerMaxKw: real("motor_power_max_kw"),
    topSpeedMinKmh: integer("top_speed_min_kmh"),
    topSpeedMaxKmh: integer("top_speed_max_kmh"),
    zeroTo100Sec: real("zero_to_100_sec"),
    wheelbaseMm: integer("wheelbase_mm"),
    lengthMm: integer("length_mm"),
    widthMm: integer("width_mm"),
    heightMm: integer("height_mm"),
    seatsMin: integer("seats_min"),
    seatsMax: integer("seats_max"),
    voltagePlatformV: real("voltage_platform_v"),
    groundClearanceMm: integer("ground_clearance_mm"),
    bootVolumeL: integer("boot_volume_l"),
    drivetrainDisplay: text("drivetrain_display"),
    batteryChemistry: text("battery_chemistry"),
    batteryTechnology: text("battery_technology"),
    steeringSetup: text("steering_setup"),
    sunroofAvailability: text("sunroof_availability"),
    v2lAvailability: text("v2l_availability"),
    v2lOutputPowerKw: real("v2l_output_power_kw"),
    acSlowChargeSupported: integer("ac_slow_charge_supported"),
    acSlowChargeFullTimeHours: real("ac_slow_charge_full_time_hours"),
    batteryWarrantyYears: integer("battery_warranty_years"),
    batteryWarrantyDistanceKm: integer("battery_warranty_distance_km"),
    galleryImagesJson: text("gallery_images_json"),
    commonFeaturesJson: text("common_features_json"),
    i18nTranslations: text("i18n_translations"),
    inventoryStatus: text("inventory_status"),
    version: text("version"),
    airbags: integer("airbags"),
    charging: text("charging"),
    householdCharging: text("household_charging"),
    modelYear: integer("model_year"),
    brochureCover: text("brochure_cover"),
    whySectionDescription: text("why_section_description"),
    guidePriceMinUsdAuto: real("guide_price_min_usd_auto"),
    guidePriceMaxUsdAuto: real("guide_price_max_usd_auto"),
    syncedAt: text("synced_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_vehicle_models_brand").on(table.brand),
    index("idx_vehicle_models_status").on(table.status),
  ]
);

export const vehicleTrims = sqliteTable(
  "vehicle_trims",
  {
    id: text("id").primaryKey(),
    trimConfigId: text("trim_config_id"),
    modelId: text("model_id").notNull(),
    parentModelRecordId: text("parent_model_record_id"),
    trimName: text("trim_name"),
    status: text("status"),
    displayPriceLow: real("display_price_low"),
    displayPriceHigh: real("display_price_high"),
    trimPriceRmb: real("trim_price_rmb"),
    powertrainType: text("powertrain_type"),
    cltcRangeKm: integer("cltc_range_km"),
    batteryCapacityKwh: real("battery_capacity_kwh"),
    motorPowerKw: real("motor_power_kw"),
    topSpeedKmh: integer("top_speed_kmh"),
    zeroTo100Sec: real("zero_to_100_sec"),
    batteryChemistry: text("battery_chemistry"),
    dcFastChargeSupported: integer("dc_fast_charge_supported"),
    dcFastChargeTimeHours: real("dc_fast_charge_time_hours"),
    dcFastChargeMinPercent: real("dc_fast_charge_min_percent"),
    dcFastChargeMaxPercent: real("dc_fast_charge_max_percent"),
    motorTorqueNM: real("motor_torque_n_m"),
    drivetrainDisplay: text("drivetrain_display"),
    trimOrder: integer("trim_order"),
    recommended: integer("recommended"),
    addedFeaturesJson: text("added_features_json"),
    upgradedFeaturesJson: text("upgraded_features_json"),
    baseSpecSummaryJson: text("base_spec_summary_json"),
    specsJson: text("specs_json"),
    syncedAt: text("synced_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_vehicle_trims_model_id").on(table.modelId),
  ]
);

export const vehicles = sqliteTable(
  "vehicles",
  {
    id: text("id").primaryKey(),
    vehicleId: text("vehicle_id"),
    modelId: text("model_id"),
    brand: text("brand"),
    model: text("model"),
    variant: text("variant"),
    stage: text("stage"),
    steering: text("steering"),
    location: text("location"),
    supplier: text("supplier"),
    displayPriceLow: real("display_price_low"),
    displayPriceHigh: real("display_price_high"),
    currency: text("currency").default("USD"),
    minOrderQuantity: integer("min_order_quantity"),
    inventoryCount: integer("inventory_count"),
    waitDays: integer("wait_days"),
    powertrainType: text("powertrain_type"),
    color: text("color"),
    colorCode: text("color_code"),
    imageUrl: text("image_url"),
    galleryImagesJson: text("gallery_images_json"),
    specsJson: text("specs_json"),
    aiConfidenceScore: real("ai_confidence_score"),
    exwUsd: real("exw_usd"),
    fcaUsd: real("fca_usd"),
    fobUsd: real("fob_usd"),
    guidePriceCny: real("guide_price_cny"),
    productionYear: integer("production_year"),
    productionMonth: integer("production_month"),
    exteriorColor: text("exterior_color"),
    interiorColor: text("interior_color"),
    syncedAt: text("synced_at").notNull().default(sql`(datetime('now'))`),
  },
  (table) => [
    index("idx_vehicles_model_id").on(table.modelId),
  ]
);

export const vehicleModelsRelations = relations(vehicleModels, ({ many }) => ({
  trims: many(vehicleTrims),
  vehicles: many(vehicles),
}));

export const vehicleTrimsRelations = relations(vehicleTrims, ({ one }) => ({
  model: one(vehicleModels, {
    fields: [vehicleTrims.modelId],
    references: [vehicleModels.modelId],
  }),
}));

export const vehiclesRelations = relations(vehicles, ({ one }) => ({
  model: one(vehicleModels, {
    fields: [vehicles.modelId],
    references: [vehicleModels.modelId],
  }),
}));

export type VehicleModelRow = typeof vehicleModels.$inferSelect;
export type InsertVehicleModelRow = typeof vehicleModels.$inferInsert;
export type VehicleTrimRow = typeof vehicleTrims.$inferSelect;
export type InsertVehicleTrimRow = typeof vehicleTrims.$inferInsert;
export type VehicleRow = typeof vehicles.$inferSelect;
export type InsertVehicleRow = typeof vehicles.$inferInsert;
