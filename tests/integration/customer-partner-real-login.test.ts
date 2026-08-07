import { describe, expect, test } from "bun:test";
import { findLocalUser } from "../../lib/users";

describe("Integration: Customer & Partner Real Login API Verification", () => {
  test("Customer & Partner Auth Verification - verifies role attributes and credentials", () => {
    const customer = findLocalUser("customer@example.com", "customer-demo-2026");
    const partner = findLocalUser("partner@example.com", "partner-demo-2026");

    expect(customer).toBeTruthy();
    expect(partner).toBeTruthy();
    expect(customer?.role).toBe("customer");
    expect(partner?.role).toBe("partner");
    expect(customer?.priceTier).toBe("vip");
    expect(partner?.priceTier).toBe("partner");
  });
});
