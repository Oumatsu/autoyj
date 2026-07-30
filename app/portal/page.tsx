"use client";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

type PortalRole = "admin" | "sales" | "sourcing" | "finance" | "partner" | "customer";
type PriceTier = "hidden" | "partner" | "vip" | "internal";
type AccountType = "internal" | "external";
type AdminModule = "dashboard" | "vehicle_models" | "vehicles" | "source_imports" | "quotes" | "orders" | "payments" | "logistics" | "customers" | "staff" | "files";
type AdminIconName = "dashboard" | "vehicle_models" | "vehicles" | "quotes" | "orders" | "payments" | "logistics" | "customers" | "staff" | "files";

type PortalUser = {
  userId: string;
  customerId: string;
  name: string;
  email: string;
  company: string;
  accountType: AccountType;
  role: PortalRole;
  priceTier: PriceTier;
};

type InternalUser = {
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

type Customer = {
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

type VehicleModel = {
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

type VehicleModelSpec = {
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

type Vehicle = {
  id: string;
  modelId: string;
  brand: string;
  model: string;
  trim: string;
  year: string;
  color: string;
  exteriorColor: string;
  interiorColor: string;
  supplierExteriorColor: string;
  supplierInteriorColor: string;
  colorCode: string;
  colorNotes: string;
  colorConfirmed: boolean;
  configuration: string;
  supplier: string;
  recorder: string;
  location: string;
  status: string;
  exportStatus: string;
  stockQuantity: number;
  leadTime: string;
  priceValidUntil: string;
  imageUrl: string;
  publicNotes: string;
  canSeePrice: boolean;
  price: number | null;
  partnerPrice: number | null;
  customerPrice: number | null;
  cost: number | null;
  isListed: boolean;
  editableFields: string[];
  priceLabel: string;
};

type SellableModel = {
  key: string;
  brand: string;
  model: string;
  year: string;
  segment: string;
  imageUrl: string;
  stockQuantity: number;
  preorderAvailable: boolean;
  fobPriceRange: string;
  offers: VehicleOffer[];
};

type ModelProfileGroup = {
  key: string;
  brand: string;
  model: string;
  years: string[];
  variants: VehicleModel[];
  specsByModel: Map<string, VehicleModelSpec[]>;
  segment: string;
  energyType: string;
  marketPosition: string;
  rangeSummary: string;
  guidePriceSummary: string;
};

type ModelComparisonRow = {
  category: string;
  label: string;
  sortOrder: number;
  values: Record<string, string>;
};

type ModelProfileRoute =
  | { view: "list" }
  | { view: "detail"; groupKey: string }
  | { view: "comparison"; groupKey: string; variantId: string };

type VariantDifferenceStep = {
  variant: VehicleModel;
  label: string;
  price: string;
  range: string;
  sections: {
    label: string;
    tone: string;
    isCurrent: boolean;
    items: { category: string; name: string; value: string; previousValue: string }[];
  }[];
};

type VehicleOffer = {
  key: string;
  vehicle: Vehicle;
  vehicles: Vehicle[];
  year: string;
  trim: string;
  exteriorColor: string;
  interiorColor: string;
  configuration: string;
  quantity: number;
  supplyType: string;
  leadTime: string;
  location: string;
  price: number | null;
  priceLabel: string;
};

type Inquiry = {
  id: string;
  inquiryNo: string;
  customerId: string;
  vehicleId: string;
  vehicleModel: string;
  quantity: number;
  destinationPort: string;
  tradeTerm: string;
  targetPrice: number;
  notes: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type Quote = {
  id: string;
  quoteNo: string;
  inquiryNo: string;
  version: number;
  vehicleId: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  tradeTerm: string;
  paymentTerms: string;
  validUntil: string;
  status: string;
  changeReason: string;
  createdAt: string;
};

type Negotiation = {
  id: string;
  inquiryNo: string;
  quoteNo: string;
  actor: string;
  action: string;
  offeredPrice: number;
  quantity: number;
  message: string;
  createdAt: string;
};

type Order = {
  id: string;
  orderNo: string;
  customerId: string;
  inquiryNo: string;
  quoteNo: string;
  vehicleId: string;
  quantity: number;
  finalUnitPrice: number;
  total: number;
  currency: string;
  paymentTerms: string;
  status: string;
  createdAt: string;
};

type BootstrapData = {
  user: PortalUser;
  permissions: {
    canSeePrice: boolean;
    canRequestQuote: boolean;
    canCounterOffer: boolean;
  };
  vehicleModels: VehicleModel[];
  vehicleModelSpecs: VehicleModelSpec[];
  vehicles: Vehicle[];
  inquiries: Inquiry[];
  quotes: Quote[];
  negotiations: Negotiation[];
  orders: Order[];
  internalUsers: InternalUser[];
  customers: Customer[];
};

type InquiryForm = {
  quantity: number;
  destinationPort: string;
  tradeTerm: string;
  targetPrice: string;
  notes: string;
};

const emptyInquiryForm: InquiryForm = {
  quantity: 1,
  destinationPort: "",
  tradeTerm: "FOB",
  targetPrice: "",
  notes: "",
};

const devLoginOptions: { role: PortalRole; label: string; detail: string; email: string; accessCode: string }[] = [
  { role: "admin", label: "Admin", detail: "Full internal view", email: "admin@local.test", accessCode: "admin-demo-2026" },
  { role: "sales", label: "Sales", detail: "Sales workspace", email: "sales@local.test", accessCode: "sales-demo-2026" },
  { role: "partner", label: "Partner", detail: "Cooperation price", email: "partner@example.com", accessCode: "partner-demo-2026" },
  { role: "customer", label: "Customer", detail: "Inventory only", email: "customer@example.com", accessCode: "customer-demo-2026" },
];

const roleLabels: Record<PortalRole, string> = {
  admin: "Admin",
  sales: "Sales",
  sourcing: "Sourcing",
  finance: "Finance",
  partner: "Partner",
  customer: "Customer",
};

const adminRoleLabels: Record<PortalRole, string> = {
  admin: "管理员",
  sales: "销售",
  sourcing: "车源",
  finance: "财务",
  partner: "合作伙伴",
  customer: "客户",
};

const adminNavItems: { key: AdminModule; label: string; roles: PortalRole[]; icon: AdminIconName; badge?: string }[] = [
  { key: "dashboard", label: "首页看板", roles: ["admin", "sales", "sourcing", "finance", "partner", "customer"], icon: "dashboard", badge: "开发中" },
  { key: "vehicle_models", label: "车型库", roles: ["admin", "sales", "sourcing", "partner", "customer"], icon: "vehicle_models", badge: "开发中" },
  { key: "vehicles", label: "车辆资源", roles: ["admin", "sales", "sourcing", "partner"], icon: "vehicles", badge: "开发中" },
  { key: "source_imports", label: "车源录入与审查", roles: ["admin", "sales", "sourcing"], icon: "vehicles", badge: "开发中" },
  { key: "quotes", label: "询价管理", roles: ["admin", "sales", "partner", "customer"], icon: "quotes", badge: "开发中" },
  { key: "orders", label: "订单管理", roles: ["admin", "sales", "finance", "partner", "customer"], icon: "orders", badge: "开发中" },
  { key: "payments", label: "收款财务", roles: ["admin", "finance"], icon: "payments", badge: "开发中" },
  { key: "logistics", label: "出口流程", roles: ["admin", "sales", "partner", "customer"], icon: "logistics", badge: "开发中" },
  { key: "customers", label: "客户资料", roles: ["admin"], icon: "customers", badge: "开发中" },
  { key: "staff", label: "员工账号", roles: ["admin"], icon: "staff", badge: "开发中" },
  { key: "files", label: "文件中心", roles: ["admin", "sales", "partner", "customer"], icon: "files", badge: "开发中" },
];

const modelCoreSpecNames = [
  "中国官方指导价",
  "车身级别",
  "能源类型",
  "CLTC续航",
  "电池容量",
  "电池类型",
  "电机总功率",
  "电机总扭矩",
  "驱动方式",
  "长宽高",
  "轴距",
  "座位数",
  "整备质量",
  "后备厢容积",
  "百公里耗电量",
  "充电说明",
  "前悬架类型",
  "后悬架类型",
  "ADAS",
  "市场定位",
];

const modelCategoryOrder = [
  "基本参数",
  "车身",
  "电动机",
  "电池/充电",
  "变速箱",
  "底盘转向",
  "车轮制动",
  "主动安全",
  "被动安全",
  "辅助驾驶",
  "外部配置",
  "内部配置",
  "座椅配置",
  "多媒体/智能座舱",
  "灯光",
  "玻璃/后视镜",
  "空调/舒适",
  "智能硬件",
  "其他",
];

function formatUsd(value: number | null | undefined) {
  if (!value) return "On request";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatUsdStrict(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function safeText(val: any, fallback = ""): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") {
    if (val === "[object Object]") return fallback;
    return val.trim() || fallback;
  }
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (Array.isArray(val)) {
    const parts = val.map((item) => safeText(item, "")).filter(Boolean);
    return parts.length ? parts.join(", ") : fallback;
  }
  if (typeof val === "object") {
    const textVal = val.text ?? val.name ?? val.label ?? val.value ?? val.title ?? val.content;
    if (textVal !== undefined && textVal !== null && typeof textVal !== "object") {
      const res = String(textVal).trim();
      if (res && res !== "[object Object]") return res;
    }
    if (Array.isArray(val.rich_text)) {
      const rt = val.rich_text.map((item: any) => item?.text?.content || item?.text || "").join("").trim();
      if (rt) return rt;
    }
  }
  return fallback;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "content-type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const data = (await response.json().catch(() => ({}))) as any;
  if (!response.ok) {
    throw new Error(typeof data.error === "string" ? data.error : "Request failed");
  }
  return data as T;
}

export default function PortalPage() {
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [data, setData] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [showPreviewTestLogin, setShowPreviewTestLogin] = useState(false);
  const [activeAdminModule, setActiveAdminModule] = useState<AdminModule>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryTab = (params.get("tab") || params.get("module") || "").toLowerCase().replaceAll("-", "_");
      if (queryTab === "vehicle_models" || queryTab === "profiles") return "vehicle_models";
      const validModules: AdminModule[] = ["dashboard", "vehicle_models", "vehicles", "source_imports", "quotes", "orders", "payments", "logistics", "customers", "staff", "files"];
      if (queryTab && validModules.includes(queryTab as AdminModule)) {
        return queryTab as AdminModule;
      }
    }
    return "dashboard";
  });
  const [selectedSellableModel, setSelectedSellableModel] = useState<SellableModel | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>(emptyInquiryForm);
  const [counterQuote, setCounterQuote] = useState<Quote | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  async function checkSessionAndLoad() {
    setError("");
    try {
      // 1. 先极速校验 Session（纯本地 Cookie 校验，<5ms 返回），无需长等待
      const sessionRes = await api<{ user: PortalUser | null }>("/api/portal/session");
      if (!sessionRes.user) {
        setData(null);
        setLoading(false);
        return;
      }
      // 2. 已登录：拉取全量后台数据
      const bootstrap = await api<BootstrapData>("/api/portal/bootstrap");
      setData(bootstrap);
    } catch (loadError) {
      setData(null);
      if (loadError instanceof Error && loadError.message !== "Not signed in") {
        setError(loadError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    setIsLocalDev(host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]");
    setShowPreviewTestLogin(
      host.includes("workers.dev") ||
      host.includes("autoyj-preview") ||
      host.includes("preview")
    );

    const validModules: AdminModule[] = ["dashboard", "vehicle_models", "vehicles", "source_imports", "quotes", "orders", "payments", "logistics", "customers", "staff", "files"];
    const syncFromUrl = () => {
      const pathname = window.location.pathname.toLowerCase();
      const segments = pathname.split("/").filter(Boolean);
      const lastSegment = (segments[segments.length - 1] || "").replaceAll("-", "_") as AdminModule;

      const params = new URLSearchParams(window.location.search);
      const queryTab = (params.get("tab") || params.get("module") || "").toLowerCase().replaceAll("-", "_") as AdminModule;

      if (queryTab && (validModules.includes(queryTab) || queryTab === "profiles" as any)) {
        setActiveAdminModule(queryTab === "profiles" as any ? "vehicle_models" : queryTab);
      } else if (lastSegment && (validModules.includes(lastSegment) || lastSegment === "profiles" as any)) {
        setActiveAdminModule(lastSegment === "profiles" as any ? "vehicle_models" : lastSegment);
      }
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);

    void checkSessionAndLoad();

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  const handleModuleChange = (module: AdminModule) => {
    setActiveAdminModule(module);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", module);
      window.history.pushState({ module }, "", url.toString());
    }
  };

  const quoteByInquiry = useMemo(() => {
    const grouped = new Map<string, Quote[]>();
    for (const quote of data?.quotes || []) {
      grouped.set(quote.inquiryNo, [...(grouped.get(quote.inquiryNo) || []), quote]);
    }
    for (const [key, quotes] of grouped) {
      grouped.set(
        key,
        quotes.sort((a, b) => b.version - a.version),
      );
    }
    return grouped;
  }, [data?.quotes]);

  const sellableModels = useMemo(() => (data ? buildSellableModels(data) : []), [data]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/portal/session", {
        method: "POST",
        body: JSON.stringify({ email, accessCode }),
      });
      await checkSessionAndLoad();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("autoyj-session-changed"));
      }
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect");
      if (redirect) {
        window.location.href = redirect;
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign in failed");
    } finally {
      setBusy(false);
    }
  }

  async function devLogin(role: PortalRole) {
    setBusy(true);
    setError("");
    try {
      await api("/api/portal/dev-session", {
        method: "POST",
        body: JSON.stringify({ role }),
      });
      await checkSessionAndLoad();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("autoyj-session-changed"));
      }
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Development sign in failed");
    } finally {
      setBusy(false);
    }
  }

  function fillTestCredentials(option: (typeof devLoginOptions)[number]) {
    setEmail(option.email);
    setAccessCode(option.accessCode);
    setError("");
  }

  async function logout() {
    await api("/api/portal/session", { method: "DELETE" });
    setData(null);
    setActiveAdminModule("dashboard");
    setSelectedSellableModel(null);
    setSelectedVehicle(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("autoyj-session-changed"));
    }
  }

  async function createInquiry(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedVehicle) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/portal/inquiries", {
        method: "POST",
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          quantity: inquiryForm.quantity,
          destinationPort: inquiryForm.destinationPort,
          tradeTerm: inquiryForm.tradeTerm,
          targetPrice: Number(inquiryForm.targetPrice || 0),
          notes: inquiryForm.notes,
        }),
      });
      setSelectedVehicle(null);
      setInquiryForm(emptyInquiryForm);
      await checkSessionAndLoad();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Inquiry failed");
    } finally {
      setBusy(false);
    }
  }

  async function submitCounter(event: React.FormEvent) {
    event.preventDefault();
    if (!counterQuote) return;
    setBusy(true);
    setError("");
    try {
      await api(`/api/portal/quotes/${encodeURIComponent(counterQuote.quoteNo)}/counter`, {
        method: "POST",
        body: JSON.stringify({
          offeredPrice: Number(counterPrice || 0),
          message: counterMessage,
        }),
      });
      setCounterQuote(null);
      setCounterPrice("");
      setCounterMessage("");
      await checkSessionAndLoad();
    } catch (counterError) {
      setError(counterError instanceof Error ? counterError.message : "Counteroffer failed");
    } finally {
      setBusy(false);
    }
  }

  async function acceptQuote(quote: Quote) {
    setBusy(true);
    setError("");
    try {
      await api(`/api/portal/quotes/${encodeURIComponent(quote.quoteNo)}/accept`, { method: "POST" });
      await checkSessionAndLoad();
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Accept failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg px-4 pt-32 text-center text-gray-400">
        Loading portal...
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-bg px-4 pb-20 pt-32">
        <section className="mx-auto grid w-full max-w-5xl gap-10 lg:grid-cols-[1.05fr_.95fr]">
          <div className="flex flex-col justify-center">
            <div className="label label-gold mb-5">Dashboard</div>
            <h1 className="sh mb-6">
              Live Stock.
              <br />
              Private Quotes.
            </h1>
            <p className="max-w-xl text-sm font-light leading-7 text-gray-400">
              Sign in with the email and access code assigned by autoYJ to view your permitted inventory, request quotes, negotiate, and track draft orders.
            </p>
          </div>

          <form onSubmit={login} className="glass grid gap-5 rounded-[2rem] p-6 sm:p-8">
            <div>
              <h2 className="text-2xl font-black uppercase italic text-white">Sign In</h2>
              <p className="mt-2 text-xs text-gray-500">Your access level is controlled in Feishu Base.</p>
            </div>
            {(isLocalDev || showPreviewTestLogin) && (
              <div className="grid gap-3 rounded-xl border border-gold/20 bg-gold/[.06] p-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-gold">Test accounts</p>
                <div className="grid grid-cols-2 gap-2">
                  {devLoginOptions.map((option) => (
                    <button
                      key={option.role}
                      type="button"
                      disabled={busy}
                      onClick={() => fillTestCredentials(option)}
                      className="rounded-lg border border-white/10 bg-black/25 px-3 py-3 text-left transition hover:border-gold/60 disabled:opacity-60"
                    >
                      <span className="block text-xs font-black uppercase italic text-white">{option.label}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-widest text-gray-500">{option.detail}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <label htmlFor="login-email" className="grid gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              Email
              <input
                id="login-email"
                name="email"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-gold"
                placeholder="partner@example.com"
                type="email"
              />
            </label>
            <label htmlFor="login-access-code" className="grid gap-2 text-xs font-black uppercase tracking-widest text-gray-500">
              Access Code
              <input
                id="login-access-code"
                name="password"
                autoComplete="current-password"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-medium normal-case tracking-normal text-white outline-none focus:border-gold"
                placeholder="Provided by autoYJ"
                type="password"
              />
            </label>
            {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">{error}</p>}
            <button disabled={busy} className="btn-primary rounded-xl px-5 py-4 text-xs font-black uppercase tracking-widest disabled:opacity-60">
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <AdminPortal
      activeModule={activeAdminModule}
      data={data}
      error={error}
      onLogout={logout}
      onModuleChange={handleModuleChange}
      onReload={checkSessionAndLoad}
    />
  );

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-28 sm:px-6">
      <section className="mx-auto grid max-w-7xl gap-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="label label-gold mb-4">autoYJ Dashboard</div>
            <h1 className="text-4xl font-black uppercase italic tracking-tight text-white sm:text-5xl">
              {data.user.company}
            </h1>
            <p className="mt-3 text-sm text-gray-500">
              {roleLabels[data.user.role].toUpperCase()} / {data.user.accountType.toUpperCase()} / {data.user.priceTier.toUpperCase()} / {data.user.customerId}
            </p>
          </div>
          <button onClick={logout} className="w-fit rounded-full border border-white/15 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition hover:border-white/40 hover:text-white">
            Sign Out
          </button>
        </header>

        {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Sellable Models" value={String(sellableModels.length)} />
          <Metric label="Open Inquiries" value={String(data.inquiries.filter((item) => !["Accepted", "Closed"].includes(item.status)).length)} />
          <Metric label="Quote Versions" value={String(data.quotes.length)} />
          <Metric label="Draft Orders" value={String(data.orders.length)} />
        </section>

        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Available Models</h2>
              <p className="mt-1 text-xs text-gray-500">FOB prices are filtered by your portal access level.</p>
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {sellableModels.map((item) => (
              <article key={item.key} className="glass grid overflow-hidden rounded-[1.5rem]">
                <div className="aspect-[16/9] overflow-hidden bg-black">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={`${item.brand} ${item.model}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-gray-700">autoYJ EV</div>
                  )}
                </div>
                <div className="grid gap-4 p-5">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-accent">{item.segment || "EV"}</p>
                    <h3 className="mt-2 text-xl font-black uppercase italic text-white">{item.brand} {item.model} {formatModelYear(item.year)}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <PortalInventoryPill label="Stock" value={`${item.stockQuantity} units`} />
                    <PortalInventoryPill label="Supply" value={formatSupplySummary(item)} />
                    <PortalInventoryPill label="FOB" value={item.fobPriceRange.replace(/^FOB\s*/i, "")} highlight />
                    <PortalInventoryPill label="Sources" value={String(item.offers.length)} />
                  </div>
                  <button
                    onClick={() => setSelectedSellableModel(item)}
                    className="btn-primary rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest"
                  >
                    View Sources
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.1fr_.9fr]">
          <div className="glass rounded-[1.5rem] p-5">
            <h2 className="mb-4 text-2xl font-black uppercase italic text-white">Inquiries and Quotes</h2>
            <div className="grid gap-4">
              {data.inquiries.length === 0 && <Empty text="No inquiries yet." />}
              {data.inquiries.map((inquiry) => {
                const quotes = quoteByInquiry.get(inquiry.inquiryNo) || [];
                return (
                  <article key={inquiry.inquiryNo} className="rounded-xl border border-white/10 bg-white/[.03] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-accent">{inquiry.status}</p>
                        <h3 className="mt-1 font-black text-white">{inquiry.inquiryNo}</h3>
                        <p className="mt-1 text-xs text-gray-500">{inquiry.vehicleModel} / {inquiry.quantity} units / {inquiry.tradeTerm} / {inquiry.destinationPort}</p>
                      </div>
                      <span className="text-xs text-gray-600">{formatDate(inquiry.updatedAt || inquiry.createdAt)}</span>
                    </div>

                    <div className="mt-4 grid gap-3">
                      {quotes.length === 0 && <p className="rounded-lg border border-white/10 px-3 py-3 text-xs text-gray-500">Waiting for autoYJ quote.</p>}
                      {quotes.map((quote) => (
                        <div key={quote.quoteNo} className="rounded-lg border border-gold/20 bg-black/20 p-3">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-theme">Quote V{quote.version} / {quote.status}</p>
                              <p className="mt-1 text-sm font-bold text-white">{quote.quoteNo} / {formatUsd(quote.unitPrice)} per unit</p>
                              <p className="mt-1 text-xs text-gray-500">{quote.tradeTerm} / {quote.paymentTerms || "Payment terms pending"} / valid {quote.validUntil || "TBC"}</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => acceptQuote(quote)} disabled={busy || quote.status === "Accepted"} className="rounded-lg bg-accent px-3 py-2 text-[10px] font-black uppercase tracking-widest text-black disabled:opacity-50">
                                Accept
                              </button>
                              <button onClick={() => setCounterQuote(quote)} className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-gray-300">
                                Counter
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="glass rounded-[1.5rem] p-5">
            <h2 className="mb-4 text-2xl font-black uppercase italic text-white">Orders</h2>
            <div className="grid gap-3">
              {data.orders.length === 0 && <Empty text="Accepted quotes will create draft orders here." />}
              {data.orders.map((order) => (
                <article key={order.orderNo} className="rounded-xl border border-white/10 bg-white/[.03] p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-accent">{order.status}</p>
                  <h3 className="mt-1 font-black text-white">{order.orderNo}</h3>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                    <Info label="Quote" value={order.quoteNo} />
                    <Info label="Quantity" value={`${order.quantity} units`} />
                    <Info label="Unit Price" value={formatUsd(order.finalUnitPrice)} highlight />
                    <Info label="Total" value={formatUsd(order.total)} highlight />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="glass rounded-[1.5rem] p-5">
          <h2 className="mb-4 text-2xl font-black uppercase italic text-white">Negotiation Log</h2>
          <div className="grid gap-3">
            {data.negotiations.length === 0 && <Empty text="Portal inquiry and counteroffer actions will appear here." />}
            {data.negotiations.map((log) => (
              <div key={log.id} className="grid gap-2 rounded-xl border border-white/10 bg-white/[.03] p-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-theme">{log.actor} / {log.action}</p>
                  <p className="mt-1 text-sm text-white">{log.message || "No message"}</p>
                  <p className="mt-1 text-xs text-gray-500">{log.inquiryNo} / {log.quoteNo || "No quote yet"}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-black text-accent">{formatUsd(log.offeredPrice)}</p>
                  <p className="mt-1 text-xs text-gray-600">{formatDate(log.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      {selectedSellableModel && (
        <Modal title={`${selectedSellableModel.brand} ${selectedSellableModel.model} ${formatModelYear(selectedSellableModel.year)} / Sources`} onClose={() => setSelectedSellableModel(null)}>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Segment" value={selectedSellableModel.segment || "EV"} />
              <Info label="In-stock Qty" value={`${selectedSellableModel.stockQuantity} units`} />
              <Info label="FOB Range" value={selectedSellableModel.fobPriceRange} highlight />
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr>
                    {["Year", "Trim / Config", "Color", "Qty", "Supply", "Lead Time", "Location", "FOB", "Action"].map((header) => (
                      <th key={header} className="border-b border-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-gray-500">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedSellableModel.offers.map((offer) => (
                    <tr key={offer.key} className="align-top">
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">{offer.year || "-"}</td>
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">
                        <strong className="block text-white">{offer.trim || "-"}</strong>
                        <span className="mt-1 block text-xs text-gray-500">{offer.configuration || "-"}</span>
                      </td>
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">{formatColorPair(offer.exteriorColor, offer.interiorColor)}</td>
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">{offer.quantity}</td>
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">{offer.supplyType}</td>
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">{offer.leadTime || (offer.supplyType === "In Stock" ? "Ready stock" : "-")}</td>
                      <td className="border-b border-white/[.06] px-3 py-3 text-gray-300">{offer.location || "-"}</td>
                      <td className="border-b border-white/[.06] px-3 py-3 font-black text-accent">{offer.price ? `FOB ${formatUsdStrict(offer.price)}` : offer.priceLabel}</td>
                      <td className="border-b border-white/[.06] px-3 py-3">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedSellableModel(null);
                            setSelectedVehicle(offer.vehicle);
                            setInquiryForm((current) => ({ ...emptyInquiryForm, quantity: Math.max(1, offer.quantity || current.quantity || 1) }));
                          }}
                          className="rounded-lg border border-accent/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-accent transition hover:border-accent hover:bg-accent/10"
                        >
                          Inquiry
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {selectedVehicle && (
        <Modal title={`Request quote / ${selectedVehicle.brand} ${selectedVehicle.model} ${selectedVehicle.trim}`.trim()} onClose={() => setSelectedVehicle(null)}>
          <form onSubmit={createInquiry} className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Year" value={selectedVehicle.year || "-"} />
              <Info label="Color" value={formatColorPair(selectedVehicle.exteriorColor, selectedVehicle.interiorColor)} />
              <Info label="FOB" value={selectedVehicle.price ? formatUsdStrict(selectedVehicle.price) : selectedVehicle.priceLabel} highlight={selectedVehicle.canSeePrice} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField label="Quantity">
                <input min="1" type="number" value={inquiryForm.quantity} onChange={(event) => setInquiryForm((current) => ({ ...current, quantity: Number(event.target.value) }))} />
              </FormField>
              <FormField label="Destination Port">
                <input value={inquiryForm.destinationPort} onChange={(event) => setInquiryForm((current) => ({ ...current, destinationPort: event.target.value }))} placeholder="Djibouti, Mombasa..." />
              </FormField>
              <FormField label="Trade Term">
                <select value={inquiryForm.tradeTerm} onChange={(event) => setInquiryForm((current) => ({ ...current, tradeTerm: event.target.value }))}>
                  <option>FOB</option>
                  <option>CIF</option>
                  <option>CFR</option>
                  <option>EXW</option>
                </select>
              </FormField>
              <FormField label="Target Price">
                <input value={inquiryForm.targetPrice} onChange={(event) => setInquiryForm((current) => ({ ...current, targetPrice: event.target.value }))} placeholder="Optional" type="number" />
              </FormField>
            </div>
            <FormField label="Notes">
              <textarea value={inquiryForm.notes} onChange={(event) => setInquiryForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Color, payment, delivery window, local requirements..." />
            </FormField>
            <button disabled={busy} className="btn-primary rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
              {busy ? "Submitting..." : "Submit Inquiry"}
            </button>
          </form>
        </Modal>
      )}

      {counterQuote && (
        <Modal title={`Counteroffer / ${counterQuote.quoteNo}`} onClose={() => setCounterQuote(null)}>
          <form onSubmit={submitCounter} className="grid gap-4">
            <FormField label="Your Target Unit Price">
              <input value={counterPrice} onChange={(event) => setCounterPrice(event.target.value)} placeholder="18300" type="number" />
            </FormField>
            <FormField label="Message">
              <textarea value={counterMessage} onChange={(event) => setCounterMessage(event.target.value)} placeholder="Please include battery warranty, LC payment, and August shipment..." />
            </FormField>
            <button disabled={busy} className="btn-primary rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
              {busy ? "Sending..." : "Send Counteroffer"}
            </button>
          </form>
        </Modal>
      )}
    </main>
  );
}

function AdminPortal({
  data,
  activeModule,
  onModuleChange,
  onLogout,
  onReload,
  error,
}: {
  data: BootstrapData;
  activeModule: AdminModule;
  onModuleChange: (module: AdminModule) => void;
  onLogout: () => Promise<void>;
  onReload: () => Promise<void>;
  error: string;
}) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const visibleNav = adminNavItems.filter((item) => item.roles.includes(data.user.role));
  const normalizedActiveModule = visibleNav.some((item) => item.key === activeModule) ? activeModule : "dashboard";
  const activeItem = visibleNav.find((item) => item.key === normalizedActiveModule) || visibleNav[0];
  const totalStock = data.vehicles.reduce((sum, vehicle) => sum + vehicle.stockQuantity, 0);
  const openInquiries = data.inquiries.filter((item) => !["accepted", "closed", "cancelled"].includes(item.status.toLowerCase())).length;
  const orderTotal = data.orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0c1322] text-slate-100">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#101827] px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5">
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#22b8aa] text-2xl font-black text-[#0c1322]">
              EV
            </div>
            <div className="min-w-0">
              <strong className="block truncate text-xl font-black tracking-tight text-white">出口管理系统</strong>
              <span className="mt-1 block text-sm font-medium text-slate-400">China / Ethiopia</span>
            </div>
          </div>

          <nav className="mt-5 grid gap-2">
            {visibleNav.map((item) => {
              const isActive = item.key === normalizedActiveModule;
              return (
                <a
                  key={item.key}
                  href={`/dashboard?tab=${item.key}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onModuleChange(item.key);
                  }}
                  className={`flex min-h-12 items-center justify-between gap-2 rounded-xl px-4 py-3 text-left text-base font-bold transition ${
                    isActive
                      ? "bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)]"
                      : "text-slate-400 hover:bg-white/[.06] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AdminNavIcon name={item.icon} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="shrink-0 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>

          <div className="mt-6 rounded-xl border border-white/10 bg-white/[.04] p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Current account</p>
            <strong className="mt-2 block truncate text-sm text-white">{data.user.name || data.user.email}</strong>
            <p className="mt-1 text-xs text-slate-400">{adminRoleLabels[data.user.role]} / {data.user.accountType} / {data.user.email}</p>
            <button
              type="button"
              onClick={() => void onLogout()}
              className="mt-4 w-full rounded-lg border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:border-white/30 hover:text-white"
            >
              退出登录
            </button>
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#22b8aa]">
                {adminRoleLabels[data.user.role]}视图 / Feishu Base
              </p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{activeItem?.label || "首页看板"}</h1>
            </div>
            <div className="grid w-full min-w-0 gap-2 text-xs text-slate-400 sm:grid-cols-3 xl:max-w-[520px]">
              <AdminTopMetric label="库存台数" value={String(totalStock)} />
              <AdminTopMetric label="待处理询价" value={String(openInquiries)} />
              <AdminTopMetric label="订单金额" value={formatUsdStrict(orderTotal)} />
            </div>
          </header>

          {error && <p className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300">{error}</p>}

          <AdminModuleContent activeModule={normalizedActiveModule} data={data} onEditVehicle={setEditingVehicle} />
        </section>
      </div>
      {editingVehicle && (
        <VehicleEditModal
          vehicle={editingVehicle}
          onClose={() => setEditingVehicle(null)}
          onSaved={async () => {
            setEditingVehicle(null);
            await onReload();
          }}
        />
      )}
    </main>
  );
}

function AdminModuleContent({ activeModule, data, onEditVehicle }: { activeModule: AdminModule; data: BootstrapData; onEditVehicle: (vehicle: Vehicle) => void }) {
  switch (activeModule) {
    case "source_imports":
      return <AdminSourceImportsDemo />;
    case "vehicle_models":
      return <AdminProfiles data={data} />;
    case "vehicles":
      return <AdminVehicles data={data} onEdit={onEditVehicle} />;
    case "quotes":
      return <AdminQuotes data={data} />;
    case "orders":
      return <AdminOrders data={data} />;
    case "payments":
      return <AdminPayments data={data} />;
    case "logistics":
      return <AdminLogistics data={data} />;
    case "customers":
      return <AdminCustomers data={data} />;
    case "staff":
      return <AdminStaff data={data} />;
    case "files":
      return <AdminFiles data={data} />;
    default:
      return <AdminDashboard data={data} />;
  }
}

function AdminSourceImportsDemo() {
  return (
    <div className="grid min-w-0 gap-6">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-300">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-black uppercase text-black">开发中 / Demo</span>
          <h2 className="text-lg font-black tracking-tight text-white">车源录入与审查静态设计（开发中）</h2>
        </div>
        <p className="mt-2 text-xs text-amber-200/80">
          包含批量素材上传、AI/OCR 中间产物解析、重合度风险判定警报、车源候选列表及审查抽屉预演界面。
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">待审查素材</span>
          <strong className="mt-2 block text-2xl font-black text-white">12 份</strong>
          <span className="mt-1 block text-xs text-slate-400">PDF / 图片 / 微信聊天记录</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">AI 解析完成度</span>
          <strong className="mt-2 block text-2xl font-black text-[#22b8aa]">98.5%</strong>
          <span className="mt-1 block text-xs text-slate-400">结合 Nemotron / GPT 视觉模型</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">疑似重复车源警报</span>
          <strong className="mt-2 block text-2xl font-black text-amber-400">2 组</strong>
          <span className="mt-1 block text-xs text-amber-300/80">同 VIN / 车架号交叉校验</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">已入库待发布</span>
          <strong className="mt-2 block text-2xl font-black text-white">35 台</strong>
          <span className="mt-1 block text-xs text-slate-400">符合出口 PDI 准备标准</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <h3 className="text-base font-black text-white">批量素材导入与智能识别 (Demo)</h3>
          <p className="mt-1 text-xs text-slate-400">支持拖拽 Excel、车辆识别登记表、供应商朋友圈图片或微信截图</p>
          <div className="mt-4 grid h-36 place-items-center rounded-xl border border-dashed border-white/20 bg-black/20 text-center">
            <div>
              <p className="text-xs font-bold text-slate-300">点击或将车源资料文件拖拽至此处</p>
              <p className="mt-1 text-[10px] text-slate-500">自动提取 VIN、外观/内饰颜色、指导价、车商报价与定金要求</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <h3 className="text-base font-black text-white">审查工作流提示 (Workflow Preview)</h3>
          <div className="mt-4 grid gap-3 text-xs text-slate-300">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
              <span>1. 原始凭证采集 (Excel / 图片 OCR)</span>
              <span className="text-[#22b8aa] font-bold">通过</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
              <span>2. 结构化字段映射 (字段校验无空格)</span>
              <span className="text-[#22b8aa] font-bold">通过</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
              <span>3. 多维表格 `vehicle_sources` 增量同步</span>
              <span className="text-amber-400 font-bold">开发中</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }: { data: BootstrapData }) {
  const totalStock = data.vehicles.reduce((sum, vehicle) => sum + vehicle.stockQuantity, 0);
  const modelCount = (data.vehicleModels || []).length;
  const quoteValue = data.quotes.reduce((sum, quote) => sum + quote.unitPrice * Math.max(quote.quantity, 1), 0);
  const latestInquiries = [...data.inquiries]
    .sort((a, b) => getDateTime(b.updatedAt || b.createdAt) - getDateTime(a.updatedAt || a.createdAt))
    .slice(0, 6);
  const lowStock = data.vehicles.filter((vehicle) => vehicle.stockQuantity <= 2).slice(0, 6);

  return (
    <div className="grid min-w-0 gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat label="车型库" value={String(modelCount)} note={`${data.vehicles.length} 条车源 / ${totalStock} 台库存`} />
        <AdminStat label="询价单" value={String(data.inquiries.length)} note={`${latestInquiries.length} 条近期动态`} />
        <AdminStat label="报价版本" value={String(data.quotes.length)} note={formatUsdStrict(quoteValue)} />
        <AdminStat label="订单" value={String(data.orders.length)} note={formatUsdStrict(data.orders.reduce((sum, order) => sum + order.total, 0))} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <AdminPanel title="近期询价" subtitle="来自飞书 Inquiries / Quotes 表">
          <AdminTable
            headers={["询价号", "车辆", "数量", "状态", "最新报价"]}
            rows={latestInquiries.map((inquiry) => {
              const quote = latestQuoteForInquiry(inquiry.inquiryNo, data.quotes);
              return [
                inquiry.inquiryNo,
                inquiry.vehicleModel || inquiry.vehicleId,
                `${inquiry.quantity} 台`,
                <AdminStatusBadge key="status" status={inquiry.status || "Pending"} />,
                quote ? `${quote.quoteNo} / ${formatUsdStrict(quote.unitPrice)}` : "待报价",
              ];
            })}
            emptyText="暂无询价"
          />
        </AdminPanel>

        <AdminPanel title="库存提醒" subtitle="低库存和待确认车辆">
          <AdminTable
            headers={["车辆", "库存", "位置", "供应类型"]}
            rows={lowStock.map((vehicle) => [
              vehicleName(vehicle),
              `${vehicle.stockQuantity} 台`,
              vehicle.location || "-",
              <AdminStatusBadge key="status" status={getSupplyType(vehicle)} />,
            ])}
            emptyText="暂无低库存车辆"
          />
        </AdminPanel>
      </section>
    </div>
  );
}

function ModelFullSpecsCard({ group }: { group: ModelProfileGroup }) {
  const v = group.variants[0] || ({} as VehicleModel);

  const batteryVal = safeText(v.battery) || getModelSpecValue(group.specsByModel, v.id, ["电池容量"]) || "-";
  const batteryTypeVal = safeText(v.batteryType) || getModelSpecValue(group.specsByModel, v.id, ["电池类型"]) || "-";
  const batteryMakerVal = safeText(v.batteryMaker) || "-";
  const rangeVal = safeText(group.rangeSummary || v.range) || "-";
  const energyConsumptionVal = safeText(v.energyConsumption) || "-";
  const chargingVal = safeText(v.charging) || "-";

  const motorPowerVal = safeText(v.motorPower) || getModelSpecValue(group.specsByModel, v.id, ["电机总功率"]) || "-";
  const motorTorqueVal = safeText(v.motorTorque) || getModelSpecValue(group.specsByModel, v.id, ["电机总扭矩"]) || "-";
  const driveTypeVal = safeText(v.driveType) || getModelSpecValue(group.specsByModel, v.id, ["驱动方式"]) || "-";
  const accelerationVal = safeText(v.acceleration) || "-";
  const topSpeedVal = safeText(v.topSpeed) || "-";

  const dimensionsVal = safeText(v.dimensions) || getModelSpecValue(group.specsByModel, v.id, ["长*宽*高(mm)"]) || "-";
  const wheelbaseVal = safeText(v.wheelbase) || getModelSpecValue(group.specsByModel, v.id, ["轴距(mm)"]) || "-";
  const seatsVal = safeText(v.seats);
  const doorsVal = safeText(v.doors);
  const frontSuspensionVal = safeText(v.frontSuspension);
  const rearSuspensionVal = safeText(v.rearSuspension);
  const curbWeightVal = safeText(v.curbWeight);
  const trunkCapacityVal = safeText(v.trunkCapacity);

  const adasVal = safeText(v.adas) || getModelSpecValue(group.specsByModel, v.id, ["ADAS"]) || "-";
  const warrantyVal = safeText(v.warranty) || "-";
  const msrpVal = safeText(group.guidePriceSummary || v.msrpChina) || "-";
  const exportNotesVal = safeText(v.exportNotes) || "符合海关出口通用检验标准";

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-[#0c1322] p-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#22b8aa]/20 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#5ee6d8]">
              {safeText(group.brand)} · {safeText(group.model)}
            </span>
            <span className="text-[10px] text-slate-400">({group.variants.length} 个版本在库)</span>
          </div>
          <h4 className="mt-1 text-sm font-black text-white">{safeText(group.marketPosition) || `${safeText(group.brand)} ${safeText(group.model)} 全量技术参数图谱`}</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <AdminSummaryChip label="数据来源" value={safeText(v.sourceName) || "飞书 Base 认证数据"} />
          {v.sourceUrl ? (
            <a href={v.sourceUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#22b8aa]/30 bg-[#22b8aa]/10 px-2.5 py-1 font-bold text-[#5ee6d8] hover:bg-[#22b8aa] hover:text-black">
              查看飞书原始源
            </a>
          ) : null}
          {v.brochureUrl ? (
            <a href={v.brochureUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-bold text-amber-300 hover:bg-amber-500 hover:text-black">
              官方PDF宣传册
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-[#22b8aa]/20 bg-[#22b8aa]/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-[#22b8aa]/20 pb-1.5">
            <strong className="font-black text-[#5ee6d8]">⚡ 三电与电池系统</strong>
            <span className="text-[9px] text-[#22b8aa]">BATTERY & CHARGING</span>
          </div>
          <dl className="grid gap-1.5 text-slate-300">
            <div className="flex justify-between">
              <dt className="text-slate-500">电池容量:</dt>
              <dd className="font-medium text-white">{batteryVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">电池类型:</dt>
              <dd className="font-medium text-white">{batteryTypeVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">电芯/电池供应商:</dt>
              <dd className="font-medium text-white">{batteryMakerVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">CLTC / NEDC 续航:</dt>
              <dd className="font-bold text-[#5ee6d8]">{rangeVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">百公里电耗:</dt>
              <dd className="font-medium text-white">{energyConsumptionVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">快充说明/时间:</dt>
              <dd className="font-medium text-white">{chargingVal}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
            <strong className="font-black text-indigo-300">🏁 电机驱动与性能</strong>
            <span className="text-[9px] text-indigo-400">MOTOR & PERFORMANCE</span>
          </div>
          <dl className="grid gap-1.5 text-slate-300">
            <div className="flex justify-between">
              <dt className="text-slate-500">电机最大功率:</dt>
              <dd className="font-medium text-white">{motorPowerVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">电机最大扭矩:</dt>
              <dd className="font-medium text-white">{motorTorqueVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">驱动形式:</dt>
              <dd className="font-medium text-white">{driveTypeVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">0-100km/h 加速:</dt>
              <dd className="font-bold text-indigo-300">{accelerationVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">最高极速:</dt>
              <dd className="font-medium text-white">{topSpeedVal}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-amber-500/20 pb-1.5">
            <strong className="font-black text-amber-300">🚗 车身尺寸与底盘</strong>
            <span className="text-[9px] text-amber-400">BODY & CHASSIS</span>
          </div>
          <dl className="grid gap-1.5 text-slate-300">
            <div className="flex justify-between">
              <dt className="text-slate-500">长 × 宽 × 高 (mm):</dt>
              <dd className="font-medium text-white">{dimensionsVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">轴距 (mm):</dt>
              <dd className="font-medium text-white">{wheelbaseVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">座位 / 车门数:</dt>
              <dd className="font-medium text-white">{seatsVal ? `${seatsVal}座` : "-"} / {doorsVal ? `${doorsVal}门` : "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">前/后悬架:</dt>
              <dd className="font-medium text-white">{frontSuspensionVal || "-"} / {rearSuspensionVal || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">整备质量 / 后备厢:</dt>
              <dd className="font-medium text-white">{curbWeightVal || "-"} / {trunkCapacityVal || "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
            <strong className="font-black text-emerald-300">🛡️ 智驾、质保与出口</strong>
            <span className="text-[9px] text-emerald-400">ADAS & COMPLIANCE</span>
          </div>
          <dl className="grid gap-1.5 text-slate-300">
            <div className="flex justify-between">
              <dt className="text-slate-500">智驾/辅助驾驶:</dt>
              <dd className="font-bold text-emerald-300">{adasVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">质保政策:</dt>
              <dd className="font-medium text-white">{warrantyVal}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">国内官方指导价:</dt>
              <dd className="font-bold text-amber-300">{group.guidePriceSummary || v.msrpChina || "-"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">出口合规/备注:</dt>
              <dd className="font-medium text-white">{v.exportNotes || "符合海关出口通用检验标准"}</dd>
            </div>
          </dl>
        </div>
      </div>

      {group.variants.length > 1 ? (
        <div className="mt-2 rounded-lg border border-white/10 bg-white/[.02] p-3">
          <strong className="block text-xs font-black text-slate-300 mb-2">包含的版本与变体 ({group.variants.length} 个):</strong>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
            {group.variants.map((varItem) => (
              <div key={varItem.id} className="rounded border border-white/10 bg-black/20 p-2 text-xs">
                <span className="font-black text-white">{varItem.trim || varItem.id}</span>
                <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-400">
                  <span>续航: {varItem.range || "-"}</span>
                  <span>功率: {varItem.motorPower || "-"}</span>
                  <span>指导价: {varItem.msrpChina || "-"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AdminProfiles({ data }: { data: BootstrapData }) {
  const groups = useMemo(() => buildModelProfileGroups(data), [data]);
  const [route, setRoute] = useState<ModelProfileRoute>({ view: "list" });
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"core" | "full">("core");
  const [tableColumnMode, setTableColumnMode] = useState<"compact" | "full">("full");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleGroups = groups.filter((group) => modelProfileGroupMatchesSearch(group, normalizedSearch));
  const selectedGroup = route.view === "list" ? null : groups.find((group) => group.key === route.groupKey) || null;
  const highlightedVariantId = route.view === "comparison" ? route.variantId : "";
  const comparisonRows = selectedGroup ? buildModelComparisonRows(selectedGroup, mode) : [];

  function openDetail(group: ModelProfileGroup) {
    setRoute({ view: "detail", groupKey: group.key });
  }

  function openComparison(group: ModelProfileGroup, variant: VehicleModel, nextMode: "core" | "full" = "full") {
    setMode(nextMode);
    setRoute({ view: "comparison", groupKey: group.key, variantId: variant.id });
  }

  if (route.view !== "list" && !selectedGroup) {
    return (
      <AdminPanel title="车型库" subtitle="车型数据已刷新">
        <button type="button" onClick={() => setRoute({ view: "list" })} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-black text-slate-300 transition hover:border-white/30">
          返回车型列表
        </button>
      </AdminPanel>
    );
  }

  return (
    <div className="grid gap-5">
      {route.view === "list" ? (
        <AdminPanel title="车型库" subtitle="全量展示飞书 Base 关联数据：包含三电系统、电机驱动、尺寸轴距、智驾等级与合规出口字段">
          <div className="mb-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
            <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
              搜索车型
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="rounded-xl border border-white/10 bg-[#0c1322] px-4 py-3 text-sm font-medium normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-[#22b8aa]"
                placeholder="品牌、车型、年款、版本、级别、电池类型、电机功率、智驾等级"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-xl border border-white/10 bg-white/[.04] p-1">
                <button
                  type="button"
                  onClick={() => setTableColumnMode("compact")}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
                    tableColumnMode === "compact" ? "bg-[#22b8aa] text-[#07111f]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  精简视图
                </button>
                <button
                  type="button"
                  onClick={() => setTableColumnMode("full")}
                  className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
                    tableColumnMode === "full" ? "bg-[#22b8aa] text-[#07111f]" : "text-slate-400 hover:text-white"
                  }`}
                >
                  全量列视图
                </button>
              </div>
              <AdminSummaryChip label="车型" value={`${visibleGroups.length} / ${groups.length}`} tone="accent" />
              <AdminSummaryChip label="版本" value={`${visibleGroups.reduce((sum, group) => sum + group.variants.length, 0)} 个`} />
            </div>
          </div>

          <div className="max-w-full overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[1100px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  {(tableColumnMode === "full"
                    ? ["品牌", "车型 & 定位", "年款", "版本", "级别", "能源", "电池 / 供应商", "续航 (CLTC)", "电机 / 驱动", "尺寸 / 轴距", "智驾 / 安全", "指导价", "操作"]
                    : ["品牌", "车型", "年款", "版本", "级别", "能源", "续航", "指导价", "操作"]
                  ).map((header) => (
                    <th key={header} className="border-b border-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visibleGroups.map((group) => {
                  const firstVar = group.variants[0];
                  const isExpanded = expandedKey === group.key;
                  const batVal = safeText(firstVar?.battery) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["电池容量"]);
                  const batTypeVal = safeText(firstVar?.batteryType) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["电池类型"]);
                  const batMakerVal = safeText(firstVar?.batteryMaker) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["电池供应商", "电芯供应商"]);
                  const motorPowVal = safeText(firstVar?.motorPower) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["电机总功率"]);
                  const driveVal = safeText(firstVar?.driveType) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["驱动方式"]);
                  const dimVal = safeText(firstVar?.dimensions) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["长*宽*高(mm)"]);
                  const wbVal = safeText(firstVar?.wheelbase) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["轴距(mm)"]);

                  const batteryText = safeText(batVal || batTypeVal ? `${batVal} ${batTypeVal}`.trim() : "-");
                  const batteryMakerText = batMakerVal ? `(${safeText(batMakerVal)})` : "";
                  const motorText = safeText(motorPowVal || driveVal ? `${motorPowVal} ${driveVal}`.trim() : "-");
                  const dimText = safeText(dimVal || wbVal ? `${dimVal || "-"} / 轴距${wbVal || "-"}` : "-");
                  const adasText = safeText(firstVar?.adas) || getModelSpecValue(group.specsByModel, firstVar?.id || "", ["ADAS"]) || "-";

                  return (
                    <Fragment key={group.key}>
                      <tr className={`transition hover:bg-white/[.035] ${isExpanded ? "bg-white/[.02]" : ""}`}>
                        <td className="border-b border-white/[.06] px-3 py-3 align-middle text-[10px] font-black uppercase tracking-widest text-[#22b8aa]">{group.brand}</td>
                        <td className="border-b border-white/[.06] px-3 py-3 align-middle">
                          <button type="button" onClick={() => openDetail(group)} className="text-left">
                            <strong className="block text-base text-white transition hover:text-[#5ee6d8]">{group.model}</strong>
                            <span className="mt-1 block max-w-xs truncate text-xs text-slate-500">{group.marketPosition || "市场定位待补充"}</span>
                          </button>
                        </td>
                        <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{group.years.join(" / ") || "-"}</td>
                        <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{group.variants.length} 个</td>
                        <td className="border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{group.segment || "-"}</td>
                        <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{group.energyType || "-"}</td>
                        {tableColumnMode === "full" ? (
                          <td className="border-b border-white/[.06] px-3 py-3 align-middle text-xs text-slate-300">
                            <span className="block font-medium text-white">{batteryText}</span>
                            {batteryMakerText && <span className="block text-[10px] text-slate-500">{batteryMakerText}</span>}
                          </td>
                        ) : null}
                        <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{group.rangeSummary || "-"}</td>
                        {tableColumnMode === "full" ? (
                          <td className="border-b border-white/[.06] px-3 py-3 align-middle text-xs text-slate-300">{motorText}</td>
                        ) : null}
                        {tableColumnMode === "full" ? (
                          <td className="border-b border-white/[.06] px-3 py-3 align-middle text-xs text-slate-400">{dimText}</td>
                        ) : null}
                        {tableColumnMode === "full" ? (
                          <td className="border-b border-white/[.06] px-3 py-3 align-middle text-xs text-slate-400">{adasText}</td>
                        ) : null}
                        <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{group.guidePriceSummary || "-"}</td>
                        <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setExpandedKey(isExpanded ? null : group.key)}
                              className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-black uppercase tracking-widest transition ${
                                isExpanded
                                  ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                                  : "border-white/15 text-slate-300 hover:border-white/30"
                              }`}
                            >
                              {isExpanded ? "收起参数" : "展开全量字段"}
                            </button>
                            <button type="button" onClick={() => openDetail(group)} className="rounded-lg border border-[#22b8aa]/30 bg-[#22b8aa]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#5ee6d8] transition hover:bg-[#22b8aa] hover:text-[#07111f]">
                              详情对比
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr>
                          <td colSpan={tableColumnMode === "full" ? 13 : 9} className="border-b border-white/10 bg-[#070e1b] px-4 py-4">
                            <ModelFullSpecsCard group={group} />
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
                {visibleGroups.length === 0 ? (
                  <tr>
                    <td colSpan={tableColumnMode === "full" ? 13 : 9} className="px-3 py-8 text-center text-sm text-slate-600">
                      暂无匹配车型
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      ) : null}

      {route.view === "detail" && selectedGroup ? (
        <AdminPanel title={`${selectedGroup.brand} ${selectedGroup.model} ${selectedGroup.years[0] || ""}`} subtitle="先看版本列表和配置差异速览，再进入完整参数对比">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={() => setRoute({ view: "list" })} className="rounded-xl border border-white/15 px-4 py-3 text-xs font-black text-slate-300 transition hover:border-white/30">
              返回车型列表
            </button>
            <div className="flex flex-wrap gap-2">
              <AdminSummaryChip label="级别" value={selectedGroup.segment || "-"} tone="accent" />
              <AdminSummaryChip label="能源" value={selectedGroup.energyType || "-"} />
              <AdminSummaryChip label="版本" value={`${selectedGroup.variants.length} 个`} />
              <AdminSummaryChip label="指导价" value={selectedGroup.guidePriceSummary || "-"} />
            </div>
          </div>

          <div className="mb-5 max-w-full overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  {["版本", "续航", "电机", "指导价", "操作"].map((header) => (
                    <th key={header} className="border-b border-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {selectedGroup.variants.map((variant) => (
                  <tr key={variant.id} className="transition hover:bg-white/[.035]">
                    <td className="border-b border-white/[.06] px-3 py-3 align-middle">
                      <strong className="block text-sm text-white">{variant.trim || variant.id}</strong>
                      <span className="mt-1 block font-mono text-[10px] text-slate-500">{variant.id}</span>
                    </td>
                    <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{getModelSpecValue(selectedGroup.specsByModel, variant.id, ["CLTC续航"]) || "-"}</td>
                    <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{getModelSpecValue(selectedGroup.specsByModel, variant.id, ["电机总功率", "电机总马力"]) || "-"}</td>
                    <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">{getModelSpecValue(selectedGroup.specsByModel, variant.id, ["中国官方指导价"]) || "-"}</td>
                    <td className="whitespace-nowrap border-b border-white/[.06] px-3 py-3 align-middle">
                      <button type="button" onClick={() => openComparison(selectedGroup, variant, "full")} className="rounded-lg border border-white/15 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:border-[#22b8aa]/50 hover:text-[#5ee6d8]">
                        查看参数
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <section className="mb-5 rounded-xl border border-white/10 bg-[#0c1322] p-4">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-base font-black text-white">配置升级阶梯</h3>
                <p className="mt-1 text-xs text-slate-500">按价格从低到高展示，每一级高亮相比上一版本新增或升级的配置。</p>
              </div>
              <button type="button" onClick={() => openComparison(selectedGroup, selectedGroup.variants[0], "core")} className="rounded-lg border border-[#22b8aa]/30 bg-[#22b8aa]/10 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#5ee6d8] transition hover:bg-[#22b8aa] hover:text-[#07111f]">
                主要参数对比
              </button>
            </div>

            <div className="max-w-full overflow-x-auto pb-1">
              <div className="flex min-w-[760px] items-end gap-3">
                {buildVariantDifferenceSteps(selectedGroup).map((step, index, steps) => (
                  <article
                    key={step.variant.id}
                    className="flex min-w-[230px] flex-1 flex-col overflow-hidden rounded-xl border bg-white/[.035] shadow-2xl shadow-black/10"
                    style={{ minHeight: `${250 + step.sections.reduce((sum, section) => sum + section.items.length, 0) * 13 + step.sections.length * 28}px`, borderColor: upgradeStepColor(index) }}
                  >
                    <div className="px-4 py-3" style={{ background: upgradeStepColor(index) }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-[#07111f]">{step.label}</span>
                          <h4 className="mt-1 text-base font-black leading-snug text-[#07111f]">{step.variant.trim || step.variant.id}</h4>
                        </div>
                        <span className="rounded-full bg-[#07111f]/15 px-2.5 py-1 text-[10px] font-black text-[#07111f]">{index + 1}/{steps.length}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 border-b border-white/[.07] p-2.5">
                      <div className="rounded-md border border-white/10 bg-black/10 px-2 py-1.5">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">指导价</span>
                        <strong className="mt-0.5 block truncate text-xs text-white">{step.price || "-"}</strong>
                      </div>
                      <div className="rounded-md border border-white/10 bg-black/10 px-2 py-1.5">
                        <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500">续航</span>
                        <strong className="mt-0.5 block truncate text-xs text-white">{step.range || "-"}</strong>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-1.5 p-2.5">
                      <p className="px-1 text-[9px] font-black uppercase tracking-widest text-slate-500">
                        {index === 0 ? "入门核心配置" : "底部继承 / 上方为本级新增或升级"}
                      </p>
                      <div className="flex flex-1 flex-col-reverse justify-start gap-1.5">
                        {step.sections.map((section, sectionIndex) => (
                          <div
                            key={`${step.variant.id}-${section.label}-${sectionIndex}`}
                            className="rounded-lg border px-2.5 py-2 text-xs leading-4"
                            style={{ borderColor: section.tone, background: `${section.tone}${section.isCurrent ? "2e" : "1c"}` }}
                          >
                            <div className="mb-1.5 flex items-center justify-between gap-2">
                              <span className="font-black text-white">{section.label}</span>
                              <span className="rounded-full bg-black/15 px-1.5 py-0.5 text-[9px] font-black text-slate-200">{section.items.length}</span>
                            </div>
                            <ul className="grid gap-0.5">
                              {section.items.map((item) => (
                                <li key={`${section.label}-${item.name}`} className="truncate text-[11px] text-slate-100">
                                  <span className="font-bold">{item.name}</span>
                                  <span className="text-slate-300">: </span>
                                  <span>{item.previousValue ? `${item.previousValue} -> ${item.value}` : item.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-white/[.07] p-3">
                      <button type="button" onClick={() => openComparison(selectedGroup, step.variant, "full")} className="w-full rounded-lg border border-white/15 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:border-[#22b8aa]/50 hover:text-[#5ee6d8]">
                        高亮查看完整参数
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/[.025] p-4">
            <h3 className="text-base font-black text-white">全系标配</h3>
            <p className="mt-1 text-xs text-slate-500">所有版本一致的关键配置单独收纳，避免在对比表里反复占空间。</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {buildSharedSpecItems(selectedGroup).map((item) => (
                <div key={item} className="rounded-lg border border-white/[.07] bg-[#0c1322] px-3 py-2 text-sm text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </section>
        </AdminPanel>
      ) : null}

      {route.view === "comparison" && selectedGroup ? (
        <AdminPanel title={`${selectedGroup.brand} ${selectedGroup.model} 完整参数对比`} subtitle={`已高亮 ${selectedGroup.variants.find((variant) => variant.id === highlightedVariantId)?.trim || highlightedVariantId}`}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setRoute({ view: "detail", groupKey: selectedGroup.key })} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-black text-slate-300 transition hover:border-white/30">
                返回车型详情
              </button>
              <AdminSummaryChip label="级别" value={selectedGroup.segment || "-"} tone="accent" />
              <AdminSummaryChip label="能源" value={selectedGroup.energyType || "-"} />
              <AdminSummaryChip label="版本" value={`${selectedGroup.variants.length} 个`} />
            </div>
            <div className="inline-grid grid-cols-2 rounded-xl border border-white/10 bg-[#0c1322] p-1">
              <button type="button" onClick={() => setMode("core")} className={`rounded-lg px-3 py-2 text-xs font-black transition ${mode === "core" ? "bg-[#22b8aa] text-[#07111f]" : "text-slate-400 hover:text-white"}`}>
                主要参数
              </button>
              <button type="button" onClick={() => setMode("full")} className={`rounded-lg px-3 py-2 text-xs font-black transition ${mode === "full" ? "bg-[#22b8aa] text-[#07111f]" : "text-slate-400 hover:text-white"}`}>
                明细参数
              </button>
            </div>
          </div>

          <div className="max-w-full overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[980px] border-separate border-spacing-0 text-left text-sm">
              <thead>
                <tr>
                  <th className="sticky left-0 z-20 w-44 border-b border-white/10 bg-[#111827] px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">参数</th>
                  {selectedGroup.variants.map((variant) => (
                    <th key={variant.id} className={`min-w-52 border-b border-white/10 px-4 py-4 align-top ${variant.id === highlightedVariantId ? "bg-[#22b8aa]/15 shadow-[inset_0_2px_0_#22b8aa]" : "bg-[#111827]"}`}>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-[#22b8aa]">{variant.year}款</span>
                      <strong className="mt-1 block text-sm leading-snug text-white">{variant.trim || variant.id}</strong>
                      <span className="mt-2 block font-mono text-[10px] text-slate-500">{variant.id}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={`${row.category}-${row.label}`} className="transition hover:bg-white/[.035]">
                    <th className="sticky left-0 z-10 border-b border-white/[.06] bg-[#111827] px-4 py-3 align-top">
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-600">{row.category}</span>
                      <span className="mt-1 block text-sm font-black text-slate-200">{row.label}</span>
                    </th>
                    {selectedGroup.variants.map((variant) => (
                      <td key={`${variant.id}-${row.label}`} className={`border-b border-white/[.06] px-4 py-3 align-top text-slate-300 ${variant.id === highlightedVariantId ? "bg-[#22b8aa]/10 text-white" : ""}`}>
                        {row.values[variant.id] || <span className="text-slate-600">待补充</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                {comparisonRows.length === 0 ? (
                  <tr>
                    <td colSpan={selectedGroup.variants.length + 1} className="px-4 py-10 text-center text-sm text-slate-600">
                      暂无参数
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </AdminPanel>
      ) : null}
    </div>
  );
}

function AdminVehicles({ data, onEdit }: { data: BootstrapData; onEdit: (vehicle: Vehicle) => void }) {
  const sellableModels = buildSellableModels(data);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [supplyFilter, setSupplyFilter] = useState("all");
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleModels = sellableModels
    .map((item) => {
      const rawVehicles = vehiclesForSellableModel(data.vehicles, item).filter((vehicle) => vehicleMatchesAdminFilters(vehicle, item, normalizedSearch, supplyFilter));
      const offers = item.offers.filter((offer) => offerMatchesAdminFilters(offer, item, normalizedSearch, supplyFilter));
      const modelMatches = modelMatchesAdminSearch(item, normalizedSearch);
      return {
        ...item,
        offers: modelMatches && supplyFilter === "all" ? item.offers : offers,
        rawVehicles: modelMatches && supplyFilter === "all" ? vehiclesForSellableModel(data.vehicles, item) : rawVehicles,
        modelMatches,
      };
    })
    .filter((item) => item.modelMatches || item.offers.length > 0 || item.rawVehicles.length > 0);

  function toggleModel(key: string) {
    setExpandedModels((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 rounded-xl border border-white/10 bg-white/[.045] p-4 sm:grid-cols-[minmax(0,1fr)_180px] sm:items-end sm:p-5">
        <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
          搜索车源
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1322] px-4 py-3 text-sm font-medium normal-case tracking-normal text-white outline-none transition placeholder:text-slate-600 focus:border-[#22b8aa]"
            placeholder="品牌、车型、版本、颜色、供应商、资源 ID"
          />
        </label>
        <label className="grid gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
          供应类型
          <select
            value={supplyFilter}
            onChange={(event) => setSupplyFilter(event.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1322] px-4 py-3 text-sm font-bold normal-case tracking-normal text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">全部</option>
            <option value="in-stock">现车</option>
            <option value="preorder">可订车</option>
            <option value="no-stock">暂无库存</option>
          </select>
        </label>
      </section>

      {sellableModels.length === 0 && <AdminPanel title="车辆资源" subtitle="按车型管理车源"><Empty text="暂无车辆资源" /></AdminPanel>}
      {sellableModels.length > 0 && visibleModels.length === 0 && <AdminPanel title="搜索结果" subtitle="没有匹配的车型或车源"><Empty text="没有找到匹配车源" /></AdminPanel>}
      {visibleModels.map((item) => {
        const rawVehicles = item.rawVehicles;
        const isExpanded = expandedModels.has(item.key);

        return (
          <section key={item.key} className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[.045] p-4 shadow-2xl shadow-black/10 sm:p-5">
            <header className="grid gap-3 border-b border-white/10 pb-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#22b8aa]">可售车型 / 车源分组</p>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                  <h2 className="break-words text-2xl font-black text-white">{item.brand} {item.model} {formatModelYear(item.year)}</h2>
                  <AdminSummaryChip label="级别" value={item.segment || "EV"} />
                  <AdminSummaryChip label="供应" value={formatSupplySummary(item)} />
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-2 xl:justify-end">
                <AdminSummaryChip label="FOB" value={item.fobPriceRange.replace(/^FOB\s*/i, "")} tone="accent" />
                <AdminSummaryChip label="现车" value={`${item.stockQuantity} 台`} />
                <AdminSummaryChip label="明细" value={`${item.offers.length} 条`} />
                <button
                  type="button"
                  onClick={() => toggleModel(item.key)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[.035] px-3 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:border-[#22b8aa]/40 hover:bg-[#22b8aa]/10"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? "收起" : "展开"}
                  <span className="text-xs text-[#5ee6d8]" aria-hidden="true">{isExpanded ? "▲" : "▼"}</span>
                </button>
              </div>
            </header>

            {isExpanded && (
            <div className="mt-4 grid gap-5">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-white">车源明细</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">客户可见合并结果</span>
                </div>
                <AdminTable
                  headers={["年款", "版本/配置", "外部颜色", "数量", "供应", "周期/地点", "FOB"]}
                  rows={item.offers.map((offer) => [
                    offer.year || "-",
                    compactJoin([offer.trim, offer.configuration]),
                    formatColorPair(offer.exteriorColor, offer.interiorColor),
                    `${offer.quantity} 台`,
                    <AdminStatusBadge key="supply" status={offer.supplyType} />,
                    compactJoin([offer.leadTime || (offer.supplyType === "In Stock" ? "现车" : ""), offer.location]),
                    offer.price ? `FOB ${formatUsdStrict(offer.price)}` : offer.priceLabel,
                  ])}
                  emptyText="暂无车源明细"
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-white">原始批次</h3>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">内部供应商和编辑入口</span>
                </div>
                <AdminTable
                  headers={["资源 ID", "车型版本", "外部颜色", "内部颜色", "供应商/录入人", "地点", "库存/供应", "FOB/成本", "操作"]}
                  rows={rawVehicles.map((vehicle) => [
                    <span key="id" className="font-mono text-xs text-[#22b8aa]">{vehicle.id}</span>,
                    vehicleName(vehicle),
                    formatColorPair(vehicle.exteriorColor || vehicle.color, vehicle.interiorColor),
                    compactJoin([vehicle.supplierExteriorColor, vehicle.supplierInteriorColor, vehicle.colorCode]),
                    compactJoin([vehicle.supplier, vehicle.recorder]),
                    vehicle.location || "-",
                    compactJoin([`${vehicle.stockQuantity} 台`, getSupplyType(vehicle), vehicle.status === "Preorder" ? vehicle.leadTime || "周期待确认" : vehicle.leadTime]),
                    compactJoin([vehicle.partnerPrice ? `FOB ${formatUsdStrict(vehicle.partnerPrice)}` : formatUsd(vehicle.price), vehicle.cost ? `成本 ${formatUsdStrict(vehicle.cost)}` : ""]),
                    <button
                      key="edit"
                      type="button"
                      onClick={() => onEdit(vehicle)}
                      className="min-w-[64px] rounded-lg border border-[#22b8aa]/40 px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#5ee6d8] transition hover:border-[#22b8aa] hover:bg-[#22b8aa]/10"
                    >
                      编辑
                    </button>,
                  ])}
                  emptyText="暂无原始批次"
                />
              </div>
            </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function AdminQuotes({ data }: { data: BootstrapData }) {
  return (
    <AdminPanel title="询价管理" subtitle="客户询价、报价版本和议价过程">
      <AdminTable
        headers={["询价号", "客户", "车辆", "目标价", "最新报价", "状态", "更新时间"]}
        rows={data.inquiries.map((inquiry) => {
          const quote = latestQuoteForInquiry(inquiry.inquiryNo, data.quotes);
          const customer = findCustomer(data, inquiry.customerId);
          return [
            inquiry.inquiryNo,
            customer?.company || inquiry.customerId || "-",
            inquiry.vehicleModel || inquiry.vehicleId,
            inquiry.targetPrice ? formatUsdStrict(inquiry.targetPrice) : "-",
            quote ? `${quote.quoteNo} / V${quote.version} / ${formatUsdStrict(quote.unitPrice)}` : "待报价",
            <AdminStatusBadge key="status" status={quote?.status || inquiry.status || "Pending"} />,
            formatDate(inquiry.updatedAt || inquiry.createdAt),
          ];
        })}
        emptyText="暂无询价"
      />
    </AdminPanel>
  );
}

function AdminOrders({ data }: { data: BootstrapData }) {
  return (
    <AdminPanel title="订单管理" subtitle="已接受报价形成的订单记录">
      <AdminTable
        headers={["订单号", "客户", "报价号", "车辆", "数量", "总额", "状态", "创建时间"]}
        rows={data.orders.map((order) => {
          const customer = findCustomer(data, order.customerId);
          return [
            order.orderNo,
            customer?.company || order.customerId || "-",
            order.quoteNo || "-",
            order.vehicleId,
            `${order.quantity} 台`,
            formatUsdStrict(order.total),
            <AdminStatusBadge key="status" status={order.status || "Draft"} />,
            formatDate(order.createdAt),
          ];
        })}
        emptyText="暂无订单"
      />
    </AdminPanel>
  );
}

function AdminPayments({ data }: { data: BootstrapData }) {
  const total = data.orders.reduce((sum, order) => sum + order.total, 0);
  const paid = data.orders
    .filter((order) => order.status.toLowerCase().includes("paid"))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <AdminStat label="应收订单额" value={formatUsdStrict(total)} note={`${data.orders.length} 个订单`} />
        <AdminStat label="已收金额" value={formatUsdStrict(paid)} note="按订单状态汇总" />
        <AdminStat label="待收余额" value={formatUsdStrict(Math.max(total - paid, 0))} note="财务明细表待扩展" />
      </section>
      <AdminPanel title="收款财务" subtitle="订单金额、付款条款和收款状态">
        <AdminTable
          headers={["订单号", "客户", "付款条款", "订单金额", "收款状态"]}
          rows={data.orders.map((order) => {
            const customer = findCustomer(data, order.customerId);
            return [
              order.orderNo,
              customer?.company || order.customerId || "-",
              order.paymentTerms || "-",
              formatUsdStrict(order.total),
              <AdminStatusBadge key="status" status={order.status || "Draft"} />,
            ];
          })}
          emptyText="暂无财务记录"
        />
      </AdminPanel>
    </div>
  );
}

function AdminLogistics({ data }: { data: BootstrapData }) {
  const shippedCount = data.orders.filter((order) => /ship|shipped|shipping|装船|发运/i.test(order.status)).length;
  const customsCount = data.orders.filter((order) => /custom|clearance|清关/i.test(order.status)).length;
  const steps = [
    ["询价", data.inquiries.length, "客户提交需求"],
    ["报价", data.quotes.length, "销售给出版本"],
    ["订单", data.orders.length, "确认成交"],
    ["收款", data.orders.filter((order) => /paid|deposit|付款|定金/i.test(order.status)).length, "财务状态"],
    ["装船", shippedCount, "出口发运"],
    ["清关", customsCount, "目的港流程"],
  ];

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {steps.map(([label, count, note]) => (
          <AdminStat key={String(label)} label={String(label)} value={String(count)} note={String(note)} />
        ))}
      </section>
      <AdminPanel title="出口流程" subtitle="订单物流节点总览">
        <AdminTable
          headers={["订单号", "客户", "车辆", "数量", "当前节点", "创建时间"]}
          rows={data.orders.map((order) => {
            const customer = findCustomer(data, order.customerId);
            return [
              order.orderNo,
              customer?.company || order.customerId || "-",
              order.vehicleId,
              `${order.quantity} 台`,
              <AdminStatusBadge key="status" status={order.status || "Draft"} />,
              formatDate(order.createdAt),
            ];
          })}
          emptyText="暂无出口流程记录"
        />
      </AdminPanel>
    </div>
  );
}

function AdminCustomers({ data }: { data: BootstrapData }) {
  const customers = data.customers || [];
  return (
    <AdminPanel title="客户资料" subtitle="飞书 External Accounts 表中的外部账号和价格权限">
      <AdminTable
        headers={["客户 ID", "公司", "联系人", "邮箱", "角色", "价格权限", "国家", "状态"]}
        rows={customers.map((customer) => [
          <span key="id" className="font-mono text-xs text-[#22b8aa]">{customer.customerId}</span>,
          customer.company || "-",
          customer.contact || "-",
          customer.email || "-",
          adminRoleLabels[customer.role],
          customer.priceTier,
          customer.country || "-",
          <AdminStatusBadge key="status" status={customer.status || "Active"} />,
        ])}
        emptyText="暂无客户资料"
      />
    </AdminPanel>
  );
}

function AdminStaff({ data }: { data: BootstrapData }) {
  const users = data.internalUsers || [];
  const rows =
    users.length > 0
      ? users.map((user) => [
          user.userId || "-",
          user.name || "-",
          user.email || "-",
          adminRoleLabels[user.role],
          compactJoin([
            user.canEditVehicles ? "车源编辑" : "",
            user.canSeeCost ? "成本" : "",
            user.canSeeSupplier ? "供应商" : "",
          ]),
          user.department || "-",
          user.status || "Active",
        ])
      : [
          [data.user.userId || "USR-ADMIN", data.user.name || data.user.email, data.user.email, adminRoleLabels[data.user.role], "当前登录账号", "-", "Active"],
        ];

  return (
    <AdminPanel title="员工账号" subtitle="飞书 Internal Users 表中的内部账号和权限">
      <AdminTable
        headers={["User ID", "姓名", "邮箱", "角色", "权限", "部门", "状态"]}
        rows={rows.map((row) => [
          <span key="id" className="font-mono text-xs text-[#22b8aa]">{row[0]}</span>,
          row[1],
          row[2],
          row[3],
          row[4] || "-",
          row[5],
          <AdminStatusBadge key="status" status={row[6]} />,
        ])}
        emptyText="暂无员工账号"
      />
    </AdminPanel>
  );
}

function AdminFiles({ data }: { data: BootstrapData }) {
  const fileRows = [
    ["报价与 PI", data.quotes.length, "Quotes"],
    ["订单合同", data.orders.length, "Orders"],
    ["收款凭证", 0, "Payments"],
    ["出口单证", data.orders.length, "Logistics"],
  ];

  return (
    <AdminPanel title="文件中心" subtitle="按业务对象归档的文件入口">
      <AdminTable
        headers={["分类", "关联数量", "来源表"]}
        rows={fileRows.map((row) => [String(row[0]), `${row[1]} 条`, String(row[2])])}
        emptyText="暂无文件"
      />
    </AdminPanel>
  );
}

function VehicleEditModal({ vehicle, onClose, onSaved }: { vehicle: Vehicle; onClose: () => void; onSaved: () => Promise<void> }) {
  const editableFields = new Set(vehicle.editableFields || []);
  const canEditOptionalField = (fieldName: string) => editableFields.has(fieldName);
  const [form, setForm] = useState({
    modelId: vehicle.modelId || "",
    color: vehicle.color || "",
    exteriorColor: vehicle.exteriorColor || vehicle.color || "",
    interiorColor: vehicle.interiorColor || "",
    supplierExteriorColor: vehicle.supplierExteriorColor || "",
    supplierInteriorColor: vehicle.supplierInteriorColor || "",
    colorCode: vehicle.colorCode || "",
    colorNotes: vehicle.colorNotes || "",
    colorConfirmed: vehicle.colorConfirmed,
    configuration: vehicle.configuration || "",
    supplier: vehicle.supplier || "",
    recorder: vehicle.recorder || "",
    location: vehicle.location || "",
    status: vehicle.status || "In Stock",
    stockQuantity: String(vehicle.stockQuantity ?? 0),
    leadTime: vehicle.leadTime || "",
    partnerPrice: vehicle.partnerPrice ? String(vehicle.partnerPrice) : "",
    customerPrice: vehicle.customerPrice ? String(vehicle.customerPrice) : "",
    cost: vehicle.cost ? String(vehicle.cost) : "",
    priceValidUntil: vehicle.priceValidUntil || "",
    publicNotes: vehicle.publicNotes || "",
    imageUrl: vehicle.imageUrl || "",
    exportStatus: vehicle.exportStatus || "Exportable Now",
    isListed: vehicle.isListed,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(key: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api(`/api/portal/vehicles/${encodeURIComponent(vehicle.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          modelId: form.modelId,
          color: form.color,
          exteriorColor: form.exteriorColor,
          interiorColor: form.interiorColor,
          supplierExteriorColor: form.supplierExteriorColor,
          supplierInteriorColor: form.supplierInteriorColor,
          colorCode: form.colorCode,
          colorNotes: form.colorNotes,
          colorConfirmed: form.colorConfirmed,
          configuration: form.configuration,
          supplier: form.supplier,
          recorder: form.recorder,
          location: form.location,
          status: form.status,
          stockQuantity: Number(form.stockQuantity || 0),
          leadTime: form.leadTime,
          partnerPrice: form.partnerPrice === "" ? null : Number(form.partnerPrice),
          customerPrice: form.customerPrice === "" ? null : Number(form.customerPrice),
          cost: form.cost === "" ? null : Number(form.cost),
          priceValidUntil: form.priceValidUntil,
          publicNotes: form.publicNotes,
          imageUrl: form.imageUrl,
          exportStatus: form.exportStatus,
          isListed: form.isListed,
        }),
      });
      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`编辑车源 / ${vehicle.id}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {canEditOptionalField("Model ID") && (
            <FormField label="Model ID">
              <input value={form.modelId} onChange={(event) => updateField("modelId", event.target.value)} placeholder="MDL-001" />
            </FormField>
          )}
          <FormField label="状态">
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              <option>In Stock</option>
              <option>Preorder</option>
              <option>Unavailable</option>
            </select>
          </FormField>
          <FormField label="颜色">
            <input value={form.color} onChange={(event) => updateField("color", event.target.value)} />
          </FormField>
          {canEditOptionalField("Exterior Color") && (
            <FormField label="外部外观颜色">
              <input value={form.exteriorColor} onChange={(event) => updateField("exteriorColor", event.target.value)} placeholder="White" />
            </FormField>
          )}
          {canEditOptionalField("Interior Color") && (
            <FormField label="外部内饰颜色">
              <input value={form.interiorColor} onChange={(event) => updateField("interiorColor", event.target.value)} placeholder="Black" />
            </FormField>
          )}
          {canEditOptionalField("Supplier Exterior Color") && (
            <FormField label="供应商外观色">
              <input value={form.supplierExteriorColor} onChange={(event) => updateField("supplierExteriorColor", event.target.value)} placeholder="珍珠白 / 极地白" />
            </FormField>
          )}
          {canEditOptionalField("Supplier Interior Color") && (
            <FormField label="供应商内饰色">
              <input value={form.supplierInteriorColor} onChange={(event) => updateField("supplierInteriorColor", event.target.value)} placeholder="黑内 / 米内" />
            </FormField>
          )}
          {canEditOptionalField("Color Code") && (
            <FormField label="色号">
              <input value={form.colorCode} onChange={(event) => updateField("colorCode", event.target.value)} />
            </FormField>
          )}
          {canEditOptionalField("Configuration") && (
            <FormField label="配置">
              <input value={form.configuration} onChange={(event) => updateField("configuration", event.target.value)} placeholder="Standard export configuration" />
            </FormField>
          )}
          {canEditOptionalField("Supplier") && (
            <FormField label="供应商">
              <input value={form.supplier} onChange={(event) => updateField("supplier", event.target.value)} />
            </FormField>
          )}
          {canEditOptionalField("Recorder") && (
            <FormField label="录入人">
              <input value={form.recorder} onChange={(event) => updateField("recorder", event.target.value)} placeholder="录入人姓名" />
            </FormField>
          )}
          <FormField label="地点">
            <input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
          </FormField>
          <FormField label="库存数量">
            <input type="number" min="0" value={form.stockQuantity} onChange={(event) => updateField("stockQuantity", event.target.value)} />
          </FormField>
          {canEditOptionalField("Lead Time") && (
            <FormField label="订车周期">
              <input value={form.leadTime} onChange={(event) => updateField("leadTime", event.target.value)} placeholder="30-45 days after deposit" />
            </FormField>
          )}
          <FormField label="合作价">
            <input type="number" value={form.partnerPrice} onChange={(event) => updateField("partnerPrice", event.target.value)} />
          </FormField>
          <FormField label="客户价">
            <input type="number" value={form.customerPrice} onChange={(event) => updateField("customerPrice", event.target.value)} />
          </FormField>
          <FormField label="成本">
            <input type="number" value={form.cost} onChange={(event) => updateField("cost", event.target.value)} />
          </FormField>
          {canEditOptionalField("Price Valid Until") && (
            <FormField label="价格有效期">
              <input value={form.priceValidUntil} onChange={(event) => updateField("priceValidUntil", event.target.value)} placeholder="2026-07-31" />
            </FormField>
          )}
          <FormField label="图片 URL">
            <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />
          </FormField>
        </div>

        <FormField label="备注">
          <textarea value={form.publicNotes} onChange={(event) => updateField("publicNotes", event.target.value)} />
        </FormField>

        {canEditOptionalField("Color Notes") && (
          <FormField label="颜色内部备注">
            <textarea value={form.colorNotes} onChange={(event) => updateField("colorNotes", event.target.value)} placeholder="以实拍图为准、供应商原始描述等" />
          </FormField>
        )}

        {canEditOptionalField("Color Confirmed") && (
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-bold text-slate-300">
            <input
              checked={form.colorConfirmed}
              onChange={(event) => updateField("colorConfirmed", event.target.checked)}
              type="checkbox"
              className="h-4 w-4 accent-[#22b8aa]"
            />
            颜色已确认
          </label>
        )}

        <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-bold text-slate-300">
          <input
            checked={form.isListed}
            onChange={(event) => updateField("isListed", event.target.checked)}
            type="checkbox"
            className="h-4 w-4 accent-[#22b8aa]"
          />
          对外上架显示
        </label>

        {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-bold text-red-300">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-xl border border-white/15 px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-300 transition hover:border-white/30">
            取消
          </button>
          <button disabled={saving} className="btn-primary rounded-xl px-5 py-3 text-[10px] font-black uppercase tracking-widest disabled:opacity-60">
            {saving ? "保存中..." : "保存到飞书"}
          </button>
        </div>
      </form>
    </Modal>
  );
}

function AdminPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-white/10 bg-white/[.045] p-4 shadow-2xl shadow-black/10 sm:p-5">
      <div className="mb-4">
        <h2 className="text-lg font-black text-white">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function AdminStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[.045] p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <strong className="mt-2 block text-2xl font-black text-white">{value}</strong>
      <span className="mt-2 block text-xs text-slate-500">{note}</span>
    </div>
  );
}

function AdminTopMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2">
      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <strong className="mt-1 block truncate text-sm text-white">{value}</strong>
    </div>
  );
}

function AdminSummaryChip({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "accent" }) {
  const toneClass = tone === "accent" ? "border-[#22b8aa]/30 bg-[#22b8aa]/10 text-[#5ee6d8]" : "border-white/10 bg-white/[.045] text-slate-300";
  return (
    <span className={`inline-flex h-8 max-w-full items-center gap-1.5 rounded-lg border px-2.5 text-xs font-bold ${toneClass}`}>
      <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      <span className="truncate">{value || "-"}</span>
    </span>
  );
}

function AdminTable({ headers, rows, emptyText }: { headers: string[]; rows: ReactNode[][]; emptyText: string }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-full table-fixed border-separate border-spacing-0 text-left text-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} className="border-b border-white/10 px-3 py-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-3 py-8 text-center text-sm text-slate-600">
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition hover:bg-white/[.035]">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="break-words border-b border-white/[.06] px-3 py-3 align-middle text-slate-300">
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function AdminStatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone =
    /active|accepted|listed|paid|启用|已|active/.test(normalized)
      ? "border-[#22b8aa]/30 bg-[#22b8aa]/10 text-[#5ee6d8]"
      : /pending|draft|wait|待/.test(normalized)
        ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
        : "border-white/10 bg-white/[.05] text-slate-300";

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${tone}`}>
      {status || "-"}
    </span>
  );
}

