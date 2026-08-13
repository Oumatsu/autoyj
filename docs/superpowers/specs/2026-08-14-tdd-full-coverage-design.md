# TDD Full-Coverage Design Spec — autoyj

**Date**: 2026-08-14
**Status**: Approved
**Scope**: All modules — Unit, Component, Integration, E2E layers
**Target Coverage**: 87%+ (from current ~62%)

---

## 1. Architecture: Four-Layer Test Pyramid

We adopt a domain-contract-driven TDD approach organised into four strict layers.

```
tests/
├── setup.ts
├── unit/
│   ├── domain/       # Inquiry/Quote state machines, order lifecycle
│   └── utils/        # Helpers, session client, locale redirect
├── component/
│   └── portal/       # Inquiry picker, quote composer, orders panel
├── integration/
│   └── api/          # Every HTTP endpoint: request → response → DB state
└── e2e/
    └── journeys/     # Customer → Sales → Draft Order full flow
```

| Layer | Speed target | CI trigger |
|---|---|---|
| Unit | < 15 s | git commit |
| Component | < 20 s | git commit |
| Integration | < 45 s | git push |
| E2E | < 5 min | Before CF deploy |

---

## 2. Full-Module Domain Coverage Map

### 2.1 Inquiry & Quotation Domain

**New Unit tests** — `tests/unit/domain/`
- `inquiry-status-machine-full.test.ts`: exhaustive enumeration of every legal and illegal status transition pair. Every transition in `statusTransitions` map must have a positive test; every missing edge must have a negative test.
- `quote-price-calculation.test.ts`: FOB unit-price rounding, CIF accumulation, discount tiers.
- `order-lifecycle-transitions.test.ts`: Draft → Confirmed → Deposit Paid → In Production → Shipped → Delivered, plus invalid reverse transitions.

**Expand existing unit tests**
- `inquiry-workflow.test.ts`: add Closed → New Inquiry (reopen), all illegal pairs exhaustively.
- `quotation-creation-permissions.test.ts`: add finance, sourcing cross-boundary assertions.

**New Component tests** — `tests/component/portal/`
- `inquiry-vehicle-picker.test.tsx`: three-level cascade onChange — selecting model resets variant and color; selecting color emits vehicleId.
- `quote-composer-form.test.tsx`: submit with empty price shows validation error; valid price calls API and opens preview dialog.

**New Integration tests** — `tests/integration/api/`
- `inquiry-status-patch-api.test.ts`: illegal transition (New → Accepted) returns HTTP 400; valid transition persists inquiry_status_history row; non-sales role returns 403.
- `quote-create-api.test.ts`: valid payload creates quote row and returns quoteNo; non-sales role returns 403; missing inquiryNo returns 400.
- `quote-counter-accept-api.test.ts`: counter-offer increments version; accept changes inquiry status to Accepted and auto-creates orders row with status = 'Draft'.
- `inquiry-notes-api.test.ts`: internal note not visible to customer role; public note visible to both.

### 2.2 Vehicle Models & Inventory Domain

**New Integration tests** — `tests/integration/api/`
- `vehicle-update-api.test.ts`: admin can update, customer gets 403, malformed body gets 400.
- `vehicle-models-api.test.ts`: GET /api/portal/vehicle-models returns expected JSON shape.

### 2.3 Orders, Payments & Logistics Domain

**New Component tests** — `tests/component/portal/`
- `admin-orders-panel.test.tsx`: renders order list; empty state renders "No orders" text.
- `admin-payments-panel.test.tsx`: renders payment status badge correctly.
- `admin-logistics-panel.test.tsx`: renders logistics tracking entries in chronological order.

### 2.4 Authentication & RBAC Domain

**New Unit tests** — `tests/unit/utils/`
- `portal-session-client.test.ts`: getPortalSession() returns null when cookie absent; returns parsed session when valid cookie present.
- `locale-redirect.test.ts`: redirects / to /en; accepts zh, am; rejects unknown locale.

**New Integration test** — `tests/integration/api/`
- `session-logout-api.test.ts`: DELETE /api/portal/session clears session cookie; subsequent GET returns 401.

### 2.5 i18n & Tolgee Localisation Domain

Existing coverage: 27 test files — comprehensive. No new test files required.

### 2.6 Feishu Sync Infrastructure

