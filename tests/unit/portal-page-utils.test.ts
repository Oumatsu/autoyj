import { describe, expect, test } from "bun:test";
import {
  buildInquiryVehiclePickerOptions,
  buildSellableModels,
  buildModelProfileGroups,
  buildVehicleResourceVariants,
  isStockAlertEligible,
  vehiclesForSellableModel,
} from "../../app/portal/page";

describe("buildInquiryVehiclePickerOptions", () => {
  test("returns empty array for empty vehicles list", () => {
    const opts = buildInquiryVehiclePickerOptions([]);
    expect(opts).toEqual([]);
  });

  test("groups vehicles by brand then model and sorts options", () => {
    const v1: any = {
      id: "V-1",
      brand: "BYD",
      model: "Han EV",
      year: "2024",
      trim: "Flagship",
      configuration: "FWD",
      steering: "LHD",
      marketVersion: "Global",
      exteriorColor: "Black",
      interiorColor: "Black",
    };
    const v2: any = {
      id: "V-2",
      brand: "BYD",
      model: "Seal",
      year: "2024",
      trim: "Performance",
      configuration: "AWD",
      steering: "LHD",
      marketVersion: "Global",
      exteriorColor: "White",
      interiorColor: "Grey",
    };
    const v3: any = {
      id: "V-3",
      brand: "Changan",
      model: "Deepal SL03",
      year: "2024",
      trim: "Max",
      configuration: "RWD",
      steering: "LHD",
      marketVersion: "Global",
      exteriorColor: "Blue",
      interiorColor: "Black",
    };

    const options = buildInquiryVehiclePickerOptions([v2, v3, v1]);
    expect(options).toHaveLength(3);
    // Sorted: BYD Han EV, BYD Seal, Changan Deepal SL03
    expect(options[0].brand).toBe("BYD");
    expect(options[0].model).toBe("Han EV");
    expect(options[0].variants).toBeDefined();
    expect(options[0].variants.length).toBeGreaterThan(0);

    expect(options[1].brand).toBe("BYD");
    expect(options[1].model).toBe("Seal");

    expect(options[2].brand).toBe("Changan");
    expect(options[2].model).toBe("Deepal SL03");
  });
});