function AdminNavIcon({ name }: { name: AdminIconName }) {
  const common = {
    className: "h-5 w-5 shrink-0",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  } as const;

  switch (name) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "vehicle_models":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M8 13h8" />
          <path d="M8 17h6" />
        </svg>
      );
    case "vehicles":
      return (
        <svg {...common}>
          <path d="M5 17h14" />
          <path d="M6 17l1.5-5A3 3 0 0 1 10.4 10h3.2a3 3 0 0 1 2.9 2l1.5 5" />
          <circle cx="8" cy="17" r="2" />
          <circle cx="16" cy="17" r="2" />
          <path d="M9 10V7h6v3" />
        </svg>
      );
    case "quotes":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4.5A3 3 0 0 1 15 4.5" />
          <path d="M8 11h8" />
          <path d="M8 15h6" />
        </svg>
      );
    case "orders":
      return (
        <svg {...common}>
          <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z" />
          <path d="M4 7.5l8 4.5 8-4.5" />
          <path d="M12 12v9" />
        </svg>
      );
    case "payments":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </svg>
      );
    case "logistics":
      return (
        <svg {...common}>
          <path d="M4 17h16" />
          <path d="M7 17l-2-6h14l-2 6" />
          <path d="M9 11V6h6v5" />
          <path d="M6 20c1.5 1 3 1 4.5 0s3-1 4.5 0 3 1 4.5 0" />
        </svg>
      );
    case "customers":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15.5 20a4.5 4.5 0 0 1 5-4" />
        </svg>
      );
    case "staff":
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5c0 4.5-2.8 8-7 10-4.2-2-7-5.5-7-10V6z" />
          <path d="M9 12l2 2 4-5" />
        </svg>
      );
    case "files":
      return (
        <svg {...common}>
          <path d="M7 8l5-3 5 3-5 3z" />
          <path d="M4 13l5-3 5 3-5 3z" />
          <path d="M10 13l5-3 5 3-5 3z" />
          <path d="M9 16v4" />
          <path d="M15 16v4" />
        </svg>
      );
  }
}

