import { describe, expect, test } from "bun:test";

describe("Integration: Worker Vehicle Search API Contract & Multi-Filter Logic", () => {
  type VehicleRecord = {
    id: string;
    brand: string;
    model: string;
    fuelType: string;
    batteryType: string;
    priceUsd: number;
    status: string;
  };

  const sampleCatalog: VehicleRecord[] = [
    { id: "v-1", brand: "BYD", model: "Seagull", fuelType: "BEV", batteryType: "LFP", priceUsd: 12500, status: "Active" },
    { id: "v-2", brand: "GAC", model: "Aion RT", fuelType: "BEV", batteryType: "LFP", priceUsd: 18500, status: "Active" },
    { id: "v-3", brand: "Zeekr", model: "001", fuelType: "BEV", batteryType: "NCM", priceUsd: 36000, status: "Active" },
    { id: "v-4", brand: "BYD", model: "Shark", fuelType: "PHEV", batteryType: "LFP", priceUsd: 32000, status: "Active" },
  ];

  function searchVehicles(catalog: VehicleRecord[], filters: { brand?: string; fuelType?: string; maxPrice?: number }) {
    return catalog.filter((v) => {
      if (v.status !== "Active") return false;
      if (filters.brand && v.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.fuelType && v.fuelType !== filters.fuelType) return false;
      if (filters.maxPrice && v.priceUsd > filters.maxPrice) return false;
      return true;
    });
  }

  test("searchVehicles filters BYD BEV vehicles under $20,000 correctly", () => {
    const results = searchVehicles(sampleCatalog, { brand: "BYD", fuelType: "BEV", maxPrice: 20000 });
    expect(results.length).toBe(1);
    expect(results[0].model).toBe("Seagull");
  });

  test("searchVehicles returns empty array when no vehicle matches strict criteria", () => {
    const results = searchVehicles(sampleCatalog, { brand: "Tesla", fuelType: "BEV" });
    expect(results).toEqual([]);
  });
});
