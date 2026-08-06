/// <reference types="@cloudflare/workers-types" />

import { buildProductFilterData } from "./productFilters";
import { createFeishuAuth } from "../../lib/auth";
import { findLocalUser } from "../../lib/users";
import {
  upsertVehicleModels,
  upsertVehicleTrims,
  upsertVehicles,
  queryVehicleModels,
  queryVehicleTrims,
  queryVehicles,
} from "../db/d1";

export type Env = {
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
  FEISHU_TABLE_INQUIRY_NOTES?: string;
  FEISHU_TABLE_INQUIRY_PARTICIPANTS?: string;
  FEISHU_TABLE_INQUIRY_STATUS_HISTORY?: string;
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
  /** Cloudflare D1 database binding — read by API handlers, written by Cron Job */
  PORTAL_DB?: D1Database;
};

export type PortalRole = "admin" | "sales" | "sourcing" | "finance" | "partner" | "customer";
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

export type PortalSession = {
  userId: string;
  customerId?: string;
  name?: string;
  email: string;
  accountType: AccountType;
  role: PortalRole;
  priceTier?: PriceTier;
  company?: string;
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
  if (value) return String(value);
  if (key === "FEISHU_BASE_APP_TOKEN") return "Is6Xb3btbazhFhsDXgFcqFG1nRc";
  return "";
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
  let target = value;
  if (typeof target === "object" && target !== null) {
    if (Array.isArray(target)) {
      target = target[0];
    }
    if (typeof target === "object" && target !== null && "text" in target) {
      target = (target as { text: unknown }).text;
    }
  }
  if (typeof target === "number") {
    return Number.isFinite(target) ? target : null;
  }
  if (typeof target === "string") {
    const cleaned = target.replace(/,/g, "").replace(/[^0-9.]/g, "");
    if (!cleaned) return null;
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }
  const number = Number(target);
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
  // 鎵€鏈夋垚鍔熺櫥褰曠殑鐢ㄦ埛锛堝唴閮?鍚堜綔浼欎即/瀹㈡埛锛夊潎鍙湅鍒拌溅婧愮編閲戞姤浠?
  return Boolean(session && session.userId);
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

function getPortalSessionSecret(env: Env): string {
  const secret = env.PORTAL_SESSION_SECRET || "";
  if (secret && secret.length >= 32) return secret;
  return "autoyj-portal-session-secret-fallback-key-32chars";
}

async function signSession(env: Env, session: PortalSession) {
  const secret = getPortalSessionSecret(env);
  const payload = encodeBase64Url(JSON.stringify(session));
  const signature = await hmac(secret, payload);
  return `${payload}.${signature}`;
}

async function readSession(request: Request, env: Env): Promise<PortalSession | null> {
  const token = getCookie(request, cookieName(env));
  if (!token || !token.includes(".")) return null;
  const [payload, signature] = token.split(".");
  const expected = await hmac(getPortalSessionSecret(env), payload);
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
      signal: AbortSignal.timeout(8000),
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
    signal: AbortSignal.timeout(15000),
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

export async function searchRecords(
  env: Env,
  tableId: string,
  options: { filter?: Record<string, unknown>; sort?: unknown[]; pageSize?: number; maxPages?: number; viewId?: string } = {},
) {
  const appToken = optionalEnv(env, "FEISHU_BASE_APP_TOKEN");
  if (!appToken) return [];
  const pageSize = Math.min(options.pageSize || 100, 500);
  const records: FeishuRecord[] = [];
  let pageToken = "";
  const maxPages = options.maxPages || 50;

  for (let page = 0; page < maxPages; page++) {
    let data: BaseRecordListResponse;
    if (options.filter) {
      const body: Record<string, unknown> = {
        page_size: pageSize,
        filter: options.filter,
      };
      if (pageToken) body.page_token = pageToken;
      if (options.sort) body.sort = options.sort;
      if (options.viewId) body.view_id = options.viewId;

      data = await feishuRequest<BaseRecordListResponse>(
        env,
        "POST",
        `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records/search`,
        body,
      );
    } else {
      const query = new URLSearchParams({ page_size: String(pageSize) });
      if (pageToken) query.set("page_token", pageToken);
      if (options.viewId) query.set("view_id", options.viewId);

      data = await feishuRequest<BaseRecordListResponse>(
        env,
        "GET",
        `/open-apis/bitable/v1/apps/${appToken}/tables/${tableId}/records?${query.toString()}`,
      );
    }

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

function linkedRecordIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        return asText(record.id ?? record.record_id);
      }
      return asText(item);
    })
    .filter(Boolean);
}

function mapVehicleVariant(
  record: FeishuRecord,
  modelById: Map<string, PortalVehicleModel>,
  modelIdByRecordId: Map<string, string>,
): PortalVehicleModel | null {
  const fields = record.fields;
  const linkedModelId = linkedRecordIds(fields.vehicle_model_pruned)
    .map((recordId) => modelIdByRecordId.get(recordId))
    .find(Boolean);
  const modelId = asText(fields.model_id) || linkedModelId || "";
  const parent = modelById.get(modelId);
  if (!parent) return null;

  const trimId = asText(fields.trim_config_id) || asText(fields.record_id) || record.record_id;
  const price = asOptionalNumber(fields.trim_price_display);
  const range = asOptionalNumber(fields.range_display);
  const batteryCapacity = asOptionalNumber(fields.battery_capacity_kwh);
  const motorPower = asOptionalNumber(fields.motor_power_kw);
  const motorTorque = asOptionalNumber(fields.motor_torque_n_m);

  return {
    ...parent,
    id: trimId,
    trim: asText(fields.variant) || trimId,
    msrpChina: price !== null ? formatUsd(price) : parent.msrpChina,
    battery: batteryCapacity !== null ? `${formatNumber(batteryCapacity, 3)} kWh` : parent.battery,
    batteryType: asText(fields.battery_chemistry) || parent.batteryType,
    range: range !== null ? `${formatNumber(range)} km CLTC` : parent.range,
    motorPower: motorPower !== null ? `${formatNumber(motorPower)} kW` : parent.motorPower,
    motorTorque: motorTorque !== null ? `${formatNumber(motorTorque)} N-m` : parent.motorTorque,
    driveType: asText(fields.drivetrain_display) || parent.driveType,
    charging: trimChargingDisplay(fields) || parent.charging,
    sourceUrl: cleanUrl(fields.source_url) || parent.sourceUrl,
    sourceName: "Feishu Base \u00B7 vehicle_variants",
    lastSyncedAt: asText(fields.last_verified_at) || parent.lastSyncedAt,
    fullSpecsJson: JSON.stringify(fields),
  };
}

function synthesizeSpecsFromVariant(record: FeishuRecord, variant: PortalVehicleModel): PortalVehicleModelSpec[] {
  const fields = record.fields;
  const specs: PortalVehicleModelSpec[] = [];
  const addSpec = (name: string, value: string, sortOrder: number, category: string) => {
    if (!value) return;
    specs.push({
      modelId: variant.id,
      category,
      name,
      value,
      unit: "",
      visibleLevel: "Full",
      sortOrder,
      sourceName: "Feishu Base \u00B7 vehicle_variants",
      sourceUrl: cleanUrl(fields.source_url),
      confidence: "High",
    });
  };

  const price = asOptionalNumber(fields.trim_price_display);
  const range = asOptionalNumber(fields.range_display);
  const batteryCapacity = asOptionalNumber(fields.battery_capacity_kwh);
  const motorPower = asOptionalNumber(fields.motor_power_kw);
  const motorTorque = asOptionalNumber(fields.motor_torque_n_m);
  const recommended = fields.recommended === undefined ? "" : (asBool(fields.recommended) ? "Yes" : "No");

  addSpec("\u7248\u672c\u540d\u79f0", asText(fields.variant), 0, "\u7248\u672c");
  addSpec("\u4e2d\u56fd\u5b98\u65b9\u6307\u5bfc\u4ef7", price !== null ? formatUsd(price) : "", 1, "\u7248\u672c");
  addSpec("CLTC\u7eed\u822a", range !== null ? `${formatNumber(range)} km` : "", 10, "\u4e09\u7535");
  addSpec("\u7535\u6c60\u5bb9\u91cf", batteryCapacity !== null ? `${formatNumber(batteryCapacity, 3)} kWh` : "", 11, "\u4e09\u7535");
  addSpec("\u7535\u6c60\u7c7b\u578b", asText(fields.battery_chemistry), 12, "\u4e09\u7535");
  addSpec("\u9a71\u52a8\u65b9\u5f0f", asText(fields.drivetrain_display), 20, "\u6027\u80fd");
  addSpec("\u7535\u673a\u603b\u529f\u7387", motorPower !== null ? `${formatNumber(motorPower)} kW` : "", 21, "\u6027\u80fd");
  addSpec("\u7535\u673a\u603b\u626d\u77e9", motorTorque !== null ? `${formatNumber(motorTorque)} N-m` : "", 22, "\u6027\u80fd");
  addSpec("\u76f4\u6d41\u5feb\u5145", trimChargingDisplay(fields), 30, "\u5145\u7535");
  addSpec("\u57fa\u7840\u914d\u7f6e", jsonList(fields.base_spec_summary_json).join("; "), 40, "\u7248\u672c\u914d\u7f6e");
  addSpec("\u65b0\u589e\u914d\u7f6e", jsonList(fields.added_features_json).join("; "), 41, "\u7248\u672c\u914d\u7f6e");
  addSpec("\u5347\u7ea7\u914d\u7f6e", jsonList(fields.upgraded_features_json).join("; "), 42, "\u7248\u672c\u914d\u7f6e");
  addSpec("\u63a8\u8350\u7248\u672c", recommended, 50, "\u6570\u636e\u72b6\u6001");
  addSpec("\u7248\u672c\u6838\u9a8c\u72b6\u6001", asText(fields.source_status), 51, "\u6570\u636e\u72b6\u6001");
  addSpec("\u6700\u540e\u6838\u9a8c", asText(fields.last_verified_at), 52, "\u6570\u636e\u72b6\u6001");
  addSpec("\u5907\u6ce8", asText(fields.notes), 53, "\u6570\u636e\u72b6\u6001");

  return specs;
}