function latestQuoteForInquiry(inquiryNo: string, quotes: Quote[]) {
  return [...quotes]
    .filter((quote) => quote.inquiryNo === inquiryNo)
    .sort((a, b) => b.version - a.version || getDateTime(b.createdAt) - getDateTime(a.createdAt))[0] || null;
}

function findCustomer(data: BootstrapData, customerId: string) {
  return (data.customers || []).find((customer) => customer.customerId === customerId);
}

function isInternalUser(user: PortalUser) {
  return user.accountType === "internal" || ["admin", "sales", "sourcing", "finance"].includes(user.role);
}

function buildModelProfileGroups(data: BootstrapData): ModelProfileGroup[] {
  const specsByModel = new Map<string, VehicleModelSpec[]>();
  for (const spec of data.vehicleModelSpecs || []) {
    if (!spec.modelId) continue;
    if (!specsByModel.has(spec.modelId)) specsByModel.set(spec.modelId, []);
    specsByModel.get(spec.modelId)!.push(spec);
  }
  for (const specs of specsByModel.values()) {
    specs.sort((a, b) => categoryRank(a.category) - categoryRank(b.category) || (a.sortOrder || 9999) - (b.sortOrder || 9999) || a.name.localeCompare(b.name));
  }

  const activeModels = (data.vehicleModels || []).filter((model) => !/archived/i.test(model.status));
  const models = activeModels.length ? activeModels : data.vehicleModels || [];
  const grouped = new Map<string, ModelProfileGroup>();
  for (const model of models) {
    const key = normalizeKey(model.brand, model.model);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        brand: model.brand,
        model: model.model,
        years: [],
        variants: [],
        specsByModel,
        segment: "",
        energyType: "",
        marketPosition: "",
        rangeSummary: "",
        guidePriceSummary: "",
      });
    }
    const group = grouped.get(key)!;
    group.variants.push(model);
    if (model.year && !group.years.includes(model.year)) group.years.push(model.year);
  }

  const groups = [...grouped.values()];
  for (const group of groups) {
    group.variants.sort((a, b) => {
      const yearOrder = String(b.year).localeCompare(String(a.year));
      if (yearOrder) return yearOrder;
      return getVariantGuidePriceNumber(group.specsByModel, a) - getVariantGuidePriceNumber(group.specsByModel, b) || a.trim.localeCompare(b.trim);
    });
    group.years.sort((a, b) => b.localeCompare(a));
    const first = group.variants[0];
    group.segment = getModelSpecValue(group.specsByModel, first?.id || "", ["车身级别"]) || first?.bodyType || "";
    group.energyType = getModelSpecValue(group.specsByModel, first?.id || "", ["能源类型"]) || first?.fuelType || "";
    group.marketPosition = getModelSpecValue(group.specsByModel, first?.id || "", ["市场定位"]) || first?.marketPosition || "";
    group.rangeSummary = summarizeGroupSpec(group, ["CLTC续航"]);
    group.guidePriceSummary = summarizeGuidePriceGroup(group);
  }
  return groups.sort((a, b) => `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`));
}

