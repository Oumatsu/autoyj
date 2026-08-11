export type InquiryAccessRole = "admin" | "sales" | "partner" | "customer" | "sourcing" | "finance";

export type InquiryViewer = {
  userId: string;
  role: InquiryAccessRole;
};

export type InquiryVisibility = {
  creatorUserId: string;
  isPublic: boolean;
};

export type NoteVisibility = {
  authorUserId: string;
  isPublic: boolean;
};

export function isInquiryStaff(viewer: InquiryViewer) {
  return viewer.role === "admin" || viewer.role === "sales";
}

export function canViewInquiry(viewer: InquiryViewer, inquiry: InquiryVisibility) {
  return isInquiryStaff(viewer) || viewer.userId === inquiry.creatorUserId;
}

export function canViewNote(viewer: InquiryViewer, inquiry: InquiryVisibility, note: NoteVisibility) {
  return canViewInquiry(viewer, inquiry);
}

export function canPublishPublicNote({ inquiryIsPublic, parentIsPublic, isPublic }: { inquiryIsPublic: boolean; parentIsPublic: boolean | null; isPublic: boolean }) {
  return !isPublic;
}

export function canDeleteInquiry(viewer: InquiryViewer, creatorUserId: string) {
  return viewer.role === "admin" || viewer.userId === creatorUserId;
}

export function canDeleteNote(viewer: InquiryViewer, authorUserId: string) {
  return viewer.role === "admin" || viewer.userId === authorUserId;
}

export function hasUnreadFollowUp({ creatorUserId, viewerUserId, noteAuthorUserId, noteVisible, noteCreatedAt, lastReadAt }: {
  creatorUserId: string;
  viewerUserId: string;
  noteAuthorUserId: string;
  noteVisible: boolean;
  noteCreatedAt: string;
  lastReadAt: string | null;
}) {
  return viewerUserId === creatorUserId
    && noteAuthorUserId !== viewerUserId
    && noteVisible
    && (!lastReadAt || noteCreatedAt > lastReadAt);
}
