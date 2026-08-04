import { describe, expect, test } from "bun:test";
import { buildSellableModels, vehiclesForSellableModel } from "../../app/portal/page";

describe("Portal vehicle resource grouping", () => {
  test("groups matching vehicles across years and keeps supplier resources in the detail rows", () => {
    const vehicles = [
      {
        id: "rec-2025",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Dynamic",
        supplier: "Supplier A",
        exteriorColor: "White",
        interiorColor: "Black",
        configuration: "",
        waitDays: 0,
        stockQuantity: 10,
        modelStockQuantity: 100,
        price: 20000,
        priceTermsList: [{ term: "FOB", amount: 20000 }],
      },
      {
        id: "rec-2025-blue",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Dynamic",
        supplier: "Supplier A",
        exteriorColor: "Blue",
        interiorColor: "Black",
        configuration: "",
        waitDays: 0,
        stockQuantity: 8,
        modelStockQuantity: 100,
        price: 20000,
        priceTermsList: [{ term: "FOB", amount: 20000 }],
      },
      {
        id: "rec-2026",
        brand: "BYD",
        model: "BYDSealion06",
        year: "2026",
        trim: "Premium",
        supplier: "Supplier B",
        exteriorColor: "Blue",
        interiorColor: "Black",
        configuration: "",
        waitDays: 0,
        stockQuantity: 12,
        modelStockQuantity: 100,
        price: 21000,
        priceTermsList: [{ term: "FOB", amount: 21000 }],
      },
    ];
    const data = { vehicles, vehicleModels: [] } as any;

    const models = buildSellableModels(data);

    expect(models).toHaveLength(1);
    expect(models[0].stockQuantity).toBe(200);
    expect(vehiclesForSellableModel(vehicles as any, models[0]).map((vehicle) => vehicle.supplier)).toEqual([
      "Supplier A",
      "Supplier A",
      "Supplier B",
    ]);
  });
});
