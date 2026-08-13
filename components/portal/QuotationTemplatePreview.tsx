"use client";

import React, { useRef, useState } from "react";
import quotationTemplate from "../../templates/quotations/outputs/youguard-quotation-template.html?raw";
import quotationLogo from "../../templates/quotations/outputs/youguard-logo.svg?raw";
import { buildWhatsAppQuoteShareUrl } from "../../lib/quotation-pricing";

type Props = {
  quoteNo: string;
  customer: string;
  vehicleModel: string;
  quantity: number;
  unitPrice: number;
  cifTotal: string;
  phone?: string;
};

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const usd = (value: number) => `USD ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const quotationLogoUrl = `data:image/svg+xml,${encodeURIComponent(quotationLogo)}`;

export function QuotationTemplatePreview({ quoteNo, customer, vehicleModel, quantity, unitPrice, cifTotal, phone }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);

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

  const whatsappUrl = buildWhatsAppQuoteShareUrl({
    quoteNo,
    customer,
    vehicleModel,
    quantity,
    unitPrice,
    cifTotal,
    phone,
  });

  function handlePrint() {
    try {
      iframeRef.current?.contentWindow?.print();
    } catch {
      window.print();
    }
  }

  async function handleCopySummary() {
    const summary = `Quotation ${quoteNo} | ${customer}\nVehicle: ${vehicleModel} x ${quantity}\nFOB Unit: ${usd(unitPrice)}\nCIF Total: ${cifTotal}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-neutral-900/80 p-2.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500"
          >
            <span>🖨️</span>
            <span>Print / PDF</span>
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded bg-[#25D366] px-3 py-1.5 text-xs font-bold text-black transition hover:bg-[#20bd5a]"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </a>
        </div>
        <button
          type="button"
          onClick={handleCopySummary}
          className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
        >
          {copied ? "✓ Copied!" : "📋 Copy Summary"}
        </button>
      </div>

      <iframe
        ref={iframeRef}
        title={`Quotation ${quoteNo}`}
        srcDoc={html}
        className="aspect-video w-full rounded-xl border border-white/15 bg-neutral-800"
      />
    </div>
  );
}
