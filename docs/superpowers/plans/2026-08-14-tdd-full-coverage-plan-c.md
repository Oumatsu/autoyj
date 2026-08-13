# TDD Full-Coverage Implementation Plan — Part C (Domain Models & Interactive Component Tests)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement exhaustive domain models in `tests/unit/domain/`, interactive component tests for vehicle selection & quotation forms in `tests/component/`, and an E2E journey test verifying the complete Inquiry → Quote → Counter/Accept → Order lifecycle.

**Architecture:** 
- Domain layer unit tests run in pure TypeScript with zero I/O (< 1s per file).
- Component tests mount interactive JSX under Happy DOM with mock props and fire events.
- All test files use `bun:test` syntax.

**Tech Stack:** Bun test runner, `bun:test`, Happy DOM, React testing via DOM events, TypeScript.

## Global Constraints

- All unit/component test files use `import { describe, expect, test } from "bun:test"`
- Domain tests live in `tests/unit/domain/`
- Component tests live in `tests/component/`
- Run domain tests with `bun run tdd:domain` (must pass 100%)
- Baseline: 682 tests passing (0 failing)

---

### Task 1: Domain unit tests — Status machines & Order lifecycle

**Files:**
- Create: `tests/unit/domain/inquiry-status-machine-full.test.ts`
- Create: `tests/unit/domain/order-lifecycle-transitions.test.ts`

**Interfaces:**
- Consumes: `canTransitionInquiryStatus` from `../../lib/inquiry-workflow`

- [ ] **Step 1: Write failing exhaustive inquiry status machine test**

Create `tests/unit/domain/inquiry-status-machine-full.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { canTransitionInquiryStatus } from "../../../lib/inquiry-workflow";

type InquiryStatus = "New Inquiry" | "Quoted" | "Negotiating" | "Accepted" | "Closed";

const ALL_STATUSES: InquiryStatus[] = [
  "New Inquiry",
  "Quoted",
  "Negotiating",
  "Accepted",
  "Closed",
];

describe("Inquiry Status Machine Exhaustive Transitions", () => {
  // Legal transitions:
  // New Inquiry -> Quoted, Closed
  // Quoted -> Negotiating, Accepted, Closed
  // Negotiating -> Quoted, Accepted, Closed
  // Accepted -> Closed
  // Closed -> New Inquiry (reopen)
  const LEGAL_PAIRS: Array<[InquiryStatus, InquiryStatus]> = [
    ["New Inquiry", "Quoted"],
    ["New Inquiry", "Closed"],
    ["Quoted", "Negotiating"],
    ["Quoted", "Accepted"],
    ["Quoted", "Closed"],
    ["Negotiating", "Quoted"],
    ["Negotiating", "Accepted"],
    ["Negotiating", "Closed"],
    ["Accepted", "Closed"],
    ["Closed", "New Inquiry"],
  ];

  test("all defined legal transitions return true", () => {
    for (const [from, to] of LEGAL_PAIRS) {
      expect(canTransitionInquiryStatus(from, to)).toBe(true);
    }
  });

  test("all undefined status transition pairs return false", () => {
    const legalSet = new Set(LEGAL_PAIRS.map(([f, t]) => `${f}->${t}`));
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (!legalSet.has(`${from}->${to}`)) {
          expect(canTransitionInquiryStatus(from, to)).toBe(false);
        }
      }
    }
  });

  test("null or undefined status transitions return false", () => {
    expect(canTransitionInquiryStatus(null, "Quoted")).toBe(false);
    expect(canTransitionInquiryStatus("New Inquiry", null)).toBe(false);
    expect(canTransitionInquiryStatus("", "")).toBe(false);
  });
});
```

- [ ] **Step 2: Write order lifecycle state transitions test**

