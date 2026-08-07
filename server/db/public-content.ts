import {
  normalizeProductCategory,
  normalizeProductSlug,
} from "../../lib/content-normalizers";
import {
  getVehicleGalleryImages,
  getVehicleModelImage,
  resolveVerifiedPublicImage,
  resolveInsightImage,
  resolveLessonImage,
} from "../../lib/static-assets";
import { vehicles as revenueKingVehicles } from "../../app/products/revenue-king/data";
import { vehicles as eliteFlagshipVehicles } from "../../app/products/elite-flagship/data";
import { vehicles as utilityProVehicles } from "../../app/products/utility-pro/data";
import { queryVehicleModels, queryVehicleTrims, type D1VehicleModel, type D1VehicleTrim } from "./d1";

export type PublicProductCategory = "revenue-king" | "elite-flagship" | "utility-pro";

export interface PublicProductCard {
  slug: string;
  category: PublicProductCategory;
  brand: string;
  name: string;
  fob: string;
  battery: string;
  batteryType: string;
  range: string;
  charging: string;
  img: string;
  status: string;
  statusText: string;
  link: string;
  tags: string[];
  sortOrder: number;
  filterData: {
    vehicleClasses: string[];
    batteryChemistries: string[];
    rangeKm: { min: number; max: number } | null;
    priceUsd: { min: number; max: number } | null;
    steeringSetups: string[];
    powertrainTypes: string[];
    inventoryStatuses: string[];
    voltagePlatforms: string[];
    v2lAvailability: string[];
    drivetrains: string[];
    groundClearanceMm: { min: number; max: number } | null;
  };
}

export interface PublicProductDetail {
  modelId: string;
  slug: string;
  vehicle: PublicProductCard;
  category: PublicProductCategory;
  title: string;
  subtitle: string;
  heroDesc: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  whyTitle: string;
  whyDesc: string;
  features: Array<{ icon: string; title: string; desc: string }>;
  specsLeft: Array<{ label: string; value: string; green?: boolean; gold?: boolean }>;
  specsRight: Array<{ label: string; value: string; green?: boolean; gold?: boolean }>;
  fits: Array<{ icon: string; title: string; desc: string; accent: string }>;
  relatedModels: Array<{ name: string; href: string }>;
  tags: string[];
  galleryImages: Array<{ src: string; cat: string; label: string }>;
  trimComparison?: Record<string, unknown>;
}

export interface PublicInsightSummary {
  slug: string;
  title: string;
  category: string;
  date: string;
  sortDate: string;
  readTime: string;
  coverImage: string;
  sortOrder: number;
  overview: string;
}

export interface PublicInsightArticle extends PublicInsightSummary {
  content: string;
}

export interface PublicAcademyLesson {
  title: string;
  category: string;
  tag: string;
  slug: string;
  desc: string;
  img: string;
  content: string;
}

export interface PublicAcademyVaultItem {
  translationId: string;
  title: string;
  type: string;
  desc: string;
  size: string;
  downloadLink: string;
  category?: string;
}

export interface PublicAcademyPayload {
  lessons: {
    fundamentals: PublicAcademyLesson[];
    playbook: PublicAcademyLesson[];
    workshop: PublicAcademyLesson[];
    vault: PublicAcademyLesson[];
  };
  vault: PublicAcademyVaultItem[];
}

type StaticProduct = Omit<PublicProductCard, "category" | "sortOrder" | "filterData"> & {
  category: PublicProductCategory;
  sortOrder: number;
};

type RawInsight = Record<string, unknown>;
type RawAcademyLesson = Record<string, unknown>;
type RawVaultItem = Record<string, unknown>;

const staticProducts: StaticProduct[] = [
  ...revenueKingVehicles.map((item, sortOrder) => ({
    ...item,
    slug: normalizeProductSlug(item.link),
    category: "revenue-king" as const,
    sortOrder,
    batteryType: item.batteryType,
  })),
  ...eliteFlagshipVehicles.map((item, sortOrder) => ({
    ...item,
    slug: normalizeProductSlug(item.link),
    category: "elite-flagship" as const,
    sortOrder: revenueKingVehicles.length + sortOrder,
    batteryType: item.batteryType,
  })),
  ...utilityProVehicles.map((item, sortOrder) => ({
    ...item,
    slug: normalizeProductSlug(item.link),
    category: "utility-pro" as const,
    sortOrder: revenueKingVehicles.length + eliteFlagshipVehicles.length + sortOrder,
    batteryType: item.batteryType,
  })),
];

type FilterInterval = { min: number; max: number };
type ProductFilterData = PublicProductCard["filterData"];

function rowValue(row: D1VehicleModel, ...keys: string[]): unknown {
  const source = row as unknown as Record<string, unknown>;
  for (const key of keys) {
    if (source[key] !== null && source[key] !== undefined && source[key] !== "") {
      return source[key];
    }
  }
  return null;
}

function textValues(value: unknown): string[] {
  const parsed = Array.isArray(value) ? value : parseJson(value);
  const values = Array.isArray(parsed) ? parsed : [value];
  return [...new Set(values.flatMap((item) => {
    if (item === null || item === undefined) return [];
    if (typeof item === "object") {
      const record = item as Record<string, unknown>;
      return textValues(record.text ?? record.name ?? record.value ?? record.title);
    }
    const text = String(item).trim();
    return text ? [text] : [];
  }))];
}

function atomicValues(value: unknown): string[] {
  return [...new Set(textValues(value).flatMap((item) =>
    item.split(/\s*(?:\/|\+)\s*/).map((part) => part.trim()).filter(Boolean),
  ))];
}

