-- D1 Schema for autoyj-portal
-- Run: bunx wrangler d1 execute autoyj-portal --remote --file=server/db/schema.sql

CREATE TABLE IF NOT EXISTS vehicle_models (
  id TEXT PRIMARY KEY,
  model_id TEXT,
  brand TEXT,
  model TEXT,
  status TEXT,
  powertrain_type TEXT,
  segment TEXT,
  vehicle_class TEXT,
  display_price_low REAL,
  display_price_high REAL,
  image_url TEXT,
  hero_description TEXT,
  page_title TEXT,
  page_subtitle TEXT,
  product_path TEXT,
  cltc_range_min_km INTEGER,
  cltc_range_max_km INTEGER,
  battery_capacity_min_kwh REAL,
  battery_capacity_max_kwh REAL,
  motor_power_min_kw REAL,
  motor_power_max_kw REAL,
  top_speed_min_kmh INTEGER,
  top_speed_max_kmh INTEGER,
  zero_to_100_sec REAL,
  wheelbase_mm INTEGER,
  length_mm INTEGER,
  width_mm INTEGER,
  height_mm INTEGER,
  seats_min INTEGER,
  seats_max INTEGER,
  voltage_platform_v REAL,
  ground_clearance_mm INTEGER,
  boot_volume_l INTEGER,
  drivetrain_display TEXT,
  battery_chemistry TEXT,
  battery_technology TEXT,
  steering_setup TEXT,
  sunroof_availability TEXT,
  v2l_availability TEXT,
  v2l_output_power_kw REAL,
  ac_slow_charge_supported INTEGER,
  ac_slow_charge_full_time_hours REAL,
  battery_warranty_years INTEGER,
  battery_warranty_distance_km INTEGER,
  gallery_images_json TEXT,
  common_features_json TEXT,
  i18n_translations TEXT,
  inventory_status TEXT,
  version TEXT,
  airbags INTEGER,
  charging TEXT,
  household_charging TEXT,
  model_year INTEGER,
  brochure_cover TEXT,
  why_section_description TEXT,
  guide_price_min_usd_auto REAL,
  guide_price_max_usd_auto REAL,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicle_trims (
  id TEXT PRIMARY KEY,
  trim_config_id TEXT,
  model_id TEXT NOT NULL,
  parent_model_record_id TEXT,
  trim_name TEXT,
  status TEXT,
  display_price_low REAL,
  display_price_high REAL,
  powertrain_type TEXT,
  cltc_range_km INTEGER,
  battery_capacity_kwh REAL,
  motor_power_kw REAL,
  top_speed_kmh INTEGER,
  zero_to_100_sec REAL,
  battery_chemistry TEXT,
  dc_fast_charge_supported INTEGER,
  dc_fast_charge_time_hours REAL,
  dc_fast_charge_min_percent REAL,
  dc_fast_charge_max_percent REAL,
  motor_torque_n_m REAL,
  drivetrain_display TEXT,
  trim_order INTEGER,
  recommended INTEGER,
  added_features_json TEXT,
  upgraded_features_json TEXT,
  base_spec_summary_json TEXT,
  specs_json TEXT,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  vehicle_id TEXT,
  model_id TEXT,
  brand TEXT,
  model TEXT,
  variant TEXT,
  stage TEXT,
  steering TEXT,
  location TEXT,
  supplier TEXT,
  display_price_low REAL,
  display_price_high REAL,
  currency TEXT DEFAULT 'USD',
  min_order_quantity INTEGER,
  inventory_count INTEGER,
  wait_days INTEGER,
  powertrain_type TEXT,
  color TEXT,
  color_code TEXT,
  image_url TEXT,
  gallery_images_json TEXT,
  specs_json TEXT,
  ai_confidence_score REAL,
  exw_usd REAL,
  fca_usd REAL,
  fob_usd REAL,
  guide_price_cny REAL,
  production_year INTEGER,
  production_month INTEGER,
  exterior_color TEXT,
  interior_color TEXT,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_vehicle_models_brand ON vehicle_models(brand);
CREATE INDEX IF NOT EXISTS idx_vehicle_models_status ON vehicle_models(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_trims_model_id ON vehicle_trims(model_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_model_id ON vehicles(model_id);

-- Inquiry management is transactional portal data. D1 is its system of record.
CREATE TABLE IF NOT EXISTS inquiries (
  id TEXT PRIMARY KEY,
  inquiry_no TEXT NOT NULL UNIQUE,
  customer_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  vehicle_model TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  destination_port TEXT,
  trade_term TEXT NOT NULL,
  target_price REAL,
  initial_note TEXT,
  status TEXT NOT NULL DEFAULT 'New Inquiry',
  source TEXT NOT NULL DEFAULT 'Customer Portal',
  deleted_at TEXT,
  deleted_by_user_id TEXT,
  deleted_by_name TEXT,
  deletion_reason TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiry_participants (
  id TEXT PRIMARY KEY,
  inquiry_no TEXT NOT NULL REFERENCES inquiries(inquiry_no),
  customer_id TEXT,
  user_id TEXT NOT NULL,
  company TEXT,
  role TEXT NOT NULL,
  access_source TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiry_notes (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL UNIQUE,
  inquiry_no TEXT NOT NULL REFERENCES inquiries(inquiry_no),
  parent_note_id TEXT,
  author_user_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  body TEXT NOT NULL,
  deleted_at TEXT,
  deleted_by_user_id TEXT,
  deleted_by_name TEXT,
  deletion_reason TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inquiry_status_history (
  id TEXT PRIMARY KEY,
  history_id TEXT NOT NULL UNIQUE,
  inquiry_no TEXT NOT NULL REFERENCES inquiries(inquiry_no),
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiries_customer_updated ON inquiries(customer_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiry_participants_user ON inquiry_participants(user_id, inquiry_no);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_inquiry_created ON inquiry_notes(inquiry_no, created_at);
CREATE INDEX IF NOT EXISTS idx_inquiry_status_history_inquiry_created ON inquiry_status_history(inquiry_no, created_at);
CREATE INDEX IF NOT EXISTS idx_inquiries_deleted_at ON inquiries(deleted_at);
CREATE INDEX IF NOT EXISTS idx_inquiry_notes_deleted_at ON inquiry_notes(deleted_at);

-- Better Auth Standard Tables for Cloudflare D1
CREATE TABLE IF NOT EXISTS user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER NOT NULL DEFAULT 0,
  image TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL,
  user_id TEXT,
  customer_id TEXT,
  company TEXT,
  account_type TEXT DEFAULT 'external',
  role TEXT DEFAULT 'customer',
  price_tier TEXT DEFAULT 'vip',
  status TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS session (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expiresAt INTEGER NOT NULL,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS account (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  accessTokenExpiresAt INTEGER,
  refreshTokenExpiresAt INTEGER,
  scope TEXT,
  password TEXT,
  createdAt INTEGER NOT NULL,
  updatedAt INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt INTEGER NOT NULL,
  createdAt INTEGER,
  updatedAt INTEGER
);

CREATE INDEX IF NOT EXISTS idx_user_email ON user(email);
CREATE INDEX IF NOT EXISTS idx_session_userId ON session(userId);
CREATE INDEX IF NOT EXISTS idx_account_userId ON account(userId);

-- 1. Articles / Insights Table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  date TEXT,
  read_time TEXT,
  cover_image TEXT,
  overview TEXT,
  content TEXT,
  status TEXT DEFAULT 'Published',
  sort_order INTEGER DEFAULT 0,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Academy Lessons Table
CREATE TABLE IF NOT EXISTS academy_lessons (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT,
  tag TEXT,
  description TEXT,
  level TEXT,
  duration TEXT,
  date TEXT,
  content TEXT,
  sort_order INTEGER DEFAULT 0,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Academy Vault Resources Table
CREATE TABLE IF NOT EXISTS academy_vault (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  description TEXT,
  file_size TEXT,
  format TEXT,
  download_url TEXT,
  category TEXT,
  sort_order INTEGER DEFAULT 0,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Quotes Table
CREATE TABLE IF NOT EXISTS quotes (
  id TEXT PRIMARY KEY,
  quote_no TEXT UNIQUE NOT NULL,
  inquiry_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  price REAL NOT NULL,
  status TEXT DEFAULT 'Active',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 5. Negotiations Table
CREATE TABLE IF NOT EXISTS negotiations (
  id TEXT PRIMARY KEY,
  inquiry_no TEXT NOT NULL,
  quote_no TEXT,
  actor_user_id TEXT NOT NULL,
  actor_name TEXT,
  actor_role TEXT,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_no TEXT UNIQUE NOT NULL,
  inquiry_no TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  status TEXT DEFAULT 'Pending',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_slug ON academy_lessons(slug);


