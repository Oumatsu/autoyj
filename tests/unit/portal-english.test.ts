import { expect, test } from "bun:test";
import { formatPortalStatus, localizeVehicleValue, portalRoleLabels } from "@/lib/portal-english";

test("portal roles and common operational statuses have English display values", () => {
  expect(portalRoleLabels.admin).toBe("Administrator");
  expect(portalRoleLabels.customer).toBe("Customer");
  expect(formatPortalStatus("现车")).toBe("In Stock");
  expect(formatPortalStatus("待报价")).toBe("Awaiting Quote");
  expect(formatPortalStatus("已装船")).toBe("Shipped");
});

test("vehicle values use local translations without changing Chinese source display", () => {
  expect(localizeVehicleValue("海狮07EV 智驾版 610智航版", "zh")).toBe("海狮07EV 智驾版 610智航版");
  expect(localizeVehicleValue("海狮07EV 智驾版 610智航版", "en")).toBe(
    "Sealion 07 EV Smart Driving Edition 610 Smart Navigation Edition",
  );
  expect(localizeVehicleValue("左舵 / 国际版", "en")).toBe("LHD / International Version");
  expect(localizeVehicleValue("未维护的新版本", "en")).toBe("未维护的新版本");
});
