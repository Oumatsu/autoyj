import { describe, expect, test } from "bun:test";
import {
  buildModelProfileGroups,
  buildSellableModels,
  buildVehicleResourceVariants,
  vehiclesForSellableModel,
} from "../../app/portal/page";

describe("Portal vehicle resource grouping", () => {
  test("keeps a corresponding image when grouping dashboard model variants", () => {
    const groups = buildModelProfileGroups({
      vehicleModels: [
        { id: "seagull-1", brand: "BYD", model: "Seagull", trim: "", imageUrl: "", galleryImages: [] },
        {
          id: "seagull-2",
          brand: "BYD",
          model: "Seagull",
          trim: "",
          imageUrl: "/pic/revenue-king/seagull/7.webp",
          galleryImages: [
            { src: "/pic/revenue-king/seagull/7.webp", cat: "Exterior", label: "Cover" },
            { src: "/pic/revenue-king/seagull/0.webp", cat: "Exterior", label: "Front" },
          ],
        },
      ],
      vehicleModelSpecs: [],
    } as any);

    expect(groups).toHaveLength(1);
    expect(groups[0].imageUrl).toBe("/pic/revenue-king/seagull/7.webp");
    expect(groups[0].galleryImages.map((image) => image.src)).toEqual([
      "/pic/revenue-king/seagull/7.webp",
      "/pic/revenue-king/seagull/0.webp",
    ]);
  });

  test("does not turn an unavailable model image into the generic hero", () => {
    const groups = buildModelProfileGroups({
      vehicleModels: [{
        id: "avatr-06",
        brand: "Avatr",
        model: "Avatr 06",
        trim: "",
        imageUrl: "/pic/hero/0.webp",
        galleryImages: [{ src: "/pic/hero/0.webp" }],
      }],
      vehicleModelSpecs: [],
    } as any);

    expect(groups[0].imageUrl).toBe("");
    expect(groups[0].galleryImages).toEqual([]);
  });

  test("does not include a resource-only model in the vehicle-model navigator", () => {
    const groups = buildModelProfileGroups({
      vehicleModels: [],
      vehicles: [{ id: "huajing-s", brand: "Wuling", model: "Huajing S", year: "2025", trim: "", waitDays: 45, stockQuantity: 0 }],
      vehicleModelSpecs: [],
    } as any);

    expect(groups).toHaveLength(0);
  });

  test("uses the model master record even when an inventory record has a different brand", () => {
    const groups = buildModelProfileGroups({
      vehicleModels: [{
        id: "MDL-032-trim-1",
        model_id: "MDL-032",
        brand: "Deepal",
        model: "Deepal S05",
        trim: "520 Plus",
        imageUrl: "/pic/revenue-king/S05/1.webp",
        galleryImages: [{ src: "/pic/revenue-king/S05/1.webp" }],
      }],
      vehicles: [{
        id: "source-s05",
        modelId: "MDL-032",
        brand: "Changan",
        model: "Deepal S05",
        trim: "520 Plus",
        year: "2025",
        waitDays: 0,
        stockQuantity: 12,
      }],
      vehicleModelSpecs: [],
    } as any);

    expect(groups).toHaveLength(1);
    expect(groups[0].brand).toBe("Deepal");
    expect(groups[0].model).toBe("Deepal S05");
    expect(groups[0].variants).toHaveLength(1);
  });

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
        colorStockQuantity: 10,
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
        colorStockQuantity: 8,
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
        colorStockQuantity: 12,
        price: 21000,
        priceTermsList: [{ term: "FOB", amount: 21000 }],
      },
    ];
    const data = { vehicles, vehicleModels: [] } as any;

    const models = buildSellableModels(data);

    expect(models).toHaveLength(1);
    expect(models[0].stockQuantity).toBe(30);
    expect(models[0].priceTermsSummary).toEqual([
      { term: "FOB", min: 20000, max: 21000 },
    ]);
    expect(vehiclesForSellableModel(vehicles as any, models[0]).map((vehicle) => vehicle.supplier)).toEqual([
      "Supplier A",
      "Supplier A",
      "Supplier B",
    ]);
  });

  test("groups same trim colors below one variant and derives variant stock from color stock", () => {
    const vehicles = [
      {
        id: "white",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Dynamic",
        configuration: "510 km",
        supplier: "Supplier A",
        location: "Shanghai",
        exteriorColor: "White",
        interiorColor: "Black",
        colorStockQuantity: 10,
        stockQuantity: 99,
        waitDays: 0,
      },
      {
        id: "blue",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Dynamic",
        configuration: "510 km",
        supplier: "Supplier B",
        location: "Tianjin",
        exteriorColor: "Blue",
        interiorColor: "Black",
        colorStockQuantity: 8,
        stockQuantity: 99,
        waitDays: 0,
      },
      {
        id: "premium",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Premium",
        configuration: "605 km",
        supplier: "Supplier A",
        exteriorColor: "Blue",
        interiorColor: "Black",
        colorStockQuantity: 12,
        stockQuantity: 99,
        waitDays: 0,
      },
    ];

    const variants = buildVehicleResourceVariants(vehicles as any);

    expect(variants).toHaveLength(2);
    expect(variants[0].stockQuantity).toBe(18);
    expect(variants[0].colors.map((color) => [color.exteriorColor, color.quantity, color.vehicles[0].supplier])).toEqual([
      ["Blue", 8, "Supplier B"],
      ["White", 10, "Supplier A"],
    ]);
    expect(variants[1].stockQuantity).toBe(12);
  });

  test("deduplicates identical price terms for a color supplied by multiple records", () => {
    const variants = buildVehicleResourceVariants([
      {
        id: "supplier-a",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Pilot",
        configuration: "520 km",
        exteriorColor: "海域青",
        interiorColor: "海韵灰",
        supplier: "Supplier A",
        colorStockQuantity: 40,
        waitDays: 0,
        price: 20685,
        priceTermsList: [{ term: "FOB", amount: 20685 }],
      },
      {
        id: "supplier-b",
        brand: "BYD",
        model: "Sealion 06",
        year: "2025",
        trim: "Pilot",
        configuration: "520 km",
        exteriorColor: "海域青",
        interiorColor: "海韵灰",
        supplier: "Supplier B",
        colorStockQuantity: 45,
        waitDays: 0,
        price: 20685,
        priceTermsList: [{ term: "FOB", amount: 20685 }],
      },
    ] as any);

    expect((variants[0].colors[0] as any).priceTerms).toEqual([
      { term: "FOB", amount: 20685 },
    ]);
  });
});
