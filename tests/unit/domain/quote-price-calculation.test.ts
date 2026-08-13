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
