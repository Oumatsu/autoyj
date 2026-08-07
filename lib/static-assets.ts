import { normalizeAssetUrl } from "./content-normalizers";

type GalleryImage = { src: string; cat: string; label: string };

const VEHICLE_FALLBACK_IMAGE = "/pic/hero/0.webp";
const ACADEMY_FALLBACK_IMAGE = "/pic/academy/0.webp";
const INSIGHT_FALLBACK_IMAGE = "/pic/hero/0.webp";

const VEHICLE_IMAGE_MAP: Record<string, string> = {
  // Revenue King
  "geely-geome": "/pic/hero/Geome display.webp",
  "byd-yuan-up": "/pic/revenue-king/yuanup/5.webp",
  "leapmotor-lafa5": "/pic/revenue-king/lafa5/8cut.webp",
  "byd-seagull": "/pic/revenue-king/seagull/7.webp",
  "leapmotor-t03": "/pic/revenue-king/T03/5.webp",
  "changan-lumin": "/pic/revenue-king/lumin/5.webp",
  "wuling-bingo-plus": "/pic/revenue-king/bingoplus/5.webp",
  "byd-dolphin": "/pic/revenue-king/dolphin/7cut.webp",
  "gac-aion-rt": "/pic/revenue-king/RT/7.webp",
  "leopard-ti3": "/pic/revenue-king/Ti3/6.webp",
  "gac-aion-y-plus": "/pic/revenue-king/Yplus/5.webp",
  "geely-galaxy-e5": "/pic/revenue-king/Galaxye5/5.webp",
  "byd-qin-plus": "/pic/revenue-king/qinplusev/3.webp",
  "geely-geometry-c": "/pic/revenue-king/geometryc/6.webp",
  "gac-aion-i60": "/pic/revenue-king/I60/1.webp",
  "gac-aion-v": "/pic/revenue-king/V/1.webp",
  "deepal-s07": "/pic/revenue-king/S07/1.webp",
  "deepal-s05": "/pic/revenue-king/S05/1.webp",
  "linghui-e7": "/pic/revenue-king/E7/1.webp",
  "mg-mg4-ev": "/pic/revenue-king/MG4/1.webp",
  "dongfeng-nammi-01": "/pic/revenue-king/01/1.webp",
  "changan-nevo-q05": "/pic/revenue-king/Q05/1.webp",

  // Utility Pro
  "byd-shark": "/pic/utility-pro/shark/4cut2.webp",
  "radar-rd6": "/pic/utility-pro/RD6/7.webp",
  "tank-500-hi4t": "/pic/utility-pro/Hi4-T/3cut.webp",
  "fangchengbao-leopard-8": "/pic/utility-pro/leopard8/7.webp",
  "zeekr-9x": "/pic/utility-pro/9x/6.webp",
  "gwm-cannon-ev": "/pic/utility-pro/cannonev/7.webp",
  "dongfeng-rich-6-ev": "/pic/utility-pro/rich6ev/7.webp",
  "farizon-xingxiang-v": "/pic/utility-pro/xingxiangv/5.webp",
  "farizon-super-van": "/pic/utility-pro/supervan/1.webp",
  "farizon-t5": "/pic/utility-pro/T5/1.webp",
  "maxus-edeliver9": "/pic/utility-pro/edeliver9/1.webp",
  "foton-aumark-ev": "/pic/utility-pro/eaumark/1.webp",

  // Elite Flagship
  "byd-seal": "/pic/elite-flagship/seal/5.webp",
  "byd-han-ev": "/pic/elite-flagship/hanev/5.webp",
  "geely-galaxy-m9": "/pic/elite-flagship/M9/1.webp",
  "byd-sealion-7": "/pic/elite-flagship/sealion/13.webp",
  "fangchengbao-leopard-5": "/pic/elite-flagship/leopard5/7.webp",
  "fangchengbao-ti7": "/pic/elite-flagship/Ti7/5.webp",
  "xiaomi-yu7": "/pic/elite-flagship/YU7/7cut.webp",
  "byd-tang-l-ev": "/pic/elite-flagship/tanglev/5.webp",
  "li-auto-l6": "/pic/elite-flagship/L6/5cut.webp",
  "xpeng-g9": "/pic/elite-flagship/XpengG9/5cut.webp",
  "zeekr-001": "/pic/elite-flagship/001/1.webp",
  "xiaomi-su7-ultra": "/pic/elite-flagship/SU7ultra/6.webp",
  "stelato-s9": "/pic/elite-flagship/S9/5.webp",
  "aito-m9": "/pic/elite-flagship/M9/6.webp",
  "hongqi-e-hs9": "/pic/elite-flagship/E-HS9/1.webp",
  "leapmotor-d19": "/pic/elite-flagship/D19/1.webp",
  "voyah-taishan-x8": "/pic/elite-flagship/X8/1.webp",
  "denza-d9-dmi": "/pic/elite-flagship/denza d9 dm-i/1.webp",
  "yangwang-u8": "/pic/elite-flagship/yangwang U8/1.webp",
};