function buildVehicleModelDataset(modelRecords: FeishuRecord[], variantRecords: FeishuRecord[]) {
  const mappedModels = modelRecords.map(mapVehicleModel);
  const modelById = new Map(mappedModels.map((model) => [model.id, model]));
  const modelIdByRecordId = new Map<string, string>();
  for (const record of modelRecords) {
    const modelId = asText(record.fields.model_id);
    if (modelId) modelIdByRecordId.set(record.record_id, modelId);
  }

  const modelSpecs = modelRecords.flatMap(synthesizeSpecsFromModel);
  const specsByParentModelId = new Map<string, PortalVehicleModelSpec[]>();
  for (const spec of modelSpecs) {
    if (!specsByParentModelId.has(spec.modelId)) specsByParentModelId.set(spec.modelId, []);
    specsByParentModelId.get(spec.modelId)!.push(spec);
  }

  const variants: PortalVehicleModel[] = [];
  const variantSpecs: PortalVehicleModelSpec[] = [];
  const parentModelIdsWithVariants = new Set<string>();
  for (const record of variantRecords) {
    const variant = mapVehicleVariant(record, modelById, modelIdByRecordId);
    if (!variant) continue;
    const parentModelId = asText(record.fields.model_id) || linkedRecordIds(record.fields.vehicle_model_pruned)
      .map((recordId) => modelIdByRecordId.get(recordId))
      .find(Boolean) || "";
    parentModelIdsWithVariants.add(parentModelId);
    variants.push(variant);
    variantSpecs.push(...(specsByParentModelId.get(parentModelId) || []).map((spec) => ({ ...spec, modelId: variant.id })));
    variantSpecs.push(...synthesizeSpecsFromVariant(record, variant));
  }

  const modelsWithoutVariants = mappedModels.filter((model) => !parentModelIdsWithVariants.has(model.id));
  return {
    vehicleModels: variants.length ? [...variants, ...modelsWithoutVariants] : mappedModels,
    vehicleModelSpecs: [...modelSpecs, ...variantSpecs],
  };
}

function computeAiConfidenceScore(fields: Record<string, unknown>): number {
  let score = 1.0;
  // 1. 外贸美金报价 (EXW/FCA/FOB 三者至少需有其一) -0.25
  const hasPrice = Boolean(
    asOptionalNumber(fields["FOB美金价"]) ||
    asOptionalNumber(fields["EXW美金价"]) ||
    asOptionalNumber(fields["FCA美金价"]) ||
    asOptionalNumber(fields["网站显示美金最低价"]) ||
    asOptionalNumber(fields["网站显示最低价"]) ||
    asOptionalNumber(fields.cost_fob_usd) ||
    asOptionalNumber(fields.display_price_low)
  );
  if (!hasPrice) score -= 0.25;

  // 2. 缁嗗垎鍨嬪彿 涓嶈兘涓虹┖/鏈瘑鍒?-0.25
  const trim = asText(fields["细分型号"] ?? fields.variant);
  if (!trim || trim.includes("未识别")) score -= 0.25;

  // 3. 渚涘簲鍟?涓嶈兘涓虹┖/鏈瘑鍒?-0.15
  const supplier = asText(fields["供应商"] ?? fields.supplier);
  if (!supplier || supplier.includes("未识别")) score -= 0.15;

  // 4. 鍝佺墝 涓嶈兘涓虹┖/鏈瘑鍒?-0.15
  const brand = asText(fields["品牌"] ?? fields.brand);
  if (!brand || brand.includes("未识别")) score -= 0.15;

  // 5. 鍨嬪彿 涓嶈兘涓虹┖/鏈瘑鍒?-0.15
  const model = asText(fields["型号"] ?? fields.model);
  if (!model || model.includes("未识别")) score -= 0.15;

  // 6. 杞︽簮鍦扮偣 涓嶈兘涓虹┖/鏈瘑鍒?-0.06
  const location = asText(fields["批发地点"] ?? fields["车源地点"] ?? fields.location);
  if (!location || location.includes("未识别")) score -= 0.06;

  // 7. 宸﹀彸鑸?涓嶈兘涓虹┖ -0.06
  const steering = asText(fields["左右舵"] ?? fields.steering);
  if (!steering || steering.includes("未识别")) score -= 0.06;

  // 8. 国际国内版本 不能为空 -0.06
  const marketVersion = asText(fields["国际国内版本（多选）"] ?? fields.market_version);
  if (!marketVersion || marketVersion.includes("未识别")) score -= 0.06;

  return Math.max(0, Math.round(score * 100) / 100);
}

