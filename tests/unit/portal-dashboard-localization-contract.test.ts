import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

type TranslationDocument = { portal: Record<string, string> };

const dashboardCopyKeys = [
  "adminView",
  "recentUpdates",
  "recentRecordsSubtitle",
  "awaitingQuote",
  "lowStockSubtitle",
  "modelLibrarySubtitle",
  "searchVehicleModels",
  "modelSearchPlaceholder",
  "vehicleResourcesSubtitle",
  "refreshVehicleResources",
  "inquiryManagementTitle",
  "inquiryManagementSubtitle",
  "allInquiryStatuses",
  "newInquiry",
  "quoted",
  "negotiating",
  "accepted",
  "closed",
  "createQuotation",
  "startInquiry",
  "orderManagementTitle",
  "orderManagementSubtitle",
  "noOrders",
  "paymentsTitle",
  "paymentsSubtitle",
  "noFinanceRecords",
  "exportWorkflowTitle",
  "exportWorkflowSubtitle",
  "noExportWorkflowRecords",
  "customerAccountsTitle",
  "customerAccountsSubtitle",
  "noCustomerAccounts",
  "staffAccountsTitle",
  "staffAccountsSubtitle",
  "noStaffAccounts",
] as const;

function translations(locale: "en" | "zh" | "am"): TranslationDocument {
  return JSON.parse(readFileSync(`i18n/translations/${locale}.json`, "utf8"));
}

for (const locale of ["en", "zh", "am"] as const) {
  test(`${locale} has localized copy for every audited dashboard UI label`, () => {
    const portal = translations(locale).portal;

    for (const key of dashboardCopyKeys) {
      expect(portal[key]).toBeDefined();
      expect(portal[key].trim()).not.toBe("");
    }
  });
}
