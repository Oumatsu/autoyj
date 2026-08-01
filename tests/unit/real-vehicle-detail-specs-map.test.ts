import { describe, expect, test } from "bun:test";
import { vehicles as eliteVehicles } from "../../app/products/elite-flagship/data";
import { vehicles as revenueVehicles } from "../../app/products/revenue-king/data";
import { vehicles as utilityVehicles } from "../../app/products/utility-pro/data";

describe("Unit: Real Vehicle Manifest & Data Integrity", () => {
  const allVehicles = [...revenueVehicles, ...eliteVehicles, ...utilityVehicles];

  test("Every vehicle in the catalog manifest has non-empty brand, name, tags and valid link", () => {
    for (const vehicle of allVehicles) {
      expect(typeof vehicle.brand).toBe("string");
      expect(vehicle.brand.length).toBeGreaterThan(0);

      expect(typeof vehicle.name).toBe("string");
      expect(vehicle.name.length).toBeGreaterThan(0);

      expect(Array.isArray(vehicle.tags)).toBe(true);
      expect(vehicle.tags.length).toBeGreaterThan(0);

      expect(typeof vehicle.img).toBe("string");
      expect(vehicle.img.startsWith("/pic/")).toBe(true);

      expect(typeof vehicle.link).toBe("string");
      expect(vehicle.link.startsWith("/products/")).toBe(true);
    }
  });

  test("Revenue King category includes BYD Seagull, GAC Aion RT, BYD Qin PLUS, Geely Galaxy E5", () => {
    const links = revenueVehicles.map((v) => v.link);
    expect(links.some((l) => l.includes("byd-seagull"))).toBe(true);
    expect(links.some((l) => l.includes("gac-aion-rt"))).toBe(true);
    expect(links.some((l) => l.includes("byd-qin-plus"))).toBe(true);
    expect(links.some((l) => l.includes("geely-galaxy-e5"))).toBe(true);
  });

  test("Utility Pro category includes BYD Shark, Radar RD6, Farizon Xingxiang V", () => {
    const links = utilityVehicles.map((v) => v.link);
    expect(links.some((l) => l.includes("byd-shark"))).toBe(true);
    expect(links.some((l) => l.includes("radar-rd6"))).toBe(true);
    expect(links.some((l) => l.includes("farizon-xingxiang-v"))).toBe(true);
  });
});
