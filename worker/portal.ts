/// <reference types="@cloudflare/workers-types" />

type Env = {
  FEISHU_API_URL?: string;
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  FEISHU_BASE_APP_TOKEN?: string;
  FEISHU_TABLE_INTERNAL_USERS?: string;
  FEISHU_TABLE_EXTERNAL_ACCOUNTS?: string;
  FEISHU_TABLE_CUSTOMERS?: string;
  FEISHU_TABLE_VEHICLE_MODELS?: string;
  FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS?: string;
  FEISHU_TABLE_VEHICLES?: string;
  FEISHU_TABLE_INQUIRIES?: string;
  FEISHU_TABLE_QUOTES?: string;
  FEISHU_TABLE_NEGOTIATIONS?: string;
  FEISHU_TABLE_ORDERS?: string;
  FEISHU_TABLE_PORTAL_AUDIT_LOG?: string;
  PORTAL_SESSION_SECRET?: string;
  PORTAL_COOKIE_NAME?: string;
  FEISHU_TABLE_ARTICLES?: string;
  FEISHU_TABLE_ACADEMY_LESSONS?: string;
  FEISHU_TABLE_ACADEMY_VAULT?: string;
  DEV?: boolean;
};

type PortalRole = "admin" | "sales" | "sourcing" | "finance" | "partner" | "customer";
type PriceTier = "hidden" | "partner" | "vip" | "internal";
type AccountType = "internal" | "external";

type FeishuRecord = {
  record_id: string;
  fields: Record<string, unknown>;
};

type BaseRecordListResponse = {
  items?: FeishuRecord[];
  data?: unknown[][];
  fields?: string[];
  field_id_list?: string[];
  record_id_list?: string[];
  has_more?: boolean;
  page_token?: string;
  total?: number;
};

type PortalSession = {
  userId: string;
  customerId: string;
  name: string;
  email: string;
  accountType: AccountType;
  role: PortalRole;
  priceTier: PriceTier;
  company: string;
  exp: number;
};

type PortalInternalUser = {
  recordId: string;
  userId: string;
  name: string;
  email: string;
  role: PortalRole;
  status: string;
  department: string;
  canEditVehicles: boolean;
  canSeeCost: boolean;
  canSeeSupplier: boolean;
  sourcingCommissionRate: number;
  salesCommissionRate: number;
};

type PortalCustomer = {
  recordId: string;
  customerId: string;
  company: string;
  contact: string;
  email: string;
  role: PortalRole;
  priceTier: PriceTier;
  status: string;
  country: string;
  owner: string;
};

type PortalVehicleModel = {
  id: string;
  brand: string;
  model: string;
  trim: string;
  year: string;
  bodyType: string;
  fuelType: string;
  msrpChina: string;
  battery: string;
  batteryType: string;
  batteryMaker: string;
  range: string;
  energyConsumption: string;
  motorPower: string;
  motorTorque: string;
  driveType: string;
  topSpeed: string;
  acceleration: string;
  seats: string;
  doors: string;
  dimensions: string;
  wheelbase: string;
  curbWeight: string;
  trunkCapacity: string;
  charging: string;
  frontSuspension: string;
  rearSuspension: string;
  adas: string;
  warranty: string;
  marketPosition: string;
  exportNotes: string;
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  lastSyncedAt: string;
  fullSpecsJson: string;
  status: string;
};

type PortalVehicleModelSpec = {
  modelId: string;
  category: string;
  name: string;
  value: string;
  unit: string;
  visibleLevel: string;
  sortOrder: number;
  sourceName: string;
  sourceUrl: string;
  confidence: string;
};

type PortalAuditLog = {
  id: string;
  time: string;
  operatorId: string;
  operatorName: string;
  operatorEmail: string;
  role: PortalRole;
  action: string;
  targetType: string;
  targetId: string;
  targetSummary: string;
  changedFields: string;
  before: string;
  after: string;
  result: string;
};

const FEISHU_API = "https://open.feishu.cn";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const DEFAULT_COOKIE_NAME = "autoyj_portal";
const DEFAULT_DATA_SOURCE = "autoYJ";
const TENANT_TOKEN_SAFETY_WINDOW_MS = 60 * 1000;

// Simple in-memory cache definition in worker context
const cacheMap = new Map<string, { value: any; expires: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key: string): any | null {
  const item = cacheMap.get(key);
  if (item && item.expires > Date.now()) return item.value;
  return null;
}

function setCached(key: string, value: any, env?: Env) {
  const isDev = env?.DEV === true || (typeof process !== "undefined" && process?.env?.NODE_ENV === "development");
  const ttl = isDev ? 2000 : CACHE_TTL_MS;
  cacheMap.set(key, { value, expires: Date.now() + ttl });
}

let tenantTokenCache:
  | {
      appId: string;
      token: string;
      expiresAt: number;
      pending?: Promise<string>;
    }
  | null = null;

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });
}

function problem(message: string, status = 400) {
  return json({ error: message }, { status });
}

function requireEnv(env: Env, key: keyof Env): string {
  const value = env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return String(value);
}

function optionalEnv(env: Env, key: keyof Env): string {
  const value = env[key];
  return value ? String(value) : "";
}

function asText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(", ");
  }
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.text ?? item.name ?? item.value ?? item.id ?? "");
  }
  return String(value);
}

function cleanUrl(value: unknown): string {
  const text = asText(value);
  const mdMatch = text.match(/\[.*?\]\((.*?)\)/);
  if (mdMatch) return mdMatch[1].trim();
  return text.trim();
}

function fieldText(fields: Record<string, unknown>, names: string[]): string {
  for (const name of names) {
    const value = asText(fields[name]).trim();
    if (value) return value;
  }
  return "";
}

function fieldNumber(fields: Record<string, unknown>, names: string[]): number | undefined {
  const value = fieldText(fields, names).replace(/[$,\s]/g, "");
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function formatNumericValue(value: number, options: { precision?: number; thousands?: boolean } = {}) {
  const precision = options.precision ?? (Number.isInteger(value) ? 0 : 1);
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: precision,
    useGrouping: options.thousands ?? true,
  });
}

function formatAcceleration(fields: Record<string, unknown>) {
  const seconds = fieldNumber(fields, ["0 - 100 km/h (sec)", "fld7KFZ8h5", "0 - 100 km/h", "Acceleration"]);
  if (seconds === undefined) return "";
  return `${formatNumericValue(seconds, { precision: 2, thousands: false })} sec`;
}

function formatAcSlowCharge(fields: Record<string, unknown>) {
  const hours = fieldNumber(fields, ["AC Slow Charge Full Time Hours", "fldI0yvSQ1", "AC Slow Charge"]);
  if (hours === undefined) return "";
  return `${formatNumericValue(hours, { precision: 2, thousands: false })} hrs (0-100%)`;
}

function formatHouseholdCharging(fields: Record<string, unknown>) {
  const value = fields["Household Charging"];
  if (asBool(value)) return "Yes - export charger depends on market";
  const text = asText(value).trim().toLowerCase();
  return text.startsWith("yes") ? "Yes - export charger depends on market" : "";
}

function formatSunroofAvailability(fields: Record<string, unknown>) {
  const value = fieldText(fields, ["Sunroof Availability", "fldKVDPAOF"]);
  if (!value) return "";

  const normalized = value.trim().toLowerCase();
  if (normalized === "by trim") return "Available by trim";
  if (normalized === "not available") return "Not available";
  if (normalized === "standard") return "Standard";
  if (normalized === "optional") return "Optional";
  return value;
}

function formatV2lSupport(fields: Record<string, unknown>) {
  const availability = fieldText(fields, ["V2L Availability", "fldsdLDsu8"]);
  if (!availability) return "";

  const outputPower = fieldNumber(fields, ["V2L Output Power (kW)", "fld0LkhKNz"]);
  const outputText = outputPower === undefined
    ? ""
    : `${formatNumericValue(outputPower, { precision: 1, thousands: false })} kW`;

  const normalized = availability.trim().toLowerCase();
  if (normalized === "standard") return outputText ? `Yes - ${outputText}` : "Yes";
  if (normalized === "optional") return outputText ? `Optional - ${outputText}` : "Optional";
  if (normalized === "by trim") return outputText ? `Available by trim - ${outputText}` : "Available by trim";
  if (normalized === "market dependent") return outputText ? `Depends on market - ${outputText}` : "Depends on market";
  if (normalized === "not supported") return "Not Supported";
  return outputText ? `${availability} - ${outputText}` : availability;
}

function formatAirbags(fields: Record<string, unknown>) {
  const count = fieldNumber(fields, ["Airbags", "fldG2brb4l"]);
  if (count === undefined) return "";
  return `${formatNumericValue(count, { precision: 0, thousands: false })} airbags`;
}

function formatBootVolume(fields: Record<string, unknown>) {
  const text = fieldText(fields, ["Boot Volume (L)", "fld6DyIXUd", "Boot Volume", "Trunk Capacity"]);
  if (!text) return "";

  const range = text.match(/^([\d,]+(?:\.\d+)?)\s*[-–]\s*([\d,]+(?:\.\d+)?)/);
  if (range) {
    const low = Number(range[1].replace(/,/g, ""));
    const high = Number(range[2].replace(/,/g, ""));
    if (Number.isFinite(low) && Number.isFinite(high)) {
      return `${formatNumericValue(low, { precision: 0 })} - ${formatNumericValue(high, { precision: 0 })} L`;
    }
  }

  const numeric = text.match(/[\d,]+(?:\.\d+)?/);
  if (numeric) {
    const value = Number(numeric[0].replace(/,/g, ""));
    if (Number.isFinite(value)) return `${formatNumericValue(value, { precision: 0 })} L`;
  }

  return text;
}

function formatGroundClearance(fields: Record<string, unknown>) {
  const text = fieldText(fields, ["Ground Clearance (mm)", "fldTZtzcZi", "Ground Clearance"]);
  if (!text) return "";

  const numeric = text.match(/[\d,]+(?:\.\d+)?/);
  if (numeric) {
    const value = Number(numeric[0].replace(/,/g, ""));
    if (Number.isFinite(value)) return `${formatNumericValue(value, { precision: 0 })} mm`;
  }

  return text;
}

function formatNumberRange(
  fields: Record<string, unknown>,
  minName: string,
  maxName: string,
  unit: string,
  options: { precision?: number; thousands?: boolean } = {},
) {
  const min = fieldNumber(fields, [minName]);
  const max = fieldNumber(fields, [maxName]);
  if (min === undefined && max === undefined) return "";
  if (min !== undefined && max !== undefined && min !== max) {
    return formatNumericValue(min, options) + " - " + formatNumericValue(max, options) + (unit ? " " + unit : "");
  }
  const value = min ?? max;
  return value === undefined ? "" : formatNumericValue(value, options) + (unit ? " " + unit : "");
}

function formatUsdGuidePrice(fields: Record<string, unknown>) {
  const min = fieldNumber(fields, ["Guide Price Min USD"]);
  const max = fieldNumber(fields, ["Guide Price Max USD"]);
  if (min !== undefined && max !== undefined && min !== max) {
    return "$" + formatNumericValue(min, { precision: 0 }) + " - $" + formatNumericValue(max, { precision: 0 });
  }
  const value = min ?? max;
  if (value !== undefined) return "$" + formatNumericValue(value, { precision: 0 });
  return "";
}

function formatBatteryWarranty(fields: Record<string, unknown>) {
  const years = fieldNumber(fields, ["Battery Warranty Years"]);
  const distance = fieldNumber(fields, ["Battery Warranty Distance KM"]);
  if (years !== undefined && distance !== undefined) {
    return formatNumericValue(years, { precision: 0, thousands: false }) + " Yrs / " + formatNumericValue(distance, { precision: 0 }) + " km";
  }
  if (years !== undefined) return formatNumericValue(years, { precision: 0, thousands: false }) + " Yrs";
  if (distance !== undefined) return formatNumericValue(distance, { precision: 0 }) + " km";
  return "";
}

function formatDimensions(fields: Record<string, unknown>) {
  const length = fieldNumber(fields, ["Length MM"]);
  const width = fieldNumber(fields, ["Width MM"]);
  const height = fieldNumber(fields, ["Height MM"]);
  if (length !== undefined && width !== undefined && height !== undefined) {
    return formatNumericValue(length, { precision: 0 }) + " x " + formatNumericValue(width, { precision: 0 }) + " x " + formatNumericValue(height, { precision: 0 }) + " mm";
  }
  return "";
}

function formatHeroCltcRangeValue(fields: Record<string, unknown>) {
  const min = fieldNumber(fields, ["CLTC Range Min KM"]);
  const max = fieldNumber(fields, ["CLTC Range Max KM"]);
  if (min === undefined && max === undefined) return "";

  const low = min ?? max;
  const high = max ?? min;
  if (low === undefined || high === undefined) return "";

  const lowText = formatNumericValue(low, { precision: 0 });
  const highText = formatNumericValue(high, { precision: 0 });
  return lowText === highText ? lowText : `${lowText} - ${highText}`;
}

function formatBatteryChemistryMetric(fields: Record<string, unknown>) {
  const chemistry = fieldText(fields, ["Battery Chemistry", "fldtmrhwXT"]) || fieldText(fields, ["Battery Type"]);
  const technology = fieldText(fields, ["Battery Technology", "fldLaMFXCZ"]);
  if (!chemistry) return "";
  return technology ? `${chemistry} (${technology})` : chemistry;
}

