/**
 * D1 database read/write helpers for portal data.
 * Powered by Drizzle ORM (Type-safe D1 layer)
 */

export * from "./client";

export interface D1Env {
  PORTAL_DB: D1Database;
}

// ---------------------------------------------------------------------------
// Types for D1 rows
// ---------------------------------------------------------------------------

export interface D1VehicleModel {
  id: string;
  model_id: string | null;
  brand: string | null;
  model: string | null;
  status: string | null;
  powertrain_type: string | null;
  segment: string | null;
  vehicle_class: string | null;
  display_price_low: number | null;
  display_price_high: number | null;
  image_url: string | null;
  hero_description: string | null;
  page_title: string | null;
  page_subtitle: string | null;
  product_path: string | null;
  cltc_range_min_km: number | null;
  cltc_range_max_km: number | null;
  battery_capacity_min_kwh: number | null;
  battery_capacity_max_kwh: number | null;
  motor_power_min_kw: number | null;
  motor_power_max_kw: number | null;
  top_speed_min_kmh: number | null;
  top_speed_max_kmh: number | null;
  zero_to_100_sec: number | null;
  wheelbase_mm: number | null;
  length_mm: number | null;
  width_mm: number | null;
  height_mm: number | null;
  seats_min: number | null;
  seats_max: number | null;
  voltage_platform_v: number | null;
  ground_clearance_mm: number | null;
  boot_volume_l: number | null;
  drivetrain_display: string | null;
  battery_chemistry: string | null;
  battery_technology: string | null;
  steering_setup: string | null;
  sunroof_availability: string | null;
  v2l_availability: string | null;
  v2l_output_power_kw: number | null;
  ac_slow_charge_supported: number | null;
  ac_slow_charge_full_time_hours: number | null;
  battery_warranty_years: number | null;
  battery_warranty_distance_km: number | null;
  gallery_images_json: string | null;
  common_features_json: string | null;
  i18n_translations: string | null;
  inventory_status: string | null;
  version: string | null;
  synced_at: string;
  airbags?: number | null;
  charging?: string | null;
  household_charging?: string | null;
  model_year?: number | null;
  brochure_cover?: string | null;
  why_section_description?: string | null;
  guide_price_min_usd_auto?: number | null;
  guide_price_max_usd_auto?: number | null;
}

export interface D1VehicleTrim {
  id: string;
  model_id: string;
  parent_model_record_id: string | null;
  trim_name: string | null;
  status: string | null;
  display_price_low: number | null;
  display_price_high: number | null;
  trim_price_rmb?: number | null;
  powertrain_type: string | null;
  cltc_range_km: number | null;
  battery_capacity_kwh: number | null;
  motor_power_kw: number | null;
  top_speed_kmh: number | null;
  zero_to_100_sec: number | null;
  specs_json: string | null;
  synced_at: string;
  trim_config_id?: string | null;
  battery_chemistry?: string | null;
  dc_fast_charge_supported?: number | null;
  dc_fast_charge_time_hours?: number | null;
  dc_fast_charge_min_percent?: number | null;
  dc_fast_charge_max_percent?: number | null;
  motor_torque_n_m?: number | null;
  drivetrain_display?: string | null;
  trim_order?: number | null;
  recommended?: number | null;
  added_features_json?: string | null;
  upgraded_features_json?: string | null;
  base_spec_summary_json?: string | null;
}

export interface D1Vehicle {
  id: string;
  vehicle_id: string | null;
  model_id: string | null;
  brand: string | null;
  model: string | null;
  variant: string | null;
  stage: string | null;
  steering: string | null;
  location: string | null;
  supplier: string | null;
  display_price_low: number | null;
  display_price_high: number | null;
  exw_usd: number | null;
  fca_usd: number | null;
  fob_usd: number | null;
  guide_price_cny: number | null;
  currency: string | null;
  min_order_quantity: number | null;
  inventory_count: number | null;
  wait_days: number | null;
  powertrain_type: string | null;
  color: string | null;
  color_code: string | null;
  image_url: string | null;
  gallery_images_json: string | null;
  specs_json: string | null;
  ai_confidence_score: number | null;
  synced_at: string;
}