const VEHICLE_GALLERY_MANIFEST: Record<string, string[]> = {
  "geely-geome": [
    "/pic/revenue-king/Geome/0.webp",
    "/pic/revenue-king/Geome/1.webp",
    "/pic/revenue-king/Geome/2.webp",
  ],
  "byd-yuan-up": [
    "/pic/revenue-king/yuanup/0.webp",
    "/pic/revenue-king/yuanup/1.webp",
    "/pic/revenue-king/yuanup/2.webp",
  ],
  "leapmotor-lafa5": [
    "/pic/revenue-king/lafa5/0.webp",
    "/pic/revenue-king/lafa5/1.webp",
    "/pic/revenue-king/lafa5/2.webp",
  ],
  "byd-seagull": [
    "/pic/revenue-king/seagull/0.webp",
    "/pic/revenue-king/seagull/1.webp",
    "/pic/revenue-king/seagull/2.webp",
  ],
  "leapmotor-t03": [
    "/pic/revenue-king/T03/1.webp",
    "/pic/revenue-king/T03/2.webp",
    "/pic/revenue-king/T03/3.webp",
  ],
  "changan-lumin": [
    "/pic/revenue-king/lumin/1.webp",
    "/pic/revenue-king/lumin/2.webp",
    "/pic/revenue-king/lumin/3.webp",
  ],
  "wuling-bingo-plus": [
    "/pic/revenue-king/bingoplus/2.webp",
    "/pic/revenue-king/bingoplus/3.webp",
    "/pic/revenue-king/bingoplus/4.webp",
  ],
  "byd-dolphin": [
    "/pic/revenue-king/dolphin/0.webp",
    "/pic/revenue-king/dolphin/1.webp",
    "/pic/revenue-king/dolphin/2.webp",
  ],
  "gac-aion-rt": [
    "/pic/revenue-king/RT/1.webp",
    "/pic/revenue-king/RT/2.webp",
    "/pic/revenue-king/RT/3.webp",
  ],
  "leopard-ti3": [
    "/pic/revenue-king/Ti3/1.webp",
    "/pic/revenue-king/Ti3/2.webp",
    "/pic/revenue-king/Ti3/3.webp",
  ],
  "gac-aion-y-plus": [
    "/pic/revenue-king/Yplus/1.webp",
    "/pic/revenue-king/Yplus/2.webp",
    "/pic/revenue-king/Yplus/3.webp",
  ],
  "geely-galaxy-e5": [
    "/pic/revenue-king/Galaxye5/1.webp",
    "/pic/revenue-king/Galaxye5/2.webp",
    "/pic/revenue-king/Galaxye5/3.webp",
  ],
  "byd-qin-plus": [
    "/pic/revenue-king/qinplusev/1.webp",
    "/pic/revenue-king/qinplusev/2.webp",
    "/pic/revenue-king/qinplusev/4.webp",
  ],
  "geely-geometry-c": [
    "/pic/revenue-king/geometryc/0.webp",
    "/pic/revenue-king/geometryc/1.webp",
    "/pic/revenue-king/geometryc/2.webp",
  ],
  "gac-aion-i60": [
    "/pic/revenue-king/I60/2.webp",
    "/pic/revenue-king/I60/3.webp",
    "/pic/revenue-king/I60/4.webp",
  ],
  "gac-aion-v": [
    "/pic/revenue-king/V/2.webp",
    "/pic/revenue-king/V/3.webp",
    "/pic/revenue-king/V/4.webp",
  ],
  "deepal-s07": [
    "/pic/revenue-king/S07/2.webp",
    "/pic/revenue-king/S07/3.webp",
    "/pic/revenue-king/S07/4.webp",
  ],
  "deepal-s05": [
    "/pic/revenue-king/S05/2.webp",
    "/pic/revenue-king/S05/3.webp",
    "/pic/revenue-king/S05/4.webp",
  ],
  "linghui-e7": [
    "/pic/revenue-king/E7/2.webp",
    "/pic/revenue-king/E7/3.webp",
    "/pic/revenue-king/E7/4.webp",
  ],
  "mg-mg4-ev": [
    "/pic/revenue-king/MG4/2.webp",
    "/pic/revenue-king/MG4/3.webp",
    "/pic/revenue-king/MG4/4.webp",
  ],
  "dongfeng-nammi-01": [
    "/pic/revenue-king/01/2.webp",
    "/pic/revenue-king/01/3.webp",
    "/pic/revenue-king/01/4.webp",
  ],
  "changan-nevo-q05": [
    "/pic/revenue-king/Q05/2.webp",
    "/pic/revenue-king/Q05/3.webp",
    "/pic/revenue-king/Q05/4.webp",
  ],
  "byd-shark": [
    "/pic/utility-pro/shark/0.webp",
    "/pic/utility-pro/shark/1.webp",
    "/pic/utility-pro/shark/2.webp",
  ],
  "radar-rd6": [
    "/pic/utility-pro/RD6/0.webp",
    "/pic/utility-pro/RD6/1.webp",
    "/pic/utility-pro/RD6/2.webp",
  ],
  "tank-500-hi4t": [
    "/pic/utility-pro/Hi4-T/0.webp",
    "/pic/utility-pro/Hi4-T/1.webp",
    "/pic/utility-pro/Hi4-T/2.webp",
  ],
  "fangchengbao-leopard-8": [
    "/pic/utility-pro/leopard8/0.webp",
    "/pic/utility-pro/leopard8/1.webp",
    "/pic/utility-pro/leopard8/2.webp",
  ],
  "zeekr-9x": [
    "/pic/utility-pro/9x/0.webp",
    "/pic/utility-pro/9x/1.webp",
    "/pic/utility-pro/9x/2.webp",
  ],
  "gwm-cannon-ev": [
    "/pic/utility-pro/cannonev/0.webp",
    "/pic/utility-pro/cannonev/1.webp",
    "/pic/utility-pro/cannonev/2.webp",
  ],
  "dongfeng-rich-6-ev": [
    "/pic/utility-pro/rich6ev/0.webp",
    "/pic/utility-pro/rich6ev/1.webp",
    "/pic/utility-pro/rich6ev/2.webp",
  ],
  "farizon-xingxiang-v": [
    "/pic/utility-pro/xingxiangv/0.webp",
    "/pic/utility-pro/xingxiangv/1.webp",
    "/pic/utility-pro/xingxiangv/2.webp",
  ],
  "farizon-super-van": [
    "/pic/utility-pro/supervan/0.webp",
    "/pic/utility-pro/supervan/2.webp",
    "/pic/utility-pro/supervan/3.webp",
  ],
  "farizon-t5": [
    "/pic/utility-pro/T5/0.webp",
    "/pic/utility-pro/T5/2.webp",
    "/pic/utility-pro/T5/3.webp",
  ],
  "maxus-edeliver9": [
    "/pic/utility-pro/edeliver9/0.webp",
    "/pic/utility-pro/edeliver9/2.webp",
    "/pic/utility-pro/edeliver9/3.webp",
  ],
  "foton-aumark-ev": [
    "/pic/utility-pro/eaumark/0.webp",
    "/pic/utility-pro/eaumark/2.webp",
    "/pic/utility-pro/eaumark/3.webp",
  ],
  "byd-seal": [
    "/pic/elite-flagship/seal/1.webp",
    "/pic/elite-flagship/seal/2.webp",
    "/pic/elite-flagship/seal/3.webp",
  ],
  "byd-han-ev": [
    "/pic/elite-flagship/hanev/1.webp",
    "/pic/elite-flagship/hanev/2.webp",
    "/pic/elite-flagship/hanev/3.webp",
  ],
  "geely-galaxy-m9": [
    "/pic/elite-flagship/M9/0.webp",
    "/pic/elite-flagship/M9/2.webp",
    "/pic/elite-flagship/M9/3.webp",
  ],
  "byd-sealion-7": [
    "/pic/elite-flagship/sealion/0.webp",
    "/pic/elite-flagship/sealion/1.webp",
    "/pic/elite-flagship/sealion/2.webp",
  ],
  "fangchengbao-leopard-5": [
    "/pic/elite-flagship/leopard5/1.webp",
    "/pic/elite-flagship/leopard5/2.webp",
    "/pic/elite-flagship/leopard5/3.webp",
  ],
  "fangchengbao-ti7": [
    "/pic/elite-flagship/Ti7/0.webp",
    "/pic/elite-flagship/Ti7/1.webp",
    "/pic/elite-flagship/Ti7/2.webp",
  ],
  "xiaomi-yu7": [
    "/pic/elite-flagship/YU7/0.webp",
    "/pic/elite-flagship/YU7/1.webp",
    "/pic/elite-flagship/YU7/3.webp",
  ],
  "byd-tang-l-ev": [
    "/pic/elite-flagship/tanglev/0.webp",
    "/pic/elite-flagship/tanglev/1.webp",
    "/pic/elite-flagship/tanglev/2.webp",
  ],
  "li-auto-l6": [
    "/pic/elite-flagship/L6/1.webp",
    "/pic/elite-flagship/L6/2.webp",
    "/pic/elite-flagship/L6/3.webp",
  ],
  "xpeng-g9": [
    "/pic/elite-flagship/XpengG9/0.webp",
    "/pic/elite-flagship/XpengG9/1.webp",
    "/pic/elite-flagship/XpengG9/2.webp",
  ],
  "zeekr-001": [
    "/pic/elite-flagship/001/0.webp",
    "/pic/elite-flagship/001/2.webp",
    "/pic/elite-flagship/001/3.webp",
  ],
  "xiaomi-su7-ultra": [
    "/pic/elite-flagship/SU7ultra/1.webp",
    "/pic/elite-flagship/SU7ultra/2.webp",
    "/pic/elite-flagship/SU7ultra/3.webp",
  ],
  "stelato-s9": [
    "/pic/elite-flagship/S9/0.webp",
    "/pic/elite-flagship/S9/1.webp",
    "/pic/elite-flagship/S9/2.webp",
  ],
  "aito-m9": [
    "/pic/elite-flagship/M9/0.webp",
    "/pic/elite-flagship/M9/1.webp",
    "/pic/elite-flagship/M9/2.webp",
  ],
  "hongqi-e-hs9": [
    "/pic/elite-flagship/E-HS9/0.webp",
    "/pic/elite-flagship/E-HS9/2.webp",
    "/pic/elite-flagship/E-HS9/3.webp",
  ],
  "leapmotor-d19": [
    "/pic/elite-flagship/D19/2.webp",
    "/pic/elite-flagship/D19/3.webp",
    "/pic/elite-flagship/D19/4.webp",
  ],
  "voyah-taishan-x8": [
    "/pic/elite-flagship/X8/2.webp",
    "/pic/elite-flagship/X8/3.webp",
    "/pic/elite-flagship/X8/4.webp",
  ],
  "denza-d9-dmi": [
    "/pic/elite-flagship/denza d9 dm-i/2.webp",
    "/pic/elite-flagship/denza d9 dm-i/3.webp",
    "/pic/elite-flagship/denza d9 dm-i/4.webp",
  ],
  "yangwang-u8": [
    "/pic/elite-flagship/yangwang U8/2.webp",
    "/pic/elite-flagship/yangwang U8/3.webp",
    "/pic/elite-flagship/yangwang U8/4.webp",
  ],
};