function formatBatteryCatalogTag(fields: Record<string, unknown>) {
  const chemistry = fieldText(fields, ["Battery Chemistry", "fldtmrhwXT"]) || fieldText(fields, ["Battery Type"]);
  const technology = fieldText(fields, ["Battery Technology", "fldLaMFXCZ"]);
  const normalizedChemistry = chemistry.toUpperCase();
  const normalizedTechnology = technology.toLowerCase();
  if (!chemistry) return "";
  if (normalizedChemistry === "LFP" && normalizedTechnology.includes("blade")) return "LFP Blade (BYD)";
  if (normalizedChemistry === "LFP") return "LFP (Lithium Iron Phosphate)";
  if (normalizedChemistry === "NCM" || normalizedChemistry === "NMC") return "NCM (Ternary Lithium)";
  if (normalizedChemistry === "NCM / LFP") return "NCM / LFP";
  return chemistry;
}

function formatSteeringCatalogTag(fields: Record<string, unknown>) {
  const steering = fieldText(fields, ["Steering Setup", "fldvdJYRpe"]);
  if (steering === "LHD") return "LHD (Left-Hand Drive)";
  if (steering === "RHD") return "RHD (Right-Hand Drive)";
  if (steering === "LHD / RHD") return "LHD / RHD";
  return "";
}

function rangeCatalogTag(fields: Record<string, unknown>, category: string) {
  const min = fieldNumber(fields, ["CLTC Range Min KM"]);
  const max = fieldNumber(fields, ["CLTC Range Max KM"]);
  const value = max ?? min;
  if (value === undefined) return "";
  if (category === "utility-pro") {
    if (value < 250) return "Under 250 km";
    if (value <= 350) return "250 km - 350 km";
    return "350 km +";
  }
  if (category === "elite-flagship") {
    if (value < 500) return "Under 500 km";
    if (value <= 700) return "500 km - 700 km";
    return "700 km +";
  }
  if (value < 300) return "Under 300 km";
  if (value <= 450) return "300 km - 450 km";
  return "450 km +";
}

function priceCatalogTag(fields: Record<string, unknown>, category: string) {
  const min = fieldNumber(fields, ["Guide Price Min USD"]);
  const max = fieldNumber(fields, ["Guide Price Max USD"]);
  const value = min !== undefined && max !== undefined ? (min + max) / 2 : (min ?? max);
  if (value === undefined) return "";
  if (category === "utility-pro") {
    if (value < 20000) return "Under $20,000";
    if (value <= 35000) return "$20,000 - $35,000";
    return "Above $35,000";
  }
  if (category === "elite-flagship") {
    if (value <= 50000) return "$35,000 - $50,000";
    if (value <= 65000) return "$50,000 - $65,000";
    return "Above $65,000";
  }
  if (value < 15000) return "Under $15,000";
  if (value <= 20000) return "$15,000 - $20,000";
  return "Above $20,000";
}

function availabilityCatalogTag(status: string, category: string) {
  if (status === "in-stock") return "In Stock (Port)";
  if (category === "utility-pro") return "Factory Order (18+ Days)";
  if (category === "revenue-king") return "Factory Order (14+ Days)";
  return "Factory Order (21+ Days)";
}

function inventoryStatusFromFields(fields: Record<string, unknown>) {
  const rawStatus = fieldText(fields, ["Inventory Status", "fldniKLbQN"]).trim();
  const normalized = rawStatus.toLowerCase();

  if (!rawStatus || normalized === "tbc") {
    return {
      inventoryStatus: rawStatus || "TBC",
      status: "tbc",
      statusText: "TBC",
    };
  }

  if (normalized.includes("in stock") || rawStatus.includes("现货")) {
    return {
      inventoryStatus: rawStatus,
      status: "in-stock",
      statusText: "In Stock (Port)",
    };
  }

  if (normalized.includes("production") || rawStatus.includes("排产")) {
    return {
      inventoryStatus: rawStatus,
      status: "production",
      statusText: rawStatus,
    };
  }

  return {
    inventoryStatus: rawStatus,
    status: "tbc",
    statusText: rawStatus,
  };
}

function buildCatalogTags(fields: Record<string, unknown>, category: string, availabilityStatus = "factory") {
  const tags: string[] = [];
  const push = (value: string) => {
    if (value && !tags.includes(value)) tags.push(value);
  };

  push(fieldText(fields, ["Vehicle Class", "Segment"]));
  push(formatBatteryCatalogTag(fields));
  push(rangeCatalogTag(fields, category));
  push(priceCatalogTag(fields, category));
  push(formatSteeringCatalogTag(fields));

  const voltage = fieldNumber(fields, ["Voltage Platform (V)", "fldLrZkwa9"]);
  if (voltage !== undefined && voltage >= 800) push("800V Platform");

  const powertrain = fieldText(fields, ["Powertrain Type", "fldl9evNHQ"]);
  if (powertrain === "EREV") push("EREV (Extended Range)");

  const v2lAvailability = fieldText(fields, ["V2L Availability", "fldsdLDsu8"]).toLowerCase();
  if (v2lAvailability && v2lAvailability !== "not supported") push("V2L Power Export");

  const driveType = fieldText(fields, ["Drive Type"]);
  if (/\b(4wd|awd|four-wheel|all-wheel)\b/i.test(driveType)) push("4WD / AWD");

  const clearance = fieldNumber(fields, ["Ground Clearance (mm)", "fldTZtzcZi"]);
  if (clearance !== undefined && clearance >= 200) push("High Clearance (200mm+)");

  push(availabilityCatalogTag(availabilityStatus, category));
  return tags;
}

function productPathFromValue(value: unknown): string {
  const sourceUrl = cleanUrl(value).split("?")[0].split("#")[0].trim();
  if (!sourceUrl) return "";
  if (sourceUrl.startsWith("/")) return sourceUrl;

  try {
    return new URL(sourceUrl).pathname || "";
  } catch {
    const productsIndex = sourceUrl.indexOf("/products/");
    return productsIndex === -1 ? sourceUrl : sourceUrl.slice(productsIndex);
  }
}

function productSlugFromSourceUrl(value: unknown): string {
  const productPath = productPathFromValue(value);
  const parts = productPath.split("/").filter(Boolean);
  const productsIndex = parts.indexOf("products");
  if (productsIndex === -1 || productsIndex + 2 >= parts.length) return "";
  return `${parts[productsIndex + 1]}/${parts[productsIndex + 2]}`;
}

function productPathFromFields(fields: Record<string, unknown>): string {
  return productPathFromValue(fieldText(fields, ["Product Path", "Source URL"]));
}

function productSlugFromFields(fields: Record<string, unknown>): string {
  return productSlugFromSourceUrl(fieldText(fields, ["Product Path", "Source URL"]));
}

function syncedAtMs(record: FeishuRecord): number {
  const text = asText(record.fields["Last Synced At"]).replace(" ", "T");
  const value = Date.parse(text);
  return Number.isFinite(value) ? value : 0;
}

function isActiveModel(record: FeishuRecord) {
  return asText(record.fields.Status) === "Active";
}

function latestProductModelRecords(records: FeishuRecord[]): FeishuRecord[] {
  const bySlug = new Map<string, FeishuRecord>();
  const fallback: FeishuRecord[] = [];
  for (const record of records) {
    const slug = productSlugFromFields(record.fields);
    if (!slug) {
      fallback.push(record);
      continue;
    }
    const existing = bySlug.get(slug);
    if (!existing || syncedAtMs(record) >= syncedAtMs(existing)) {
      bySlug.set(slug, record);
    }
  }
  return [...bySlug.values(), ...fallback];
}

function normalizeAcademyCategory(category: string): string {
  const cat = category.toLowerCase().trim();
  if (cat === "dealer-playbook") return "playbook";
  if (cat === "ev-fundamentals") return "fundamentals";
  if (cat === "technical-workshop") return "workshop";
  return cat;
}

function safeJsonParse(val: unknown, fallback: any = []): any {
  const text = asText(val).trim();
  if (!text) return fallback;
  try {
    return JSON.parse(text);
  } catch (e) {
    return fallback;
  }
}

function asNumber(value: unknown) {
  const number = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(number) ? number : 0;
}

function asOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(Array.isArray(value) ? value[0] : value);
  return Number.isFinite(number) ? number : null;
}

function asBool(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  const text = asText(value).toLowerCase();
  return ["true", "yes", "1", "是", "已上架"].includes(text);
}

function normalizeRole(value: unknown): PortalRole {
  const text = asText(value).toLowerCase();
  if (text === "admin" || text === "sales" || text === "sourcing" || text === "finance" || text === "partner") return text;
  return "customer";
}

function normalizePriceTier(value: unknown): PriceTier {
  const text = asText(value).toLowerCase();
  if (text === "internal") return "internal";
  if (text === "vip") return "vip";
  if (text === "partner") return "partner";
  return "hidden";
}

function isInternalSession(session: PortalSession) {
  return session.accountType === "internal" || session.role === "admin" || session.role === "sales" || session.role === "sourcing" || session.role === "finance";
}

function canManageVehicles(session: PortalSession) {
  return session.role === "admin" || session.role === "sales";
}

function canViewAuditLogs(session: PortalSession) {
  return session.role === "admin";
}

function canSeePortalPrice(session: PortalSession) {
  return isInternalSession(session) || session.priceTier === "partner" || session.priceTier === "vip" || session.priceTier === "internal";
}

function isLocalRequest(request: Request) {
  const host = new URL(request.url).hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
}

function cookieName(env: Env) {
  return env.PORTAL_COOKIE_NAME || DEFAULT_COOKIE_NAME;
}

function getCookie(request: Request, name: string) {
  const cookie = request.headers.get("cookie") || "";
  const parts = cookie.split(";").map((part) => part.trim());
  const prefix = `${name}=`;
  const match = parts.find((part) => part.startsWith(prefix));
  return match ? decodeURIComponent(match.slice(prefix.length)) : "";
}

function encodeBase64Url(bytes: ArrayBuffer | Uint8Array | string) {
  const uint8 =
    typeof bytes === "string"
      ? new TextEncoder().encode(bytes)
      : bytes instanceof Uint8Array
        ? bytes
        : new Uint8Array(bytes);
  let binary = "";
  for (const byte of uint8) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

async function hmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return encodeBase64Url(signature);
}

async function signSession(env: Env, session: PortalSession) {
  const secret = requireEnv(env, "PORTAL_SESSION_SECRET");
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

async function readSession(request: Request, env: Env): Promise<PortalSession | null> {
  const token = getCookie(request, cookieName(env));
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = await hmac(requireEnv(env, "PORTAL_SESSION_SECRET"), payload);
  if (signature !== expected) return null;
  const session = JSON.parse(decodeBase64Url(payload)) as PortalSession;
  if (!session.exp || session.exp < Math.floor(Date.now() / 1000)) return null;
  session.accountType = session.accountType || (session.role === "admin" || session.role === "sales" || session.role === "sourcing" || session.role === "finance" ? "internal" : "external");
  session.userId = session.userId || session.customerId || session.email;
  session.name = session.name || session.email;
  return session;
}

function sessionCookie(env: Env, request: Request, token: string) {
  const parts = [
    `${cookieName(env)}=${encodeURIComponent(token)}`,
    "Path=/",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
  ];
  if (new URL(request.url).protocol === "https:") parts.push("Secure");
  return parts.join("; ");
}

function clearSessionCookie(env: Env, request: Request) {
  const parts = [`${cookieName(env)}=`, "Path=/", "Max-Age=0", "HttpOnly", "SameSite=Lax"];
  if (new URL(request.url).protocol === "https:") parts.push("Secure");
  return parts.join("; ");
}

async function feishuToken(env: Env) {
  if (env.FEISHU_API_URL?.includes("localhost") || env.FEISHU_API_URL?.includes("127.0.0.1")) {
    return "dummy-local-token";
  }
  const appId = requireEnv(env, "FEISHU_APP_ID");
  const appSecret = requireEnv(env, "FEISHU_APP_SECRET");
  const now = Date.now();
  if (tenantTokenCache?.appId === appId && tenantTokenCache.token && tenantTokenCache.expiresAt - TENANT_TOKEN_SAFETY_WINDOW_MS > now) {
    return tenantTokenCache.token;
  }
  if (tenantTokenCache?.appId === appId && tenantTokenCache.pending) return tenantTokenCache.pending;

  const pending = (async () => {
    const apiBase = env.FEISHU_API_URL || FEISHU_API;
    const response = await fetch(`${apiBase}/open-apis/auth/v3/tenant_access_token/internal`, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        app_id: appId,
        app_secret: appSecret,
      }),
    });
    const data = (await response.json()) as { code?: number; msg?: string; tenant_access_token?: string; expire?: number };
    if (!response.ok || data.code !== 0 || !data.tenant_access_token) {
      throw new Error(`Feishu auth failed: ${data.msg || response.statusText}`);
    }
    tenantTokenCache = {
      appId,
      token: data.tenant_access_token,
      expiresAt: Date.now() + Math.max((data.expire || 7200) - 60, 60) * 1000,
    };
    return data.tenant_access_token;
  })();

  tenantTokenCache = { appId, token: "", expiresAt: 0, pending };
  try {
    return await pending;
  } catch (error) {
    if (tenantTokenCache?.pending === pending) tenantTokenCache = null;
    throw error;
  }
}