function canonicalBatteryChemistry(value: string): string {
  if (/\bLFP\b/i.test(value)) return "LFP";
  if (/\bNCM\b|ternary lithium/i.test(value)) return "NCM";
  if (/semi[- ]solid/i.test(value)) return "Semi-solid-state";
  return value;
}

function intervalFrom(minValue: unknown, maxValue: unknown): FilterInterval | null {
  const min = number(minValue);
  const max = number(maxValue);
  if (min === null && max === null) return null;
  const first = min ?? max!;
  const second = max ?? min!;
  return { min: Math.min(first, second), max: Math.max(first, second) };
}

function numericRangeFromText(value: string): FilterInterval | null {
  const values = value
    .match(/[0-9][0-9,]*(?:\.[0-9]+)?/g)
    ?.map((item) => Number(item.replaceAll(",", "")))
    .filter(Number.isFinite) ?? [];
  if (!values.length) return null;
  return { min: Math.min(...values), max: Math.max(...values) };
}

function filterDataFor(row: D1VehicleModel | null, card: PublicProductCard): ProductFilterData {
  const tags = card.tags;
  const explicitVehicleClasses = textValues(rowValue(row ?? ({} as D1VehicleModel), "vehicle_class"));
  const vehicleClasses = explicitVehicleClasses.length
    ? explicitVehicleClasses
    : row
      ? textValues(row.segment)
      : [];
  const fallbackClass = tags[0] ? [tags[0]] : [];
  const batteryChemistries = atomicValues(rowValue(row ?? ({} as D1VehicleModel), "battery_chemistry", "battery_chemistry_auto", "battery_technology"));
  const fallbackChemistry = atomicValues(card.batteryType).map(canonicalBatteryChemistry);
  const rangeKm = intervalFrom(
    rowValue(row ?? ({} as D1VehicleModel), "cltc_range_min_km", "cltc_range_min_km_auto"),
    rowValue(row ?? ({} as D1VehicleModel), "cltc_range_max_km", "cltc_range_max_km_auto"),
  ) ?? numericRangeFromText(card.range);
  const priceUsd = intervalFrom(
    rowValue(row ?? ({} as D1VehicleModel), "display_price_low"),
    rowValue(row ?? ({} as D1VehicleModel), "display_price_high"),
  ) ?? intervalFrom(
    rowValue(row ?? ({} as D1VehicleModel), "guide_price_min_usd_auto"),
    rowValue(row ?? ({} as D1VehicleModel), "guide_price_max_usd_auto"),
  ) ?? numericRangeFromText(card.fob);
  const steeringSetups = textValues(rowValue(row ?? ({} as D1VehicleModel), "steering_setup"));
  const powertrainTypes = textValues(rowValue(row ?? ({} as D1VehicleModel), "powertrain_type"));
  const inventoryStatuses = textValues(rowValue(row ?? ({} as D1VehicleModel), "inventory_status", "status"));
  const voltagePlatforms = textValues(rowValue(row ?? ({} as D1VehicleModel), "voltage_platform_v"))
    .map((value) => `${number(value.replace(/v$/i, "")) ?? value.replace(/v$/i, "")}V`);
  const v2lAvailability = textValues(rowValue(row ?? ({} as D1VehicleModel), "v2l_availability"));
  const drivetrains = atomicValues(rowValue(row ?? ({} as D1VehicleModel), "drivetrain_display", "drivetrain_display_auto"));
  const groundClearanceMm = intervalFrom(rowValue(row ?? ({} as D1VehicleModel), "ground_clearance_mm"));

  return {
    vehicleClasses: vehicleClasses.length ? [...new Set(vehicleClasses)] : fallbackClass,
    batteryChemistries: batteryChemistries.length ? batteryChemistries : fallbackChemistry,
    rangeKm,
    priceUsd,
    steeringSetups: steeringSetups.length
      ? steeringSetups
      : tags.flatMap((tag) => /\bLHD\b/i.test(tag) ? ["LHD"] : /\bRHD\b/i.test(tag) ? ["RHD"] : []),
    powertrainTypes: powertrainTypes.length ? powertrainTypes : atomicValues(tags.filter((tag) => /\b(?:BEV|HEV|PHEV|EREV)\b/i.test(tag))),
    inventoryStatuses: inventoryStatuses.length ? inventoryStatuses : [card.statusText].filter(Boolean),
    voltagePlatforms: voltagePlatforms.length ? voltagePlatforms : tags.filter((tag) => /\b\d{3,4}V\b/i.test(tag)).map((tag) => tag.match(/\b\d{3,4}V\b/i)?.[0] ?? tag),
    v2lAvailability: v2lAvailability.length ? v2lAvailability : tags.filter((tag) => /V2L/i.test(tag)),
    drivetrains: drivetrains.length ? drivetrains : atomicValues(tags.filter((tag) => /(?:AWD|4WD|FWD|RWD)/i.test(tag))),
    groundClearanceMm: groundClearanceMm ?? (tags.some((tag) => /200mm\+/i.test(tag)) ? { min: 200, max: Number.POSITIVE_INFINITY } : null),
  };
}

