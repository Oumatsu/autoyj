import { describe, expect, test } from "bun:test";
import { findLocalUser } from "../../lib/users";

describe("Unit: Local User Authentication & Authorization Store", () => {
  test("findLocalUser matches exact email with matching access code", () => {
    const user = findLocalUser("partner@example.com", "partner-demo-2026");
    expect(user).not.toBeNull();
    expect(user?.role).toBe("partner");
    expect(user?.priceTier).toBe("partner");

    const partnerAebissa = findLocalUser("AebissaG@kairosaddis.com", "Aebissa123");
    expect(partnerAebissa).not.toBeNull();
    expect(partnerAebissa?.role).toBe("partner");
    expect(partnerAebissa?.company).toBe("Kairos Addis");

    const partnerWagari = findLocalUser("WagariG@kairosaddis.com", "WagariG123");
    expect(partnerWagari).not.toBeNull();
    expect(partnerWagari?.role).toBe("partner");
    expect(partnerWagari?.company).toBe("Kairos Addis");
  });

  test("findLocalUser handles email case insensitivity and whitespace trimming", () => {
    const user = findLocalUser("  CUSTOMER@EXAMPLE.COM  ", "customer-demo-2026");
    expect(user).not.toBeNull();
    expect(user?.role).toBe("customer");
  });

  test("findLocalUser supports role shortcut aliases (admin, sales, partner, customer)", () => {
    const admin = findLocalUser("admin", "admin-demo-2026");
    expect(admin?.role).toBe("admin");

    const sales = findLocalUser("sales", "sales-demo-2026");
    expect(sales?.role).toBe("sales");
  });

  test("findLocalUser rejects invalid password access code", () => {
    const invalid = findLocalUser("partner@example.com", "wrong-pass-123");
    expect(invalid).toBeNull();
  });
});
