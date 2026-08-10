import { expect, test } from "bun:test";
import { formatPortalHeader, formatPortalRole, formatPortalStatus, localizeVehicleValue, portalRoleLabels } from "@/lib/portal-english";

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
  expect(localizeVehicleValue("供应商报价批次年月", "en")).toBe("Supplier Quote Date");
  expect(localizeVehicleValue("生产日期批次年月", "en")).toBe("Production Date");
  expect(localizeVehicleValue("供应商报价批次", "en")).toBe("Supplier Quote Batch");
  expect(localizeVehicleValue("生产日期批次", "en")).toBe("Production Batch");
  expect(localizeVehicleValue("供应商", "en")).toBe("Supplier");
  expect(localizeVehicleValue("外饰 / 内饰颜色", "en")).toBe("Exterior / Interior Color");
});

test("portal table headers strictly match Feishu Chinese headers in zh and clean English in en", () => {
  const feishuHeaders = [
    ["外饰 / 内饰颜色", "Exterior / Interior Color"],
    ["供应商", "Supplier"],
    ["供应商报价批次年月", "Supplier Quote Date"],
    ["生产日期批次年月", "Production Date"],
    ["车源地点", "Location"],
    ["颜色库存", "Stock"],
    ["起订数量", "Min Order"],
    ["满订数量", "Full Order"],
    ["FOB美金价", "FOB USD"],
    ["FCA美金价", "FCA USD"],
    ["EXW美金价", "EXW USD"],
    ["人民币指导价", "Guide Price (CNY)"],
    ["人民币成本价", "Cost (CNY)"],
    ["下单后需要等待天数", "Wait Days"],
    ["左右舵", "Steering"],
    ["国际国内版本", "Market Version"],
    ["审核状态", "Stage"],
    ["AI置信度", "AI Score"],
    ["审核人", "Reviewer"],
    ["开发者", "Developer"],
    ["详情", "Details"],
    ["询盘", "Inquiry"],
  ];

  for (const [zh, en] of feishuHeaders) {
    expect(formatPortalHeader(zh, "zh")).toBe(zh);
    expect(formatPortalHeader(zh, "en")).toBe(en);
  }
});

test("portal values use Amharic while preserving automotive abbreviations", () => {
  expect(formatPortalRole("admin", "am")).toBe("አስተዳዳሪ");
  expect(formatPortalStatus("现车", "am")).toBe("በክምችት ያለ");
  expect(localizeVehicleValue("左舵 / 国际版", "am")).toBe("LHD / ዓለም አቀፍ ስሪት");
  expect(localizeVehicleValue("海域青 / 海韵灰", "am")).toBe("የውቅያኖስ ሰማያዊ / የውቅያኖስ ግራጫ");
  expect(localizeVehicleValue("FOB $20,160 / 85 units", "am")).toBe("FOB $20,160 / 85 ክፍሎች");
});

