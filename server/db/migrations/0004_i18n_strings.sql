-- Migration 0004: i18n_strings table
-- Stores translations synced from Feishu i18n table (tblv6UYxgYKSd8y5).
-- key is the dot-separated translation key (e.g. "nav.vehicles").
-- Cron job writes here; /api/portal/public/i18n reads from here.

CREATE TABLE IF NOT EXISTS i18n_strings (
  key TEXT PRIMARY KEY,
  zh  TEXT,
  en  TEXT,
  am  TEXT,
  module TEXT,
  synced_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_i18n_strings_module ON i18n_strings(module);
