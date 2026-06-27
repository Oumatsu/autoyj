/// <reference types="@cloudflare/workers-types" />

type Env = {
  FEISHU_APP_ID?: string;
  FEISHU_APP_SECRET?: string;
  FEISHU_BASE_APP_TOKEN?: string;
  FEISHU_TABLE_INTERNAL_USERS?: string;
  FEISHU_TABLE_EXTERNAL_ACCOUNTS?: string;
  FEISHU_TABLE_CUSTOMERS?: string;
  FEISHU_TABLE_VEHICLE_MODELS?: string;
  FEISHU_TABLE_VEHICLES?: string;
  FEISHU_TABLE_INQUIRIES?: string;
  FEISHU_TABLE_QUOTES?: string;
  FEISHU_TABLE_NEGOTIATIONS?: string;
  FEISHU_TABLE_ORDERS?: string;
  PORTAL_SESSION_SECRET?: string;
  PORTAL_COOKIE_NAME?: string;
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
  battery: string;
  range: string;
  motorPower: string;
  driveType: string;
  seats: string;
  dimensions: string;
  charging: string;
  warranty: string;
  marketPosition: string;
  exportNotes: string;
  imageUrl: string;
  brochureUrl: string;
  status: string;
};

const FEISHU_API = "https://open.feishu.cn";
const SESSION_TTL_SECONDS = 60 * 60 * 12;
const DEFAULT_COOKIE_NAME = "autoyj_portal";
const TENANT_TOKEN_SAFETY_WINDOW_MS = 60 * 1000;

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

function requireEnv(env: Env, key: keyof Env) {
  const value = env[key];
  if (!value) throw new Error(`Missing ${key}`);
  return value;
}

function optionalEnv(env: Env, key: keyof Env) {
  return env[key] || "";
}

function asText(value: unknown) {
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
  const appId = requireEnv(env, "FEISHU_APP_ID");
  const appSecret = requireEnv(env, "FEISHU_APP_SECRET");
  const now = Date.now();
  if (tenantTokenCache?.appId === appId && tenantTokenCache.token && tenantTokenCache.expiresAt - TENANT_TOKEN_SAFETY_WINDOW_MS > now) {
    return tenantTokenCache.token;
  }
  if (tenantTokenCache?.appId === appId && tenantTokenCache.pending) return tenantTokenCache.pending;

  const pending = (async () => {
    const response = await fetch(`${FEISHU_API}/open-apis/auth/v3/tenant_access_token/internal`, {
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
  const response = await fetch(`${FEISHU_API}${path}`, {
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
  const query = new URLSearchParams({
    limit: String(options.pageSize || 100),
    offset: "0",
  });
  const filter = normalizeBaseFilter(options.filter);
  if (filter) query.set("filter", JSON.stringify(filter));
  if (options.sort) query.set("sort", JSON.stringify(options.sort));
  const data = await feishuRequest<BaseRecordListResponse>(
    env,
    "GET",
    `/open-apis/base/v3/bases/${appToken}/tables/${tableId}/records?${query.toString()}`,
  );
  return normalizeBaseRecords(data);
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
    trim: asText(fields.Trim),
    year: asText(fields.Year),
    bodyType: asText(fields["Body Type"]),
    battery: asText(fields.Battery),
    range: asText(fields.Range),
    motorPower: asText(fields["Motor Power"]),
    driveType: asText(fields["Drive Type"]),
    seats: asText(fields.Seats),
    dimensions: asText(fields.Dimensions),
    charging: asText(fields.Charging),
    warranty: asText(fields.Warranty),
    marketPosition: asText(fields["Market Position"]),
    exportNotes: asText(fields["Export Notes"]),
    imageUrl: asText(fields["Image URL"]),
    brochureUrl: asText(fields["Brochure URL"]),
    status: asText(fields.Status) || "Active",
  };
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
    });
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
  const vehicleModels = vehicleModelRecords.length ? vehicleModelRecords.map(mapVehicleModel) : deriveVehicleModelsFromVehicles(vehicles);
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

export async function handlePortalRequest(request: Request, env: Env) {
  const url = new URL(request.url);
  const path = url.pathname;

  try {
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