const BASELINE_INSIGHTS: PublicInsightArticle[] = [
  {
    slug: "ethiopia-ev-tax-policy-2026",
    title: "Ethiopia EV Tax Policy 2026: Complete Exemption Guide",
    category: "Policy & Tariffs",
    date: "2026-02-20",
    sortDate: "2026-02-20",
    readTime: "5 min read",
    coverImage: resolveInsightImage("ethiopia-ev-tax-policy-2026"),
    sortOrder: 1,
    overview:
      "Comprehensive analysis of Ethiopia's 0% EV import tariff policy, VAT exemptions, and excise tax structure for commercial and passenger fleets.",
    content:
      "Ethiopia has implemented landmark zero-tariff policies for fully electric vehicles (BEVs) to accelerate energy transition and reduce foreign currency expenditure on imported fossil fuels.",
  },
  {
    slug: "sourcing-byd-evs-for-east-africa",
    title: "Strategic EV Sourcing: BYD Fleet Operations in East Africa",
    category: "Sourcing Intelligence",
    date: "2026-02-15",
    sortDate: "2026-02-15",
    readTime: "7 min read",
    coverImage: resolveInsightImage("sourcing-byd-evs-for-east-africa"),
    sortOrder: 2,
    overview:
      "Step-by-step sourcing playbook for fleet operators importing BYD EVs into East African markets.",
    content:
      "BYD has emerged as the leading EV brand across East Africa due to its Blade Battery technology, thermal durability in tropical climates, and competitive FOB pricing.",
  },
  {
    slug: "ev-charging-infrastructure-addis-ababa",
    title: "Addis Ababa Charging Infrastructure Roadmap",
    category: "Market Analysis",
    date: "2026-01-28",
    sortDate: "2026-01-28",
    readTime: "6 min read",
    coverImage: resolveInsightImage("ev-charging-infrastructure-addis-ababa"),
    sortOrder: 3,
    overview:
      "Mapping fast-charging stations, grid capacity, and depot charging solutions across urban transport routes.",
    content:
      "Urban charging infrastructure is rapidly expanding in Addis Ababa, supported by joint government initiatives and private depot installations.",
  },
];

const BASELINE_ACADEMY: PublicAcademyPayload = {
  lessons: {
    fundamentals: [
      lesson("fundamentals", "High Altitude and Dust in Ethiopia: How They Affect Your EV", "Battery Tech", "high-altitude-dust-ethiopia-ev", "Understanding how high altitude and dust affect EVs in Ethiopia is essential knowledge for any dealer or technician."),
      lesson("fundamentals", "EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa", "Infrastructure", "ev-range-explained-africa", "The range number on a Chinese EV spec sheet is not what your customer will get in Africa."),
      lesson("fundamentals", "How EV Batteries Degrade: What African Dealers Need to Understand and Tell Customers", "TCO Analysis", "how-ev-batteries-degrade", "Battery degradation is the most common customer question and the most misunderstood topic for dealers."),
      lesson("fundamentals", "EV Market Entry & Compliance Guide", "Market Entry", "ev-market-entry-compliance", "Key regulatory, tariff, and licensing requirements for importing electric vehicles into African markets."),
    ],
    playbook: [
      lesson("playbook", "The 5 EV Objections Every African Dealer Will Face — And How to Answer Them", "Objections", "ev-objections-african-dealers", "Battery life, charging, spare parts, resale value, and price — these 5 objections stall most EV deals."),
      lesson("playbook", "The TCO Conversation Guide: How to Win EV Sales on Total Cost, Not Sticker Price", "Fleet Sales", "tco-conversation-guide", "The TCO conversation is the single most powerful sales tool for African EV dealers."),
      lesson("playbook", "How to Run an EV Test Drive That Closes Deals", "Showroom Standard", "ev-test-drive-guide", "A structured 20-minute test drive converts hesitant customers far better than endless objection handling."),
      lesson("playbook", "Fleet Operations & Total Cost Analysis", "Fleet Mgmt", "fleet-operations-tco-analysis", "Comparative financial modeling for commercial fleets replacing diesel vehicles with BEVs."),
    ],
    workshop: [
      lesson("workshop", "High Voltage Safety Rules for EV Technicians", "Safety Protocols", "high-voltage-safety-ev-technicians", "What you must know before opening the bonnet of a 400V or 800V electric vehicle."),
      lesson("workshop", "Chinese EV Diagnostic Tools: What Actually Works in an African Workshop", "Diagnostics", "chinese-ev-diagnostic-tools", "Navigating OBD protocols, manufacturer software, and multi-brand scanners for Chinese EVs."),
      lesson("workshop", "The 12V Auxiliary Battery in Chinese EVs: Why It Fails, How to Test It", "Auxiliary Battery", "12v-auxiliary-battery-ev", "Why the 12V system is the leading cause of non-start complaints in modern electric vehicles."),
      lesson("workshop", "EV Won't Charge: A Step-by-Step Troubleshooting Guide for Technicians", "Charging Systems", "ev-wont-charge-troubleshooting", "Diagnosing AC and DC charging handshake failures, port lock faults, and BMS interlocks."),
      lesson("workshop", "Common Fault Patterns in Chinese EVs Operating in Ethiopia: A Field Reference", "Field Diagnostics", "common-fault-patterns-ethiopia", "Real-world field observations on thermal limits, dust ingress, and suspension wear."),
      lesson("workshop", "Voltage Fluctuation and EV Charging in Ethiopia: What Every Technician Must Know", "Grid Infrastructure", "voltage-fluctuation-ev-charger-ethiopia", "Protecting chargers and vehicle OBCs against grid surges and undervoltage drops."),
      lesson("workshop", "Battery Maintenance & High Voltage Safety", "Technical", "battery-maintenance-hv-safety", "Practical workshop on LFP battery diagnostics, thermal management, and safety protocols for technicians."),
    ],
    vault: [],
  },
  vault: [
    { translationId: "v1", title: "Ethiopia EV Customs Regulation & Tax Exemption Circular (2026)", type: "PDF Policy Brief", desc: "Official Ministry of Finance directive detailing tariff codes, VAT exemption procedures, and port clearance checklists.", size: "2.4 MB", downloadLink: "/qr" },
    { translationId: "recvnRyGHzWgf8", title: "2026 Fleet ROI Calculator", type: "Excel Model", desc: "Plug in local electricity rates and petrol prices to instantly generate a 5-year cost comparison for your commercial clients.", size: "1.8 MB", downloadLink: "/qr" },
    { translationId: "recvnRyGHzd9uS", title: "The 50-Point Factory PDI", type: "PDF Guide", desc: "The exact Pre-Delivery Inspection checklist our engineers use in Shanghai before loading your vehicles into the container.", size: "3.1 MB", downloadLink: "/qr" },
    { translationId: "recvnRyGHzNocG", title: "Africa RHD Import Guide", type: "PDF Guide", desc: "A comprehensive breakdown of which Chinese factories are producing true Right-Hand Drive models and their export availability.", size: "4.5 MB", downloadLink: "/qr" },
  ],
};