// ---------------------------------------------------------------------------
// Write helpers (used by Cron Job)
// ---------------------------------------------------------------------------

/** Upsert vehicle_models rows in batches of 50 */
export async function upsertVehicleModels(db: D1Database, rows: D1VehicleModel[]): Promise<void> {
  const now = new Date().toISOString();
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const stmts = batch.map((r) =>
      db.prepare(`
        INSERT INTO vehicle_models (
          id, model_id, brand, model, status, powertrain_type, segment, vehicle_class,
          display_price_low, display_price_high, image_url, hero_description, page_title,
          page_subtitle, product_path, cltc_range_min_km, cltc_range_max_km,
          battery_capacity_min_kwh, battery_capacity_max_kwh, motor_power_min_kw,
          motor_power_max_kw, top_speed_min_kmh, top_speed_max_kmh, zero_to_100_sec,
          wheelbase_mm, length_mm, width_mm, height_mm, seats_min, seats_max,
          voltage_platform_v, ground_clearance_mm, boot_volume_l, drivetrain_display,
          battery_chemistry, battery_technology, steering_setup, sunroof_availability,
          v2l_availability, v2l_output_power_kw, ac_slow_charge_supported,
          ac_slow_charge_full_time_hours, battery_warranty_years, battery_warranty_distance_km,
          gallery_images_json, common_features_json, i18n_translations, inventory_status,
          version, synced_at
        ) VALUES (
          ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?
        )
        ON CONFLICT(id) DO UPDATE SET
          model_id=excluded.model_id, brand=excluded.brand, model=excluded.model,
          status=excluded.status, powertrain_type=excluded.powertrain_type,
          segment=excluded.segment, vehicle_class=excluded.vehicle_class,
          display_price_low=excluded.display_price_low, display_price_high=excluded.display_price_high,
          image_url=excluded.image_url, hero_description=excluded.hero_description,
          page_title=excluded.page_title, page_subtitle=excluded.page_subtitle,
          product_path=excluded.product_path, cltc_range_min_km=excluded.cltc_range_min_km,
          cltc_range_max_km=excluded.cltc_range_max_km, battery_capacity_min_kwh=excluded.battery_capacity_min_kwh,
          battery_capacity_max_kwh=excluded.battery_capacity_max_kwh, motor_power_min_kw=excluded.motor_power_min_kw,
          motor_power_max_kw=excluded.motor_power_max_kw, top_speed_min_kmh=excluded.top_speed_min_kmh,
          top_speed_max_kmh=excluded.top_speed_max_kmh, zero_to_100_sec=excluded.zero_to_100_sec,
          wheelbase_mm=excluded.wheelbase_mm, length_mm=excluded.length_mm,
          width_mm=excluded.width_mm, height_mm=excluded.height_mm,
          seats_min=excluded.seats_min, seats_max=excluded.seats_max,
          voltage_platform_v=excluded.voltage_platform_v, ground_clearance_mm=excluded.ground_clearance_mm,
          boot_volume_l=excluded.boot_volume_l, drivetrain_display=excluded.drivetrain_display,
          battery_chemistry=excluded.battery_chemistry, battery_technology=excluded.battery_technology,
          steering_setup=excluded.steering_setup, sunroof_availability=excluded.sunroof_availability,
          v2l_availability=excluded.v2l_availability, v2l_output_power_kw=excluded.v2l_output_power_kw,
          ac_slow_charge_supported=excluded.ac_slow_charge_supported,
          ac_slow_charge_full_time_hours=excluded.ac_slow_charge_full_time_hours,
          battery_warranty_years=excluded.battery_warranty_years,
          battery_warranty_distance_km=excluded.battery_warranty_distance_km,
          gallery_images_json=excluded.gallery_images_json, common_features_json=excluded.common_features_json,
          i18n_translations=excluded.i18n_translations, inventory_status=excluded.inventory_status,
          version=excluded.version, synced_at=excluded.synced_at
      `).bind(
        r.id, r.model_id, r.brand, r.model, r.status, r.powertrain_type, r.segment, r.vehicle_class,
        r.display_price_low, r.display_price_high, r.image_url, r.hero_description, r.page_title,
        r.page_subtitle, r.product_path, r.cltc_range_min_km, r.cltc_range_max_km,
        r.battery_capacity_min_kwh, r.battery_capacity_max_kwh, r.motor_power_min_kw,
        r.motor_power_max_kw, r.top_speed_min_kmh, r.top_speed_max_kmh, r.zero_to_100_sec,
        r.wheelbase_mm, r.length_mm, r.width_mm, r.height_mm, r.seats_min, r.seats_max,
        r.voltage_platform_v, r.ground_clearance_mm, r.boot_volume_l, r.drivetrain_display,
        r.battery_chemistry, r.battery_technology, r.steering_setup, r.sunroof_availability,
        r.v2l_availability, r.v2l_output_power_kw, r.ac_slow_charge_supported,
        r.ac_slow_charge_full_time_hours, r.battery_warranty_years, r.battery_warranty_distance_km,
        r.gallery_images_json, r.common_features_json, r.i18n_translations, r.inventory_status,
        r.version, now,
      )
    );
    await db.batch(stmts);
  }
}

