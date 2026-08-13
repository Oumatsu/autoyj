import { describe, expect, test } from "bun:test";
import { calculateQuotationItem } from "../../../lib/quotation-pricing";

describe("Quotation Pricing Domain", () => {
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
    expect(res.unitPrice).toBe(20000 + 500 + 1500 + 200);
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
    expect(res.totalDiscountPct).toBe(0.08);
    expect(res.discountedExw).toBe(18400);
    expect(res.totalAmount).toBe(368000);
  });

  test("throws error on zero or negative inputs", () => {
    expect(() => calculateQuotationItem({ baseExwUsd: 0, quantity: 1, tradeTerm: "FOB" })).toThrow();
    expect(() => calculateQuotationItem({ baseExwUsd: 20000, quantity: 0, tradeTerm: "FOB" })).toThrow();
  });
});
