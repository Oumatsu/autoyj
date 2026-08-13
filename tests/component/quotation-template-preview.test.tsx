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
    expect(html).toContain("aspect-video");
  });

  test("embeds the original Youguard logo so the srcdoc document has no relative logo request", () => {
    const html = renderToString(<QuotationTemplatePreview {...sample} />);
    expect(html).toContain("data:image/svg+xml,");
    expect(html).not.toContain('src="youguard-logo.svg"');
  });
});

