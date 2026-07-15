# Vehicle Detail I18n Deduplication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove only the redundant vehicle-detail translations created by the current implementation and adapt the frontend to reuse unique visible translations without losing Chinese or Amharic coverage.

**Architecture:** Replace per-field repeated translations with deterministic shared-value keys. Keep model prose and Trim names context-specific, translate repeated scalar and feature values through shared keys, omit invariant/empty/Gallery data, then prune only stale records under the owned detail prefixes.

**Tech Stack:** React/TypeScript, Node.js, `node:test`, Feishu Base via `lark-cli`, vinext

## Global Constraints

- Only own `productsDetail.models.*`, `productsDetail.variants.*`, `productsDetail.values.*`, and the 61 UI records introduced by the detail implementation.
- Never delete or retag `productsDetail.loading`, `productsDetail.modelNotFound`, other modules, or unrelated records.
- Never modify Vehicle Models or `vehicle_variants` business fields.
- Shared-value records may link to multiple related models and variants.
- Empty arrays, Gallery metadata, and three-locale invariant values produce no records.
- If record deletion is unavailable, set stale owned records to a dedicated `待删除-车型详情` Module option and report the exact count.
- No push or deployment unless separately requested.

---

### Task 1: Shared value keys and safe resolvers

**Files:**
- Modify: `views/products/detailTranslations.ts`
- Modify: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Produces: `detailValueKey(source: string): string`, `translatedDetailValue(t, source): string`, and `translatedDetailValues(t, source[]): string[]`
- Consumes: the existing `DetailTranslate` signature

- [ ] Add failing tests proving identical source values share one key, empty arrays remain empty, and invariant source values fall back unchanged.
- [ ] Run `node --test tests/product-detail-translations.test.mjs`; expect the new assertions to fail.
- [ ] Implement a browser-safe deterministic FNV-1a key and item-by-item value resolvers.
- [ ] Re-run the focused test; expect all assertions to pass.

### Task 2: Frontend shared-value adaptation

**Files:**
- Modify: `app/products/_VehicleDetail.tsx`
- Modify: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Consumes: `translatedDetailValue()` and `translatedDetailValues()`
- Produces: active detail rendering without Gallery/model-label/per-Trim-array translation keys

- [ ] Add source-contract tests rejecting `galleryImages.*` model keys, per-model stat label keys, per-variant status/technical keys, and whole-array translation calls.
- [ ] Run the focused test and verify failure against the current renderer.
- [ ] Keep model overlays only for model-specific prose and display names.
- [ ] Resolve repeated status, drivetrain, charging, battery display, spec values, and feature items through shared value keys.
- [ ] Use shared UI keys for stat labels and `Why this model`; leave motor output and other invariant technical values as source fallback.
- [ ] Re-run focused tests and `npx tsc --noEmit --pretty false`, confirming no `_VehicleDetail.tsx` diagnostic.

### Task 3: Deduplicated manifest generation

**Files:**
- Modify: `scripts/sync-product-detail-i18n.mjs`
- Modify: `scripts/product-detail-i18n-data.mjs`
- Modify: `tests/product-detail-translations.test.mjs`

**Interfaces:**
- Produces: unique desired manifest plus `staleOwnedRecords`
- Consumes: live 47-model and 251-variant data

- [ ] Add tests for invariant omission, empty-array omission, Gallery omission, shared-value deduplication, and merged relation sets.
- [ ] Generate context-specific model prose and Trim names only.
- [ ] Collect all other visible translated values by English source, key them with `detailValueKey`, and merge model/variant relation record IDs.
- [ ] Reject duplicate desired keys, missing context relations, and shared-value hash collisions.
- [ ] Compute stale records only when their key begins with an owned prefix and is absent from the desired manifest.
- [ ] Dry-run the script and require 47 models, 251 variants, zero collisions, zero relation mismatches, no Gallery keys, no empty arrays, and no invariant rows.

### Task 4: Safe live cleanup and static sync

**Files:**
- Modify through sync: `i18n/translations/zh.ts`
- Modify through sync: `i18n/translations/en.ts`
- Modify through sync: `i18n/translations/am.ts`

**Interfaces:**
- Consumes: validated desired manifest and stale owned record IDs
- Produces: pruned live Base and synchronized static dictionaries

- [ ] Re-read the live I18n table immediately before mutation and verify every stale key is inside an owned prefix.
- [ ] Run create/update writes first; stop on failure.
- [ ] Delete stale records in sequential confirmed batches using `lark-cli base +record-delete`.
- [ ] If deletion is unsupported, create/confirm the `待删除-车型详情` Module option and batch-update only the stale owned record IDs to it.
- [ ] Re-read live records and verify no stale owned keys, no empty arrays, no Gallery keys, no duplicate keys, and correct relations.
- [ ] Run `npm run sync:i18n`.

### Task 5: Full verification

**Files:**
- No additional files

**Interfaces:**
- Consumes: completed frontend, manifest, and live Base state
- Produces: evidence-backed handoff without push or deployment

- [ ] Run `node --test tests/*.test.mjs`; expect zero failures.
- [ ] Run `npm run check`; expect success.
- [ ] Run `npm run build`; expect success.
- [ ] Verify representative model, six-Trim, and low-Trim Chinese and Amharic detail data paths.
- [ ] Confirm `%SystemDrive%/` remains untouched and all unrelated worktree changes remain preserved.
