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
  expect(localizeVehicleValue("2025款 智驾版 510KM 卓越型", "en")).toBe(
    "2025 MY Smart Driving Edition 510 KM Excellence Variant",
  );
  expect(localizeVehicleValue("2026款 630KM 卓越型", "en")).toBe("2026 MY 630 KM Excellence Variant");
  expect(localizeVehicleValue("快充: 支持; 快充时间: 0.25 小时; 快充电量范围: 30-80%", "en")).toBe(
    "Fast Charge: Supported; Fast Charging Time: 0.25 hours; Fast Charging Range: 30-80%",
  );
});

test("canonical English trim names remain localized for Chinese and Amharic dashboards", () => {
  const chinese = "2026款 第四代 新蓝鲸 1.5T 精英型";
  const english = "2026 MY Fourth Generation New Blue Whale 1.5 T Elite Variant";
  expect(localizeVehicleValue(chinese, "en")).toBe(english);
  expect(localizeVehicleValue(english, "zh")).toBe(chinese);
  expect(localizeVehicleValue(english, "am")).toBe("2026 የሞዴል ዓመት አራተኛ ትውልድ አዲስ ብሉ ዌል 1.5 T ልሂቅ ልዩነት ስሪት");
});

test("canonical English trim vocabulary remains localized outside migrated Chinese source rows", () => {
  const canonical = "2025 Avatr 06 Pro Electric Version";

  expect(localizeVehicleValue(canonical, "zh")).toBe("2025 Avatr 06 专业 纯电版");
  expect(localizeVehicleValue(canonical, "am")).toBe("2025 Avatr 06 ፕሮ ኤሌክትሪክ ስሪት");
  expect(localizeVehicleValue("2025 Starlight 730 EV 500 km Deluxe", "zh")).toContain("豪华");
  expect(localizeVehicleValue("2025 Starlight 730 EV 500 km Deluxe", "am")).toContain("የቅንጦት");
  expect(localizeVehicleValue("550KM GrapefruitPlus", "zh")).toContain("葡萄柚");
  expect(localizeVehicleValue("Commercial EditionPilot TrimSmall Double Cab", "am")).toContain("የንግድ");
});

test("vehicle model detail does not render a separate trim-differences section", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).not.toContain("TRIM DIFFERENCES");
  expect(card).not.toContain("versionDifferences.map");
});

test("renders full trim specifications as a responsive ordered card grid", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).toContain('buildModelComparisonRows(group, "full")');
  expect(card).toContain("grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3");
  expect(card).toContain("sm:grid-cols-2");
  expect(card).toContain("trimVariants.map");
  expect(card).not.toContain("overflow-x-auto");
  expect(card).not.toContain("gridTemplateColumns");
  expect(card).not.toContain("sticky left-0");
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

test("dashboard model summaries preserve linked-trim metric intervals", () => {
  const handlerStart = portalApi.indexOf("async function handleGetVehicleModels");
  const handlerEnd = portalApi.indexOf("function getBaselineVehicleModels", handlerStart);
  const handler = portalApi.slice(handlerStart, handlerEnd);

  expect(portalApi).toContain('"motor_torque_min_n_m_auto"');
  expect(portalApi).toContain('"motor_torque_max_n_m_auto"');
  expect(handler).toContain("battery: batteryCapacityDisplay(fields)");
  expect(handler).toContain("range: cltcRangeDisplay(fields)");
  expect(handler).toContain("motorPower: motorPowerDisplay(fields)");
  expect(handler).toContain("motorTorque: motorTorqueDisplay(fields)");
});
