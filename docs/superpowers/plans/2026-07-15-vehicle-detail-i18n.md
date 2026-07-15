# Vehicle Detail Full-Locale Translation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Translate every public vehicle-detail interface and all dynamic content for Chinese and Amharic, with model-level and Trim-level translations stored and correctly related in Feishu Base.

**Architecture:** Keep English source values in `Vehicle Models` and `vehicle_variants`; expose stable model/Trim identifiers from the Worker, and resolve locale overlays in the shared detail renderer through `I18n Locale`. Generate an idempotent translation manifest from live Base data, validate all 47 models and 251 variants before writes, then sync the complete manifest into static locale dictionaries for immediate locale rendering.

**Tech Stack:** React/TypeScript, vinext, Cloudflare Worker, Node.js scripts, `node:test`, `lark-cli`, Feishu Base

## Global Constraints

- Shared UI keys have no model or variant link.
- Model keys set only `Linked Vehicle Model` (`fldvLvDmp6`).
- Variant keys set both `Linked Vehicle Model` and `Linked vehicle_variants` (`fld3MQmx4Y`).
- Match models by Product Path slug and variants by Trim Config ID plus the existing `Vehicle Model Pruned` relation; never match translated names.
- Preserve numbers, units, currency, placeholders, URLs, acronyms, record IDs, Model IDs, and Trim Config IDs.
- Amharic ordinary prose must be understandable; official names and technical terms without a reliable natural equivalent may remain English.
- Every array translation must remain a valid array with the same item count and order as English.
- English is the safe fallback; missing keys and malformed arrays must never render raw keys or crash `.map()`.
- Do not push or deploy unless separately requested.
- Preserve all pre-existing worktree changes. Commit a task only when its staged diff contains no unrelated pre-existing edits; otherwise leave that task uncommitted and report the boundary.

---

### Task 1: Stable detail translation keys and safe locale resolution

**Files:**
- Create: `views/products/detailTranslations.ts`
- Create: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Produces: `detailModelKey(slug, field)`, `detailVariantKey(trimConfigId, field)`, `translatedDetailString(t, key, fallback)`, and `translatedDetailArray(t, key, fallback)`
- Consumes: `t(key, fallback)` from `useTranslation()`

- [ ] Write failing tests proving stable normalization, string fallback, array fallback, and rejection of non-array translated values.
- [ ] Run `node --test tests/product-detail-translations.test.mjs`; expect failure because the helper module does not exist.
- [ ] Implement helpers with these exact prefixes:

```ts
productsDetail.models.<slug>.<field>
productsDetail.variants.<trim-config-id>.<field>
```

- [ ] Re-run the focused test and expect all helper tests to pass.
- [ ] Commit only the helper and focused test with message `Add vehicle detail translation helpers`.

### Task 2: Stable model and Trim identities in the public detail payload

**Files:**
- Modify: `worker/portal.ts`
- Modify: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Produces: detail payload `modelId`, `slug`, and `trimComparison.trims[].trimConfigId`
- Consumes: `Vehicle Models.Model ID`, Product Path slug, and `vehicle_variants.Trim Config ID`

- [ ] Add failing source-contract tests requiring `trimConfigId` in `buildTrimComparison()` and `modelId`/`slug` in `handlePublicProduct()` output.
- [ ] Run the focused test and verify the new assertions fail.
- [ ] Add `trimConfigId: asText(fields["Trim Config ID"])` to every Trim object and add top-level `modelId` and `slug` to the detail response.
- [ ] Keep identifiers out of user-visible copy and all localized matching.
- [ ] Re-run the focused test and `npm run check`.
- [ ] Commit only the Worker and focused test changes with message `Expose vehicle detail translation identities`.

### Task 3: Translate the complete shared detail renderer

**Files:**
- Modify: `app/products/_VehicleDetail.tsx`
- Modify: `views/products/[category]/[slug].tsx`
- Modify: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Consumes: translation helpers from Task 1 and identifiers from Task 2
- Produces: no visible hardcoded English in the active detail renderer

- [ ] Add failing tests that scan the active renderer for required translation calls covering breadcrumbs, hero CTAs, business case, profit estimator, specifications, Trim headings/cards/tables, common features, loading, error, and empty states.
- [ ] Replace shared hardcoded strings with `t()` calls and placeholder interpolation.
- [ ] Keep internal English tokens only for comparison logic, source statuses, styling, and field selection.
- [ ] Route all rendered model strings through `detailModelKey()` with the exact English value as fallback.
- [ ] Route Trim name, chemistry, drivetrain, and three feature arrays through `detailVariantKey()`; use safe array fallback.
- [ ] Run the focused test and `npm run check`.
- [ ] Commit renderer, shared translation data, and tests with message `Translate vehicle detail interface`.

