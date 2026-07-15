# Product Catalog Dynamic Translations Design

## Goal

Translate every user-visible dynamic value on the three product category pages while keeping Feishu Vehicle Models data as the filtering source of truth. Chinese model names must use verified official names. Amharic values may remain in English when no reliable translation or established transliteration exists.

## Scope

The translation coverage includes:

- all current vehicle display names;
- all current vehicle-card highlight descriptions sourced from the Vehicle Models `Charging` field;
- all categorical filter values generated from live Vehicle Models data, including vehicle class, battery chemistry, steering setup, powertrain type, inventory status, voltage platform, V2L availability, and drivetrain;
- the mislabeled card field heading currently rendered as `Steering Configuration`.

Numeric range and price filters already use stable translation keys and remain unchanged.

## Translation Records

Add one `I18n Locale` record per independently maintained value.

Vehicle-specific records use the stable product slug so duplicate model names do not collide:

- `catalog.models.<slug>.displayName`
- `catalog.models.<slug>.cardHighlight`

Filter records use a normalized stable identifier under the source field:

- `catalog.filters.vehicleClass.<value-id>`
- `catalog.filters.batteryChemistry.<value-id>`
- `catalog.filters.steeringSetup.<value-id>`
- `catalog.filters.powertrainType.<value-id>`
- `catalog.filters.inventoryStatus.<value-id>`
- `catalog.filters.voltagePlatform.<value-id>`
- `catalog.filters.v2lAvailability.<value-id>`
- `catalog.filters.drivetrain.<value-id>`

Each record stores `ZH`, `EN`, and `AM`. English preserves the source display value. Chinese uses the official Chinese model name where one exists; it must not infer a name from an English brand family. For example, Geely Geome is `吉利星愿`, not a Geometry-derived name. Amharic retains English whenever a reliable translation or established transliteration cannot be verified.

## Frontend Behavior

The API payload remains unchanged and continues to expose the raw Vehicle Models values. Filtering, active-filter IDs, search source data, and interval intersection logic continue to use those raw values.

The category pages translate only presentation labels:

1. A product card resolves `catalog.models.<slug>.displayName`, falling back to the API `fullName` or brand and model.
2. Its long description resolves `catalog.models.<slug>.cardHighlight`, falling back to the API `charging` value.
3. A categorical filter option derives the same normalized value ID used by the Base record and resolves its field-specific translation key, falling back to the raw value.
4. The card field heading changes from `Steering Configuration` to `Vehicle Highlights` in English, `车型亮点` in Chinese, and a reliable Amharic translation or English fallback in Amharic.

This separation ensures translated labels cannot change which products match a filter.

## Data Quality

Before creating records, collect the full current value set from the live product API and de-duplicate it by product slug or raw categorical value. Verify Chinese model names against official manufacturer naming where available. If an official Chinese name cannot be established, preserve the English name rather than inventing a translation.

Creation is idempotent: existing keys are updated, missing keys are created, and unrelated `I18n Locale` records are untouched. No Vehicle Models record is changed.

## Verification

- Confirm every current product slug has a display-name record and every non-empty card description has a highlight record.
- Confirm every current categorical filter value has exactly one field-specific translation record.
- Sync all `I18n Locale` records back to the local translation files.
- Add regression tests proving card translations are keyed by slug, filter matching still uses raw values, and missing translations fall back safely.
- Run the project test suite, `npm run check`, and `git diff --check`.
- Verify representative Chinese and Amharic output on each of the three category pages without pushing or deploying unless separately requested.
