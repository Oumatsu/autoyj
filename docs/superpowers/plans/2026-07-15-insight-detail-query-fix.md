# Insight Detail Query Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make published Insight detail pages load their Feishu article content without triggering `InvalidFilter`.

**Architecture:** Keep the existing Feishu Base list-records reader and article response mapper. Replace the invalid server-side filter argument with a paginated table read followed by an exact in-memory `slug` and `Published` match.

**Tech Stack:** TypeScript, Cloudflare Worker, Feishu Base, Node test runner, Vinext.

## Global Constraints

- Do not modify Feishu Base data or schema.
- Preserve the existing Insight response shape, cache key, and 404 behavior.
- Do not push or deploy.

---

### Task 1: Reproduce and fix the Insight detail query

**Files:**
- Create: `tests/insight-detail-query.test.mjs`
- Modify: `worker/portal.ts:2043-2057`

**Interfaces:**
- Consumes: `searchRecords(env, articlesTableId, { pageSize: 100 })` and raw Feishu records.
- Produces: the existing JSON article payload or a 404 problem response.

- [x] **Step 1: Write the failing regression test**

Read the `handlePublicInsight` source block and require an unfiltered paginated read, exact slug/status matching, and no `equalsFilter` call.

- [x] **Step 2: Run `npm test` and verify the new test fails**

Expected: the test fails because the handler still calls `equalsFilter("slug", slug)`.

- [x] **Step 3: Implement the minimal query correction**

Call `searchRecords` with `pageSize: 100`, then use `records.find` to match `asText(r.fields.slug) === slug` and `asText(r.fields.status) === "Published"`.

- [x] **Step 4: Run `npm test` and verify all tests pass**

Expected: the regression test and existing catalog tests pass.

### Task 2: Prevent translation-driven Insight render crashes

**Files:**
- Create: `i18n/translationFallback.ts`
- Create: `tests/translation-fallback.test.mjs`
- Modify: `i18n/useTranslation.ts`
- Modify: `views/insights/[slug].tsx`

**Interfaces:**
- Produces: `resolveTranslationValue` for ordered dynamic/static fallback and `asStringArray` for safe tag rendering.

- [x] **Step 1: Write failing fallback and tag-normalization tests**

- [x] **Step 2: Verify the new module is missing and the tests fail**

- [x] **Step 3: Implement ordered translation fallback and string-array normalization**

- [x] **Step 4: Run `npm test` and verify all tests pass**

### Task 3: Verify the application

**Files:**
- Verify only; restore build-generated i18n differences.

**Interfaces:**
- Produces: passing compatibility check, production build, and a scoped worktree.

- [x] **Step 1: Run `npm run check`**

Expected: Vinext reports no blocking compatibility issues.

- [x] **Step 2: Run `npm run build`**

Expected: production build completes; restore only generated translation differences.

- [x] **Step 3: Run `git diff --check` and inspect status**

Expected: only the Insight query fix, translation fallback, render guard, tests, and design/plan documents are changed; `%SystemDrive%/` remains untouched.
