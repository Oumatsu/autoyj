import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { QuotationTemplatePreview } from "../../components/portal/QuotationTemplatePreview";

test("uses a 16:9 viewport for the original quotation template", () => {
  render(<QuotationTemplatePreview quoteNo="QTE-001" customer="Customer" vehicleModel="BYD Seal" quantity={1} unitPrice={25000} cifTotal="USD 26,000.00" />);

  expect(screen.getByTitle("Quotation QTE-001").className).toContain("aspect-video");
});

test("embeds the original Youguard logo so the srcdoc document has no relative logo request", () => {
  render(<QuotationTemplatePreview quoteNo="QTE-001" customer="Customer" vehicleModel="BYD Seal" quantity={1} unitPrice={25000} cifTotal="USD 26,000.00" />);

  const source = screen.getByTitle("Quotation QTE-001").getAttribute("srcDoc") || "";
  expect(source).toContain("data:image/svg+xml,");
  expect(source).not.toContain('src="youguard-logo.svg"');
});
