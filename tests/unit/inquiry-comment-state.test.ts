import { appendInquiryComment } from "../../lib/inquiry-comment-state";

test("adds a newly posted comment immediately without duplicating an existing note", () => {
  const existing = [{ noteId: "NOTE-001", body: "Earlier reply" }];
  const posted = { noteId: "NOTE-002", body: "New reply" };

  expect(appendInquiryComment(existing, posted)).toEqual([existing[0], posted]);
  expect(appendInquiryComment([...existing, posted], posted)).toEqual([existing[0], posted]);
});