function modelProfileGroupMatchesSearch(group: ModelProfileGroup, query: string) {
  if (!query) return true;
  return adminSearchText([
    group.brand,
    group.model,
    group.years.join(" "),
    group.segment,
    group.energyType,
    group.marketPosition,
    group.rangeSummary,
    group.guidePriceSummary,
    ...group.variants.map((variant) => `${variant.id} ${variant.year} ${variant.trim}`),
  ]).includes(query);
}

function summarizeGroupSpec(group: ModelProfileGroup, names: string[]) {
  const values = group.variants
    .map((variant) => getModelSpecValue(group.specsByModel, variant.id, names))
    .filter(Boolean);
  const unique = [...new Set(values)];
  if (unique.length === 0) return "";
  if (unique.length === 1) return unique[0];
  const numbers = unique
    .map((value) => Number(String(value).match(/[\d,.]+/)?.[0]?.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));
  if (numbers.length === unique.length) {
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    const suffix = String(unique[0]).replace(/^[\d,.\s-]+/, "").trim();
    return min === max ? `${min}${suffix ? ` ${suffix}` : ""}` : `${min} - ${max}${suffix ? ` ${suffix}` : ""}`;
  }
  return unique.length <= 2 ? unique.join(" / ") : `${unique[0]} - ${unique[unique.length - 1]}`;
}

