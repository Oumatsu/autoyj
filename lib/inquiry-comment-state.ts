export function appendInquiryComment<T extends { noteId: string }>(current: T[], posted: T): T[] {
  return current.some((item) => item.noteId === posted.noteId) ? current : [...current, posted];
}

export function inquiryCommentAuthorClass(role: string): string {
  if (role === "sales") return "text-teal-300";
  if (role === "partner") return "text-amber-300";
  if (role === "customer") return "text-violet-300";
  return "text-white";
}
