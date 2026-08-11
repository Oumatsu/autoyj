import { describe, expect, test } from "bun:test";
import {
  canDeleteInquiry,
  canDeleteNote,
  canPublishPublicNote,
  canViewInquiry,
  canViewNote,
  hasUnreadFollowUp,
} from "../../server/inquiries/visibility";

const customerA = { userId: "customer-a", role: "customer" as const };
const customerB = { userId: "customer-b", role: "customer" as const };
const admin = { userId: "admin", role: "admin" as const };
const sales = { userId: "sales", role: "sales" as const };
const privateInquiry = { creatorUserId: "customer-a", isPublic: false };
const legacyPublicInquiry = { creatorUserId: "customer-a", isPublic: true };

describe("inquiry visibility", () => {
  test("keeps every inquiry private even when a legacy record is marked public", () => {
    expect(canViewInquiry(customerB, legacyPublicInquiry)).toBe(false);
    expect(canViewInquiry(customerA, privateInquiry)).toBe(true);
    expect(canViewInquiry(admin, privateInquiry)).toBe(true);
    expect(canViewInquiry(sales, privateInquiry)).toBe(true);
    expect(canViewInquiry(customerB, privateInquiry)).toBe(false);
  });

  test("shows all comments within the private owner-and-staff conversation only", () => {
    const staffReply = { authorUserId: "sales", isPublic: false };
    const legacyPublicNote = { authorUserId: "customer-a", isPublic: true };
    expect(canViewNote(customerA, privateInquiry, staffReply)).toBe(true);
    expect(canViewNote(sales, privateInquiry, staffReply)).toBe(true);
    expect(canViewNote(customerB, legacyPublicInquiry, legacyPublicNote)).toBe(false);
  });

  test("rejects public publishing for every inquiry", () => {
    expect(canPublishPublicNote({ inquiryIsPublic: true, parentIsPublic: null, isPublic: true })).toBe(false);
    expect(canPublishPublicNote({ inquiryIsPublic: false, parentIsPublic: false, isPublic: false })).toBe(true);
  });

  test("allows only an author or admin to delete content", () => {
    expect(canDeleteInquiry(customerA, "customer-a")).toBe(true);
    expect(canDeleteInquiry(customerB, "customer-a")).toBe(false);
    expect(canDeleteInquiry(sales, "customer-a")).toBe(false);
    expect(canDeleteInquiry(admin, "customer-a")).toBe(true);
    expect(canDeleteNote(customerA, "customer-a")).toBe(true);
    expect(canDeleteNote(customerB, "customer-a")).toBe(false);
  });

  test("marks only another visible follow-up as unread for an inquiry creator", () => {
    expect(hasUnreadFollowUp({ creatorUserId: "customer-a", viewerUserId: "customer-a", noteAuthorUserId: "customer-b", noteVisible: true, noteCreatedAt: "2026-08-06T10:00:00.000Z", lastReadAt: "2026-08-06T09:00:00.000Z" })).toBe(true);
    expect(hasUnreadFollowUp({ creatorUserId: "customer-a", viewerUserId: "customer-a", noteAuthorUserId: "customer-a", noteVisible: true, noteCreatedAt: "2026-08-06T10:00:00.000Z", lastReadAt: "2026-08-06T09:00:00.000Z" })).toBe(false);
    expect(hasUnreadFollowUp({ creatorUserId: "customer-a", viewerUserId: "customer-a", noteAuthorUserId: "customer-b", noteVisible: false, noteCreatedAt: "2026-08-06T10:00:00.000Z", lastReadAt: "2026-08-06T09:00:00.000Z" })).toBe(false);
    expect(hasUnreadFollowUp({ creatorUserId: "customer-a", viewerUserId: "customer-b", noteAuthorUserId: "customer-a", noteVisible: true, noteCreatedAt: "2026-08-06T10:00:00.000Z", lastReadAt: "2026-08-06T09:00:00.000Z" })).toBe(false);
  });
});
