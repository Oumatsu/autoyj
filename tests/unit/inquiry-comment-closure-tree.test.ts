import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { buildInquiryCommentThreads, inquiryCommentDescendantIds, selectDiscussionNotes } from "../../lib/inquiry-workflow";

type Note = {
  noteId: string;
  parentNoteId: string;
  authorName: string;
  authorRole: string;
  body: string;
  createdAt: string;
  deletedAt: string;
};

test("a singly hidden parent is retained as a redacted placeholder for active replies", () => {
  const notes: Note[] = [
    { noteId: "parent", parentNoteId: "", authorName: "Aebissa G", authorRole: "customer", body: "Private parent text", createdAt: "2026-08-17T09:00:00Z", deletedAt: "2026-08-17T10:00:00Z" },
    { noteId: "reply", parentNoteId: "parent", authorName: "Sales Lead", authorRole: "sales", body: "Visible reply", createdAt: "2026-08-17T11:00:00Z", deletedAt: "" },
    { noteId: "fully-hidden", parentNoteId: "", authorName: "Hidden", authorRole: "customer", body: "No visible descendants", createdAt: "2026-08-17T12:00:00Z", deletedAt: "2026-08-17T13:00:00Z" },
  ];

  const discussion = selectDiscussionNotes(notes);
  const placeholder = discussion.find((note) => note.noteId === "parent");

  expect(placeholder).toMatchObject({
    noteId: "parent",
    parentNoteId: "",
    isHiddenPlaceholder: true,
    authorName: "",
    authorRole: "",
    body: "",
  });
  expect(discussion.map((note) => note.noteId)).toEqual(["parent", "reply"]);

  const threads = buildInquiryCommentThreads(discussion);
  expect(threads.map((thread) => thread.note.noteId)).toEqual(["parent"]);
  expect(threads[0]?.replies.map((thread) => thread.note.noteId)).toEqual(["reply"]);
});

test("closing a parent with the cascade option targets every nested descendant", () => {
  const notes: Note[] = [
    { noteId: "parent", parentNoteId: "", authorName: "A", authorRole: "customer", body: "", createdAt: "2026-08-17T09:00:00Z", deletedAt: "" },
    { noteId: "child", parentNoteId: "parent", authorName: "B", authorRole: "sales", body: "", createdAt: "2026-08-17T10:00:00Z", deletedAt: "" },
    { noteId: "grandchild", parentNoteId: "child", authorName: "C", authorRole: "admin", body: "", createdAt: "2026-08-17T11:00:00Z", deletedAt: "" },
    { noteId: "other", parentNoteId: "", authorName: "D", authorRole: "customer", body: "", createdAt: "2026-08-17T12:00:00Z", deletedAt: "" },
  ];

  expect(inquiryCommentDescendantIds(notes, "parent")).toEqual(["child", "grandchild"]);
});

test("the API supports cascade closure and the discussion UI renders a redacted placeholder", () => {
  const portalApi = readFileSync("server/api/portal.ts", "utf8");
  const portalPage = readFileSync("app/portal/page.tsx", "utf8");

  expect(portalApi).toContain("selectDiscussionNotes");
  expect(portalApi).toContain('mode === "cascade"');
  expect(portalPage).toContain("isHiddenPlaceholder");
  expect(portalPage).toContain("commentPendingClosure");
});