### Task 4: Build the complete live Base translation manifest

**Files:**
- Create: `scripts/product-detail-i18n-data.mjs`
- Create: `scripts/sync-product-detail-i18n.mjs`
- Modify: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Produces: manifest records with `{Key, Module, ZH, EN, AM, Notes, linkedModelId, linkedVariantId}`
- Consumes: all 47 `Vehicle Models`, all 251 `vehicle_variants`, shared copy, and existing catalog model names

- [ ] Add failing tests for the automotive phrase translator grammar:
  - optional `Carried from <trim>:` prefix
  - `label: value`
  - `old -> new`
  - semicolon-separated values
  - `Standard` / `Optional` / `Front + rear`
  - preserved acronyms and numbers
- [ ] Define `sharedDetailTranslations` with exact `{Key, Module, ZH, EN, AM, Notes}` records for every `productsDetail.ui.*` key used by the renderer.
- [ ] Implement explicit Chinese and Amharic dictionaries for UI terms, Trim edition terms, feature labels, common values, directions, seat functions, driver-assistance vocabulary, and source statuses.
- [ ] Implement grammar-based translation so the current 792 unique feature strings are translated from structured parts rather than maintained as 792 unrelated literals.
- [ ] Implement Trim-name translation that translates edition/trim descriptors while preserving numeric ranges, brands, platforms, and technical product names.
- [ ] Implement live Base reads through `lark-cli` with sequential pagination and minimum field projection.
- [ ] Validate exactly 47 unique slugs, 47 Model IDs, 251 unique Trim Config IDs, one model link per Trim, matching Model IDs, and unique manifest keys.
- [ ] Generate model records for all rendered text fields and variant records for:

```text
trimName
batteryChemistry
drivetrainDisplay
baseFeatures
addedFeatures
upgradedFeatures
```

- [ ] Default to dry-run; require `--write` for Base mutation. Create missing records in batches up to 200 and update existing owned keys by record ID.
- [ ] Write link values with record IDs, preserving unrelated records and existing catalog relations.
- [ ] Add tests for duplicate-key detection, relation assignment, array-length preservation, and Amharic ordinary-prose coverage.
- [ ] Run the focused tests and `node scripts/sync-product-detail-i18n.mjs` in dry-run mode; expect 47 models, 251 variants, zero relation mismatches, and no writes.
- [ ] Commit scripts and tests with message `Build vehicle detail translation manifest`.

### Task 5: Write translations and verify Base relations

**Files:**
- Modify through generated sync: `i18n/translations/zh.ts`
- Modify through generated sync: `i18n/translations/en.ts`
- Modify through generated sync: `i18n/translations/am.ts`
- No other source files modified

**Interfaces:**
- Consumes: validated manifest from Task 4
- Produces: live Base translation rows and synchronized static dictionaries

- [ ] Run `node scripts/sync-product-detail-i18n.mjs --write` and stop on the first failed batch.
- [ ] Re-read owned keys from `I18n Locale` and verify:
  - shared rows have zero relation links
  - every model row has one correct model link and zero variant links
  - every variant row has one correct model link and one correct variant link
  - reverse relation counts equal manifest counts
- [ ] Run `npm run sync:i18n` to regenerate all three static dictionaries from live Base.
- [ ] Run focused tests and confirm every manifest key exists in ZH/EN/AM.
- [ ] Commit only intended translation dictionaries with message `Sync vehicle detail translations`.

### Task 6: Full verification and handoff

**Files:**
- No additional files

**Interfaces:**
- Consumes: completed code, translations, and live Base state
- Produces: verification evidence without push or deploy

- [ ] Run `node --test tests/*.test.mjs`; expect zero failures.
- [ ] Run `npm run check`; expect success.
- [ ] Run `npm run build`; expect success, then inspect generated i18n changes and retain only intended output.
- [ ] Verify representative Chinese and Amharic detail payload/render paths for one model in each category, one six-Trim model, and one low-Trim model.
- [ ] Confirm no ordinary English interface sentences remain in Chinese or Amharic rendered output, allowing only names, acronyms, and units.
- [ ] Confirm the worktree still preserves all unrelated pre-existing changes and `%SystemDrive%/` remains untouched.
