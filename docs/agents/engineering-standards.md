# Engineering Standards & AI-Native Iron Laws

This document outlines the canonical engineering principles, testing methodologies, and automation rules enforced in the **Youguard** codebase. All human engineers and AI coding agents must strictly adhere to these iron laws.

---

## 1. Iron Law I: Screenshot-less Development Mode (无截图模式开发)

### 1.1 Core Principle
**Do NOT use visual screenshots, OCR parsing, or computer vision to judge UI correctness, layout integrity, or regression testing during development.**

Visual screenshotting is subjective, token-expensive, non-deterministic, and insensitive to underlying state/data models. Instead, UI correctness must be verified programmatically through **semantic DOM inspection, accessibility trees, network interception, and console diagnostic hooks**.

### 1.2 Anti-Patterns vs. Canonical Practices

| Anti-Pattern (Strictly Forbidden 🚫) | Canonical Practice (Mandatory ✅) |
| :--- | :--- |
| Taking screenshot PNGs to visually check if a button is rendered | `await expect(page.getByRole("button", { name: "Submit" })).toBeVisible()` |
| Taking screenshots to check if text translated correctly | `await expect(page.locator("h1")).toHaveText(...)` and CJK exclusion assertions |
| Visual inspection of table column orders | `await expect(page.locator("table th").allInnerTexts()).resolves.toEqual([...])` |
| Screenshotting form submission error messages | `await expect(page.locator("[data-testid=error-msg]")).toHaveText(...)` |
| Manual screenshot reviews before PR merge | Programmatic Playwright assertions in local `pre-push` gate |

### 1.3 Permitted Role of Screenshots
Screenshots and video traces are permitted **ONLY** as **post-mortem forensic artifacts on test failure**:
- Configured in `playwright.config.ts`: `screenshot: "only-on-failure"` and `trace: "retain-on-failure"`.
- Daily development and automated testing runs 100% headless with structured programmatic feedback.

---

## 2. Iron Law II: AI-Native Engineering Paradigm (AI 原生工程体系)

### 2.1 Eval-First & TDD Discipline
1. **Never write implementation code without automated evaluations/tests.**
2. **Red-Green-Refactor Loop**:
   - **Bug Fixes**: Write a reproduction test that fails on current code (Red), fix the bug until the test passes (Green), then refactor without breaking existing suites.
   - **New Features**: Define domain contracts in `lib/` and unit/integration tests before writing UI components or API handlers.
3. **No Mocks on Core Business Math**:
   - Quotation pricing math (`lib/quotation-pricing.ts`), trade terms (EXW/FOB/CIF), volume discounts, and workflow status transitions (`lib/inquiry-workflow.ts`, `lib/order-workflow.ts`) must be verified using pure functions with exhaustive test matrices.

### 2.2 Zero-Human-Check Quality Standard
- Human engineers should never be required to perform manual exploratory clicking to verify if a commit introduced regressions.
- Every user journey, API route, auth boundary, and data transition must be guarded by automated deterministic tests.
- If a bug escapes to production, an automated test covering that exact failure case must be added to the test suite before any patch is committed.

### 2.3 Single Source of Truth for Domain Modeling
- Consult and update `CONTEXT.md` for domain vocabulary (`Inquiry`, `Quotation`, `Order`, `Fulfillment`, `PDI Inspection`, `Tier Discount`).
- Architectural decisions must be documented in `docs/adr/`.

---

## 3. Iron Law III: Playwright Standard Best Practices (Playwright 工业级自动化准则)

### 3.1 Locator Hierarchy
Always use user-facing, semantic locators in order of preference:

```typescript
// 1. Role Locator (Best — Accessible & Semantic)
page.getByRole("button", { name: /request quote/i });
page.getByRole("heading", { level: 1, name: "About Us" });

// 2. Form & Label Locator
page.getByLabel("Target Price (USD)");
page.getByPlaceholder("Enter your contact number");

// 3. Text & Test ID Locator
page.getByText("Vehicle Specifications");
page.getByTestId("quote-composer-card");

// ❌ NEVER USE: Brittle CSS structural paths or absolute XPaths
// e.g. page.locator("div > div.flex > div:nth-child(3) > span")
```

### 3.2 Navigation & Anti-Flakiness Rules
1. **Explicit Settle Strategy**:
   - In Next.js/Vinext App Router with SSR and client hydration, avoid `networkidle` (which hangs on websockets or font analytics).
   - Use `{ waitUntil: "domcontentloaded" }` or `{ waitUntil: "load" }`, followed by locator assertions:
     ```typescript
     await page.goto("/en/products", { waitUntil: "domcontentloaded" });
     await expect(page.locator("h1")).toBeVisible();
     ```
2. **Context & Cookie Isolation**:
   - In multi-locale tests or role-switching flows, clear cookies and storage in `test.beforeEach` to prevent residual `NEXT_LOCALE` or auth cookies from causing unexpected 307 redirects:
     ```typescript
     test.beforeEach(async ({ context }) => {
       await context.clearCookies();
     });
     ```
3. **Zero Console Errors & Page Crashes**:
   - Every major route must be guarded by console error interception:
     ```typescript
     const consoleErrors: string[] = [];
     page.on("console", (msg) => {
       if (msg.type() === "error") consoleErrors.push(msg.text());
     });
     page.on("pageerror", (err) => consoleErrors.push(err.message));
     // Assert at end of test:
     expect(consoleErrors).toEqual([]);
     ```

