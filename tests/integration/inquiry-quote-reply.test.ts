import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { buildInquiryCommentThreads, inquiryListDetails, inquiryListSummary } from "../../lib/inquiry-workflow";

test("inquiry list labels use only quantity and the base vehicle model", () => {
  expect(inquiryListSummary({
    quantity: 3,
    vehicleModel: "BYD Sealion 06 EV Premium / White",
    vehicleSnapshot: JSON.stringify({ brand: "BYD", model: "Sealion 06 EV", variant: "Premium", color: "White" }),
})).toBe("3 units BYD Sealion 06 EV");
});

test("inquiry list details separate quantity, brand, model, and trim", () => {
  expect(inquiryListDetails({
    quantity: 3,
    vehicleModel: "BYD Sealion 06 EV Premium / White",
    vehicleSnapshot: JSON.stringify({ brand: "BYD", model: "Sealion 06 EV", variant: "Premium" }),
  })).toEqual({ quantity: "3 units", brand: "BYD", model: "Sealion 06 EV", trim: "Premium" });
});

test("quote replies are grouped directly under their parent message", () => {
  const threads = buildInquiryCommentThreads([
    { noteId: "note-1", parentNoteId: "", createdAt: "2026-08-12T08:00:00.000Z" },
    { noteId: "note-2", parentNoteId: "note-1", createdAt: "2026-08-12T08:01:00.000Z" },
    { noteId: "note-3", parentNoteId: "", createdAt: "2026-08-12T08:02:00.000Z" },
  ]);

  expect(threads.map((thread) => thread.note.noteId)).toEqual(["note-1", "note-3"]);
  expect(threads[0].replies.map((thread) => thread.note.noteId)).toEqual(["note-2"]);
});

test("quote replies retain the scoped inquiry for parent-message validation", () => {
  const source = readFileSync("server/api/portal.ts", "utf8");
  const start = source.indexOf("async function handleCreateInquiryNote");
  const end = source.indexOf("function inquiryStatusHistoryStatement", start);
  const handler = source.slice(start, end);

  expect(handler).toContain("const { inquiry } = await findScopedInquiry(env, session, inquiryNo);");
  expect(handler).toContain("canViewNote(session, inquiry, note)");
  expect(handler).toContain("canPublishPublicNote({ inquiryIsPublic: inquiry.isPublic");
});

test("active inquiry management updates data without a full-page reload", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function AdminQuotes(");
  const end = source.indexOf("function AdminOrders", start);
  const panel = source.slice(start, end);

  expect(panel).not.toContain("window.location.reload()");
  expect(panel).toContain("onRefresh()");
  expect(source).toContain("inquiryCommentAuthorClass(note.authorRole)");
});

test("vehicle-detail inquiry panel updates in place and preserves role styling", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function VehicleInquiryPanel(");
  const end = source.indexOf("type InquirySnapshot", start);
  const panel = source.slice(start, end);

  expect(panel).not.toContain("window.location.reload()");
  expect(panel).toContain("appendInquiryComment");
  expect(panel).toContain("inquiryCommentAuthorClass(item.authorRole)");
  expect(panel).toContain("await onRefresh()");
});

test("unread indicators are refreshed from the server after a conversation is read", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function AdminQuotes(");
  const end = source.indexOf("function AdminOrders", start);
  const panel = source.slice(start, end);

  expect(panel).not.toContain("readInquiryNos");
  expect(panel).toContain("await onRefresh()");
});

test("inquiry management uses compact list cards, snapshot details, and nested replies", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function AdminQuotes(");
  const end = source.indexOf("function AdminOrders", start);
  const panel = source.slice(start, end);

  expect(panel).toContain("inquiryListDetails(inquiry)");
  expect(panel).toContain('className="break-words"');
  expect(panel).toContain("InquirySnapshotDetails");
  expect(panel).toContain("InquiryCommentThread");
});

test("inquiry list cards stay compact and use a distinct selected state", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function AdminQuotes(");
  const end = source.indexOf("function AdminOrders", start);
  const panel = source.slice(start, end);

  expect(panel).toContain("content-start max-h-[70vh]");
  expect(panel).toContain('border-white bg-emerald-400/15');
  expect(panel).toContain("text-lime-300");
});

test("inquiry detail selection follows the currently filtered inquiry list", () => {
  const source = readFileSync("app/portal/page.tsx", "utf8");
  const start = source.indexOf("function AdminQuotes(");
  const end = source.indexOf("function AdminOrders", start);
  const panel = source.slice(start, end);

  expect(panel).toContain("const selected = visibleInquiries.find((item) => item.inquiryNo === selectedNo) || visibleInquiries[0];");
});

test("new inquiries use the daily YGI sequence", () => {
  const source = readFileSync("server/api/portal.ts", "utf8");
  const start = source.indexOf("async function handleCreateInquiry");
  const end = source.indexOf("function canManageInquiryStatus", start);
  const handler = source.slice(start, end);

  expect(handler).toContain("nextInquiryNumber(db, now)");
  expect(source).toContain("async function nextInquiryNumber");
  expect(source).toContain("YGI${dateKey}");
});