describe("buildSellableModels", () => {
  test("returns empty array when bootstrap data has no vehicles", () => {
    const data: any = {
      vehicles: [],
      vehicleModels: [],
      vehicleModelSpecs: [],
    };
    const result = buildSellableModels(data);
    expect(result).toEqual([]);
  });

  test("aggregates vehicles into sellable models with stock, pricing, and offers", () => {
    const modelInfo: any = {
      id: "M-BYD-SEAL",
      brand: "BYD",
      model: "Seal",
      bodyType: "Sedan",
      imageUrl: "https://example.com/seal.jpg",
    };

    const v1: any = {
      id: "V-1",
      brand: "BYD",
      model: "Seal",
      modelId: "M-BYD-SEAL",
      year: "2024",
      trim: "Excellence",
      exteriorColor: "Black",
      interiorColor: "Black",
      stockQuantity: 5,
      waitDays: 0, // In Stock
      price: 25000,
      recommendationRank: 2,
      priceTermsList: [
        { term: "FOB", amount: 25000 },
        { term: "EXW", amount: 24000 },
      ],
    };

    const v2: any = {
      id: "V-2",
      brand: "BYD",
      model: "Seal",
      modelId: "M-BYD-SEAL",
      year: "2024",
      trim: "Design",
      exteriorColor: "White",
      interiorColor: "Grey",
      stockQuantity: 0,
      colorStockQuantity: 10,
      waitDays: 14, // Preorder
      price: 22000,
      recommendationRank: 1,
      priceTermsList: [
        { term: "FOB", amount: 22000 },
        { term: "EXW", amount: 21000 },
      ],
    };

    const data: any = {
      vehicleModels: [modelInfo],
      vehicles: [v1, v2],
    };

    const result = buildSellableModels(data);
    expect(result).toHaveLength(1);

    const item = result[0];
    expect(item.brand).toBe("BYD");
    expect(item.model).toBe("Seal");
    expect(item.segment).toBe("Sedan");
    expect(item.imageUrl).toBe("https://example.com/seal.jpg");
    expect(item.stockQuantity).toBe(15);
    expect(item.hasStockQuantity).toBe(true);
    expect(item.preorderAvailable).toBe(true);
    expect(item.recommendationRank).toBe(1);
    expect(item.fobPriceRange).toContain("22,000");
    expect(item.fobPriceRange).toContain("25,000");

    expect(item.priceTermsSummary).toEqual([
      { term: "FOB", min: 22000, max: 25000 },
      { term: "EXW", min: 21000, max: 24000 },
    ]);

    expect(item.offers).toHaveLength(2);
    // In Stock offer should come first
    expect(item.offers[0].vehicle.id).toBe("V-1");
    expect(item.offers[1].vehicle.id).toBe("V-2");
  });

  test("uses the unified catalogue model when an offer uses a Qin EV or DM-i suffix", () => {
    const result = buildSellableModels({
      vehicleModels: [{ id: "qin-l", brand: "BYD", model: "Qin L", bodyType: "Mid-size Sedan" }],
      vehicles: [
        { id: "ev", brand: "BYD", model: "Qin L EV", year: "2025", trim: "EV 545", waitDays: 0, stockQuantity: 2 },
        { id: "dmi", brand: "BYD", model: "Qin L Dmi", year: "2025", trim: "DM-i 120", waitDays: 45, stockQuantity: 0 },
      ],
    } as any);

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Qin L");
    expect(result[0].offers).toHaveLength(2);
    expect(result[0].segment).toBe("Mid-size Sedan");
  });

  test("keeps the vehicle's source model when its model ID incorrectly points to another model", () => {
    const result = buildSellableModels({
      vehicleModels: [{ id: "MDL-072", brand: "BYD", model: "Atto 3", bodyType: "SUV" }],
      vehicles: [{ id: "yuan", brand: "BYD", model: "Yuan Plus", modelId: "MDL-072", year: "2025", trim: "430km", waitDays: 0, stockQuantity: 1 }],
    } as any);

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Yuan Plus");
    expect(result[0].vehicles.map((vehicle) => vehicle.id)).toEqual(["yuan"]);
  });

  test("does not present an energy type as a body category when source classification is absent", () => {
    const result = buildSellableModels({
      vehicleModels: [],
      vehicles: [{ id: "unknown", brand: "Example", model: "Unclassified EV", year: "2025", trim: "", waitDays: 45, stockQuantity: 0 }],
    } as any);

    expect(result[0].segment).toBe("Other");
  });
});

describe("isStockAlertEligible", () => {
  test("alerts only verified in-stock offers with a low numeric inventory", () => {
    expect(isStockAlertEligible({ waitDays: 0, colorStockQuantity: 2 } as any)).toBe(true);
    expect(isStockAlertEligible({ waitDays: 0, colorStockQuantity: 0 } as any)).toBe(true);
    expect(isStockAlertEligible({ waitDays: 45, colorStockQuantity: 0 } as any)).toBe(false);
    expect(isStockAlertEligible({ waitDays: 0, colorStockQuantity: null } as any)).toBe(false);
  });
});

describe("buildModelProfileGroups", () => {
  test("returns empty array when bootstrap data has no vehicle models", () => {
    const data: any = {
      vehicleModels: [],
      vehicleModelSpecs: [],
    };
    const result = buildModelProfileGroups(data);
    expect(result).toEqual([]);
  });

  test("groups active vehicle models and attaches specs, gallery, and price summaries", () => {
    const spec1: any = {
      id: "SPEC-1",
      modelId: "M-1",
      category: "基本参数",
      name: "车身级别",
      value: "中型车",
    };
    const spec2: any = {
      id: "SPEC-2",
      modelId: "M-1",
      category: "基本参数",
      name: "CLTC续航",
      value: "650km",
    };

    const m1: any = {
      id: "M-1",
      brand: "BYD",
      model: "Seal",
      year: "2024",
      trim: "700km 性能版",
      status: "active",
      recommendationRank: 1,
      guidePrice: "22.98万",
    };
    const m2: any = {
      id: "M-2",
      brand: "BYD",
      model: "Seal",
      year: "2023",
      trim: "550km 标准版",
      status: "published",
      recommendationRank: 1,
      guidePrice: "18.98万",
    };
    const mInactive: any = {
      id: "M-3",
      brand: "BYD",
      model: "Seal Old",
      year: "2021",
      trim: "Discontinued",
      status: "archived",
    };

    const data: any = {
      vehicleModels: [m1, m2, mInactive],
      vehicleModelSpecs: [spec1, spec2],
    };

    const groups = buildModelProfileGroups(data);
    expect(groups).toHaveLength(1);

    const group = groups[0];
    expect(group.brand).toBe("BYD");
    expect(group.model).toBe("Seal");
    expect(group.years).toEqual(["2024", "2023"]);
    expect(group.variants).toHaveLength(2);
    expect(group.segment).toBe("中型车");
    expect(group.rangeSummary).toBe("650km");
  });
});

