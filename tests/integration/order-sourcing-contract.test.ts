import { describe, expect, test } from "bun:test";

describe("Integration: Order Sourcing Contract & Payment Stage Verification", () => {
  type PaymentStage = "30% Deposit Pending" | "Deposit Confirmed" | "Vehicle Sourced" | "PDI Certified" | "Shipped" | "Completed";

  type OrderRecord = {
    orderId: string;
    vehicleModel: string;
    vinNumber?: string;
    totalAmountUsd: number;
    depositPaidUsd: number;
    paymentStage: PaymentStage;
    pdiReportUrl?: string;
  };

  function validateVinNumber(vin: string): boolean {
    const vinRegex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return vinRegex.test(vin);
  }

  function calculateOutstandingBalance(order: OrderRecord): number {
    return Math.max(0, order.totalAmountUsd - order.depositPaidUsd);
  }

  test("VIN number validation enforces standard 17-character alphanumeric format without I, O, Q", () => {
    expect(validateVinNumber("LZYB1234567890123")).toBe(true);
    expect(validateVinNumber("INVALID_VIN")).toBe(false);
    expect(validateVinNumber("LZYB123456789012I")).toBe(false); // 'I' is disallowed in VINs
  });

  test("Order payment stage calculates 70% balance accurately after 30% deposit", () => {
    const order: OrderRecord = {
      orderId: "ORD-2026-001",
      vehicleModel: "BYD Seagull 2025",
      totalAmountUsd: 15000,
      depositPaidUsd: 4500, // 30%
      paymentStage: "Deposit Confirmed",
    };

    const balance = calculateOutstandingBalance(order);
    expect(balance).toBe(10500); // 70%
  });
});
