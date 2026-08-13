import { expect, test } from "bun:test";
import fs from "node:fs";
import path from "node:path";

const portalPage = fs.readFileSync(path.resolve(import.meta.dir, "../../app/portal/page.tsx"), "utf8");
const cardStart = portalPage.indexOf("function ModelFullSpecsCard");
const cardEnd = portalPage.indexOf("\nfunction ", cardStart + 1);
const modelFullSpecsCard = portalPage.slice(cardStart, cardEnd);

test("vehicle model overview omits fields not supplied by the D1 model route", () => {
  expect(modelFullSpecsCard).not.toContain('t("portal.energyConsumption")');
  expect(modelFullSpecsCard).not.toContain('t("portal.batteryMaker")');
  expect(modelFullSpecsCard).not.toContain('t("portal.suspension")');
  expect(modelFullSpecsCard).not.toContain('t("portal.adas")');
  expect(modelFullSpecsCard).not.toContain("Export Compliance / Notes");
  expect(modelFullSpecsCard).not.toContain("出口合规/备注");
});