async function feishuRequest<T>(
  env: Env,
  method: string,
  path: string,
  body?: Record<string, unknown>,
  attempt = 0,
): Promise<T> {
  const token = await feishuToken(env);
  const apiBase = env.FEISHU_API_URL || FEISHU_API;
  const response = await fetch(`${apiBase}${path}`, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as { code?: number; msg?: string; data?: T };
  if (!response.ok || data.code !== 0) {
    if (attempt < 2 && /limited|rate/i.test(data.msg || "")) {
      await delay(300 * (attempt + 1));
      return feishuRequest<T>(env, method, path, body, attempt + 1);
    }
    throw new Error(`Feishu API failed: ${data.msg || response.statusText}`);
  }
  return data.data as T;
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function searchRecords(
  env: Env,
  tableId: string,
  options: { filter?: Record<string, unknown>; sort?: unknown[]; pageSize?: number } = {},
) {
  const appToken = requireEnv(env, "FEISHU_BASE_APP_TOKEN");
  const pageSize = options.pageSize || 100;
  const filter = normalizeBaseFilter(options.filter);
  const records: FeishuRecord[] = [];
  let offset = 0;
  for (let page = 0; page < 20; page++) {
    const query = new URLSearchParams({
      limit: String(pageSize),
      offset: String(offset),
    });
    if (filter) query.set("filter", JSON.stringify(filter));
    if (options.sort) query.set("sort", JSON.stringify(options.sort));
    const data = await feishuRequest<BaseRecordListResponse>(
      env,
      "GET",
      `/open-apis/base/v3/bases/${appToken}/tables/${tableId}/records?${query.toString()}`,
    );
    const pageRecords = normalizeBaseRecords(data);
    records.push(...pageRecords);
    offset += pageSize;
    if (!data.has_more || pageRecords.length < pageSize) break;
  }
  return records;
}

async function createRecord(env: Env, tableId: string, fields: Record<string, unknown>) {
  const appToken = requireEnv(env, "FEISHU_BASE_APP_TOKEN");
  const data = await feishuRequest<{ record?: FeishuRecord }>(
    env,
    "POST",
    `/open-apis/base/v3/bases/${appToken}/tables/${tableId}/records`,
    fields,
  );
  return data.record;
}

async function updateRecord(env: Env, tableId: string, recordId: string, fields: Record<string, unknown>) {
  const appToken = requireEnv(env, "FEISHU_BASE_APP_TOKEN");
  await feishuRequest(
    env,
    "PATCH",
    `/open-apis/base/v3/bases/${appToken}/tables/${tableId}/records/${recordId}`,
    fields,
  );
}

async function deleteRecord(env: Env, tableId: string, recordId: string) {
  const appToken = requireEnv(env, "FEISHU_BASE_APP_TOKEN");
  await feishuRequest(env, "DELETE", `/open-apis/base/v3/bases/${appToken}/tables/${tableId}/records/${recordId}`);
}

function equalsFilter(fieldName: string, value: string) {
  return {
    conjunction: "and",
    conditions: [
      {
        field_name: fieldName,
        operator: "is",
        value: [value],
      },
    ],
  };
}

function normalizeBaseRecords(data: BaseRecordListResponse) {
  if (Array.isArray(data.items)) return data.items;
  const rows = Array.isArray(data.data) ? data.data : [];
  const fields = Array.isArray(data.fields) ? data.fields : [];
  const fieldIds = Array.isArray(data.field_id_list) ? data.field_id_list : [];
  const recordIds = Array.isArray(data.record_id_list) ? data.record_id_list : [];
  return rows.map((row, rowIndex) => {
    const recordFields: Record<string, unknown> = {};
    fields.forEach((fieldName, fieldIndex) => {
      recordFields[fieldName] = row[fieldIndex];
    });
    fieldIds.forEach((fieldId, fieldIndex) => {
      recordFields[fieldId] = row[fieldIndex];
    });
    return {
      record_id: recordIds[rowIndex] || "",
      fields: recordFields,
    };
  });
}


function normalizeBaseFilter(filter?: Record<string, unknown>) {
  if (!filter) return undefined;
  const conditions = Array.isArray(filter.conditions) ? filter.conditions : [];
  return {
    logic: filter.conjunction === "or" ? "or" : "and",
    conditions: conditions
      .map((condition) => {
        const item = condition as Record<string, unknown>;
        const field = asText(item.field_name || item.field);
        const operator = asText(item.operator);
        const values = Array.isArray(item.value) ? item.value : [item.value];
        if (!field) return null;
        if (operator === "is" || operator === "==") return [field, "==", asText(values[0])];
        return [field, operator || "==", values.length === 1 ? values[0] : values];
      })
      .filter(Boolean),
  };
}

function mapInternalUser(record: FeishuRecord): PortalInternalUser {
  const fields = record.fields;
  return {
    recordId: record.record_id,
    userId: asText(fields["User ID"]),
    name: asText(fields.Name),
    email: asText(fields.Email).toLowerCase(),
    role: normalizeRole(fields.Role),
    status: asText(fields.Status) || "Active",
    department: asText(fields.Department),
    canEditVehicles: asBool(fields["Can Edit Vehicles"]),
    canSeeCost: asBool(fields["Can See Cost"]),
    canSeeSupplier: asBool(fields["Can See Supplier"]),
    sourcingCommissionRate: asNumber(fields["Sourcing Commission Rate"]),
    salesCommissionRate: asNumber(fields["Sales Commission Rate"]),
  };
}

function mapCustomer(record: FeishuRecord): PortalCustomer {
  const fields = record.fields;
  return {
    recordId: record.record_id,
    customerId: asText(fields["Account ID"]) || asText(fields["Customer ID"]),
    company: asText(fields.Company),
    contact: asText(fields.Contact),
    email: asText(fields.Email).toLowerCase(),
    role: normalizeRole(fields.Role),
    priceTier: normalizePriceTier(fields["Price Tier"]),
    status: asText(fields.Status) || "Active",
    country: asText(fields.Country),
    owner: asText(fields.Owner),
  };
}

function sessionFromInternalUser(user: PortalInternalUser): Omit<PortalSession, "exp"> {
  return {
    userId: user.userId,
    customerId: user.userId,
    name: user.name,
    email: user.email,
    accountType: "internal",
    role: user.role,
    priceTier: "internal",
    company: "autoYJ",
  };
}

function sessionFromExternalAccount(account: PortalCustomer): Omit<PortalSession, "exp"> {
  return {
    userId: account.customerId,
    customerId: account.customerId,
    name: account.contact,
    email: account.email,
    accountType: "external",
    role: account.role,
    priceTier: account.priceTier,
    company: account.company,
  };
}

function publicUser(session: PortalSession) {
  return {
    userId: session.userId,
    customerId: session.customerId,
    name: session.name,
    email: session.email,
    accountType: session.accountType,
    company: session.company,
    role: session.role,
    priceTier: session.priceTier,
  };
}

function mapVehicleModel(record: FeishuRecord): PortalVehicleModel {
  const fields = record.fields;
  return {
    id: fieldText(fields, ["Model ID"]),
    brand: fieldText(fields, ["Brand"]),
    model: fieldText(fields, ["Model"]),
    trim: fieldText(fields, ["Version", "Trim"]),
    year: fieldText(fields, ["Model Year"]),
    bodyType: fieldText(fields, ["Segment", "Body Type"]),
    fuelType: fieldText(fields, ["Energy Type", "Fuel Type"]),
    msrpChina: formatUsdGuidePrice(fields),
    battery: formatNumberRange(fields, "Battery Capacity Min kWh", "Battery Capacity Max kWh", "kWh", { precision: 1, thousands: false }),
    batteryType: formatBatteryChemistryMetric(fields),
    batteryMaker: fieldText(fields, ["Battery Maker"]),
    range: formatNumberRange(fields, "CLTC Range Min KM", "CLTC Range Max KM", "km", { precision: 0 }),
    energyConsumption: fieldText(fields, ["Energy Consumption"]),
    motorPower: formatNumberRange(fields, "Motor Power Min KW", "Motor Power Max KW", "kW", { precision: 0, thousands: false }),
    motorTorque: fieldText(fields, ["Motor Torque"]),
    driveType: fieldText(fields, ["Drive Type"]),
    topSpeed: formatNumberRange(fields, "Top Speed Min KMH", "Top Speed Max KMH", "km/h", { precision: 0, thousands: false }),
    acceleration: formatAcceleration(fields),
    seats: formatNumberRange(fields, "Seats Min", "Seats Max", "seats", { precision: 0, thousands: false }),
    doors: fieldText(fields, ["Doors"]),
    dimensions: formatDimensions(fields),
    wheelbase: formatNumberRange(fields, "Wheelbase MM", "Wheelbase MM", "mm", { precision: 0 }),
    curbWeight: fieldText(fields, ["Curb Weight"]),
    trunkCapacity: fieldText(fields, ["Trunk Capacity"]),
    charging: fieldText(fields, ["Charging"]),
    frontSuspension: fieldText(fields, ["Front Suspension"]),
    rearSuspension: fieldText(fields, ["Rear Suspension"]),
    adas: fieldText(fields, ["ADAS"]),
    warranty: formatBatteryWarranty(fields),
    marketPosition: fieldText(fields, ["Market Position"]),
    exportNotes: fieldText(fields, ["Review Notes", "Export Notes"]),
    imageUrl: fieldText(fields, ["Image URL"]),
    sourceUrl: productPathFromFields(fields),
    sourceName: DEFAULT_DATA_SOURCE,
    lastSyncedAt: fieldText(fields, ["Last Synced At"]),
    fullSpecsJson: fieldText(fields, ["Full Specs JSON"]),
    status: fieldText(fields, ["Status"]) || "Active",
  };
}

function synthesizeSpecsFromModel(record: FeishuRecord): PortalVehicleModelSpec[] {
  const fields = record.fields;
  const modelId = asText(fields["Model ID"]);
  if (!modelId) return [];

  const sourceName = DEFAULT_DATA_SOURCE;
  const sourceUrl = productPathFromFields(fields);
  const specs: PortalVehicleModelSpec[] = [];
  const pushSpec = (category: string, name: string, value: string, sortOrder: number, visibleLevel = "Core") => {
    const text = value.trim();
    if (!text) return;
    specs.push({
      modelId,
      category,
      name,
      value: text,
      unit: "",
      visibleLevel,
      sortOrder,
      sourceName,
      sourceUrl,
      confidence: "High",
    });
  };

  pushSpec("Basic", "Guide Price", formatUsdGuidePrice(fields), 0);
  pushSpec("Basic", "Vehicle Class", valueForModelSpecField(fields, ["Vehicle Class", "Segment", "Body Type"]), 10);
  pushSpec("Basic", "Energy Type", valueForModelSpecField(fields, ["Energy Type", "Fuel Type", "Battery Type"]), 15);
  pushSpec("Basic", "Market Position", valueForModelSpecField(fields, ["Market Position", "Review Notes"]), 95, "Standard");
  pushSpec("Battery / Charging", "CLTC Range", formatNumberRange(fields, "CLTC Range Min KM", "CLTC Range Max KM", "km", { precision: 0 }), 20);
  pushSpec("Battery / Charging", "Battery Capacity", formatNumberRange(fields, "Battery Capacity Min kWh", "Battery Capacity Max kWh", "kWh", { precision: 1, thousands: false }), 30);
  pushSpec("Battery / Charging", "Battery Chemistry", formatBatteryChemistryMetric(fields), 40);
  pushSpec("Battery / Charging", "Charging", valueForModelSpecField(fields, ["Charging", "DC Fast Charge", "AC Slow Charge Full Time Hours", "AC Slow Charge"]), 80, "Standard");
  pushSpec("Battery / Charging", "DC Fast Charge", valueForModelSpecField(fields, ["DC Fast Charge"]), 82, "Standard");
  pushSpec("Battery / Charging", "AC Slow Charge", formatAcSlowCharge(fields), 84, "Standard");
  pushSpec("Motor", "Motor Power", formatNumberRange(fields, "Motor Power Min KW", "Motor Power Max KW", "kW", { precision: 0, thousands: false }), 50);
  pushSpec("Motor", "Drive Type", valueForModelSpecField(fields, ["Drive Type"]), 60);
  pushSpec("Motor", "0-100 km/h", formatAcceleration(fields), 65);
  pushSpec("Motor", "Top Speed", formatNumberRange(fields, "Top Speed Min KMH", "Top Speed Max KMH", "km/h", { precision: 0, thousands: false }), 70);
  pushSpec("Body", "Dimensions", formatDimensions(fields), 100, "Standard");
  pushSpec("Body", "Wheelbase", formatNumberRange(fields, "Wheelbase MM", "Wheelbase MM", "mm", { precision: 0 }), 110, "Standard");
  pushSpec("Body", "Seats", formatNumberRange(fields, "Seats Min", "Seats Max", "seats", { precision: 0, thousands: false }), 120, "Standard");
  pushSpec("Body", "Boot Volume", formatBootVolume(fields), 130, "Standard");
  pushSpec("Body", "Ground Clearance", formatGroundClearance(fields), 140, "Standard");
  pushSpec("Exterior", "Sunroof", formatSunroofAvailability(fields), 200, "Standard");
  pushSpec("Passive Safety", "Airbags", formatAirbags(fields), 210, "Standard");
  pushSpec("Export Fit", "Household Charging", formatHouseholdCharging(fields), 300, "Standard");
  pushSpec("Export Fit", "Battery Warranty", formatBatteryWarranty(fields), 310, "Standard");
  pushSpec("Export Fit", "V2L Support", formatV2lSupport(fields), 320, "Standard");

  return specs;
}

function enrichVehicleModelsWithSpecs(models: PortalVehicleModel[], specs: PortalVehicleModelSpec[]) {
  if (!specs.length) return models;
  const specsByModel = new Map<string, Map<string, PortalVehicleModelSpec>>();
  for (const spec of specs) {
    if (!spec.modelId || !spec.name) continue;
    if (!specsByModel.has(spec.modelId)) specsByModel.set(spec.modelId, new Map());
    specsByModel.get(spec.modelId)!.set(spec.name, spec);
  }

  const valueFor = (modelId: string, names: string[]) => {
    const specs = specsByModel.get(modelId);
    if (!specs) return "";
    for (const name of names) {
      const spec = specs.get(name);
      if (spec?.value) return spec.unit ? `${spec.value} ${spec.unit}`.trim() : spec.value;
    }
    return "";
  };

  return models.map((model) => ({
    ...model,
    bodyType: model.bodyType || valueFor(model.id, ["Vehicle Class", "车身级别"]),
    fuelType: model.fuelType || valueFor(model.id, ["Energy Type", "能源类型"]),
    battery: model.battery || valueFor(model.id, ["Battery Capacity", "电池容量"]),
    batteryType: model.batteryType || valueFor(model.id, ["Battery Chemistry", "Battery Type", "电池类型"]),
    batteryMaker: model.batteryMaker || valueFor(model.id, ["电池供应商"]),
    range: model.range || valueFor(model.id, ["CLTC Range", "Range (CLTC)", "Range", "CLTC续航"]),
    energyConsumption: model.energyConsumption || valueFor(model.id, ["百公里耗电量"]),
    motorPower: model.motorPower || valueFor(model.id, ["Motor Power", "System Power", "电机总功率", "电机总马力"]),
    motorTorque: model.motorTorque || valueFor(model.id, ["电机总扭矩"]),
    driveType: model.driveType || valueFor(model.id, ["驱动方式"]),
    topSpeed: model.topSpeed || valueFor(model.id, ["最高车速"]),
    acceleration: model.acceleration || valueFor(model.id, ["0-100km/h加速", "0-50km/h加速"]),
    seats: model.seats || valueFor(model.id, ["座位数"]),
    doors: model.doors || valueFor(model.id, ["车门数"]),
    dimensions: model.dimensions || valueFor(model.id, ["长宽高"]),
    wheelbase: model.wheelbase || valueFor(model.id, ["轴距"]),
    curbWeight: model.curbWeight || valueFor(model.id, ["整备质量"]),
    trunkCapacity: model.trunkCapacity || valueFor(model.id, ["后备厢容积"]),
    charging: model.charging || valueFor(model.id, ["充电说明", "快充时间 30-80%", "快充峰值功率"]),
    frontSuspension: model.frontSuspension || valueFor(model.id, ["前悬架类型"]),
    rearSuspension: model.rearSuspension || valueFor(model.id, ["后悬架类型"]),
    adas: model.adas || valueFor(model.id, ["ADAS"]),
    warranty: model.warranty || valueFor(model.id, ["质保说明"]),
    marketPosition: model.marketPosition || valueFor(model.id, ["Market Position", "市场定位"]),
    fullSpecsJson: model.fullSpecsJson || valueFor(model.id, ["原始参数JSON"]),
    exportNotes: model.exportNotes || valueFor(model.id, ["出口备注", "版本核对"]),
  }));
}

function mapVehicle(record: FeishuRecord, session: PortalSession) {
  const fields = record.fields;
  const partnerPrice = asNumber(fields["Partner Price"]);
  const customerPrice = asNumber(fields["Customer Price"]);
  const cost = asNumber(fields.Cost);
  const isInternal = isInternalSession(session);
  const canSeePrice = canSeePortalPrice(session);
  const visiblePrice =
    (session.priceTier === "vip" || session.priceTier === "internal") && customerPrice > 0
      ? customerPrice
      : partnerPrice;
  return {
    id: asText(fields["Vehicle ID"]),
    modelId: asText(fields["Model ID"]),
    brand: asText(fields.Brand),
    model: asText(fields.Model),
    trim: asText(fields.Trim),
    year: asText(fields.Year),
    color: asText(fields.Color),
    exteriorColor: asText(fields["Exterior Color"]) || asText(fields.Color),
    interiorColor: asText(fields["Interior Color"]),
    supplierExteriorColor: isInternal ? asText(fields["Supplier Exterior Color"]) : "",
    supplierInteriorColor: isInternal ? asText(fields["Supplier Interior Color"]) : "",
    colorCode: isInternal ? asText(fields["Color Code"]) : "",
    colorNotes: isInternal ? asText(fields["Color Notes"]) : "",
    colorConfirmed: isInternal ? asBool(fields["Color Confirmed"]) : false,
    configuration: asText(fields.Configuration),
    supplier: asText(fields.Supplier),
    recorder: isInternal ? asText(fields.Recorder) : "",
    location: asText(fields.Location),
    status: asText(fields.Status),
    exportStatus: asText(fields["Export Status"]),
    stockQuantity: asNumber(fields["Stock Quantity"]),
    leadTime: asText(fields["Lead Time"]),
    priceValidUntil: asText(fields["Price Valid Until"]),
    imageUrl: asText(fields["Image URL"]),
    publicNotes: asText(fields["Public Notes"]),
    canSeePrice,
    price: canSeePrice ? visiblePrice : null,
    partnerPrice: isInternal ? partnerPrice : null,
    customerPrice: isInternal ? customerPrice : null,
    cost: isInternal ? cost : null,
    isListed: asBool(fields["Is Listed"]),
    editableFields: canManageVehicles(session) ? Object.keys(fields) : [],
    priceLabel: canSeePrice
      ? isInternal
        ? "Internal portal price"
        : session.priceTier === "vip"
          ? "VIP cooperation price"
          : "Cooperation price"
      : "Request quote",
  };
}

function mapAuditLog(record: FeishuRecord): PortalAuditLog {
  const fields = record.fields;
  return {
    id: asText(fields["Log ID"]) || record.record_id,
    time: asText(fields.Time),
    operatorId: asText(fields["Operator ID"]),
    operatorName: asText(fields["Operator Name"]),
    operatorEmail: asText(fields["Operator Email"]),
    role: normalizeRole(fields.Role),
    action: asText(fields.Action),
    targetType: asText(fields["Target Type"]),
    targetId: asText(fields["Target ID"]),
    targetSummary: asText(fields["Target Summary"]),
    changedFields: asText(fields["Changed Fields"]),
    before: asText(fields.Before),
    after: asText(fields.After),
    result: asText(fields.Result),
  };
}

function deriveVehicleModelsFromVehicles(vehicles: ReturnType<typeof mapVehicle>[]): PortalVehicleModel[] {
  const grouped = new Map<string, PortalVehicleModel>();
  for (const vehicle of vehicles) {
    const id = vehicle.modelId || `${vehicle.brand}-${vehicle.model}-${vehicle.trim}-${vehicle.year}`.replace(/\s+/g, "-").toUpperCase();
    if (grouped.has(id)) continue;
    grouped.set(id, {
      id,
      brand: vehicle.brand,
      model: vehicle.model,
      trim: vehicle.trim,
      year: vehicle.year,
      bodyType: "",
      battery: "",
      range: "",
      motorPower: "",
      driveType: "",
      seats: "",
      dimensions: "",
      charging: "",
      warranty: "",
      marketPosition: vehicle.publicNotes,
      exportNotes: vehicle.exportStatus,
      imageUrl: vehicle.imageUrl,
      status: vehicle.status || "Active",
    } as unknown as PortalVehicleModel);
  }
  return Array.from(grouped.values());
}

function mapInquiry(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    inquiryNo: asText(fields["Inquiry No"]),
    customerId: asText(fields["Customer ID"]),
    vehicleId: asText(fields["Vehicle ID"]),
    vehicleModel: asText(fields["Vehicle Model"]),
    quantity: asNumber(fields.Quantity),
    destinationPort: asText(fields["Destination Port"]),
    tradeTerm: asText(fields["Trade Term"]),
    targetPrice: asNumber(fields["Target Price"]),
    notes: asText(fields.Notes),
    status: asText(fields.Status),
    createdAt: asText(fields["Created At"]),
    updatedAt: asText(fields["Updated At"]),
  };
}

function mapQuote(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    quoteNo: asText(fields["Quote No"]),
    inquiryNo: asText(fields["Inquiry No"]),
    version: asNumber(fields.Version),
    vehicleId: asText(fields["Vehicle ID"]),
    quantity: asNumber(fields.Quantity),
    unitPrice: asNumber(fields["Unit Price"]),
    currency: asText(fields.Currency) || "USD",
    tradeTerm: asText(fields["Trade Term"]),
    paymentTerms: asText(fields["Payment Terms"]),
    validUntil: asText(fields["Valid Until"]),
    status: asText(fields.Status),
    changeReason: asText(fields["Change Reason"]),
    createdAt: asText(fields["Created At"]),
  };
}

