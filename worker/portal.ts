/// <reference types="@cloudflare/workers-types" />

import { buildProductFilterData } from "./productFilters";
import { createFeishuAuth } from "../lib/auth";
import { findLocalUser } from "../lib/users";

type Env = {
  FEISHU_API_URL?: string;
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  FEISHU_BASE_APP_TOKEN?: string;
  FEISHU_TABLE_INTERNAL_USERS?: string;
  FEISHU_TABLE_CUSTOMERS?: string;
  FEISHU_TABLE_VEHICLE_MODELS?: string;
  FEISHU_TABLE_INQUIRIES?: string;
  FEISHU_TABLE_QUOTES?: string;
  FEISHU_TABLE_NEGOTIATIONS?: string;
  FEISHU_TABLE_ORDERS?: string;
  PORTAL_SESSION_SECRET?: string;
  PORTAL_COOKIE_NAME?: string;
  FEISHU_TABLE_ARTICLES?: string;
  FEISHU_TABLE_ACADEMY_LESSONS?: string;
  FEISHU_TABLE_ACADEMY_VAULT?: string;
  FEISHU_TABLE_I18N?: string;
  FEISHU_TABLE_INSIGHTS?: string;
  FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS?: string;
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
const DEFAULT_COOKIE_NAME = "youguard_portal";
const TENANT_TOKEN_SAFETY_WINDOW_MS = 60 * 1000;

// Simple in-memory cache definition in worker context
const cacheMap = new Map<string, { value: any; expires: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(key: string): any | null {
  const item = cacheMap.get(key);
  if (item && item.expires > Date.now()) return item.value;
  return null;
}

function setCached(key: string, value: any, customTtlMs?: number) {
  const ttl = customTtlMs || CACHE_TTL_MS; // 10 minutes
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

function productPath(fields: Record<string, unknown>) {
  return cleanUrl(fields.product_path);
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

function formatUsd(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function formatUsdRange(min: number | null, max: number | null) {
  if (min !== null && max !== null) {
    return Math.round(min) === Math.round(max) ? formatUsd(min) : `${formatUsd(min)} - ${formatUsd(max)}`;
  }
  if (min !== null) return `From ${formatUsd(min)}`;
  if (max !== null) return `Up to ${formatUsd(max)}`;
  return "";
}

function formatNumber(value: number, precision = 0) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: precision,
    minimumFractionDigits: 0,
  });
}

function formatMetricRange(min: number | null, max: number | null, unit: string, precision = 0) {
  if (min !== null && max !== null) {
    return Math.round(min * 10 ** precision) === Math.round(max * 10 ** precision)
      ? `${formatNumber(min, precision)} ${unit}`
      : `${formatNumber(min, precision)} - ${formatNumber(max, precision)} ${unit}`;
  }
  if (min !== null) return `From ${formatNumber(min, precision)} ${unit}`;
  if (max !== null) return `Up to ${formatNumber(max, precision)} ${unit}`;
  return "";
}

function metricDisplay(
  fields: Record<string, unknown>,
  autoMinField: string,
  autoMaxField: string,
  unit: string,
  precision = 0,
) {
  return formatMetricRange(
    asOptionalNumber(fields[autoMinField]),
    asOptionalNumber(fields[autoMaxField]),
    unit,
    precision,
  );
}

function guidePriceDisplay(fields: Record<string, unknown>) {
  const displayPrice = formatUsdRange(
    asOptionalNumber(fields.display_price_low),
    asOptionalNumber(fields.display_price_high),
  );
  if (displayPrice) return displayPrice;
  return formatUsdRange(
    asOptionalNumber(fields.guide_price_min_usd_auto),
    asOptionalNumber(fields.guide_price_max_usd_auto),
  );
}

function cltcRangeDisplay(fields: Record<string, unknown>) {
  return metricDisplay(fields, "cltc_range_min_km_auto", "cltc_range_max_km_auto", "km");
}

function batteryCapacityDisplay(fields: Record<string, unknown>) {
  return metricDisplay(
    fields,
    "battery_capacity_min_kwh_auto",
    "battery_capacity_max_kwh_auto",
    "kWh",
    3,
  );
}

function motorPowerDisplay(fields: Record<string, unknown>) {
  return metricDisplay(fields, "motor_power_min_kw_auto", "motor_power_max_kw_auto", "kW");
}

function batteryChemistryDisplay(fields: Record<string, unknown>) {
  return asText(fields.battery_chemistry_auto);
}

function drivetrainDisplay(fields: Record<string, unknown>) {
  return asText(fields.drivetrain_display_auto);
}

function inventoryDisplay(fields: Record<string, unknown>) {
  const inventory = asText(fields.inventory_status);
  const normalized = inventory.toLowerCase();
  if (!inventory) {
    return { status: "tbc", statusText: "TBC" };
  }
  if (normalized.includes("in stock")) {
    return { status: "in-stock", statusText: inventory };
  }
  if (normalized.includes("production")) {
    return { status: "production", statusText: inventory };
  }
  if (normalized.includes("tbc") || normalized.includes("to be confirmed")) {
    return { status: "tbc", statusText: inventory };
  }
  return { status: "tbc", statusText: inventory };
}

function cleanEnglishFeatureText(value: unknown) {
  return asText(value)
    .replace(/BEV[\u4e00-\u9fff]+/g, "BEV")
    .replace(/\s+/g, " ")
    .trim();
}

function jsonList(value: unknown): string[] {
  const parsed = safeJsonParse(value, []);
  if (!Array.isArray(parsed)) return [];
  return parsed.map((item) => cleanEnglishFeatureText(item)).filter(Boolean);
}

function trimFeatureGroups(value: unknown) {
  const parsed = safeJsonParse(value, []);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map((group) => {
      if (!group || typeof group !== "object") return null;
      const fields = group as Record<string, unknown>;
      const items = Array.isArray(fields.items)
        ? fields.items.map((item) => cleanEnglishFeatureText(item)).filter(Boolean)
        : [];
      return {
        ...fields,
        category: cleanEnglishFeatureText(fields.category),
        items,
      };
    })
    .filter((group) => group && group.items.length > 0);
}

function trimBatteryDisplay(fields: Record<string, unknown>) {
  const capacity = asOptionalNumber(fields.battery_capacity_kwh);
  const chemistry = asText(fields.battery_chemistry);
  if (capacity !== null && chemistry) return `${formatNumber(capacity, 3)} kWh ${chemistry} battery`;
  if (capacity !== null) return `${formatNumber(capacity, 3)} kWh battery`;
  return chemistry ? `${chemistry} battery` : "";
}

function trimMotorDisplay(fields: Record<string, unknown>) {
  const power = asOptionalNumber(fields.motor_power_kw);
  const torque = asOptionalNumber(fields.motor_torque_n_m);
  if (power !== null && torque !== null) return `${formatNumber(power)} kW / ${formatNumber(torque)} N-m`;
  if (power !== null) return `${formatNumber(power)} kW`;
  if (torque !== null) return `${formatNumber(torque)} N-m`;
  return "";
}

function trimChargingDisplay(fields: Record<string, unknown>) {
  if (!asBool(fields.dc_fast_charge_supported)) return "";
  const time = asOptionalNumber(fields.dc_fast_charge_time_hours);
  const min = asOptionalNumber(fields.dc_fast_charge_min_percent);
  const max = asOptionalNumber(fields.dc_fast_charge_max_percent);
  const window = min !== null && max !== null ? `${formatNumber(min)}-${formatNumber(max)}%` : "DC fast charge";
  return time !== null ? `${window} in ${formatNumber(time, 2)} h` : window;
}

function buildTrimComparison(modelFields: Record<string, unknown>, trimRecords: FeishuRecord[]) {
  const trims = trimRecords
    .map((record) => {
      const fields = record.fields;
      const price = asOptionalNumber(fields.trim_price_display);
      const range = asOptionalNumber(fields.range_display);
      const batteryCapacity = asOptionalNumber(fields.battery_capacity_kwh);
      const motorPower = asOptionalNumber(fields.motor_power_kw);
      const motorTorque = asOptionalNumber(fields.motor_torque_n_m);
      return {
        trimConfigId: asText(fields.trim_config_id),
        name: asText(fields.variant),
        order: asOptionalNumber(fields.trim_order) ?? undefined,
        priceRmb: price ?? undefined,
        priceDisplay: price !== null ? formatUsd(price) : "",
        rangeKm: range ?? undefined,
        rangeDisplay: range !== null ? `${formatNumber(range)} km CLTC` : "",
        batteryCapacityKwh: batteryCapacity ?? undefined,
        batteryChemistry: asText(fields.battery_chemistry),
        batteryDisplay: trimBatteryDisplay(fields),
        drivetrainDisplay: asText(fields.drivetrain_display),
        motorPowerKw: motorPower ?? undefined,
        motorTorqueNm: motorTorque ?? undefined,
        motorDisplay: trimMotorDisplay(fields),
        dcFastChargeSupported: asBool(fields.dc_fast_charge_supported),
        dcFastChargeTimeHours: asOptionalNumber(fields.dc_fast_charge_time_hours) ?? undefined,
        dcFastChargeMinPercent: asOptionalNumber(fields.dc_fast_charge_min_percent) ?? undefined,
        dcFastChargeMaxPercent: asOptionalNumber(fields.dc_fast_charge_max_percent) ?? undefined,
        chargingDisplay: trimChargingDisplay(fields),
        baseFeatures: jsonList(fields.base_spec_summary_json),
        addedFeatures: jsonList(fields.added_features_json),
        upgradedFeatures: jsonList(fields.upgraded_features_json),
        recommended: asBool(fields.recommended),
        sourceStatus: asText(fields.source_status),
        sourceUrl: cleanUrl(fields.source_url),
      };
    })
    .filter((trim) => trim.name)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!trims.length && !asText(modelFields.common_features_json_pruned)) return null;

  return {
    status: asText(modelFields.trim_section_status_pruned),
    trims,
    commonFeatures: trimFeatureGroups(modelFields.common_features_json_pruned),
    sourceSummary: asText(modelFields.trim_source_summary_pruned),
    lastVerifiedAt: asText(modelFields.trim_last_verified_at),
  };
}

function detailFeatures(fields: Record<string, unknown>, range: string, battery: string, batteryType: string, statusText: string) {
  const existing = safeJsonParse(fields.features, []);
  if (Array.isArray(existing) && existing.length) return existing;

  const powertrain = [range, battery, batteryType].filter(Boolean).join(" 闂?");
  return [
    {
      icon: "01",
      title: "Powertrain Snapshot",
      desc: powertrain,
    },
    {
      icon: "02",
      title: "Export Data Coverage",
      desc: guidePriceDisplay(fields) ? `Source-backed guide price ${guidePriceDisplay(fields)} with verified public specifications.` : "Source-backed model data with verified public specifications.",
    },
    {
      icon: "03",
      title: "Supply Status",
      desc: statusText || "Inventory status is tracked from the live vehicle model database.",
    },
  ].filter((item) => item.desc);
}

function asBool(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  const text = asText(value).toLowerCase();
  return ["true", "yes", "1", "\u662f", "\u5df2\u4e0a\u67b6"].includes(text);
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

const singleFlightMap = new Map<string, Promise<any>>();

function singleFlight<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = singleFlightMap.get(key);
  if (existing) return existing as Promise<T>;
  const promise = fn().finally(() => {
    singleFlightMap.delete(key);
  });
  singleFlightMap.set(key, promise);
  return promise;
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
    const isRateLimited =
      response.status === 429 ||
      data.code === 99991400 ||
      data.code === 1254002 ||
      data.code === 10001 ||
      /limited|rate|frequency/i.test(data.msg || "");
    if (attempt < 3 && isRateLimited) {
      await delay(600 * Math.pow(2, attempt));
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
  options: { filter?: Record<string, unknown>; sort?: unknown[]; pageSize?: number; maxPages?: number } = {},
) {
  const appToken = optionalEnv(env, "FEISHU_BASE_APP_TOKEN");
  if (!appToken) return [];
  const pageSize = Math.min(options.pageSize || 100, 500);
  const records: FeishuRecord[] = [];
  let pageToken = "";
  const maxPages = Math.min(options.maxPages || 1, 3);

  for (let page = 0; page < maxPages; page++) {
    const body: Record<string, unknown> = {
      page_size: pageSize,
    };
    if (pageToken) body.page_token = pageToken;
    if (options.filter) body.filter = options.filter;
    if (options.sort) body.sort = options.sort;

    const data = await feishuRequest<BaseRecordListResponse>(
      env,
      "POST",
      `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`,
      body,
    );
    const pageRecords = normalizeBaseRecords(data);
    records.push(...pageRecords);
    if (!data.has_more) break;
    pageToken = data.page_token || "";
    if (!pageToken) break;
  }
  return records;
}

async function createRecord(env: Env, tableId: string, fields: Record<string, unknown>) {
  const appToken = requireEnv(env, "FEISHU_BASE_APP_TOKEN");
  const data = await feishuRequest<{ record?: FeishuRecord }>(
    env,
    "POST",
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    fields,
  );
  return data.record;
}

async function updateRecord(env: Env, tableId: string, recordId: string, fields: Record<string, unknown>) {
  const appToken = requireEnv(env, "FEISHU_BASE_APP_TOKEN");
  await feishuRequest(
    env,
    "PATCH",
    `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/${recordId}`,
    fields,
  );
}

function equalsFilter(fieldName: string, value: string) {
  if (!value || !value.trim()) return undefined;
  return {
    conjunction: "and",
    conditions: [
      {
        field_name: fieldName,
        operator: "is",
        value: [value.trim()],
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
    userId: asText(fields.user_id),
    name: asText(fields.name),
    email: asText(fields.email).toLowerCase(),
    role: normalizeRole(fields.role),
    status: asText(fields.status) || "Active",
    department: asText(fields.department),
    canEditVehicles: asBool(fields.can_edit_vehicles),
    canSeeCost: asBool(fields.can_see_cost),
    canSeeSupplier: asBool(fields.can_see_supplier),
    sourcingCommissionRate: asNumber(fields.sourcing_commission_rate),
    salesCommissionRate: asNumber(fields.sales_commission_rate),
  };
}

function mapCustomer(record: FeishuRecord): PortalCustomer {
  const fields = record.fields;
  return {
    recordId: record.record_id,
    customerId: asText(fields.account_id),
    company: asText(fields.company),
    contact: asText(fields.contact),
    email: asText(fields.email).toLowerCase(),
    role: normalizeRole(fields.role),
    priceTier: normalizePriceTier(fields.price_tier),
    status: asText(fields.status) || "Active",
    country: asText(fields.country),
    owner: asText(fields.owner),
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
    company: "Youguard",
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
  const dimensions = [fields.length_mm, fields.width_mm, fields.height_mm]
    .map(asOptionalNumber);
  const seats = formatMetricRange(
    asOptionalNumber(fields.seats_min),
    asOptionalNumber(fields.seats_max),
    "seats",
  );
  const topSpeed = formatMetricRange(
    asOptionalNumber(fields.top_speed_min_kmh),
    asOptionalNumber(fields.top_speed_max_kmh),
    "km/h",
  );
  const warrantyYears = asOptionalNumber(fields.battery_warranty_years);
  const warrantyDistance = asOptionalNumber(fields.battery_warranty_distance_km);
  return {
    id: asText(fields.model_id),
    brand: asText(fields.brand),
    model: asText(fields.model),
    trim: asText(fields.version),
    year: asText(fields.model_year),
    bodyType: asText(fields.vehicle_class) || asText(fields.segment),
    fuelType: asText(fields.powertrain_type),
    msrpChina: guidePriceDisplay(fields),
    battery: batteryCapacityDisplay(fields),
    batteryType: batteryChemistryDisplay(fields),
    batteryMaker: "",
    range: cltcRangeDisplay(fields),
    energyConsumption: "",
    motorPower: motorPowerDisplay(fields),
    motorTorque: "",
    driveType: drivetrainDisplay(fields),
    topSpeed,
    acceleration: asOptionalNumber(fields["0_100_km_h_sec"]) !== null ? `${formatNumber(asOptionalNumber(fields["0_100_km_h_sec"])!, 2)} sec` : "",
    seats,
    doors: "",
    dimensions: dimensions.every((value) => value !== null) ? `${dimensions.map((value) => formatNumber(value!)).join(" x ")} mm` : "",
    wheelbase: asOptionalNumber(fields.wheelbase_mm) !== null ? `${formatNumber(asOptionalNumber(fields.wheelbase_mm)!)} mm` : "",
    curbWeight: "",
    trunkCapacity: asOptionalNumber(fields.boot_volume_l) !== null ? `${formatNumber(asOptionalNumber(fields.boot_volume_l)!)} L` : "",
    charging: asText(fields.charging),
    frontSuspension: "",
    rearSuspension: "",
    adas: "",
    warranty: warrantyYears !== null || warrantyDistance !== null
      ? [warrantyYears !== null ? `${formatNumber(warrantyYears)} years` : "", warrantyDistance !== null ? `${formatNumber(warrantyDistance)} km` : ""].filter(Boolean).join(" / ")
      : "",
    marketPosition: asText(fields.page_subtitle),
    exportNotes: asText(fields.review_notes),
    imageUrl: asText(fields.image_url),
    brochureUrl: "",
    sourceUrl: productPath(fields),
    sourceName: "",
    lastSyncedAt: asText(fields.last_synced_at),
    fullSpecsJson: "",
    status: asText(fields.status) || "Active",
  };
}

function mapVehicleSource(record: FeishuRecord, canSeePrice: boolean): Record<string, unknown> {
  const fields = record.fields;
  const extColor = asText(fields.exterior_color);
  const intColor = asText(fields.interior_color);
  const colorStr = [extColor ? `Ext: ${extColor}` : "", intColor ? `Int: ${intColor}` : ""].filter(Boolean).join(" / ");
  const priceVal = asOptionalNumber(fields.cost_fob_usd) || asOptionalNumber(fields.display_price_low) || null;

  return {
    id: asText(fields.record_id) || record.record_id,
    modelId: asText(fields.model_id),
    brand: asText(fields.brand),
    model: asText(fields.model),
    trim: asText(fields.variant),
    year: asText(fields.manufacture_year),
    color: colorStr || "Standard",
    exteriorColor: extColor,
    interiorColor: intColor,
    supplierExteriorColor: "",
    supplierInteriorColor: "",
    colorCode: "",
    colorNotes: "",
    colorConfirmed: true,
    configuration: asText(fields.version_type) || asText(fields.steering_setup) || "",
    supplier: asText(fields.supplier),
    recorder: "",
    location: asText(fields.location) || "China",
    status: asText(fields.status_vehicle) || "现车",
    exportStatus: "Available",
    stockQuantity: asNumber(fields.stock_quantity) || 1,
    leadTime: asText(fields.lead_time) || (asText(fields.status_vehicle) === "现车" ? "Ready Stock" : "7-14 Days"),
    priceValidUntil: "",
    imageUrl: "",
    publicNotes: asText(fields.notes),
    canSeePrice,
    price: canSeePrice ? priceVal : null,
    partnerPrice: priceVal,
    customerPrice: priceVal,
    cost: asOptionalNumber(fields.cost_exw_usd) || asOptionalNumber(fields.supplier_price_cny),
    isListed: true,
    editableFields: [],
    priceLabel: priceVal !== null ? `$${priceVal.toLocaleString()}` : "Inquire for price",
  };
}


function synthesizeSpecsFromModel(record: FeishuRecord): PortalVehicleModelSpec[] {
  const fields = record.fields;
  const modelId = asText(fields.model_id);
  if (!modelId) return [];

  const specs: PortalVehicleModelSpec[] = [];
  const addedNames = new Set<string>();
  const addSpec = (name: string, value: string, visibleLevel: string, sortOrder: number, category: string) => {
    if (!value || addedNames.has(name)) return;
    specs.push({
      modelId,
      category,
      name,
      value,
      unit: "",
      visibleLevel,
      sortOrder,
      sourceName: "Youguard",
      sourceUrl: "",
      confidence: "High",
    });
    addedNames.add(name);
  };

  const dimensions = (() => {
    const length = asOptionalNumber(fields.length_mm);
    const width = asOptionalNumber(fields.width_mm);
    const height = asOptionalNumber(fields.height_mm);
    if (length !== null && width !== null && height !== null) {
      return `${formatNumber(length)} x ${formatNumber(width)} x ${formatNumber(height)} mm`;
    }
    return "";
  })();
  const seats = (() => {
    const min = asOptionalNumber(fields.seats_min);
    const max = asOptionalNumber(fields.seats_max);
    if (min !== null && max !== null) return Math.round(min) === Math.round(max) ? `${formatNumber(min)} seats` : `${formatNumber(min)} - ${formatNumber(max)} seats`;
    if (min !== null) return `${formatNumber(min)} seats`;
    if (max !== null) return `${formatNumber(max)} seats`;
    return "";
  })();
  const warranty = (() => {
    const years = asOptionalNumber(fields.battery_warranty_years);
    const km = asOptionalNumber(fields.battery_warranty_distance_km);
    if (years !== null && km !== null) return `${formatNumber(years)} years / ${formatNumber(km)} km`;
    if (years !== null) return `${formatNumber(years)} years`;
    if (km !== null) return `${formatNumber(km)} km`;
    return "";
  })();
  const acSlowCharge = (() => {
    const hours = asOptionalNumber(fields.ac_slow_charge_full_time_hours);
    if (hours !== null) return `${formatNumber(hours, 2)} h`;
    return asBool(fields.ac_slow_charge_supported) ? "Supported" : "";
  })();
  const v2l = (() => {
    const availability = asText(fields.v2l_availability);
    const power = asOptionalNumber(fields.v2l_output_power_kw);
    if (availability && power !== null) return `${availability}, ${formatNumber(power, 1)} kW`;
    return availability || (power !== null ? `${formatNumber(power, 1)} kW` : "");
  })();

  addSpec("Guide Price", guidePriceDisplay(fields), "Core", 0, "Basic");
  addSpec("Powertrain", asText(fields.powertrain_type), "Core", 5, "Basic");
  addSpec("Drivetrain", drivetrainDisplay(fields), "Core", 10, "Performance");
  addSpec("0-100 km/h", asOptionalNumber(fields["0_100_km_h_sec"]) !== null ? `${formatNumber(asOptionalNumber(fields["0_100_km_h_sec"])!, 2)} sec` : "", "Core", 11, "Performance");
  addSpec("Motor Power", motorPowerDisplay(fields), "Core", 12, "Performance");
  addSpec("Battery Chemistry", batteryChemistryDisplay(fields), "Core", 13, "Battery");
  addSpec("CLTC Range", cltcRangeDisplay(fields), "Core", 14, "Battery");
  addSpec("Battery Capacity", batteryCapacityDisplay(fields), "Core", 15, "Battery");
  addSpec("AC Slow Charge", acSlowCharge, "Core", 16, "Battery");
  addSpec("Household Charging", fields.household_charging === undefined ? "" : (asBool(fields.household_charging) ? "Supported" : "Not supported"), "Core", 17, "Battery");

  addSpec("Vehicle Class", asText(fields.vehicle_class) || asText(fields.segment), "Standard", 30, "Dimensions");
  addSpec("Dimensions", dimensions, "Standard", 31, "Dimensions");
  addSpec("Wheelbase", asOptionalNumber(fields.wheelbase_mm) !== null ? `${formatNumber(asOptionalNumber(fields.wheelbase_mm)!)} mm` : "", "Standard", 32, "Dimensions");
  addSpec("Ground Clearance", asOptionalNumber(fields.ground_clearance_mm) !== null ? `${formatNumber(asOptionalNumber(fields.ground_clearance_mm)!)} mm` : "", "Standard", 33, "Dimensions");
  addSpec("Boot Volume", asOptionalNumber(fields.boot_volume_l) !== null ? `${formatNumber(asOptionalNumber(fields.boot_volume_l)!)} L` : "", "Standard", 34, "Dimensions");
  addSpec("Seats", seats, "Standard", 35, "Dimensions");
  addSpec("Airbags", asOptionalNumber(fields.airbags) !== null ? `${formatNumber(asOptionalNumber(fields.airbags)!)} airbags` : "", "Standard", 36, "Safety");
  addSpec("Sunroof", asText(fields.sunroof_availability), "Standard", 37, "Comfort");
  addSpec("V2L", v2l, "Standard", 38, "Utility");
  addSpec("Voltage Platform", asOptionalNumber(fields.voltage_platform_v) !== null ? `${formatNumber(asOptionalNumber(fields.voltage_platform_v)!)} V` : "", "Standard", 39, "Battery");
  addSpec("Battery Warranty", warranty, "Standard", 40, "Warranty");
  addSpec("Steering", asText(fields.steering_setup), "Standard", 41, "Export");

  return specs;
}

function enrichVehicleModelsWithSpecs(models: PortalVehicleModel[], _specs: PortalVehicleModelSpec[]) {
  return models;
}

function mapInquiry(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    inquiryNo: asText(fields.inquiry_no),
    customerId: asText(fields.customer_id),
    vehicleId: asText(fields.vehicle_id),
    vehicleModel: asText(fields.vehicle_model),
    quantity: asNumber(fields.quantity),
    destinationPort: asText(fields.destination_port),
    tradeTerm: asText(fields.trade_term),
    targetPrice: asNumber(fields.target_price),
    notes: asText(fields.notes),
    status: asText(fields.status),
    createdAt: asText(fields.created_at),
    updatedAt: asText(fields.updated_at),
  };
}

function mapQuote(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    quoteNo: asText(fields.quote_no),
    inquiryNo: asText(fields.inquiry_no),
    version: asNumber(fields.version),
    vehicleId: asText(fields.vehicle_id),
    quantity: asNumber(fields.quantity),
    unitPrice: asNumber(fields.unit_price),
    currency: asText(fields.currency) || "USD",
    tradeTerm: asText(fields.trade_term),
    paymentTerms: asText(fields.payment_terms),
    validUntil: asText(fields.valid_until),
    status: asText(fields.status),
    changeReason: asText(fields.change_reason),
    createdAt: asText(fields.created_at),
  };
}

function mapNegotiation(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    logNo: asText(fields.log_no),
    inquiryNo: asText(fields.inquiry_no),
    quoteNo: asText(fields.quote_no),
    actor: asText(fields.actor),
    action: asText(fields.action),
    offeredPrice: asNumber(fields.offered_price),
    quantity: asNumber(fields.quantity),
    message: asText(fields.message),
    createdAt: asText(fields.created_at),
  };
}

function mapOrder(record: FeishuRecord) {
  const fields = record.fields;
  return {
    id: record.record_id,
    orderNo: asText(fields.order_no),
    inquiryNo: asText(fields.inquiry_no),
    quoteNo: asText(fields.quote_no),
    customerId: asText(fields.customer_id),
    vehicleId: asText(fields.vehicle_id),
    quantity: asNumber(fields.quantity),
    finalUnitPrice: asNumber(fields.final_unit_price),
    total: asNumber(fields.total),
    currency: asText(fields.currency) || "USD",
    paymentTerms: asText(fields.payment_terms),
    status: asText(fields.status),
    createdAt: asText(fields.created_at),
  };
}

function mapSourceImport(record: FeishuRecord): Record<string, unknown> {
  const fields = record.fields;
  const reviewStatus = asBool(fields["审核状态"]);
  return {
    id: record.record_id,
    sourceStage: reviewStatus ? "connected" : "unreviewed",
    supplier: asText(fields["供应商"]),
    reviewer: asText(fields["审核人"]),
    developer: asText(fields["开发者"]),
    brand: asText(fields["品牌"]),
    model: asText(fields["型号"]),
    modelId: asText(fields.model_id),
    variant: asText(fields["细分型号"]),
    variantId: asText(fields.variant_id),
    year: asText(fields["生产年份"]),
    month: asText(fields["生产月份"]),
    exteriorColor: asText(fields["外饰颜色"]),
    interiorColor: asText(fields["内饰颜色"]),
    stock: asNumber(fields["库存"]),
    minOrderQuantity: asNumber(fields["起订数量"]),
    fullOrderQuantity: asNumber(fields["满订数量"]),
    leadTime: asText(fields.lead_time),
    waitDays: asOptionalNumber(fields["下单后需要等待天数"]),
    steering: asText(fields["左右舵"]),
    marketVersion: asText(fields["国际国内版本（多选）"]),
    inventoryStatus: asText(fields["库存状态"]),
    costCny: asOptionalNumber(fields["人民币成本价"]),
    exwUsd: asOptionalNumber(fields["EXW美金价"]),
    fcaUsd: asOptionalNumber(fields["FCA美金价"]),
    fobUsd: asOptionalNumber(fields["FOB美金价"]),
    wholesaleLocation: asText(fields["批发地点"]),
    aiConfidence: asOptionalNumber(fields["AI置信度"]),
    notes: asText(fields["备注"]),
    displayPriceLow: asOptionalNumber(fields["网站显示最低价"] ?? fields["网站显示美金最低价"]),
    displayPriceHigh: asOptionalNumber(fields["网站显示最高价"] ?? fields["网站显示美金最高价"]),
    sourcePath: asText(fields["素材源文件路径"]),
  };
}

async function recordsByEmail(env: Env, tableId: string, email: string) {
  return searchRecords(env, tableId, { filter: equalsFilter("email", email.toLowerCase()), pageSize: 10 });
}

async function findLoginAccount(env: Env, email: string, accessCode: string): Promise<Omit<PortalSession, "exp"> | null> {
  const localMatch = findLocalUser(email, accessCode);
  if (localMatch) {
    return {
      userId: localMatch.userId,
      customerId: localMatch.customerId,
      name: localMatch.name,
      email: localMatch.email,
      company: localMatch.company,
      accountType: localMatch.accountType,
      role: localMatch.role,
      priceTier: localMatch.priceTier,
    };
  }

  const internalTableId = optionalEnv(env, "FEISHU_TABLE_INTERNAL_USERS");
  if (internalTableId) {
    const records = await recordsByEmail(env, internalTableId, email).catch(() => []);
    const match = records.find((record) => asText(record.fields.access_code).trim() === accessCode);
    if (match) {
      const user = mapInternalUser(match);
      if (user.status && user.status.toLowerCase() !== "active") throw problem("This internal account is not active", 403);
      return sessionFromInternalUser(user);
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

const devCredentials: Record<string, { email: string; accessCode: string }> = {
  admin: { email: "admin@local.test", accessCode: "admin-demo-2026" },
  sales: { email: "sales@local.test", accessCode: "sales-demo-2026" },
  partner: { email: "partner@example.com", accessCode: "partner-demo-2026" },
  customer: { email: "customer@example.com", accessCode: "customer-demo-2026" },
};

const devUsers: Record<string, Omit<PortalSession, "exp">> = {
  admin: {
    userId: "DEV-ADMIN",
    customerId: "DEV-ADMIN",
    name: "Local Admin",
    email: "admin@local.test",
    accountType: "internal",
    role: "admin",
    priceTier: "internal",
    company: "Youguard Admin",
  },
  sales: {
    userId: "DEV-SALES",
    customerId: "DEV-SALES",
    name: "Local Sales",
    email: "sales@local.test",
    accountType: "internal",
    role: "sales",
    priceTier: "internal",
    company: "Youguard Sales",
  },
  partner: {
    userId: "CUS-001",
    customerId: "CUS-001",
    name: "Local Partner",
    email: "partner@example.com",
    accountType: "external",
    role: "partner",
    priceTier: "partner",
    company: "Addis Fleet Trading",
  },
  customer: {
    userId: "CUS-002",
    customerId: "CUS-002",
    name: "Local Customer",
    email: "customer@example.com",
    accountType: "external",
    role: "customer",
    priceTier: "hidden",
    company: "Green Ride Addis",
  },
};

async function handleLogin(request: Request, env: Env) {
  const body = (await request.json().catch(() => null)) as { email?: string; accessCode?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const accessCode = String(body?.accessCode || "").trim();
  if (!email || !accessCode) return problem("Email and access code are required");

  let account = await findLoginAccount(env, email, accessCode).catch(() => null);
  if (!account) {
    const match = Object.entries(devCredentials).find(([, c]) => c.email === email && c.accessCode === accessCode);
    if (match) account = devUsers[match[0]];
  }
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
  const devUser = devUsers[role];
  if (!devUser) return problem("Unknown development role", 400);

  const session: PortalSession = {
    ...devUser,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await signSession(env, session);
  return json({ user: publicUser(session) }, { headers: { "set-cookie": sessionCookie(env, request, token) } });
}

async function handleBootstrap(request: Request, env: Env) {
  const session = await requireSession(request, env);
  const isInternal = isInternalSession(session);

  const cacheKey = `bootstrap_v2:${session.role}:${session.customerId || "internal"}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return json(cachedData);
  }

  const vehicleModelTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_MODELS") || "tblxVNjP9dnJ7b3o";
  const vehicleSourceTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLES") || optionalEnv(env, "FEISHU_TABLE_VEHICLE_SOURCES") || "tbl6wBgVcvrXN6mz";
  const internalUserTableId = optionalEnv(env, "FEISHU_TABLE_INTERNAL_USERS");
  const customerTableId = optionalEnv(env, "FEISHU_TABLE_CUSTOMERS");

  const payload = await singleFlight(cacheKey, async () => {
    const vehicleModelRecords = vehicleModelTableId ? await searchRecords(env, vehicleModelTableId, { pageSize: 100 }) : [];
    await delay(20);
    const vehicleSourceRecords = vehicleSourceTableId ? await searchRecords(env, vehicleSourceTableId, { pageSize: 100 }) : [];
    await delay(20);
    const inquiryRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
      filter: isInternal ? undefined : equalsFilter("customer_id", session.customerId),
      pageSize: 100,
    });
    await delay(20);
    const orderRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_ORDERS"), {
      filter: isInternal ? undefined : equalsFilter("customer_id", session.customerId),
      pageSize: 100,
    });
    await delay(20);
    const internalUserRecords = isInternal && internalUserTableId ? await searchRecords(env, internalUserTableId, { pageSize: 100 }) : [];
    await delay(20);
    const customerRecords: FeishuRecord[] = [];
    const allQuotes = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), { pageSize: 100 });
    await delay(20);
    const allNegotiations = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), { pageSize: 100 });

    const vehicles = vehicleSourceRecords.map((record) => mapVehicleSource(record, canSeePortalPrice(session)));
    const vehicleModelSpecs = vehicleModelRecords.flatMap(synthesizeSpecsFromModel);
    const vehicleModels = enrichVehicleModelsWithSpecs(vehicleModelRecords.map(mapVehicleModel), vehicleModelSpecs);
    const inquiries = inquiryRecords.map(mapInquiry);
    const inquiryNos = new Set(inquiries.map((inquiry) => inquiry.inquiryNo));

    const quotes = allQuotes.map(mapQuote).filter((quote) => isInternal || inquiryNos.has(quote.inquiryNo));
    const negotiations = allNegotiations.map(mapNegotiation).filter((log) => isInternal || inquiryNos.has(log.inquiryNo));

    const orders = orderRecords.map(mapOrder);
    const internalUsers = internalUserRecords.map(mapInternalUser);
    const customers = customerRecords.map(mapCustomer);

    const resPayload = {
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
    };
    setCached(cacheKey, resPayload);
    return resPayload;
  });

  return json(payload);
}

async function handleCreateInquiry(request: Request, env: Env) {
  await requireSession(request, env);
  return problem("Vehicle inventory is not connected", 503);
}

async function handleUpdateVehicle(request: Request, env: Env, _vehicleId: string) {
  await requireSession(request, env);
  return problem("Vehicle inventory is not connected", 503);
}

async function handleCounterOffer(request: Request, env: Env, quoteNo: string) {
  const session = await requireSession(request, env);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const offeredPrice = asNumber(body?.offeredPrice);
  const message = asText(body?.message).trim();
  if (!offeredPrice && !message) return problem("Counteroffer price or message is required");

  const quoteRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), {
    filter: equalsFilter("quote_no", quoteNo),
    pageSize: 5,
  });
  const quoteRecord = quoteRecords[0];
  if (!quoteRecord) return problem("Quote not found", 404);
  const quote = mapQuote(quoteRecord);

  const inquiryRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
    filter: equalsFilter("inquiry_no", quote.inquiryNo),
    pageSize: 5,
  });
  const inquiryRecord = inquiryRecords[0];
  if (!inquiryRecord || (!isInternalSession(session) && asText(inquiryRecord.fields.customer_id) !== session.customerId)) {
    return problem("Quote not found", 404);
  }

  const now = nowText();
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), {
    log_no: nextId("LOG"),
    inquiry_no: quote.inquiryNo,
    quote_no: quote.quoteNo,
    actor: isInternalSession(session) ? "Youguard" : "Customer",
    action: "Counteroffer",
    offered_price: offeredPrice,
    quantity: quote.quantity,
    message,
    created_at: now,
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), quoteRecord.record_id, {
    status: "Counteroffer Received",
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), inquiryRecord.record_id, {
    status: "Negotiating",
    updated_at: now,
  });
  return json({ ok: true });
}

async function handleAcceptQuote(request: Request, env: Env, quoteNo: string) {
  const session = await requireSession(request, env);
  const quoteRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), {
    filter: equalsFilter("quote_no", quoteNo),
    pageSize: 5,
  });
  const quoteRecord = quoteRecords[0];
  if (!quoteRecord) return problem("Quote not found", 404);
  const quote = mapQuote(quoteRecord);

  const inquiryRecords = await searchRecords(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), {
    filter: equalsFilter("inquiry_no", quote.inquiryNo),
    pageSize: 5,
  });
  const inquiryRecord = inquiryRecords[0];
  if (!inquiryRecord || (!isInternalSession(session) && asText(inquiryRecord.fields.customer_id) !== session.customerId)) {
    return problem("Quote not found", 404);
  }

  const now = nowText();
  const orderNo = nextId("ORD");
  const total = quote.unitPrice * quote.quantity;
  const customerId = asText(inquiryRecord.fields.customer_id) || session.customerId;
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_NEGOTIATIONS"), {
    log_no: nextId("LOG"),
    inquiry_no: quote.inquiryNo,
    quote_no: quote.quoteNo,
    actor: isInternalSession(session) ? "Youguard" : "Customer",
    action: "Quote Accepted",
    offered_price: quote.unitPrice,
    quantity: quote.quantity,
    message: isInternalSession(session) ? "Youguard accepted quote in portal." : "Customer accepted quote in portal.",
    created_at: now,
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_QUOTES"), quoteRecord.record_id, {
    status: "Accepted",
  });
  await updateRecord(env, requireEnv(env, "FEISHU_TABLE_INQUIRIES"), inquiryRecord.record_id, {
    status: "Accepted",
    updated_at: now,
  });
  await createRecord(env, requireEnv(env, "FEISHU_TABLE_ORDERS"), {
    order_no: orderNo,
    inquiry_no: quote.inquiryNo,
    quote_no: quote.quoteNo,
    customer_id: customerId,
    vehicle_id: quote.vehicleId,
    quantity: quote.quantity,
    final_unit_price: quote.unitPrice,
    total,
    currency: quote.currency,
    payment_terms: quote.paymentTerms,
    status: "Draft Order",
    created_at: now,
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
  const match = cleaned.match(/\$?([0-9,]+)(?:-|to)\$?([0-9,]+)/i);
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

  const models = await searchRecords(env, vehicleModelTableId, { pageSize: 100 });
  const modelRecord = models.find((m) => {
    const sourceUrl = productPath(m.fields).split('?')[0].split('#')[0].trim();
    return sourceUrl.endsWith(`/${slug}`) || sourceUrl.endsWith(`/${slug}/`);
  });

  if (!modelRecord) {
    return problem(`Product ${slug} not found`, 404);
  }

  const modelId = asText(modelRecord.fields.model_id);
  const specs = synthesizeSpecsFromModel(modelRecord);

  const fields = modelRecord.fields;
  let trimRecords: FeishuRecord[] = [];
  const trimTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS");
  if (trimTableId && modelId) {
    try {
      const allTrimRecords = await searchRecords(env, trimTableId, { pageSize: 200 });
      trimRecords = allTrimRecords.filter((record) => asText(record.fields.model_id) === modelId);
    } catch (e: any) {
      console.warn("handlePublicProduct: failed to query trim table:", e.message);
    }
  }
  const trimComparison = buildTrimComparison(fields, trimRecords);
  const specsLeft: { label: string; value: string }[] = [];
  const specsRight: { label: string; value: string }[] = [];

  const sortedSpecs = specs
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  for (const s of sortedSpecs) {
    const spec = { label: s.name, value: s.value };
    if (s.visibleLevel?.toLowerCase() === "core") {
      specsLeft.push(spec);
    } else if (s.visibleLevel?.toLowerCase() === "standard") {
      specsRight.push(spec);
    }
  }

  const sourceUrl = productPath(fields);
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

  const brand = asText(fields.brand);
  const modelName = asText(fields.model);
  const msrpChina = guidePriceDisplay(fields);

  const battery = batteryCapacityDisplay(fields) || valueForSpec(["Battery Capacity"]);
  const batteryType = batteryChemistryDisplay(fields) || valueForSpec(["Battery Type"]);
  const range = cltcRangeDisplay(fields) || valueForSpec(["Range (CLTC)", "Range", "CLTC Range"]);
  const whyDescription = asText(fields.why_section_description) || asText(fields.review_notes);
  const chargingText = asText(fields.charging) || valueForSpec(["AC Slow Charge", "Charging"]);
  const charging = chargingText && chargingText !== whyDescription ? chargingText : "";
  const imageUrl = asText(fields.image_url);

  const { status, statusText } = inventoryDisplay(fields);

  const batchLevels: { units: number; display: string }[] = [];
  const batchMargin = computeBatchMargin(batchLevels);

  const data = {
    modelId,
    slug,
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
    title: asText(fields.page_title) || `${brand} ${modelName}`,
    subtitle: asText(fields.page_subtitle),
    heroDesc: asText(fields.hero_description) || asText(fields.review_notes),
    stat1Label: "Range",
    stat1Value: range,
    stat2Label: "Price",
    stat2Value: msrpChina,
    stat3Label: "Battery",
    stat3Value: batteryType || battery,
    whyTitle: "Why this model",
    whyDesc: whyDescription,
    features: detailFeatures(fields, range, battery, batteryType, statusText),
    specsLeft,
    specsRight,
    fits: [],
    relatedModels: [],
    tags: [],
    galleryImages: safeJsonParse(fields.gallery_images_json, []),
    batchLevels,
    batchMargin,
    trimComparison,
    trimData: [],
    trimNote: asText(fields.trim_source_summary_pruned)
  };

  setCached(cacheKey, data, env);
  return json(data);
}

// 闂傚倸鍊风粈浣革耿闁秮鈧箓宕奸妷瀣喘楠炲酣鎸婃竟鈹垮劦閺屾盯骞囬棃娑欑亪闁荤喐鐟辨俊鍥焵椤掆偓缁犲秹宕曟潏鈹惧亾濮樼厧娅嶉柟顖氱焸婵″爼宕担鐟扮槣闂佽鍑界紞鍡涘礈濞嗘劗顩烽柟鐑橆殕閻?Base 闂傚倷娴囧畷鐢稿窗閹扮増鍋￠弶鍫氭櫅缁躲倕螖閿濆懎鏆為柛?table_id闂傚倸鍊烽悞锔锯偓绗涘懐鐭欓柟杈鹃檮閸ゆ劖銇勯弽顐沪闁稿鍔嶉妵鍕箛閸撲胶鏆犵紓浣插亾闁告劦鍠楅悡鏇熺箾閹存繂鑸规鐐达耿閺岀喖鎮剧仦鍙儳绱掓潏銊﹀磳鐎规洘甯掗埥澶娾枎韫囨洦鏆￠梻?
const tableIdCache = new Map<string, { tableId: string; expiresAt: number }>();
async function resolveTableIdByName(env: Env, tableName: string): Promise<string> {
  const appToken = optionalEnv(env, "FEISHU_BASE_APP_TOKEN");
  if (!appToken) throw new Error("FEISHU_BASE_APP_TOKEN is required to resolve table names");

  // 婵犵數濮烽。钘壩ｉ崨鏉戠；闁逞屽墴閺屾稓鈧綆鍋呭畷宀勬煛瀹€瀣？濞寸媴濡囬幏鐘诲箵閹烘嚩鎴犵磽閸屾瑧鍔嶉柛鐐电帛娣囧﹪宕堕鈧悞鍨亜閹哄秷鍏岄柍顖涙礋閺屻劑寮撮妸銉ょ敖濠?0 闂傚倸鍊风粈渚€骞夐敍鍕殰闁圭儤鍤﹀☉妯锋斀閻庯綆浜為鍥⒑鐟欏嫬绀冩い鏇嗗應鍋撳顒夋Ц妞ゎ叀娉曢幑鍕瑹椤栨艾澹夋繝鐢靛仜閹冲海鎹㈠鈧?
  const cached = tableIdCache.get(tableName);
  if (cached && cached.expiresAt > Date.now()) return cached.tableId;

  // 闂傚倸鍊风粈渚€骞夐敍鍕殰婵°倕鎳岄埀顒€鍟村畷銊╁级閹存繃鍎?Base 濠电姷鏁搁崑鐐哄垂閸洖绠伴柟闂寸贰閺佸嫰鏌涢埄鍏╂垵鈻嶉悩纰樺亾楠炲灝鍔氭い锔诲灣閳ь剚鑹鹃ˇ顖炩€︾捄銊﹀磯闁惧繗顫夊Σ鈧梻?
  const data = await feishuRequest<{ items: { table_id: string; name: string }[]; has_more: boolean }>(
    env,
    "GET",
    `/open-apis/bitable/v1/apps/${appToken}/tables`,
  );
  const found = data.items.find((t) => t.name === tableName);
  if (!found) throw new Error(`Feishu table "${tableName}" was not found in the configured Base`);

  tableIdCache.set(tableName, { tableId: found.table_id, expiresAt: Date.now() + 600_000 });
  return found.table_id;
}

async function handlePublicTranslations(env: Env) {
  // 闂傚倸鍊风粈浣革耿闁秮鈧箓宕奸妷瀣喘楠炲酣鎸婃竟鈹垮劦閺屾盯骞囬棃娑欑亪闁荤喐鐟辨俊鍥焵椤掆偓缁犲秹宕曢柆宥呯疇閹兼番鍊ら弶浠嬫⒒閸屾瑦绁版い鏇熺墵瀹曟鈽夊Ο蹇撶秺瀹曞爼顢斿鍡樼槥闂?table_id闂傚倸鍊烽悞锔锯偓绗涘懐鐭欓柟瀵稿仧闂勫嫰鏌￠崘銊モ偓鑽ょ不閺傛鐔嗛柤鎼佹涧婵洨绱掗埀顒勫礃椤忎礁浜炬鐐茬仢閸旀岸鎮楀鐓庢灓闁瑰嘲缍婇崺锟犲川椤旈棿鍖?FEISHU_TABLE_I18N 闂傚倸鍊烽懗鍓佸垝椤栨粌鍨濋柣妯款嚙閸ㄥ倸霉閸忚偐鏆橀柍褜鍓欓崐鎸庝繆閹间礁鐓涘ù锝堟閸橆剚绻濆▓鍨灍闁靛洦鐩畷鎴﹀箻缂佹鍘?
  const tableId = await resolveTableIdByName(env, "i18n_locale");
  const records = await searchRecords(env, tableId, { pageSize: 500, maxPages: 100 });
  
  const zhRecords: any[] = [];
  const enRecords: any[] = [];
  const amRecords: any[] = [];
  
  for (const item of records) {
    const key = asText(item.fields.key);
    if (!key) continue;
    zhRecords.push({ key, value: asText(item.fields.zh) });
    enRecords.push({ key, value: asText(item.fields.en) });
    amRecords.push({ key, value: asText(item.fields.am) });
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

  const activeModels = models.filter((m) => asText(m.fields.status) !== "Inactive");

  const products = activeModels.map((m) => {
    const fields = m.fields;
    const brand = asText(fields.brand);
    const modelName = asText(fields.model);
    const msrpChina = guidePriceDisplay(fields);

    const battery = batteryCapacityDisplay(fields);
    const batteryType = batteryChemistryDisplay(fields);
    const range = cltcRangeDisplay(fields);
    const charging = asText(fields.charging);
    const imageUrl = asText(fields.image_url);

    const sourceUrl = productPath(fields);
    const parts = sourceUrl.split("/");
    let category = "revenue-king";
    const catIdx = parts.indexOf("products");
    if (catIdx !== -1 && catIdx + 1 < parts.length) {
      category = parts[catIdx + 1];
    }

    const slug = sourceUrl.split("/").filter(Boolean).pop() || "";
    const { status, statusText } = inventoryDisplay(fields);

    const stat2Value = msrpChina;
    const stat2Label = "Price";

    const subtitle = asText(fields.page_subtitle);
    const heroDesc = asText(fields.hero_description) || asText(fields.review_notes);

    let badge: string | null = null;

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

    let showcaseTags: string[] = [];
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
      cardDesc = "The future of city cargo. Steer-by-wire with flat-floor cargo optimization for 11m婵? volume.";
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
      status,
      statusText,
      filterData: buildProductFilterData(fields),
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
  const records = await searchRecords(env, articlesTableId, { pageSize: 100 });

  const record = records.find(
    (r) => asText(r.fields.slug) === slug && asText(r.fields.status) === "Published",
  );
  if (!record) {
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

  const lessonsRecords = await searchRecords(env, lessonsTableId, { pageSize: 100 });
  await delay(20);
  const vaultRecords = await searchRecords(env, vaultTableId, { pageSize: 100 });

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
      translationId: r.record_id,
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
    pageSize: 100
  });

  const record = records.find(r =>
    asText(r.fields.slug) === slug
    && normalizeAcademyCategory(asText(r.fields.category)) === normalizeAcademyCategory(category)
    && asText(r.fields.status) === "Published"
  );
  if (!record) {
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

async function handlePublicTranslations(env: Env) {
  const cacheKey = "public_translations_v1";
  const cached = getCached(cacheKey);
  if (cached) return json(cached);

  const i18nTableId = optionalEnv(env, "FEISHU_TABLE_I18N");
  if (!i18nTableId) return json({ ok: true, translations: {} });

  const records = await searchRecords(env, i18nTableId, { pageSize: 500 }).catch(() => []);
  const translations: Record<string, { en?: string; zh?: string; am?: string }> = {};
  for (const record of records) {
    const key = asText(record.fields.key || record.fields.Key);
    if (key) {
      translations[key] = {
        en: asText(record.fields.en || record.fields.EN),
        zh: asText(record.fields.zh || record.fields.ZH),
        am: asText(record.fields.am || record.fields.AM),
      };
    }
  }
  const payload = { ok: true, translations };
  setCached(cacheKey, payload);
  return json(payload);
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
      if (path === "/api/portal/public/translations" && request.method === "GET") {
        return await handlePublicTranslations(env);
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

    if (path.startsWith("/api/auth/")) {
      if (path.includes("sign-up") || path.includes("signup") || path.includes("register")) {
        return problem("Public registration is disabled. Accounts are managed exclusively in Feishu Base.", 403);
      }
      const auth = createFeishuAuth(env as unknown as Record<string, string | undefined>);
      return await auth.handler(request);
    }

    if (path === "/api/portal/dev-session" && request.method === "POST") {
      return await handleDevLogin(request, env);
    }
    if (path === "/api/portal/session" && request.method === "GET") {
      const session = await readSession(request, env);
      if (!session) return json({ user: null });
      return json({ user: publicUser(session) });
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
    if (path === "/api/portal/source-imports" && request.method === "GET") {
      return await handleSourceImports(request, env);
    }
    const sourceImportMatch = path.match(/^\/api\/portal\/source-imports\/([^/]+)$/);
    if (sourceImportMatch && request.method === "PATCH") {
      return await handleUpdateSourceImport(request, env, decodeURIComponent(sourceImportMatch[1]));
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

async function handleSourceImports(request: Request, env: Env) {
  const session = await requireSession(request, env);
  if (!isInternalSession(session)) return problem("Source imports are only available to internal reviewers", 403);

  const tableId = requireEnv(env, "FEISHU_TABLE_SOURCE_IMPORTS");
  const viewId = optionalEnv(env, "FEISHU_VIEW_SOURCE_IMPORTS");
  const fields = await listFields(env, tableId);
  const records = await listRecords(env, tableId, {
    pageSize: 500,
    maxPages: 3,
    viewId: viewId || undefined,
  });

  return json({
    ok: true,
    tableId,
    viewId,
    readLimit: 1500,
    fields,
    records: records.map(mapSourceImport),
  });
}

function isEditableSourceImportField(field: BaseField) {
  if (field.reason || field.type === "not_support") return false;
  if (field.name === "流程" || field.name === "审核人") return false;
  if (field.name === "审核状态") return true;
  return ["Text", "Number", "SingleSelect", "MultiSelect", "DateTime", "text", "number", "select", "multi_select", "datetime"].includes(field.type);
}

function normalizeSourceImportValue(field: BaseField, value: unknown) {
  const type = field.type;
  if (value === null) return null;
  if (type === "Number" || type === "number") {
    if (value === "") return null;
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`${field.name} must be a number`);
    return number;
  }
  if (type === "DateTime" || type === "datetime") {
    const text = asText(value).trim();
    if (!text) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return `${text} 00:00:00`;
    return text;
  }
  if (type === "MultiSelect" || type === "multi_select") {
    if (!Array.isArray(value)) return asText(value) ? [asText(value)] : null;
    const values = value.map(asText).filter(Boolean);
    return values.length ? values : null;
  }
  if (type === "Checkbox" || type === "checkbox") {
    return Boolean(value);
  }
  return asText(value).trim() || null;
}

async function handleUpdateSourceImport(request: Request, env: Env, recordId: string) {
  const session = await requireSession(request, env);
  if (!isInternalSession(session)) return problem("Source imports are only available to internal reviewers", 403);

  const tableId = requireEnv(env, "FEISHU_TABLE_SOURCE_IMPORTS");
  const fields = await listFields(env, tableId);
  const fieldsByName = new Map(fields.map((field) => [field.name, field]));
  const body = (await request.json().catch(() => null)) as { fields?: Record<string, unknown> } | null;
  const input = body?.fields || {};
  const patch: Record<string, unknown> = {};
  const ignoredFields: { name: string; reason: string }[] = [];

  for (const [name, value] of Object.entries(input)) {
    const field = fieldsByName.get(name);
    if (!field) {
      ignoredFields.push({ name, reason: "field was not found in Feishu schema" });
      continue;
    }
    if (!isEditableSourceImportField(field)) {
      ignoredFields.push({ name, reason: "field is not editable in this unified editor" });
      continue;
    }
    patch[name] = normalizeSourceImportValue(field, value);
  }

  if (!Object.keys(patch).length) {
    const current = await getRecord(env, tableId, recordId);
    return json({
      ok: true,
      noop: true,
      ignoredFields,
      record: current ? mapSourceImport(current) : null,
    });
  }

  await updateRecord(env, tableId, recordId, patch);
  cacheMap.clear();

  const updated = await getRecord(env, tableId, recordId);
  return json({ ok: true, record: updated ? mapSourceImport(updated) : null });
}