const LESSON_CATEGORY_ALIASES: Record<string, string> = {
  fundamentals: "fundamentals",
  "ev-fundamentals": "fundamentals",
  playbook: "playbook",
  "dealer-playbook": "playbook",
  workshop: "workshop",
  "technical-workshop": "workshop",
};

const LESSON_IMAGE_MAP: Record<string, string> = {
  "fundamentals/high-altitude-dust-ethiopia-ev": "/pic/academy/photo-1518770660439-4636190af475.webp",
  "fundamentals/ev-range-explained-africa": "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp",
  "fundamentals/how-ev-batteries-degrade": "/pic/academy/photo-1486312338219-ce68d2c6f44d.webp",
  "fundamentals/ev-market-entry-compliance": "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
  "playbook/ev-objections-african-dealers": "/pic/academy/photo-1560250097-0b93528c311a.webp",
  "playbook/tco-conversation-guide": "/pic/academy/photo-1527853787696-f7be74f2e39a.webp",
  "playbook/ev-test-drive-guide": "/pic/academy/photo-1559136555-9303baea8ebd.webp",
  "playbook/fleet-operations-tco-analysis": "/pic/academy/0.webp",
  "workshop/high-voltage-safety-ev-technicians": "/pic/academy/photo-1581092160562-40aa08e78837.webp",
  "workshop/chinese-ev-diagnostic-tools": "/pic/academy/photo-1559136555-9303baea8ebd.webp",
  "workshop/12v-auxiliary-battery-ev": "/pic/academy/photo-1527853787696-f7be74f2e39a.webp",
  "workshop/ev-wont-charge-troubleshooting": "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp",
  "workshop/common-fault-patterns-ethiopia": "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
  "workshop/voltage-fluctuation-ev-charger-ethiopia": "/pic/academy/photo-1518770660439-4636190af475.webp",
  "workshop/battery-maintenance-hv-safety": "/pic/academy/0.webp",
};

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

