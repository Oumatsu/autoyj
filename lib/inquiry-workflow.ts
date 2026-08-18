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

type DiscussionNote = {
  noteId: string;
  parentNoteId: string;
  authorName: string;
  authorRole: string;
  body: string;
  deletedAt?: string;
};

/**
 * Keeps active discussion notes and the hidden ancestors required to preserve
 * their reply tree. Hidden ancestors are deliberately redacted before they
 * leave the moderation boundary, so the discussion UI cannot reveal their
 * author, role, or original content.
 */
export function selectDiscussionNotes<T extends DiscussionNote>(notes: T[]): Array<T & { isHiddenPlaceholder: boolean }> {
  const byId = new Map(notes.map((note) => [note.noteId, note]));
  const visibleIds = new Set<string>();

  for (const note of notes) {
    if (note.deletedAt) continue;
    let current: T | undefined = note;
    while (current && !visibleIds.has(current.noteId)) {
      visibleIds.add(current.noteId);
      current = current.parentNoteId ? byId.get(current.parentNoteId) : undefined;
    }
  }

  return notes
    .filter((note) => visibleIds.has(note.noteId))
    .map((note) => note.deletedAt
      ? { ...note, authorName: "", authorRole: "", body: "", isHiddenPlaceholder: true }
      : { ...note, isHiddenPlaceholder: false });
}

export function inquiryCommentDescendantIds<T extends { noteId: string; parentNoteId: string }>(notes: T[], rootNoteId: string): string[] {
  const childrenByParentId = new Map<string, string[]>();
  for (const note of notes) {
    if (!note.parentNoteId) continue;
    childrenByParentId.set(note.parentNoteId, [...(childrenByParentId.get(note.parentNoteId) || []), note.noteId]);
  }
  const descendants: string[] = [];
  const pending = [...(childrenByParentId.get(rootNoteId) || [])];
  while (pending.length) {
    const noteId = pending.shift()!;
    descendants.push(noteId);
    pending.push(...(childrenByParentId.get(noteId) || []));
  }
  return descendants;
}

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

export type InquiryStatus = "open" | "closed";

const LEGAL_INQUIRY_TRANSITIONS: Record<string, string[]> = {
  open: ["closed"],
  closed: ["open"],
};

export function canTransitionInquiryStatus(
  fromStatus: string | null | undefined,
  toStatus: string | null | undefined
): boolean {
  if (!fromStatus || !toStatus) return false;
  const allowed = LEGAL_INQUIRY_TRANSITIONS[fromStatus];
  return allowed ? allowed.includes(toStatus) : false;
}