---

## 4. Iron Law IV: 4-Tier Automated Test Pyramid & Local Gate (四层测试金字塔与门禁)

```
                       ▲
                      / \
                     /   \   Tier 4: Playwright E2E User Journeys (297 scenarios)
                    /-----\  ----------------------------------------------------
                   /       \  Tier 3: Isolated Integration & API Tests (D1 SQLite, Cron)
                  /---------\ ----------------------------------------------------
                 /           \ Tier 2: Happy DOM Component & Form Interaction Tests
                /-------------\---------------------------------------------------
               /               \ Tier 1: Pure Domain Unit Tests (State Machines, Pricing)
              /─────────────────\
```

### 4.1 Test Pyramid Matrix

| Tier | Directory | Runner | Focus |
| :--- | :--- | :--- | :--- |
| **Tier 1 (Domain)** | `tests/unit/domain/` | `bun test` | State machines, pricing math, volume tiers, pure business rules. |
| **Tier 2 (Component)** | `tests/component/` | `bun test` (Happy DOM) | Interactive form controls, select fields, total calculations. |
| **Tier 3 (Integration)** | `tests/integration/` | `bun test` (D1 In-Memory) | API route RBAC, D1 SQLite transactions, Feishu sync, webhooks. |
| **Tier 4 (E2E)** | `tests/e2e/` | `bunx playwright test` | Multi-lingual navigation, multi-role portal workflows, WCAG a11y. |

### 4.2 Local Pre-Push Quality Gate
To conserve private repository GitHub Actions quotas and provide instant developer feedback:
- Heavy testing is enforced locally via `.husky/pre-push` running `bun run pre-push` (`scripts/ci/pre-push-gate.ts`).
- Pre-push gate verifies all 6 phases:
  1. `bun run check` (Oxlint & Vinext static compatibility)
  2. `bun run db:local:init` (D1 SQLite schema initialization)
  3. `bun test tests/unit tests/component tests/integration` (760+ tests, 0 failures)
  4. `bun run audit:w3c` (W3C HTML5, Web Manifest, and WCAG accessibility standards)
  5. `bun run test:e2e` (297 Playwright browser journeys)
  6. `bun run audit:lighthouse` (Google Lighthouse 100/100 audit matrix across all core routes)

---

## 5. Iron Law V: Single Source of Truth & Zero Dual Definitions (单一事实来源与严禁双重定义/状态)

### 5.1 No Dual Definitions (严禁双重类型与接口定义)
1. **Canonical Schema Definition**:
   - All TypeScript types, interfaces, Zod schemas, status enums, and database models must have **exactly ONE canonical definition site** (in `lib/`, `types/`, or server schema).
   - **Strictly Forbidden 🚫**: Declaring duplicate interfaces or shadow types in component files, page files, or API route wrappers.
   - **Canonical Practice ✅**: Always import and reuse the single canonical type:
     ```typescript
     // ✅ Import from canonical domain module
     import { type Vehicle, type VehicleModel, type SellableModel } from "@/lib/types";
     import { type InquiryStatus, canTransitionInquiryStatus } from "@/lib/inquiry-workflow";
     ```

### 5.2 No Dual State / No Split State (严禁双重/分裂状态与派生割裂)
1. **Single Source of Truth for Data Hierarchies**:
   - In hierarchical views (e.g. Model Level 1 -> Variant/Trim Level 2 -> Color/Location Level 3), all levels **MUST derive strictly and deterministically from the exact same underlying raw data array** (`vehicles: Vehicle[]`).
   - Never re-query or use divergent filtering/heuristic algorithms between parent headers and expanded detail children.
2. **Mathematical Consistency by Construction**:
   - Summary statistics (e.g. card header `stockQuantity`, `priceRange`, or variant counts) must be calculated directly from the child collection:
     $$\text{Header Units} \equiv \sum_{i} \text{Variant}_i.\text{stockQuantity} \equiv \sum_{i,j} \text{Color}_{i,j}.\text{quantity}$$
   - Any UI state that allows the header to display a count differing from the sum of its expanded child rows is a **Tier-1 critical defect**.

### 5.3 Anti-Patterns vs. Canonical Practices

| Anti-Pattern (Strictly Forbidden 🚫) | Canonical Practice (Mandatory ✅) |
| :--- | :--- |
| Writing a custom regex/filter in the UI component to find child vehicles, different from the model aggregator | Passing the aggregated `item.vehicles` array directly to child breakdown functions (`buildVehicleResourceVariants(item.vehicles)`) |
| Defining `interface User` in `app/portal/page.tsx` and another `interface PortalUser` in `server/api/portal.ts` | Defining `PortalUser` in pure shared domain types and importing it across frontend and backend |
| Duplicating status enum strings in client select options without importing from `lib/*-workflow.ts` | Importing status lists from the domain workflow (`INQUIRY_STATUSES`, `ORDER_STATUSES`) |
| Deriving summary totals in one place and detail lists in another with different filtering conditions | Deriving filtered sub-arrays once (`effectiveRawVehicles`), then calculating both summary metrics and detail variants from it |

