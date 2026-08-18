# Engineering Standards & AI-Native Iron Laws

This document outlines the canonical engineering principles, testing methodologies, and automation rules enforced in the **AutoYJ / Youguard** codebase. All human engineers and AI coding agents must strictly adhere to these iron laws.

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
