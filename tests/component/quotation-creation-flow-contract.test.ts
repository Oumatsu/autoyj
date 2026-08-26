import { expect, test } from "bun:test";
import { readFile } from "node:fs/promises";

test("admin and sales can adjust the prefilled inquiry vehicle configuration and quantity before creating a quotation", async () => {
  const source = await readFile(new URL("../../app/portal/page.tsx", import.meta.url), "utf8");
  const quoteDialog = source.match(/\{showQuoteComposer && selected && <Dialog open[\s\S]*?<\/Dialog>\}/)?.[0] || "";

  expect(quoteDialog).toContain("{showQuoteComposer && selected && <Dialog open");
  expect(quoteDialog).toContain("<InquiryVehiclePicker vehicles={data.vehicles} value={quoteTarget} onChange={setQuoteTarget} />");
  expect(quoteDialog).toContain('aria-label="Quotation quantity"');
  expect(source).toContain('setQuoteTarget({ vehicleId: selected.vehicleId, vehicleModel: selected.vehicleModel })');
  expect(source).toContain('setQuoteQuantity(Math.max(1, selected.quantity || 1))');
  expect(source).toContain("<QuotationTemplatePreview {...preview} />");
  expect(source).toContain("body: JSON.stringify({ inquiryNo: selected.inquiryNo, vehicleId: quoteTarget.vehicleId, quantity: quoteQuantity, unitPrice })");
});
