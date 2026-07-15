# Product Catalog Dynamic Translations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Store and render verified three-language translations for product names, card highlights, and live categorical filter values on all product category pages.

**Architecture:** Keep raw Vehicle Models values and filter IDs unchanged. Derive stable translation keys from product slugs and normalized filter values, then translate only the labels rendered by the category pages. `I18n Locale` remains the translation source of truth and is synced into the local static dictionaries.

**Tech Stack:** TypeScript, React, Node test runner, Feishu Base `I18n Locale`, Cloudflare Worker API.

## Global Constraints

- Chinese model names use verified official names; they are never inferred from an English brand family.
- Amharic retains English whenever no reliable translation or established transliteration can be verified.
- No Vehicle Models records are changed.
- Raw API values remain the sole input to matching, search, and interval filtering.
- No push or deployment is performed without a separate request.

---

### Task 1: Stable Catalog Translation Keys

**Files:**
- Create: `views/products/catalogTranslations.ts`
- Create: `tests/product-catalog-translations.test.mjs`

**Interfaces:**
- Produces: `catalogValueId(value: string): string`
- Produces: `catalogModelKey(slug: string, field: "displayName" | "cardHighlight"): string`
- Produces: `catalogFilterKey(field: string, value: string): string`

- [ ] **Step 1: Write failing key-generation tests**

```js
assert.equal(catalogValueId("Hatchback (Sub-Compact)"), "hatchback-sub-compact");
assert.equal(catalogModelKey("geely-geome", "displayName"), "catalog.models.geely-geome.displayName");
assert.equal(catalogFilterKey("batteryChemistry", "Semi-solid-state"), "catalog.filters.batteryChemistry.semi-solid-state");
```

- [ ] **Step 2: Run the test and confirm the module is missing**

Run: `node --test tests/product-catalog-translations.test.mjs`
Expected: FAIL because `catalogTranslations.ts` does not exist.

- [ ] **Step 3: Implement deterministic normalization**

```ts
export function catalogValueId(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}
```

`catalogModelKey` and `catalogFilterKey` compose this stable namespace without changing the raw filter option ID.

- [ ] **Step 4: Run the focused test**

Run: `node --test tests/product-catalog-translations.test.mjs`
Expected: 3 assertions pass.

### Task 2: Translate Filter Labels and Product Cards

**Files:**
- Modify: `views/products/catalogFilters.ts`
- Modify: `views/products/revenue-king.tsx`
- Modify: `views/products/elite-flagship.tsx`
- Modify: `views/products/utility-pro.tsx`
- Modify: `tests/product-catalog-filters.test.mjs`
- Modify: `tests/product-catalog-translations.test.mjs`

**Interfaces:**
- Consumes: `catalogModelKey` and `catalogFilterKey` from Task 1.
- Preserves: categorical option ID `value:${rawValue}` and matching against raw `filterData`.

- [ ] **Step 1: Add failing tests for translated labels with raw matching IDs**

```js
const t = (key, fallback) => key.endsWith("compact-suv") ? "紧凑型 SUV" : fallback;
assert.equal(group.options[0].label, "紧凑型 SUV");
assert.equal(group.options[0].id, "value:Compact SUV");
```

- [ ] **Step 2: Add failing source assertions for slug-keyed cards**

Assert each category page resolves `catalogModelKey(vehicle.slug, "displayName")`, resolves `cardHighlight`, and uses `catalog.cardField.vehicleHighlights` instead of a category-specific steering/charging heading.

- [ ] **Step 3: Translate only categorical presentation labels**

Pass the existing `t` function into `categoricalGroup`, resolve `catalogFilterKey(groupId, rawValue)`, and retain the existing raw option ID and `matches` closure.

- [ ] **Step 4: Translate card display names and highlights**

For each page, compute:

```ts
const displayName = t(catalogModelKey(vehicle.slug, "displayName"), `${vehicle.brand} ${vehicle.name}`);
const cardHighlight = t(catalogModelKey(vehicle.slug, "cardHighlight"), vehicle.charging);
```

Render the translated full name once, render `cardHighlight` as the third specification value, and use `catalog.cardField.vehicleHighlights` for its label.

- [ ] **Step 5: Run focused tests**

Run: `node --test tests/product-catalog-filters.test.mjs tests/product-catalog-translations.test.mjs`
Expected: all catalog translation and filtering tests pass.

### Task 3: Populate I18n Locale

**Files:**
- Modify through sync: `i18n/translations/zh.ts`
- Modify through sync: `i18n/translations/en.ts`
- Modify through sync: `i18n/translations/am.ts`

**Interfaces:**
- Consumes: all 47 current product slugs and live categorical values from `/api/portal/public/products`.
- Produces: one `I18n Locale` record per model display name, non-empty card highlight, filter value, and the shared card-field heading.

- [ ] **Step 1: Re-read the live product payload and build an exact key manifest**

Require 47 unique `catalog.models.<slug>.displayName` keys, one highlight key per non-empty `charging` value, and one field-specific key for every distinct categorical value.

- [ ] **Step 2: Verify Chinese model names**

Use official manufacturer naming where available. Record `catalog.models.geely-geome.displayName` as `吉利星愿`. Preserve English in Chinese only when no official Chinese name can be established.

- [ ] **Step 3: Prepare idempotent writes**

Search existing `catalog.` keys, update any exact matches, and batch-create missing records with fields `Key`, `Module`, `ZH`, `EN`, `AM`, and `Notes`. Use `Module = 产品`.

- [ ] **Step 4: Dry-run then write only I18n Locale**

Run every write first with `--dry-run`; reject duplicate keys or any target table other than `tblATd4EWHge1l1k`. Then execute serially with user identity.

- [ ] **Step 5: Sync the source table back to local dictionaries**

Run: `npm run sync:i18n`
Expected: all three translation files are regenerated from the full Base table.

### Task 4: End-to-End Verification

**Files:**
- Test: `tests/product-catalog-translations.test.mjs`
- Test: `tests/product-catalog-filters.test.mjs`

**Interfaces:**
- Verifies the Feishu source, local fallback dictionaries, and frontend consumers use the same keys.

- [ ] **Step 1: Assert manifest coverage against the synced dictionaries**

Check every live slug and categorical value resolves in `zh`, `en`, and `am`; assert the Chinese Geome value is exactly `吉利星愿` and its Amharic value is non-empty.

- [ ] **Step 2: Run all tests**

Run: `npm test`
Expected: zero failures.

- [ ] **Step 3: Run compatibility and diff checks**

Run: `npm run check`
Run: `git diff --check`
Expected: both commands exit successfully.

- [ ] **Step 4: Inspect representative rendered data paths**

Verify one Revenue King, one Elite Flagship, and one Utility Pro card use translated names/highlights, and verify translated filter labels still select products through raw IDs.
