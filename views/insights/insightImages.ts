const INSIGHT_IMAGE_MAP: Record<string, string> = {
  // Market Analysis
  "africa-emobility-report-2025": "/pic/hero/photo-1593941707882-a5bba14938c7.webp",
  "byd-south-africa-expansion-2026": "/pic/revenue-king/seagull/7cut.webp",
  "china-brands-emerging-markets": "/pic/hero/Galaxye5 display.webp",
  "iea-global-ev-outlook-2025": "/pic/hero/photo-1521791136064-7986c2920216.webp",
  "morocco-egypt-ev-surge-2025": "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp",

  // Operator Hub
  "charging-solutions-unstable-grid": "/pic/hero/photo-1593941707882-a5bba14938c7.webp",
  "chinese-ev-spare-parts-ethiopia": "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
  "djibouti-import-guide-ethiopia": "/pic/hero/photo-1578575437130-527eed3abbec.webp",
  "selling-to-ethiopian-taxi-fleet-operators": "/pic/academy/photo-1527853787696-f7be74f2e39a.webp",

  // Policy & Tariffs
  "china-nev-export-surge-2026": "/pic/hero/supervan display.webp",
  "china-zero-km-export-ban-2026": "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
  "china-zero-tariff-africa-2026": "/pic/hero/photo-1521791136064-7986c2920216.webp",
  "ethiopia-ev-tax-policy-2026": "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
  "ghana-zero-tariff-2024": "/pic/academy/photo-1486312338219-ce68d2c6f44d.webp",
  "kenya-ev-mobility-policy-2026": "/pic/academy/photo-1560250097-0b93528c311a.webp",
  "nigeria-vat-exemption-2024": "/pic/academy/photo-1518770660439-4636190af475.webp",

  // Pricing & Trade
  "chinese-ev-factory-price-trends-h1-2026": "/pic/revenue-king/qinplusev/5cut.webp",
  "ethiopia-birr-depreciation-pricing-strategy": "/pic/academy/photo-1527853787696-f7be74f2e39a.webp",
  "roro-freight-cost-framework": "/pic/hero/photo-1578575437130-527eed3abbec.webp",

  // Product Watch
  "beijing-auto-show-2026-africa-picks": "/pic/hero/SU7ultra display.webp",
  "catl-2026-tech-day": "/pic/academy/photo-1518770660439-4636190af475.webp",
  "chinese-electric-pickups-ethiopia-2026": "/pic/hero/RD6 display0.webp",
  "ethiopia-bestseller-ev-predictions-2026": "/pic/hero/M9 display.webp",

  // Sourcing Intelligence
  "africa-ev-import-customs-checklist": "/pic/hero/photo-1578575437130-527eed3abbec.webp",
  "best-chinese-evs-for-africa-2026": "/pic/hero/Galaxye5 display.webp",
  "byd-seagull-landed-cost-ethiopia": "/pic/revenue-king/seagull/7cut.webp",
  "east-africa-port-guide": "/pic/hero/photo-1578575437130-527eed3abbec.webp",
  "rhd-native-vs-conversion": "/pic/hero/Our-solutions-durability-and-fatigue.webp",
  "roro-vs-container": "/pic/hero/photo-1578575437130-527eed3abbec.webp",
  "shipping-time-china-to-africa": "/pic/hero/photo-1578575437130-527eed3abbec.webp",
  "sourcing-byd-evs-for-east-africa": "/pic/revenue-king/seagull/7cut.webp",
  "ev-charging-infrastructure-addis-ababa": "/pic/hero/photo-1593941707882-a5bba14938c7.webp",
};

export function getInsightImage(slug: string, coverImage?: string): string {
  if (coverImage && coverImage.startsWith("/pic/")) return coverImage;
  if (slug && INSIGHT_IMAGE_MAP[slug]) return INSIGHT_IMAGE_MAP[slug];
  return "/pic/hero/photo-1593941707882-a5bba14938c7.webp";
}
