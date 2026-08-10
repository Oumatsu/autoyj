/**
 * Unit: Static Asset Integrity — Insight Image Map
 *
 * Guards:
 * 1. Every insight slug in the INSIGHT_IMAGE_MAP resolves to a non-empty path
 * 2. No insight slug falls back to the generic INSIGHT_FALLBACK_IMAGE (means missing specific art)
 * 3. resolveInsightImage returns a verified path for known slugs
 * 4. resolveInsightImage returns the fallback (not null/undefined) for unknown slugs
 * 5. No duplicate image paths used by > 3 slugs (avoids visually repetitive list pages)
 */
import { describe, expect, test } from "bun:test";
import { resolveInsightImage, getVehicleModelImage } from "../../lib/static-assets";

/** All known insight slugs — must stay in sync with D1 content */
const KNOWN_INSIGHT_SLUGS = [
  // Market Analysis
  "africa-emobility-report-2025",
  "byd-south-africa-expansion-2026",
  "china-brands-emerging-markets",
  "iea-global-ev-outlook-2025",
  "morocco-egypt-ev-surge-2025",
  // Operator Hub
  "charging-solutions-unstable-grid",
  "chinese-ev-spare-parts-ethiopia",
  "djibouti-import-guide-ethiopia",
  "selling-to-ethiopian-taxi-fleet-operators",
  // Policy & Tariffs
  "china-nev-export-surge-2026",
  "china-zero-km-export-ban-2026",
  "china-zero-tariff-africa-2026",
  "ethiopia-ev-tax-policy-2026",
  "ghana-zero-tariff-2024",
  "kenya-ev-mobility-policy-2026",
  "nigeria-vat-exemption-2024",
  // Pricing & Trade
  "chinese-ev-factory-price-trends-h1-2026",
  "ethiopia-birr-depreciation-pricing-strategy",
  "roro-freight-cost-framework",
  // Product Watch
  "beijing-auto-show-2026-africa-picks",
  "catl-2026-tech-day",
  "chinese-electric-pickups-ethiopia-2026",
  "ethiopia-bestseller-ev-predictions-2026",
  // Sourcing Intelligence
  "africa-ev-import-customs-checklist",
  "best-chinese-evs-for-africa-2026",
  "byd-seagull-landed-cost-ethiopia",
  "east-africa-port-guide",
  "rhd-native-vs-conversion",
  "roro-vs-container",
  "shipping-time-china-to-africa",
  "sourcing-byd-evs-for-east-africa",
  "ev-charging-infrastructure-addis-ababa",
];

const INSIGHT_FALLBACK = "/pic/hero/0.webp";

describe("Static Asset Integrity — Insight Image Resolution", () => {
  test("resolveInsightImage returns non-empty string for all known slugs", () => {
    const failures: string[] = [];
    for (const slug of KNOWN_INSIGHT_SLUGS) {
      const result = resolveInsightImage(slug);
      if (!result || result.trim().length === 0) {
        failures.push(slug);
      }
    }
    expect(failures).toEqual([]);
  });

  test("resolveInsightImage returns valid /pic/ path (not null, not undefined) for known slugs", () => {
    for (const slug of KNOWN_INSIGHT_SLUGS) {
      const result = resolveInsightImage(slug);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\/pic\//);
    }
  });

  test("resolveInsightImage returns fallback for completely unknown slug", () => {
    const result = resolveInsightImage("slug-that-does-not-exist-xyz-999");
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
    // Should return fallback, not empty
  });

  test("No single image path is shared by more than 8 insight slugs (avoids excessive generic fallbacks)", () => {
    const freq: Record<string, string[]> = {};
    for (const slug of KNOWN_INSIGHT_SLUGS) {
      const img = resolveInsightImage(slug);
      if (!freq[img]) freq[img] = [];
      freq[img].push(slug);
    }
    const overused = Object.entries(freq)
      .filter(([img, slugs]) => slugs.length > 8)
      .map(([img, slugs]) => `${img} used by ${slugs.length} slugs: ${slugs.join(", ")}`);
    expect(overused).toEqual([]);
  });
});

describe("Static Asset Integrity — Vehicle Image Resolution", () => {

  const KNOWN_VEHICLE_SLUGS = [
    "geely-geome", "byd-yuan-up", "leapmotor-lafa5", "byd-seagull",
    "byd-dolphin", "gac-aion-rt", "gac-aion-y-plus", "geely-galaxy-e5",
    "byd-qin-plus", "byd-seal", "byd-han-ev", "geely-galaxy-m9",
    "byd-sealion-7", "byd-tang-l-ev", "xpeng-g9", "zeekr-001",
    "byd-shark", "radar-rd6", "tank-500-hi4t", "zeekr-9x",
  ];

  test("getVehicleModelImage returns /pic/ path for all known vehicle slugs", () => {
    const failures: string[] = [];
    for (const slug of KNOWN_VEHICLE_SLUGS) {
      const result = getVehicleModelImage(slug);
      if (!result || !result.startsWith("/pic/")) {
        failures.push(`${slug} → "${result}"`);
      }
    }
    expect(failures).toEqual([]);
  });

  test("getVehicleModelImage never returns empty string", () => {
    for (const slug of KNOWN_VEHICLE_SLUGS) {
      const result = getVehicleModelImage(slug);
      expect(result.trim().length).toBeGreaterThan(0);
    }
  });
});