function mapNegotiation(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    logNo: asText(fields["Log No"]),
    inquiryNo: asText(fields["Inquiry No"]),
    quoteNo: asText(fields["Quote No"]),
    actor: asText(fields.Actor),
    action: asText(fields.Action),
    offeredPrice: asNumber(fields["Offered Price"]),
    quantity: asNumber(fields.Quantity),
    message: asText(fields.Message),
    createdAt: asText(fields["Created At"]),
  };
}

function mapOrder(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    orderNo: asText(fields["Order No"]),
    inquiryNo: asText(fields["Inquiry No"]),
    quoteNo: asText(fields["Quote No"]),
    customerId: asText(fields["Customer ID"]),
    vehicleId: asText(fields["Vehicle ID"]),
    quantity: asNumber(fields.Quantity),
    finalUnitPrice: asNumber(fields["Final Unit Price"]),
    total: asNumber(fields.Total),
    currency: asText(fields.Currency) || "USD",
    paymentTerms: asText(fields["Payment Terms"]),
    status: asText(fields.Status),
    createdAt: asText(fields["Created At"]),
  };
}

async function recordsByEmail(env: Env, tableId: string, email: string) {
  return searchRecords(env, tableId, { filter: equalsFilter("Email", email.toLowerCase()), pageSize: 10 });
}

async function findLoginAccount(env: Env, email: string, accessCode: string): Promise<Omit<PortalSession, "exp"> | null> {
  const internalTableId = optionalEnv(env, "FEISHU_TABLE_INTERNAL_USERS");
  if (internalTableId) {
    const records = await recordsByEmail(env, internalTableId, email);
    const match = records.find((record) => asText(record.fields["Access Code"]).trim() === accessCode);
    if (match) {
      const user = mapInternalUser(match);
      if (user.status && user.status.toLowerCase() !== "active") throw problem("This internal account is not active", 403);
      return sessionFromInternalUser(user);
    }
  }

  const externalTableId = optionalEnv(env, "FEISHU_TABLE_EXTERNAL_ACCOUNTS") || optionalEnv(env, "FEISHU_TABLE_CUSTOMERS");
  if (externalTableId) {
    const records = await recordsByEmail(env, externalTableId, email);
    const match = records.find((record) => asText(record.fields["Access Code"]).trim() === accessCode);
    if (match) {
      const account = mapCustomer(match);
      if (account.status && account.status.toLowerCase() !== "active") throw problem("This portal account is not active", 403);
      return sessionFromExternalAccount(account);
    }
  }

  return null;
}

async function requireSession(request: Request, env: Env) {
  const session = await readSession(request, env);
  if (!session) throw problem("Not signed in", 401);
  return session;
}

function nowText() {
  return new Date().toISOString();
}

function hasField(record: FeishuRecord, fieldName: string) {
  return Object.prototype.hasOwnProperty.call(record.fields, fieldName);
}

