import { describe, expect, test } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { QuoteComposerForm } from "../../components/portal/QuoteComposerForm";

describe("Quote Composer Form Component", () => {
  test("renders quote composer with pre-filled quantity and calculated total", () => {
    const html = renderToString(
      <QuoteComposerForm
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
      <QuoteComposerForm
        inquiryNo="INQ-2026-001"
        quantity={5}
        unitPrice={0}
        tradeTerm="FOB"
        onSubmit={() => {}}
      />
    );
    expect(html).toContain("disabled");
  });

  test("updates total amount and dispatches submit event with Happy DOM", async () => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    let submitted = false;
    let priceChangedVal = 0;

    await act(async () => {
      root.render(
        <QuoteComposerForm
          inquiryNo="INQ-2026-001"
          quantity={3}
          unitPrice={20000}
          tradeTerm="CIF"
          onSubmit={(e) => {
            e.preventDefault();
            submitted = true;
          }}
          onChangeUnitPrice={(val) => {
            priceChangedVal = val;
          }}
        />
      );
    });

    const priceInput = container.querySelector("#price") as HTMLInputElement;
    const totalDiv = container.querySelector('[data-testid="total-amount"]') as HTMLDivElement;
    const form = container.querySelector('[data-testid="quote-form"]') as HTMLFormElement;

    expect(priceInput).not.toBeNull();
    expect(totalDiv.textContent).toBe("Total: $60,000");

    // Change unit price using React-compatible setter & dispatch
    await act(async () => {
      const nativeSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value"
      )?.set;
      if (nativeSetter) {
        nativeSetter.call(priceInput, "25000");
      } else {
        priceInput.value = "25000";
      }
      priceInput.dispatchEvent(new window.Event("input", { bubbles: true }));
      priceInput.dispatchEvent(new window.Event("change", { bubbles: true }));
    });

    expect(priceChangedVal).toBe(25000);
    expect(totalDiv.textContent).toBe("Total: $75,000");

    // Submit form
    await act(async () => {
      form.dispatchEvent(new window.Event("submit", { bubbles: true, cancelable: true }));
    });

    expect(submitted).toBe(true);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
