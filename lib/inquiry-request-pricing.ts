import type { PortalRole } from "./users";

export type InquiryRequestExternalFobPrices = {
  partnerFobUsd?: number | null;
  customerFobUsd?: number | null;
};

export type InquiryRequestPricePreview = { unitUsd: number; totalUsd: number };

export function calculateInquiryRequestPreview(unitUsd: number | null | undefined, quantity: number): InquiryRequestPricePreview | null {
  if (typeof unitUsd !== "number" || !Number.isFinite(unitUsd) || unitUsd <= 0 || !Number.isInteger(quantity) || quantity <= 0) return null;
  return { unitUsd, totalUsd: unitUsd * quantity };
}

export function resolveInquiryRequestFob(
  role: PortalRole,
  prices: InquiryRequestExternalFobPrices,
): number | null {
  const price = role === "partner"
    ? prices.partnerFobUsd
    : role === "customer"
      ? prices.customerFobUsd
      : null;
  return typeof price === "number" && Number.isFinite(price) && price > 0 ? price : null;
}
