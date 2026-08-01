import { describe, expect, test } from "bun:test";

describe("Unit: Price Tier Resolution & Export FOB Calculation Rules", () => {
  type UserRole = "admin" | "sales" | "partner" | "customer";
  type PriceTier = "internal" | "partner" | "vip" | "public";

  function resolveDisplayPrice(msrpUsd: number, priceTier: PriceTier, role?: UserRole) {
    if (role === "admin" || role === "sales" || priceTier === "internal") {
      const wholesaleCost = Math.round(msrpUsd * 0.85);
      return { visible: true, priceUsd: wholesaleCost, tierLabel: "Internal Sourcing Cost" };
    }
    if (priceTier === "partner") {
      const partnerCost = Math.round(msrpUsd * 0.90);
      return { visible: true, priceUsd: partnerCost, tierLabel: "Partner Wholesale Price" };
    }
    if (priceTier === "vip") {
      const vipPrice = Math.round(msrpUsd * 0.95);
      return { visible: true, priceUsd: vipPrice, tierLabel: "VIP Fleet Price" };
    }
    return { visible: false, priceUsd: msrpUsd, tierLabel: "MSRP (Request Quote)" };
  }

  function calculateFobEst(basePriceUsd: number, portFeeUsd = 800, pdiFeeUsd = 200) {
    return basePriceUsd + portFeeUsd + pdiFeeUsd;
  }

  test("Internal/Admin roles receive wholesale sourcing cost at 15% discount", () => {
    const res = resolveDisplayPrice(20000, "internal", "admin");
    expect(res.visible).toBe(true);
    expect(res.priceUsd).toBe(17000);
    expect(res.tierLabel).toBe("Internal Sourcing Cost");
  });

  test("Partner tier receives 10% wholesale discount", () => {
    const res = resolveDisplayPrice(20000, "partner");
    expect(res.visible).toBe(true);
    expect(res.priceUsd).toBe(18000);
    expect(res.tierLabel).toBe("Partner Wholesale Price");
  });

  test("Public/Unauthenticated users see MSRP request quote prompt", () => {
    const res = resolveDisplayPrice(20000, "public");
    expect(res.visible).toBe(false);
    expect(res.tierLabel).toBe("MSRP (Request Quote)");
  });

  test("FOB estimate adds port loading and 50-point PDI certification fees", () => {
    const totalFob = calculateFobEst(15000, 800, 200);
    expect(totalFob).toBe(16000);
  });
});
