/// <reference types="@cloudflare/workers-types" />

import { findLocalUser } from "../../lib/users";
import type { AccountType, PortalRole, PriceTier } from "../../lib/users";
import {
  queryVehicleModels,
  queryVehicleTrims,
  queryVehicles,
} from "../db/d1";
import {
  canDeleteInquiry,
  canDeleteNote,
  canPublishPublicNote,
  canViewInquiry,
  canViewNote,
  hasUnreadFollowUp,
} from "../inquiries/visibility";
import {
  getPublicAcademyLesson,
  getPublicInsight,
  getPublicProduct,
  listPublicAcademy,
  listPublicInsights,
  listPublicProducts,
} from "../db/public-content";
import { normalizeProductSlug } from "../../lib/content-normalizers";
import {
  getVehicleGalleryImages,
  resolveSyncedGalleryImage,
} from "../../lib/static-assets";
import type { PortalEnv } from "../types";

export type Env = PortalEnv;
export type { AccountType, PortalRole, PriceTier } from "../../lib/users";

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
  model_id?: string;
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
  galleryImages?: PortalGalleryImage[];
  brochureUrl: string;
  sourceUrl: string;
  sourceName: string;
  lastSyncedAt: string;
  fullSpecsJson: string;
  status: string;
};

type PortalGalleryImage = {
  src: string;
  cat: string;
  label: string;
};

type PortalVehicleModelSpec = {
  id?: string;
  modelId: string;
  category?: string;
  name: string;
  value?: string;
  unit?: string;
  visibleLevel?: string;
  sortOrder?: number;
  sourceName?: string;
  sourceUrl?: string;
  confidence?: string;
  status?: string;
  displayPriceLow?: number;
  displayPriceHigh?: number;
  powertrainType?: string;
  cltcRangeKm?: number;
  batteryCapacityKwh?: number;
  motorPowerKw?: number;
  topSpeedKmh?: number;
  zeroTo100Sec?: number;
  specsJson?: string;
};

import { FEISHU_API } from "../jobs/feishu-sync";
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

