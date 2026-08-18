import { describe, expect, test } from "bun:test";
import { canTransitionInquiryStatus, type InquiryStatus } from "../../../lib/inquiry-workflow";

const ALL_STATUSES: InquiryStatus[] = [
  "open",
  "closed",
];

describe("Inquiry Status Machine Exhaustive Transitions", () => {
  // Legal transitions: open <-> closed.
  const LEGAL_PAIRS: Array<[InquiryStatus, InquiryStatus]> = [
    ["open", "closed"],
    ["closed", "open"],
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
    expect(canTransitionInquiryStatus(null, "open")).toBe(false);
    expect(canTransitionInquiryStatus("open", null)).toBe(false);
    expect(canTransitionInquiryStatus("", "")).toBe(false);
  });

  test("rejects every retired status", () => {
    for (const retired of ["New Inquiry", "Quoted", "Negotiating", "Accepted", "Closed"]) {
      expect(canTransitionInquiryStatus("open", retired)).toBe(false);
      expect(canTransitionInquiryStatus(retired, "closed")).toBe(false);
    }
  });
});
