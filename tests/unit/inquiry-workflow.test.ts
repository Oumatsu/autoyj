import { describe, expect, test } from "bun:test";
import { groupInquiriesByVehicle, hasUnreadInquiryActivity, replyReference } from "../../lib/inquiry-workflow";

describe("inquiry workflow", () => {
  test("groups multiple customer conversations under one vehicle", () => {
    expect(groupInquiriesByVehicle([
      { inquiryNo: "INQ-1", vehicleId: "V-1", vehicleModel: "BYD Seal", customerId: "CUS-1" },
      { inquiryNo: "INQ-2", vehicleId: "V-1", vehicleModel: "BYD Seal", customerId: "CUS-2" },
      { inquiryNo: "INQ-3", vehicleId: "V-2", vehicleModel: "BYD Han", customerId: "CUS-1" },
    ])).toEqual([
      { vehicleKey: "V-1", vehicleLabel: "BYD Seal", inquiries: [
        { inquiryNo: "INQ-1", vehicleId: "V-1", vehicleModel: "BYD Seal", customerId: "CUS-1" },
        { inquiryNo: "INQ-2", vehicleId: "V-1", vehicleModel: "BYD Seal", customerId: "CUS-2" },
      ] },
      { vehicleKey: "V-2", vehicleLabel: "BYD Han", inquiries: [
        { inquiryNo: "INQ-3", vehicleId: "V-2", vehicleModel: "BYD Han", customerId: "CUS-1" },
      ] },
    ]);
  });

  test("builds a concise quote-reply reference to the original author and text", () => {
    expect(replyReference({ authorName: "Sales Lead", body: "The vessel leaves on Friday and the CIF total is USD 18,200." })).toBe("Replying to Sales Lead: The vessel leaves on Friday and the CIF total is USD 18,200.");
  });

  test("marks activity from another participant as unread for every role", () => {
    expect(hasUnreadInquiryActivity({ viewerUserId: "SALES-1", noteAuthorUserId: "CUS-1", noteCreatedAt: "2026-08-11T09:00:00.000Z", lastReadAt: "2026-08-11T08:00:00.000Z" })).toBe(true);
    expect(hasUnreadInquiryActivity({ viewerUserId: "SALES-1", noteAuthorUserId: "SALES-1", noteCreatedAt: "2026-08-11T09:00:00.000Z", lastReadAt: null })).toBe(false);
  });
});