function summarizeGuidePriceGroup(group: ModelProfileGroup) {
  const values = group.variants
    .map((variant) => getModelSpecValue(group.specsByModel, variant.id, ["中国官方指导价"]))
    .filter(Boolean);
  const numbers = values
    .map((value) => Number(String(value).match(/[\d,.]+/)?.[0]?.replace(/,/g, "")))
    .filter((value) => Number.isFinite(value));
  if (numbers.length === 0) return "";
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  return min === max ? formatCnyCompact(min) : `${formatCnyCompact(min)}-${formatCnyCompact(max)}`;
}

function formatCnyCompact(value: number) {
  return `¥${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
}

function buildModelComparisonRows(group: ModelProfileGroup, mode: "core" | "full"): ModelComparisonRow[] {
  const rows = new Map<string, ModelComparisonRow>();
  const activeNames = new Set(modelCoreSpecNames);
  for (const variant of group.variants) {
    const specs = group.specsByModel.get(variant.id) || [];
    for (const spec of specs) {
      if (!spec.name || !spec.value) continue;
      if (mode === "core" && !activeNames.has(spec.name)) continue;
      const key = `${spec.category}::${spec.name}`;
      if (!rows.has(key)) {
        rows.set(key, {
          category: spec.category || "其他",
          label: spec.name,
          sortOrder: spec.sortOrder || 9999,
          values: {},
        });
      }
      rows.get(key)!.values[variant.id] = formatSpecValue(spec);
    }
  }
  const result = [...rows.values()].sort((a, b) => {
    if (mode === "core") return modelCoreSpecNames.indexOf(a.label) - modelCoreSpecNames.indexOf(b.label);
    return categoryRank(a.category) - categoryRank(b.category) || a.sortOrder - b.sortOrder || a.label.localeCompare(b.label);
  });
  return result;
}

function buildVariantDifferenceSteps(group: ModelProfileGroup): VariantDifferenceStep[] {
  const ignoredNames = new Set(["品牌", "车系", "车型", "年款", "版本", "市场定位", "原始参数JSON", "出口备注", "版本核对", "中国官方指导价"]);
  const entryNames = new Set(["车身级别", "能源类型", "CLTC续航", "电池容量", "电池类型", "电机总功率", "驱动方式", "座位数"]);
  const sections: VariantDifferenceStep["sections"] = [];
  return group.variants.map((variant, index) => {
    const specs = (group.specsByModel.get(variant.id) || [])
      .filter((spec) => spec.name && spec.value && !ignoredNames.has(spec.name))
      .sort((a, b) => upgradeSpecRank(a) - upgradeSpecRank(b) || categoryRank(a.category) - categoryRank(b.category) || (a.sortOrder || 9999) - (b.sortOrder || 9999));
    const previous = index > 0 ? group.variants[index - 1] : null;
    const previousValues = new Map((previous ? group.specsByModel.get(previous.id) || [] : []).map((spec) => [spec.name, formatSpecValue(spec)]));
    const changedSpecs = (index === 0 ? specs.filter((spec) => entryNames.has(spec.name)) : specs.filter((spec) => previousValues.get(spec.name) !== formatSpecValue(spec))).slice(0, index === 0 ? 7 : 8);

    const sectionItems = changedSpecs.map((spec) => ({
      category: spec.category || "其他",
      name: spec.name,
      value: formatSpecValue(spec),
      previousValue: index === 0 ? "" : previousValues.get(spec.name) || "",
    }));
    if (index > 0 && sectionItems.length === 0) {
      sectionItems.push({
        category: "配置",
        name: "配置差异待补充",
        value: "当前参数表未记录明显新增项",
        previousValue: "",
      });
    }
    if (sectionItems.length) {
      sections.push({
        label: index === 0 ? "入门基础" : `第${index + 1}档新增/升级`,
        tone: upgradeStepColor(index),
        isCurrent: true,
        items: sectionItems,
      });
    }
    const visibleSections = sections.map((section, sectionIndex) => ({
      ...section,
      isCurrent: sectionIndex === sections.length - 1,
    }));

    return {
      variant,
      label: index === 0 ? "入门版底座" : index === group.variants.length - 1 ? "最高配升级" : "加价升级",
      price: getModelSpecValue(group.specsByModel, variant.id, ["中国官方指导价"]),
      range: getModelSpecValue(group.specsByModel, variant.id, ["CLTC续航"]),
      sections: visibleSections.length
        ? visibleSections
        : [
            {
              label: "配置待补充",
              tone: specCategoryTone("其他"),
              isCurrent: true,
              items: [
                {
                  category: "配置",
                  name: index === 0 ? "核心配置" : "差异待补充",
                  value: index === 0 ? "参数表暂无核心配置摘要" : "参数表暂无明显新增项",
                  previousValue: "",
                },
              ],
            },
          ],
    };
  });
}

function upgradeStepColor(index: number) {
  return ["#f4d35e", "#5ee6d8", "#8fb7ff", "#f5a3c7", "#b6e36a"][index % 5];
}

function specCategoryTone(category: string) {
  if (/电池|充电|电动机/.test(category)) return "#5ee6d8";
  if (/辅助|安全|智能/.test(category)) return "#8fb7ff";
  if (/座椅|内部|空调|舒适/.test(category)) return "#f5a3c7";
  if (/外部|灯光|玻璃/.test(category)) return "#f4d35e";
  if (/车身|底盘|车轮/.test(category)) return "#b6e36a";
  return "#94a3b8";
}

function upgradeSpecRank(spec: VehicleModelSpec) {
  const names = [
    "CLTC续航",
    "电池容量",
    "电池类型",
    "电机总功率",
    "电机总扭矩",
    "驱动方式",
    "充电说明",
    "ADAS",
    "辅助驾驶",
    "主动安全配置",
    "被动安全配置",
    "座椅配置",
    "多媒体/智能座舱",
    "外部配置",
    "内部配置",
    "空调/舒适",
  ];
  const exact = names.indexOf(spec.name);
  if (exact !== -1) return exact;
  if (/辅助|安全|座椅|智能|舒适|天窗|雷达|影像|屏|灯|空调/.test(`${spec.category} ${spec.name}`)) return 50;
  return 100 + categoryRank(spec.category);
}

function getVariantGuidePriceNumber(specsByModel: Map<string, VehicleModelSpec[]>, variant: VehicleModel) {
  const raw = getModelSpecValue(specsByModel, variant.id, ["中国官方指导价"]) || variant.msrpChina;
  const number = Number(String(raw).match(/[\d,.]+/)?.[0]?.replace(/,/g, ""));
  return Number.isFinite(number) ? number : Number.MAX_SAFE_INTEGER;
}

function buildSharedSpecItems(group: ModelProfileGroup) {
  const rows = buildModelComparisonRows(group, "core");
  const items = rows
    .filter((row) => {
      const values = group.variants.map((variant) => row.values[variant.id]).filter(Boolean);
      return values.length === group.variants.length && new Set(values).size === 1;
    })
    .slice(0, 18)
    .map((row) => `${row.label}: ${row.values[group.variants[0].id]}`);
  return items.length ? items : ["全系标配待补充"];
}

function getModelSpecValue(specsByModel: Map<string, VehicleModelSpec[]>, modelId: string, names: string[]) {
  const specs = specsByModel.get(modelId) || [];
  for (const name of names) {
    const spec = specs.find((item) => item.name === name);
    if (spec?.value) return formatSpecValue(spec);
  }
  return "";
}

function formatSpecValue(spec: VehicleModelSpec) {
  const text = safeText(spec.value, "");
  if (!text) return "";
  return spec.unit ? `${text} ${spec.unit}`.trim() : text;
}

function categoryRank(category: string) {
  const index = modelCategoryOrder.indexOf(category);
  return index === -1 ? modelCategoryOrder.length : index;
}

function buildSellableModels(data: BootstrapData): SellableModel[] {
  const modelsByVehicle = new Map<string, VehicleModel>();
  const modelsByName = new Map<string, VehicleModel>();
  for (const item of data.vehicleModels || []) {
    if (item.id) modelsByVehicle.set(item.id, item);
    modelsByName.set(normalizeKey(item.brand, item.model), item);
  }

  const grouped = new Map<string, { item: SellableModel; offerMap: Map<string, VehicleOffer> }>();
  for (const vehicle of data.vehicles || []) {
    const modelInfo = modelsByVehicle.get(vehicle.modelId) || modelsByName.get(normalizeKey(vehicle.brand, vehicle.model));
    const modelKey = normalizeKey(vehicle.brand, vehicle.model, vehicle.year);
    if (!grouped.has(modelKey)) {
      grouped.set(modelKey, {
        item: {
          key: modelKey,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          segment: modelInfo?.bodyType || inferVehicleSegment(vehicle),
          imageUrl: modelInfo?.imageUrl || vehicle.imageUrl,
          stockQuantity: 0,
          preorderAvailable: false,
          fobPriceRange: "FOB on request",
          offers: [],
        },
        offerMap: new Map(),
      });
    }

    const entry = grouped.get(modelKey)!;
    const supplyType = getSupplyType(vehicle);
    entry.item.stockQuantity += supplyType === "In Stock" ? vehicle.stockQuantity : 0;
    entry.item.preorderAvailable = entry.item.preorderAvailable || supplyType === "Preorder";
    if (!entry.item.imageUrl && vehicle.imageUrl) entry.item.imageUrl = vehicle.imageUrl;
    if (!entry.item.segment && modelInfo?.bodyType) entry.item.segment = modelInfo.bodyType;

    const offerKey = normalizeKey(
      vehicle.brand,
      vehicle.model,
      vehicle.year,
      vehicle.trim,
      vehicle.exteriorColor || vehicle.color,
      vehicle.interiorColor,
      vehicle.configuration,
      supplyType,
      vehicle.leadTime,
      vehicle.location,
      String(getFobPrice(vehicle) ?? ""),
    );
    const existing = entry.offerMap.get(offerKey);
    if (existing) {
      existing.quantity += vehicle.stockQuantity;
      existing.vehicles.push(vehicle);
    } else {
      entry.offerMap.set(offerKey, {
        key: offerKey,
        vehicle,
        vehicles: [vehicle],
        year: vehicle.year,
        trim: vehicle.trim,
        exteriorColor: vehicle.exteriorColor || vehicle.color,
        interiorColor: vehicle.interiorColor,
        configuration: vehicle.configuration,
        quantity: vehicle.stockQuantity,
        supplyType,
        leadTime: vehicle.leadTime,
        location: vehicle.location,
        price: getFobPrice(vehicle),
        priceLabel: vehicle.priceLabel,
      });
    }
  }

  return Array.from(grouped.values())
    .map(({ item, offerMap }) => {
      const offers = Array.from(offerMap.values()).sort((a, b) => {
        const stockRank = Number(b.supplyType === "In Stock") - Number(a.supplyType === "In Stock");
        return stockRank || (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER);
      });
      return {
        ...item,
        offers,
        fobPriceRange: formatFobRange(offers.map((offer) => offer.price).filter((price): price is number => Boolean(price))),
      };
    })
    .sort((a, b) => b.stockQuantity - a.stockQuantity || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model) || b.year.localeCompare(a.year));
}

function getFobPrice(vehicle: Vehicle) {
  return vehicle.partnerPrice ?? vehicle.price;
}

function vehiclesForSellableModel(vehicles: Vehicle[], item: SellableModel) {
  return vehicles
    .filter((vehicle) => normalizeKey(vehicle.brand, vehicle.model, vehicle.year) === item.key)
    .sort((a, b) => {
      const supplyRank = Number(getSupplyType(b) === "In Stock") - Number(getSupplyType(a) === "In Stock");
      return supplyRank || (getFobPrice(a) || Number.MAX_SAFE_INTEGER) - (getFobPrice(b) || Number.MAX_SAFE_INTEGER);
    });
}

function modelMatchesAdminSearch(item: SellableModel, query: string) {
  if (!query) return true;
  return adminSearchText([item.brand, item.model, item.year, item.segment, item.fobPriceRange]).includes(query);
}

function offerMatchesAdminFilters(offer: VehicleOffer, item: SellableModel, query: string, supplyFilter: string) {
  if (!supplyTypeMatchesFilter(offer.supplyType, supplyFilter)) return false;
  if (!query) return true;
  return adminSearchText([
    item.brand,
    item.model,
    item.segment,
    offer.year,
    offer.trim,
    offer.configuration,
    offer.exteriorColor,
    offer.interiorColor,
    offer.supplyType,
    offer.leadTime,
    offer.location,
    offer.price ? formatUsdStrict(offer.price) : offer.priceLabel,
  ]).includes(query);
}

function vehicleMatchesAdminFilters(vehicle: Vehicle, item: SellableModel, query: string, supplyFilter: string) {
  if (!supplyTypeMatchesFilter(getSupplyType(vehicle), supplyFilter)) return false;
  if (!query) return true;
  return adminSearchText([
    item.brand,
    item.model,
    item.segment,
    vehicle.id,
    vehicle.modelId,
    vehicle.brand,
    vehicle.model,
    vehicle.trim,
    vehicle.year,
    vehicle.color,
    vehicle.exteriorColor,
    vehicle.interiorColor,
    vehicle.supplierExteriorColor,
    vehicle.supplierInteriorColor,
    vehicle.colorCode,
    vehicle.configuration,
    vehicle.supplier,
    vehicle.recorder,
    vehicle.location,
    vehicle.status,
    vehicle.leadTime,
    vehicle.publicNotes,
    vehicle.partnerPrice ? formatUsdStrict(vehicle.partnerPrice) : "",
    vehicle.cost ? formatUsdStrict(vehicle.cost) : "",
  ]).includes(query);
}

function supplyTypeMatchesFilter(supplyType: string, supplyFilter: string) {
  if (supplyFilter === "all") return true;
  const normalized = supplyType.toLowerCase();
  if (supplyFilter === "in-stock") return normalized === "in stock";
  if (supplyFilter === "preorder") return normalized === "preorder";
  if (supplyFilter === "no-stock") return normalized === "no stock";
  return true;
}

function adminSearchText(values: Array<string | number | null | undefined>) {
  return values.map((value) => String(value ?? "")).join(" ").toLowerCase();
}

function inferVehicleSegment(vehicle: Vehicle) {
  const name = `${vehicle.brand} ${vehicle.model}`.toLowerCase();
  if (name.includes("seagull")) return "Hatchback";
  if (name.includes("yuan plus") || name.includes("galaxy e5")) return "Compact SUV";
  if (name.includes("pickup") || name.includes("shark") || name.includes("cannon")) return "Pickup";
  if (name.includes("van")) return "Van";
  return "EV";
}

function getSupplyType(vehicle: Vehicle) {
  const status = vehicle.status.toLowerCase();
  if (status.includes("preorder") || status.includes("order")) return "Preorder";
  if (vehicle.stockQuantity > 0) return "In Stock";
  return "No Stock";
}

function formatFobRange(prices: number[]) {
  if (prices.length === 0) return "FOB on request";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return `FOB ${formatUsdStrict(min)} - ${formatUsdStrict(max)}`;
}

function formatModelYear(year: string) {
  return year ? `${year}款` : "年款待确认";
}

function formatSupplySummary(item: SellableModel) {
  return item.stockQuantity > 0 ? "有现车" : "仅可预定";
}

function formatColorPair(exteriorColor: string, interiorColor: string) {
  const exterior = exteriorColor || "-";
  return interiorColor ? `${exterior} / ${interiorColor}` : exterior;
}

function normalizeKey(...values: Array<string | number | null | undefined>) {
  return values.map((value) => String(value ?? "").trim().toLowerCase()).join("::");
}

function vehicleName(vehicle: Vehicle) {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`.trim() || vehicle.id;
}

