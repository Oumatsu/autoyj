"use client";

import React, { useState } from "react";

export interface QuoteComposerFormProps {
  inquiryNo: string;
  quantity: number;
  unitPrice: number;
  tradeTerm: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onChangeUnitPrice?: (price: number) => void;
}

export function QuoteComposerForm({
  inquiryNo,
  quantity,
  unitPrice: initialUnitPrice,
  tradeTerm,
  onSubmit,
  onChangeUnitPrice,
}: QuoteComposerFormProps) {
  const [unitPrice, setUnitPrice] = useState(initialUnitPrice);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setUnitPrice(val);
    onChangeUnitPrice?.(val);
  };

  const total = quantity * unitPrice;

  return (
    <form data-testid="quote-form" onSubmit={onSubmit} className="grid gap-3">
      <input type="hidden" name="inquiryNo" value={inquiryNo} />
      <div className="field">
        <label htmlFor="qty">Quantity</label>
        <input id="qty" type="number" readOnly value={quantity} />
      </div>
      <div className="field">
        <label htmlFor="price">Unit Price (USD)</label>
        <input
          id="price"
          type="number"
          value={unitPrice}
          onChange={handlePriceChange}
          required
          min="1"
        />
      </div>
      <div className="field">
        <label htmlFor="term">Trade Term</label>
        <input id="term" type="text" readOnly value={tradeTerm} />
      </div>
      <div data-testid="total-amount" className="total">
        {`Total: $${total.toLocaleString()}`}
      </div>
      <button type="submit" disabled={unitPrice <= 0}>
        Send Quotation
      </button>
    </form>
  );
}