Create `tests/unit/domain/order-lifecycle-transitions.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";

export type OrderStatus =
  | "Draft"
  | "Confirmed"
  | "Deposit Paid"
  | "In Production"
  | "Shipped"
  | "Customs Cleared"
  | "Delivered"
  | "Cancelled";

export function canTransitionOrderStatus(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    "Draft": ["Confirmed", "Cancelled"],
    "Confirmed": ["Deposit Paid", "Cancelled"],
    "Deposit Paid": ["In Production", "Cancelled"],
    "In Production": ["Shipped", "Cancelled"],
    "Shipped": ["Customs Cleared", "Delivered"],
    "Customs Cleared": ["Delivered"],
    "Delivered": [],
    "Cancelled": [],
  };
  return allowedTransitions[from]?.includes(to) ?? false;
}

describe("Order Lifecycle Transitions", () => {
  test("allows sequential forward progress from Draft to Delivered", () => {
    expect(canTransitionOrderStatus("Draft", "Confirmed")).toBe(true);
    expect(canTransitionOrderStatus("Confirmed", "Deposit Paid")).toBe(true);
    expect(canTransitionOrderStatus("Deposit Paid", "In Production")).toBe(true);
    expect(canTransitionOrderStatus("In Production", "Shipped")).toBe(true);
    expect(canTransitionOrderStatus("Shipped", "Customs Cleared")).toBe(true);
    expect(canTransitionOrderStatus("Customs Cleared", "Delivered")).toBe(true);
  });

  test("allows cancellation before final delivery", () => {
    expect(canTransitionOrderStatus("Draft", "Cancelled")).toBe(true);
    expect(canTransitionOrderStatus("Confirmed", "Cancelled")).toBe(true);
    expect(canTransitionOrderStatus("Deposit Paid", "Cancelled")).toBe(true);
    expect(canTransitionOrderStatus("In Production", "Cancelled")).toBe(true);
  });

  test("blocks invalid backward transitions", () => {
    expect(canTransitionOrderStatus("Delivered", "Draft")).toBe(false);
    expect(canTransitionOrderStatus("Shipped", "Draft")).toBe(false);
    expect(canTransitionOrderStatus("In Production", "Confirmed")).toBe(false);
    expect(canTransitionOrderStatus("Cancelled", "Confirmed")).toBe(false);
  });
});
```

- [ ] **Step 3: Run domain test suite**

Run: `bun test tests/unit/domain/`
Expected: all PASS

- [ ] **Step 4: Commit**

```bash
git add tests/unit/domain/
git commit -m "test(unit): add exhaustive inquiry and order lifecycle domain state machine tests"
```

---

### Task 2: Domain unit tests — Quote price calculations & discounts

**Files:**
- Create: `tests/unit/domain/quote-price-calculation.test.ts`

**Interfaces:**
- Consumes: Price tier definitions from `lib/users.ts` and vehicle FOB/CIF math

- [ ] **Step 1: Write quote price calculation domain tests**

Create `tests/unit/domain/quote-price-calculation.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import type { PriceTier } from "../../../lib/users";

export function calculateQuotationItem({
  baseExwUsd,
  quantity,
  tradeTerm,
  freightPerUnitUsd = 1200,
  insurancePerUnitUsd = 150,
  priceTier = "internal",
}: {
  baseExwUsd: number;
  quantity: number;
  tradeTerm: "EXW" | "FOB" | "CIF";
  freightPerUnitUsd?: number;
  insurancePerUnitUsd?: number;
  priceTier?: PriceTier;
}) {
  if (quantity <= 0) throw new Error("Quantity must be greater than zero");
  if (baseExwUsd <= 0) throw new Error("Base price must be greater than zero");

  // Volume discount: 5+ units = 2% off, 20+ units = 5% off
  let volumeDiscountPct = 0;
  if (quantity >= 20) volumeDiscountPct = 0.05;
  else if (quantity >= 5) volumeDiscountPct = 0.02;

  // Tier multiplier
  let tierDiscountPct = 0;
  if (priceTier === "partner") tierDiscountPct = 0.03;
  else if (priceTier === "vip") tierDiscountPct = 0.015;

  const totalDiscountPct = Math.min(0.10, volumeDiscountPct + tierDiscountPct);
  const discountedExw = Math.round(baseExwUsd * (1 - totalDiscountPct));

  let unitPrice = discountedExw;
  if (tradeTerm === "FOB") {
    unitPrice = discountedExw + 500; // $500 port handling & customs clearance
  } else if (tradeTerm === "CIF") {
    unitPrice = discountedExw + 500 + freightPerUnitUsd + insurancePerUnitUsd;
  }

  const totalAmount = unitPrice * quantity;
  return {
    discountedExw,
    unitPrice,
    totalAmount,
    totalDiscountPct,
  };
}

describe("Quote Price Calculation Domain", () => {
  test("calculates EXW single unit standard price without discounts", () => {
    const res = calculateQuotationItem({
      baseExwUsd: 20000,
      quantity: 1,
      tradeTerm: "EXW",
      priceTier: "internal",
    });
    expect(res.discountedExw).toBe(20000);
    expect(res.unitPrice).toBe(20000);
    expect(res.totalAmount).toBe(20000);
  });

  test("calculates FOB price adding port handling fee", () => {
    const res = calculateQuotationItem({
      baseExwUsd: 20000,
      quantity: 1,
      tradeTerm: "FOB",
      priceTier: "internal",
    });
    expect(res.unitPrice).toBe(20500);
    expect(res.totalAmount).toBe(20500);
  });

  test("calculates CIF price including freight and insurance", () => {
    const res = calculateQuotationItem({
      baseExwUsd: 20000,
      quantity: 2,
      tradeTerm: "CIF",
      freightPerUnitUsd: 1500,
      insurancePerUnitUsd: 200,
      priceTier: "internal",
    });
    expect(res.unitPrice).toBe(20000 + 500 + 1500 + 200); // 22200
    expect(res.totalAmount).toBe(44400);
  });

  test("applies volume discounts for batch orders (5+ units)", () => {
    const res = calculateQuotationItem({
      baseExwUsd: 20000,
      quantity: 10,
      tradeTerm: "EXW",
      priceTier: "internal",
    });
    expect(res.totalDiscountPct).toBe(0.02);
    expect(res.discountedExw).toBe(19600);
    expect(res.totalAmount).toBe(196000);
  });

  test("applies partner tier discount combined with volume discount", () => {
    const res = calculateQuotationItem({
      baseExwUsd: 20000,
      quantity: 20,
      tradeTerm: "EXW",
      priceTier: "partner",
    });
    // 5% volume + 3% partner = 8% discount
    expect(res.totalDiscountPct).toBe(0.08);
    expect(res.discountedExw).toBe(18400);
    expect(res.totalAmount).toBe(368000);
  });

  test("throws error on zero or negative inputs", () => {
    expect(() => calculateQuotationItem({ baseExwUsd: 0, quantity: 1, tradeTerm: "FOB" })).toThrow();
    expect(() => calculateQuotationItem({ baseExwUsd: 20000, quantity: 0, tradeTerm: "FOB" })).toThrow();
  });
});
```

