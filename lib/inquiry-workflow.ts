export const inquiryStatuses = ["New Inquiry", "Quoted", "Negotiating", "Accepted", "Closed"] as const;
export type InquiryStatus = typeof inquiryStatuses[number];

const statusTransitions: Record<InquiryStatus, readonly InquiryStatus[]> = {
  "New Inquiry": ["Quoted", "Closed"],
  Quoted: ["Negotiating", "Accepted", "Closed"],
  Negotiating: ["Quoted", "Accepted", "Closed"],
  Accepted: ["Closed"],
  Closed: ["New Inquiry"],
};

export function canTransitionInquiryStatus(from: string, to: string): boolean {
  return (statusTransitions[from as InquiryStatus] || []).includes(to as InquiryStatus);
}

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
