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
  FEISHU_TABLE_VEHICLE_MODEL_SPECS?: string;
  FEISHU_TABLE_VEHICLES?: string;
  FEISHU_TABLE_INQUIRIES?: string;
  FEISHU_TABLE_QUOTES?: string;
  FEISHU_TABLE_NEGOTIATIONS?: string;
  FEISHU_TABLE_ORDERS?: string;
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
  brochureUrl: string;
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

const FEISHU_API = "https://open.feishu.cn";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const DEFAULT_COOKIE_NAME = "autoyj_portal";
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
  const recordIds = Array.isArray(data.record_id_list) ? data.record_id_list : [];
  return rows.map((row, rowIndex) => {
    const recordFields: Record<string, unknown> = {};
    fields.forEach((fieldName, fieldIndex) => {
      recordFields[fieldName] = row[fieldIndex];
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
    id: asText(fields["Model ID"]),
    brand: asText(fields.Brand),
    model: asText(fields.Model),
    trim: asText(fields.Version) || asText(fields.Trim),
    year: asText(fields.Year),
    bodyType: asText(fields.Segment) || asText(fields["Body Type"]),
    fuelType: asText(fields["Energy Type"]) || asText(fields["Fuel Type"]),
    msrpChina: asText(fields["China Guide Price CN..."]) || asText(fields["China Guide Price CNY"]) || asText(fields["MSRP China"]),
    battery: asText(fields["Battery Capacity"]) || asText(fields.Battery),
    batteryType: asText(fields["Battery Type"]),
    batteryMaker: asText(fields["Battery Maker"]),
    range: asText(fields["CLTC Range"]) || asText(fields.Range),
    energyConsumption: asText(fields["Energy Consumption"]),
    motorPower: asText(fields["Motor Power"]),
    motorTorque: asText(fields["Motor Torque"]),
    driveType: asText(fields["Drive Type"]),
    topSpeed: asText(fields["Top Speed"]),
    acceleration: asText(fields.Acceleration),
    seats: asText(fields.Seats),
    doors: asText(fields.Doors),
    dimensions: asText(fields.Dimensions),
    wheelbase: asText(fields.Wheelbase),
    curbWeight: asText(fields["Curb Weight"]),
    trunkCapacity: asText(fields["Trunk Capacity"]),
    charging: asText(fields.Charging),
    frontSuspension: asText(fields["Front Suspension"]),
    rearSuspension: asText(fields["Rear Suspension"]),
    adas: asText(fields.ADAS),
    warranty: asText(fields.Warranty),
    marketPosition: asText(fields["Market Position"]),
    exportNotes: asText(fields["Review Notes"]) || asText(fields["Export Notes"]),
    imageUrl: asText(fields["Image URL"]),
    brochureUrl: asText(fields["Brochure URL"]),
    sourceUrl: asText(fields["Source URL"]),
    sourceName: asText(fields["Source Name"]),
    lastSyncedAt: asText(fields["Last Synced At"]),
    fullSpecsJson: asText(fields["Full Specs JSON"]),
    status: asText(fields.Status) || "Active",
  };
}

function mapVehicleModelSpec(record: FeishuRecord): PortalVehicleModelSpec {
  const fields = record.fields;
  let name = asText(fields["Spec Name"]);
  
  // Normalize English spec names to Chinese for the portal dashboard compatibility
  const lowerName = name.toLowerCase().trim();
  if (lowerName === "vehicle class" || lowerName === "class" || lowerName === "body type") {
    name = "车身级别";
  } else if (lowerName === "energy type" || lowerName === "fuel type" || lowerName === "battery type") {
    name = "能源类型";
  } else if (lowerName === "cltc range" || lowerName === "range" || lowerName === "cltc range (cltc)" || lowerName === "cltc range (km)" || lowerName === "range (cltc)") {
    name = "CLTC续航";
  } else if (lowerName === "china guide price" || lowerName === "guide price" || lowerName === "msrp china" || lowerName === "china guide price cny" || lowerName === "china guide price cn...") {
    name = "中国官方指导价";
  } else if (lowerName === "market position" || lowerName === "buyer logic" || lowerName === "review notes") {
    name = "市场定位";
  } else if (lowerName === "system power" || lowerName === "motor" || lowerName === "motor power") {
    name = "电机总功率";
  }

  return {
    modelId: asText(fields["Model ID"]),
    category: asText(fields.Category),
    name: name,
    value: asText(fields["Spec Value"]),
    unit: asText(fields.Unit),
    visibleLevel: asText(fields["Visible Level"]),
    sortOrder: asNumber(fields["Sort Order"]),
    sourceName: asText(fields["Source Name"]),
    sourceUrl: asText(fields["Source URL"]),
    confidence: asText(fields.Confidence),
  };
}

function synthesizeSpecsFromModel(record: FeishuRecord): PortalVehicleModelSpec[] {
  const fields = record.fields;
  const modelId = asText(fields["Model ID"]);
  if (!modelId) return [];

  const specs: PortalVehicleModelSpec[] = [];

  const mappings = [
    // Core parameters (visibleLevel: Core)
    { col: "China Guide Price CNY", name: "中国官方指导价", cat: "基本参数", order: 0, lvl: "Core" },
    { col: "China Guide Price", name: "中国官方指导价", cat: "基本参数", order: 0, lvl: "Core" },
    { col: "MSRP China", name: "中国官方指导价", cat: "基本参数", order: 0, lvl: "Core" },
    { col: "China Guide Price CN...", name: "中国官方指导价", cat: "基本参数", order: 0, lvl: "Core" },

    { col: "Drive Type", name: "驱动方式", cat: "性能参数", order: 10, lvl: "Core" },
    { col: "Top Speed", name: "最高车速", cat: "性能参数", order: 11, lvl: "Core" },
    { col: "Motor Power", name: "电机总功率", cat: "性能参数", order: 12, lvl: "Core" },
    { col: "Battery Type", name: "电池类型", cat: "电池/充电", order: 13, lvl: "Core" },
    { col: "DC Fast Charge", name: "快充时间 30-80%", cat: "电池/充电", order: 14, lvl: "Core" },
    { col: "CLTC Range", name: "CLTC续航", cat: "电池/充电", order: 15, lvl: "Core" },
    { col: "Battery Capacity", name: "电池容量", cat: "电池/充电", order: 16, lvl: "Core" },

    // Standard parameters (visibleLevel: Standard)
    { col: "Dimensions (LxWxH)", name: "长宽高", cat: "车身参数", order: 30, lvl: "Standard" },
    { col: "Dimensions", name: "长宽高", cat: "车身参数", order: 30, lvl: "Standard" },
    { col: "Wheelbase", name: "轴距", cat: "车身参数", order: 31, lvl: "Standard" },
    { col: "Ground Clearance", name: "离地间隙", cat: "车身参数", order: 32, lvl: "Standard" },
    { col: "Boot Volume", name: "后备厢容积", cat: "车身参数", order: 33, lvl: "Standard" },
    { col: "Seating Capacity", name: "座位数", cat: "车身参数", order: 34, lvl: "Standard" },
    { col: "Seating", name: "座位数", cat: "车身参数", order: 34, lvl: "Standard" },
    { col: "V2L Support", name: "V2L外放电", cat: "其它参数", order: 35, lvl: "Standard" },
    { col: "AC Slow Charge", name: "慢充时间", cat: "电池/充电", order: 36, lvl: "Standard" },
    { col: "Household Charging", name: "家用充电", cat: "电池/充电", order: 37, lvl: "Standard" },
    { col: "Battery Warranty", name: "电池质保", cat: "其它参数", order: 38, lvl: "Standard" },
    { col: "Airbags", name: "安全气囊", cat: "安全配置", order: 39, lvl: "Standard" },
    { col: "Sunroof", name: "天窗", cat: "舒适配置", order: 40, lvl: "Standard" },
    { col: "Vehicle Class", name: "车身级别", cat: "基本参数", order: 41, lvl: "Standard" },
    { col: "Segment", name: "车身级别", cat: "基本参数", order: 41, lvl: "Standard" },
    { col: "0 - 100 km/h", name: "0-100km/h加速", cat: "性能参数", order: 42, lvl: "Standard" },
  ];

  const addedNames = new Set();

  for (const m of mappings) {
    if (addedNames.has(m.name)) continue;
    const val = asText(fields[m.col]);
    if (val) {
      specs.push({
        modelId,
        category: m.cat,
        name: m.name,
        value: val,
        unit: "",
        visibleLevel: m.lvl,
        sortOrder: m.order,
        sourceName: "autoYJ",
        sourceUrl: "",
        confidence: "High",
      });
      addedNames.add(m.name);
    }
  }

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
    bodyType: model.bodyType || valueFor(model.id, ["车身级别"]),
    fuelType: model.fuelType || valueFor(model.id, ["能源类型"]),
    battery: model.battery || valueFor(model.id, ["电池容量"]),
    batteryType: model.batteryType || valueFor(model.id, ["电池类型"]),
    batteryMaker: model.batteryMaker || valueFor(model.id, ["电池供应商"]),
    range: model.range || valueFor(model.id, ["CLTC续航"]),
    energyConsumption: model.energyConsumption || valueFor(model.id, ["百公里耗电量"]),
    motorPower: model.motorPower || valueFor(model.id, ["电机总功率", "电机总马力"]),
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
    marketPosition: model.marketPosition || valueFor(model.id, ["市场定位"]),
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
    editableFields: isInternal ? Object.keys(fields) : [],
    priceLabel: canSeePrice
      ? isInternal
        ? "Internal portal price"
        : session.priceTier === "vip"
          ? "VIP cooperation price"
          : "Cooperation price"
      : "Request quote",
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
      brochureUrl: "",
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
  const vehicleModelSpecTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_MODEL_SPECS");
  const [vehicleRecords, vehicleModelRecords, vehicleModelSpecRecords] = await Promise.all([
    searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
      pageSize: 100,
    }),
    vehicleModelTableId ? searchRecords(env, vehicleModelTableId, { pageSize: 100 }) : Promise.resolve([]),
    vehicleModelSpecTableId ? searchRecords(env, vehicleModelSpecTableId, { pageSize: 200 }).catch(e => {
      console.warn("Bootstrap: failed to search specs table, returning empty:", e.message);
      return [];
    }) : Promise.resolve([]),
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
  const vehicleModelSpecs = [
    ...vehicleModelSpecRecords.map(mapVehicleModelSpec),
    ...vehicleModelRecords.flatMap(synthesizeSpecsFromModel),
  ];
  const vehicleModels = vehicleModelRecords.length ? enrichVehicleModelsWithSpecs(vehicleModelRecords.map(mapVehicleModel), vehicleModelSpecs) : deriveVehicleModelsFromVehicles(vehicles);
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

async function handleUpdateVehicle(request: Request, env: Env, vehicleId: string) {
  const session = await requireSession(request, env);
  if (!isInternalSession(session)) return problem("Only internal users can update vehicle resources", 403);

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return problem("Request body is required");

  const records = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), {
    filter: equalsFilter("Vehicle ID", vehicleId),
    pageSize: 5,
  });
  const record = records[0];
  if (!record) return problem("Vehicle resource not found", 404);

  const updates: Record<string, unknown> = {};
  const setText = (fieldName: string, bodyKey: string) => {
    if (bodyKey in body && hasField(record, fieldName)) updates[fieldName] = asText(body[bodyKey]);
  };
  const setNumber = (fieldName: string, bodyKey: string) => {
    if (!(bodyKey in body) || !hasField(record, fieldName)) return;
    const number = asOptionalNumber(body[bodyKey]);
    updates[fieldName] = number ?? 0;
  };
  const setBool = (fieldName: string, bodyKey: string) => {
    if (bodyKey in body && hasField(record, fieldName)) updates[fieldName] = Boolean(body[bodyKey]);
  };

  setText("Model ID", "modelId");
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

  if (Object.keys(updates).length === 0) return problem("No editable fields were provided");
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_VEHICLES"), record.record_id, updates);
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
  const match = cleaned.match(/\$?([0-9,]+)[-–—]\$?([0-9,]+)/);
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

async function handlePublicProduct(slug: string, env: Env) {
  const cacheKey = `product:${slug}`;
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const vehicleModelTableId = requireEnv(env, "FEISHU_TABLE_VEHICLE_MODELS");
  const vehicleModelSpecTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_MODEL_SPECS");

  const models = await searchRecords(env, vehicleModelTableId, { pageSize: 100 });
  const modelRecord = models.find((m) => {
    const sourceUrl = cleanUrl(m.fields["Source URL"]).split('?')[0].split('#')[0].trim();
    return sourceUrl.endsWith(`/${slug}`) || sourceUrl.endsWith(`/${slug}/`);
  });

  if (!modelRecord) {
    return problem(`Product ${slug} not found`, 404);
  }

  const modelId = asText(modelRecord.fields["Model ID"]);
  let specs: any[] = [];
  if (vehicleModelSpecTableId) {
    try {
      specs = await searchRecords(env, vehicleModelSpecTableId, {
        filter: equalsFilter("Model ID", modelId),
        pageSize: 100,
      });
    } catch (e: any) {
      console.warn("handlePublicProduct: failed to query specs table, using fallback synthesis:", e.message);
    }
  }

  if (!specs || specs.length === 0) {
    specs = synthesizeSpecsFromModel(modelRecord);
  }

  const fields = modelRecord.fields;
  const specsLeft: { label: string; value: string }[] = [];
  const specsRight: { label: string; value: string }[] = [];

  const sortedSpecs = specs
    .map((s) => (s.fields ? mapVehicleModelSpec(s) : s))
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  for (const s of sortedSpecs) {
    const spec = { label: s.name, value: s.value };
    if (s.visibleLevel?.toLowerCase() === "core") {
      specsLeft.push(spec);
    } else if (s.visibleLevel?.toLowerCase() === "standard") {
      specsRight.push(spec);
    }
  }

  const sourceUrl = asText(fields["Source URL"]);
  const parts = sourceUrl.split("/");
  let category = "revenue-king";
  const catIdx = parts.indexOf("products");
  if (catIdx !== -1 && catIdx + 1 < parts.length) {
    category = parts[catIdx + 1];
  }

  const valueForSpec = (names: string[]) => {
    for (const name of names) {
      const found = sortedSpecs.find((s) => s.name === name);
      if (found?.value) return found.unit ? `${found.value} ${found.unit}`.trim() : found.value;
    }
    return "";
  };

  const brand = asText(fields["Brand"]);
  const modelName = asText(fields["Model"]);
  const msrpChina = asText(fields["China Guide Price CN..."]) || asText(fields["China Guide Price CNY"]) || asText(fields["MSRP China"]);

  const battery = asText(fields["Battery Capacity"]) || asText(fields.Battery) || valueForSpec(["Battery Capacity", "电池容量"]);
  const batteryType = asText(fields["Battery Type"]) || valueForSpec(["Battery Type", "电池类型"]);
  const range = asText(fields["CLTC Range"]) || asText(fields.Range) || valueForSpec(["Range (CLTC)", "Range", "CLTC Range", "CLTC续航"]);
  const charging = asText(fields.Charging) || valueForSpec(["DC Fast Charge", "AC Slow Charge", "Charging", "充电说明", "快充时间 30-80%", "快充峰值功率"]);
  const imageUrl = asText(fields["Image URL"]);

  let status = "in-stock";
  let statusText = "In Stock: Shenzhen";
  const vehiclesTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLES");
  if (vehiclesTableId) {
    const vehicles = await searchRecords(env, vehiclesTableId, {
      filter: equalsFilter("Model ID", modelId),
      pageSize: 10,
    });
    const activeVehicle = vehicles.find(v => asBool(v.fields["Is Listed"])) || vehicles[0];
    if (activeVehicle) {
      const vStatus = asText(activeVehicle.fields.Status).toLowerCase();
      const location = asText(activeVehicle.fields.Location);
      const leadTime = asText(activeVehicle.fields["Lead Time"]);
      if (vStatus.includes("in stock") || vStatus.includes("stock")) {
        status = "in-stock";
        statusText = `In Stock: ${location || "Shenzhen"}`;
      } else {
        status = "factory";
        statusText = leadTime ? `Factory Order: ${leadTime}` : "Factory Order: 21 Days";
      }
    }
  }

  const batchLevels = safeJsonParse(fields.batchLevels, []);
  const batchMargin = computeBatchMargin(batchLevels);

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
      statusText
    },
    category,
    title: asText(fields.title) || `${brand} ${modelName}`,
    subtitle: asText(fields.subtitle) || asText(fields.Version) || "",
    heroDesc: asText(fields.heroDesc) || asText(fields["Review Notes"]) || "",
    stat1Label: asText(fields.stat1Label),
    stat1Value: asText(fields.stat1Value),
    stat2Label: asText(fields.stat2Label),
    stat2Value: asText(fields.stat2Value),
    stat3Label: asText(fields.stat3Label),
    stat3Value: asText(fields.stat3Value),
    whyTitle: asText(fields.whyTitle),
    whyDesc: asText(fields.whyDesc),
    features: safeJsonParse(fields.features, []),
    specsLeft,
    specsRight,
    fits: safeJsonParse(fields.fits, []),
    relatedModels: safeJsonParse(fields.relatedModels, []),
    tags: safeJsonParse(fields.tags, []),
    galleryImages: safeJsonParse(fields.galleryImages, []),
    batchLevels,
    batchMargin,
    trimData: safeJsonParse(fields.trimData, [])
  };

  setCached(cacheKey, data, env);
  return json(data);
}

