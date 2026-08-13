import type { PriceTier } from "./users";

export type TradeTerm = "EXW" | "FOB" | "CIF";

export interface CalculateQuotationItemParams {
  baseExwUsd: number;
  quantity: number;
  tradeTerm: TradeTerm;
  freightPerUnitUsd?: number;
  insurancePerUnitUsd?: number;
  priceTier?: PriceTier;
}

export interface QuotationItemCalculationResult {
  discountedExw: number;
  unitPrice: number;
  totalAmount: number;
  totalDiscountPct: number;
}

export function calculateQuotationItem({
  baseExwUsd,
  quantity,
  tradeTerm,
  freightPerUnitUsd = 1200,
  insurancePerUnitUsd = 150,
  priceTier = "internal",
}: CalculateQuotationItemParams): QuotationItemCalculationResult {
  if (quantity <= 0) throw new Error("Quantity must be greater than zero");
  if (baseExwUsd <= 0) throw new Error("Base price must be greater than zero");

  // Volume discount: 5+ units = 2% off, 20+ units = 5% off
  let volumeDiscountPct = 0;
  if (quantity >= 20) volumeDiscountPct = 0.05;
  else if (quantity >= 5) volumeDiscountPct = 0.02;

  // Tier multiplier: partner = 3% off, vip = 1.5% off
  let tierDiscountPct = 0;
  if (priceTier === "partner") tierDiscountPct = 0.03;
  else if (priceTier === "vip") tierDiscountPct = 0.015;

  const totalDiscountPct = Math.min(0.10, volumeDiscountPct + tierDiscountPct);
  const discountedExw = Math.round(baseExwUsd * (1 - totalDiscountPct));

  let unitPrice = discountedExw;
  if (tradeTerm === "FOB") {
    unitPrice = discountedExw + 500; // $500 port handling & customs clearance
  } else if (tradeTerm === "CIF") {
    unitPrice = discountedExw + 500 + freightPerUnitUsd + insurancePerUnitUsd;
  }

  const totalAmount = unitPrice * quantity;
  return {
    discountedExw,
    unitPrice,
    totalAmount,
    totalDiscountPct,
  };
}

export type WhatsAppQuoteParams = {
  phone?: string;
  quoteNo: string;
  customer?: string;
  vehicleModel: string;
  quantity: number;
  unitPrice: number;
  cifTotal?: string;
};

export function buildWhatsAppQuoteShareUrl(params: WhatsAppQuoteParams): string {
  const cleanPhone = (params.phone || "").replace(/[^0-9]/g, "");
  const lines = [
    `Dear ${params.customer || "Customer"},`,
    "",
    `Please find your official quotation ${params.quoteNo}:`,
    `• Vehicle: ${params.vehicleModel}`,
    `• Quantity: ${params.quantity} unit(s)`,
    `• FOB Unit Price: USD ${params.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
  ];
  if (params.cifTotal) {
    lines.push(`• CIF Total: ${params.cifTotal}`);
  }
  lines.push("", "Thank you for choosing Youguard Auto.");

  const text = lines.join("\n");
  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "https://wa.me/";
  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}