function mapVehicleSource(record: FeishuRecord, session: PortalSession): Record<string, unknown> {
  const fields = record.fields;
  const extColor = asText(fields["外饰颜色"] ?? fields.exterior_color);
  const intColor = asText(fields["内饰颜色"] ?? fields.interior_color);
  const colorStr = [extColor ? `Ext: ${extColor}` : "", intColor ? `Int: ${intColor}` : ""].filter(Boolean).join(" / ");

  const canSeePrice = canSeePortalPrice(session);
  const internalFobUsd = asOptionalNumber(fields["FOB美金价"]) || asOptionalNumber(fields.fob_usd);
  const customerFobUsd = asOptionalNumber(fields["customerFOB美金报价（自动计算）"] ?? fields.customer_fob_usd);
  const externalAccount = session.role === "partner" || session.role === "customer";
  const fobUsd = externalAccount ? customerFobUsd : internalFobUsd;
  const internalExwUsd = asOptionalNumber(fields["EXW美金价"]) || asOptionalNumber(fields.exw_usd);
  const internalFcaUsd = asOptionalNumber(fields["FCA美金价"]) || asOptionalNumber(fields.fca_usd);
  const exwUsd = externalAccount ? null : internalExwUsd;
  const fcaUsd = externalAccount ? null : internalFcaUsd;

  const priceTermsList: { term: string; amount: number }[] = [];
  if (fobUsd) priceTermsList.push({ term: "FOB", amount: fobUsd });
  if (!externalAccount && exwUsd) priceTermsList.push({ term: "EXW", amount: exwUsd });
  if (!externalAccount && fcaUsd) priceTermsList.push({ term: "FCA", amount: fcaUsd });

  if (priceTermsList.length === 0) {
    const generalVal = 
      asOptionalNumber(fields["网站显示美金最低价"]) || 
      asOptionalNumber(fields["外贸美金报价"]) || 
      asOptionalNumber(fields["外贸报价"]) || 
      asOptionalNumber(fields["美金报价"]) || 
      asOptionalNumber(fields["网站显示最低价"]) || 
      asOptionalNumber(fields.display_price_low) || 
      null;
    if (generalVal) {
      priceTermsList.push({ term: "FOB", amount: generalVal });
    }
  }

  const priceTerm = priceTermsList[0]?.term || "FOB";
  const priceVal = priceTermsList[0]?.amount || null;

  const stage = parseSourceStage(fields);
  const isApproved = stage === "connected";
  const modelStockQuantity = asOptionalNumber(fields["单车型总库存"] ?? fields.model_stock_quantity);
  const trimStockQuantity = asOptionalNumber(fields["细分车型库存"] ?? fields.trim_stock_quantity);
  const colorStockQuantity = asOptionalNumber(
    fields["颜色库存"] ??
    fields["现车数量"] ??
    fields["库存数量"] ??
    fields["现车库存"] ??
    fields["库存（辆）"] ??
    fields["现车（辆）"] ??
    fields["库存"] ??
    fields["现车"] ??
    fields["数量"] ??
    fields.color_stock_quantity ??
    fields.stock_quantity ??
    fields.stockQuantity ??
    fields.stock ??
    fields.quantity
  );
  const waitDays = asOptionalNumber(fields["下单后需要等待天数"] ?? fields.wait_days);
  const steeringVal = asText(fields["左右舵"] ?? fields.steering) || "左舵 LHD";
  const marketVersionVal = asText(fields["国际国内版本（多选）"] ?? fields.market_version) || "国内版";
  const computedConfidence = computeAiConfidenceScore(fields);
  const resolvedStock = colorStockQuantity ?? 0;

  return {
    id: asText(fields.record_id) || record.record_id,
    modelId: asText(fields.model_id),
    variantId: asText(fields.variant_id),
    supplier: asText(fields["供应商"] ?? fields.supplier) || "合作车商/未归类",
    reviewer: asText(fields["审核人"] ?? fields.reviewer),
    developer: asText(fields["开发者"] ?? fields.developer),
    brand: asText(fields["品牌"] ?? fields.brand),
    model: asText(fields["型号"] ?? fields.model),
    trim: asText(fields["细分型号"] ?? fields.variant),
    year: asText(fields["生产年份"] ?? fields.manufacture_year ?? fields.year),
    month: asText(fields["生产月份"] ?? fields.month),
    color: colorStr || "随车/未指定",
    exteriorColor: extColor,
    interiorColor: intColor,
    supplierExteriorColor: "",
    supplierInteriorColor: "",
    colorCode: "",
    colorNotes: "",
    colorConfirmed: true,
    configuration: asText(fields.version_type ?? fields.steering_setup) || "",
    steering: steeringVal,
    marketVersion: marketVersionVal,
    inventoryStatus: "",
    location: asText(fields["批发地点"] ?? fields["车源地点"] ?? fields.location) || "中国",
    status: waitDays === 0 ? "In Stock" : waitDays !== null ? "Preorder" : "",
    exportStatus: "Available",
    stockQuantity: resolvedStock,
    modelStockQuantity: null,
    trimStockQuantity: null,
    colorStockQuantity,
    minOrderQuantity: asNumber(fields["起订数量"] ?? fields.min_order_quantity) || 0,
    fullOrderQuantity: asNumber(fields["满订数量"] ?? fields.full_order_quantity) || 0,
    leadTime: waitDays === 0 ? "In stock" : waitDays !== null ? `${formatNumber(waitDays)} days after order` : "",
    waitDays,
    priceValidUntil: "",
    imageUrl: "",
    publicNotes: asText(fields["备注"] ?? fields.notes),
    sourceStage: stage,
    reviewProcess: stage === "connected" ? "已接入网站" : "未审核",
    isApproved,
    canSeePrice,
    price: canSeePrice ? priceVal : null,
    partnerPrice: customerFobUsd,
    customerPrice: customerFobUsd,
    cost: asOptionalNumber(fields["人民币成本价"] ?? fields.supplier_price_cny),
    exwUsd,
    fcaUsd,
    fobUsd,
    priceTerm,
    priceTermsList: canSeePrice ? priceTermsList : [],
    wholesaleLocation: asText(fields["批发地点"]),
    aiConfidence: asOptionalNumber(fields["AI置信度"]) ?? computedConfidence,
    isListed: true,
    editableFields: [],
    priceLabel: priceVal !== null ? `${priceTerm} $${priceVal.toLocaleString()}` : "待询价",
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

function mapInquiryNote(record: FeishuRecord) {
  const fields = record.fields;
  return { id: record.record_id, noteId: asText(fields.note_id), inquiryNo: asText(fields.inquiry_no), parentNoteId: asText(fields.parent_note_id), authorUserId: asText(fields.author_user_id), authorName: asText(fields.author_name), authorRole: asText(fields.author_role), body: asText(fields.body), createdAt: asText(fields.created_at) };
}

function mapStatusHistory(record: FeishuRecord) {
  const fields = record.fields;
  return { id: record.record_id, historyId: asText(fields.history_id), inquiryNo: asText(fields.inquiry_no), fromStatus: asText(fields.from_status), toStatus: asText(fields.to_status), actorName: asText(fields.actor_name), actorRole: asText(fields.actor_role), createdAt: asText(fields.created_at) };
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

function parseSourceStage(fields: Record<string, unknown>): "connected" | "unreviewed" {
  const val = fields["审核api用字段"] ?? fields.audit_api_field ?? fields["审核流程"] ?? fields["流程"];
  const str = JSON.stringify(val ?? "");

  if (str.includes("optCyihq9I")) {
    return "unreviewed";
  }

  if (str.includes("optQeQTAuY")) {
    return "connected";
  }

  const text = asText(val).trim();
  if (text.includes("已接入网站") || text.includes("已接入") || text.includes("已通过")) {
    return "connected";
  }
  if (text.includes("未审核") || text.includes("待审核")) {
    return "unreviewed";
  }

  if ("审核api用字段" in fields || "audit_api_field" in fields) {
    return "unreviewed";
  }

  return "connected";
}

function mapSourceImport(record: FeishuRecord): Record<string, unknown> {
  const fields = record.fields;
  const stage = parseSourceStage(fields);
  return {
    id: record.record_id,
    sourceStage: stage,
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
    waitDays: asOptionalNumber(fields["\u4e0b\u5355\u540e\u9700\u8981\u7b49\u5f85\u5929\u6570"]),
    steering: asText(fields["左右舵"]),
    marketVersion: asText(fields["国际国内版本（多选）"]),
    inventoryStatus: asText(fields["\u5e93\u5b58\u72b6\u6001"]),
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

async function handleLogin(request: Request, env: Env) {
  const body = (await request.json().catch(() => null)) as { email?: string; accessCode?: string } | null;
  const email = String(body?.email || "").trim().toLowerCase();
  const accessCode = String(body?.accessCode || "").trim();
  if (!email || !accessCode) return problem("Email and access code are required");

  const account = await findLoginAccount(env, email, accessCode).catch(() => null);
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

  // Dev login maps role 鈫?email, then finds the user via the same localUserStore path
  const roleToEmail: Record<string, string> = {
    admin: "admin@local.test",
    sales: "sales@local.test",
    partner: "partner@example.com",
    customer: "customer@example.com",
  };
  const email = roleToEmail[role];
  if (!email) return problem("Unknown development role", 400);

  const devUser = findLocalUser(email, "");
  if (!devUser) return problem("Dev user not found", 400);

  const account: Omit<PortalSession, "exp"> = {
    userId: devUser.userId,
    customerId: devUser.customerId,
    name: devUser.name,
    email: devUser.email,
    accountType: devUser.accountType,
    role: devUser.role,
    priceTier: devUser.priceTier,
    company: devUser.company,
  };

  const session: PortalSession = {
    ...account,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const token = await signSession(env, session);
  return json({ user: publicUser(session) }, { headers: { "set-cookie": sessionCookie(env, request, token) } });
}

async function handleBootstrap(request: Request, env: Env) {
  const session = await requireSession(request, env);

  const [modelsRes, vehiclesRes] = await Promise.all([
    handleGetVehicleModels(request, env)
      .then((r) => r.json() as Promise<{ vehicleModels?: PortalVehicleModel[]; vehicleModelSpecs?: PortalVehicleModelSpec[] }>)
      .catch(() => ({})),
    handleGetVehicles(request, env)
      .then((r) => r.json() as Promise<{ vehicles?: Vehicle[] }>)
      .catch(() => ({})),
  ]);
  const [inquiries, inquiryNotes, inquiryStatusHistory] = await Promise.all([
    listScopedInquiries(env, session),
    listInquiryNotes(env),
    listInquiryStatusHistory(env),
  ]);
  const inquiryNumbers = new Set(inquiries.map((item) => item.inquiryNo));

  return json({
    user: publicUser(session),
    permissions: {
      canSeePrice: canSeePortalPrice(session),
      canRequestQuote: true,
      canCounterOffer: true,
    },
    vehicleModels: modelsRes.vehicleModels || [],
    vehicleModelSpecs: modelsRes.vehicleModelSpecs || [],
    vehicles: vehiclesRes.vehicles || [],
    inquiries,
    quotes: [],
    negotiations: [],
    inquiryNotes: inquiryNotes.filter((item) => inquiryNumbers.has(item.inquiryNo)),
    inquiryStatusHistory: inquiryStatusHistory.filter((item) => inquiryNumbers.has(item.inquiryNo)),
    orders: [],
    internalUsers: [],
    customers: [],
  });
}

async function handleGetCatalog(request: Request, env: Env) {
  const url = new URL(request.url);
  const scope = (url.searchParams.get("scope") || url.searchParams.get("tab") || "").toLowerCase().replaceAll("-", "_");

  if (scope === "vehicle_models") {
    return handleGetVehicleModels(request, env);
  }
  if (scope === "vehicles") {
    return handleGetVehicles(request, env);
  }

  // Default fallback: execute decoupled sub-requests independently
  const [modelsRes, vehiclesRes] = await Promise.all([
    handleGetVehicleModels(request, env).then(r => r.json() as Promise<{ vehicleModels?: VehicleModel[]; vehicleModelSpecs?: VehicleSpec[] }>).catch(() => ({})),
    handleGetVehicles(request, env).then(r => r.json() as Promise<{ vehicles?: Vehicle[] }>).catch(() => ({})),
  ]);

  return json({
    vehicleModels: modelsRes.vehicleModels || [],
    vehicleModelSpecs: modelsRes.vehicleModelSpecs || [],
    vehicles: vehiclesRes.vehicles || [],
  });
}

// ─── Cron-only: fetch Feishu and write to D1 ────────────────────────────────

export async function syncVehiclesToD1(env: Env): Promise<{ synced: number }> {
  if (!env.PORTAL_DB) return { synced: 0 };

  const vehicleSourceTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLES") || "tblte61W3fKoXmSw";
  const rawRecords = vehicleSourceTableId
    ? await searchRecords(env, vehicleSourceTableId, { pageSize: 500, maxPages: 50 }).catch(() => [])
    : [];

  const now = new Date().toISOString();
  const rows = rawRecords.map((record) => {
    const f = record.fields;
    const stage = parseSourceStage(f);
    const fobUsd =
      asOptionalNumber(f["FOB美金价"]) ||
      asOptionalNumber(f.fob_usd) ||
      asOptionalNumber(f["网站显示美金最低价"]) ||
      asOptionalNumber(f.display_price_low);
    return {
      id: record.record_id,
      vehicle_id: asText(f.vehicle_id) || null,
      model_id: asText(f.model_id) || null,
      brand: asText(f["品牌"] ?? f.brand) || null,
      model: asText(f["型号"] ?? f.model) || null,
      variant: asText(f["细分型号"] ?? f.variant) || null,
      stage,
      steering: asText(f["左右舵"] ?? f.steering) || null,
      location: asText(f["批发地点"] ?? f["车源地点"] ?? f.location) || null,
      supplier: asText(f["供应商"] ?? f.supplier) || null,
      display_price_low: fobUsd ?? null,
      display_price_high: fobUsd ?? null,
      currency: "USD",
      min_order_quantity: asOptionalNumber(f["起订数量"] ?? f.min_order_quantity) ?? null,
      inventory_count:
        asOptionalNumber(f["颜色库存"] ?? f.color_stock_quantity) ??
        asOptionalNumber(f["细分车型库存"] ?? f.trim_stock_quantity) ??
        null,
      wait_days: asOptionalNumber(f["下单后需要等待天数"] ?? f.wait_days) ?? null,
      powertrain_type: asText(f.powertrain_type) || null,
      color: [asText(f["外饰颜色"] ?? f.exterior_color), asText(f["内饰颜色"] ?? f.interior_color)]
        .filter(Boolean).join(" / ") || null,
      color_code: null,
      image_url: null,
      gallery_images_json: null,
      specs_json: null,
      ai_confidence_score: asOptionalNumber(f["AI置信度"]) ?? computeAiConfidenceScore(f),
      synced_at: now,
    };
  });

  await upsertVehicles(env.PORTAL_DB, rows);
  return { synced: rows.length };
}

export async function syncVehicleModelsToDB(env: Env): Promise<{ models: number; trims: number }> {
  if (!env.PORTAL_DB) return { models: 0, trims: 0 };

  const vehicleModelTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_MODELS") || "tblxVNjP9dnJ7b3o";
  const vehicleVariantTableId = optionalEnv(env, "FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS") || "tbl8YzkZkMxvHRoT";

  const [modelRecords, trimRecords] = await Promise.all([
    vehicleModelTableId
      ? searchRecords(env, vehicleModelTableId, { pageSize: 500, maxPages: 50 }).catch(() => [])
      : Promise.resolve([]),
    vehicleVariantTableId
      ? searchRecords(env, vehicleVariantTableId, { pageSize: 500, maxPages: 50 }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const now = new Date().toISOString();

  const modelRows = modelRecords.map((record) => {
    const f = record.fields;
    return {
      id: asText(f.model_id) || record.record_id,
      model_id: asText(f.model_id) || null,
      brand: asText(f.brand) || null,
      model: asText(f.model) || null,
      status: asText(f.status) || null,
      powertrain_type: asText(f.powertrain_type) || null,
      segment: asText(f.segment) || null,
      vehicle_class: asText(f.vehicle_class) || null,
      display_price_low: asOptionalNumber(f.display_price_low) ?? null,
      display_price_high: asOptionalNumber(f.display_price_high) ?? null,
      image_url: asText(f.image_url) || null,
      hero_description: asText(f.hero_description) || null,
      page_title: asText(f.page_title) || null,
      page_subtitle: asText(f.page_subtitle) || null,
      product_path: productPath(f),
      cltc_range_min_km: asOptionalNumber(f.cltc_range_min_km_auto) ?? null,
      cltc_range_max_km: asOptionalNumber(f.cltc_range_max_km_auto) ?? null,
      battery_capacity_min_kwh: asOptionalNumber(f.battery_capacity_min_kwh_auto) ?? null,
      battery_capacity_max_kwh: asOptionalNumber(f.battery_capacity_max_kwh_auto) ?? null,
      motor_power_min_kw: asOptionalNumber(f.motor_power_min_kw_auto) ?? null,
      motor_power_max_kw: asOptionalNumber(f.motor_power_max_kw_auto) ?? null,
      top_speed_min_kmh: asOptionalNumber(f.top_speed_min_kmh) ?? null,
      top_speed_max_kmh: asOptionalNumber(f.top_speed_max_kmh) ?? null,
      zero_to_100_sec: asOptionalNumber(f["0_100_km_h_sec"]) ?? null,
      wheelbase_mm: asOptionalNumber(f.wheelbase_mm) ?? null,
      length_mm: asOptionalNumber(f.length_mm) ?? null,
      width_mm: asOptionalNumber(f.width_mm) ?? null,
      height_mm: asOptionalNumber(f.height_mm) ?? null,
      seats_min: asOptionalNumber(f.seats_min) ?? null,
      seats_max: asOptionalNumber(f.seats_max) ?? null,
      voltage_platform_v: asOptionalNumber(f.voltage_platform_v) ?? null,
      ground_clearance_mm: asOptionalNumber(f.ground_clearance_mm) ?? null,
      boot_volume_l: asOptionalNumber(f.boot_volume_l) ?? null,
      drivetrain_display: asText(f.drivetrain_display_auto) || null,
      battery_chemistry: asText(f.battery_chemistry_auto) || null,
      battery_technology: asText(f.battery_technology) || null,
      steering_setup: asText(f.steering_setup) || null,
      sunroof_availability: asText(f.sunroof_availability) || null,
      v2l_availability: asText(f.v2l_availability) || null,
      v2l_output_power_kw: asOptionalNumber(f.v2l_output_power_kw) ?? null,
      ac_slow_charge_supported: asText(f.ac_slow_charge_supported) === "Yes" ? 1 : 0,
      ac_slow_charge_full_time_hours: asOptionalNumber(f.ac_slow_charge_full_time_hours) ?? null,
      battery_warranty_years: asOptionalNumber(f.battery_warranty_years) ?? null,
      battery_warranty_distance_km: asOptionalNumber(f.battery_warranty_distance_km) ?? null,
      gallery_images_json: JSON.stringify(f.gallery_images_json ?? null),
      common_features_json: typeof f.common_features_json_pruned === "string" ? f.common_features_json_pruned : JSON.stringify(f.common_features_json_pruned ?? null),
      i18n_translations: typeof f.i18n_translations === "string" ? f.i18n_translations : JSON.stringify(f.i18n_translations ?? null),
      inventory_status: asText(f.inventory_status) || null,
      version: asText(f.version) || null,
      synced_at: now,
    };
  });

  const modelIdByRecordId = new Map<string, string>();
  for (const record of modelRecords) {
    const modelId = asText(record.fields.model_id);
    if (modelId) modelIdByRecordId.set(record.record_id, modelId);
  }

  const trimRows = trimRecords.map((record) => {
    const f = record.fields;
    const linkedModelId = linkedRecordIds(f.vehicle_model_pruned)
      .map((rid) => modelIdByRecordId.get(rid))
      .find(Boolean);
    const modelId = asText(f.model_id) || linkedModelId || "";
    return {
      id: record.record_id,
      model_id: modelId,
      parent_model_record_id: linkedRecordIds(f.vehicle_model_pruned)[0] ?? null,
      trim_name: asText(f.MODEL ?? f.model) || null,
      status: asText(f.status) || null,
      display_price_low: asOptionalNumber(f.display_price_low) ?? null,
      display_price_high: asOptionalNumber(f.display_price_high) ?? null,
      powertrain_type: asText(f.powertrain_type) || null,
      cltc_range_km: asOptionalNumber(f.cltc_range_km ?? f.cltc_range_max_km_auto) ?? null,
      battery_capacity_kwh: asOptionalNumber(f.battery_capacity_kwh ?? f.battery_capacity_max_kwh_auto) ?? null,
      motor_power_kw: asOptionalNumber(f.motor_power_kw ?? f.motor_power_max_kw_auto) ?? null,
      top_speed_kmh: asOptionalNumber(f.top_speed_kmh ?? f.top_speed_max_kmh) ?? null,
      zero_to_100_sec: asOptionalNumber(f["0_100_km_h_sec"]) ?? null,
      specs_json: typeof f.trim_configurations_pruned === "string" ? f.trim_configurations_pruned : JSON.stringify(f.trim_configurations_pruned ?? null),
      synced_at: now,
    };
  });

  await Promise.all([
    upsertVehicleModels(env.PORTAL_DB, modelRows),
    upsertVehicleTrims(env.PORTAL_DB, trimRows),
  ]);

  return { models: modelRows.length, trims: trimRows.length };
}

// ─── API handlers: read ONLY from D1, zero Feishu calls ─────────────────────

async function handleGetVehicles(request: Request, env: Env) {
  const session = await requireSession(request, env);

  // Read from D1 if available (primary source)
  if (env.PORTAL_DB) {

    const rows = await queryVehicles(env.PORTAL_DB).catch(() => []);
    if (rows.length > 0) {
      const canSeePrice = canSeePortalPrice(session);
      const vehicles = rows.map((row) => ({
        id: row.id,
        modelId: row.model_id,
        brand: row.brand,
        model: row.model,
        trim: row.variant,
        supplier: row.supplier,
        steering: row.steering,
        location: row.location,
        stage: row.stage,
        price: canSeePrice ? row.display_price_low : null,
        fobUsd: canSeePrice ? row.display_price_low : null,
        currency: row.currency || "USD",
        minOrderQuantity: row.min_order_quantity,
        stockQuantity: row.inventory_count ?? 0,
        colorStockQuantity: row.inventory_count ?? null,
        waitDays: row.wait_days ?? null,
        powertrain_type: row.powertrain_type,
        color: row.color,
        aiConfidence: row.ai_confidence_score,
        isApproved: true,
        canSeePrice,
        syncedAt: row.synced_at,
      }));
      return json({ vehicles });
    }
  }

  // Fallback: baseline if D1 not populated yet
  return json({ vehicles: getBaselineVehicles(session) });
}

async function handleGetVehicleModels(request: Request, env: Env) {
  const session = await requireSession(request, env);

  // Read from D1 if available (primary source)
  if (env.PORTAL_DB) {

    const [modelRows, trimRows] = await Promise.all([
      queryVehicleModels(env.PORTAL_DB).catch(() => []),
      queryVehicleTrims(env.PORTAL_DB).catch(() => []),
    ]);

    if (modelRows.length > 0) {
      const vehicleModels: PortalVehicleModel[] = modelRows.map((row) => ({
        id: row.id,
        brand: row.brand ?? "",
        model: row.model ?? "",
        trim: row.version ?? "",
        year: "",
        bodyType: row.vehicle_class ?? row.segment ?? "",
        fuelType: row.powertrain_type ?? "",
        msrpChina: row.display_price_low != null ? `¥${formatNumber(row.display_price_low)}` : "",
        battery: row.battery_capacity_max_kwh != null ? `${row.battery_capacity_max_kwh} kWh` : "",
        batteryType: row.battery_chemistry ?? "",
        batteryMaker: "",
        range: row.cltc_range_max_km != null ? `${row.cltc_range_max_km} km (CLTC)` : "",
        energyConsumption: "",
        motorPower: row.motor_power_max_kw != null ? `${row.motor_power_max_kw} kW` : "",
        motorTorque: "",
        driveType: row.drivetrain_display ?? "",
        topSpeed: row.top_speed_max_kmh != null ? `${row.top_speed_max_kmh} km/h` : "",
        acceleration: row.zero_to_100_sec != null ? `${row.zero_to_100_sec} sec` : "",
        seats: row.seats_max != null ? `${row.seats_max} seats` : "",
        doors: "",
        dimensions: [row.length_mm, row.width_mm, row.height_mm].every((v) => v != null)
          ? `${row.length_mm} x ${row.width_mm} x ${row.height_mm} mm` : "",
        wheelbase: row.wheelbase_mm != null ? `${row.wheelbase_mm} mm` : "",
        curbWeight: "",
        trunkCapacity: row.boot_volume_l != null ? `${row.boot_volume_l} L` : "",
        charging: "",
        frontSuspension: "",
        rearSuspension: "",
        adas: "",
        marketPosition: row.page_subtitle ?? "",
        exportNotes: "",
        imageUrl: row.image_url ?? "",
        brochureUrl: "",
        sourceUrl: row.product_path ?? "",
        sourceName: "",
        lastSyncedAt: row.synced_at,
        fullSpecsJson: "",
        status: row.status ?? "Active",
      }));

      // Build specs from trim rows
      const vehicleModelSpecs: PortalVehicleModelSpec[] = trimRows.map((trim) => ({
        id: trim.id,
        modelId: trim.model_id,
        name: trim.trim_name ?? "",
        status: trim.status ?? "",
        displayPriceLow: trim.display_price_low ?? undefined,
        displayPriceHigh: trim.display_price_high ?? undefined,
        powertrainType: trim.powertrain_type ?? undefined,
        cltcRangeKm: trim.cltc_range_km ?? undefined,
        batteryCapacityKwh: trim.battery_capacity_kwh ?? undefined,
        motorPowerKw: trim.motor_power_kw ?? undefined,
        topSpeedKmh: trim.top_speed_kmh ?? undefined,
        zeroTo100Sec: trim.zero_to_100_sec ?? undefined,
        specsJson: trim.specs_json ?? undefined,
      }));

      return json({ vehicleModels, vehicleModelSpecs });
    }
  }

  // Fallback: baseline if D1 not populated yet
  const vehicleModels = getBaselineVehicleModels();
  const vehicleModelSpecs: PortalVehicleModelSpec[] = [];
  return json({ vehicleModels, vehicleModelSpecs });
}

function getBaselineVehicleModels(): PortalVehicleModel[] {
  const now = new Date().toISOString();
  return [
    {
      id: "bm-byd-seal-2025",
      brand: "BYD",
      model: "Seal",
      trim: "82.5kWh 700km Performance",
      year: "2025",
      bodyType: "Sedan",
      fuelType: "BEV",
      msrpChina: "¥189,800",
      battery: "82.5 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "700 km",
      energyConsumption: "12.5 kWh/100km",
      motorPower: "390 kW",
      motorTorque: "670 N·m",
      driveType: "AWD",
      topSpeed: "225 km/h",
      acceleration: "3.8s",
      seats: "5",
      doors: "4",
      dimensions: "4800×1875×1460 mm",
      wheelbase: "2920 mm",
      curbWeight: "2150 kg",
      trunkCapacity: "400L",
      charging: "800V Fast Charge",
      frontSuspension: "Double Wishbone",
      rearSuspension: "Multi-Link",
      adas: "DiPilot 300 LiDAR",
      marketPosition: "Executive Performance Sedan",
      exportNotes: "Global bestseller, EU/GCC compliant",
      imageUrl: "/pic/elite-flagship/seal/5.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-byd-seagull-2025",
      brand: "BYD",
      model: "Seagull",
      trim: "38.8kWh 405km Flying Edition",
      year: "2025",
      bodyType: "Hatchback",
      fuelType: "BEV",
      msrpChina: "¥75,800",
      battery: "38.8 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "405 km",
      energyConsumption: "9.6 kWh/100km",
      motorPower: "55 kW",
      motorTorque: "135 N·m",
      driveType: "FWD",
      topSpeed: "130 km/h",
      acceleration: "9.5s",
      seats: "4",
      doors: "5",
      dimensions: "3780×1715×1540 mm",
      wheelbase: "2500 mm",
      curbWeight: "1160 kg",
      trunkCapacity: "230L",
      charging: "DC Fast Charge 30min",
      frontSuspension: "MacPherson",
      rearSuspension: "Torsion Beam",
      adas: "DiLink Smart Cockpit",
      marketPosition: "Urban Commuter Bestseller",
      exportNotes: "High volume demand in Africa & LATAM",
      imageUrl: "/pic/revenue-king/seagull/7.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-byd-dolphin-2025",
      brand: "BYD",
      model: "Dolphin",
      trim: "44.9kWh 420km Fashion",
      year: "2025",
      bodyType: "Hatchback",
      fuelType: "BEV",
      msrpChina: "¥99,800",
      battery: "44.9 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "420 km",
      energyConsumption: "10.5 kWh/100km",
      motorPower: "70 kW",
      motorTorque: "180 N·m",
      driveType: "FWD",
      topSpeed: "150 km/h",
      acceleration: "7.9s",
      seats: "5",
      doors: "5",
      dimensions: "4125×1770×1570 mm",
      wheelbase: "2700 mm",
      curbWeight: "1405 kg",
      trunkCapacity: "345L",
      charging: "Heat Pump + Fast Charge",
      frontSuspension: "MacPherson",
      rearSuspension: "Torsion Beam",
      adas: "DiPilot 100",
      marketPosition: "Comfort Urban Hatchback",
      exportNotes: "Global Export Flagship",
      imageUrl: "/pic/revenue-king/dolphin/7cut.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-byd-yuan-up-2025",
      brand: "BYD",
      model: "Yuan UP",
      trim: "45.12kWh 401km Transcendence",
      year: "2025",
      bodyType: "SUV",
      fuelType: "BEV",
      msrpChina: "¥109,800",
      battery: "45.12 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "401 km",
      energyConsumption: "12.0 kWh/100km",
      motorPower: "130 kW",
      motorTorque: "290 N·m",
      driveType: "FWD",
      topSpeed: "160 km/h",
      acceleration: "7.9s",
      seats: "5",
      doors: "5",
      dimensions: "4310×1830×1675 mm",
      wheelbase: "2620 mm",
      curbWeight: "1540 kg",
      trunkCapacity: "395L",
      charging: "V2L + Fast Charge 30min",
      frontSuspension: "MacPherson",
      rearSuspension: "Torsion Beam",
      adas: "DiLink Cockpit",
      marketPosition: "Compact SUV Bestseller",
      exportNotes: "High ground clearance, hot seller",
      imageUrl: "/pic/revenue-king/yuanup/5.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-byd-qin-plus-2025",
      brand: "BYD",
      model: "Qin PLUS EV",
      trim: "57.6kWh 510km Leading",
      year: "2025",
      bodyType: "Sedan",
      fuelType: "BEV",
      msrpChina: "¥119,800",
      battery: "57.6 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "510 km",
      energyConsumption: "11.6 kWh/100km",
      motorPower: "100 kW",
      motorTorque: "180 N·m",
      driveType: "FWD",
      topSpeed: "150 km/h",
      acceleration: "8.5s",
      seats: "5",
      doors: "4",
      dimensions: "4765×1837×1515 mm",
      wheelbase: "2718 mm",
      curbWeight: "1620 kg",
      trunkCapacity: "450L",
      charging: "Fast Charge 30min",
      frontSuspension: "MacPherson",
      rearSuspension: "Multi-Link",
      adas: "DiPilot",
      marketPosition: "Commercial Taxi & Fleet Standard",
      exportNotes: "1M+ units market tested",
      imageUrl: "/pic/revenue-king/qinplusev/3.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-geely-galaxy-e5-2025",
      brand: "Geely",
      model: "Galaxy E5",
      trim: "60kWh 530km Starry",
      year: "2025",
      bodyType: "SUV",
      fuelType: "BEV",
      msrpChina: "¥135,800",
      battery: "60.0 kWh",
      batteryType: "Shield Short-Blade LFP",
      batteryMaker: "Geely Aegis",
      range: "530 km",
      energyConsumption: "11.9 kWh/100km",
      motorPower: "160 kW",
      motorTorque: "320 N·m",
      driveType: "FWD",
      topSpeed: "175 km/h",
      acceleration: "6.9s",
      seats: "5",
      doors: "5",
      dimensions: "4615×1901×1670 mm",
      wheelbase: "2750 mm",
      curbWeight: "1615 kg",
      trunkCapacity: "461L",
      charging: "Fast Charge 20min",
      frontSuspension: "MacPherson",
      rearSuspension: "Multi-Link",
      adas: "Flyme Auto Cockpit",
      marketPosition: "Global Family Smart SUV",
      exportNotes: "High international interest",
      imageUrl: "/pic/revenue-king/Galaxye5/5.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-geely-galaxy-m9-2025",
      brand: "Geely",
      model: "Galaxy M9",
      trim: "60kWh EREV Air Suspension",
      year: "2025",
      bodyType: "SUV",
      fuelType: "EREV",
      msrpChina: "¥219,800",
      battery: "60.0 kWh",
      batteryType: "LFP",
      batteryMaker: "CATL",
      range: "1500 km",
      energyConsumption: "16.8 kWh/100km",
      motorPower: "400 kW",
      motorTorque: "710 N·m",
      driveType: "AWD",
      topSpeed: "200 km/h",
      acceleration: "4.9s",
      seats: "6",
      doors: "5",
      dimensions: "5200×1990×1800 mm",
      wheelbase: "3100 mm",
      curbWeight: "2550 kg",
      trunkCapacity: "650L",
      charging: "Fast Charge 20min",
      frontSuspension: "Air Suspension",
      rearSuspension: "Multi-Link",
      adas: "Flyme Auto ADAS",
      marketPosition: "Full-Size Luxury Family SUV",
      exportNotes: "High demand in ME & CIS",
      imageUrl: "/pic/elite-flagship/Galaxym9/7.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-xiaomi-yu7-2025",
      brand: "Xiaomi",
      model: "YU7",
      trim: "101kWh Max 835km",
      year: "2025",
      bodyType: "SUV",
      fuelType: "BEV",
      msrpChina: "¥259,900",
      battery: "101 kWh",
      batteryType: "NCM Kirin",
      batteryMaker: "CATL",
      range: "835 km",
      energyConsumption: "13.9 kWh/100km",
      motorPower: "495 kW",
      motorTorque: "838 N·m",
      driveType: "AWD",
      topSpeed: "240 km/h",
      acceleration: "3.2s",
      seats: "5",
      doors: "5",
      dimensions: "4999×1996×1600 mm",
      wheelbase: "3000 mm",
      curbWeight: "2205 kg",
      trunkCapacity: "580L",
      charging: "800V HyperCharge",
      frontSuspension: "Double Wishbone",
      rearSuspension: "Multi-Link",
      adas: "Xiaomi Pilot Max LiDAR",
      marketPosition: "Ultra-Tech Performance SUV",
      exportNotes: "High global interest",
      imageUrl: "/pic/revenue-king/lafa5/8cut.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-li-auto-l6-2025",
      brand: "Li Auto",
      model: "L6",
      trim: "36.8kWh Pro EREV 1390km",
      year: "2025",
      bodyType: "SUV",
      fuelType: "EREV",
      msrpChina: "¥249,800",
      battery: "36.8 kWh",
      batteryType: "LFP EREV",
      batteryMaker: "CATL / Sunwoda",
      range: "1390 km",
      energyConsumption: "15.8 kWh/100km",
      motorPower: "300 kW",
      motorTorque: "529 N·m",
      driveType: "AWD",
      topSpeed: "180 km/h",
      acceleration: "5.4s",
      seats: "5",
      doors: "5",
      dimensions: "4925×1960×1735 mm",
      wheelbase: "2920 mm",
      curbWeight: "2345 kg",
      trunkCapacity: "491L",
      charging: "DC Fast Charge 20min",
      frontSuspension: "Double Wishbone",
      rearSuspension: "Five-Link",
      adas: "Li AD Pro",
      marketPosition: "Luxury Family EREV SUV",
      exportNotes: "Top-selling luxury SUV",
      imageUrl: "/pic/elite-flagship/L6/5cut.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-fangchengbao-leopard-5-2025",
      brand: "Fangchengbao",
      model: "Leopard 5",
      trim: "31.8kWh DMO Off-Road",
      year: "2025",
      bodyType: "SUV",
      fuelType: "EREV",
      msrpChina: "¥289,800",
      battery: "31.8 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "1310 km",
      energyConsumption: "18.1 kWh/100km",
      motorPower: "505 kW",
      motorTorque: "760 N·m",
      driveType: "AWD",
      topSpeed: "180 km/h",
      acceleration: "4.8s",
      seats: "5",
      doors: "5",
      dimensions: "4890×1970×1920 mm",
      wheelbase: "2800 mm",
      curbWeight: "2890 kg",
      trunkCapacity: "550L",
      charging: "DC Fast Charge",
      frontSuspension: "Double Wishbone",
      rearSuspension: "Double Wishbone",
      adas: "FiPilot 200",
      marketPosition: "Super Hybrid Rugged SUV",
      exportNotes: "Extreme off-road capabilities",
      imageUrl: "/pic/elite-flagship/leopard5/7.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-changan-lumin-2025",
      brand: "Changan",
      model: "Lumin",
      trim: "27.9kWh 301km Sweet",
      year: "2025",
      bodyType: "Hatchback",
      fuelType: "BEV",
      msrpChina: "¥54,900",
      battery: "27.9 kWh",
      batteryType: "LFP",
      batteryMaker: "CATL",
      range: "301 km",
      energyConsumption: "9.2 kWh/100km",
      motorPower: "35 kW",
      motorTorque: "87 N·m",
      driveType: "FWD",
      topSpeed: "101 km/h",
      acceleration: "12.0s",
      seats: "4",
      doors: "3",
      dimensions: "3270×1700×1545 mm",
      wheelbase: "1980 mm",
      curbWeight: "900 kg",
      trunkCapacity: "104L",
      charging: "DC Fast Charge 35min",
      frontSuspension: "MacPherson",
      rearSuspension: "Trailing Arm",
      adas: "Dual Airbags + Touchscreen",
      marketPosition: "Entry City Commuter",
      exportNotes: "High reliability entry car",
      imageUrl: "/pic/revenue-king/lumin/5.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
    {
      id: "bm-linghui-e7-2025",
      brand: "Linghui",
      model: "e7",
      trim: "Blade LFP 450km Operating",
      year: "2025",
      bodyType: "Sedan",
      fuelType: "BEV",
      msrpChina: "¥108,000",
      battery: "50.0 kWh",
      batteryType: "LFP Blade",
      batteryMaker: "BYD FinDreams",
      range: "450 km",
      energyConsumption: "11.2 kWh/100km",
      motorPower: "100 kW",
      motorTorque: "180 N·m",
      driveType: "FWD",
      topSpeed: "150 km/h",
      acceleration: "8.8s",
      seats: "5",
      doors: "4",
      dimensions: "4780×1837×1515 mm",
      wheelbase: "2718 mm",
      curbWeight: "1600 kg",
      trunkCapacity: "460L",
      charging: "5-min Flash Charge",
      frontSuspension: "MacPherson",
      rearSuspension: "Multi-Link",
      adas: "Commercial Operating System",
      marketPosition: "Commercial Ride-Hailing Fleet",
      exportNotes: "6-year / 600,000km durability",
      imageUrl: "/pic/revenue-king/lumin/5.webp",
      brochureUrl: "",
      sourceUrl: "",
      sourceName: "Youguard Baseline",
      lastSyncedAt: now,
      fullSpecsJson: "{}",
      status: "active",
    },
  ];
}

function getBaselineVehicles(session: PortalSession): Record<string, unknown>[] {
  const canSeePrice = canSeePortalPrice(session);
  const now = new Date().toISOString();
  return [
    {
      id: "v-001",
      vin: "LGBX348291029381",
      brand: "BYD",
      model: "Seal",
      trim: "82.5kWh 700km Performance",
      year: "2025",
      color: "Aurora White",
      interiorColor: "Black Leather",
      status: "Available",
      stage: "connected",
      stockQuantity: 12,
      fobPrice: canSeePrice ? 24500 : null,
      currency: "USD",
      location: "Shenzhen Port",
      sourceName: "Youguard Direct Stock",
      updatedAt: now,
    },
    {
      id: "v-002",
      vin: "LGBX991823746192",
      brand: "Geely",
      model: "Galaxy M9",
      trim: "60kWh EREV Air Suspension",
      year: "2025",
      color: "Starry Black",
      interiorColor: "Brown Nappa",
      status: "Available",
      stage: "connected",
      stockQuantity: 8,
      fobPrice: canSeePrice ? 28900 : null,
      currency: "USD",
      location: "Ningbo Port",
      sourceName: "Youguard Direct Stock",
      updatedAt: new Date().toISOString(),
    },
    {
      id: "v-003",
      vin: "LGBX881726354190",
      brand: "Xiaomi",
      model: "YU7",
      trim: "101kWh Max 835km",
      year: "2025",
      color: "Verdant Green",
      interiorColor: "Gray Tech",
      status: "Available",
      stage: "connected",
      stockQuantity: 5,
      fobPrice: canSeePrice ? 36500 : null,
      currency: "USD",
      location: "Shanghai Port",
      sourceName: "Youguard Direct Stock",
      updatedAt: new Date().toISOString(),
    },
  ];
}




async function handleCreateInquiry(request: Request, env: Env) {
  const session = await requireSession(request, env);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const vehicleId = asText(body?.vehicleId).trim();
  const quantity = asNumber(body?.quantity);
  if (!vehicleId || quantity <= 0) return problem("Vehicle and quantity are required");
  const db = requirePortalDb(env); const now = nowText();
  const inquiryNo = nextId("INQ");
  const vehicle = await db.prepare("SELECT brand, model, variant FROM vehicles WHERE id = ?").bind(vehicleId).first<{ brand: string | null; model: string | null; variant: string | null }>();
  const vehicleModel = vehicle ? [vehicle.brand, vehicle.model, vehicle.variant].filter(Boolean).join(" ") : vehicleId;
  await db.batch([
    db.prepare("INSERT INTO inquiries (id,inquiry_no,customer_id,vehicle_id,vehicle_model,quantity,destination_port,trade_term,target_price,initial_note,status,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), inquiryNo, session.customerId, vehicleId, vehicleModel, quantity, asText(body?.destinationPort), asText(body?.tradeTerm) || "FOB", asNumber(body?.targetPrice) || null, asText(body?.notes), "New Inquiry", "Customer Portal", now, now),
    db.prepare("INSERT INTO inquiry_participants (id,inquiry_no,customer_id,user_id,company,role,access_source,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), inquiryNo, session.customerId, session.userId, session.company, session.role, "Creator", now),
  ]);
  if (asText(body?.notes).trim()) await createInquiryNote(env, session, inquiryNo, asText(body?.notes));
  return json({ ok: true, inquiryNo }, { status: 201 });
}

function canManageInquiryStatus(session: PortalSession) { return session.role === "admin" || session.role === "sales"; }

function requirePortalDb(env: Env) { if (!env.PORTAL_DB) throw problem("Inquiry database is unavailable", 503); return env.PORTAL_DB; }
function mapD1Inquiry(row: any) { return { id: row.id, inquiryNo: row.inquiry_no, customerId: row.customer_id, vehicleId: row.vehicle_id, vehicleModel: row.vehicle_model, quantity: Number(row.quantity || 0), destinationPort: row.destination_port || "", tradeTerm: row.trade_term || "", targetPrice: Number(row.target_price || 0), notes: row.initial_note || "", status: row.status || "New Inquiry", createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at || "" }; }
function mapD1Note(row: any) { return { id: row.id, noteId: row.note_id, inquiryNo: row.inquiry_no, parentNoteId: row.parent_note_id || "", authorUserId: row.author_user_id, authorName: row.author_name, authorRole: row.author_role, body: row.body, createdAt: row.created_at, deletedAt: row.deleted_at || "" }; }
function mapD1History(row: any) { return { id: row.id, historyId: row.history_id, inquiryNo: row.inquiry_no, fromStatus: row.from_status || "", toStatus: row.to_status, actorName: row.actor_name, actorRole: row.actor_role, createdAt: row.created_at }; }
async function listInquiryNotes(env: Env) { const r = await requirePortalDb(env).prepare("SELECT * FROM inquiry_notes WHERE deleted_at IS NULL ORDER BY created_at").all(); return r.results.map(mapD1Note); }
async function listInquiryStatusHistory(env: Env) { const r = await requirePortalDb(env).prepare("SELECT * FROM inquiry_status_history ORDER BY created_at").all(); return r.results.map(mapD1History); }

async function listScopedInquiries(env: Env, session: PortalSession) {
  const db = requirePortalDb(env);
  const result = canManageInquiryStatus(session)
    ? await db.prepare("SELECT * FROM inquiries WHERE deleted_at IS NULL ORDER BY updated_at DESC").all()
    : await db.prepare("SELECT DISTINCT i.* FROM inquiries i LEFT JOIN inquiry_participants p ON p.inquiry_no=i.inquiry_no WHERE i.deleted_at IS NULL AND (i.customer_id=? OR p.customer_id=? OR p.user_id=?) ORDER BY i.updated_at DESC").bind(session.customerId, session.customerId, session.userId).all();
  return result.results.map(mapD1Inquiry);
}

async function findScopedInquiry(env: Env, session: PortalSession, inquiryNo: string) {
  const inquiry = (await listScopedInquiries(env, session)).find((item) => item.inquiryNo === inquiryNo);
  if (!inquiry) throw problem("Inquiry not found", 404);
  return { inquiry };
}

async function createInquiryNote(env: Env, session: PortalSession, inquiryNo: string, body: string, parentNoteId = "") {
  const now = nowText(); return requirePortalDb(env).prepare("INSERT INTO inquiry_notes (id,note_id,inquiry_no,parent_note_id,author_user_id,author_name,author_role,body,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), nextId("NOTE"), inquiryNo, parentNoteId || null, session.userId, session.name, session.role, body.trim(), now).run();
}

async function handleCreateInquiryNote(request: Request, env: Env, inquiryNo: string) {
  const session = await requireSession(request, env); await findScopedInquiry(env, session, inquiryNo);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null; const text = asText(body?.body).trim();
  if (!text) return problem("Note is required"); if (text.length > 4000) return problem("Note must be 4000 characters or fewer");
  await createInquiryNote(env, session, inquiryNo, text, asText(body?.parentNoteId)); return json({ ok: true }, { status: 201 });
}

async function handleUpdateInquiryStatus(request: Request, env: Env, inquiryNo: string) {
  const session = await requireSession(request, env); if (!canManageInquiryStatus(session)) return problem("Only admin and sales can change inquiry status", 403);
  const { inquiry } = await findScopedInquiry(env, session, inquiryNo); const body = (await request.json().catch(() => null)) as Record<string, unknown> | null; const status = asText(body?.status).trim();
  const allowed = new Set(["New Inquiry", "Quoted", "Negotiating", "Accepted", "Closed"]); if (!allowed.has(status)) return problem("Invalid inquiry status");
  if (status !== inquiry.status) { const now = nowText(); const db = requirePortalDb(env); await db.batch([db.prepare("UPDATE inquiries SET status=?, updated_at=? WHERE inquiry_no=?").bind(status, now, inquiryNo), db.prepare("INSERT INTO inquiry_status_history (id,history_id,inquiry_no,from_status,to_status,actor_user_id,actor_name,actor_role,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), nextId("STATUS"), inquiryNo, inquiry.status, status, session.userId, session.name, session.role, now)]); }
  return json({ ok: true });
}

async function handleDeleteInquiryContent(request: Request, env: Env, type: "inquiry" | "note", id: string) {
  const session = await requireSession(request, env); const db = requirePortalDb(env); const table = type === "inquiry" ? "inquiries" : "inquiry_notes"; const key = type === "inquiry" ? "inquiry_no" : "note_id";
  const row = await db.prepare(`SELECT * FROM ${table} WHERE ${key}=?`).bind(id).first<any>(); if (!row) return problem("Inquiry content not found", 404);
  const authorId = type === "inquiry" ? row.customer_id : row.author_user_id; if (session.role !== "admin" && authorId !== session.userId && authorId !== session.customerId) return problem("Only an administrator can remove another account's content", 403);
  const body = await request.json().catch(() => ({})) as Record<string, unknown>; await db.prepare(`UPDATE ${table} SET deleted_at=?, deleted_by_user_id=?, deleted_by_name=?, deletion_reason=? WHERE ${key}=?`).bind(nowText(), session.userId, session.name, asText(body.reason), id).run(); return json({ ok: true });
}

async function handleDeletedInquiryContent(request: Request, env: Env) {
  const session = await requireSession(request, env); if (session.role !== "admin") return problem("Administrator access required", 403); const db = requirePortalDb(env);
  const [inquiries, notes] = await Promise.all([db.prepare("SELECT * FROM inquiries WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC").all(), db.prepare("SELECT * FROM inquiry_notes WHERE deleted_at IS NOT NULL ORDER BY deleted_at DESC").all()]);
  return json({ inquiries: inquiries.results.map(mapD1Inquiry), notes: notes.results.map(mapD1Note) });
}

async function handleModerateDeletedContent(request: Request, env: Env, type: "inquiry" | "note", id: string) {
  const session = await requireSession(request, env); if (session.role !== "admin") return problem("Administrator access required", 403); const db = requirePortalDb(env); const table = type === "inquiry" ? "inquiries" : "inquiry_notes"; const key = type === "inquiry" ? "inquiry_no" : "note_id"; const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  if (asText(body.action) === "restore") { await db.prepare(`UPDATE ${table} SET deleted_at=NULL, deleted_by_user_id=NULL, deleted_by_name=NULL, deletion_reason=NULL WHERE ${key}=? AND deleted_at IS NOT NULL`).bind(id).run(); return json({ ok: true }); }
  if (asText(body.action) === "purge") { await db.prepare(`DELETE FROM ${table} WHERE ${key}=? AND deleted_at IS NOT NULL`).bind(id).run(); return json({ ok: true }); }
  return problem("Invalid moderation action");
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

// 闂傚倸鍊搁崐椋庣矆娴ｉ潻鑰块梺顒€绉埀顒婄畵瀹曞ジ濡风€ｎ亝鍠樻鐐查叄閹稿﹥绔熼埞鍨姦闁哄本鐩獮鍥濞戞瑧浜梺鑽ゅ枑閻熻鲸淇婇崶顒€鐒垫い鎺嗗亾缂佺姴绉瑰畷鏇熸綇閳规儳浜炬慨妯煎帶濞呭秹鏌熼姘辩劯濠碘€崇埣瀹曨亝鎷呴悷鎵В闂備浇顕ч崙鐣岀礊閸℃稑绀堟繛鍡樺姉椤╃兘鏌熼悜姗嗘畷闁?Base 闂傚倸鍊峰ù鍥х暦閻㈢绐楅柟鎵閸嬶繝寮堕崼姘珔缂佽翰鍊曡灃闁挎繂鎳庨弳鐐烘煕?table_id闂傚倸鍊搁崐鐑芥倿閿旈敮鍋撶粭娑樻噽閻瑩鏌熸潏楣冩闁搞倖鍔栭妵鍕冀椤愵澀娌梺绋款儍閸斿秹濡甸崟顖氱疀闁告挷鑳堕弳鐘电磽娴ｆ彃浜鹃梺鍛婂姦閸犳鎮￠弴鐔虹闁瑰瓨绻傞懜瑙勵殽閻愯揪鑰块柡宀€鍠栭幃鍓т沪閸欘偁鍎崇槐鎺撴綇閵婏箑纾抽悗瑙勬礃鐢帡鍩ユ径濞炬瀻闊洦娲﹂弳锟犳⒒?
const tableIdCache = new Map<string, { tableId: string; expiresAt: number }>();
async function resolveTableIdByName(env: Env, tableName: string): Promise<string> {
  const appToken = optionalEnv(env, "FEISHU_BASE_APP_TOKEN");
  if (!appToken) throw new Error("FEISHU_BASE_APP_TOKEN is required to resolve table names");

  // 濠电姷鏁告慨鐑姐€傞挊澹╋綁宕ㄩ弶鎴狅紱闂侀€炲苯澧撮柡灞剧〒閳ь剨缍嗛崑鍛暦瀹€鍕厸鐎光偓鐎ｎ剛锛熸繛瀵稿婵″洭骞忛悩璇茬闁圭儤鍤╅幋鐘电＝闁稿本鐟ч崝宥夋煕閻愮數甯涘ǎ鍥э躬瀹曞爼顢楅埀顒勬倿閸偁浜滈柟鍝勭Х閸忓矂鏌嶉娑欑闁哄被鍔戝鎾Ω閵夈倗鏁栨繝?0 闂傚倸鍊搁崐椋庣矆娓氣偓楠炲鏁嶉崟顒佹闂佸湱鍎ら崵锕€鈽夊Ο閿嬫杸闁诲函缍嗘禍鐐侯敊閸ヮ剚鈷戦悷娆忓缁€鍐┿亜閺囧棗鎳夐崑鎾愁潩椤掑笑濡炪値鍙€濞夋洟骞戦崟顒傜懝妞ゆ牗鑹炬竟澶嬬節閻㈤潧浠滈柟鍐叉捣閹广垹顫滈埀顒€顕?
  const cached = tableIdCache.get(tableName);
  if (cached && cached.expiresAt > Date.now()) return cached.tableId;

  // 闂傚倸鍊搁崐椋庣矆娓氣偓楠炲鏁嶉崟顒佹濠德板€曢幊宀勫焵椤掆偓閸熸潙鐣烽妸鈺佺骇闁瑰瓨绻冮崕?Base 婵犵數濮烽弫鎼佸磻閻愬搫鍨傞柛顐ｆ礀缁犱即鏌熼梻瀵歌窗闁轰礁瀚伴弻娑㈠焺閸忊晜鍨甸埢宥夋偐绾版ê浜炬鐐茬仢閸旀碍銇勯敂璇茬仯闁逞屽墯閼归箖藝椤栫偐鈧妇鎹勯妸锕€纾梺鎯х箺椤危閳ь剟姊?
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
      cardDesc = "The future of city cargo. Steer-by-wire with flat-floor cargo optimization for 11m濠? volume.";
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

  setCached(cacheKey, data);
  return json(data);
}

export async function handleScheduledSync(env: Env): Promise<void> {
  console.log("[scheduled-sync] Running 10-minute Feishu background synchronization...");
  try {
    const fakeAdminSession: PortalSession = {
      userId: "system-cron",
      email: "cron@autoyj.local",
      role: "admin",
      accountType: "internal",
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
    // Pre-warm caches for admin and default roles
    const mockReq = new Request("https://autoyj.local/api/portal/catalog", {
      headers: { cookie: "youguard_portal=cron" },
    });
    await Promise.all([
      handleGetVehicleModels(mockReq, env).catch(() => null),
      handleGetVehicles(mockReq, env).catch(() => null),
    ]);
    console.log("[scheduled-sync] Feishu background synchronization completed successfully.");
  } catch (err) {
    console.error("[scheduled-sync] Background sync failed:", err);
  }
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
    if (path === "/api/portal/catalog" && request.method === "GET") {
      return await handleGetCatalog(request, env);
    }
    if (path === "/api/portal/vehicles" && request.method === "GET") {
      return await handleGetVehicles(request, env);
    }
    if (path === "/api/portal/vehicle-models" && request.method === "GET") {
      return await handleGetVehicleModels(request, env);
    }
    if (path === "/api/portal/inquiries" && request.method === "POST") {
      return await handleCreateInquiry(request, env);
    }
    const inquiryNoteMatch = path.match(/^\/api\/portal\/inquiries\/([^/]+)\/notes$/);
    if (inquiryNoteMatch && request.method === "POST") return await handleCreateInquiryNote(request, env, decodeURIComponent(inquiryNoteMatch[1]));
    const inquiryStatusMatch = path.match(/^\/api\/portal\/inquiries\/([^/]+)\/status$/);
    if (inquiryStatusMatch && request.method === "PATCH") return await handleUpdateInquiryStatus(request, env, decodeURIComponent(inquiryStatusMatch[1]));
    const inquiryContentMatch = path.match(/^\/api\/portal\/inquiry-content\/(inquiry|note)\/([^/]+)$/);
    if (inquiryContentMatch && request.method === "DELETE") return await handleDeleteInquiryContent(request, env, inquiryContentMatch[1] as "inquiry" | "note", decodeURIComponent(inquiryContentMatch[2]));
    if (path === "/api/portal/inquiry-content/deleted" && request.method === "GET") return await handleDeletedInquiryContent(request, env);
    if (inquiryContentMatch && request.method === "PATCH") return await handleModerateDeletedContent(request, env, inquiryContentMatch[1] as "inquiry" | "note", decodeURIComponent(inquiryContentMatch[2]));

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
