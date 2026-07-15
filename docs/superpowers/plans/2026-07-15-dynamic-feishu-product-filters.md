# Dynamic Feishu Product Filters Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hardcoded tag matching with dynamic, structured filters backed by existing Feishu `Vehicle Models` values.

**Architecture:** A pure Worker mapper converts existing Base fields into `filterData`; a pure frontend engine builds valid category options and evaluates categorical or interval selections. The three pages share the engine while preserving their existing translated headings and numeric business ranges.

**Tech Stack:** TypeScript, React 19, Cloudflare Worker, Feishu Base read API, Node 24 test runner, Vinext.

## Global Constraints

- Do not modify Feishu Base schema, fields, views, or records.
- Do not use presentation `tags` for filtering.
- Numeric filters match when product and selected intervals have a non-empty inclusive intersection.
- Same-group selections use OR; cross-group selections use AND.
- Unknown Base values stay unknown and do not create filter options.
- Do not push or deploy.

---

### Task 1: Structured Worker filter data

**Files:**
- Create: `worker/productFilters.ts`
- Modify: `worker/portal.ts`
- Create: `tests/product-filter-data.test.mjs`

**Interfaces:**
- Consumes: a raw Feishu record `fields: Record<string, unknown>`.
- Produces: `buildProductFilterData(fields): ProductFilterData` and a `filterData` property on every public product.

- [x] **Step 1: Write a failing mapper test**

Test select arrays, formula strings, atomic battery splitting, numeric bounds, missing fields, voltage labels, inventory values, drivetrain values, and ground clearance.

- [x] **Step 2: Run `npm test` and confirm the mapper import/function is missing**

Expected: the new mapper test fails before production code exists.

- [x] **Step 3: Implement the pure mapper and add it to the public product payload**

Keep all conversions read-only and deterministic. Do not change Feishu request paths or table data.

- [x] **Step 4: Run `npm test` and confirm mapper tests pass**

Expected: mapper tests pass and existing loading-state tests remain green.

### Task 2: Shared dynamic filter engine

**Files:**
- Create: `views/products/catalogFilters.ts`
- Create: `tests/product-catalog-filters.test.mjs`

**Interfaces:**
- Produces: `intervalsOverlap`, `buildCatalogFilterGroups`, and `filterCatalogProducts`.
- Consumes: API products with `filterData`, category slug, translation callback, and active option-id sets.

- [x] **Step 1: Write failing engine tests**

Cover inclusive interval overlap, removal of empty options/groups, categorical distinct values, same-group OR, cross-group AND, missing values, and search-compatible output.

- [x] **Step 2: Run `npm test` and confirm the engine import/functions are missing**

Expected: the new engine test fails before implementation.

- [x] **Step 3: Implement category definitions and matching engine**

Use exact Base values for categorical options and category-specific inclusive interval definitions for price, range, and clearance.

- [x] **Step 4: Run `npm test` and confirm all engine tests pass**

Expected: mapper, engine, and loading-state tests pass.

### Task 3: Connect all category pages

**Files:**
- Modify: `views/products/revenue-king.tsx`
- Modify: `views/products/elite-flagship.tsx`
- Modify: `views/products/utility-pro.tsx`
- Modify: `tests/product-category-loading-state.test.mjs`

**Interfaces:**
- Consumes: `filterData`, `buildCatalogFilterGroups`, and `filterCatalogProducts`.
- Produces: dynamic filter controls and correct product results on all category pages.

- [x] **Step 1: Extend the source contract test to reject `v.tags.some(...)`**

Require each page to use the shared engine and render groups/options dynamically.

- [x] **Step 2: Run `npm test` and confirm the source contract fails**

Expected: all three page cases fail because hardcoded tag filtering still exists.

- [x] **Step 3: Map API `filterData`, build groups, and replace hardcoded controls**

Preserve loading/error behavior from the previous fix. Clear filters remains unchanged.

- [x] **Step 4: Run `npm test` and confirm all tests pass**

Expected: no page filters through presentation tags and all shared behavior tests pass.

### Task 4: Full verification

**Files:**
- Verify only; revert only build-generated i18n changes.

**Interfaces:**
- Produces: passing tests, compatibility check, production build, and a clean scoped diff.

- [x] **Step 1: Run `npm run check`**

Expected: Vinext check completes without blocking issues.

- [x] **Step 2: Run `npm run build`**

Expected: production build succeeds; restore build-generated translation differences only.

- [x] **Step 3: Run `git diff --check` and inspect status**

Expected: no whitespace errors, Base-write code, secrets, `%SystemDrive%/` content, push, or deployment changes.