describe("buildVehicleResourceVariants", () => {
  test("returns empty array for empty vehicles list", () => {
    const result = buildVehicleResourceVariants([]);
    expect(result).toEqual([]);
  });

  test("groups vehicles into variants and color groups with location prices", () => {
    const v1: any = {
      id: "V-101",
      brand: "BYD",
      model: "Han",
      year: "2024",
      trim: "Honor Edition",
      configuration: "AWD",
      steering: "LHD",
      marketVersion: "GCC",
      exteriorColor: "Black",
      interiorColor: "Brown",
      stockQuantity: 3,
      location: "Ningbo",
      priceTermsList: [{ term: "FOB", amount: 28000 }],
    };

    const v2: any = {
      id: "V-102",
      brand: "BYD",
      model: "Han",
      year: "2024",
      trim: "Honor Edition",
      configuration: "AWD",
      steering: "LHD",
      marketVersion: "GCC",
      exteriorColor: "Black",
      interiorColor: "Brown",
      stockQuantity: 2,
      location: "Ningbo",
      priceTermsList: [{ term: "FOB", amount: 28000 }],
    };

    const variants = buildVehicleResourceVariants([v1, v2]);
    expect(variants).toHaveLength(1);

    const variant = variants[0];
    expect(variant.stockQuantity).toBe(5);
    expect(variant.hasStockQuantity).toBe(true);
    expect(variant.vehicles).toHaveLength(2);

    expect(variant.colors).toHaveLength(1);
    const colorGroup = variant.colors[0];
    expect(colorGroup.exteriorColor).toBe("Black");
    expect(colorGroup.interiorColor).toBe("Brown");
    expect(colorGroup.quantity).toBe(5);
    expect(colorGroup.priceByLocation).toEqual([
      { location: "Ningbo", term: "FOB", amount: 28000 },
    ]);
  });
});

describe("vehiclesForSellableModel", () => {
  test("returns empty array when no vehicles match the sellable model key", () => {
    const item: any = { key: "byd::seal" };
    const vehicles: any[] = [
      { brand: "BYD", model: "Han" },
      { brand: "Tesla", model: "Model 3" },
    ];
    const result = vehiclesForSellableModel(vehicles, item);
    expect(result).toEqual([]);
  });

  test("filters and sorts matching vehicles by stock status and price", () => {
    const vPreorder: any = {
      id: "V-PRE",
      brand: "BYD",
      model: "Seal",
      waitDays: 10, // Preorder
      price: 20000,
    };
    const vInStockExpensive: any = {
      id: "V-STOCK-EXP",
      brand: "BYD",
      model: "Seal",
      waitDays: 0, // In Stock
      price: 24000,
    };
    const vInStockCheaper: any = {
      id: "V-STOCK-CHEAP",
      brand: "BYD",
      model: "Seal",
      waitDays: 0, // In Stock
      price: 22000,
    };

    const sellableModels = buildSellableModels({
      vehicles: [vPreorder, vInStockExpensive, vInStockCheaper],
      vehicleModels: [],
    } as any);

    expect(sellableModels).toHaveLength(1);
    const item = sellableModels[0];

    const result = vehiclesForSellableModel([vPreorder, vInStockExpensive, vInStockCheaper], item);
    expect(result).toHaveLength(3);
    // In Stock items come first, sorted by ascending price
    expect(result[0].id).toBe("V-STOCK-CHEAP");
    expect(result[1].id).toBe("V-STOCK-EXP");
    expect(result[2].id).toBe("V-PRE");
  });
});