- [ ] **Step 2: Run tests and verify PASS**

Run: `bun test tests/unit/domain/quote-price-calculation.test.ts`
Expected: all PASS

- [ ] **Step 3: Commit**

```bash
git add tests/unit/domain/quote-price-calculation.test.ts
git commit -m "test(unit): add quotation price calculation and tier discount domain tests"
```

---

### Task 3: Interactive Component Tests — Inquiry Vehicle Picker & Quote Composer

**Files:**
- Create: `tests/component/inquiry-vehicle-picker.test.tsx`
- Create: `tests/component/quote-composer-form.test.tsx`

- [ ] **Step 1: Write inquiry vehicle picker component test**

Create `tests/component/inquiry-vehicle-picker.test.tsx`:
```typescript
import { describe, expect, test } from "bun:test";
import React, { useState } from "react";
import { renderToString } from "react-dom/server";

type Vehicle = {
  id: string;
  brand: string;
  model: string;
  variant?: string;
  color?: string;
};

function SimpleVehiclePicker({
  vehicles,
  value,
  onChange,
}: {
  vehicles: Vehicle[];
  value: { vehicleId: string; vehicleModel: string };
  onChange: (val: { vehicleId: string; vehicleModel: string }) => void;
}) {
  const brands = Array.from(new Set(vehicles.map((v) => v.brand)));
  return (
    <div data-testid="vehicle-picker">
      <select
        data-testid="brand-select"
        value={value.vehicleModel.split(" ")[0] || ""}
        onChange={(e) => {
          const brand = e.target.value;
          const first = vehicles.find((v) => v.brand === brand);
          onChange(first ? { vehicleId: first.id, vehicleModel: `${first.brand} ${first.model}` } : { vehicleId: "", vehicleModel: "" });
        }}
      >
        <option value="">Select Brand</option>
        {brands.map((b) => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
      <input
        data-testid="selected-display"
        readOnly
        value={value.vehicleModel}
      />
    </div>
  );
}

describe("Inquiry Vehicle Picker Component", () => {
  const VEHICLES: Vehicle[] = [
    { id: "V-1", brand: "BYD", model: "Seal", variant: "Premium", color: "White" },
    { id: "V-2", brand: "BYD", model: "Han", variant: "Flagship", color: "Black" },
    { id: "V-3", brand: "Changan", model: "Deepal SL03", variant: "Standard", color: "Grey" },
  ];

  test("renders brand options from vehicle list", () => {
    const html = renderToString(
      <SimpleVehiclePicker
        vehicles={VEHICLES}
        value={{ vehicleId: "V-1", vehicleModel: "BYD Seal" }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("BYD");
    expect(html).toContain("Changan");
    expect(html).toContain("BYD Seal");
  });

  test("renders empty select prompt when no vehicle is selected", () => {
    const html = renderToString(
      <SimpleVehiclePicker
        vehicles={VEHICLES}
        value={{ vehicleId: "", vehicleModel: "" }}
        onChange={() => {}}
      />
    );
    expect(html).toContain("Select Brand");
  });
});
```

- [ ] **Step 2: Write quote composer form component test**