**New Integration test** — `tests/integration/`
- `feishu-sync-full.test.ts`: mock Feishu API HTTP responses; assert D1 upsert SQL called with correct parameters; assert no data loss on partial failure.

### 2.7 Utility Helpers (Zero-Gap Closure)

**New Unit tests** — `tests/unit/utils/`
- `utils-cn.test.ts`: cn("a", "b") → "a b"; cn("a", undefined, "b") → "a b".
- `constants.test.ts`: assert key enum values are stable strings.

---

## 3. TDD Execution Workflow

### Red-Green-Refactor Loop

```
🔴 Red    →  bun run tdd:watch          (write failing test first)
🟢 Green  →  write minimum implementation to pass
🔵 Refactor→ bun run test               (all 621+ tests still green)
```

### New package.json Scripts

```json
"tdd":              "bun test --watch tests/unit tests/component",
"tdd:domain":       "bun test --watch tests/unit/domain",
"tdd:integration":  "bun test --watch tests/integration",
"test:coverage":    "bun test --coverage tests/unit tests/component tests/integration",
"test:cov:check":   "bun run test:coverage && bun run scripts/tdd/check-coverage.ts"
```

### Updated bunfig.toml

```toml
[test]
preload = ["./tests/setup.ts"]
coverageThreshold = { line = 85, function = 80, statement = 85 }
coverageReporter = ["text", "json"]
```

---

## 4. Three-Gate CI Enforcement

### Gate 1 — Git Pre-commit (Husky)

Script: `scripts/tdd/check-test-pairing.ts`

Logic:
1. Read git diff --staged to get modified .ts/.tsx source files.
2. For each file under lib/ or server/api/, check whether a corresponding test file exists.
3. Exit code 1 if no test file found — commit is blocked.

### Gate 2 — Local Coverage Script

Script: `scripts/tdd/check-coverage.ts`

Thresholds:
- `lib/` → 85% statements, 85% branches
- `server/api/` → 80% statements, 75% branches
- `server/inquiries/` → 90% statements, 85% branches

### Gate 3 — Cloudflare CI Build Command

```json
"build:cloudflare": "bun run test:cov:check && BUILD_TARGET=cloudflare vinext build"
```

Coverage failure → check-coverage.ts exits 1 → build aborted → deployment blocked.

---

## 5. Precise New File List (22 files total)

### Test Files (17 new)

```
tests/unit/domain/
  inquiry-status-machine-full.test.ts
  quote-price-calculation.test.ts
  order-lifecycle-transitions.test.ts

tests/unit/utils/
  locale-redirect.test.ts
  portal-session-client.test.ts
  constants.test.ts
  utils-cn.test.ts

tests/integration/api/
  session-logout-api.test.ts
  vehicle-update-api.test.ts
  vehicle-models-api.test.ts
  inquiry-status-patch-api.test.ts        ← critical
  inquiry-notes-api.test.ts
  quote-create-api.test.ts                ← critical
  quote-counter-accept-api.test.ts        ← critical
  inquiry-content-moderation-api.test.ts

tests/integration/
  feishu-sync-full.test.ts

tests/component/portal/
  inquiry-vehicle-picker.test.tsx
  quote-composer-form.test.tsx
  admin-orders-panel.test.tsx
  admin-payments-panel.test.tsx
  admin-logistics-panel.test.tsx
```

### Infrastructure Scripts (5 new)

```
scripts/tdd/
  check-coverage.ts
  check-test-pairing.ts

.husky/
  pre-commit
```

---

## 6. Coverage Projection

| Metric | Current | After |
|---|---|---|
| Total test files | 64 | 86 |
| Statement coverage (est.) | ~62% | ~87% |
| API endpoints with integration tests | 14/27 | 27/27 |
| CI coverage gate | none | 85% threshold |
| Pre-commit test-pairing guard | none | Husky hook |

---

## 7. Implementation Order

1. Infrastructure: bunfig.toml + check-coverage.ts + Husky hook
2. Critical API gaps: quote-create, quote-counter-accept, inquiry-status-patch
3. Zero-coverage lib files: locale-redirect, portal-session-client, constants, utils-cn
4. Component interaction tests: vehicle picker, quote composer
5. Fulfilment panels: orders, payments, logistics
6. Feishu sync full integration test
7. Update build:cloudflare to include test:cov:check gate