/** Upsert vehicle_trims rows in batches of 50 */
export async function upsertVehicleTrims(db: D1Database, rows: D1VehicleTrim[]): Promise<void> {
  const now = new Date().toISOString();
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const stmts = batch.map((r) =>
      db.prepare(`
        INSERT INTO vehicle_trims (
          id, model_id, parent_model_record_id, trim_name, status,
          display_price_low, display_price_high, powertrain_type,
          cltc_range_km, battery_capacity_kwh, motor_power_kw,
          top_speed_kmh, zero_to_100_sec, specs_json, synced_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET
          model_id=excluded.model_id, trim_name=excluded.trim_name,
          status=excluded.status, display_price_low=excluded.display_price_low,
          display_price_high=excluded.display_price_high, powertrain_type=excluded.powertrain_type,
          cltc_range_km=excluded.cltc_range_km, battery_capacity_kwh=excluded.battery_capacity_kwh,
          motor_power_kw=excluded.motor_power_kw, top_speed_kmh=excluded.top_speed_kmh,
          zero_to_100_sec=excluded.zero_to_100_sec, specs_json=excluded.specs_json,
          synced_at=excluded.synced_at
      `).bind(
        r.id, r.model_id, r.parent_model_record_id, r.trim_name, r.status,
        r.display_price_low, r.display_price_high, r.powertrain_type,
        r.cltc_range_km, r.battery_capacity_kwh, r.motor_power_kw,
        r.top_speed_kmh, r.zero_to_100_sec, r.specs_json, now,
      )
    );
    await db.batch(stmts);
  }
}

/** Upsert vehicles rows in batches of 50 */
export async function upsertVehicles(db: D1Database, rows: D1Vehicle[]): Promise<void> {
  const now = new Date().toISOString();
  const BATCH = 50;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const stmts = batch.map((r) =>
      db.prepare(`
        INSERT INTO vehicles (
          id, vehicle_id, model_id, brand, model, variant, stage, steering,
          location, supplier, display_price_low, display_price_high, currency,
          exw_usd, fca_usd, fob_usd, guide_price_cny,
          min_order_quantity, inventory_count, wait_days, powertrain_type, color, color_code,
          image_url, gallery_images_json, specs_json, ai_confidence_score, synced_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
        ON CONFLICT(id) DO UPDATE SET
          vehicle_id=excluded.vehicle_id, model_id=excluded.model_id,
          brand=excluded.brand, model=excluded.model, variant=excluded.variant,
          stage=excluded.stage, steering=excluded.steering, location=excluded.location,
          supplier=excluded.supplier, display_price_low=excluded.display_price_low,
          display_price_high=excluded.display_price_high, currency=excluded.currency,
          exw_usd=excluded.exw_usd, fca_usd=excluded.fca_usd, fob_usd=excluded.fob_usd,
          guide_price_cny=excluded.guide_price_cny,
          min_order_quantity=excluded.min_order_quantity, inventory_count=excluded.inventory_count,
          wait_days=excluded.wait_days, powertrain_type=excluded.powertrain_type, color=excluded.color,
          color_code=excluded.color_code, image_url=excluded.image_url,
          gallery_images_json=excluded.gallery_images_json, specs_json=excluded.specs_json,
          ai_confidence_score=excluded.ai_confidence_score, synced_at=excluded.synced_at
      `).bind(
        r.id, r.vehicle_id, r.model_id, r.brand, r.model, r.variant, r.stage, r.steering,
        r.location, r.supplier, r.display_price_low, r.display_price_high, r.currency,
        r.exw_usd, r.fca_usd, r.fob_usd, r.guide_price_cny,
        r.min_order_quantity, r.inventory_count, r.wait_days, r.powertrain_type, r.color, r.color_code,
        r.image_url, r.gallery_images_json, r.specs_json, r.ai_confidence_score, now,
      )
    );
    await db.batch(stmts);
  }
}