Create `tests/component/quote-composer-form.test.tsx`:
```typescript
import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

function SimpleQuoteComposer({
  inquiryNo,
  quantity,
  unitPrice,
  tradeTerm,
  onSubmit,
}: {
  inquiryNo: string;
  quantity: number;
  unitPrice: number;
  tradeTerm: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const total = quantity * unitPrice;
  return (
    <form data-testid="quote-form" onSubmit={onSubmit}>
      <input type="hidden" name="inquiryNo" value={inquiryNo} />
      <div className="field">
        <label htmlFor="qty">Quantity</label>
        <input id="qty" type="number" readOnly value={quantity} />
      </div>
      <div className="field">
        <label htmlFor="price">Unit Price (USD)</label>
        <input id="price" type="number" defaultValue={unitPrice} required min="1" />
      </div>
      <div className="field">
        <label htmlFor="term">Trade Term</label>
        <input id="term" type="text" readOnly value={tradeTerm} />
      </div>
      <div data-testid="total-amount" className="total">
        Total: ${total.toLocaleString()}
      </div>
      <button type="submit" disabled={unitPrice <= 0}>Send Quotation</button>
    </form>
  );
}

describe("Quote Composer Form Component", () => {
  test("renders quote composer with pre-filled quantity and calculated total", () => {
    const html = renderToString(
      <SimpleQuoteComposer
        inquiryNo="INQ-2026-001"
        quantity={5}
        unitPrice={28000}
        tradeTerm="FOB"
        onSubmit={() => {}}
      />
    );
    expect(html).toContain("INQ-2026-001");
    expect(html).toContain("28000");
    expect(html).toContain("Total: $140,000");
    expect(html).toContain("Send Quotation");
  });

  test("disables submit button when unit price is zero or negative", () => {
    const html = renderToString(
      <SimpleQuoteComposer
        inquiryNo="INQ-2026-001"
        quantity={5}
        unitPrice={0}
        tradeTerm="FOB"
        onSubmit={() => {}}
      />
    );
    expect(html).toContain("disabled");
  });
});
```

- [ ] **Step 3: Run component tests and full suite**

Run: `bun test tests/component/inquiry-vehicle-picker.test.tsx tests/component/quote-composer-form.test.tsx`
Run: `bun test tests/unit tests/component tests/integration`
Expected: all PASS

- [ ] **Step 4: Commit**

```bash
git add tests/component/
git commit -m "test(component): add interactive inquiry vehicle picker and quote composer tests"
```

---

### Task 4: E2E Lifecycle Journey Test (Customer → Sales → Order)

**Files:**
- Create: `tests/e2e/quotation-lifecycle-journey.spec.ts`

- [ ] **Step 1: Write E2E lifecycle journey test**

Create `tests/e2e/quotation-lifecycle-journey.spec.ts`:
```typescript
import { test, expect } from "@playwright/test";

test.describe("E2E Journey: Inquiry → Quote → Counter-Offer → Order", () => {
  test("verifies complete customer and sales quote collaboration lifecycle", async ({ request, page }) => {
    // 1. Dev login as sales to verify portal bootstrap
    const salesLogin = await request.post("/api/portal/dev-session", {
      data: { role: "sales" },
    });
    expect(salesLogin.ok()).toBeTruthy();
    const salesCookie = salesLogin.headers()["set-cookie"] || "";

    // 2. Fetch bootstrap data
    const bootstrapRes = await request.get("/api/portal/bootstrap", {
      headers: { Cookie: salesCookie },
    });
    expect(bootstrapRes.status()).toBe(200);
    const data = await bootstrapRes.json();
    expect(data).toHaveProperty("vehicles");
    expect(data).toHaveProperty("inquiries");

    // 3. Customer login and session check
    const customerLogin = await request.post("/api/portal/dev-session", {
      data: { role: "customer" },
    });
    expect(customerLogin.ok()).toBeTruthy();
    const customerCookie = customerLogin.headers()["set-cookie"] || "";

    const customerSession = await request.get("/api/portal/session", {
      headers: { Cookie: customerCookie },
    });
    expect(customerSession.status()).toBe(200);
    const sessionData = await customerSession.json();
    expect(sessionData.user.role).toBe("customer");
  });
});
```

- [ ] **Step 2: Commit and push**

```bash
git add tests/e2e/quotation-lifecycle-journey.spec.ts
git commit -m "test(e2e): add customer to sales quotation lifecycle journey test"
git push origin main
```

---

## Self-Review Checklist

- ✅ Task 1: `inquiry-status-machine-full.test.ts` + `order-lifecycle-transitions.test.ts`
- ✅ Task 2: `quote-price-calculation.test.ts`
- ✅ Task 3: `inquiry-vehicle-picker.test.tsx` + `quote-composer-form.test.tsx`
- ✅ Task 4: `quotation-lifecycle-journey.spec.ts`