async function handlePublicTranslations(env: Env) {
  // 实时测试模式下不使用 Worker 内部缓存，每次直接向飞书拉取最新数据
  const tableId = requireEnv(env, "FEISHU_TABLE_I18N");
  const records = await searchRecords(env, tableId, { pageSize: 500 });
  
  const zhRecords: any[] = [];
  const enRecords: any[] = [];
  const amRecords: any[] = [];
  
  for (const item of records) {
    const key = asText(item.fields.Key);
    if (!key) continue;
    zhRecords.push({ key, value: asText(item.fields.ZH) });
    enRecords.push({ key, value: asText(item.fields.EN) });
    amRecords.push({ key, value: asText(item.fields.AM) });
  }

  const buildNested = (list: any[]) => {
    const root: any = {};
    for (const { key, value } of list) {
      const parts = key.split(".");
      let current = root;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (current[part] === undefined || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part];
      }
      const lastPart = parts[parts.length - 1];
      if (typeof value === "string" && value.trimStart().startsWith("[")) {
        try {
          current[lastPart] = JSON.parse(value);
        } catch {
          current[lastPart] = value;
        }
      } else {
        current[lastPart] = value;
      }
    }
    return root;
  };

  const data = {
    zh: buildNested(zhRecords),
    en: buildNested(enRecords),
    am: buildNested(amRecords)
  };

  return json(data);
}

