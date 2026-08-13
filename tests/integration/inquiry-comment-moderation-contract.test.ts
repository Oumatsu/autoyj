import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const portalPage = readFileSync("app/portal/page.tsx", "utf8");
const portalApi = readFileSync("server/api/portal.ts", "utf8");

test("active quotes moderation operates on one comment rather than the inquiry status", () => {
  const start = portalPage.indexOf("function AdminQuotes(");
  const end = portalPage.indexOf("function AdminOrders", start);
  const panel = portalPage.slice(start, end);

  expect(panel).toContain("Close comment");
  expect(panel).toContain("/api/portal/inquiry-content/note/");
  expect(panel).not.toContain("Close inquiry");
  expect(panel).not.toContain("/inquiries/${encodeURIComponent(selected.inquiryNo)}/status");
});

test("comment moderation endpoints accept notes only and require an administrator", () => {
  const start = portalApi.indexOf("async function handleDeleteInquiryContent");
  const end = portalApi.indexOf("async function handleMarkInquiryRead", start);
  const handler = portalApi.slice(start, end);

  expect(handler).toContain('type: "note"');
  expect(handler).toContain('session.role !== "admin"');
  expect(handler).toContain("deleted_at");
  expect(handler).not.toContain('type === "inquiry"');
});

test("vehicle comment panels keep different inquiries for the same vehicle separate", () => {
  const start = portalPage.indexOf("function VehicleInquiryPanel(");
  const end = portalPage.indexOf("type InquirySnapshot", start);
  const panel = portalPage.slice(start, end);

  expect(panel).toContain("selectedInquiryNo");
  expect(panel).toContain("targetInquiry");
  expect(panel).toContain("item.inquiryNo === targetInquiry?.inquiryNo");
  expect(panel).not.toContain("const existing = inquiries[0]");
});
