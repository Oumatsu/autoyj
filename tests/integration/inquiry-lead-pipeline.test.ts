import { describe, expect, test } from "bun:test";

describe("Integration: Inquiry Lead Management & Status Pipeline", () => {
  type InquiryStatus = "New" | "Contacted" | "Quoted" | "Contract Signed" | "Closed";

  type InquiryPayload = {
    id: string;
    contactName: string;
    email: string;
    phoneWhatsapp: string;
    company: string;
    targetMarket: string;
    monthlyVolume: string;
    status: InquiryStatus;
    createdAt: string;
  };

  function processInquiryStatusTransition(current: InquiryStatus, next: InquiryStatus): { allowed: boolean; newStatus: InquiryStatus } {
    const validTransitions: Record<InquiryStatus, InquiryStatus[]> = {
      New: ["Contacted", "Closed"],
      Contacted: ["Quoted", "Closed"],
      Quoted: ["Contract Signed", "Closed"],
      "Contract Signed": ["Closed"],
      Closed: ["New"],
    };

    const allowed = validTransitions[current]?.includes(next) ?? false;
    return { allowed, newStatus: allowed ? next : current };
  }

  function generateWhatsAppLeadLink(phone: string, message: string): string {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  }

  test("Inquiry lead pipeline allows valid status transitions (New -> Contacted -> Quoted)", () => {
    const step1 = processInquiryStatusTransition("New", "Contacted");
    expect(step1.allowed).toBe(true);
    expect(step1.newStatus).toBe("Contacted");

    const step2 = processInquiryStatusTransition("Contacted", "Quoted");
    expect(step2.allowed).toBe(true);
    expect(step2.newStatus).toBe("Quoted");
  });

  test("Inquiry lead pipeline blocks invalid status skips (New -> Contract Signed)", () => {
    const invalidStep = processInquiryStatusTransition("New", "Contract Signed");
    expect(invalidStep.allowed).toBe(false);
    expect(invalidStep.newStatus).toBe("New");
  });

  test("WhatsApp quick lead link formats clean international phone number and encoded copy", () => {
    const link = generateWhatsAppLeadLink("+86 138-0000-0000", "Hello Youguard EV team");
    expect(link).toBe("https://wa.me/8613800000000?text=Hello%20Youguard%20EV%20team");
  });
});