function lesson(category: string, title: string, tag: string, slug: string, desc: string): PublicAcademyLesson {
  return { title, category, tag, slug, desc, img: resolveLessonImage(category, slug), content: desc };
}

function text(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const result = text(value);
    if (result) return result;
  }
  return "";
}

function number(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string" || !value.trim()) return null;
  const parsed = Number(value.replace(/,/g, "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function range(min: unknown, max: unknown, unit: string): string {
  const low = number(min);
  const high = number(max);
  if (low === null && high === null) return "";
  if (low !== null && high !== null && low !== high) return `${low} - ${high} ${unit}`;
  return `${low ?? high} ${unit}`;
}

function price(row: D1VehicleModel): string {
  const low = number(rowValue(row, "display_price_low", "guide_price_min_usd_auto"));
  const high = number(rowValue(row, "display_price_high", "guide_price_max_usd_auto"));
  if (low === null && high === null) return "";
  const format = (value: number) => `$${Math.round(value).toLocaleString("en-US")}`;
  if (low !== null && high !== null && low !== high) return `${format(low)} - ${format(high)}`;
  return format(low ?? high ?? 0);
}

function parseJson(value: unknown): unknown {
  const raw = text(value);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function stringArray(value: unknown): string[] {
  const parsed = Array.isArray(value) ? value : parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === "string" && Boolean(item.trim())).map((item) => item.trim());
}

function objectArray(value: unknown): Record<string, unknown>[] {
  const parsed = Array.isArray(value) ? value : parseJson(value);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item));
}

function galleryImages(row: D1VehicleModel, slug: string): Array<{ src: string; cat: string; label: string }> {
  const baseline = getVehicleGalleryImages(slug, rowValue(row, "image_url") as string | null);
  const parsed = parseJson(rowValue(row, "gallery_images_json", "gallery_images_json_pruned"));
  const entries = Array.isArray(parsed) ? parsed : [];
  const extra = entries
    .map((entry, index) => {
      const fields = typeof entry === "object" && entry !== null ? entry as Record<string, unknown> : {};
      const source = typeof entry === "string"
        ? entry
        : fields.src ?? fields.image ?? fields.url ?? fields.image_url;
      const src = resolveVerifiedPublicImage(typeof source === "string" ? source : null);
      if (!src) return null;
      return {
        src,
        cat: firstText(fields.cat, fields.category, "Exterior"),
        label: firstText(fields.label, `Gallery ${index + 1}`),
      };
    })
    .filter((item): item is { src: string; cat: string; label: string } => Boolean(item));
  const seen = new Set<string>();
  return [...baseline, ...extra].filter((item) => {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    return true;
  });
}

function mapStatus(row: D1VehicleModel, fallback: PublicProductCard): Pick<PublicProductCard, "status" | "statusText"> {
  const raw = firstText(row.inventory_status, row.status);
  if (!raw) return { status: fallback.status, statusText: fallback.statusText };
  const lower = raw.toLowerCase();
  if (lower.includes("stock")) return { status: "in-stock", statusText: raw };
  if (lower.includes("production") || lower.includes("factory")) return { status: "factory", statusText: raw };
  return { status: "tbc", statusText: raw };
}

function rowSlug(row: D1VehicleModel, fallback = ""): string {
  const productPath = firstText(rowValue(row, "product_path"));
  if (normalizeProductCategory(undefined, productPath)) {
    return normalizeProductSlug(productPath);
  }
  return normalizeProductSlug(firstText(
    rowValue(row, "model_id"),
    rowValue(row, "model", "MODEL"),
    fallback,
  ));
}

function localProductLink(category: PublicProductCategory, slug: string): string {
  return `/products/${category}/${slug}`;
}

function cardFromStatic(item: StaticProduct): PublicProductCard {
  const card = { ...item, img: getVehicleModelImage(item.slug, item.img) } as PublicProductCard;
  return { ...card, filterData: filterDataFor(null, card) };
}

