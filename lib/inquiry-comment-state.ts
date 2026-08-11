export function appendInquiryComment<T extends { noteId: string }>(current: T[], posted: T): T[] {
  return current.some((item) => item.noteId === posted.noteId) ? current : [...current, posted];
}
