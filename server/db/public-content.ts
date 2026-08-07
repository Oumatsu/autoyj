import {
  normalizeProductCategory,
  normalizeProductSlug,
  normalizeAssetUrl,
} from "../../lib/content-normalizers";
import {
  getVehicleGalleryImages,
  getVehicleModelImage,
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

type StaticProduct = Omit<PublicProductCard, "category" | "sortOrder"> & {
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
  const low = number(row.display_price_low);
  const high = number(row.display_price_high);
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
  const baseline = getVehicleGalleryImages(slug, row.image_url);
  const parsed = parseJson(row.gallery_images_json);
  const entries = Array.isArray(parsed) ? parsed : [];
  const extra = entries
    .map((entry, index) => {
      const source = typeof entry === "string" ? entry : entry && typeof entry === "object" ? (entry as Record<string, unknown>).src : null;
      const src = normalizeAssetUrl(typeof source === "string" ? source : null);
      if (!src) return null;
      const fields = typeof entry === "object" && entry !== null ? entry as Record<string, unknown> : {};
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

function cardFromStatic(item: StaticProduct): PublicProductCard {
  return { ...item, img: getVehicleModelImage(item.slug, item.img) };
}

function mergeCard(baseline: PublicProductCard, row: D1VehicleModel): PublicProductCard {
  const slug = normalizeProductSlug(firstText(row.product_path, row.model_id, baseline.slug));
  const status = mapStatus(row, baseline);
  const category = normalizeProductCategory(row.segment, row.product_path) ?? baseline.category;
  return {
    ...baseline,
    slug,
    category,
    brand: firstText(row.brand, baseline.brand),
    name: firstText(row.model, baseline.name),
    fob: price(row) || baseline.fob,
    battery: range(row.battery_capacity_min_kwh, row.battery_capacity_max_kwh, "kWh") || baseline.battery,
    batteryType: firstText(row.battery_chemistry, row.battery_technology, baseline.batteryType),
    range: range(row.cltc_range_min_km, row.cltc_range_max_km, "km") || baseline.range,
    charging: firstText(row.charging, row.household_charging, baseline.charging),
    img: getVehicleModelImage(slug, row.image_url),
    ...status,
    link: firstText(row.product_path, baseline.link),
    tags: stringArray(row.common_features_json).length ? stringArray(row.common_features_json) : baseline.tags,
  };
}

function d1OnlyCard(row: D1VehicleModel, sortOrder: number): PublicProductCard | null {
  const slug = normalizeProductSlug(firstText(row.product_path, row.model_id, row.model));
  const brand = firstText(row.brand);
  const name = firstText(row.model);
  const category = normalizeProductCategory(row.segment, row.product_path);
  if (!slug || !brand || !name || !category || !row.product_path) return null;
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
    img: getVehicleModelImage(slug, row.image_url),
    status: "tbc",
    statusText: "TBC",
    link: row.product_path,
    tags: [],
    sortOrder,
  };
  return mergeCard(fallback, row);
}

export async function listPublicProducts(db: D1Database): Promise<PublicProductCard[]> {
  const rows = await queryVehicleModels(db);
  const cards = staticProducts.map((item) => {
    const baseline = cardFromStatic(item);
    const row = rows.find((candidate) => normalizeProductSlug(candidate.product_path ?? candidate.model_id ?? candidate.model) === baseline.slug);
    return row ? mergeCard(baseline, row) : baseline;
  });
  const existing = new Set(cards.map((card) => card.slug));
  for (const row of rows) {
    const slug = normalizeProductSlug(row.product_path ?? row.model_id ?? row.model);
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
  const parsed = objectArray(row.common_features_json);
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

function specs(row: D1VehicleModel, card: PublicProductCard): Array<{ label: string; value: string; green?: boolean; gold?: boolean }> {
  return [
    { label: "Battery", value: card.battery, green: true },
    { label: "Battery Type", value: card.batteryType },
    { label: "Range", value: card.range, gold: true },
    { label: "Drivetrain", value: firstText(row.drivetrain_display) },
    { label: "Motor Power", value: range(row.motor_power_min_kw, row.motor_power_max_kw, "kW") },
    { label: "Top Speed", value: range(row.top_speed_min_kmh, row.top_speed_max_kmh, "km/h") },
  ].filter((item) => item.value);
}

function trimComparison(trims: D1VehicleTrim[]): Record<string, unknown> {
  return {
    status: trims.length ? "Verified" : "TBC",
    trims: trims.map((trim) => ({
      trimConfigId: firstText(trim.trim_config_id, trim.id),
      name: firstText(trim.trim_name, "Standard"),
      rangeKm: number(trim.cltc_range_km) ?? undefined,
      rangeDisplay: range(trim.cltc_range_km, trim.cltc_range_km, "km"),
      batteryCapacityKwh: number(trim.battery_capacity_kwh) ?? undefined,
      batteryChemistry: firstText(trim.battery_chemistry),
      motorPowerKw: number(trim.motor_power_kw) ?? undefined,
      motorTorqueNm: number(trim.motor_torque_n_m) ?? undefined,
      drivetrainDisplay: firstText(trim.drivetrain_display),
      baseFeatures: stringArray(trim.base_spec_summary_json),
      addedFeatures: stringArray(trim.added_features_json),
      upgradedFeatures: stringArray(trim.upgraded_features_json),
      recommended: Boolean(trim.recommended),
    })),
    commonFeatures: [],
    sourceSummary: "",
    lastVerifiedAt: "",
  };
}

export async function getPublicProduct(db: D1Database, slug: string): Promise<PublicProductDetail | null> {
  const normalizedSlug = normalizeProductSlug(slug);
  const products = await listPublicProducts(db);
  const vehicle = products.find((item) => item.slug === normalizedSlug);
  if (!vehicle) return null;
  const rows = await queryVehicleModels(db);
  const row = rows.find((candidate) => normalizeProductSlug(candidate.product_path ?? candidate.model_id ?? candidate.model) === normalizedSlug);
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
      fits: [],
      relatedModels: products.filter((item) => item.slug !== vehicle.slug).slice(0, 3).map((item) => ({ name: `${item.brand} ${item.name}`, href: item.link })),
      tags: vehicle.tags,
      galleryImages: galleryImages({} as D1VehicleModel, vehicle.slug),
      trimComparison: trimComparison([]),
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
    fits: [
      { icon: "01", title: "Fleet Operations", desc: "Built for practical operating economics.", accent: "green" },
      { icon: "02", title: "African Conditions", desc: "Source-backed specifications for local decisions.", accent: "gold" },
    ],
    relatedModels: products.filter((item) => item.slug !== vehicle.slug && item.category === vehicle.category).slice(0, 3).map((item) => ({ name: `${item.brand} ${item.name}`, href: item.link })),
    tags: vehicle.tags,
    galleryImages: galleryImages(row, normalizedSlug),
    trimComparison: trimComparison(trims),
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

export async function listPublicInsights(db: D1Database): Promise<PublicInsightSummary[]> {
  const rows = (await queryRows<RawInsight>(db, "SELECT slug, title, category, date, read_time as readTime, cover_image as coverImage, overview, sort_order as sortOrder, status FROM articles WHERE status = 'Published'"))
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

export async function getPublicInsight(db: D1Database, slug: string): Promise<PublicInsightArticle | null> {
  const normalizedSlug = normalizeProductSlug(slug);
  const rows = (await queryRows<RawInsight>(db, "SELECT slug, title, category, date, read_time as readTime, cover_image as coverImage, overview, content, status FROM articles WHERE slug = ? AND status = 'Published'", [slug]))
    .filter((item) => {
      const status = firstText(item.status).toLowerCase();
      return !status || status === "published";
    });
  const row = rows.find((item) => firstText(item.slug) === slug || normalizeProductSlug(firstText(item.slug)) === normalizedSlug);
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

export async function listPublicAcademy(db: D1Database): Promise<PublicAcademyPayload> {
  const [lessonRows, vaultRows] = await Promise.all([
    queryRows<RawAcademyLesson>(db, "SELECT title, tag, slug, description as desc, category, content FROM academy_lessons"),
    queryRows<RawVaultItem>(db, "SELECT id as translationId, title, type, description as desc, file_size as size, download_url as downloadLink, category FROM academy_vault"),
  ]);
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

export async function getPublicAcademyLesson(db: D1Database, category: string, slug: string): Promise<PublicAcademyLesson | null> {
  const normalizedCategory = normalizeAcademyCategory(category);
  if (!normalizedCategory) return null;
  const academy = await listPublicAcademy(db);
  return academy.lessons[normalizedCategory].find((lesson) => lesson.slug === slug) ?? null;
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
