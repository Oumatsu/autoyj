import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { localizeVehicleValue } from "@/lib/portal-english";

const portalApi = readFileSync("server/api/portal.ts", "utf8");
const portalPage = readFileSync("app/portal/page.tsx", "utf8");

test("maps each D1 trim's added and upgraded fields without a fragile verification field", () => {
  expect(portalApi).toContain('addSpec("新增配置"');
  expect(portalApi).toContain('fields.added_features_json');
  expect(portalApi).toContain('addSpec("升级配置"');
  expect(portalApi).toContain('fields.upgraded_features_json');
  expect(portalApi).not.toContain('addSpec("版本核验状态"');
});

test("vehicle model page does not render pricing or warranty fields in the model-detail card", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).not.toContain('label: "List Price"');
  expect(card).not.toContain('label: "Verification"');
  expect(card).not.toContain("Domestic List Price");
  expect(card).not.toContain("guidePriceSummary");
  expect(card).not.toMatch(/warranty/i);
});

test("formats added and upgraded feature changes as separate readable lines", () => {
  expect(portalPage).toContain("function formatTrimFeatureLines");
  expect(portalPage).toContain("formatTrimFeatureLines(value)");
  expect(portalPage).toContain("whitespace-pre-line");
});

test("vehicle model detail localizes raw specification, trim, and change values", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).toContain("localizeVehicleValue(value, locale)");
  expect(card).toContain("localizeVehicleValue(variant.trim || variant.id, locale)");
  expect(card).toContain("formatTrimFeatureLines(value)");
});

test("English vehicle-model values translate common model-year trim and charging text without falling back to Chinese", () => {
  expect(localizeVehicleValue("2025款 暗夜骑士版", "en")).toBe("2025 MY Night Knight Edition");
  expect(localizeVehicleValue("快充: 支持; 快充时间: 0.25 小时; 快充电量范围: 30-80%", "en")).toBe(
    "Fast Charge: Supported; Fast Charging Time: 0.25 hours; Fast Charging Range: 30-80%",
  );
});

test("vehicle model detail does not render a separate trim-differences section", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).not.toContain("TRIM DIFFERENCES");
  expect(card).not.toContain("versionDifferences.map");
});

test("renders full trim specifications in one ordered horizontal comparison table", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).toContain('buildModelComparisonRows(group, "full")');
  expect(card).toContain("sticky left-0");
  expect(card).toContain("trimVariants.map");
  expect(card).not.toContain("versionDetails.map");
});

test("keeps the model list fixed while model details use a separate scroll pane", () => {
  const profiles = portalPage.slice(
    portalPage.indexOf("function AdminProfiles"),
    portalPage.indexOf("function AdminVehicles"),
  );

  expect(profiles).toContain("h-[calc(100vh-12rem)]");
  expect(profiles).toContain("overflow-y-auto");
  expect(profiles).toContain("sticky top-0");
});

test("vehicle model navigator ranks the D1 Recommendation column with lower numbers first", () => {
  const handlerStart = portalApi.indexOf("async function handleGetVehicleModels");
  const handlerEnd = portalApi.indexOf("function getBaselineVehicleModels", handlerStart);
  const handler = portalApi.slice(handlerStart, handlerEnd);
  const builderStart = portalPage.indexOf("function buildModelProfileGroups");
  const builderEnd = portalPage.indexOf("function modelProfileGroupMatchesSearch", builderStart);
  const builder = portalPage.slice(builderStart, builderEnd);

  expect(handler).toContain('rowField(row as unknown as Record<string, unknown>, "Recommendation")');
  expect(handler).toContain("recommendationRank");
  expect(builder).toContain("recommendationRankForModelGroup");
  expect(builder).toContain("compareRecommendationRanks");
});