function nextId(prefix: string) {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

function vehicleSummary(fields: Record<string, unknown>) {
  return compactText([fields.Brand, fields.Model, fields.Year, fields.Trim, fields.Configuration]);
}

function compactText(values: unknown[]) {
  return values.map(asText).map((value) => value.trim()).filter(Boolean).join(" ");
}

function pickFields(fields: Record<string, unknown>, names: string[]) {
  return Object.fromEntries(names.map((name) => [name, fields[name]]).filter(([, value]) => value !== undefined));
}

function jsonText(value: unknown) {
  return JSON.stringify(value, null, 0);
}

function changedFieldNames(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(after).filter((field) => jsonText(before[field]) !== jsonText(after[field]));
}

async function writeAuditLog(
  env: Env,
  session: PortalSession,
  entry: {
    action: string;
    targetType: string;
    targetId: string;
    targetSummary?: string;
    changedFields?: string[];
    before?: unknown;
    after?: unknown;
    result?: string;
  },
) {
  const tableId = optionalEnv(env, "FEISHU_TABLE_PORTAL_AUDIT_LOG");
  if (!tableId) return;
  try {
    await createRecord(env, tableId, {
      "Log ID": nextId("AUD"),
      Time: nowText(),
      "Operator ID": session.userId || session.customerId || session.email,
      "Operator Name": session.name,
      "Operator Email": session.email,
      Role: session.role,
      Action: entry.action,
      "Target Type": entry.targetType,
      "Target ID": entry.targetId,
      "Target Summary": entry.targetSummary || "",
      "Changed Fields": (entry.changedFields || []).join(", "),
      Before: entry.before === undefined ? "" : jsonText(entry.before),
      After: entry.after === undefined ? "" : jsonText(entry.after),
      Result: entry.result || "success",
    });
  } catch (error) {
    console.error("Portal audit log write failed", error);
  }
}

async function findActiveModelById(env: Env, modelId: string) {
  const tableId = requireEnv(env, "FEISHU_TABLE_VEHICLE_MODELS");
  const records = await searchRecords(env, tableId, {
    filter: equalsFilter("Model ID", modelId),
    pageSize: 10,
  });
  const record = latestProductModelRecords(records.filter(isActiveModel))[0] || records.find(isActiveModel);
  return record || null;
}

function modelFieldsForVehicle(modelRecord: FeishuRecord) {
  const fields = modelRecord.fields;
  return {
    "Model ID": asText(fields["Model ID"]),
    Brand: asText(fields.Brand),
    Model: asText(fields.Model),
    Year: asText(fields.Year),
    Trim: asText(fields.Version) || asText(fields.Trim),
  };
}

function assertAllowed(value: string, allowed: string[], label: string) {
  if (!value || allowed.includes(value)) return;
  throw problem(`${label} is not allowed`, 400);
}

const vehicleStatusOptions = ["In Stock", "Preorder", "Unavailable"];
const vehicleExportStatusOptions = ["Exportable Now", "Later in 2026", "Check Permit"];

async function handleLogin(request: Request, env: Env) {
  const body = (await request.json().catch(() => null)) as { email?: string; accessCode?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const accessCode = String(body?.accessCode || "").trim();
  if (!email || !accessCode) return problem("Email and access code are required");

  const account = await findLoginAccount(env, email, accessCode);
  if (!account) return problem("Invalid portal credentials", 401);

  const session: PortalSession = {
    ...account,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await signSession(env, session);
  return json({ user: publicUser(session) }, { headers: { "set-cookie": sessionCookie(env, request, token) } });
}

async function handleDevLogin(request: Request, env: Env) {
  if (!isLocalRequest(request)) return problem("Dev login is only available on localhost", 404);

  const body = (await request.json().catch(() => null)) as { role?: string } | null;
  const role = String(body?.role || "").toLowerCase();
  const devCredentials: Record<string, { email: string; accessCode: string }> = {
    admin: { email: "admin@local.test", accessCode: "admin-demo-2026" },
    sales: { email: "sales@local.test", accessCode: "sales-demo-2026" },
    partner: { email: "partner@example.com", accessCode: "partner-demo-2026" },
    customer: { email: "customer@example.com", accessCode: "customer-demo-2026" },
  };

  const credentials = devCredentials[role];
  if (!credentials) return problem("Unknown development role", 400);

  const account = await findLoginAccount(env, credentials.email, credentials.accessCode);
  if (!account) return problem(`Development account ${credentials.email} is missing in Feishu Base`, 500);

  const session: PortalSession = {
    ...account,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await signSession(env, session);
  return json({ user: publicUser(session) }, { headers: { "set-cookie": sessionCookie(env, request, token) } });
}

async function handleBootstrap(request: Request, env: Env) {
  const session = await requireSession(request, env);
  const isInternal = isInternalSession(session);
  const vehicleModelTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_MODELS");
  const [vehicleRecords, vehicleModelRecords] = await Promise.all([
    searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
      pageSize: 100,
    }),
    vehicleModelTableId ? searchRecords(env, vehicleModelTableId, { pageSize: 100 }) : Promise.resolve([]),
  ]);
  const [inquiryRecords, orderRecords] = await Promise.all([
    searchRecords(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
      filter: isInternal ? undefined : equalsFilter("Customer ID", session.customerId),
      pageSize: 100,
    }),
    searchRecords(env, requireEnv(env, "FEISHU_TABLE_ORDERS"), {
      filter: isInternal ? undefined : equalsFilter("Customer ID", session.customerId),
      pageSize: 100,
    }),
  ]);
  const internalUserTableId = optionalEnv(env, "FEISHU_TABLE_INTERNAL_USERS");
  const externalAccountTableId = optionalEnv(env, "FEISHU_TABLE_EXTERNAL_ACCOUNTS") || optionalEnv(env, "FEISHU_TABLE_CUSTOMERS");
  const [internalUserRecords, customerRecords] = isInternal
    ? await Promise.all([
        internalUserTableId ? searchRecords(env, internalUserTableId, { pageSize: 100 }) : Promise.resolve([]),
        externalAccountTableId ? searchRecords(env, externalAccountTableId, { pageSize: 100 }) : Promise.resolve([]),
      ])
    : [[], []];

  const vehicles = vehicleRecords
    .filter((record) => asBool(record.fields["Is Listed"]))
    .map((record) => mapVehicle(record, session));
  const activeVehicleModelRecords = latestProductModelRecords(vehicleModelRecords.filter(isActiveModel));
  const vehicleModelSpecs = activeVehicleModelRecords.flatMap(synthesizeSpecsFromModel);
  const vehicleModels = activeVehicleModelRecords.length ? enrichVehicleModelsWithSpecs(activeVehicleModelRecords.map(mapVehicleModel), vehicleModelSpecs) : deriveVehicleModelsFromVehicles(vehicles);
  const inquiries = inquiryRecords.map(mapInquiry);
  const inquiryNos = new Set(inquiries.map((inquiry) => inquiry.inquiryNo));

  const [allQuotes, allNegotiations] =
    isInternal || inquiryNos.size
      ? await Promise.all([
          searchRecords(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), { pageSize: 100 }),
          searchRecords(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), { pageSize: 100 }),
        ])
      : [[], []];
  const quotes = allQuotes.map(mapQuote).filter((quote) => isInternal || inquiryNos.has(quote.inquiryNo));
  const negotiations = allNegotiations.map(mapNegotiation).filter((log) => isInternal || inquiryNos.has(log.inquiryNo));

  const orders = orderRecords.map(mapOrder);
  const internalUsers = internalUserRecords.map(mapInternalUser);
  const customers = customerRecords.map(mapCustomer);
  const auditLogTableId = optionalEnv(env, "FEISHU_TABLE_PORTAL_AUDIT_LOG");
  const auditLogs =
    canViewAuditLogs(session) && auditLogTableId
      ? (await searchRecords(env, auditLogTableId, {
          sort: [{ field_name: "Time", desc: true }],
          pageSize: 100,
        })).map(mapAuditLog)
      : [];

  if (canManageVehicles(session)) {
    await writeAuditLog(env, session, {
      action: "READ",
      targetType: "Vehicle",
      targetId: "Vehicles",
      targetSummary: "Portal vehicle resource list",
      result: "success",
    });
  }

  return json({
    user: publicUser(session),
    permissions: {
      canSeePrice: canSeePortalPrice(session),
      canRequestQuote: true,
      canCounterOffer: true,
    },
    vehicleModels,
    vehicleModelSpecs,
    vehicles,
    inquiries,
    quotes,
    negotiations,
    orders,
    internalUsers,
    customers,
    auditLogs,
  });
}

async function handleCreateInquiry(request: Request, env: Env) {
  const session = await requireSession(request, env);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const vehicleId = asText(body?.vehicleId).trim();
  const quantity = Math.max(1, Math.floor(asNumber(body?.quantity) || 1));
  if (!vehicleId) return problem("Vehicle ID is required");

  const vehicles = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
    filter: equalsFilter("Vehicle ID", vehicleId),
    pageSize: 5,
  });
  const vehicle = vehicles[0];
  if (!vehicle || !asBool(vehicle.fields["Is Listed"])) return problem("Vehicle is not available", 404);

  const inquiryNo = nextId("INQ");
  const createdAt = nowText();
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
    "Inquiry No": inquiryNo,
    "Customer ID": session.customerId,
    "Vehicle ID": vehicleId,
    "Vehicle Model": `${asText(vehicle.fields.Brand)} ${asText(vehicle.fields.Model)} ${asText(vehicle.fields.Trim)}`.trim(),
    Quantity: quantity,
    "Destination Port": asText(body?.destinationPort) || "To be confirmed",
    "Trade Term": asText(body?.tradeTerm) || "FOB",
    "Target Price": asNumber(body?.targetPrice),
    Notes: asText(body?.notes),
    Status: "New Inquiry",
    Source: "Customer Portal",
    "Created At": createdAt,
    "Updated At": createdAt,
  });
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), {
    "Log No": nextId("LOG"),
    "Inquiry No": inquiryNo,
    "Quote No": "",
    Actor: "Customer",
    Action: "Inquiry Created",
    "Offered Price": asNumber(body?.targetPrice),
    Quantity: quantity,
    Message: asText(body?.notes),
    "Created At": createdAt,
  });

  return json({ inquiryNo }, { status: 201 });
}

function vehiclePatchFromBody(body: Record<string, unknown>, existingFields?: Record<string, unknown>) {
  const updates: Record<string, unknown> = {};
  const allowField = (fieldName: string) => !existingFields || Object.prototype.hasOwnProperty.call(existingFields, fieldName);
  const setText = (fieldName: string, bodyKey: string) => {
    if (bodyKey in body && allowField(fieldName)) updates[fieldName] = asText(body[bodyKey]);
  };
  const setNumber = (fieldName: string, bodyKey: string) => {
    if (!(bodyKey in body) || !allowField(fieldName)) return;
    const number = asOptionalNumber(body[bodyKey]);
    updates[fieldName] = number ?? 0;
  };
  const setBool = (fieldName: string, bodyKey: string) => {
    if (bodyKey in body && allowField(fieldName)) updates[fieldName] = Boolean(body[bodyKey]);
  };

  setText("Color", "color");
  setText("Exterior Color", "exteriorColor");
  setText("Interior Color", "interiorColor");
  setText("Supplier Exterior Color", "supplierExteriorColor");
  setText("Supplier Interior Color", "supplierInteriorColor");
  setText("Color Code", "colorCode");
  setText("Color Notes", "colorNotes");
  setBool("Color Confirmed", "colorConfirmed");
  setText("Configuration", "configuration");
  setText("Supplier", "supplier");
  setText("Recorder", "recorder");
  setText("Location", "location");
  setText("Status", "status");
  setNumber("Stock Quantity", "stockQuantity");
  setText("Lead Time", "leadTime");
  setNumber("Partner Price", "partnerPrice");
  setNumber("Customer Price", "customerPrice");
  setNumber("Cost", "cost");
  setText("Price Valid Until", "priceValidUntil");
  setText("Public Notes", "publicNotes");
  setText("Image URL", "imageUrl");
  setText("Export Status", "exportStatus");
  setBool("Is Listed", "isListed");

  assertAllowed(asText(updates.Status), vehicleStatusOptions, "Vehicle status");
  assertAllowed(asText(updates["Export Status"]), vehicleExportStatusOptions, "Export status");
  return updates;
}

async function handleCreateVehicle(request: Request, env: Env) {
  const session = await requireSession(request, env);
  if (!canManageVehicles(session)) return problem("Only admin and sales can create vehicle resources", 403);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return problem("Request body is required");
  const modelId = asText(body.modelId).trim();
  if (!modelId) return problem("Model ID is required");

  const modelRecord = await findActiveModelById(env, modelId);
  if (!modelRecord) return problem("Selected vehicle model does not exist or is not active", 400);

  const vehicleId = asText(body.vehicleId).trim() || nextId("EV");
  const existing = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
    filter: equalsFilter("Vehicle ID", vehicleId),
    pageSize: 1,
  });
  if (existing.length > 0) return problem("Vehicle ID already exists", 409);

  const fields = {
    "Vehicle ID": vehicleId,
    ...modelFieldsForVehicle(modelRecord),
    Status: "In Stock",
    "Export Status": "Exportable Now",
    "Is Listed": true,
    ...vehiclePatchFromBody(body),
  };
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), fields);
  await writeAuditLog(env, session, {
    action: "CREATE",
    targetType: "Vehicle",
    targetId: vehicleId,
    targetSummary: vehicleSummary(fields),
    changedFields: Object.keys(fields),
    after: fields,
    result: "success",
  });
  return json({ ok: true, vehicleId }, { status: 201 });
}

async function handleUpdateVehicle(request: Request, env: Env, vehicleId: string) {
  const session = await requireSession(request, env);
  if (!canManageVehicles(session)) return problem("Only admin and sales can update vehicle resources", 403);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return problem("Request body is required");

  const records = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
    filter: equalsFilter("Vehicle ID", vehicleId),
    pageSize: 5,
  });
  const record = records[0];
  if (!record) return problem("Vehicle resource not found", 404);

  const updates: Record<string, unknown> = {};
  if ("modelId" in body) {
    const modelId = asText(body.modelId).trim();
    if (!modelId) return problem("Model ID is required");
    const modelRecord = await findActiveModelById(env, modelId);
    if (!modelRecord) return problem("Selected vehicle model does not exist or is not active", 400);
    Object.assign(updates, modelFieldsForVehicle(modelRecord));
  }
  Object.assign(updates, vehiclePatchFromBody(body, record.fields));

  if (Object.keys(updates).length === 0) return problem("No editable fields were provided");
  const before = pickFields(record.fields, Object.keys(updates));
  const after = { ...before, ...updates };
  const changed = changedFieldNames(before, after);
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), record.record_id, updates);
  await writeAuditLog(env, session, {
    action: "UPDATE",
    targetType: "Vehicle",
    targetId: vehicleId,
    targetSummary: vehicleSummary({ ...record.fields, ...updates }),
    changedFields: changed,
    before,
    after,
    result: "success",
  });
  return json({ ok: true });
}

async function handleDeleteVehicle(request: Request, env: Env, vehicleId: string) {
  const session = await requireSession(request, env);
  if (!canManageVehicles(session)) return problem("Only admin and sales can delete vehicle resources", 403);

  const records = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
    filter: equalsFilter("Vehicle ID", vehicleId),
    pageSize: 5,
  });
  const record = records[0];
  if (!record) return problem("Vehicle resource not found", 404);

  await deleteRecord(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), record.record_id);
  await writeAuditLog(env, session, {
    action: "DELETE",
    targetType: "Vehicle",
    targetId: vehicleId,
    targetSummary: vehicleSummary(record.fields),
    changedFields: Object.keys(record.fields),
    before: record.fields,
    result: "success",
  });
  return json({ ok: true });
}

