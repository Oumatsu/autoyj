# Hero Metric 3 Battery Type Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make product detail Hero Metric 3 derive from the canonical `Battery Type` field so the Feishu Base no longer needs `Hero Metric 3 Label` or `Hero Metric 3 Value`.

**Architecture:** The Worker will emit a static `stat3Label` of `Battery Type` and a dynamic `stat3Value` from the existing `Battery Type` field. Import and cleanup scripts will stop declaring or describing the redundant Hero Metric 3 fields, leaving manual field deletion safe after deployment.

**Tech Stack:** TypeScript Worker in `worker/portal.ts`, Node ESM maintenance scripts, existing `npm run check` and `npm run build` verification.

## Global Constraints

- Keep the public product detail payload shape unchanged: `stat3Label` and `stat3Value` still exist.
- Do not delete Feishu Base fields from automation; the user will delete `Hero Metric 3 Label` and `Hero Metric 3 Value` manually.
- Use `Battery Type` as the only backend source for Hero Metric 3.
- Preserve existing Hero Metric 1 and Hero Metric 2 behavior.

---

### Task 1: Worker Mapping

**Files:**
- Modify: `worker/portal.ts`

**Interfaces:**
- Consumes: `fieldText(fields, ["Battery Type"])`
- Produces: `stat3Label: "Battery Type"` and `stat3Value: string`

- [ ] **Step 1: Replace Hero Metric 3 free-text reads**

Change the product detail payload mapping from `Hero Metric 3 Label` / `Hero Metric 3 Value` to:

```ts
stat3Label: "Battery Type",
stat3Value: fieldText(fields, ["Battery Type"]),
```

- [ ] **Step 2: Verify local product payloads**

Run sample API checks against the local server:

```powershell
Invoke-RestMethod "http://localhost:3000/api/portal/public/products/byd-seagull" | Select-Object -ExpandProperty stat3Label
Invoke-RestMethod "http://localhost:3000/api/portal/public/products/byd-seagull" | Select-Object -ExpandProperty stat3Value
Invoke-RestMethod "http://localhost:3000/api/portal/public/products/mg-mg4-ev" | Select-Object -ExpandProperty stat3Value
```

Expected: label is `Battery Type`; values come from each record's `Battery Type`.

### Task 2: Maintenance Script Cleanup

**Files:**
- Modify: `scripts/import-frontend-to-feishu.mjs`
- Modify: `scripts/cleanup-vehicle-models-table.mjs`

**Interfaces:**
- Consumes: existing field setup arrays in each script
- Produces: no automated dependency on `Hero Metric 3 Label` or `Hero Metric 3 Value`

- [ ] **Step 1: Remove import defaults**

Delete default `Hero Metric 3 Label` and `Hero Metric 3 Value` entries from `scripts/import-frontend-to-feishu.mjs`.

- [ ] **Step 2: Remove required field declarations**

Delete `Hero Metric 3 Label` and `Hero Metric 3 Value` from the import script's required field list.

- [ ] **Step 3: Remove cleanup descriptions**

Delete the `stat3Label` and `stat3Value` rename/description rows from `scripts/cleanup-vehicle-models-table.mjs`.

### Task 3: Verification

**Files:**
- Test: repository commands

**Interfaces:**
- Consumes: edited Worker and scripts
- Produces: verified branch ready for commit, push, and preview deployment when requested

- [ ] **Step 1: Run static checks**

```powershell
npm run check
```

Expected: command exits successfully.

- [ ] **Step 2: Run production build**

```powershell
npm run build
```

Expected: command exits successfully; existing warnings are acceptable.

- [ ] **Step 3: Check whitespace**

```powershell
git diff --check
```

Expected: no output and exit code 0.
