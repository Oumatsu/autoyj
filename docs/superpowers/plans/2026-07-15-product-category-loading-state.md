# Product Category Loading State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ensure all product category pages show skeletons rather than static vehicle data until the public products API resolves.

**Architecture:** Add one shared catalog loading component and explicit `loading`, `ready`, and `error` states in each category page. Preserve local static data only as post-response field completion and ordering input.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Node test runner, Vinext.

## Global Constraints

- Do not render local static vehicle arrays before the API succeeds.
- Do not fall back to local static vehicle cards when the API fails.
- Apply identical loading semantics to all three product category pages.
- Do not push or deploy.

---

### Task 1: Loading-state regression contract

**Files:**
- Create: `tests/product-category-loading-state.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: the three product category TSX source files.
- Produces: `npm test`, enforcing shared skeleton and explicit loading/error state contracts.

- [ ] **Step 1: Write the failing test**

Create a Node test that reads each category page and asserts that it imports and renders `ProductCatalogSkeleton`, initializes `loadState` to `loading`, renders an unavailable state on `error`, and does not contain `products || vehicles`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`

Expected: FAIL because the shared skeleton and explicit load state do not exist yet.

- [ ] **Step 3: Keep the failing test unchanged for Task 2**

The production implementation must satisfy this contract without weakening assertions.

### Task 2: Shared skeleton and category state flow

**Files:**
- Create: `components/ProductCatalogState.tsx`
- Modify: `views/products/revenue-king.tsx`
- Modify: `views/products/elite-flagship.tsx`
- Modify: `views/products/utility-pro.tsx`

**Interfaces:**
- Consumes: `ProductCatalogSkeleton` and `ProductCatalogUnavailable` React components.
- Produces: a skeleton-only first render, API-only ready render, and explicit error render.

- [ ] **Step 1: Create shared visual states**

Add `ProductCatalogSkeleton` with six inert skeleton cards and `ProductCatalogUnavailable` with a concise localized-neutral English message.

- [ ] **Step 2: Replace implicit fallback state**

In every category page, initialize `loadState` to `loading`, set it to `ready` after mapped API data is stored, and set it to `error` in `catch`. Use an empty list before readiness instead of `products || vehicles`.

- [ ] **Step 3: Gate result metadata and grid**

Render skeletons during loading, unavailable state on error, and vehicle cards/pagination only in ready state.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`

Expected: all product loading-state tests PASS.

### Task 3: Project verification

**Files:**
- Verify only; no additional files expected.

**Interfaces:**
- Consumes: completed loading-state implementation.
- Produces: compatibility and production-build evidence.

- [ ] **Step 1: Run compatibility check**

Run: `npm run check`

Expected: Vinext check completes with no blocking issues.

- [ ] **Step 2: Run production build**

Run: `npm run build`

Expected: build succeeds. Revert only generated i18n differences if the sync step changes them.

- [ ] **Step 3: Inspect final diff and status**

Confirm no secrets, build outputs, `%SystemDrive%/` content, or unrelated files are included.