function mergeCard(baseline: PublicProductCard, row: D1VehicleModel): PublicProductCard {
  const slug = rowSlug(row, baseline.slug);
  const status = mapStatus(row, baseline);
  const category = normalizeProductCategory(
    text(rowValue(row, "segment")),
    text(rowValue(row, "product_path")),
  ) ?? baseline.category;
  const card = {
    ...baseline,
    slug,
    category,
    brand: firstText(rowValue(row, "brand"), baseline.brand),
    name: firstText(rowValue(row, "model", "MODEL"), baseline.name),
    fob: price(row) || baseline.fob,
    battery: range(rowValue(row, "battery_capacity_min_kwh", "battery_capacity_min_kwh_auto"), rowValue(row, "battery_capacity_max_kwh", "battery_capacity_max_kwh_auto"), "kWh") || baseline.battery,
    batteryType: firstText(rowValue(row, "battery_chemistry", "battery_chemistry_auto"), rowValue(row, "battery_technology"), baseline.batteryType),
    range: range(rowValue(row, "cltc_range_min_km", "cltc_range_min_km_auto"), rowValue(row, "cltc_range_max_km", "cltc_range_max_km_auto"), "km") || baseline.range,
    charging: firstText(rowValue(row, "charging", "household_charging"), baseline.charging),
    img: getVehicleModelImage(slug, rowValue(row, "image_url") as string | null),
    ...status,
    link: localProductLink(category, slug),
    tags: stringArray(rowValue(row, "common_features_json", "common_features_json_pruned")).length
      ? stringArray(rowValue(row, "common_features_json", "common_features_json_pruned"))
      : baseline.tags,
  };
  return { ...card, filterData: filterDataFor(row, card) };
}

function d1OnlyCard(row: D1VehicleModel, sortOrder: number): PublicProductCard | null {
  const slug = rowSlug(row);
  const brand = firstText(rowValue(row, "brand"));
  const name = firstText(rowValue(row, "model", "MODEL"));
  const category = normalizeProductCategory(
    text(rowValue(row, "segment")),
    text(rowValue(row, "product_path")),
  );
  if (!slug || !brand || !name || !category) return null;
  const fallback: PublicProductCard = {
    slug,
    category,
    brand,
    name,
    fob: "TBC",
    battery: "TBC",
    batteryType: "TBC",
    range: "TBC",
    charging: "Source-backed specifications pending",
    img: getVehicleModelImage(slug, rowValue(row, "image_url") as string | null),
    status: "tbc",
    statusText: "TBC",
    link: localProductLink(category, slug),
    tags: [],
    sortOrder,
    filterData: filterDataFor(null, {
      slug,
      category,
      brand,
      name,
      fob: "TBC",
      battery: "TBC",
      batteryType: "TBC",
      range: "TBC",
      charging: "Source-backed specifications pending",
      img: getVehicleModelImage(slug, rowValue(row, "image_url") as string | null),
      status: "tbc",
      statusText: "TBC",
      link: localProductLink(category, slug),
      tags: [],
      sortOrder,
    }),
  };
  return mergeCard(fallback, row);
}

/**
 * API handlers pass either the production D1 binding or the persisted local
 * Miniflare D1 binding. The nullable type keeps the static baseline useful
 * for repository-level tests without making it a request-time data source.
 */
export async function listPublicProducts(db: D1Database | null): Promise<PublicProductCard[]> {
  const rows = db ? await queryVehicleModels(db) : [];
  const cards = staticProducts.map((item) => {
    const baseline = cardFromStatic(item);
    const row = rows.find((candidate) => rowSlug(candidate) === baseline.slug);
    return row ? mergeCard(baseline, row) : baseline;
  });
  const existing = new Set(cards.map((card) => card.slug));
  for (const row of rows) {
    const slug = rowSlug(row);
    if (slug && !existing.has(slug)) {
      const card = d1OnlyCard(row, cards.length);
      if (card) {
        cards.push(card);
        existing.add(card.slug);
      }
    }
  }
  return cards;
}

function featureItems(row: D1VehicleModel, card: PublicProductCard): Array<{ icon: string; title: string; desc: string }> {
  const parsed = objectArray(rowValue(row, "common_features_json", "common_features_json_pruned"));
  const features = parsed
    .map((item, index) => ({
      icon: firstText(item.icon, String(index + 1).padStart(2, "0")),
      title: firstText(item.title, item.name),
      desc: firstText(item.desc, item.description, item.value),
    }))
    .filter((item) => item.title || item.desc);
  if (features.length) return features;
  return [
    { icon: "01", title: "Powertrain Snapshot", desc: [card.battery, card.range, card.batteryType].filter(Boolean).join(" · ") },
    { icon: "02", title: "Export Data Coverage", desc: "Source-backed model data with verified public specifications." },
    { icon: "03", title: "Supply Status", desc: card.statusText || "Inventory status is tracked from the live vehicle model database." },
  ];
}

function fitItems(card: PublicProductCard): Array<{ icon: string; title: string; desc: string; accent: string }> {
  const labels = card.tags.slice(0, 2);
  if (!labels.length && card.charging) labels.push(card.charging);
  return labels.map((label, index) => ({
    icon: String(index + 1).padStart(2, "0"),
    title: label,
    desc: card.charging,
    accent: label,
  }));
}

function formatDimensions(row: D1VehicleModel): string {
  const values = [
    rowValue(row, "length_mm"),
    rowValue(row, "width_mm"),
    rowValue(row, "height_mm"),
  ].map(number);
  return values.every((value) => value !== null)
    ? `${values[0]} × ${values[1]} × ${values[2]} mm`
    : "";
}

function formatSeats(row: D1VehicleModel): string {
  return range(rowValue(row, "seats_min"), rowValue(row, "seats_max"), "seats");
}

function formatWarranty(row: D1VehicleModel): string {
  const years = number(rowValue(row, "battery_warranty_years"));
  const distance = number(rowValue(row, "battery_warranty_distance_km"));
  if (years === null && distance === null) return "";
  if (years !== null && distance !== null) return `${years} years / ${distance} km`;
  if (years !== null) return `${years} years`;
  return `${distance} km`;
}

