import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";

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
  expect(portalPage).toContain("formatTrimFeatureLines(item.value)");
  expect(portalPage).toContain("whitespace-pre-line");
});

test("stacks trim-difference updates vertically instead of placing versions side by side", () => {
  const card = portalPage.slice(
    portalPage.indexOf("function ModelFullSpecsCard"),
    portalPage.indexOf("function ModelGalleryCarousel"),
  );

  expect(card).toContain('className="mt-3 grid gap-2"');
  expect(card).toContain('border-l-2 border-[#5ee6d8]/40');
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
