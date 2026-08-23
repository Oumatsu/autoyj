import { describe, expect, test } from "bun:test";
import {
  AdminUserCreateSchema,
  DevSessionLoginSchema,
  InquiryCreateSchema,
  InquiryNoteCreateSchema,
  InquiryStatusUpdateSchema,
  QuotationCounterSchema,
  QuotationCreateSchema,
} from "../../../lib/schemas";

describe("Domain: Zod Runtime Schema Validation Suite", () => {
  test("DevSessionLoginSchema validates legal roles and emails", () => {
    const valid = DevSessionLoginSchema.safeParse({ role: "sales", email: "sales@youguard.net" });
    expect(valid.success).toBe(true);

    const invalidRole = DevSessionLoginSchema.safeParse({ role: "superhero" });
    expect(invalidRole.success).toBe(false);

    const invalidEmail = DevSessionLoginSchema.safeParse({ email: "not-an-email" });
    expect(invalidEmail.success).toBe(false);
  });

  test("InquiryCreateSchema applies defaults and rejects non-positive quantities", () => {
    const valid = InquiryCreateSchema.safeParse({
      vehicleModel: "BYD Yangwang U8",
      quantity: "3", // Coerces from string
      tradeTerm: "CIF",
    });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.quantity).toBe(3);
      expect(valid.data.trim).toBe("Standard");
    }

    const invalidQuantity = InquiryCreateSchema.safeParse({
      vehicleModel: "BYD Yangwang U8",
      quantity: 0,
    });
    expect(invalidQuantity.success).toBe(false);
  });

  test("InquiryNoteCreateSchema trims whitespace and rejects empty strings", () => {
    const valid = InquiryNoteCreateSchema.safeParse({ body: "  Price confirmed by port.  ", isPublic: true });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.body).toBe("Price confirmed by port.");
    }

    const empty = InquiryNoteCreateSchema.safeParse({ body: "   " });
    expect(empty.success).toBe(false);
  });

  test("InquiryStatusUpdateSchema only allows open and closed statuses", () => {
    expect(InquiryStatusUpdateSchema.safeParse({ status: "open" }).success).toBe(true);
    expect(InquiryStatusUpdateSchema.safeParse({ status: "closed" }).success).toBe(true);
    expect(InquiryStatusUpdateSchema.safeParse({ status: "pending_review" }).success).toBe(false);
    expect(InquiryStatusUpdateSchema.safeParse({ status: "archived" }).success).toBe(false);
  });

  test("QuotationCreateSchema validates mandatory pricing fields and trade terms", () => {
    const valid = QuotationCreateSchema.safeParse({
      inquiryNo: "INQ-2026-001",
      vehicleModel: "Zeekr 001 FR",
      quantity: 2,
      unitPrice: 42000,
      tradeTerm: "FOB",
    });
    expect(valid.success).toBe(true);

    const zeroPrice = QuotationCreateSchema.safeParse({
      inquiryNo: "INQ-2026-001",
      vehicleModel: "Zeekr 001 FR",
      quantity: 2,
      unitPrice: 0,
    });
    expect(zeroPrice.success).toBe(false);
  });

  test("QuotationCounterSchema requires either a counterPrice or a counter message", () => {
    expect(QuotationCounterSchema.safeParse({ counterPrice: 38000 }).success).toBe(true);
    expect(QuotationCounterSchema.safeParse({ message: "Can we get 5% discount?" }).success).toBe(true);
    expect(QuotationCounterSchema.safeParse({ counterPrice: 38000, message: "Target budget" }).success).toBe(true);
    expect(QuotationCounterSchema.safeParse({}).success).toBe(false);
    expect(QuotationCounterSchema.safeParse({ message: "   " }).success).toBe(false);
  });

  test("AdminUserCreateSchema enforces valid email and role", () => {
    const valid = AdminUserCreateSchema.safeParse({
      name: "Alice Partner",
      email: "alice@partner.et",
      role: "partner",
    });
    expect(valid.success).toBe(true);

    const invalid = AdminUserCreateSchema.safeParse({
      name: "Alice Partner",
      email: "invalid-mail",
      role: "guest",
    });
    expect(invalid.success).toBe(false);
  });
});