function compactJoin(values: Array<string | number | null | undefined>) {
  const text = values.map((value) => String(value ?? "").trim()).filter(Boolean).join(" / ");
  return text || "-";
}

function getDateTime(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass rounded-[1.25rem] p-5">
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</p>
      <strong className="mt-2 block text-3xl font-black italic text-white">{value}</strong>
    </div>
  );
}

function PortalInventoryPill({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-bold ${highlight ? "border-accent/30 bg-accent/10 text-accent" : "border-white/10 bg-white/[.04] text-gray-300"}`}>
      <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</span>
      <span className="truncate">{value || "-"}</span>
    </span>
  );
}

function Info({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <span className="block text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</span>
      <strong className={`mt-1 block text-sm ${highlight ? "text-accent" : "text-gray-200"}`}>{value}</strong>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-600">{text}</div>;
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 px-4 py-8">
      <div className="glass max-h-[calc(100vh-4rem)] w-full max-w-2xl overflow-auto rounded-[2rem] p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-xl font-black uppercase italic text-white">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-gray-400 hover:text-white">
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500">
      {label}
      <div className="[&_input]:min-h-11 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-white/10 [&_input]:bg-white/[.04] [&_input]:px-4 [&_input]:text-sm [&_input]:font-medium [&_input]:normal-case [&_input]:tracking-normal [&_input]:text-white [&_input]:outline-none [&_select]:min-h-11 [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-white/10 [&_select]:bg-black [&_select]:px-4 [&_select]:text-sm [&_select]:font-medium [&_select]:normal-case [&_select]:tracking-normal [&_select]:text-white [&_textarea]:min-h-28 [&_textarea]:w-full [&_textarea]:rounded-xl [&_textarea]:border [&_textarea]:border-white/10 [&_textarea]:bg-white/[.04] [&_textarea]:p-4 [&_textarea]:text-sm [&_textarea]:font-medium [&_textarea]:normal-case [&_textarea]:tracking-normal [&_textarea]:text-white [&_textarea]:outline-none">
        {children}
      </div>
    </label>
  );
}
