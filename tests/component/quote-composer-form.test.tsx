import { describe, expect, test } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";

function SimpleQuoteComposer({
  inquiryNo,
  quantity,
  unitPrice,
  tradeTerm,
  onSubmit,
}: {
  inquiryNo: string;
  quantity: number;
  unitPrice: number;
  tradeTerm: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const total = quantity * unitPrice;
  return (
    <form data-testid="quote-form" onSubmit={onSubmit}>
      <input type="hidden" name="inquiryNo" value={inquiryNo} />
      <div className="field">
        <label htmlFor="qty">Quantity</label>
        <input id="qty" type="number" readOnly value={quantity} />
      </div>
      <div className="field">
        <label htmlFor="price">Unit Price (USD)</label>
        <input id="price" type="number" defaultValue={unitPrice} required min="1" />
      </div>
      <div className="field">
        <label htmlFor="term">Trade Term</label>
        <input id="term" type="text" readOnly value={tradeTerm} />
      </div>
      <div data-testid="total-amount" className="total">
        {`Total: $${total.toLocaleString()}`}
      </div>
      <button type="submit" disabled={unitPrice <= 0}>Send Quotation</button>
    </form>
  );
}

describe("Quote Composer Form Component", () => {
  test("renders quote composer with pre-filled quantity and calculated total", () => {
    const html = renderToString(
      <SimpleQuoteComposer
        inquiryNo="INQ-2026-001"
        quantity={5}
        unitPrice={28000}
        tradeTerm="FOB"
        onSubmit={() => {}}
      />
    );
    expect(html).toContain("INQ-2026-001");
    expect(html).toContain("28000");
    expect(html).toContain("Total: $140,000");
    expect(html).toContain("Send Quotation");
  });

  test("disables submit button when unit price is zero or negative", () => {
    const html = renderToString(
      <SimpleQuoteComposer
        inquiryNo="INQ-2026-001"
        quantity={5}
        unitPrice={0}
        tradeTerm="FOB"
        onSubmit={() => {}}
      />
    );
    expect(html).toContain("disabled");
  });
});
