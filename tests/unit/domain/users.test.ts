import { describe, expect, test } from "bun:test";
import { defaultPriceTierForRole, localUserStore, findLocalUser } from "../../../lib/users";
import type { PortalRole } from "../../../lib/users";

describe("User Account Types & Price Tier Domain Logic", () => {
  test("derives internal price tier for admin and sales roles", () => {
    expect(defaultPriceTierForRole("admin")).toBe("internal");
    expect(defaultPriceTierForRole("sales")).toBe("internal");
    expect(defaultPriceTierForRole("sourcing")).toBe("internal");
    expect(defaultPriceTierForRole("finance")).toBe("internal");
  });

  test("derives partner price tier for partner role", () => {
    expect(defaultPriceTierForRole("partner")).toBe("partner");
  });

  test("derives default tier for customer role", () => {
    expect(defaultPriceTierForRole("customer")).toBe("partner");
  });

  test("localUserStore contains seed users with valid roles and price tiers", () => {
    expect(localUserStore.length).toBeGreaterThan(0);
    for (const user of localUserStore) {
      expect(["admin", "sales", "partner", "customer"]).toContain(user.role);
      expect(["internal", "partner", "vip", "hidden"]).toContain(user.priceTier);
    }
  });

  test("findLocalUser resolves user by email and access code", () => {
    const admin = findLocalUser("admin@local.test", "admin-demo-2026");
    expect(admin).not.toBeNull();
    expect(admin?.role).toBe("admin");
    expect(admin?.priceTier).toBe("internal");

    const invalid = findLocalUser("admin@local.test", "wrong-code");
    expect(invalid).toBeNull();
  });
});
