import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const portalPage = readFileSync("app/portal/page.tsx", "utf8");
const portalApi = readFileSync("server/api/portal.ts", "utf8");

test("active quote cards show their start time, hide IDs from non-admins, and let administrators close an inquiry", () => {
  const start = portalPage.indexOf("function AdminQuotes(");
  const end = portalPage.indexOf("function AdminOrders", start);
  const panel = portalPage.slice(start, end);

  expect(panel).toContain("inquiry.createdAt");
  expect(panel).toContain("inquiryCloseCopy.startedAt");
  expect(panel).toContain("canModerateComments && <span");
  expect(panel).toContain('status: "closed"');
  expect(panel).toContain("/inquiries/${encodeURIComponent(inquiry.inquiryNo)}/status");
  expect(panel).toContain("inquiryCloseCopy.closeInquiry");
  expect(panel).toContain("Close comment");
  expect(panel).toContain("/api/portal/inquiry-content/note/");
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

test("deleted comment manager renders compact individual comment cards with inquiry context", () => {
  const start = portalPage.indexOf("function AdminQuotes(");
  const end = portalPage.indexOf("function AdminOrders", start);
  const panel = portalPage.slice(start, end);

  expect(panel).toContain("data-testid=\"closed-comment-manager\"");
  expect(panel).toContain("hiddenNotes.map((item)");
  expect(panel).toContain("item.inquiry?.inquiryNo || item.inquiryNo");
  expect(panel).toContain("item.inquiry?.vehicleModel || \"-\"");
  expect(panel).toContain("item.createdAt");
  expect(panel).toContain("item.deletedAt");
  expect(panel).not.toContain("groupedHiddenNotes");
});

test("closed inquiries have a separate administrator recovery manager", () => {
  const start = portalPage.indexOf("function AdminQuotes(");
  const end = portalPage.indexOf("function AdminOrders", start);
  const panel = portalPage.slice(start, end);

  expect(panel).toContain("loadClosedInquiries");
  expect(panel).toContain("/api/portal/inquiries/closed");
  expect(panel).toContain("restoreClosedInquiry");
  const restoreHandler = panel.slice(panel.indexOf("async function restoreClosedInquiry"), panel.indexOf("async function deleteClosedInquiry"));
  expect(restoreHandler).toContain('action: "restore"');
  expect(panel).toContain("manageClosedInquiries");
  expect(panel).toContain("closedInquiryTitle");
  expect(panel).toContain("deleteClosedInquiry");
  expect(panel).toContain('method: "DELETE"');
  expect(panel).toContain("deleteInquiryConfirmation");
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