function isResponseError(error: unknown): error is Response {
  if (error instanceof Response) return true;
  if (!error || typeof error !== "object") return false;
  const candidate = error as { status?: unknown; headers?: unknown; json?: unknown };
  return typeof candidate.status === "number"
    && typeof candidate.headers === "object"
    && typeof candidate.json === "function";
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

function normalizeBrochureUrl(value: unknown): string {
  const text = cleanUrl(value);
  if (!text || /[,;\r\n]/.test(text)) return "";

  try {
    const url = new URL(text);
    if (url.protocol !== "http:" && url.protocol !== "https:") return "";
    if (!url.pathname.toLowerCase().endsWith(".pdf")) return "";
    return url.toString();
  } catch {
    return "";
  }
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

function asBoolean(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  return ["1", "true", "yes", "on"].includes(asText(value).trim().toLowerCase());
}

function asOptionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  let target: unknown = value;
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

function rowField(row: Record<string, unknown>, key: string, ...aliases: string[]): unknown {
  for (const name of [key, ...aliases]) {
    const value = row[name];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
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
  const maxRetries = 3;
  try {
    const response = await fetch(`${apiBase}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(30000),
    });
    const data = (await response.json()) as { code?: number; msg?: string; data?: T };
    if (!response.ok || data.code !== 0) {
      const isRateLimited =
        response.status === 429 ||
        data.code === 99991400 ||
        data.code === 1254002 ||
        data.code === 10001 ||
        /limited|rate|frequency/i.test(data.msg || "");
      const isDataPreparing = /data\s+not\s+ready|try again later|temporarily unavailable/i.test(data.msg || "");
      const isTransient = isRateLimited || isDataPreparing || response.status === 408 || response.status >= 500;
      if (attempt < maxRetries && isTransient) {
        await delay(600 * Math.pow(2, attempt));
        return feishuRequest<T>(env, method, path, body, attempt + 1);
      }
      throw new Error(`Feishu API failed${data.code !== undefined ? ` (${data.code})` : ""}: ${data.msg || response.statusText}`);
    }
    return data.data as T;
  } catch (error) {
    const isAbort = error instanceof DOMException && (error.name === "AbortError" || error.name === "TimeoutError");
    const isNetworkError = error instanceof TypeError;
    if (attempt < maxRetries && (isAbort || isNetworkError)) {
      await delay(600 * Math.pow(2, attempt));
      return feishuRequest<T>(env, method, path, body, attempt + 1);
    }
    if (error instanceof Error) throw error;
    throw new Error(`Feishu API request failed: ${String(error)}`);
  }
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function searchRecords(
  env: Env,
  tableId: string,
  options: {
    filter?: Record<string, unknown>;
    sort?: unknown[];
    pageSize?: number;
    maxPages?: number;
    viewId?: string;
    requireConfig?: boolean;
  } = {},
) {
  const appToken = options.requireConfig
    ? asText(env.FEISHU_BASE_APP_TOKEN).trim()
    : optionalEnv(env, "FEISHU_BASE_APP_TOKEN");
  if (!appToken) {
    if (options.requireConfig) throw new Error("Missing FEISHU_BASE_APP_TOKEN for Feishu sync");
    return [];
  }
  if (options.requireConfig && !asText(tableId).trim()) {
    throw new Error("Missing Feishu table ID for Feishu sync");
  }
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
    if (!pageToken) {
      throw new Error(`Feishu pagination for ${tableId} reported more records without a page token`);
    }
    if (page === maxPages - 1) {
      throw new Error(`Feishu pagination for ${tableId} exceeded the ${maxPages}-page limit`);
    }
  }
  return records;
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
  const ids: string[] = [];
  for (const item of value) {
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      if (Array.isArray(record.record_ids)) {
        ids.push(...record.record_ids.map(String));
      } else if (record.id) {
        ids.push(String(record.id));
      } else if (record.record_id) {
        ids.push(String(record.record_id));
      }
    } else if (item) {
      ids.push(String(item));
    }
  }
  return ids.filter(Boolean);
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
    supplier: isInternalSession(session) ? (asText(fields["供应商"] ?? fields.supplier) || "合作车商/未归类") : null,
    supplierQuoteYear: isInternalSession(session) ? asText(fields["供应商报价年份"] ?? fields.supplier_quote_year) : null,
    supplierQuoteMonth: isInternalSession(session) ? asText(fields["供应商报价月份"] ?? fields.supplier_quote_month) : null,
    productionYear: isInternalSession(session) ? asText(fields["生产年份"] ?? fields.production_year) : null,
    productionMonth: isInternalSession(session) ? asText(fields["生产月份"] ?? fields.production_month) : null,
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
    guidePriceCny: asOptionalNumber(fields["人民币指导价"] ?? fields.guide_price_cny),
    mediaSourcePath: isInternalSession(session) ? asText(fields["素材源文件路径"] ?? fields.media_source_path) : null,
    experienceNotes: isInternalSession(session) ? asText(fields["经验"] ?? fields.experience_notes) : null,
    autoCorrectionNotes: isInternalSession(session) ? asText(fields["单行自动纠错"] ?? fields.auto_correction) : null,
    duplicateCheck: isInternalSession(session) ? asText(fields["重复数据检查"] ?? fields.duplicate_check) : null,
    recommendationSlot: isInternalSession(session) ? asText(fields["网站推荐位"] ?? fields.recommendation_slot) : null,
    syncBatchId: isInternalSession(session) ? asText(fields.sync_batch_id) : null,
    syncedAt: asText(fields.synced_at),
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

async function findLoginAccount(env: Env, email: string, accessCode: string): Promise<Omit<PortalSession, "exp"> | null> {
  if (!env.PORTAL_DB) throw problem("Portal database is not configured", 503);

  const user = await env.PORTAL_DB.prepare(`
    SELECT
      u.id, u.user_id, u.customer_id, u.name, u.email, u.company,
      u.account_type, u.role, u.price_tier, u.status,
      account.password
    FROM user AS u
    INNER JOIN account ON account.userId = u.id
    WHERE LOWER(u.email) = LOWER(?) AND account.providerId = 'credential'
    LIMIT 1
  `).bind(email).first<{
    id: string;
    user_id?: string | null;
    customer_id?: string | null;
    name?: string | null;
    email: string;
    company?: string | null;
    account_type?: string | null;
    role?: string | null;
    price_tier?: string | null;
    status?: string | null;
    password?: string | null;
  }>();

  if (!user || user.password !== accessCode) return null;
  if (user.status && user.status.toLowerCase() !== "active") {
    throw problem("This account is not active", 403);
  }

  return {
    userId: user.user_id || user.id,
    customerId: user.customer_id || user.id,
    name: user.name || user.email.split("@")[0],
    email: user.email,
    company: user.company || "",
    accountType: user.account_type === "internal" ? "internal" : "external",
    role: normalizeRole(user.role),
    priceTier: normalizePriceTier(user.price_tier),
  };
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
  requirePortalDb(env);

  const [modelsRes, vehiclesRes] = await Promise.all([
    handleGetVehicleModels(request, env)
      .then((r) => r.json() as Promise<{ vehicleModels?: PortalVehicleModel[]; vehicleModelSpecs?: PortalVehicleModelSpec[] }>),
    handleGetVehicles(request, env)
      .then((r) => r.json() as Promise<{ vehicles?: Record<string, unknown>[] }>),
  ]);
  const [inquiries, quotes, negotiations, orders] = await Promise.all([
    listScopedInquiries(env, session),
    listScopedQuotes(env, session),
    listScopedNegotiations(env, session),
    listScopedOrders(env, session),
  ]);
  const inquiryNumbers = new Set(inquiries.map((item) => item.inquiryNo));
  const [inquiryNotes, inquiryStatusHistory] = await Promise.all([
    listInquiryNotes(env, session, inquiries),
    listInquiryStatusHistory(env, [...inquiryNumbers]),
  ]);
  const inquiryNotesByNumber = new Map<string, ReturnType<typeof mapD1Note>[]>();
  for (const note of inquiryNotes) inquiryNotesByNumber.set(note.inquiryNo, [...(inquiryNotesByNumber.get(note.inquiryNo) || []), note]);
  const inquiriesWithUnread = inquiries.map((inquiry) => ({
    ...inquiry,
    hasUnreadFollowUps: inquiry.creatorUserId === session.userId && (inquiryNotesByNumber.get(inquiry.inquiryNo) || []).some((note) => hasUnreadFollowUp({
      creatorUserId: inquiry.creatorUserId,
      viewerUserId: session.userId,
      noteAuthorUserId: note.authorUserId,
      noteVisible: true,
      noteCreatedAt: note.createdAt,
      lastReadAt: inquiry.lastReadAt,
    })),
  }));

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
    inquiries: inquiriesWithUnread,
    quotes,
    negotiations,
    inquiryNotes,
    inquiryStatusHistory,
    orders,
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

  // Catalog data is always read from D1; an empty D1 snapshot is a valid empty catalog.
  const [modelsRes, vehiclesRes] = await Promise.all([
    handleGetVehicleModels(request, env).then(r => r.json() as Promise<{ vehicleModels?: PortalVehicleModel[]; vehicleModelSpecs?: PortalVehicleModelSpec[] }>),
    handleGetVehicles(request, env).then(r => r.json() as Promise<{ vehicles?: Record<string, unknown>[] }>),
  ]);

  return json({
    vehicleModels: modelsRes.vehicleModels || [],
    vehicleModelSpecs: modelsRes.vehicleModelSpecs || [],
    vehicles: vehiclesRes.vehicles || [],
  });
}

// ─── Cron-only: fetch Feishu and write to D1 ────────────────────────────────

// ─── Cron-only: fetch Feishu and write to D1 ────────────────────────────────

interface ColumnInfo {
  name: string;
  type: string;
  pk: number;
}

function getFeishuFieldValue(f: Record<string, any>, columnName: string) {
  // 1. Try exact match
  if (columnName in f) return f[columnName];
  
  // 2. Try formula/auto fields mapping
  if (`${columnName}_auto` in f) return f[`${columnName}_auto`];
  
  // 3. Try standard suffix / prefix conversions
  if (columnName === "display_price_low") return f.display_price_low ?? f.trim_price_display ?? f.display_price_low_auto;
  if (columnName === "display_price_high") return f.display_price_high ?? f.trim_price_display ?? f.display_price_high_auto;
  if (columnName === "cltc_range_km") return f.cltc_range_km ?? f.range_display ?? f.cltc_range_max_km_auto;
  if (columnName === "status") return f.status ?? f.source_status;
  if (columnName === "zero_to_100_sec" && "0_100_km_h_sec" in f) return f["0_100_km_h_sec"];
  if (columnName === "cltc_range_min_km" && "cltc_range_min_km_auto" in f) return f.cltc_range_min_km_auto;
  if (columnName === "cltc_range_max_km" && "cltc_range_max_km_auto" in f) return f.cltc_range_max_km_auto;
  if (columnName === "battery_capacity_min_kwh" && "battery_capacity_min_kwh_auto" in f) return f.battery_capacity_min_kwh_auto;
  if (columnName === "battery_capacity_max_kwh" && "battery_capacity_max_kwh_auto" in f) return f.battery_capacity_max_kwh_auto;
  if (columnName === "battery_capacity_kwh" && "battery_capacity_max_kwh_auto" in f) return f.battery_capacity_max_kwh_auto;
  if (columnName === "motor_power_min_kw" && "motor_power_min_kw_auto" in f) return f.motor_power_min_kw_auto;
  if (columnName === "motor_power_max_kw" && "motor_power_max_kw_auto" in f) return f.motor_power_max_kw_auto;
  if (columnName === "motor_power_kw" && "motor_power_max_kw_auto" in f) return f.motor_power_max_kw_auto;
  if (columnName === "top_speed_min_kmh" && "top_speed_min_kmh" in f) return f.top_speed_min_kmh;
  if (columnName === "top_speed_max_kmh" && "top_speed_max_kmh" in f) return f.top_speed_max_kmh;
  if (columnName === "top_speed_kmh" && "top_speed_max_kmh" in f) return f.top_speed_max_kmh;
  if (columnName === "drivetrain_display" && "drivetrain_display_auto" in f) return f.drivetrain_display_auto;
  if (columnName === "battery_chemistry" && "battery_chemistry_auto" in f) return f.battery_chemistry_auto;
  if (columnName === "trim_name") return f.trim_name ?? f.variant ?? f.trim ?? f["细分型号"];
  if (columnName === "specs_json") return f;
  if (columnName === "common_features_json" && "common_features_json_pruned" in f) return f.common_features_json_pruned;
  if (columnName === "gallery_images_json") return f.gallery_images_json ?? f.gallery_images_json_pruned;
  if (columnName === "i18n_translations" && "i18n_translations" in f) return f.i18n_translations;
  if (columnName === "brand" && "品牌" in f) return f["品牌"];
  if (columnName === "model" && "型号" in f) return f["型号"];
  if (columnName === "variant" && "细分型号" in f) return f["细分型号"];
  if (columnName === "steering" && "左右舵" in f) return f["左右舵"];
  if (columnName === "location") return f["批发地点"] ?? f["车源地点"];
  if (columnName === "supplier" && "供应商" in f) return f["供应商"];
  if (columnName === "min_order_quantity" && "起订数量" in f) return f["起订数量"];
  if (columnName === "inventory_count") return f["颜色库存"] ?? f["细分车型库存"] ?? f.color_stock_quantity ?? f.trim_stock_quantity;
  if (columnName === "wait_days" && "下单后需要等待天数" in f) return f["下单后需要等待天数"];
  if (columnName === "exw_usd") return f["EXW美金价"] ?? f.exw_usd;
  if (columnName === "fca_usd") return f["FCA美金价"] ?? f.fca_usd;
  if (columnName === "fob_usd") return f["FOB美金价"] ?? f.fob_usd;
  if (columnName === "guide_price_cny") return f["人民币指导价"] ?? f.guide_price_cny;
  if (columnName === "production_year") return f["生产年份"] ?? f.production_year;
  if (columnName === "production_month") return f["生产月份"] ?? f.production_month;
  if (columnName === "exterior_color") return f["外饰颜色"] ?? f.exterior_color;
  if (columnName === "interior_color") return f["内饰颜色"] ?? f.interior_color;
  if (columnName === "ai_confidence_score") return f["AI置信度"] ?? f.ai_confidence_score;
  if (columnName === "color") {
    return [asText(f["外饰颜色"] ?? f.exterior_color), asText(f["内饰颜色"] ?? f.interior_color)]
      .filter(Boolean)
      .join(" / ") || null;
  }

  return undefined;
}

function cleanFeishuFieldValue(val: any, fieldName?: string): any {
  if (val === null || val === undefined) return null;

  if (fieldName === "gallery_images_json" || fieldName === "gallery_images_json_pruned") {
    if (typeof val === "string") return val;
    if (Array.isArray(val) || typeof val === "object") return JSON.stringify(val);
  }

  // If primitive string, number, boolean
  if (typeof val === "number" || typeof val === "boolean") return val;
  if (typeof val === "string") return val;

  // If array
  if (Array.isArray(val)) {
    if (val.length === 0) return null;
    const extracted = val.map((item) => cleanFeishuFieldValue(item)).filter((v) => v !== null && v !== undefined && v !== "" && v !== "[object Object]");
    if (extracted.length === 0) return null;
    if (extracted.length === 1) return extracted[0];
    return extracted.join(", ");
  }

  // If object wrapper (Feishu link, lookup, person, or select object)
  if (typeof val === "object") {
    // 1. Check text_arr
    if (Array.isArray(val.text_arr) && val.text_arr.length > 0) {
      const arr = val.text_arr.filter(Boolean);
      if (arr.length === 1) return String(arr[0]);
      if (arr.length > 1) return arr.join(", ");
    }
    // 2. Check text
    if (val.text) {
      return String(val.text);
    }
    // 3. Check name (for Person/User fields)
    if (val.name) {
      return String(val.name);
    }
    // 4. Check label
    if (val.label) {
      return String(val.label);
    }
    // 5. Check value
    if (val.value) {
      return String(val.value);
    }
    // 6. Check record_ids
    if (Array.isArray(val.record_ids) && val.record_ids.length > 0) {
      const rids = val.record_ids.filter(Boolean);
      if (rids.length > 0) return rids.join(", ");
    }
    return null;
  }

  return String(val);
}

async function prepareDynamicUpserts(
  db: D1Database,
  tableName: string,
  records: FeishuRecord[],
  mapRecord: (record: FeishuRecord, index: number) => Record<string, any>,
): Promise<D1PreparedStatement[]> {
  if (!records.length) return [];

  // Map once before schema discovery so canonical fields are also created when
  // an older D1 table only contains the raw Feishu columns.
  const mappedRecords = records.map((record, index) => mapRecord(record, index));

  // 1. Discover all raw and canonical field keys in Feishu records
  const allFeishuKeys = new Set<string>();
  for (const r of records) {
    if (r.fields) {
      for (const k of Object.keys(r.fields)) {
        if (k && k !== "specs_json") {
          allFeishuKeys.add(k);
        }
      }
    }
  }
  for (const mappedRecord of mappedRecords) {
    for (const key of Object.keys(mappedRecord)) {
      if (key && key !== "specs_json") {
        allFeishuKeys.add(key);
      }
    }
  }

  // 2. Fetch existing database columns
  let info = await db.prepare(`PRAGMA table_info("${tableName}")`).all<ColumnInfo>();
  const existingCols = new Set(info.results.map(col => col.name));

  // 3. Dynamically add missing columns to SQLite table
  for (const key of allFeishuKeys) {
    if (!existingCols.has(key)) {
      try {
        await db.prepare(`ALTER TABLE "${tableName}" ADD COLUMN "${key}" TEXT`).run();
        existingCols.add(key);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!/duplicate column name|already exists/i.test(message)) {
          throw err;
        }
      }
    }
  }

  // Refresh column list after additions
  info = await db.prepare(`PRAGMA table_info("${tableName}")`).all<ColumnInfo>();
  const columns = info.results.map(col => ({ name: col.name, type: col.type, isPk: col.pk > 0 }));
  const pkCol = columns.find(c => c.isPk)?.name || "id";

  // 4. Build rows
  const now = new Date().toISOString();
  const rows = records.map((record, index) => {
    const customFields = mappedRecords[index];
    const f = record.fields || {};
    const row: Record<string, any> = {};

    for (const col of columns) {
      if (col.name === "synced_at") {
        row.synced_at = now;
        continue;
      }
      if (col.name === "specs_json") {
        row.specs_json = null;
        continue;
      }

      let val = customFields[col.name];
      if (val === undefined) {
        if (col.name in f) {
          val = f[col.name];
        } else {
          val = getFeishuFieldValue(f, col.name);
        }
      }

      val = cleanFeishuFieldValue(val, col.name);

      if (val === undefined || val === null) {
        row[col.name] = null;
      } else if (col.type === "INTEGER") {
        if (typeof val === "boolean") {
          row[col.name] = val ? 1 : 0;
        } else {
          const num = asOptionalNumber(val);
          row[col.name] = num === null ? null : Math.round(num);
        }
      } else if (col.type === "REAL") {
        row[col.name] = asOptionalNumber(val);
      } else {
        row[col.name] = val;
      }
    }
    return row;
  });

  // 5. Prepare SQL upserts; the caller places these after DELETE in one batch.
  const colNames = columns.map(c => `"${c.name}"`);
  const placeholders = columns.map(() => "?").join(",");
  const updateClauses = columns.filter(c => !c.isPk).map(c => `"${c.name}"=excluded."${c.name}"`).join(",");

  const sql = `
    INSERT INTO "${tableName}" (${colNames.join(",")})
    VALUES (${placeholders})
    ON CONFLICT("${pkCol}") DO UPDATE SET ${updateClauses}
  `;

  return rows.map((row) => db.prepare(sql).bind(...columns.map(c => row[c.name])));
}

async function batchStatements(
  db: D1Database,
  statements: D1PreparedStatement[],
  chunkSize = 100,
): Promise<void> {
  for (let i = 0; i < statements.length; i += chunkSize) {
    await db.batch(statements.slice(i, i + chunkSize));
  }
}

async function replaceDynamicTable(
  db: D1Database,
  tableName: string,
  records: FeishuRecord[],
  mapRecord: (record: FeishuRecord, index: number) => Record<string, any>,
) {
  const upserts = await prepareDynamicUpserts(db, tableName, records, mapRecord);
  await batchStatements(db, [db.prepare(`DELETE FROM "${tableName}"`), ...upserts]);
}

function syncTableId(env: Env, key: keyof Env): string {
  const token = asText(env.FEISHU_BASE_APP_TOKEN).trim();
  if (!token) throw new Error("Missing FEISHU_BASE_APP_TOKEN for Feishu sync");
  const tableId = asText(env[key]).trim();
  if (!tableId) throw new Error(`Missing ${String(key)} for Feishu sync`);
  return tableId;
}

function allowEmpty(env: Env, key: keyof Env): boolean {
  return asText(env[key]).trim().toLowerCase() === "true";
}

function validateSnapshot(
  source: string,
  records: FeishuRecord[],
  options: { allowEmpty?: boolean } = {},
) {
  if (!Array.isArray(records)) throw new Error(`${source}: Feishu response was not a record list`);
  if (records.length === 0 && !options.allowEmpty) {
    throw new Error(`${source}: empty Feishu snapshot rejected; existing D1 rows preserved`);
  }
  const ids = new Set<string>();
  records.forEach((record, index) => {
    const id = asText(record?.record_id).trim();
    if (!id) throw new Error(`${source}: record ${index + 1} is missing record_id`);
    if (ids.has(id)) throw new Error(`${source}: duplicate record_id ${id}`);
    ids.add(id);
    if (!record.fields || typeof record.fields !== "object" || Array.isArray(record.fields)) {
      throw new Error(`${source}: record ${id} has malformed fields`);
    }
  });
}

function validateUniqueValues(source: string, values: string[], label: string) {
  const seen = new Set<string>();
  for (const value of values) {
    if (!value) throw new Error(`${source}: ${label} is required`);
    if (seen.has(value)) throw new Error(`${source}: duplicate ${label} ${value}`);
    seen.add(value);
  }
}

function normalizeTrimModelId(value: unknown, knownModelIds: Set<string>): string {
  const modelId = asText(value).trim();
  if (!modelId) return "";
  if (knownModelIds.has(modelId)) return modelId;

  const duplicateMarker = modelId.match(/^DUPLICATE:(.+)$/i);
  const canonicalId = duplicateMarker?.[1]?.trim();
  if (canonicalId && knownModelIds.has(canonicalId)) return canonicalId;

  return modelId;
}

export async function syncVehiclesToD1(env: Env): Promise<{ synced: number }> {
  const db = env.PORTAL_DB;
  if (!db) throw new Error("Missing PORTAL_DB for vehicles sync");
  const vehicleSourceTableId = syncTableId(env, "FEISHU_TABLE_VEHICLES");
  const rawRecords = await searchRecords(env, vehicleSourceTableId, {
    pageSize: 500,
    maxPages: 50,
    requireConfig: true,
  });
  validateSnapshot("vehicles", rawRecords);
  validateUniqueValues("vehicles", rawRecords.map((record) => asText(record.record_id).trim()), "record_id");

  await replaceDynamicTable(db, "vehicles", rawRecords, (record) => {
    const f = record.fields;
    const stage = parseSourceStage(f);
    const fobUsd = asOptionalNumber(f["FOB美金价"]) ??
      asOptionalNumber(f.fob_usd) ??
      asOptionalNumber(f["网站显示美金最低价"]) ??
      asOptionalNumber(f.display_price_low);
    const exwUsd = asOptionalNumber(f["EXW美金价"]) ?? asOptionalNumber(f.exw_usd);
    const fcaUsd = asOptionalNumber(f["FCA美金价"]) ?? asOptionalNumber(f.fca_usd);
    return {
      id: record.record_id,
      display_price_low: fobUsd ?? null,
      display_price_high: fobUsd ?? null,
      exw_usd: exwUsd,
      fca_usd: fcaUsd,
      fob_usd: fobUsd,
      currency: "USD",
      stage,
    };
  });
  return { synced: rawRecords.length };
}

export async function syncUsersToD1(env: Env): Promise<{ users: number }> {
  const db = env.PORTAL_DB;
  if (!db) throw new Error("Missing PORTAL_DB for users sync");
  const { localUserStore } = await import("../../lib/users");

  const userRecords = localUserStore.map((u) => ({
    id: u.userId,
    name: u.name,
    email: u.email,
    emailVerified: 1,
    image: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    user_id: u.userId,
    customer_id: u.customerId,
    company: u.company,
    account_type: u.accountType,
    role: u.role,
    price_tier: u.priceTier,
    status: u.status,
    accessCode: u.accessCode,
  }));

  if (!userRecords.length) throw new Error("users: empty source snapshot rejected; existing D1 rows preserved");
  validateUniqueValues("users", userRecords.map((user) => user.id.trim()), "id");
  validateUniqueValues("users", userRecords.map((user) => user.email.trim().toLowerCase()), "email");
  for (const user of userRecords) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(user.email.trim())) {
      throw new Error(`users: invalid email for ${user.id}`);
    }
    if (!user.accessCode.trim()) throw new Error(`users: missing password source for ${user.id}`);
  }
  const { upsertUsersToD1 } = await import("../db/d1");
  await upsertUsersToD1(db, userRecords);
  return { users: userRecords.length };
}

export async function syncArticlesToD1(env: Env): Promise<{ articles: number }> {
  const db = env.PORTAL_DB;
  if (!db) throw new Error("Missing PORTAL_DB for articles sync");
  const articlesTableId = syncTableId(env, "FEISHU_TABLE_ARTICLES");
  const records = await searchRecords(env, articlesTableId, {
    pageSize: 100,
    maxPages: 50,
    requireConfig: true,
  });
  validateSnapshot("articles", records, { allowEmpty: allowEmpty(env, "FEISHU_ALLOW_EMPTY_ARTICLES") });
  const slugs = records.map((record) => asText(record.fields.slug).trim() || asText(record.record_id).trim());
  validateUniqueValues("articles", slugs, "slug");
  let count = 0;
  const upserts = await prepareDynamicUpserts(db, "articles", records, (record, index) => {
    const f = record.fields;
    const coverImageFullPath = asText(f.cover_image);
    const coverImage = coverImageFullPath.split("/").pop() || "hero.webp";
    count++;
    return {
      id: record.record_id,
      slug: asText(f.slug) || record.record_id,
      title: asText(f.title),
      category: asText(f.category),
      date: asText(f.publish_date) || asText(f.date),
      read_time: asText(f.read_time),
      cover_image: coverImage,
      overview: asText(f.overview),
      content: asText(f.content),
      status: asText(f.status) || "Published",
      sort_order: index + 1,
    };
  });
  await batchStatements(db, [db.prepare('DELETE FROM "articles"'), ...upserts]);
  return { articles: count };
}

export async function syncAcademyToD1(env: Env): Promise<{ lessons: number; vault: number }> {
  const db = env.PORTAL_DB;
  if (!db) throw new Error("Missing PORTAL_DB for academy sync");
  const lessonsTableId = syncTableId(env, "FEISHU_TABLE_ACADEMY_LESSONS");
  const vaultTableId = syncTableId(env, "FEISHU_TABLE_ACADEMY_VAULT");

  const [lessonsRecords, vaultRecords] = await Promise.all([
    searchRecords(env, lessonsTableId, { pageSize: 100, requireConfig: true }),
    searchRecords(env, vaultTableId, { pageSize: 100, requireConfig: true }),
  ]);

  const academyAllowsEmpty = allowEmpty(env, "FEISHU_ALLOW_EMPTY_ACADEMY");
  validateSnapshot("academy lessons", lessonsRecords, { allowEmpty: academyAllowsEmpty });
  validateSnapshot("academy vault", vaultRecords, { allowEmpty: academyAllowsEmpty });
  validateUniqueValues("academy lessons", lessonsRecords.map((record) => asText(record.fields.slug).trim() || asText(record.record_id).trim()), "slug");
  validateUniqueValues("academy vault", vaultRecords.map((record) => asText(record.record_id).trim()), "record_id");

  let lessonsCount = 0;
  let vaultCount = 0;

  const [lessonUpserts, vaultUpserts] = await Promise.all([
    prepareDynamicUpserts(db, "academy_lessons", lessonsRecords, (record, index) => {
      const f = record.fields;
      lessonsCount++;
      return {
        id: record.record_id,
        slug: asText(f.slug) || record.record_id,
        title: asText(f.title),
        category: asText(f.category),
        tag: asText(f.tag),
        description: asText(f.description),
        level: asText(f.level),
        duration: asText(f.duration),
        date: asText(f.date),
        content: asText(f.content),
        sort_order: index + 1,
      };
    }),
    prepareDynamicUpserts(db, "academy_vault", vaultRecords, (record, index) => {
      const f = record.fields;
      vaultCount++;
      return {
        id: record.record_id,
        title: asText(f.title),
        type: asText(f.type),
        description: asText(f.description),
        file_size: asText(f.file_size),
        format: asText(f.format),
        download_url: asText(f.download_url),
        category: asText(f.category),
        sort_order: index + 1,
      };
    }),
  ]);
  await batchStatements(db, [
    db.prepare('DELETE FROM "academy_lessons"'),
    db.prepare('DELETE FROM "academy_vault"'),
    ...lessonUpserts,
    ...vaultUpserts,
  ]);

  return { lessons: lessonsCount, vault: vaultCount };
}


export async function syncVehicleModelsToDB(env: Env): Promise<{ models: number; trims: number }> {
  const db = env.PORTAL_DB;
  if (!db) throw new Error("Missing PORTAL_DB for vehicle models sync");
  const vehicleModelTableId = syncTableId(env, "FEISHU_TABLE_VEHICLE_MODELS");
  const vehicleVariantTableId = syncTableId(env, "FEISHU_TABLE_VEHICLE_TRIM_CONFIGURATIONS");

  const [modelRecords, trimRecords] = await Promise.all([
    searchRecords(env, vehicleModelTableId, { pageSize: 500, maxPages: 50, requireConfig: true }),
    searchRecords(env, vehicleVariantTableId, {
      pageSize: 500,
      maxPages: 50,
      viewId: asText(env.FEISHU_VIEW_VEHICLE_TRIM_CONFIGURATIONS).trim() || undefined,
      requireConfig: true,
    }),
  ]);
  validateSnapshot("vehicle models", modelRecords);
  validateSnapshot("vehicle trims", trimRecords);
  const modelIds = modelRecords.map((record) => asText(record.fields.model_id).trim() || asText(record.record_id).trim());
  validateUniqueValues("vehicle models", modelIds, "model_id");
  validateUniqueValues(
    "vehicle trims",
    trimRecords.map((record) => asText(record.fields.trim_config_id).trim() || asText(record.record_id).trim()),
    "trim_config_id",
  );

  const modelIdByRecordId = new Map<string, string>();
  const modelRecordsByRecordId = new Map<string, FeishuRecord>();
  for (const [index, record] of modelRecords.entries()) {
    const modelId = modelIds[index];
    modelIdByRecordId.set(record.record_id, modelId);
    modelRecordsByRecordId.set(record.record_id, record);
  }
  const knownModelIds = new Set(modelIds);
  const modelRecordIdByModelId = new Map(modelIds.map((modelId, index) => [modelId, modelRecords[index].record_id]));

  const resolveTrimModelId = (record: FeishuRecord) => {
    const fields = record.fields;
    const linkedModelId = linkedRecordIds(fields.vehicle_model_pruned)
      .map((recordId) => modelIdByRecordId.get(recordId))
      .find(Boolean);
    const sourceModelId = normalizeTrimModelId(fields.model_id, knownModelIds);
    return knownModelIds.has(sourceModelId) ? sourceModelId : linkedModelId || sourceModelId;
  };

  const trimModelIds = trimRecords.map(resolveTrimModelId);
  for (const modelId of trimModelIds) {
    if (!modelId || !modelIds.includes(modelId)) {
      throw new Error(`vehicle trims: model_id ${modelId || "(missing)"} does not match a model snapshot`);
    }
  }

  const [modelUpserts, trimUpserts] = await Promise.all([
    prepareDynamicUpserts(db, "vehicle_models", modelRecords, (record) => {
      const f = record.fields;
      const modelId = asText(f.model_id).trim() || asText(record.record_id).trim();
      return {
        id: modelId,
        model_id: modelId,
        product_path: productPath(f),
        gallery_images_json: cleanFeishuFieldValue(
          f.gallery_images_json ?? f.gallery_images_json_pruned,
          "gallery_images_json",
        ),
      };
    }),
    prepareDynamicUpserts(db, "vehicle_trims", trimRecords, (record) => {
      const f = record.fields;
      const modelId = resolveTrimModelId(record);
      const trimId = asText(f.trim_config_id).trim() || record.record_id;
      const parentRecordId =
        linkedRecordIds(f.vehicle_model_pruned)[0] ||
        modelRecordIdByModelId.get(modelId) ||
        null;
      const parentModel = parentRecordId ? modelRecordsByRecordId.get(parentRecordId) : null;
      const p = parentModel?.fields || {};
      const trimName = asText(f.trim_name) || asText(f.variant) || asText(f.trim) || asText(f["细分型号"]) || null;
      const displayPrice = asOptionalNumber(f.display_price_low ?? f.trim_price_display);
      const range = asOptionalNumber(f.cltc_range_km ?? f.range_display) ??
        asOptionalNumber(p.cltc_range_max_km) ??
        asOptionalNumber(p.cltc_range_max_km_auto);
      const batteryCapacity = asOptionalNumber(f.battery_capacity_kwh) ??
        asOptionalNumber(p.battery_capacity_max_kwh) ??
        asOptionalNumber(p.battery_capacity_max_kwh_auto);
      const motorPower = asOptionalNumber(f.motor_power_kw) ??
        asOptionalNumber(p.motor_power_max_kw) ??
        asOptionalNumber(p.motor_power_max_kw_auto);
      const topSpeed = asOptionalNumber(f.top_speed_kmh ?? f.top_speed_max_kmh) ??
        asOptionalNumber(p.top_speed_max_kmh);
      const zeroTo100 = asOptionalNumber(f.zero_to_100_sec ?? f["0_100_km_h_sec"]) ??
        asOptionalNumber(p["0_100_km_h_sec"]);
      return {
        id: trimId,
        trim_config_id: trimId,
        model_id: modelId,
        parent_model_record_id: parentRecordId ?? null,
        trim_name: trimName,
        status: asText(f.status) || asText(f.source_status) || null,
        display_price_low: displayPrice,
        display_price_high: asOptionalNumber(f.display_price_high) ?? displayPrice,
        powertrain_type: asText(f.powertrain_type) || asText(p.powertrain_type) || null,
        cltc_range_km: range,
        battery_capacity_kwh: batteryCapacity,
        motor_power_kw: motorPower,
        top_speed_kmh: topSpeed,
        zero_to_100_sec: zeroTo100,
        battery_chemistry: asText(f.battery_chemistry) || asText(p.battery_chemistry) || null,
        dc_fast_charge_supported: asOptionalNumber(f.dc_fast_charge_supported),
        dc_fast_charge_time_hours: asOptionalNumber(f.dc_fast_charge_time_hours),
        dc_fast_charge_min_percent: asOptionalNumber(f.dc_fast_charge_min_percent),
        dc_fast_charge_max_percent: asOptionalNumber(f.dc_fast_charge_max_percent),
        motor_torque_n_m: asOptionalNumber(f.motor_torque_n_m),
        drivetrain_display: asText(f.drivetrain_display) || asText(p.drivetrain_display) || null,
        trim_order: asOptionalNumber(f.trim_order),
        recommended: asOptionalNumber(f.recommended),
        added_features_json: asText(f.added_features_json) || null,
        upgraded_features_json: asText(f.upgraded_features_json) || null,
        base_spec_summary_json: asText(f.base_spec_summary_json) || null,
      };
    }),
  ]);
  await db.batch([
    db.prepare('DELETE FROM "vehicle_models"'),
    db.prepare('DELETE FROM "vehicle_trims"'),
    ...modelUpserts,
    ...trimUpserts,
  ]);

  return { models: modelRecords.length, trims: trimRecords.length };
}

// ─── API handlers: read ONLY from D1, zero Feishu calls ─────────────────────

async function handleGetVehicles(request: Request, env: Env) {
  const session = await requireSession(request, env);
  const rows = await queryVehicles(requirePortalDb(env));
  const canSeePrice = canSeePortalPrice(session);
  const internalSession = isInternalSession(session);

  const vehicles = rows.map((row) => {
    const fields = row as unknown as Record<string, unknown>;
    const externalAccount = session.role === "partner" || session.role === "customer";
    const internalFobUsd = asOptionalNumber(rowField(fields, "fob_usd", "FOB美金价"));
    const customerFobUsd = asOptionalNumber(rowField(fields, "customer_fob_usd", "customerFOB美金报价（自动计算）")) ??
      asOptionalNumber(fields["customerFOB美金报价（自动计算）"]);
    const partnerFobUsd = asOptionalNumber(rowField(fields, "partner_fob_usd", "partnerFOB美金报价（自动计算）")) ??
      asOptionalNumber(fields["partnerFOB美金报价（自动计算）"]);
    const displayPriceLow = asOptionalNumber(rowField(fields, "display_price_low"));
    const fobUsd = externalAccount ? customerFobUsd ?? displayPriceLow : internalFobUsd ?? displayPriceLow;
    const exwUsd = externalAccount ? null : asOptionalNumber(rowField(fields, "exw_usd", "EXW美金价"));
    const fcaUsd = externalAccount ? null : asOptionalNumber(rowField(fields, "fca_usd", "FCA美金价"));
    const priceTermsList: { term: string; amount: number }[] = [];
    if (canSeePrice && fobUsd != null) priceTermsList.push({ term: "FOB", amount: fobUsd });
    if (canSeePrice && !externalAccount && exwUsd != null) priceTermsList.push({ term: "EXW", amount: exwUsd });
    if (canSeePrice && !externalAccount && fcaUsd != null) priceTermsList.push({ term: "FCA", amount: fcaUsd });

    return {
      id: row.id,
      modelId: asText(rowField(fields, "model_id")),
      variantId: asText(rowField(fields, "variant_id", "trim_id")),
      syncBatchId: internalSession ? asText(rowField(fields, "sync_batch_id")) : null,
      brand: asText(rowField(fields, "brand", "品牌")),
      model: asText(rowField(fields, "model", "型号")),
      trim: asText(rowField(fields, "variant", "细分型号")),
      supplier: internalSession ? asText(rowField(fields, "supplier", "供应商")) : null,
      supplierQuoteYear: internalSession ? asText(rowField(fields, "supplier_quote_year", "供应商报价年份")) : null,
      supplierQuoteMonth: internalSession ? asText(rowField(fields, "supplier_quote_month", "供应商报价月份")) : null,
      productionYear: internalSession ? asText(rowField(fields, "production_year", "生产年份")) : null,
      productionMonth: internalSession ? asText(rowField(fields, "production_month", "生产月份")) : null,
      steering: asText(rowField(fields, "steering", "左右舵")),
      marketVersion: asText(rowField(fields, "market_version", "国际国内版本（多选）")),
      location: asText(rowField(fields, "location", "批发地点", "车源地点")),
      stage: asText(rowField(fields, "stage", "审核api用字段")),
      price: canSeePrice ? fobUsd : null,
      partnerPrice: partnerFobUsd ?? customerFobUsd,
      customerPrice: customerFobUsd,
      cost: internalSession ? asOptionalNumber(rowField(fields, "supplier_price_cny", "人民币成本价")) : null,
      guidePriceCny: asOptionalNumber(rowField(fields, "guide_price_cny", "人民币指导价")),
      exwUsd: canSeePrice ? exwUsd : null,
      fcaUsd: canSeePrice ? fcaUsd : null,
      fobUsd: canSeePrice ? fobUsd : null,
      currency: asText(rowField(fields, "currency")) || "USD",
      minOrderQuantity: asOptionalNumber(rowField(fields, "min_order_quantity", "起订数量")),
      fullOrderQuantity: asOptionalNumber(rowField(fields, "full_order_quantity", "满订数量")),
      stockQuantity: asOptionalNumber(rowField(fields, "inventory_count", "颜色库存")) ?? 0,
      colorStockQuantity: asOptionalNumber(rowField(fields, "inventory_count", "颜色库存")),
      waitDays: asOptionalNumber(rowField(fields, "wait_days", "下单后需要等待天数")),
      powertrain_type: asText(rowField(fields, "powertrain_type")),
      color: asText(rowField(fields, "color", "外饰颜色")),
      exteriorColor: asText(rowField(fields, "exterior_color", "外饰颜色")),
      interiorColor: asText(rowField(fields, "interior_color", "内饰颜色")),
      reviewer: internalSession ? asText(rowField(fields, "reviewer", "审核人")) : null,
      developer: internalSession ? asText(rowField(fields, "developer", "开发者")) : null,
      publicNotes: asText(rowField(fields, "notes", "备注")),
      mediaSourcePath: internalSession ? asText(rowField(fields, "media_source_path", "素材源文件路径")) : null,
      experienceNotes: internalSession ? asText(rowField(fields, "experience_notes", "经验")) : null,
      autoCorrectionNotes: internalSession ? asText(rowField(fields, "auto_correction", "单行自动纠错")) : null,
      duplicateCheck: internalSession ? asText(rowField(fields, "duplicate_check", "重复数据检查")) : null,
      recommendationSlot: internalSession ? asText(rowField(fields, "recommendation_slot", "网站推荐位")) : null,
      aiConfidence: asOptionalNumber(rowField(fields, "ai_confidence_score", "AI置信度")),
      priceTermsList,
      isApproved: true,
      canSeePrice,
      syncedAt: asText(rowField(fields, "synced_at")),
      rawFields: internalSession ? fields : null,
    };
  });
  return json({ vehicles });
}

function normalizeTrimName(value: unknown) {
  return asText(value).replace(/\s+/g, " ").trim();
}

function inventoryVariantId(modelId: string, trimName: string) {
  return `${modelId}::inventory:${encodeURIComponent(trimName)}`;
}

function mapD1VehicleTrimVariant(
  parent: PortalVehicleModel,
  row: Record<string, unknown>,
  id: string,
  sourceName: string,
) {
  const trimName = normalizeTrimName(rowField(row, "trim_name", "variant", "trim", "细分型号"));
  if (!trimName) return null;
  const guidePrice = asOptionalNumber(rowField(row, "guide_price_cny", "人民币指导价"));
  const powertrain = asText(rowField(row, "powertrain_type", "能源类型", "动力类型"));
  const year = asText(rowField(row, "model_year", "year", "生产年份"));
  return {
    ...parent,
    id,
    trim: trimName,
    year: year || parent.year,
    fuelType: powertrain,
    msrpChina: guidePrice !== null ? `¥${formatNumber(guidePrice)}` : parent.msrpChina,
    sourceName,
    lastSyncedAt: asText(rowField(row, "synced_at", "last_verified_at")) || parent.lastSyncedAt,
    fullSpecsJson: "",
  };
}

type VehicleModelLookup = {
  exact: Map<string, PortalVehicleModel>;
  normalized: Map<string, PortalVehicleModel>;
};

function normalizeModelRelation(value: unknown): string {
  return asText(value).trim().toLocaleLowerCase().replace(/[^a-z0-9]+/g, "");
}

function addModelLookupKey(lookup: VehicleModelLookup, value: unknown, model: PortalVehicleModel) {
  const exactKey = asText(value).trim();
  if (!exactKey) return;
  if (!lookup.exact.has(exactKey)) lookup.exact.set(exactKey, model);

  const normalizedKey = normalizeModelRelation(exactKey);
  if (normalizedKey && !lookup.normalized.has(normalizedKey)) {
    lookup.normalized.set(normalizedKey, model);
  }
}

function buildVehicleModelLookup(models: PortalVehicleModel[]): VehicleModelLookup {
  const lookup: VehicleModelLookup = {
    exact: new Map(),
    normalized: new Map(),
  };

  for (const model of models) {
    const fields = model as unknown as Record<string, unknown>;
    addModelLookupKey(lookup, model.id, model);
    addModelLookupKey(lookup, fields.model_id, model);
    addModelLookupKey(lookup, fields.record_id, model);
    addModelLookupKey(lookup, [model.brand, model.model].filter(Boolean).join(" "), model);
  }

  return lookup;
}

function resolveVehicleModel(
  lookup: VehicleModelLookup,
  row: Record<string, unknown>,
): PortalVehicleModel | null {
  const relationValues = [
    rowField(row, "model_id"),
    rowField(row, "parent_model_record_id"),
    rowField(row, "record_id"),
    [rowField(row, "brand", "品牌"), rowField(row, "model", "MODEL", "型号")].filter(Boolean).join(" "),
  ];

  for (const value of relationValues) {
    const exactKey = asText(value).trim();
    if (exactKey) {
      const exactModel = lookup.exact.get(exactKey);
      if (exactModel) return exactModel;
    }
  }

  for (const value of relationValues) {
    const normalizedKey = normalizeModelRelation(value);
    if (normalizedKey) {
      const normalizedModel = lookup.normalized.get(normalizedKey);
      if (normalizedModel) return normalizedModel;
    }
  }

  return null;
}

function buildInventoryTrimVariants(
  parent: PortalVehicleModel,
  rows: Record<string, unknown>[],
) {
  const variants: PortalVehicleModel[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    const trimName = normalizeTrimName(rowField(row, "variant", "trim", "trim_name", "细分型号"));
    if (!trimName) continue;
    const key = trimName.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const variant = mapD1VehicleTrimVariant(parent, row, inventoryVariantId(parent.id, trimName), "D1 · vehicles");
    if (variant) variants.push(variant);
  }
  return variants;
}

function syncedGalleryImages(rawGallery: unknown): PortalGalleryImage[] {
  const parsed = typeof rawGallery === "string" ? safeJsonParse(rawGallery, []) : rawGallery;
  if (!Array.isArray(parsed)) return [];

  return parsed.flatMap((entry, index) => {
    const fields = typeof entry === "object" && entry !== null ? entry as Record<string, unknown> : {};
    const source = typeof entry === "string"
      ? entry
      : fields.src ?? fields.image ?? fields.url ?? fields.image_url;
    const image = resolveSyncedGalleryImage(typeof source === "string" ? source : null);
    if (!image) return [];

    return [{
      src: image,
      cat: asText(fields.cat ?? fields.category) || "Exterior",
      label: asText(fields.label) || `Gallery ${index + 1}`,
    }];
  });
}

function dashboardVehicleModelGallery(row: Record<string, unknown>, slug: string): PortalGalleryImage[] {
  const directImage = resolveSyncedGalleryImage(asText(row.image_url));
  const baseline = getVehicleGalleryImages(slug, directImage);
  const synced = syncedGalleryImages(rowField(row, "gallery_images_json", "gallery_images_json_pruned"));
  const seen = new Set<string>();
  const gallery = [...baseline, ...synced].filter((image) => {
    if (seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });

  const hasSpecificImage = gallery.some((image) => image.src !== "/pic/hero/0.webp");
  return hasSpecificImage
    ? gallery.filter((image) => image.src !== "/pic/hero/0.webp")
    : [];
}

function dashboardVehicleModelImage(row: Record<string, unknown>, slug: string): string {
  return dashboardVehicleModelGallery(row, slug)[0]?.src
    ?? "";
}

async function handleGetVehicleModels(request: Request, env: Env) {
  const session = await requireSession(request, env);
  const [modelRows, trimRows, vehicleRows] = await Promise.all([
    queryVehicleModels(requirePortalDb(env)),
    queryVehicleTrims(requirePortalDb(env)),
    queryVehicles(requirePortalDb(env)),
  ]);
  const baseModels: PortalVehicleModel[] = modelRows.map((row) => ({
    id: row.id,
    model_id: row.model_id ?? "",
    brand: asText(rowField(row as unknown as Record<string, unknown>, "brand", "品牌")),
    model: asText(rowField(row as unknown as Record<string, unknown>, "model", "MODEL", "型号")),
    trim: "",
    year: asText(rowField(row as unknown as Record<string, unknown>, "model_year")),
    bodyType: asText(rowField(row as unknown as Record<string, unknown>, "vehicle_class", "segment")),
    fuelType: asText(rowField(row as unknown as Record<string, unknown>, "powertrain_type")),
    msrpChina: row.display_price_low != null ? `¥${formatNumber(row.display_price_low)}` : "",
    battery: asText(rowField(row as unknown as Record<string, unknown>, "battery_capacity_max_kwh", "battery_capacity_max_kwh_auto"))
      ? `${asText(rowField(row as unknown as Record<string, unknown>, "battery_capacity_max_kwh", "battery_capacity_max_kwh_auto"))} kWh`
      : "",
    batteryType: asText(rowField(row as unknown as Record<string, unknown>, "battery_chemistry", "battery_chemistry_auto")),
    batteryMaker: "",
    range: asText(rowField(row as unknown as Record<string, unknown>, "cltc_range_max_km", "cltc_range_max_km_auto"))
      ? `${asText(rowField(row as unknown as Record<string, unknown>, "cltc_range_max_km", "cltc_range_max_km_auto"))} km (CLTC)`
      : "",
    energyConsumption: "",
    motorPower: asText(rowField(row as unknown as Record<string, unknown>, "motor_power_max_kw", "motor_power_max_kw_auto"))
      ? `${asText(rowField(row as unknown as Record<string, unknown>, "motor_power_max_kw", "motor_power_max_kw_auto"))} kW`
      : "",
    motorTorque: "",
    driveType: asText(rowField(row as unknown as Record<string, unknown>, "drivetrain_display", "drivetrain_display_auto")),
    topSpeed: asText(rowField(row as unknown as Record<string, unknown>, "top_speed_max_kmh", "top_speed_max_kmh_auto"))
      ? `${asText(rowField(row as unknown as Record<string, unknown>, "top_speed_max_kmh", "top_speed_max_kmh_auto"))} km/h`
      : "",
    acceleration: asText(rowField(row as unknown as Record<string, unknown>, "zero_to_100_sec", "0_100_km_h_sec"))
      ? `${asText(rowField(row as unknown as Record<string, unknown>, "zero_to_100_sec", "0_100_km_h_sec"))} sec`
      : "",
    seats: row.seats_max != null ? `${row.seats_max} seats` : "",
    doors: "",
    dimensions: [row.length_mm, row.width_mm, row.height_mm].every((v) => v != null)
      ? `${row.length_mm} x ${row.width_mm} x ${row.height_mm} mm` : "",
    wheelbase: row.wheelbase_mm != null ? `${row.wheelbase_mm} mm` : "",
    curbWeight: "",
    trunkCapacity: row.boot_volume_l != null ? `${row.boot_volume_l} L` : "",
    charging: row.charging ?? "",
    frontSuspension: "",
    rearSuspension: "",
    adas: "",
    marketPosition: asText(row.page_subtitle) || asText(row.version),
    exportNotes: "",
    galleryImages: dashboardVehicleModelGallery(
      row as unknown as Record<string, unknown>,
      normalizeProductSlug(
        row.product_path ||
        row.model_id ||
        [row.brand, row.model || (row as unknown as Record<string, unknown>).MODEL].filter(Boolean).join("-"),
      ),
    ),
    imageUrl: dashboardVehicleModelImage(
      row as unknown as Record<string, unknown>,
      normalizeProductSlug(
        row.product_path ||
        row.model_id ||
        [row.brand, row.model || (row as unknown as Record<string, unknown>).MODEL].filter(Boolean).join("-"),
      ),
    ),
    brochureUrl: normalizeBrochureUrl(row.brochure_cover),
    sourceUrl: row.product_path ?? "",
    sourceName: "",
    lastSyncedAt: asText(row.synced_at || (row as unknown as Record<string, unknown>).last_synced_at),
    fullSpecsJson: "",
    status: row.status ?? "Active",
  }));

  const modelLookup = buildVehicleModelLookup(baseModels);

  const trimVariantsByModelId = new Map<string, PortalVehicleModel[]>();
  for (const trim of trimRows) {
    const fields = trim as unknown as Record<string, unknown>;
    const parent = resolveVehicleModel(modelLookup, fields);
    if (!parent) continue;
    const variant = mapD1VehicleTrimVariant(parent, fields, trim.id, "D1 · vehicle_trims");
    if (!variant) continue;
    const variants = trimVariantsByModelId.get(parent.id) || [];
    variants.push(variant);
    trimVariantsByModelId.set(parent.id, variants);
  }

  const inventoryRowsByModelId = new Map<string, Record<string, unknown>[]>();
  for (const row of vehicleRows) {
    const fields = row as unknown as Record<string, unknown>;
    const parent = resolveVehicleModel(modelLookup, fields);
    if (!parent) continue;
    const rows = inventoryRowsByModelId.get(parent.id) || [];
    rows.push(fields);
    inventoryRowsByModelId.set(parent.id, rows);
  }

  const vehicleModels: PortalVehicleModel[] = [];
  const vehicleModelSpecs: PortalVehicleModelSpec[] = [];
  for (const parent of baseModels) {
    const configuredVariants = trimVariantsByModelId.get(parent.id) || [];
    const inventoryVariants = buildInventoryTrimVariants(parent, inventoryRowsByModelId.get(parent.id) || []);
    const variants = configuredVariants.length ? configuredVariants : inventoryVariants;
    if (variants.length) {
      vehicleModels.push(...variants);
    } else {
      vehicleModels.push(parent);
    }
  }

  for (const trim of trimRows) {
    const fields = trim as unknown as Record<string, unknown>;
    const parent = resolveVehicleModel(modelLookup, fields);
    const name = normalizeTrimName(rowField(fields, "trim_name", "variant", "trim"));
    if (!parent || !name) continue;
    const variantId = trim.id;
    vehicleModelSpecs.push({
      id: variantId,
      modelId: variantId,
      name,
      status: asText(rowField(fields, "status", "source_status")),
      displayPriceLow: trim.display_price_low ?? asOptionalNumber(rowField(fields, "trim_price_display")) ?? undefined,
      displayPriceHigh: trim.display_price_high ?? undefined,
      powertrainType: trim.powertrain_type ?? undefined,
      cltcRangeKm: trim.cltc_range_km ?? asOptionalNumber(rowField(fields, "range_display")) ?? undefined,
      batteryCapacityKwh: trim.battery_capacity_kwh ?? undefined,
      motorPowerKw: trim.motor_power_kw ?? undefined,
      topSpeedKmh: trim.top_speed_kmh ?? undefined,
      zeroTo100Sec: trim.zero_to_100_sec ?? undefined,
    });
  }

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
  const requestedVehicleModel = asText(body?.vehicleModel).trim();
  const title = asText(body?.title).trim();
  const quantity = asNumber(body?.quantity);
  if (quantity <= 0) return problem("Quantity is required");
  if (!vehicleId && !requestedVehicleModel && !title) return problem("Select a vehicle scope or provide an inquiry title");
  const db = requirePortalDb(env);
  const now = nowText();
  const isPublic = asBoolean(body?.isPublic);
  const inquiryNo = nextId("INQ");
  const vehicle = vehicleId ? await db.prepare("SELECT * FROM vehicles WHERE id = ?").bind(vehicleId).first<Record<string, unknown>>() : null;
  if (vehicleId && !vehicle) return problem("Selected vehicle resource was not found", 404);
  const vehicleModel = vehicle
    ? [
      rowField(vehicle, "brand", "品牌"),
      rowField(vehicle, "model", "型号"),
      rowField(vehicle, "variant", "细分型号"),
    ].map(asText).filter(Boolean).join(" ") || vehicleId
    : vehicleId;
  const selectedVehicleModel = requestedVehicleModel || vehicleModel || "General inquiry";
  const initialNote = asText(body?.notes).trim();
  const statements = [
    db.prepare("INSERT INTO inquiries (id,inquiry_no,customer_id,vehicle_id,vehicle_model,title,quantity,destination_port,trade_term,target_price,initial_note,is_public,status,source,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), inquiryNo, session.customerId, vehicleId, selectedVehicleModel, title, quantity, asText(body?.destinationPort), asText(body?.tradeTerm) || "FOB", asNumber(body?.targetPrice) || null, initialNote, Number(isPublic), "New Inquiry", "Customer Portal", now, now),
    db.prepare("INSERT INTO inquiry_participants (id,inquiry_no,customer_id,user_id,company,role,access_source,created_at) VALUES (?,?,?,?,?,?,?,?)").bind(crypto.randomUUID(), inquiryNo, session.customerId, session.userId, session.company, session.role, "Creator", now),
  ];
  if (initialNote) statements.push(
    inquiryNoteStatement(db, session, inquiryNo, initialNote, "", isPublic),
  );
  await db.batch(statements);
  return json({ ok: true, inquiryNo }, { status: 201 });
}

function canManageInquiryStatus(session: PortalSession) { return session.role === "admin" || session.role === "sales"; }

function requirePortalDb(env: Env) { if (!env.PORTAL_DB) throw problem("Inquiry database is unavailable", 503); return env.PORTAL_DB; }
function requirePublicDb(env: Env) {
  if (!env.PORTAL_DB) throw problem("Public content database is not configured", 503);
  return env.PORTAL_DB;
}

async function readPublicContent<T>(
  _request: Request,
  env: Env,
  reader: (db: D1Database) => Promise<T>,
): Promise<T> {
  return reader(requirePublicDb(env));
}

export type PublicContactRequest = {
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
};

function contactText(value: unknown, maxLength: number, required = false): string | null {
  if (value === undefined || value === null) return required ? null : "";
  if (typeof value !== "string") return null;
  const result = value.trim().slice(0, maxLength);
  return required && !result ? null : result;
}

export function validatePublicContactPayload(input: unknown): PublicContactRequest | null {
  if (!input || typeof input !== "object" || Array.isArray(input)) return null;
  const body = input as Record<string, unknown>;
  const name = contactText(body.name, 200, true);
  const company = contactText(body.company, 200, true);
  const email = contactText(body.email, 320, true);
  const phone = contactText(body.phone, 200);
  const message = contactText(body.message, 4000);
  if (name === null || company === null || email === null || phone === null || message === null) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return { name, company, email, phone, message };
}

export async function handlePublicContact(request: Request, env: Env) {
  const body = await request.json().catch(() => null);
  const contact = validatePublicContactPayload(body);
  if (!contact) return problem("Invalid contact request", 400);
  const db = requirePublicDb(env);
  await db.prepare(
    "INSERT INTO public_contact_submissions (id, name, company, email, phone, message, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
  ).bind(
    crypto.randomUUID(),
    contact.name,
    contact.company,
    contact.email,
    contact.phone,
    contact.message,
    nowText(),
    "new",
  ).run();
  return json({ ok: true });
}
function mapD1Inquiry(row: any) { return { id: row.id, inquiryNo: row.inquiry_no, customerId: row.customer_id, vehicleId: row.vehicle_id, vehicleModel: row.vehicle_model, title: row.title || "", quantity: Number(row.quantity || 0), destinationPort: row.destination_port || "", tradeTerm: row.trade_term || "", targetPrice: Number(row.target_price || 0), notes: row.initial_note || "", isPublic: Boolean(row.is_public), creatorUserId: row.creator_user_id || "", lastReadAt: row.last_read_at || null, hasUnreadFollowUps: Boolean(row.has_unread_follow_ups), status: row.status || "New Inquiry", createdAt: row.created_at, updatedAt: row.updated_at, deletedAt: row.deleted_at || "" }; }
function mapD1Note(row: any) { return { id: row.id, noteId: row.note_id, inquiryNo: row.inquiry_no, parentNoteId: row.parent_note_id || "", authorUserId: row.author_user_id, authorName: row.author_name, authorRole: row.author_role, body: row.body, isPublic: Boolean(row.is_public), createdAt: row.created_at, deletedAt: row.deleted_at || "" }; }
function mapD1History(row: any) { return { id: row.id, historyId: row.history_id, inquiryNo: row.inquiry_no, fromStatus: row.from_status || "", toStatus: row.to_status, actorName: row.actor_name, actorRole: row.actor_role, createdAt: row.created_at }; }
function mapD1Quote(row: any) {
  return {
    id: row.id,
    quoteNo: row.quote_no,
    inquiryNo: row.inquiry_no,
    version: Number(row.version || 1),
    vehicleId: row.vehicle_id,
    quantity: Number(row.quantity || 0),
    unitPrice: Number(row.price || 0),
    currency: row.currency || "USD",
    tradeTerm: row.trade_term || "",
    paymentTerms: row.payment_terms || "",
    validUntil: row.valid_until || "",
    status: row.status || "Active",
    changeReason: row.change_reason || "",
    createdAt: row.created_at,
  };
}
function mapD1Negotiation(row: any) {
  const message = String(row.message || "");
  const priceMatch = message.match(/Counteroffer price:\s*[A-Z]{3}\s+([0-9]+(?:\.[0-9]+)?)/i);
  return {
    id: row.id,
    logNo: row.id,
    inquiryNo: row.inquiry_no,
    quoteNo: row.quote_no || "",
    actor: row.actor_name || row.actor_role || "",
    action: row.action || (priceMatch ? "Counteroffer" : /accepted quote/i.test(message) ? "Quote Accepted" : "Message"),
    offeredPrice: priceMatch ? Number(priceMatch[1]) : 0,
    quantity: 0,
    message,
    createdAt: row.created_at,
  };
}
function mapD1Order(row: any) {
  return {
    id: row.id,
    orderNo: row.order_no,
    inquiryNo: row.inquiry_no,
    quoteNo: row.quote_no || "",
    customerId: row.customer_id,
    vehicleId: row.vehicle_id,
    quantity: Number(row.quantity || 0),
    finalUnitPrice: Number(row.final_unit_price ?? row.price ?? 0),
    total: Number(row.total || 0),
    currency: row.currency || "USD",
    paymentTerms: row.payment_terms || "",
    status: row.status || "Pending",
    createdAt: row.created_at,
  };
}
async function listInquiryNotes(env: Env, session: PortalSession, inquiries: ReturnType<typeof mapD1Inquiry>[]) {
  if (inquiries.length === 0) return [];
  const db = requirePortalDb(env);
  const placeholders = inquiries.map(() => "?").join(",");
  const result = await db.prepare(`SELECT * FROM inquiry_notes WHERE deleted_at IS NULL AND inquiry_no IN (${placeholders}) ORDER BY created_at`).bind(...inquiries.map((item) => item.inquiryNo)).all();
  const inquiryByNumber = new Map(inquiries.map((item) => [item.inquiryNo, item]));
  return result.results.map(mapD1Note).filter((note) => {
    const inquiry = inquiryByNumber.get(note.inquiryNo);
    return inquiry ? canViewNote(session, inquiry, note) : false;
  });
}

async function listInquiryStatusHistory(env: Env, inquiryNumbers: string[]) {
  if (inquiryNumbers.length === 0) return [];
  const placeholders = inquiryNumbers.map(() => "?").join(",");
  const result = await requirePortalDb(env).prepare(`SELECT * FROM inquiry_status_history WHERE inquiry_no IN (${placeholders}) ORDER BY created_at`).bind(...inquiryNumbers).all();
  return result.results.map(mapD1History);
}

async function listScopedInquiries(env: Env, session: PortalSession) {
  const db = requirePortalDb(env);
  const result = await db.prepare(`
    SELECT i.*, creator.user_id AS creator_user_id, reads.last_read_at
    FROM inquiries i
    JOIN inquiry_participants creator ON creator.inquiry_no=i.inquiry_no AND creator.access_source='Creator'
    LEFT JOIN inquiry_reads reads ON reads.inquiry_no=i.inquiry_no AND reads.user_id=?
    WHERE i.deleted_at IS NULL
      AND (i.is_public=1 OR ? IN ('admin','sales') OR creator.user_id=?)
    ORDER BY i.updated_at DESC
  `).bind(session.userId, session.role, session.userId).all();
  return result.results.map(mapD1Inquiry).filter((inquiry) => canViewInquiry(session, inquiry));
}

async function findScopedInquiry(env: Env, session: PortalSession, inquiryNo: string) {
  const inquiry = (await listScopedInquiries(env, session)).find((item) => item.inquiryNo === inquiryNo);
  if (!inquiry) throw problem("Inquiry not found", 404);
  return { inquiry };
}

async function listScopedQuotes(env: Env, session: PortalSession) {
  const db = requirePortalDb(env);
  const result = isInternalSession(session)
    ? await db.prepare(`
        SELECT q.*, i.quantity, i.trade_term, i.status AS inquiry_status
        FROM quotes q
        INNER JOIN inquiries i ON i.inquiry_no = q.inquiry_no
        WHERE i.deleted_at IS NULL
        ORDER BY q.updated_at DESC
      `).all()
    : await db.prepare(`
        SELECT q.*, i.quantity, i.trade_term, i.status AS inquiry_status
        FROM quotes q
        INNER JOIN inquiries i ON i.inquiry_no = q.inquiry_no
        WHERE i.deleted_at IS NULL AND q.customer_id = ?
        ORDER BY q.updated_at DESC
      `).bind(session.customerId).all();
  return result.results.map(mapD1Quote);
}

async function listScopedNegotiations(env: Env, session: PortalSession) {
  const db = requirePortalDb(env);
  const result = isInternalSession(session)
    ? await db.prepare("SELECT n.* FROM negotiations n INNER JOIN inquiries i ON i.inquiry_no=n.inquiry_no WHERE i.deleted_at IS NULL ORDER BY n.created_at").all()
    : await db.prepare("SELECT n.* FROM negotiations n INNER JOIN inquiries i ON i.inquiry_no=n.inquiry_no WHERE i.deleted_at IS NULL AND i.customer_id=? ORDER BY n.created_at").bind(session.customerId).all();
  return result.results.map(mapD1Negotiation);
}

async function listScopedOrders(env: Env, session: PortalSession) {
  const db = requirePortalDb(env);
  const result = isInternalSession(session)
    ? await db.prepare("SELECT * FROM orders ORDER BY updated_at DESC").all()
    : await db.prepare("SELECT * FROM orders WHERE customer_id=? ORDER BY updated_at DESC").bind(session.customerId).all();
  return result.results.map(mapD1Order);
}

async function findScopedQuote(env: Env, session: PortalSession, quoteNo: string) {
  const db = requirePortalDb(env);
  const quote = await db.prepare(`
    SELECT q.*, i.quantity, i.trade_term
    FROM quotes q
    INNER JOIN inquiries i ON i.inquiry_no = q.inquiry_no
    WHERE q.quote_no = ? AND i.deleted_at IS NULL
    LIMIT 1
  `).bind(quoteNo).first<any>();
  if (!quote || (!isInternalSession(session) && quote.customer_id !== session.customerId)) {
    throw problem("Quote not found", 404);
  }
  return { db, quote: mapD1Quote(quote) };
}

function inquiryNoteStatement(db: D1Database, session: PortalSession, inquiryNo: string, body: string, parentNoteId = "", isPublic = false) {
  return db.prepare("INSERT INTO inquiry_notes (id,note_id,inquiry_no,parent_note_id,author_user_id,author_name,author_role,body,is_public,created_at) VALUES (?,?,?,?,?,?,?,?,?,?)").bind(
    crypto.randomUUID(),
    nextId("NOTE"),
    inquiryNo,
    parentNoteId || null,
    session.userId,
    session.name,
    session.role,
    body.trim(),
    Number(isPublic),
    nowText(),
  );
}

async function createInquiryNote(env: Env, session: PortalSession, inquiryNo: string, body: string, parentNoteId = "", isPublic = false) {
  return inquiryNoteStatement(requirePortalDb(env), session, inquiryNo, body, parentNoteId, isPublic).run();
}

async function handleCreateInquiryNote(request: Request, env: Env, inquiryNo: string) {
  const session = await requireSession(request, env); const { inquiry } = await findScopedInquiry(env, session, inquiryNo);
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null; const text = asText(body?.body).trim();
  if (!text) return problem("Note is required"); if (text.length > 4000) return problem("Note must be 4000 characters or fewer");
  const parentNoteId = asText(body?.parentNoteId); const isPublic = asBoolean(body?.isPublic);
  let parentIsPublic: boolean | null = null;
  if (parentNoteId) {
    const parent = await requirePortalDb(env).prepare("SELECT * FROM inquiry_notes WHERE note_id=? AND inquiry_no=? AND deleted_at IS NULL").bind(parentNoteId, inquiryNo).first();
    if (!parent) return problem("Parent follow-up not found", 404);
    const note = mapD1Note(parent);
    if (!canViewNote(session, inquiry, note)) return problem("Parent follow-up not found", 404);
    parentIsPublic = note.isPublic;
  }
  if (!canPublishPublicNote({ inquiryIsPublic: inquiry.isPublic, parentIsPublic, isPublic })) return problem("Public follow-ups require public inquiry content", 403);
  await createInquiryNote(env, session, inquiryNo, text, parentNoteId, isPublic); return json({ ok: true }, { status: 201 });
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
  if (type === "inquiry") {
    const creator = await db.prepare("SELECT user_id FROM inquiry_participants WHERE inquiry_no=? AND access_source='Creator'").bind(row.inquiry_no).first<{ user_id: string }>();
    if (!creator || !canDeleteInquiry(session, creator.user_id)) return problem("Only an administrator can remove another account's content", 403);
  } else if (!canDeleteNote(session, row.author_user_id)) {
    return problem("Only an administrator can remove another account's content", 403);
  }
  const body = await request.json().catch(() => ({})) as Record<string, unknown>; await db.prepare(`UPDATE ${table} SET deleted_at=?, deleted_by_user_id=?, deleted_by_name=?, deletion_reason=? WHERE ${key}=?`).bind(nowText(), session.userId, session.name, asText(body.reason), id).run(); return json({ ok: true });
}

async function handleMarkInquiryRead(request: Request, env: Env, inquiryNo: string) {
  const session = await requireSession(request, env); const { inquiry } = await findScopedInquiry(env, session, inquiryNo);
  if (inquiry.creatorUserId !== session.userId) return problem("Only the inquiry creator can acknowledge follow-ups", 403);
  await requirePortalDb(env).prepare("INSERT INTO inquiry_reads (inquiry_no,user_id,last_read_at) VALUES (?,?,?) ON CONFLICT(inquiry_no,user_id) DO UPDATE SET last_read_at=excluded.last_read_at").bind(inquiryNo, session.userId, nowText()).run();
  return json({ ok: true });
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
  const { db, quote } = await findScopedQuote(env, session, quoteNo);
  const now = nowText();
  const counterMessage = [
    offeredPrice ? `Counteroffer price: ${quote.currency} ${offeredPrice}` : "",
    message,
  ].filter(Boolean).join("\n");
  await db.batch([
    db.prepare(`
      INSERT INTO negotiations (id, inquiry_no, quote_no, actor_user_id, actor_name, actor_role, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), quote.inquiryNo, quote.quoteNo, session.userId, session.name, session.role, counterMessage, now),
    db.prepare("UPDATE quotes SET status=?, updated_at=? WHERE quote_no=?").bind("Counteroffer Received", now, quote.quoteNo),
    db.prepare("UPDATE inquiries SET status=?, updated_at=? WHERE inquiry_no=?").bind("Negotiating", now, quote.inquiryNo),
  ]);
  return json({ ok: true });
}

async function handleAcceptQuote(request: Request, env: Env, quoteNo: string) {
  const session = await requireSession(request, env);
  const { db, quote } = await findScopedQuote(env, session, quoteNo);
  const inquiry = await db.prepare("SELECT customer_id FROM inquiries WHERE inquiry_no=? LIMIT 1").bind(quote.inquiryNo).first<{ customer_id: string }>();
  if (!inquiry) return problem("Inquiry not found", 404);
  const now = nowText();
  const orderNo = nextId("ORD");
  await db.batch([
    db.prepare(`
      INSERT INTO negotiations (id, inquiry_no, quote_no, actor_user_id, actor_name, actor_role, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      quote.inquiryNo,
      quote.quoteNo,
      session.userId,
      session.name,
      session.role,
      isInternalSession(session) ? "Youguard accepted quote in portal." : "Customer accepted quote in portal.",
      now,
    ),
    db.prepare("UPDATE quotes SET status=?, updated_at=? WHERE quote_no=?").bind("Accepted", now, quote.quoteNo),
    db.prepare("UPDATE inquiries SET status=?, updated_at=? WHERE inquiry_no=?").bind("Accepted", now, quote.inquiryNo),
    db.prepare(`
      INSERT INTO orders (id, order_no, inquiry_no, customer_id, vehicle_id, quantity, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      orderNo,
      quote.inquiryNo,
      inquiry.customer_id || session.customerId,
      quote.vehicleId,
      quote.quantity,
      "Draft Order",
      now,
      now,
    ),
  ]);
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

async function handlePublicProduct(request: Request, slug: string, env: Env) {
  const product = await readPublicContent(request, env, (db) => getPublicProduct(db, slug));
  return product ? json(product) : problem("Not found", 404);
}

// 闂傚倸鍊搁崐椋庣矆娴ｉ潻鑰块梺顒€绉埀顒婄畵瀹曞ジ濡风€ｎ亝鍠樻鐐查叄閹稿﹥绔熼埞鍨姦闁哄本鐩獮鍥濞戞瑧浜梺鑽ゅ枑閻熻鲸淇婇崶顒€鐒垫い鎺嗗亾缂佺姴绉瑰畷鏇熸綇閳规儳浜炬慨妯煎帶濞呭秹鏌熼姘辩劯濠碘€崇埣瀹曨亝鎷呴悷鎵В闂備浇顕ч崙鐣岀礊閸℃稑绀堟繛鍡樺姉椤╃兘鏌熼悜姗嗘畷闁?Base 闂傚倸鍊峰ù鍥х暦閻㈢绐楅柟鎵閸嬶繝寮堕崼姘珔缂佽翰鍊曡灃闁挎繂鎳庨弳鐐烘煕?table_id闂傚倸鍊搁崐鐑芥倿閿旈敮鍋撶粭娑樻噽閻瑩鏌熸潏楣冩闁搞倖鍔栭妵鍕冀椤愵澀娌梺绋款儍閸斿秹濡甸崟顖氱疀闁告挷鑳堕弳鐘电磽娴ｆ彃浜鹃梺鍛婂姦閸犳鎮￠弴鐔虹闁瑰瓨绻傞懜瑙勵殽閻愯揪鑰块柡宀€鍠栭幃鍓т沪閸欘偁鍎崇槐鎺撴綇閵婏箑纾抽悗瑙勬礃鐢帡鍩ユ径濞炬瀻闊洦娲﹂弳锟犳⒒?
async function handlePublicProducts(request: Request, env: Env) {
  return json(await readPublicContent(request, env, listPublicProducts));
}


function getBaselineArticles() {
  return [
    {
      slug: "ethiopia-ev-tax-policy-2026",
      title: "Ethiopia EV Tax Policy 2026: Complete Exemption Guide",
      category: "Policy & Tariffs",
      date: "2026-02-20",
      sortDate: "2026-02-20",
      readTime: "5 min read",
      coverImage: "hero.webp",
      sortOrder: 1,
      overview: "Comprehensive analysis of Ethiopia's 0% EV import tariff policy, VAT exemptions, and excise tax structure for commercial and passenger fleets.",
      content: "Ethiopia has implemented landmark zero-tariff policies for fully electric vehicles (BEVs) to accelerate energy transition and reduce foreign currency expenditure on imported fossil fuels.\n\nKey policy pillars:\n1. 0% Customs Import Duty for Completely Built-Up (CBU) EVs.\n2. Exemption from Value Added Tax (VAT) and Excise Tax for electric public transport and commercial fleets.\n3. Dedicated foreign exchange allocation priorities for authorized green vehicle importers.\n\nFor fleet operators and commercial buyers, these tax incentives lower the total cost of ownership (TCO) by up to 55% compared to internal combustion engine (ICE) equivalents over a 5-year operating cycle."
    },
    {
      slug: "sourcing-byd-evs-for-east-africa",
      title: "Strategic EV Sourcing: BYD Fleet Operations in East Africa",
      category: "Sourcing Intelligence",
      date: "2026-02-15",
      sortDate: "2026-02-15",
      readTime: "7 min read",
      coverImage: "hero.webp",
      sortOrder: 2,
      overview: "Step-by-step sourcing playbook for fleet operators importing BYD EVs into East African markets.",
      content: "BYD has emerged as the leading EV brand across East Africa due to its Blade Battery technology, thermal durability in tropical climates, and competitive FOB pricing."
    },
    {
      slug: "ev-charging-infrastructure-addis-ababa",
      title: "Addis Ababa Charging Infrastructure Roadmap",
      category: "Market Analysis",
      date: "2026-01-28",
      sortDate: "2026-01-28",
      readTime: "6 min read",
      coverImage: "hero.webp",
      sortOrder: 3,
      overview: "Mapping fast-charging stations, grid capacity, and depot charging solutions across urban transport routes.",
      content: "Urban charging infrastructure is rapidly expanding in Addis Ababa, supported by joint government initiatives and private depot installations."
    }
  ];
}

async function handlePublicInsights(request: Request, env: Env) {
  return json(await readPublicContent(request, env, listPublicInsights));
}

async function handlePublicInsight(request: Request, slug: string, env: Env) {
  const insight = await readPublicContent(request, env, (db) => getPublicInsight(db, slug));
  return insight ? json(insight) : problem("Not found", 404);
}

function getBaselineAcademy() {
  return {
    lessons: {
      fundamentals: [
        {
          title: "High Altitude and Dust in Ethiopia: How They Affect Your EV",
          tag: "Battery Tech",
          slug: "high-altitude-dust-ethiopia-ev",
          desc: "Understanding how high altitude and dust affect EVs in Ethiopia is essential knowledge for any dealer or technician.",
          img: "/pic/academy/photo-1518770660439-4636190af475.webp"
        },
        {
          title: "EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa",
          tag: "Infrastructure",
          slug: "ev-range-explained-africa",
          desc: "The range number on a Chinese EV spec sheet is not what your customer will get in Africa.",
          img: "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp"
        },
        {
          title: "How EV Batteries Degrade: What African Dealers Need to Understand and Tell Customers",
          tag: "TCO Analysis",
          slug: "how-ev-batteries-degrade",
          desc: "Battery degradation is the most common customer question and the most misunderstood topic for dealers.",
          img: "/pic/academy/photo-1486312338219-ce68d2c6f44d.webp"
        },
        {
          title: "EV Market Entry & Compliance Guide",
          tag: "Market Entry",
          slug: "ev-market-entry-compliance",
          desc: "Key regulatory, tariff, and licensing requirements for importing electric vehicles into African markets.",
          img: "/pic/academy/photo-1473341304170-971dccb5ac1e.webp"
        }
      ],
      playbook: [
        {
          title: "The 5 EV Objections Every African Dealer Will Face — And How to Answer Them",
          tag: "Objections",
          slug: "ev-objections-african-dealers",
          desc: "Battery life, charging, spare parts, resale value, and price — these 5 objections stall most EV deals.",
          img: "/pic/academy/photo-1560250097-0b93528c311a.webp"
        },
        {
          title: "The TCO Conversation Guide: How to Win EV Sales on Total Cost, Not Sticker Price",
          tag: "Fleet Sales",
          slug: "tco-conversation-guide",
          desc: "The TCO conversation is the single most powerful sales tool for African EV dealers.",
          img: "/pic/academy/photo-1527853787696-f7be74f2e39a.webp"
        },
        {
          title: "How to Run an EV Test Drive That Closes Deals",
          tag: "Showroom Standard",
          slug: "ev-test-drive-guide",
          desc: "A structured 20-minute test drive converts hesitant customers far better than endless objection handling.",
          img: "/pic/academy/photo-1559136555-9303baea8ebd.webp"
        },
        {
          title: "Fleet Operations & Total Cost Analysis",
          tag: "Fleet Mgmt",
          slug: "fleet-operations-tco-analysis",
          desc: "Comparative financial modeling for commercial fleets replacing diesel vehicles with BEVs.",
          img: "/pic/academy/0.webp"
        }
      ],
      workshop: [
        {
          title: "High Voltage Safety Rules for EV Technicians",
          tag: "Safety Protocols",
          slug: "high-voltage-safety-ev-technicians",
          desc: "What you must know before opening the bonnet of a 400V or 800V electric vehicle.",
          img: "/pic/academy/photo-1581092160562-40aa08e78837.webp"
        },
        {
          title: "Chinese EV Diagnostic Tools: What Actually Works in an African Workshop",
          tag: "Diagnostics",
          slug: "chinese-ev-diagnostic-tools",
          desc: "Navigating OBD protocols, manufacturer software, and multi-brand scanners for Chinese EVs.",
          img: "/pic/academy/photo-1559136555-9303baea8ebd.webp"
        },
        {
          title: "The 12V Auxiliary Battery in Chinese EVs: Why It Fails, How to Test It",
          tag: "Auxiliary Battery",
          slug: "12v-auxiliary-battery-ev",
          desc: "Why the 12V system is the leading cause of non-start complaints in modern electric vehicles.",
          img: "/pic/academy/photo-1527853787696-f7be74f2e39a.webp"
        },
        {
          title: "EV Won't Charge: A Step-by-Step Troubleshooting Guide for Technicians",
          tag: "Charging Systems",
          slug: "ev-wont-charge-troubleshooting",
          desc: "Diagnosing AC and DC charging handshake failures, port lock faults, and BMS interlocks.",
          img: "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp"
        },
        {
          title: "Common Fault Patterns in Chinese EVs Operating in Ethiopia: A Field Reference",
          tag: "Field Diagnostics",
          slug: "common-fault-patterns-ethiopia",
          desc: "Real-world field observations on thermal limits, dust ingress, and suspension wear.",
          img: "/pic/academy/photo-1473341304170-971dccb5ac1e.webp"
        },
        {
          title: "Voltage Fluctuation and EV Charging in Ethiopia: What Every Technician Must Know",
          tag: "Grid Infrastructure",
          slug: "voltage-fluctuation-ev-charger-ethiopia",
          desc: "Protecting chargers and vehicle OBCs against grid surges and undervoltage drops.",
          img: "/pic/academy/photo-1518770660439-4636190af475.webp"
        },
        {
          title: "Battery Maintenance & High Voltage Safety",
          tag: "Technical",
          slug: "battery-maintenance-hv-safety",
          desc: "Practical workshop on LFP battery diagnostics, thermal management, and safety protocols for technicians.",
          img: "/pic/academy/0.webp"
        }
      ]
    },
    vault: [
      {
        translationId: "v1",
        title: "Ethiopia EV Customs Regulation & Tax Exemption Circular (2026)",
        type: "PDF Policy Brief",
        desc: "Official Ministry of Finance directive detailing tariff codes, VAT exemption procedures, and port clearance checklists.",
        size: "2.4 MB",
        downloadLink: "/qr"
      },
      {
        translationId: "recvnRyGHzWgf8",
        title: "2026 Fleet ROI Calculator",
        type: "Excel Model",
        desc: "Plug in local electricity rates and petrol prices to instantly generate a 5-year cost comparison for your commercial clients.",
        size: "1.8 MB",
        downloadLink: "/qr"
      },
      {
        translationId: "recvnRyGHzd9uS",
        title: "The 50-Point Factory PDI",
        type: "PDF Guide",
        desc: "The exact Pre-Delivery Inspection checklist our engineers use in Shanghai before loading your vehicles into the container.",
        size: "3.1 MB",
        downloadLink: "/qr"
      },
      {
        translationId: "recvnRyGHzNocG",
        title: "Africa RHD Import Guide",
        type: "PDF Guide",
        desc: "A comprehensive breakdown of which Chinese factories are producing true Right-Hand Drive models and their export availability.",
        size: "4.5 MB",
        downloadLink: "/qr"
      }
    ]
  };
}

async function handlePublicAcademy(request: Request, env: Env) {
  return json(await readPublicContent(request, env, listPublicAcademy));
}


async function handlePublicAcademyLesson(request: Request, category: string, slug: string, env: Env) {
  const lesson = await readPublicContent(request, env, (db) => getPublicAcademyLesson(db, category, slug));
  return lesson ? json(lesson) : problem("Not found", 404);
}

export async function handleScheduledSync(env: Env): Promise<void> {
  console.log("[scheduled-sync] Running 10-minute Feishu background synchronization...");
  const { runFeishuScheduledSync } = await import("../jobs/feishu-sync");
  await runFeishuScheduledSync(env);
  cacheMap.clear();
}

export async function handlePortalRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
    if (path.startsWith("/api/portal/public/")) {
      if (path === "/api/portal/public/contact" && request.method === "POST") {
        return await handlePublicContact(request, env);
      }
      if (path === "/api/portal/public/insights" && request.method === "GET") {
        return await handlePublicInsights(request, env);
      }
      const insightMatch = path.match(/^\/api\/portal\/public\/insights\/([^/]+)$/);
      if (insightMatch && request.method === "GET") {
        return await handlePublicInsight(request, decodeURIComponent(insightMatch[1]), env);
      }
      if (path === "/api/portal/public/products" && request.method === "GET") {
        return await handlePublicProducts(request, env);
      }
      const productMatch = path.match(/^\/api\/portal\/public\/products\/([^/]+)$/);
      if (productMatch && request.method === "GET") {
        return await handlePublicProduct(request, decodeURIComponent(productMatch[1]), env);
      }
      // /api/portal/public/i18n removed — translations are served from local static bundles only
      if (path === "/api/portal/public/academy" && request.method === "GET") {
        return await handlePublicAcademy(request, env);
      }
      const academyLessonMatch = path.match(/^\/api\/portal\/public\/academy\/([^/]+)\/([^/]+)$/);
      if (academyLessonMatch && request.method === "GET") {
        return await handlePublicAcademyLesson(
          request,
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
    if (path === "/api/portal/webhook/sync-d1" && request.method === "POST") {
      return problem("Request-time Feishu sync is disabled; scheduled cron only", 410);
    }

    if (path.startsWith("/api/auth/")) {
      if (path.includes("sign-up") || path.includes("signup") || path.includes("register")) {
        return problem("Public registration is disabled. Accounts are managed in D1.", 403);
      }
      if (!env.PORTAL_DB) return problem("Portal database is not configured", 503);
      return problem("Use the D1-backed portal session endpoint for authentication", 404);
    }

    if (path === "/api/portal/dev-session" && request.method === "POST") {
      return await handleDevLogin(request, env);
    }
    if (path === "/api/portal/session" && request.method === "GET") {
      if (!env.PORTAL_DB && !isLocalRequest(request)) return problem("Portal database is not configured", 503);
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
    const inquiryReadMatch = path.match(/^\/api\/portal\/inquiries\/([^/]+)\/read$/);
    if (inquiryReadMatch && request.method === "POST") return await handleMarkInquiryRead(request, env, decodeURIComponent(inquiryReadMatch[1]));
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
    if (isResponseError(error)) return error;
    console.error(error);
    return problem(error instanceof Error ? error.message : "Portal request failed", 500);
  }
}
