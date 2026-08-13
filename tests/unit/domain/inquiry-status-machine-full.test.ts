import { describe, expect, test } from "bun:test";
import { canTransitionInquiryStatus, type InquiryStatus } from "../../../lib/inquiry-workflow";

const ALL_STATUSES: InquiryStatus[] = [
  "New Inquiry",
  "Quoted",
  "Negotiating",
  "Accepted",
  "Closed",
];

describe("Inquiry Status Machine Exhaustive Transitions", () => {
  // Legal transitions:
  // New Inquiry -> Quoted, Closed
  // Quoted -> Negotiating, Accepted, Closed
  // Negotiating -> Quoted, Accepted, Closed
  // Accepted -> Closed
  // Closed -> New Inquiry (reopen)
  const LEGAL_PAIRS: Array<[InquiryStatus, InquiryStatus]> = [
    ["New Inquiry", "Quoted"],
    ["New Inquiry", "Closed"],
    ["Quoted", "Negotiating"],
    ["Quoted", "Accepted"],
    ["Quoted", "Closed"],
    ["Negotiating", "Quoted"],
    ["Negotiating", "Accepted"],
    ["Negotiating", "Closed"],
    ["Accepted", "Closed"],
    ["Closed", "New Inquiry"],
  ];

  test("all defined legal transitions return true", () => {
    for (const [from, to] of LEGAL_PAIRS) {
      expect(canTransitionInquiryStatus(from, to)).toBe(true);
    }
  });

  test("all undefined status transition pairs return false", () => {
    const legalSet = new Set(LEGAL_PAIRS.map(([f, t]) => `${f}->${t}`));
    for (const from of ALL_STATUSES) {
      for (const to of ALL_STATUSES) {
        if (!legalSet.has(`${from}->${to}`)) {
          expect(canTransitionInquiryStatus(from, to)).toBe(false);
        }
      }
    }
  });

  test("null or undefined status transitions return false", () => {
    expect(canTransitionInquiryStatus(null, "Quoted")).toBe(false);
    expect(canTransitionInquiryStatus("New Inquiry", null)).toBe(false);
    expect(canTransitionInquiryStatus("", "")).toBe(false);
  });
});
