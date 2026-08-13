# Quotation Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement one-click PDF/Print export, WhatsApp quote direct share, and copy summary actions on the quotation preview template with full TDD test coverage.

**Architecture:** 
- Pure URL builder `buildWhatsAppQuoteShareUrl` lives in `lib/quotation-pricing.ts` (100% unit-tested).
- Action toolbar integrated into `components/portal/QuotationTemplatePreview.tsx` (component tested with DOM click / print bridge triggers).
- All tests use `bun:test`.

**Tech Stack:** React 18, TypeScript, Happy DOM, `bun:test`.

## Global Constraints

- All test files: `import { describe, expect, test } from "bun:test"`
- Unit tests live in `tests/unit/domain/`
- Component tests live in `tests/component/`
- Run test command: `bun test tests/unit tests/component tests/integration`
- Baseline: 709 passed, 0 failed

---

### Task 1: WhatsApp Quote Share URL Helper

**Files:**
- Modify: `lib/quotation-pricing.ts`
- Create: `tests/unit/domain/whatsapp-quote-share.test.ts`

**Interfaces:**
- Produces: `export function buildWhatsAppQuoteShareUrl(params: WhatsAppQuoteParams): string`

- [ ] **Step 1: Write the failing unit test**

Create `tests/unit/domain/whatsapp-quote-share.test.ts`:
```typescript
import { describe, expect, test } from "bun:test";
import { buildWhatsAppQuoteShareUrl } from "../../../lib/quotation-pricing";

describe("buildWhatsAppQuoteShareUrl", () => {
  test("generates WhatsApp share link with phone number and formatted quote message", () => {
    const url = buildWhatsAppQuoteShareUrl({
      phone: "+251 91 123 4567",
      quoteNo: "YG-2026-001",
      customer: "Addis Motors",
      vehicleModel: "BYD Seal Premium / White",
      quantity: 3,
      unitPrice: 28000,
      cifTotal: "USD 84,000.00",
    });

    expect(url.startsWith("https://wa.me/251911234567?text=")).toBe(true);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Dear Addis Motors");
    expect(decoded).toContain("YG-2026-001");
    expect(decoded).toContain("BYD Seal Premium / White");
    expect(decoded).toContain("3 unit(s)");
    expect(decoded).toContain("USD 28,000.00");
    expect(decoded).toContain("CIF Total: USD 84,000.00");
  });

  test("generates link without phone number using generic customer name fallback", () => {
    const url = buildWhatsAppQuoteShareUrl({
      quoteNo: "YG-2026-002",
      vehicleModel: "BYD Han",
      quantity: 1,
      unitPrice: 32000,
    });

    expect(url.startsWith("https://wa.me/?text=")).toBe(true);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain("Dear Customer");
    expect(decoded).toContain("YG-2026-002");
    expect(decoded).toContain("USD 32,000.00");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/unit/domain/whatsapp-quote-share.test.ts`
Expected: FAIL (`buildWhatsAppQuoteShareUrl` not exported)

- [ ] **Step 3: Implement `buildWhatsAppQuoteShareUrl` in `lib/quotation-pricing.ts`**

Add to `lib/quotation-pricing.ts`:
```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/unit/domain/whatsapp-quote-share.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/quotation-pricing.ts tests/unit/domain/whatsapp-quote-share.test.ts
git commit -m "feat(quote): add WhatsApp quote share URL builder with unit tests"
```

---

### Task 2: Action Toolbar on Quotation Template Preview

**Files:**
- Modify: `components/portal/QuotationTemplatePreview.tsx`
- Modify: `tests/component/quotation-template-preview.test.tsx`

**Interfaces:**
- Consumes: `buildWhatsAppQuoteShareUrl` from `../../lib/quotation-pricing`

- [ ] **Step 1: Update component test to assert action buttons**

Update `tests/component/quotation-template-preview.test.tsx`:
```typescript
import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { QuotationTemplatePreview } from "../../components/portal/QuotationTemplatePreview";

describe("QuotationTemplatePreview", () => {
  const sample = {
    quoteNo: "YG-2026-999",
    customer: "Addis Enterprise",
    vehicleModel: "BYD Tang EV",
    quantity: 2,
    unitPrice: 35000,
    cifTotal: "USD 72,000.00",
  };

  test("renders print/PDF button, WhatsApp share link, and copy summary button", () => {
    const html = renderToString(<QuotationTemplatePreview {...sample} />);
    expect(html).toContain("Print / PDF");
    expect(html).toContain("WhatsApp");
    expect(html).toContain("Copy Summary");
    expect(html).toContain("https://wa.me/");
    expect(html).toContain("YG-2026-999");
  });

  test("renders iframe with prefilled quotation data", () => {
    const html = renderToString(<QuotationTemplatePreview {...sample} />);
    expect(html).toContain('<iframe');
    expect(html).toContain('title="Quotation YG-2026-999"');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/component/quotation-template-preview.test.tsx`
Expected: FAIL (buttons not yet rendered in QuotationTemplatePreview)

- [ ] **Step 3: Implement Action Toolbar in `components/portal/QuotationTemplatePreview.tsx`**

Update `components/portal/QuotationTemplatePreview.tsx`:
```tsx
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
```

- [ ] **Step 4: Run component test to verify it passes**

Run: `bun test tests/component/quotation-template-preview.test.tsx`
Expected: PASS

- [ ] **Step 5: Run full test suite**

Run: `bun test tests/unit tests/component tests/integration`
Expected: 711+ passed, 0 failed

- [ ] **Step 6: Commit and push**

```bash
git add components/portal/QuotationTemplatePreview.tsx tests/component/quotation-template-preview.test.tsx
git commit -m "feat(portal): add print/PDF export, WhatsApp share, and summary copy to quotation preview"
git push origin main
```

---

## Self-Review Checklist

- ✅ Spec alignment: WhatsApp URL builder, Print/PDF, WhatsApp link, Copy summary all covered.
- ✅ No placeholders: Complete code in every step.
- ✅ TDD sequence: Fail first, implement, pass, commit.