function specs(row: D1VehicleModel, card: PublicProductCard): Array<{ label: string; value: string; green?: boolean; gold?: boolean }> {
  const zeroTo100 = rowValue(row, "zero_to_100_sec", "0_100_km_h_sec");
  const voltage = rowValue(row, "voltage_platform_v");
  const wheelbase = rowValue(row, "wheelbase_mm");
  const groundClearance = rowValue(row, "ground_clearance_mm");
  const bootVolume = rowValue(row, "boot_volume_l");
  return [
    { label: "Battery", value: card.battery, green: true },
    { label: "Battery Type", value: card.batteryType },
    { label: "Range", value: card.range, gold: true },
    { label: "Powertrain", value: firstText(rowValue(row, "powertrain_type")) },
    { label: "Drivetrain", value: firstText(rowValue(row, "drivetrain_display", "drivetrain_display_auto")) },
    {
      label: "Motor Power",
      value: range(
        rowValue(row, "motor_power_min_kw", "motor_power_min_kw_auto"),
        rowValue(row, "motor_power_max_kw", "motor_power_max_kw_auto"),
        "kW",
      ),
    },
    {
      label: "Top Speed",
      value: range(
        rowValue(row, "top_speed_min_kmh", "top_speed_min_kmh_auto"),
        rowValue(row, "top_speed_max_kmh", "top_speed_max_kmh_auto"),
        "km/h",
      ),
    },
    { label: "0-100 km/h", value: zeroTo100 !== null && zeroTo100 !== undefined ? `${number(zeroTo100)} s` : "" },
    { label: "Voltage Platform", value: voltage !== null && voltage !== undefined ? `${number(voltage)}V` : "" },
    { label: "Dimensions", value: formatDimensions(row) },
    { label: "Seating", value: formatSeats(row) },
    { label: "Wheelbase", value: wheelbase !== null && wheelbase !== undefined ? `${number(wheelbase)} mm` : "" },
    { label: "Ground Clearance", value: groundClearance !== null && groundClearance !== undefined ? `${number(groundClearance)} mm` : "" },
    { label: "Boot Volume", value: bootVolume !== null && bootVolume !== undefined ? `${number(bootVolume)} L` : "" },
    { label: "Charging", value: firstText(rowValue(row, "charging", "household_charging")) },
    {
      label: "V2L",
      value: [
        firstText(rowValue(row, "v2l_availability")),
        rowValue(row, "v2l_output_power_kw") != null ? `${number(rowValue(row, "v2l_output_power_kw"))} kW` : "",
      ].filter(Boolean).join(" · "),
    },
    { label: "Battery Warranty", value: formatWarranty(row) },
  ].filter((item) => item.value);
}

function booleanValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  return /^(?:1|true|yes|recommended)$/i.test(text(value));
}

function trimPrice(trim: D1VehicleTrim): string {
  return price({
    display_price_low: trim.display_price_low,
    display_price_high: trim.display_price_high,
  } as D1VehicleModel);
}

function trimBatteryDisplay(trim: D1VehicleTrim): string {
  const capacity = number(trim.battery_capacity_kwh);
  const chemistry = firstText(trim.battery_chemistry);
  if (capacity !== null && chemistry) return `${capacity} kWh ${chemistry} battery`;
  if (capacity !== null) return `${capacity} kWh battery`;
  return chemistry ? `${chemistry} battery` : "";
}

function trimMotorDisplay(trim: D1VehicleTrim): string {
  const power = number(trim.motor_power_kw);
  const torque = number(trim.motor_torque_n_m);
  if (power !== null && torque !== null) return `${power} kW / ${torque} N-m`;
  if (power !== null) return `${power} kW`;
  if (torque !== null) return `${torque} N-m`;
  return "";
}

function trimChargingDisplay(trim: D1VehicleTrim): string {
  if (!booleanValue(trim.dc_fast_charge_supported)) return "";
  const time = number(trim.dc_fast_charge_time_hours);
  const min = number(trim.dc_fast_charge_min_percent);
  const max = number(trim.dc_fast_charge_max_percent);
  const window = min !== null && max !== null ? `${min}-${max}%` : "DC fast charge";
  return time !== null ? `${window} in ${time} h` : window;
}

function trimComparison(row: D1VehicleModel | null, trims: D1VehicleTrim[]): Record<string, unknown> {
  const commonFeatures = row
    ? objectArray(rowValue(row, "common_features_json", "common_features_json_pruned"))
      .map((item) => ({
        category: firstText(item.category, item.title, "Shared Features"),
        items: stringArray(item.items),
      }))
      .filter((group) => group.items.length > 0)
    : [];
  return {
    status: trims.length ? "Verified" : "TBC",
    trims: trims.map((trim) => ({
      trimConfigId: firstText(trim.trim_config_id, trim.id),
      name: firstText(trim.trim_name, "Standard"),
      order: number(trim.trim_order) ?? undefined,
      priceDisplay: trimPrice(trim),
      rangeKm: number(trim.cltc_range_km) ?? undefined,
      rangeDisplay: range(trim.cltc_range_km, trim.cltc_range_km, "km"),
      batteryCapacityKwh: number(trim.battery_capacity_kwh) ?? undefined,
      batteryChemistry: firstText(trim.battery_chemistry),
      batteryDisplay: trimBatteryDisplay(trim),
      motorPowerKw: number(trim.motor_power_kw) ?? undefined,
      motorTorqueNm: number(trim.motor_torque_n_m) ?? undefined,
      motorDisplay: trimMotorDisplay(trim),
      drivetrainDisplay: firstText(trim.drivetrain_display),
      dcFastChargeSupported: booleanValue(trim.dc_fast_charge_supported),
      dcFastChargeTimeHours: number(trim.dc_fast_charge_time_hours) ?? undefined,
      dcFastChargeMinPercent: number(trim.dc_fast_charge_min_percent) ?? undefined,
      dcFastChargeMaxPercent: number(trim.dc_fast_charge_max_percent) ?? undefined,
      chargingDisplay: trimChargingDisplay(trim),
      baseFeatures: stringArray(trim.base_spec_summary_json),
      addedFeatures: stringArray(trim.added_features_json),
      upgradedFeatures: stringArray(trim.upgraded_features_json),
      recommended: booleanValue(trim.recommended),
      sourceStatus: firstText(trim.status, "TBC"),
    })),
    commonFeatures,
    sourceSummary: firstText(row?.why_section_description),
    lastVerifiedAt: firstText(row?.synced_at),
  };
}

