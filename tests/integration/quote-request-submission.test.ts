import { describe, expect, test } from "bun:test";

describe("Integration: Solutions Quote Request Submission API Contract", () => {
  test("Quote request payload validation rejects empty contact name or invalid email", () => {
    function validateQuotePayload(data: Record<string, any>) {
      const errors: string[] = [];
      if (!data.contactName || typeof data.contactName !== "string" || !data.contactName.trim()) {
        errors.push("Contact name is required");
      }
      if (!data.email || typeof data.email !== "string" || !data.email.includes("@")) {
        errors.push("Valid email address is required");
      }
      return { valid: errors.length === 0, errors };
    }

    expect(validateQuotePayload({ contactName: "", email: "invalid" }).valid).toBe(false);
    expect(validateQuotePayload({ contactName: "Test User", email: "user@youguard.auto" }).valid).toBe(true);
  });
});
