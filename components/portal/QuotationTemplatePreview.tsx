"use client";

import quotationTemplate from "../../templates/quotations/outputs/youguard-quotation-template.html?raw";
import quotationLogo from "../../templates/quotations/outputs/youguard-logo.svg?raw";

type Props = {
  quoteNo: string;
  customer: string;
  vehicleModel: string;
  quantity: number;
  unitPrice: number;
  cifTotal: string;
};

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const usd = (value: number) => `USD ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const quotationLogoUrl = `data:image/svg+xml,${encodeURIComponent(quotationLogo)}`;

export function QuotationTemplatePreview({ quoteNo, customer, vehicleModel, quantity, unitPrice, cifTotal }: Props) {
  const html = quotationTemplate
    .replace("<head>", '<head><link rel="icon" href="/favicon.svg" type="image/svg+xml">')
    .replace("<body>", '<body><img src="/favicon.svg" alt="" width="1" height="1" style="display:none">')
    .replace('src="youguard-logo.svg"', `src="${quotationLogoUrl}"`)
    .replace("YG-2026-001", escapeHtml(quoteNo))
    .replace("[Customer Company Name]", escapeHtml(customer || "[Customer Company Name]"))
    .replace("[Model Name]", escapeHtml(vehicleModel))
    .replace('class="num qty" contenteditable="true">1</td>', `class="num qty" contenteditable="true">${quantity}</td>`)
    .replace('class="num fob-unit" contenteditable="true">USD 0.00</td>', `class="num fob-unit" contenteditable="true">${usd(unitPrice)}</td>`)
    .replace('id="cifTotal" contenteditable="true">USD 0.00</span>', `id="cifTotal" contenteditable="true">${escapeHtml(cifTotal || "USD 0.00")}</span>`);

  return <iframe title={`Quotation ${quoteNo}`} srcDoc={html} className="aspect-video w-full rounded-xl border border-white/15 bg-neutral-800" />;
}