async function handleCounterOffer(request: Request, env: Env, quoteNo: string) {
  const session = await requireSession(request, env);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const offeredPrice = asNumber(body?.offeredPrice);
  const message = asText(body?.message).trim();
  if (!offeredPrice && !message) return problem("Counteroffer price or message is required");

  const quoteRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), {
    filter: equalsFilter("Quote No", quoteNo),
    pageSize: 5,
  });
  const quoteRecord = quoteRecords[0];
  if (!quoteRecord) return problem("Quote not found", 404);
  const quote = mapQuote(quoteRecord);

  const inquiryRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
    filter: equalsFilter("Inquiry No", quote.inquiryNo),
    pageSize: 5,
  });
  const inquiryRecord = inquiryRecords[0];
  if (!inquiryRecord || (!isInternalSession(session) && asText(inquiryRecord.fields["Customer ID"]) !== session.customerId)) {
    return problem("Quote not found", 404);
  }

  const now = nowText();
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), {
    "Log No": nextId("LOG"),
    "Inquiry No": quote.inquiryNo,
    "Quote No": quote.quoteNo,
    Actor: isInternalSession(session) ? "autoYJ" : "Customer",
    Action: "Counteroffer",
    "Offered Price": offeredPrice,
    Quantity: quote.quantity,
    Message: message,
    "Created At": now,
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), quoteRecord.record_id, {
    Status: "Counteroffer Received",
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), inquiryRecord.record_id, {
    Status: "Negotiating",
    "Updated At": now,
  });
  return json({ ok: true });
}

async function handleAcceptQuote(request: Request, env: Env, quoteNo: string) {
  const session = await requireSession(request, env);
  const quoteRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), {
    filter: equalsFilter("Quote No", quoteNo),
    pageSize: 5,
  });
  const quoteRecord = quoteRecords[0];
  if (!quoteRecord) return problem("Quote not found", 404);
  const quote = mapQuote(quoteRecord);

  const inquiryRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
    filter: equalsFilter("Inquiry No", quote.inquiryNo),
    pageSize: 5,
  });
  const inquiryRecord = inquiryRecords[0];
  if (!inquiryRecord || (!isInternalSession(session) && asText(inquiryRecord.fields["Customer ID"]) !== session.customerId)) {
    return problem("Quote not found", 404);
  }

  const now = nowText();
  const orderNo = nextId("ORD");
  const total = quote.unitPrice * quote.quantity;
  const customerId = asText(inquiryRecord.fields["Customer ID"]) || session.customerId;
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), {
    "Log No": nextId("LOG"),
    "Inquiry No": quote.inquiryNo,
    "Quote No": quote.quoteNo,
    Actor: isInternalSession(session) ? "autoYJ" : "Customer",
    Action: "Quote Accepted",
    "Offered Price": quote.unitPrice,
    Quantity: quote.quantity,
    Message: isInternalSession(session) ? "autoYJ accepted quote in portal." : "Customer accepted quote in portal.",
    "Created At": now,
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), quoteRecord.record_id, {
    Status: "Accepted",
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), inquiryRecord.record_id, {
    Status: "Accepted",
    "Updated At": now,
  });
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_ORDERS"), {
    "Order No": orderNo,
    "Inquiry No": quote.inquiryNo,
    "Quote No": quote.quoteNo,
    "Customer ID": customerId,
    "Vehicle ID": quote.vehicleId,
    Quantity: quote.quantity,
    "Final Unit Price": quote.unitPrice,
    Total: total,
    Currency: quote.currency,
    "Payment Terms": quote.paymentTerms,
    Status: "Draft Order",
    "Created At": now,
  });

  return json({ orderNo }, { status: 201 });
}

function formatDate(isoStr: string): string {
  if (!isoStr) return "";
  const cleanStr = isoStr.split(" ")[0].split("T")[0];
  const parts = cleanStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return isoStr;
  const [year, month, day] = parts;
  const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  if (month < 1 || month > 12) return isoStr;
  return `${MONTH_NAMES[month - 1]} ${day}, ${year}`;
}

function computeBatchMargin(batchLevels: { units: number; display: string }[]) {
  if (!batchLevels || batchLevels.length === 0) return undefined;
  const first = batchLevels[0];
  if (!first || !first.units) return undefined;
  const cleaned = first.display.replace(/\s+/g, "").replace(/K/gi, "000");
  const match = cleaned.match(/\$?([0-9,]+)(?:-|~|to|–|—)\$?([0-9,]+)/i);
  if (match) {
    const lowVal = parseFloat(match[1].replace(/,/g, ""));
    const highVal = parseFloat(match[2].replace(/,/g, ""));
    if (!isNaN(lowVal) && !isNaN(highVal)) {
      const lowPerUnit = Math.round(lowVal / first.units);
      const highPerUnit = Math.round(highVal / first.units);
      const formatCurrency = (val: number) => {
        return "$" + val.toLocaleString("en-US");
      };
      return {
        low: formatCurrency(lowPerUnit),
        high: formatCurrency(highPerUnit)
      };
    }
  }
  return undefined;
}

function buildBatchLevels() {
  const perUnitLow = 4500;
  const perUnitHigh = 6500;
  return [10, 20, 50, 100].map((units) => ({
    units,
    display: `$${formatNumericValue((units * perUnitLow) / 1000, { precision: 0, thousands: false })}K - $${formatNumericValue((units * perUnitHigh) / 1000, { precision: 0, thousands: false })}K`,
  }));
}

function buildFeatureCards(fields: Record<string, unknown>, summary: { batteryType: string; range: string; charging: string }) {
  const vehicleClass = fieldText(fields, ["Vehicle Class"]);
  const warranty = formatBatteryWarranty(fields);
  const v2l = formatV2lSupport(fields);
  const batteryLabel = summary.batteryType || "Verified EV platform";
  const rangeLabel = summary.range || "Verified range data";
  const chargingLabel = summary.charging || "dealer-ready charging story";
  const exportFit = [warranty, v2l].filter(Boolean).join(" + ");

  return [
    {
      icon: "EV",
      title: "Battery confidence",
      desc: `${batteryLabel} gives dealers a clear safety and durability story without maintaining custom copy per model.`,
    },
    {
      icon: "KM",
      title: "Range and charging",
      desc: `${rangeLabel} with ${chargingLabel}. Use the structured specs for final quotation checks.`,
    },
    {
      icon: "$",
      title: "Dealer fit",
      desc: `${vehicleClass || "This model"} is positioned for repeatable export sales${exportFit ? ` with ${exportFit}` : ""}.`,
    },
  ];
}

function buildUseCases(fields: Record<string, unknown>) {
  const vehicleClass = fieldText(fields, ["Vehicle Class", "Segment"]).toLowerCase();
  if (/pickup|truck|van|cargo|commercial|utility/.test(vehicleClass)) {
    return [
      { icon: "UT", title: "Utility fleets", desc: "Built for work-site, farm, and mixed business use where operating cost matters.", accent: "Work ready" },
      { icon: "LG", title: "Logistics operators", desc: "Useful for dealers serving delivery, service, and last-mile customers.", accent: "Fleet fit" },
      { icon: "PW", title: "Power users", desc: "Strong match for buyers who value payload, clearance, or external power capability.", accent: "High utility" },
    ];
  }
  if (/suv|mpv|family/.test(vehicleClass)) {
    return [
      { icon: "FM", title: "Family upgrade", desc: "Suited to buyers moving from compact ICE models into safer, roomier EVs.", accent: "Family demand" },
      { icon: "PF", title: "Premium fleet", desc: "Fits executive transport, hotel, and airport-transfer sales conversations.", accent: "Fleet ready" },
      { icon: "RD", title: "Regional dealers", desc: "Strong showroom product when range, comfort, and equipment depth matter.", accent: "Showroom pull" },
    ];
  }
  return [
    { icon: "TX", title: "Network taxi", desc: "Good fit for high-mileage urban operators focused on low running cost.", accent: "High yield" },
    { icon: "UR", title: "Urban retail", desc: "Easy to position for first-time EV buyers and city commuters.", accent: "Retail ready" },
    { icon: "FC", title: "Family second car", desc: "Practical daily-use model for school, shopping, and short regional trips.", accent: "Smart commute" },
  ];
}

const PRODUCT_DETAIL_SPEC_FIELDS = [
  { fields: ["Vehicle Class"], label: "Vehicle Class", level: "Core" },
  { fields: [], label: "Guide Price", level: "Core" },
  { fields: [], label: "CLTC Range", level: "Core" },
  { fields: [], label: "Battery Capacity", level: "Core" },
  { fields: [], label: "Dimensions (LxWxH)", level: "Standard" },
  { fields: [], label: "Battery Chemistry", level: "Core" },
  { fields: [], label: "Wheelbase", level: "Standard" },
  { fields: [], label: "Motor Power", level: "Core" },
  { fields: ["Drive Type"], label: "Drive Type", level: "Core" },
  { fields: [], label: "0 - 100 km/h", level: "Core" },
  { fields: [], label: "Top Speed", level: "Core" },
  { fields: ["Charging"], label: "Charging", level: "Core" },
  { fields: ["DC Fast Charge"], label: "DC Fast Charge", level: "Core" },
  { fields: [], label: "AC Slow Charge", level: "Core" },
  { fields: [], label: "Seating", level: "Standard" },
  { fields: ["Household Charging"], label: "Household Charging", level: "Standard" },
  { fields: [], label: "Battery Warranty", level: "Standard" },
  { fields: ["Boot Volume (L)", "fld6DyIXUd", "Boot Volume"], label: "Boot Volume", level: "Standard" },
  { fields: [], label: "Seating Capacity", level: "Standard" },
  { fields: [], label: "Sunroof", level: "Standard" },
  { fields: ["Ground Clearance (mm)", "fldTZtzcZi", "Ground Clearance"], label: "Ground Clearance", level: "Standard" },
  { fields: [], label: "Airbags", level: "Standard" },
  { fields: [], label: "V2L Support", level: "Standard" },
] as const;

function specsFromModelFields(fields: Record<string, unknown>) {
  const specsLeft: { label: string; value: string }[] = [];
  const specsRight: { label: string; value: string }[] = [];

  for (const specField of PRODUCT_DETAIL_SPEC_FIELDS) {
    let value = fieldText(fields, [...specField.fields]);
    if (specField.label === "Boot Volume") value = formatBootVolume(fields);
    if (specField.label === "Ground Clearance") value = formatGroundClearance(fields);
    if (specField.label === "Household Charging") value = formatHouseholdCharging(fields);
    if (specField.label === "Sunroof") value = formatSunroofAvailability(fields);
    if (specField.label === "Airbags") value = formatAirbags(fields);
    if (specField.label === "V2L Support") value = formatV2lSupport(fields);
    if (!value) {
      if (specField.label === "Guide Price") value = formatUsdGuidePrice(fields);
      if (specField.label === "CLTC Range") value = formatNumberRange(fields, "CLTC Range Min KM", "CLTC Range Max KM", "km", { precision: 0 });
      if (specField.label === "Battery Capacity") value = formatNumberRange(fields, "Battery Capacity Min kWh", "Battery Capacity Max kWh", "kWh", { precision: 1, thousands: false });
      if (specField.label === "Battery Chemistry") value = formatBatteryChemistryMetric(fields);
      if (specField.label === "Dimensions (LxWxH)") value = formatDimensions(fields);
      if (specField.label === "Wheelbase") value = formatNumberRange(fields, "Wheelbase MM", "Wheelbase MM", "mm", { precision: 0 });
      if (specField.label === "Motor Power") value = formatNumberRange(fields, "Motor Power Min KW", "Motor Power Max KW", "kW", { precision: 0, thousands: false });
      if (specField.label === "0 - 100 km/h") value = formatAcceleration(fields);
      if (specField.label === "Top Speed") value = formatNumberRange(fields, "Top Speed Min KMH", "Top Speed Max KMH", "km/h", { precision: 0, thousands: false });
      if (specField.label === "AC Slow Charge") value = formatAcSlowCharge(fields);
      if (specField.label === "Seating" || specField.label === "Seating Capacity") value = formatNumberRange(fields, "Seats Min", "Seats Max", "seats", { precision: 0, thousands: false });
      if (specField.label === "Battery Warranty") value = formatBatteryWarranty(fields);
    }
    if (!value) continue;
    const spec = { label: specField.label, value };
    if (specField.level === "Core") {
      specsLeft.push(spec);
    } else {
      specsRight.push(spec);
    }
  }

  return { specsLeft, specsRight };
}

function valueForModelSpecField(fields: Record<string, unknown>, names: string[]) {
  for (const name of names) {
    const value = asText(fields[name]).trim();
    if (value) return value;
  }
  return "";
}

function stringListFromValue(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(asText).map((item) => item.trim()).filter(Boolean);
  const text = asText(value).trim();
  if (!text) return [];
  const parsed = safeJsonParse(text, null);
  if (Array.isArray(parsed)) return parsed.map(asText).map((item) => item.trim()).filter(Boolean);
  return text
    .split(/\r?\n|;/)
    .map((item) => item.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);
}

function featureGroupsFromValue(value: unknown): Array<{ category: string; items: string[] }> {
  if (!value) return [];
  const parsed = typeof value === "string" ? safeJsonParse(value, null) : value;
  if (Array.isArray(parsed)) {
    return parsed
      .map((group) => {
        const item = group as Record<string, unknown>;
        const category = asText(item.category || item.title || item.name).trim();
        const items = stringListFromValue(item.items || item.features || item.values);
        return category && items.length ? { category, items } : null;
      })
      .filter(Boolean) as Array<{ category: string; items: string[] }>;
  }
  return [];
}

function fallbackCommonFeaturesFromSpecs(
  specsLeft: Array<{ label: string; value: string }>,
  specsRight: Array<{ label: string; value: string }>,
  fields: Record<string, unknown>,
  summary: { battery: string; batteryType: string; charging: string },
) {
  const findSpec = (pattern: RegExp) => [...specsLeft, ...specsRight].find((spec) => pattern.test(spec.label))?.value;
  return [
    {
      category: "EV platform",
      items: [summary.batteryType, findSpec(/Drive Type/), findSpec(/Motor Power/), findSpec(/Top Speed/)].filter(Boolean),
    },
    {
      category: "Battery & charging",
      items: [summary.battery, summary.charging, findSpec(/Battery Warranty/), findSpec(/V2L Support/)].filter(Boolean),
    },
    {
      category: "Body basics",
      items: [findSpec(/Dimensions/), findSpec(/Wheelbase/), findSpec(/Seating/), findSpec(/Boot Volume/)].filter(Boolean),
    },
    {
      category: "Export fit",
      items: [fieldText(fields, ["Steering Setup"]), fieldText(fields, ["Household Charging"]), fieldText(fields, ["ADAS"])].filter(Boolean),
    },
  ].filter((group) => group.items.length > 0);
}

