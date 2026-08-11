-- Migration 0005: drop i18n_strings table
--
-- Translations previously synced from Feishu into this table are now managed
-- exclusively as local static files in i18n/translations/{zh,en,am}.ts,
-- pushed/pulled via `bun run tolgee:push` / `bun run tolgee:pull`.
-- The /api/portal/public/i18n route and syncI18nToD1 cron step have been removed.

DROP INDEX IF EXISTS idx_i18n_strings_module;
DROP TABLE IF EXISTS i18n_strings;
