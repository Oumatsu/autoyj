import {
  canViewInquiryNumber,
  groupInquiriesByVehicle,
  hasUnreadInquiryActivity,
  replyReference,
  buildInquiryDeepLink,
  parseInquiryDeepLink,
} from "../../lib/inquiry-workflow";

describe("inquiry workflow", () => {
  test("shows inquiry numbers to internal administrators and sales staff only", () => {
    expect(canViewInquiryNumber("admin")).toBe(true);
    expect(canViewInquiryNumber("sales")).toBe(true);
    expect(canViewInquiryNumber("partner")).toBe(false);
    expect(canViewInquiryNumber("customer")).toBe(false);
  });

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

  test("builds and parses inquiry deep links accurately across locales", () => {
    expect(buildInquiryDeepLink("INQ-2026-001")).toBe("https://youguard.net/portal?inquiry=INQ-2026-001");
    expect(buildInquiryDeepLink("INQ-2026-002", "http://localhost:3004", "zh")).toBe("http://localhost:3004/zh/portal?inquiry=INQ-2026-002");
    expect(buildInquiryDeepLink("INQ-2026-003", "https://youguard.net", "am")).toBe("https://youguard.net/am/portal?inquiry=INQ-2026-003");

    expect(parseInquiryDeepLink("https://youguard.net/portal?inquiry=INQ-2026-888")).toBe("INQ-2026-888");
    expect(parseInquiryDeepLink("/zh/dashboard/quotes?inquiry=INQ-2026-999&tab=quotes")).toBe("INQ-2026-999");
    expect(parseInquiryDeepLink("?inquiry=INQ-2026-777")).toBe("INQ-2026-777");
    expect(parseInquiryDeepLink("https://youguard.net/dashboard/vehicles")).toBeNull();
  });
});