function fallbackTrimComparisonFromLegacy(
  fields: Record<string, unknown>,
  specsLeft: Array<{ label: string; value: string }>,
  specsRight: Array<{ label: string; value: string }>,
  summary: { battery: string; batteryType: string; charging: string },
) {
  const legacy = safeJsonParse(fields["Trim Data JSON"] || fields.trimData, []);
  if (!Array.isArray(legacy) || legacy.length === 0) {
    return {
      status: "TBC",
      trims: [],
      commonFeatures: fallbackCommonFeaturesFromSpecs(specsLeft, specsRight, fields, summary),
      sourceSummary: "Trim package data is pending source verification. Shared model-level specs are shown below; version-level additions remain TBC.",
    };
  }

  return {
    status: "TBC",
    trims: legacy.map((item, index) => {
      const trim = item as Record<string, unknown>;
      return {
        name: asText(trim.name) || `Trim ${index + 1}`,
        order: index + 1,
        priceDisplay: asText(trim.fob),
        rangeDisplay: asText(trim.range),
        keySpecs: [
          { label: "Range", value: asText(trim.range) },
          { label: "0-100 km/h", value: asText(trim.accel) },
          { label: "Airbags", value: asText(trim.airbags) },
          { label: "Seat", value: asText(trim.seat) },
        ].filter((spec) => spec.value),
        baseFeatures: [asText(trim.range), asText(trim.sunroof), asText(trim.seat)].filter(Boolean),
        addedFeatures: index === 0 ? [] : [asText(trim.sunroof), asText(trim.airbags), asText(trim.seat)].filter(Boolean),
        upgradedFeatures: [],
        sourceStatus: "TBC",
        recommended: Boolean(trim.rec),
      };
    }),
    commonFeatures: fallbackCommonFeaturesFromSpecs(specsLeft, specsRight, fields, summary),
    sourceSummary: "Legacy trim rows are displayed for structure only. Replace with verified trim configuration records before quoting.",
  };
}

function trimComparisonFromTrimRecords(
  trimRecords: FeishuRecord[],
  fields: Record<string, unknown>,
  specsLeft: Array<{ label: string; value: string }>,
  specsRight: Array<{ label: string; value: string }>,
  summary: { battery: string; batteryType: string; charging: string },
) {
  if (trimRecords.length === 0) return null;
  const trimPriceDisplay = (row: Record<string, unknown>) => {
    const price = fieldNumber(row, ["Trim Price Display", "fldbuQeJuG"]);
    if (price !== undefined) return `RMB ${formatNumericValue(price, { precision: 0 })}`;
    return fieldText(row, ["Legacy Trim Price Display", "Price Display"]);
  };
  const trimRangeDisplay = (row: Record<string, unknown>) => {
    const rangeKm = fieldNumber(row, ["Range Display", "fldh8ueiM7"]);
    if (rangeKm !== undefined) return `${formatNumericValue(rangeKm, { precision: 0, thousands: false })} km CLTC`;
    return fieldText(row, ["Legacy Range Display", "CLTC Range"]);
  };
  const trimBatteryDisplay = (row: Record<string, unknown>) => {
    const capacity = fieldNumber(row, ["Battery Capacity kWh", "fldmA8GNjc"]);
    const chemistry = fieldText(row, ["Battery Chemistry", "fldg4YG87Q"]);
    const capacityText = capacity === undefined ? "" : `${formatNumericValue(capacity, { precision: 3, thousands: false }).replace(/\.?0+$/, "")} kWh`;
    const chemistryText = chemistry ? `${chemistry} battery` : "";
    return [capacityText, chemistryText].filter(Boolean).join(" ") || fieldText(row, ["Legacy Battery Display", "Battery"]);
  };
  const trimMotorDisplay = (row: Record<string, unknown>) => {
    const power = fieldNumber(row, ["Motor Power kW", "fld4Mfbskb"]);
    const torque = fieldNumber(row, ["Motor Torque N-m", "fldtZk7tzH"]);
    const powerText = power === undefined ? "" : `${formatNumericValue(power, { precision: 0, thousands: false })} kW`;
    const torqueText = torque === undefined ? "" : `${formatNumericValue(torque, { precision: 0, thousands: false })} N-m`;
    return [powerText, torqueText].filter(Boolean).join(" / ") || fieldText(row, ["Legacy Motor Display", "Motor"]);
  };
  const trimChargingDisplay = (row: Record<string, unknown>) => {
    const supported = asBool(row["DC Fast Charge Supported"] ?? row.fldy1DpFF2);
    const timeHours = fieldNumber(row, ["DC Fast Charge Time Hours", "fldq2VIfTl"]);
    const minPercent = fieldNumber(row, ["DC Fast Charge Min Percent", "fldkLJ721S"]);
    const maxPercent = fieldNumber(row, ["DC Fast Charge Max Percent", "fldQhck4Cx"]);
    if (!supported && timeHours === undefined && minPercent === undefined && maxPercent === undefined) {
      return fieldText(row, ["Legacy Charging Display", "Charging"]);
    }
    const parts = ["DC fast charge: supported"];
    if (timeHours !== undefined) parts.push(`${formatNumericValue(timeHours, { precision: 2, thousands: false }).replace(/\.?0+$/, "")} h`);
    if (minPercent !== undefined && maxPercent !== undefined) {
      parts.push(`${formatNumericValue(minPercent, { precision: 0, thousands: false })}-${formatNumericValue(maxPercent, { precision: 0, thousands: false })}%`);
    } else if (maxPercent !== undefined) {
      parts.push(`${formatNumericValue(maxPercent, { precision: 0, thousands: false })}%`);
    }
    return parts.join(" / ");
  };
  const trims = trimRecords
    .map((record, index) => {
      const row = record.fields;
      const name = fieldText(row, ["Trim Name", "Version", "Trim"]);
      const priceDisplay = trimPriceDisplay(row);
      const rangeDisplay = trimRangeDisplay(row);
      const batteryDisplay = trimBatteryDisplay(row);
      const drivetrainDisplay = fieldText(row, ["Drivetrain Display", "Legacy Drivetrain Display", "Drive Type"]);
      const motorDisplay = trimMotorDisplay(row);
      const chargingDisplay = trimChargingDisplay(row);
      return {
        name: name || `Trim ${index + 1}`,
        order: fieldNumber(row, ["Trim Order"]) ?? index + 1,
        priceRmb: fieldNumber(row, ["Trim Price Display", "fldbuQeJuG"]),
        priceDisplay,
        rangeKm: fieldNumber(row, ["Range Display", "fldh8ueiM7"]),
        rangeDisplay,
        batteryCapacityKwh: fieldNumber(row, ["Battery Capacity kWh", "fldmA8GNjc"]),
        batteryChemistry: fieldText(row, ["Battery Chemistry", "fldg4YG87Q"]),
        batteryDisplay,
        drivetrain: fieldText(row, ["Drivetrain Display", "fldpJlVH81"]),
        drivetrainDisplay,
        motorPowerKw: fieldNumber(row, ["Motor Power kW", "fld4Mfbskb"]),
        motorTorqueNm: fieldNumber(row, ["Motor Torque N-m", "fldtZk7tzH"]),
        motorDisplay,
        dcFastChargeSupported: asBool(row["DC Fast Charge Supported"] ?? row.fldy1DpFF2),
        dcFastChargeTimeHours: fieldNumber(row, ["DC Fast Charge Time Hours", "fldq2VIfTl"]),
        dcFastChargeMinPercent: fieldNumber(row, ["DC Fast Charge Min Percent", "fldkLJ721S"]),
        dcFastChargeMaxPercent: fieldNumber(row, ["DC Fast Charge Max Percent", "fldQhck4Cx"]),
        chargingDisplay,
        keySpecs: [
          { label: "Price", value: priceDisplay },
          { label: "Range", value: rangeDisplay },
          { label: "Battery", value: batteryDisplay },
          { label: "Drive", value: drivetrainDisplay },
        ].filter((spec) => spec.value),
        baseFeatures: stringListFromValue(row["Base Spec Summary JSON"] || row["Base Features"]),
        addedFeatures: stringListFromValue(row["Added Features JSON"] || row["Added Features"]),
        upgradedFeatures: stringListFromValue(row["Upgraded Features JSON"] || row["Upgraded Features"]),
        sourceStatus: fieldText(row, ["Source Status"]) || "TBC",
        sourceUrl: cleanUrl(row["Source URL"]),
        recommended: asBool(row.Recommended),
      };
    })
    .sort((a, b) => a.order - b.order);

  return {
    status: fieldText(fields, ["Trim Section Status Pruned", "Trim Section Status"]) || (trims.every((trim) => trim.sourceStatus === "Verified") ? "Verified" : "Partial"),
    trims,
    commonFeatures: featureGroupsFromValue(fields["Common Features JSON Pruned"] || fields["Common Features JSON"]) || fallbackCommonFeaturesFromSpecs(specsLeft, specsRight, fields, summary),
    sourceSummary: fieldText(fields, ["Trim Source Summary Pruned", "Trim Source Summary"]) || "Trim configuration is sourced from vehicle trim records.",
    lastVerifiedAt: fieldText(fields, ["Trim Last Verified At"]),
  };
}

async function buildTrimComparison(
  env: Env,
  modelId: string,
  fields: Record<string, unknown>,
  specsLeft: Array<{ label: string; value: string }>,
  specsRight: Array<{ label: string; value: string }>,
  summary: { battery: string; batteryType: string; charging: string },
) {
  const trimTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS");
  if (trimTableId && modelId) {
    try {
      const records = await searchRecords(env, trimTableId, { pageSize: 100 });
      const matching = records.filter((record) => fieldText(record.fields, ["Model ID"]) === modelId);
      const fromRecords = trimComparisonFromTrimRecords(matching, fields, specsLeft, specsRight, summary);
      if (fromRecords) return fromRecords;
    } catch (error) {
      console.warn("Unable to load vehicle trim configurations", error);
    }
  }
  return fallbackTrimComparisonFromLegacy(fields, specsLeft, specsRight, summary);
}

async function handlePublicProduct(slug: string, env: Env) {
  const cacheKey = `product:${slug}`;
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const vehicleModelTableId = requireEnv(env, "FEISHU_TABLE_VEHICLE_MODELS");

  const models = await searchRecords(env, vehicleModelTableId, { pageSize: 100 });
  const modelRecord = latestProductModelRecords(models.filter(isActiveModel)).find((m) => productSlugFromFields(m.fields).endsWith(`/${slug}`));

  if (!modelRecord) {
    return problem(`Product ${slug} not found`, 404);
  }

  const modelId = asText(modelRecord.fields["Model ID"]);
  const fields = modelRecord.fields;
  const { specsLeft, specsRight } = specsFromModelFields(fields);

  const productPath = productPathFromFields(fields);
  const parts = productPath.split("/");
  let category = "revenue-king";
  const catIdx = parts.indexOf("products");
  if (catIdx !== -1 && catIdx + 1 < parts.length) {
    category = parts[catIdx + 1];
  }

  const brand = asText(fields["Brand"]);
  const modelName = asText(fields["Model"]);
  const msrpChina = formatUsdGuidePrice(fields);

  const battery = formatNumberRange(fields, "Battery Capacity Min kWh", "Battery Capacity Max kWh", "kWh", { precision: 1, thousands: false });
  const batteryType = formatBatteryChemistryMetric(fields);
  const range = formatNumberRange(fields, "CLTC Range Min KM", "CLTC Range Max KM", "km", { precision: 0 });
  const charging = valueForModelSpecField(fields, ["Charging", "DC Fast Charge", "AC Slow Charge Full Time Hours", "AC Slow Charge"]);
  const imageUrl = asText(fields["Image URL"]);
  const inventoryStatus = inventoryStatusFromFields(fields);

  const status = inventoryStatus.status;
  const statusText = inventoryStatus.statusText;

  const batchLevels = buildBatchLevels();
  const batchMargin = computeBatchMargin(batchLevels);
  const trimComparison = await buildTrimComparison(env, modelId, fields, specsLeft, specsRight, { battery, batteryType, charging });

  const data = {
    vehicle: {
      brand,
      name: modelName,
      fob: msrpChina,
      battery,
      batteryType,
      range,
      charging,
      img: imageUrl,
      status,
      statusText,
      inventoryStatus: inventoryStatus.inventoryStatus
    },
    category,
    title: fieldText(fields, ["Page Title", "title"]) || `${brand} ${modelName}`,
    subtitle: fieldText(fields, ["Page Subtitle", "subtitle", "Version"]),
    heroDesc: fieldText(fields, ["Hero Description", "heroDesc", "Review Notes"]),
    stat1Label: "km CLTC Range",
    stat1Value: formatHeroCltcRangeValue(fields),
    stat2Label: "USD Guide Price",
    stat2Value: formatUsdGuidePrice(fields),
    stat3Label: "Battery Chemistry",
    stat3Value: formatBatteryChemistryMetric(fields),
    whyTitle: "Why Dealers Add It",
    whyDesc: fieldText(fields, ["Why Section Description", "whyDesc"]),
    features: buildFeatureCards(fields, { batteryType, range, charging }),
    specsLeft,
    specsRight,
    fits: buildUseCases(fields),
    relatedModels: [],
    tags: buildCatalogTags(fields, category, status),
    galleryImages: safeJsonParse(fields["Gallery Images JSON"] || fields.galleryImages, []),
    batchLevels,
    batchMargin,
    trimComparison,
    trimData: safeJsonParse(fields["Trim Data JSON"] || fields.trimData, [])
  };

  setCached(cacheKey, data, env);
  return json(data);
}