async function handlePublicProducts(env: Env) {
  const cacheKey = "public-products";
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const vehicleModelTableId = requireEnv(env, "FEISHU_TABLE_VEHICLE_MODELS");
  const models = await searchRecords(env, vehicleModelTableId, { pageSize: 100 });

  const activeModels = models.filter((m) => asText(m.fields.Status) !== "Inactive");

  const products = activeModels.map((m) => {
    const fields = m.fields;
    const brand = asText(fields["Brand"]);
    const modelName = asText(fields["Model"]);
    const msrpChina = asText(fields["China Guide Price CN..."]) || asText(fields["China Guide Price CNY"]) || asText(fields["MSRP China"]);

    const battery = asText(fields["Battery Capacity"]) || asText(fields.Battery);
    const batteryType = asText(fields["Battery Type"]);
    const range = asText(fields["CLTC Range"]) || asText(fields.Range);
    const charging = asText(fields.Charging);
    const imageUrl = asText(fields["Image URL"]);

    const sourceUrl = cleanUrl(fields["Source URL"]);
    const parts = sourceUrl.split("/");
    let category = "revenue-king";
    const catIdx = parts.indexOf("products");
    if (catIdx !== -1 && catIdx + 1 < parts.length) {
      category = parts[catIdx + 1];
    }

    const slug = sourceUrl.split("/").filter(Boolean).pop() || "";

    const stat2Value = asText(fields.stat2Value);
    const stat2Label = asText(fields.stat2Label);

    const subtitle = asText(fields.subtitle) || asText(fields.Version) || "";
    const heroDesc = asText(fields.heroDesc) || asText(fields["Review Notes"]) || "";
    const whyDesc = asText(fields.whyDesc) || asText(fields["Review Notes"]) || "";

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

    let showcaseTags = safeJsonParse(fields.tags || fields.Tags, []);
    if (category === "revenue-king") {
      const cleanRange = range ? `${range.replace(/\s+/g, "")} Range` : "";
      if (slug === "byd-seagull") {
        showcaseTags = ["LFP Blade", "405km Range"];
      } else if (slug === "gac-aion-rt") {
        showcaseTags = ["LiDAR ADAS", "520km Range"];
      } else if (slug === "byd-qin-plus") {
        showcaseTags = ["Million-Unit Proof", "510km Range"];
      } else if (slug === "geely-galaxy-e5") {
        showcaseTags = ["Aegis Battery", "530km Range"];
      } else {
        showcaseTags = [];
        if (batteryType) showcaseTags.push(batteryType);
        else if (battery) showcaseTags.push(battery);
        if (cleanRange) showcaseTags.push(cleanRange);
      }
    }

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
      category,
      slug,
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
      if (path === "/api/portal/public/translations" && request.method === "GET") {
        return await handlePublicTranslations(env);
      }
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

    const vehicleMatch = path.match(/^\/api\/portal\/vehicles\/([^/]+)$/);
    if (vehicleMatch && request.method === "PATCH") {
      return await handleUpdateVehicle(request, env, decodeURIComponent(vehicleMatch[1]));
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