// ---------------------------------------------------------------------------
// Read helpers (used by API handlers)
// ---------------------------------------------------------------------------

/** Helper to execute D1 queries with a single automatic retry on transient network drops */
async function withD1Retry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.warn("D1 query failed, retrying once...", error);
    return await fn();
  }
}

export async function queryVehicleModels(db: D1Database): Promise<D1VehicleModel[]> {
  return withD1Retry(async () => {
    const result = await db.prepare(
      `SELECT * FROM vehicle_models WHERE status IS NULL OR status NOT IN ('archived','draft','disabled','下架','停售') ORDER BY brand`
    ).all<D1VehicleModel>();
    return result.results;
  });
}

export async function queryVehicleTrims(db: D1Database, modelId?: string): Promise<D1VehicleTrim[]> {
  return withD1Retry(async () => {
    if (modelId) {
      const result = await db.prepare(
        `SELECT * FROM vehicle_trims WHERE model_id = ?`
      ).bind(modelId).all<D1VehicleTrim>();
      return result.results;
    }
    const result = await db.prepare(`SELECT * FROM vehicle_trims`).all<D1VehicleTrim>();
    return result.results;
  });
}

export async function queryVehicles(db: D1Database): Promise<D1Vehicle[]> {
  return withD1Retry(async () => {
    const result = await db.prepare(`SELECT * FROM vehicles WHERE stage = 'connected'`).all<D1Vehicle>();
    return result.results;
  });
}

// ---------------------------------------------------------------------------
// Better Auth User Sync Helpers
// ---------------------------------------------------------------------------

export interface D1AuthUserRecord {
  id: string;
  name: string;
  email: string;
  emailVerified?: number;
  image?: string | null;
  createdAt: number;
  updatedAt: number;
  user_id?: string;
  customer_id?: string;
  company?: string;
  account_type?: string;
  role?: string;
  status?: string;
  accessCode?: string;
}

export async function upsertUsersToD1(db: D1Database, users: D1AuthUserRecord[]): Promise<void> {
  if (!users.length) return;
  const now = Date.now();

  const userStmts = users.map((u) =>
    db.prepare(`
      INSERT INTO user (
        id, name, email, emailVerified, image, createdAt, updatedAt,
        user_id, customer_id, company, account_type, role, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        email = excluded.email,
        updatedAt = excluded.updatedAt,
        user_id = excluded.user_id,
        customer_id = excluded.customer_id,
        company = excluded.company,
        account_type = excluded.account_type,
        role = excluded.role,
        status = excluded.status;
    `).bind(
      u.id,
      u.name,
      u.email.toLowerCase(),
      u.emailVerified ?? 1,
      u.image ?? null,
      u.createdAt || now,
      now,
      u.user_id ?? u.id,
      u.customer_id ?? u.id,
      u.company ?? "Youguard",
      u.account_type ?? "external",
      u.role ?? "customer",
      u.status ?? "Active"
    )
  );

  const accountStmts = users
    .filter((u) => Boolean(u.accessCode))
    .map((u) =>
      db.prepare(`
        INSERT INTO account (
          id, userId, accountId, providerId, password, createdAt, updatedAt
        ) VALUES (?, ?, ?, 'credential', ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          password = excluded.password,
          updatedAt = excluded.updatedAt;
      `).bind(
        `acc_${u.id}`,
        u.id,
        u.email.toLowerCase(),
        u.accessCode,
        now,
        now
      )
    );

  await db.batch([...userStmts, ...accountStmts]);
}