export async function getPublicProduct(db: D1Database | null, slug: string): Promise<PublicProductDetail | null> {
  const normalizedSlug = normalizeProductSlug(slug);
  const products = await listPublicProducts(db);
  const vehicle = products.find((item) => item.slug === normalizedSlug);
  if (!vehicle) return null;
  const rows = db ? await queryVehicleModels(db) : [];
  const row = rows.find((candidate) => rowSlug(candidate) === normalizedSlug);
  if (!row) {
    return {
      modelId: normalizedSlug,
      slug: normalizedSlug,
      vehicle,
      category: vehicle.category,
      title: `${vehicle.brand} ${vehicle.name}`,
      subtitle: vehicle.charging,
      heroDesc: vehicle.charging,
      stat1Label: "Battery",
      stat1Value: vehicle.battery,
      stat2Label: "Range",
      stat2Value: vehicle.range,
      stat3Label: "FOB",
      stat3Value: vehicle.fob,
      whyTitle: `Why ${vehicle.name}`,
      whyDesc: vehicle.charging,
      features: featureItems({} as D1VehicleModel, vehicle),
      specsLeft: [{ label: "Battery", value: vehicle.battery, green: true }, { label: "Battery Type", value: vehicle.batteryType }],
      specsRight: [{ label: "Range", value: vehicle.range, gold: true }, { label: "FOB", value: vehicle.fob }],
      fits: fitItems(vehicle),
      relatedModels: products.filter((item) => item.slug !== vehicle.slug).slice(0, 3).map((item) => ({ name: `${item.brand} ${item.name}`, href: item.link })),
      tags: vehicle.tags,
      galleryImages: galleryImages({} as D1VehicleModel, vehicle.slug),
      trimComparison: trimComparison(null, []),
    };
  }
  const trims = await queryVehicleTrims(db, firstText(row.model_id, row.id));
  const modelId = firstText(row.model_id, row.id, normalizedSlug);
  const title = firstText(row.page_title, `${vehicle.brand} ${vehicle.name}`);
  const subtitle = firstText(row.page_subtitle, vehicle.charging);
  const heroDesc = firstText(row.hero_description, vehicle.charging);
  const modelSpecs = specs(row, vehicle);
  return {
    modelId,
    slug: normalizedSlug,
    vehicle,
    category: vehicle.category,
    title,
    subtitle,
    heroDesc,
    stat1Label: "Battery",
    stat1Value: vehicle.battery,
    stat2Label: "Range",
    stat2Value: vehicle.range,
    stat3Label: "FOB",
    stat3Value: vehicle.fob,
    whyTitle: `Why ${vehicle.name}`,
    whyDesc: firstText(row.why_section_description, heroDesc),
    features: featureItems(row, vehicle),
    specsLeft: modelSpecs.slice(0, Math.ceil(modelSpecs.length / 2)),
    specsRight: modelSpecs.slice(Math.ceil(modelSpecs.length / 2)),
    fits: fitItems(vehicle),
    relatedModels: products.filter((item) => item.slug !== vehicle.slug && item.category === vehicle.category).slice(0, 3).map((item) => ({ name: `${item.brand} ${item.name}`, href: item.link })),
    tags: vehicle.tags,
    galleryImages: galleryImages(row, normalizedSlug),
    trimComparison: trimComparison(row, trims),
  };
}

function insightSummary(row: RawInsight, baseline?: PublicInsightArticle): PublicInsightSummary | null {
  const slug = firstText(row.slug, baseline?.slug);
  if (!slug) return null;
  const sortDate = firstText(row.sortDate, row.sort_date, row.date, baseline?.sortDate);
  return {
    slug,
    title: firstText(row.title, baseline?.title),
    category: firstText(row.category, baseline?.category),
    date: firstText(row.date, baseline?.date, sortDate),
    sortDate,
    readTime: firstText(row.readTime, row.read_time, baseline?.readTime),
    coverImage: resolveInsightImage(slug, firstText(row.coverImage, row.cover_image)),
    sortOrder: number(row.sortOrder ?? row.sort_order) ?? baseline?.sortOrder ?? 999,
    overview: firstText(row.overview, baseline?.overview),
  };
}