async function handlePublicProducts(env: Env) {
  const cacheKey = "public-products";
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const vehicleModelTableId = requireEnv(env, "FEISHU_TABLE_VEHICLE_MODELS");
  const models = await searchRecords(env, vehicleModelTableId, { pageSize: 100 });

  const activeModels = latestProductModelRecords(models.filter(isActiveModel));

  const products = activeModels.map((m) => {
    const fields = m.fields;
    const brand = asText(fields["Brand"]);
    const modelName = asText(fields["Model"]);
    const msrpChina = formatUsdGuidePrice(fields);
    const guidePriceMinUsd = fieldNumber(fields, ["Guide Price Min USD"]);
    const guidePriceMaxUsd = fieldNumber(fields, ["Guide Price Max USD"]);

    const battery = formatNumberRange(fields, "Battery Capacity Min kWh", "Battery Capacity Max kWh", "kWh", { precision: 1, thousands: false });
    const batteryType = formatBatteryChemistryMetric(fields);
    const range = formatNumberRange(fields, "CLTC Range Min KM", "CLTC Range Max KM", "km", { precision: 0 });
    const charging = asText(fields.Charging);
    const imageUrl = asText(fields["Image URL"]);

    const productPath = productPathFromFields(fields);
    const parts = productPath.split("/");
    let category = "revenue-king";
    const catIdx = parts.indexOf("products");
    if (catIdx !== -1 && catIdx + 1 < parts.length) {
      category = parts[catIdx + 1];
    }

    const slug = productPath.split("/").filter(Boolean).pop() || "";

    const stat2Value = formatUsdGuidePrice(fields);
    const stat2Label = "USD Guide Price";

    const subtitle = fieldText(fields, ["Page Subtitle", "subtitle", "Version"]);
    const heroDesc = fieldText(fields, ["Hero Description", "heroDesc", "Review Notes"]);
    const whyDesc = fieldText(fields, ["Why Section Description", "whyDesc", "Review Notes"]);

    let badge = asText(fields.badge) || asText(fields.Badge) || null;

    if (!badge && subtitle) {
      if (subtitle.includes("Global #1") || slug === "byd-seagull") {
        badge = "Global #1";
      } else if (subtitle.includes("2025 New King") || slug === "gac-aion-rt") {
        badge = "2025 New King";
      } else if (subtitle.includes("Global Model") || subtitle.includes("Battle-Tested") || slug === "geely-galaxy-e5") {
        badge = "Global Model";
      } else if (subtitle.includes("Million-Unit") || slug === "byd-qin-plus") {
        badge = null;
      } else if (category === "revenue-king") {
        badge = subtitle;
      }
    }

    const inventoryStatus = inventoryStatusFromFields(fields);
    const status = inventoryStatus.status;
    const statusText = inventoryStatus.statusText;

    const showcaseTags = buildCatalogTags(fields, category, status);

    let cardImg = imageUrl;
    if (slug === "byd-seagull") {
      cardImg = "/pic/revenue-king/seagull/7cut.webp";
    } else if (slug === "gac-aion-rt") {
      cardImg = "/pic/revenue-king/RT/7cut.webp";
    } else if (slug === "byd-qin-plus") {
      cardImg = "/pic/revenue-king/qinplusev/5cut.webp";
    }

    let cardTag = subtitle || "";
    let cardDesc = heroDesc || "";
    let cardLabel = brand || "";

    if (slug === "zeekr-001") {
      cardTag = "800V Ultra-Fast Charge";
      cardDesc = "Extreme handling and range. The fastest charging executive shooting brake in the market.";
      cardLabel = "Tech Icon";
    } else if (slug === "xiaomi-su7-ultra") {
      cardTag = "1500+ Horsepower";
      cardDesc = "The ultimate social currency for tech-elite buyers. Carbon-fiber aero with peak acceleration.";
      cardLabel = "Performance Icon";
    } else if (slug === "aito-m9") {
      cardTag = "Performance King";
      cardDesc = "Huawei's ADS 3.0 tech masterpiece. Executive projection headlights and the most advanced chassis in the industry.";
      cardLabel = "Tech Pinnacle";
    } else if (slug === "byd-shark") {
      cardTag = "V2L Mobile Power";
      cardDesc = "PHEV Pickup with DMO off-road platform. 1000km+ total range for the hardest jobs.";
      cardLabel = "Hybrid Power";
    } else if (slug === "radar-rd6") {
      cardTag = "SUV Comfort Pickup";
      cardDesc = "Pure electric efficiency for urban logistics and farms. 6kW external discharge capacity.";
      cardLabel = "Production Power";
    } else if (slug === "farizon-super-van") {
      cardTag = "Digital Logistics";
      cardDesc = "The future of city cargo. Steer-by-wire with flat-floor cargo optimization for 11m³+ volume.";
      cardLabel = "Digital Cargo";
    } else if (category === "elite-flagship" || category === "utility-pro") {
      cardTag = subtitle || (range ? `${range} Range` : "");
      cardDesc = heroDesc || "";
      cardLabel = brand || "";
    }

    return {
      brand,
      name: modelName,
      fullName: `${brand} ${modelName}`,
      fob: msrpChina,
      battery,
      range,
      charging,
      img: cardImg,
      guidePriceMinUsd,
      guidePriceMaxUsd,
      category,
      slug,
      status,
      statusText,
      inventoryStatus: inventoryStatus.inventoryStatus,
      badge,
      stat2Label,
      stat2Value,
      tags: showcaseTags,
      tag: cardTag,
      desc: cardDesc,
      label: cardLabel,
      link: `/products/${category}/${slug}`
    };
  });

  setCached(cacheKey, products, env);
  return json(products);
}


async function handlePublicInsights(env: Env) {
  const cacheKey = "insights";
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const articlesTableId = requireEnv(env, "FEISHU_TABLE_ARTICLES");
  const records = await searchRecords(env, articlesTableId, { pageSize: 100 });

  const published = records.filter(r => asText(r.fields.status) === "Published");

  const articles = published.map((r, index) => {
    const fields = r.fields;
    const coverImageFullPath = asText(fields.cover_image);
    const coverImage = coverImageFullPath.split("/").pop() || "hero.webp";
    const publishDate = asText(fields.publish_date);

    return {
      title: asText(fields.title),
      category: asText(fields.category),
      date: formatDate(publishDate),
      sortDate: publishDate,
      readTime: asText(fields.read_time),
      slug: asText(fields.slug),
      coverImage,
      sortOrder: index + 1,
      overview: asText(fields.overview)
    };
  });

  setCached(cacheKey, articles, env);
  return json(articles);
}

async function handlePublicInsight(slug: string, env: Env) {
  const cacheKey = `insight:${slug}`;
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const articlesTableId = requireEnv(env, "FEISHU_TABLE_ARTICLES");
  const records = await searchRecords(env, articlesTableId, {
    filter: equalsFilter("slug", slug),
    pageSize: 5
  });

  const record = records[0];
  if (!record || asText(record.fields.status) !== "Published") {
    return problem(`Insight ${slug} not found`, 404);
  }

  const fields = record.fields;
  const coverImageFullPath = asText(fields.cover_image);
  const coverImage = coverImageFullPath.split("/").pop() || "hero.webp";
  const publishDate = asText(fields.publish_date);

  const data = {
    title: asText(fields.title),
    category: asText(fields.category),
    date: formatDate(publishDate),
    sortDate: publishDate,
    readTime: asText(fields.read_time),
    slug: asText(fields.slug),
    coverImage,
    overview: asText(fields.overview),
    content: asText(fields.content)
  };

  setCached(cacheKey, data, env);
  return json(data);
}

async function handlePublicAcademy(env: Env) {
  const cacheKey = "academy";
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const lessonsTableId = requireEnv(env, "FEISHU_TABLE_ACADEMY_LESSONS");
  const vaultTableId = requireEnv(env, "FEISHU_TABLE_ACADEMY_VAULT");

  const [lessonsRecords, vaultRecords] = await Promise.all([
    searchRecords(env, lessonsTableId, { pageSize: 100 }),
    searchRecords(env, vaultTableId, { pageSize: 100 })
  ]);

  const publishedLessons = lessonsRecords.filter(r => asText(r.fields.status) === "Published");

  const fundamentals: any[] = [];
  const playbook: any[] = [];
  const workshop: any[] = [];

  for (const r of publishedLessons) {
    const fields = r.fields;
    const cat = asText(fields.category).toLowerCase().trim();
    const lesson = {
      title: asText(fields.title),
      tag: asText(fields.tag),
      slug: asText(fields.slug),
      desc: asText(fields.description),
      img: asText(fields.cover_image)
    };

    if (cat === "fundamentals") {
      fundamentals.push(lesson);
    } else if (cat === "playbook") {
      playbook.push(lesson);
    } else if (cat === "workshop") {
      workshop.push(lesson);
    }
  }

  const vault = vaultRecords.map(r => {
    const fields = r.fields;
    return {
      title: asText(fields.title),
      type: asText(fields.type),
      desc: asText(fields.description),
      size: asText(fields.size) || "2.4 MB",
      downloadLink: asText(fields.download_link) || "/qr"
    };
  });

  const data = {
    lessons: {
      fundamentals,
      playbook,
      workshop
    },
    vault
  };

  setCached(cacheKey, data, env);
  return json(data);
}

async function handlePublicAcademyLesson(category: string, slug: string, env: Env) {
  const cacheKey = `academy:${category}:${slug}`;
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const lessonsTableId = requireEnv(env, "FEISHU_TABLE_ACADEMY_LESSONS");
  const records = await searchRecords(env, lessonsTableId, {
    filter: equalsFilter("slug", slug),
    pageSize: 5
  });

  const record = records.find(r => normalizeAcademyCategory(asText(r.fields.category)) === normalizeAcademyCategory(category));
  if (!record || asText(record.fields.status) !== "Published") {
    return problem(`Academy lesson ${slug} in category ${category} not found`, 404);
  }

  const fields = record.fields;
  const data = {
    title: asText(fields.title),
    category: asText(fields.category),
    tag: asText(fields.tag),
    desc: asText(fields.description),
    img: asText(fields.cover_image),
    content: asText(fields.content)
  };

  setCached(cacheKey, data, env);
  return json(data);
}

export async function handlePortalRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path.startsWith("/api/portal/public/")) {
      if (path === "/api/portal/public/insights" && request.method === "GET") {
        return await handlePublicInsights(env);
      }
      const insightMatch = path.match(/^\/api\/portal\/public\/insights\/([^/]+)$/);
      if (insightMatch && request.method === "GET") {
        return await handlePublicInsight(decodeURIComponent(insightMatch[1]), env);
      }
      if (path === "/api/portal/public/products" && request.method === "GET") {
        return await handlePublicProducts(env);
      }
      const productMatch = path.match(/^\/api\/portal\/public\/products\/([^/]+)$/);
      if (productMatch && request.method === "GET") {
        return await handlePublicProduct(decodeURIComponent(productMatch[1]), env);
      }
      if (path === "/api/portal/public/academy" && request.method === "GET") {
        return await handlePublicAcademy(env);
      }
      const academyLessonMatch = path.match(/^\/api\/portal\/public\/academy\/([^/]+)\/([^/]+)$/);
      if (academyLessonMatch && request.method === "GET") {
        return await handlePublicAcademyLesson(
          decodeURIComponent(academyLessonMatch[1]),
          decodeURIComponent(academyLessonMatch[2]),
          env,
        );
      }
    }
    if (path === "/api/portal/webhook/sync" && request.method === "POST") {
      cacheMap.clear();
      return json({ ok: true, cleared: true });
    }

    if (path === "/api/portal/dev-session" && request.method === "POST") {
      return await handleDevLogin(request, env);
    }
    if (path === "/api/portal/session" && request.method === "POST") {
      return await handleLogin(request, env);
    }
    if (path === "/api/portal/session" && request.method === "DELETE") {
      return json({ ok: true }, { headers: { "set-cookie": clearSessionCookie(env, request) } });
    }
    if (path === "/api/portal/bootstrap" && request.method === "GET") {
      return await handleBootstrap(request, env);
    }
    if (path === "/api/portal/inquiries" && request.method === "POST") {
      return await handleCreateInquiry(request, env);
    }

    if (path === "/api/portal/vehicles" && request.method === "POST") {
      return await handleCreateVehicle(request, env);
    }

    const vehicleMatch = path.match(/^\/api\/portal\/vehicles\/([^/]+)$/);
    if (vehicleMatch && request.method === "PATCH") {
      return await handleUpdateVehicle(request, env, decodeURIComponent(vehicleMatch[1]));
    }
    if (vehicleMatch && request.method === "DELETE") {
      return await handleDeleteVehicle(request, env, decodeURIComponent(vehicleMatch[1]));
    }

    const counterMatch = path.match(/^\/api\/portal\/quotes\/([^/]+)\/counter$/);
    if (counterMatch && request.method === "POST") {
      return await handleCounterOffer(request, env, decodeURIComponent(counterMatch[1]));
    }

    const acceptMatch = path.match(/^\/api\/portal\/quotes\/([^/]+)\/accept$/);
    if (acceptMatch && request.method === "POST") {
      return await handleAcceptQuote(request, env, decodeURIComponent(acceptMatch[1]));
    }

    return problem("Portal endpoint not found", 404);
  } catch (error) {
    if (error instanceof Response) return error;
    console.error(error);
    return problem(error instanceof Error ? error.message : "Portal request failed", 500);
  }
}
