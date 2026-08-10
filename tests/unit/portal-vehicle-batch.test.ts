import { expect, test } from "bun:test";
import { buildVehicleResourceVariants } from "@/app/portal/page";

function formatYearMonth(year?: string | number | null, month?: string | number | null): string {
  if (!year && !month) return "-";
  const y = year ? String(year).trim() : "";
  let m = month ? String(month).trim() : "";
  if (m) {
    m = m.replace(/月/g, "").trim();
    if (/^\d+$/.test(m)) {
      m = m.padStart(2, "0");
    }
  }
  if (y && m) return `${y}-${m}`;
  if (y) return y;
  if (m) return m;
  return "-";
}

test("formatYearMonth correctly formats year and month combinations", () => {
  expect(formatYearMonth("2026", "8")).toBe("2026-08");
  expect(formatYearMonth("2026", "08")).toBe("2026-08");
  expect(formatYearMonth("2026", "8月")).toBe("2026-08");
  expect(formatYearMonth("2025", null)).toBe("2025");
  expect(formatYearMonth(null, "5")).toBe("05");
  expect(formatYearMonth(null, null)).toBe("-");
});

test("buildVehicleResourceVariants preserves supplier and batch fields on color vehicles", () => {
  const testVehicles: any[] = [
    {
      id: "v1",
      brand: "BYD",
      model: "Han EV",
      trim: "701km Premium",
      year: "2025",
      color: "Polar White",
      exteriorColor: "Polar White",
      interiorColor: "Obsidian Black",
      supplier: "APT",
      supplierQuoteYear: "2026",
      supplierQuoteMonth: "8",
      productionYear: "2025",
      productionMonth: "5",
      stockQuantity: 10,
      colorStockQuantity: 10,
    },
    {
      id: "v2",
      brand: "BYD",
      model: "Han EV",
      trim: "701km Premium",
      year: "2025",
      color: "Glacier Blue",
      exteriorColor: "Glacier Blue",
      interiorColor: "Obsidian Black",
      supplier: "Beijing Huachi",
      supplierQuoteYear: "2026",
      supplierQuoteMonth: "7",
      productionYear: "2026",
      productionMonth: "3",
      stockQuantity: 5,
      colorStockQuantity: 5,
    },
  ];

  const variants = buildVehicleResourceVariants(testVehicles);
  expect(variants.length).toBe(1);

  const colors = variants[0].colors;
  expect(colors.length).toBe(2);

  const whiteColor = colors.find((c) => c.exteriorColor === "Polar White");
  expect(whiteColor).toBeDefined();
  expect(whiteColor!.vehicles[0].supplier).toBe("APT");
  expect(whiteColor!.vehicles[0].supplierQuoteYear).toBe("2026");
  expect(whiteColor!.vehicles[0].supplierQuoteMonth).toBe("8");
  expect(whiteColor!.vehicles[0].productionYear).toBe("2025");
  expect(whiteColor!.vehicles[0].productionMonth).toBe("5");

  expect(formatYearMonth(whiteColor!.vehicles[0].supplierQuoteYear, whiteColor!.vehicles[0].supplierQuoteMonth)).toBe("2026-08");
  expect(formatYearMonth(whiteColor!.vehicles[0].productionYear, whiteColor!.vehicles[0].productionMonth)).toBe("2025-05");
});
