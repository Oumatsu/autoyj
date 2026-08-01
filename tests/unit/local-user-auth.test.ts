import { describe, expect, test } from "bun:test";
import { findLocalUser } from "../../lib/users";

describe("Unit: Local User Authentication & Authorization Store", () => {
  test("findLocalUser matches exact email with matching access code", () => {
    const user = findLocalUser("partner@example.com", "partner-demo-2026");
    expect(user).not.toBeNull();
    expect(user?.role).toBe("partner");
    expect(user?.priceTier).toBe("partner");
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
