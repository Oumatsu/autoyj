export function groupInquiriesByVehicle<T extends { inquiryNo: string; vehicleId: string; vehicleModel: string }>(inquiries: T[]) {
  const groups = new Map<string, { vehicleKey: string; vehicleLabel: string; inquiries: T[] }>();
  for (const inquiry of inquiries) {
    const vehicleKey = inquiry.vehicleId || inquiry.vehicleModel || inquiry.inquiryNo;
    const group = groups.get(vehicleKey) || { vehicleKey, vehicleLabel: inquiry.vehicleModel || vehicleKey, inquiries: [] };
    group.inquiries.push(inquiry);
    groups.set(vehicleKey, group);
  }
  return [...groups.values()];
}

type InquirySnapshot = { brand?: unknown; model?: unknown; variant?: unknown };

function parseInquirySnapshot(value: string): InquirySnapshot | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed as InquirySnapshot : null;
  } catch {
    return null;
  }
}

export function inquiryListSummary(inquiry: { quantity: number; vehicleModel: string; vehicleSnapshot: string }): string {
  const details = inquiryListDetails(inquiry);
  return [details.quantity, details.brand, details.model].filter(Boolean).join(" ").trim();
}

export function inquiryListDetails(inquiry: { quantity: number; vehicleModel: string; vehicleSnapshot: string }) {
  const snapshot = parseInquirySnapshot(inquiry.vehicleSnapshot);
  const text = (value: unknown) => typeof value === "string" ? value.trim() : "";
  return {
    quantity: `${inquiry.quantity} units`,
    brand: text(snapshot?.brand),
    model: text(snapshot?.model) || inquiry.vehicleModel,
    trim: text(snapshot?.variant),
  };
}

export type InquiryCommentThread<T> = { note: T; replies: InquiryCommentThread<T>[] };

export function buildInquiryCommentThreads<T extends { noteId: string; parentNoteId: string; createdAt: string }>(notes: T[]): InquiryCommentThread<T>[] {
  const byParentId = new Map<string, T[]>();
  const noteIds = new Set(notes.map((note) => note.noteId));
  for (const note of notes) {
    const parentId = note.parentNoteId && noteIds.has(note.parentNoteId) ? note.parentNoteId : "";
    byParentId.set(parentId, [...(byParentId.get(parentId) || []), note]);
  }
  const build = (parentNoteId: string): InquiryCommentThread<T>[] => (byParentId.get(parentNoteId) || [])
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt))
    .map((note) => ({ note, replies: build(note.noteId) }));
  return build("");
}

export function replyReference(note: { authorName: string; body: string }): string {
  const summary = note.body.trim().replace(/\s+/g, " ").slice(0, 96);
  return `Replying to ${note.authorName}: ${summary}${note.body.trim().length > 96 ? "…" : ""}`;
}

export function hasUnreadInquiryActivity({ viewerUserId, noteAuthorUserId, noteCreatedAt, lastReadAt }: {
  viewerUserId: string;
  noteAuthorUserId: string;
  noteCreatedAt: string;
  lastReadAt: string | null;
}) {
  return noteAuthorUserId !== viewerUserId && (!lastReadAt || noteCreatedAt > lastReadAt);
}