export async function listPublicInsights(db: D1Database | null): Promise<PublicInsightSummary[]> {
  const rows = (db
    ? await queryRows<RawInsight>(db, "SELECT slug, title, category, date, read_time as readTime, cover_image as coverImage, overview, sort_order as sortOrder, status FROM articles WHERE status = 'Published'")
    : [])
    .filter((row) => {
      const status = firstText(row.status).toLowerCase();
      return !status || status === "published";
    });
  const bySlug = new Map(rows.map((row) => [firstText(row.slug), row]));
  const result = BASELINE_INSIGHTS.map((baseline) => insightSummary(bySlug.get(baseline.slug) ?? {}, baseline)).filter((item): item is PublicInsightSummary => Boolean(item));
  const known = new Set(result.map((item) => item.slug));
  for (const row of rows) {
    const item = insightSummary(row);
    if (item && !known.has(item.slug)) {
      result.push(item);
      known.add(item.slug);
    }
  }
  return result.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPublicInsight(db: D1Database | null, slug: string): Promise<PublicInsightArticle | null> {
  const normalizedSlug = normalizeProductSlug(slug);
  const rows = (db
    ? await queryRows<RawInsight>(db, "SELECT slug, title, category, date, read_time as readTime, cover_image as coverImage, overview, content, status FROM articles WHERE status = 'Published'")
    : [])
    .filter((item) => {
      const status = firstText(item.status).toLowerCase();
      return !status || status === "published";
    });
  const row = rows.find((item) => normalizeProductSlug(firstText(item.slug)) === normalizedSlug);
  const baseline = BASELINE_INSIGHTS.find((item) => item.slug === normalizedSlug);
  if (!row && !baseline) return null;
  const summary = insightSummary(row ?? {}, baseline);
  if (!summary) return null;
  return { ...summary, content: firstText(row?.content, baseline?.content) };
}

function normalizeAcademyCategory(category: string): "fundamentals" | "playbook" | "workshop" | "" {
  const value = category.trim().toLowerCase();
  if (value === "fundamentals" || value === "ev-fundamentals") return "fundamentals";
  if (value === "playbook" || value === "dealer-playbook") return "playbook";
  if (value === "workshop" || value === "technical-workshop") return "workshop";
  return "";
}

type AcademyLessonCategory = "fundamentals" | "playbook" | "workshop";

function academyLesson(row: RawAcademyLesson, category: AcademyLessonCategory, baseline?: PublicAcademyLesson): PublicAcademyLesson | null {
  const slug = firstText(row.slug, baseline?.slug);
  if (!slug) return null;
  return {
    title: firstText(row.title, baseline?.title),
    category,
    tag: firstText(row.tag, baseline?.tag),
    slug,
    desc: firstText(row.desc, row.description, baseline?.desc),
    img: resolveLessonImage(category, slug, firstText(row.img, row.image, row.image_url)),
    content: firstText(row.content, baseline?.content, row.desc, row.description),
  };
}

export async function listPublicAcademy(db: D1Database | null): Promise<PublicAcademyPayload> {
  const [lessonRows, vaultRows] = db
    ? await Promise.all([
      queryRows<RawAcademyLesson>(db, "SELECT title, tag, slug, description as desc, category, content FROM academy_lessons"),
      queryRows<RawVaultItem>(db, "SELECT id as translationId, title, type, description as desc, file_size as size, download_url as downloadLink, category FROM academy_vault"),
    ])
    : [[], []] as [RawAcademyLesson[], RawVaultItem[]];
  const lessons: PublicAcademyPayload["lessons"] = {
    fundamentals: [...BASELINE_ACADEMY.lessons.fundamentals],
    playbook: [...BASELINE_ACADEMY.lessons.playbook],
    workshop: [...BASELINE_ACADEMY.lessons.workshop],
    vault: [],
  };
  for (const row of lessonRows) {
    const category = normalizeAcademyCategory(firstText(row.category));
    if (!category) continue;
    const item = academyLesson(row, category, lessons[category].find((lesson) => lesson.slug === firstText(row.slug)));
    if (!item) continue;
    const index = lessons[category].findIndex((lesson) => lesson.slug === item.slug);
    if (index >= 0) lessons[category][index] = item;
    else lessons[category].push(item);
  }
  const vault = [...BASELINE_ACADEMY.vault];
  for (const row of vaultRows) {
    const id = firstText(row.translationId, row.id);
    if (!id) continue;
    const item: PublicAcademyVaultItem = {
      translationId: id,
      title: firstText(row.title),
      type: firstText(row.type),
      desc: firstText(row.desc, row.description),
      size: firstText(row.size, row.file_size, "2.4 MB"),
      downloadLink: firstText(row.downloadLink, row.download_url, "/qr"),
      category: firstText(row.category) || undefined,
    };
    const index = vault.findIndex((existing) => existing.translationId === id);
    if (index >= 0) vault[index] = { ...vault[index], ...item };
    else vault.push(item);
  }
  return { lessons, vault };
}

export async function getPublicAcademyLesson(db: D1Database | null, category: string, slug: string): Promise<PublicAcademyLesson | null> {
  const normalizedCategory = normalizeAcademyCategory(category);
  if (!normalizedCategory) return null;
  const academy = await listPublicAcademy(db);
  const normalizedSlug = normalizeProductSlug(slug);
  return academy.lessons[normalizedCategory].find(
    (lesson) => normalizeProductSlug(lesson.slug) === normalizedSlug,
  ) ?? null;
}

async function queryRows<T>(db: D1Database, sql: string, values: unknown[] = []): Promise<T[]> {
  let retried = false;
  while (true) {
    try {
      const statement = values.length ? db.prepare(sql).bind(...values) : db.prepare(sql);
      const result = await statement.all<T>();
      return result.results;
    } catch (error) {
      if (retried) throw error;
      retried = true;
    }
  }
}
