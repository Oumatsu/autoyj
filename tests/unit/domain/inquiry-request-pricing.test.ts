import { expect, test } from "bun:test";
import { calculateInquiryRequestPreview, resolveInquiryRequestFob } from "../../../lib/inquiry-request-pricing";

test("selects only the session role's FOB price for an inquiry request", () => {
  expect(resolveInquiryRequestFob("partner", { partnerFobUsd: 23000, customerFobUsd: 24600 })).toBe(23000);
  expect(resolveInquiryRequestFob("customer", { partnerFobUsd: 23000, customerFobUsd: 24600 })).toBe(24600);
});

test("does not fall back to another external role's price", () => {
  expect(resolveInquiryRequestFob("customer", { partnerFobUsd: 23000 })).toBeNull();
  expect(resolveInquiryRequestFob("partner", { customerFobUsd: 24600 })).toBeNull();
});

test("calculates the real-time FOB total only from a valid selected unit price", () => {
  expect(calculateInquiryRequestPreview(23000, 4)).toEqual({ unitUsd: 23000, totalUsd: 92000 });
  expect(calculateInquiryRequestPreview(null, 4)).toBeNull();
  expect(calculateInquiryRequestPreview(23000, 0)).toBeNull();
});
