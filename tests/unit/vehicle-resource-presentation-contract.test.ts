import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

const portalSource = readFileSync("server/api/portal.ts", "utf8");
const pageSource = readFileSync("app/portal/page.tsx", "utf8");

test("external roles resolve their own FOB fields before the shared fallback", () => {
  const start = portalSource.indexOf("async function handleGetVehicles");
  const end = portalSource.indexOf("function normalizeTrimName", start);
  const handler = portalSource.slice(start, end);

  expect(handler).toContain('session.role === "partner" ? partnerFobUsd');
  expect(handler).toContain('session.role === "customer" ? customerFobUsd');
});

test("vehicle presentation maps model style, English colors, and recommendation ranking", () => {
  const start = portalSource.indexOf("async function handleGetVehicles");
  const end = portalSource.indexOf("function normalizeTrimName", start);
  const handler = portalSource.slice(start, end);

  expect(handler).toContain('"车型款式"');
  expect(handler).toContain('"外饰颜色英文"');
  expect(handler).toContain('"内饰颜色英文"');
  expect(handler).toContain('"网站推荐位"');
});

test("vehicle presentation reads the synced vehicle model-year field", () => {
  const start = portalSource.indexOf("async function handleGetVehicles");
  const end = portalSource.indexOf("function normalizeTrimName", start);
  const handler = portalSource.slice(start, end);

  expect(handler).toContain('rowField(fields, "model_style", "车型年款", "车型款式")');
});

test("vehicle resources label every displayed price with its source location", () => {
  const start = pageSource.indexOf("function AdminVehicles");
  const end = pageSource.indexOf("function VehicleInquiryPanel", start);
  const panel = pageSource.slice(start, end);

  expect(panel).toContain("priceByLocation");
  expect(panel).toContain("price.location");
});

test("zero wait days are displayed as in-stock availability", () => {
  const start = pageSource.indexOf("function AdminVehicles");
  const end = pageSource.indexOf("function VehicleInquiryPanel", start);
  const panel = pageSource.slice(start, end);

  expect(panel).toContain('v.waitDays === 0 ? t("portal.availableNow")');
  expect(panel).toContain('count === 0 ? t("portal.availableNow") : t("portal.dayCount", { count })');
});

test("inquiry vehicle picker has the model-to-trim-to-color option builder it invokes", () => {
  expect(pageSource).toContain("export function buildInquiryVehiclePickerOptions(vehicles: Vehicle[])");
  expect(pageSource).toContain("variants: buildVehicleResourceVariants(model.vehicles)");
});

test("internal vehicle-resource rows show the synced model style as model year", () => {
  const start = pageSource.indexOf("function AdminVehicles");
  const end = pageSource.indexOf("function VehicleInquiryPanel", start);
  const panel = pageSource.slice(start, end);

  expect(panel).toContain('formatPortalHeader("车型款式", locale)');
  expect(panel).toContain('v.modelStyle || "-"');
});

test("model navigator can collapse and configuration uses the full trim comparison table", () => {
  const start = pageSource.indexOf("function AdminProfiles");
  const end = pageSource.indexOf("function AdminVehicles", start);
  const profiles = pageSource.slice(start, end);
  const cardStart = pageSource.indexOf("function ModelFullSpecsCard");
  const cardEnd = pageSource.indexOf("function ModelGalleryCarousel", cardStart);
  const card = pageSource.slice(cardStart, cardEnd);

  expect(profiles).toContain("setNavigatorCollapsed");
  expect(card).toContain('buildModelComparisonRows(group, "full")');
  expect(card).toContain("gridTemplateColumns");
});

test("shared vehicle builders sort recommendation rank before ordinary availability", () => {
  const start = pageSource.indexOf("export function buildSellableModels");
  const end = pageSource.indexOf("function modelMatchesAdminFilters", start);
  const builder = pageSource.slice(start, end);

  expect(builder).toContain("recommendationRank");
  expect(builder).toContain("compareRecommendationRanks");
});

test("admin recommendation updates write Feishu first and then refresh D1", () => {
  expect(portalSource).toContain("async function handleUpdateVehicleRecommendation");
  const start = portalSource.indexOf("async function handleUpdateVehicleRecommendation");
  const end = portalSource.indexOf("export async function handleScheduledSync", start);
  const handler = portalSource.slice(start, end);

  expect(handler).toContain('session.role !== "admin"');
  expect(handler).toContain('"PUT"');
  expect(handler.indexOf('"PUT"')).toBeLessThan(handler.indexOf("syncVehiclesToD1(env)"));
  expect(portalSource).toContain('path.match(/^\\/api\\/portal\\/vehicles\\/([^/]+)\\/recommendation$/)');
});

test("admin vehicle resources expose a rank editor while external users do not", () => {
  const start = pageSource.indexOf("function AdminVehicles");
  const end = pageSource.indexOf("function VehicleInquiryPanel", start);
  const panel = pageSource.slice(start, end);

  expect(panel).toContain("saveRecommendationRank");
  expect(panel).toContain("Recommendation rank");
  expect(panel).toContain("canSeeSupplier &&");
});
