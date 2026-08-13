# Quotation & Inquiry High-Yield Enhancements Spec — autoyj

**Date**: 2026-08-14  
**Status**: Approved  
**Scope**: PDF/Print Export, WhatsApp Share Utility, Interactive Actions  
**Target Test Coverage**: 100% for all new code  

---

## 1. Goal

Enhance the B2B quotation and inquiry workflow with three high-yield, low-cost features:
1. **One-Click PDF/Print Export** on `QuotationTemplatePreview.tsx` via iframe print bridge.
2. **WhatsApp Quote & Inquiry Direct Share** with prefilled formatted trade message.
3. **Copy Quote Summary** button for quick clipboard sharing.

---

## 2. Architecture & Pure Utilities

### 2.1 WhatsApp Share URL Builder (`lib/quotation-pricing.ts`)

Export a pure helper `buildWhatsAppQuoteShareUrl`:

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
  const text = `Dear ${params.customer || "Customer"},\n\n` +
    `Please find your official quotation ${params.quoteNo}:\n` +
    `• Vehicle: ${params.vehicleModel}\n` +
    `• Quantity: ${params.quantity} unit(s)\n` +
    `• FOB Unit Price: USD ${params.unitPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}\n` +
    (params.cifTotal ? `• CIF Total: ${params.cifTotal}\n` : "") +
    `\nThank you for choosing Youguard Auto.`;

  const baseUrl = cleanPhone ? `https://wa.me/${cleanPhone}` : "https://wa.me/";
  return `${baseUrl}?text=${encodeURIComponent(text)}`;
}
```

### 2.2 Quotation Preview Action Bar (`components/portal/QuotationTemplatePreview.tsx`)

Enhance `QuotationTemplatePreview` to include an action toolbar at the top:
- **Print / PDF button**: invokes `iframeRef.current?.contentWindow?.print()`.
- **WhatsApp Direct button**: opens `buildWhatsAppQuoteShareUrl(...)` in a new window.
- **Copy Summary button**: writes formatted text to `navigator.clipboard.writeText(...)`.

---

## 3. Testing Strategy (TDD)

### 3.1 Unit Tests
- `tests/unit/domain/whatsapp-quote-share.test.ts`:
  - Validates generated URL structure with and without phone number.
  - Validates formatting of vehicle model, quantity, unit price, and CIF total.
  - Validates URL encoding of special characters.

### 3.2 Component Tests
- `tests/component/quotation-template-preview.test.tsx`:
  - Tests rendering of Print button, WhatsApp link, and Copy button.
  - Tests iframe rendering with prefilled quotation data.

---

## 4. Acceptance Criteria
- All 709+ existing tests continue to pass.
- New unit and component tests pass 100%.
- No external heavy dependencies introduced.