const GALLERY_SLOTS = [
  { cat: "Exterior", label: "Side Profile" },
  { cat: "Interior", label: "Cabin & Dashboard" },
  { cat: "Details", label: "Charging & Cargo" },
] as const;

const VERIFIED_PUBLIC_IMAGES = new Set<string>([
  VEHICLE_FALLBACK_IMAGE,
  ACADEMY_FALLBACK_IMAGE,
  INSIGHT_FALLBACK_IMAGE,
  ...Object.values(VEHICLE_IMAGE_MAP),
  ...Object.values(LESSON_IMAGE_MAP),
  ...Object.values(INSIGHT_IMAGE_MAP),
  ...Object.values(VEHICLE_GALLERY_MANIFEST).flat(),
  "/pic/academy/photo-1560250097-0b93528c311a.webp",
  "/pic/hero/photo-1593941707882-a5bba14938c7.webp",
  "/pic/page/photo-1555215695-3004980ad54e.webp",
]);

function verifiedLocalImage(
  rawImage: string | null | undefined,
  fallback: string,
): string {
  const normalizedImage = normalizeAssetUrl(rawImage);
  return normalizedImage && VERIFIED_PUBLIC_IMAGES.has(normalizedImage)
    ? normalizedImage
    : fallback;
}

function verifiedMarkdownAsset(rawImage: string | null | undefined): string | null {
  const clean = rawImage?.trim().split(/[?#]/, 1)[0] ?? "";
  if (!clean || /^([a-z]+:)?\/\//i.test(clean)) {
    return null;
  }

  const basename = clean.split("/").filter(Boolean).pop() ?? "";
  const webpName = basename.replace(/\.(jpe?g|png)$/i, ".webp");
  if (!webpName || webpName === basename && !/\.(webp|avif)$/i.test(basename)) {
    return null;
  }

  return [...VERIFIED_PUBLIC_IMAGES].find((asset) => asset.endsWith(`/${webpName}`)) ?? null;
}

export function resolveVerifiedPublicImage(rawImage?: string | null): string | null {
  const normalizedImage = normalizeAssetUrl(rawImage);
  if (!normalizedImage) return null;
  if (normalizedImage.startsWith("https://images.unsplash.com/")) return normalizedImage;
  return VERIFIED_PUBLIC_IMAGES.has(normalizedImage) ? normalizedImage : null;
}

function buildVehicleGallery(paths: string[]): GalleryImage[] {
  return paths.slice(0, GALLERY_SLOTS.length).map((src, index) => ({
    src,
    ...GALLERY_SLOTS[index],
  }));
}

function dedupeGallery(images: GalleryImage[]): GalleryImage[] {
  const seen = new Set<string>();
  return images.filter((image) => {
    if (!image.src || seen.has(image.src)) {
      return false;
    }
    seen.add(image.src);
    return true;
  });
}

function normalizeLessonCategory(category: string): string {
  return LESSON_CATEGORY_ALIASES[category.trim().toLowerCase()] ?? category.trim().toLowerCase();
}

export function resolveLessonImage(
  category: string,
  slug: string,
  rawImage?: string | null,
): string {
  const fallback =
    LESSON_IMAGE_MAP[`${normalizeLessonCategory(category)}/${slug}`] ??
    ACADEMY_FALLBACK_IMAGE;
  return verifiedLocalImage(rawImage, fallback);
}

export function resolveInsightImage(slug: string, rawImage?: string | null): string {
  return verifiedLocalImage(rawImage, INSIGHT_IMAGE_MAP[slug] ?? INSIGHT_FALLBACK_IMAGE);
}

export function resolveMarkdownImage(
  rawImage: string | null | undefined,
  fallbackImage?: string | null,
): string {
  const fallback = verifiedLocalImage(fallbackImage, INSIGHT_FALLBACK_IMAGE);
  return (
    verifiedLocalImage(rawImage, "") ||
    verifiedMarkdownAsset(rawImage) ||
    fallback
  );
}

export function getVehicleModelImage(slug: string, rawImageUrl?: string | null): string {
  if (slug && VEHICLE_IMAGE_MAP[slug]) {
    return VEHICLE_IMAGE_MAP[slug];
  }

  return verifiedLocalImage(rawImageUrl, VEHICLE_FALLBACK_IMAGE);
}

export function getVehicleGalleryImages(
  slug: string,
  primaryImg?: string | null,
): Array<{ src: string; cat: string; label: string }> {
  const coverImage = getVehicleModelImage(slug, primaryImg);
  const manifest = VEHICLE_GALLERY_MANIFEST[slug];

  if (manifest?.length) {
    return dedupeGallery([
      { src: coverImage, cat: "Exterior", label: "Front Angle" },
      ...buildVehicleGallery(manifest),
    ]);
  }

  return [{ src: coverImage, cat: "Exterior", label: "Main Profile" }];
}
