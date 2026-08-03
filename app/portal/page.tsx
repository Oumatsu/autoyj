"use client";

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loading from "../../components/Loading";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "@/i18n/useTranslation";

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
  steering?: string;
  marketVersion?: string;
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
  exwUsd?: number | null;
  fcaUsd?: number | null;
  fobUsd?: number | null;
  priceTerm?: string;
  priceTermsList?: { term: string; amount: number }[];
  aiConfidence?: number | null;
  isListed: boolean;
  editableFields: string[];
  priceLabel: string;
};

type PriceTerm = { term: string; amount: number };

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
  /** 汇总该车型所有 offer 中出现过的 FOB/EXW/FCA 价格区间 */
  priceTermsSummary: PriceTerm[];
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
  /** 该批次实际填写的 1~3 个价格项，来自 FOB/EXW/FCA 美金价 */
  priceTermsList: PriceTerm[];
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
  { key: "vehicle_models", label: "车型库", roles: ["admin", "sales", "sourcing", "partner", "customer"], icon: "vehicle_models", badge: "预览" },
  { key: "vehicles", label: "车辆资源", roles: ["admin", "sales", "sourcing", "partner"], icon: "vehicles", badge: "预览" },
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

// 模块全局缓存（跨路由切换/组件卸载挂载共享，实现页面切换 0 次重复请求与并发去重）
let globalBootstrapData: BootstrapData | null = null;
let globalBootstrapPromise: Promise<BootstrapData | null> | null = null;

export default function PortalPage() {
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [data, setData] = useState<BootstrapData | null>(() => globalBootstrapData);
  const [loading, setLoading] = useState(!globalBootstrapData);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [showPreviewTestLogin, setShowPreviewTestLogin] = useState(false);
  const [activeAdminModule, setActiveAdminModule] = useState<AdminModule>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryTab = (params.get("tab") || params.get("module") || "").toLowerCase().replaceAll("-", "_");
      if (queryTab === "vehicle_models" || queryTab === "profiles") return "vehicle_models";
      if (queryTab === "source_imports" || queryTab === "vehicles") return "source_imports";
      if (queryTab === "quotes" || queryTab === "inquiries") return "quotes";
      if (queryTab === "orders") return "orders";
      if (queryTab === "payments") return "payments";
      if (queryTab === "logistics") return "logistics";
      if (queryTab === "customers") return "customers";
      if (queryTab === "staff") return "staff";
      if (queryTab === "files") return "files";
    }
    return "dashboard";
  });
  const [selectedSellableModel, setSelectedSellableModel] = useState<SellableModel | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>(emptyInquiryForm);
  const [counterQuote, setCounterQuote] = useState<Quote | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const checkSessionAndLoad = useCallback(async (force = false) => {
    if (force) {
      globalBootstrapData = null;
      globalBootstrapPromise = null;
      setLoadedCatalog(false);
    }

    // 1. 若非强制更新且已有全局数据缓存，瞬间响应，0 次 API 请求
    if (!force && globalBootstrapData) {
      setData(globalBootstrapData);
      setLoading(false);
      return;
    }
    // 2. 若非强制更新且已有进行中的 API 请求，复用 Promise 避免重复并发发请求
    if (!force && globalBootstrapPromise) {
      try {
        const res = await globalBootstrapPromise;
        if (res) setData(res);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. 执行真正的网络拉取并写缓存
    const promise = (async () => {
      setError("");
      try {
        const sessionRes = await api<{ user: PortalUser | null }>("/api/portal/session");
        if (!sessionRes.user) {
          globalBootstrapData = null;
          globalBootstrapPromise = null;
          setData(null);
          setLoading(false);
          return null;
        }
        const bootstrap = await api<BootstrapData>("/api/portal/bootstrap");
        globalBootstrapData = bootstrap;
        setData(bootstrap);
        return bootstrap;
      } catch (loadError) {
        globalBootstrapData = null;
        globalBootstrapPromise = null;
        setData(null);
        if (loadError instanceof Error && loadError.message !== "Not signed in") {
          setError(loadError.message);
        }
        return null;
      } finally {
        setLoading(false);
      }
    })();
    globalBootstrapPromise = promise;
    await promise;
  }, []);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    setIsLocalDev(host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]");
    setShowPreviewTestLogin(
      host.includes("workers.dev") ||
      host.includes("youguard-preview") ||
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

  const [loadedCatalog, setLoadedCatalog] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);

  const loadCatalogIfNeeded = useCallback(async () => {
    if (loadedCatalog) return;
    setModuleLoading(true);
    try {
      const res = await api<{ vehicleModels: VehicleModel[]; vehicleModelSpecs: VehicleSpec[]; vehicles: Vehicle[] }>("/api/portal/catalog");
      if (res) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                vehicleModels: res.vehicleModels || [],
                vehicleModelSpecs: res.vehicleModelSpecs || [],
                vehicles: res.vehicles || [],
              }
            : prev
        );
        setLoadedCatalog(true);
      }
    } catch (e) {
      console.warn("Failed to load catalog on demand:", e);
    } finally {
      setModuleLoading(false);
    }
  }, [loadedCatalog]);

  useEffect(() => {
    if (!data) return;
    const catalogModules: AdminModule[] = ["dashboard", "vehicle_models", "vehicles", "source_imports"];
    if (catalogModules.includes(activeAdminModule)) {
      void loadCatalogIfNeeded();
    }
  }, [data, activeAdminModule, loadCatalogIfNeeded]);

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
      globalBootstrapData = null;
      globalBootstrapPromise = null;
      setLoadedCatalog(false);
      await checkSessionAndLoad(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("youguard-session-changed"));
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
      globalBootstrapData = null;
      globalBootstrapPromise = null;
      setLoadedCatalog(false);
      await checkSessionAndLoad(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("youguard-session-changed"));
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
    globalBootstrapData = null;
    globalBootstrapPromise = null;
    setLoadedCatalog(false);
    setData(null);
    setActiveAdminModule("dashboard");
    setSelectedSellableModel(null);
    setSelectedVehicle(null);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("youguard-session-changed"));
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
      await checkSessionAndLoad(true); // 用户操作后强制刷新
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
      await checkSessionAndLoad(true); // 用户操作后强制刷新
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
      await checkSessionAndLoad(true); // 用户操作后强制刷新
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "Accept failed");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return <Loading text="Loading portal..." />;
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
              Sign in with the email and access code assigned by Youguard to view your permitted inventory, request quotes, negotiate, and track draft orders.
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
                placeholder="Provided by Youguard"
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
      isModuleLoading={moduleLoading}
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
            <div className="label label-gold mb-4">Youguard Dashboard</div>
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
                    <div className="grid h-full place-items-center text-xs font-black uppercase tracking-widest text-gray-700">Youguard EV</div>
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
                    {item.priceTermsSummary.length > 0 ? (
                      item.priceTermsSummary.map((pt) => (
                        <PortalInventoryPill key={pt.term} label={pt.term} value={formatUsdStrict(pt.amount)} highlight />
                      ))
                    ) : (
                      <PortalInventoryPill label="FOB" value={item.fobPriceRange.replace(/^FOB\s*/i, "")} highlight />
                    )}
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
                      {quotes.length === 0 && <p className="rounded-lg border border-white/10 px-3 py-3 text-xs text-gray-500">Waiting for Youguard quote.</p>}
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
                    {["Year", "Trim / Config", "Color", "Qty", "Supply", "Lead Time", "Location", "报价", "Action"].map((header) => (
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
                      <td className="border-b border-white/[.06] px-3 py-3">
                        {offer.priceTermsList.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {offer.priceTermsList.map((pt) => (
                              <span
                                key={pt.term}
                                className={`w-fit font-mono text-xs font-black ${
                                  pt.term === "FOB"
                                    ? "text-amber-400"
                                    : pt.term === "FCA"
                                    ? "text-cyan-300"
                                    : "text-emerald-300"
                                }`}
                              >
                                {pt.term} {formatUsdStrict(pt.amount)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-black text-accent">{offer.priceLabel}</span>
                        )}
                      </td>
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
  isModuleLoading,
}: {
  data: BootstrapData;
  activeModule: AdminModule;
  onModuleChange: (module: AdminModule) => void;
  onLogout: () => Promise<void>;
  onReload: () => Promise<void>;
  error: string;
  isModuleLoading?: boolean;
}) {
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const visibleNav = adminNavItems.filter((item) => item.roles.includes(data.user.role));
  const normalizedActiveModule = visibleNav.some((item) => item.key === activeModule) ? activeModule : "dashboard";
  const activeItem = visibleNav.find((item) => item.key === normalizedActiveModule) || visibleNav[0];
  // 按车型去重取最大库存（同车型不同颜色共享库存池，不能累加）
  const stockByModel = new Map<string, number>();
  for (const v of data.vehicles) {
    const mk = `${v.brand}|${v.model}|${v.year}`;
    stockByModel.set(mk, Math.max(stockByModel.get(mk) || 0, v.stockQuantity));
  }
  const totalStock = Array.from(stockByModel.values()).reduce((s, q) => s + q, 0);
  const openInquiries = data.inquiries.filter((item) => !["accepted", "closed", "cancelled"].includes(item.status.toLowerCase())).length;
  const orderTotal = data.orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0c1322] text-slate-100">
      <div className="grid min-h-screen min-w-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="border-b border-white/10 bg-[#101827] px-4 py-5 lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r lg:px-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-4 border-b border-white/10 pb-6">
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#22b8aa] text-xl font-black text-[#0c1322]">
                EV
              </div>
              <div className="min-w-0">
                <strong className="block truncate text-lg font-black tracking-tight text-white">出口管理系统</strong>
                <span className="mt-0.5 block text-xs font-medium text-slate-400">China / Ethiopia</span>
              </div>
            </div>

            <nav className="mt-5 grid gap-1.5">
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
                    className={`flex min-h-11 items-center justify-between gap-2 rounded-xl px-3.5 py-2.5 text-left text-sm font-bold transition cursor-pointer ${
                      isActive
                        ? "bg-[#22b8aa]/15 text-[#5ee6d8] shadow-[inset_3px_0_0_#22b8aa]"
                        : "text-slate-400 hover:bg-white/[.06] hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <AdminNavIcon name={item.icon} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <Badge variant={item.badge === "预览" ? "accent" : "amber"}>
                        {item.badge}
                      </Badge>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.04] p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {(data.user.name || data.user.email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-black text-white">{data.user.name || data.user.email}</strong>
                <p className="truncate text-[10px] text-slate-400">{adminRoleLabels[data.user.role]} · {data.user.accountType}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void onLogout()}
              className="mt-3 w-full"
            >
              退出登录
            </Button>
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

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AdminModuleContent activeModule={normalizedActiveModule} data={data} isModuleLoading={isModuleLoading} onEditVehicle={setEditingVehicle} />
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

function ModuleLoadingSkeleton() {
  return (
    <Loading
      text="飞书 Base 数据加载中..."
      subtext="正在实时与飞书后台连接通信，极速载入最新数据，请稍候"
      size="lg"
      className="rounded-2xl border border-teal-500/20 bg-white/[.03] p-12 shadow-2xl backdrop-blur-md"
    />
  );
}

function AdminModuleContent({ activeModule, data, isModuleLoading, onEditVehicle }: { activeModule: AdminModule; data: BootstrapData; isModuleLoading?: boolean; onEditVehicle: (vehicle: Vehicle) => void }) {
  if (isModuleLoading) {
    return <ModuleLoadingSkeleton />;
  }
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
  const { t } = useTranslation();
  return (
    <div className="grid min-w-0 gap-6">
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-300">
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-black uppercase text-black">{t("portal.stepInDev")} / Demo</span>
          <h2 className="text-lg font-black tracking-tight text-white">{t("portal.demoTitle")}</h2>
        </div>
        <p className="mt-2 text-xs text-amber-200/80">
          {t("portal.demoDesc")}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("portal.pendingAssets")}</span>
          <strong className="mt-2 block text-2xl font-black text-white">12 份</strong>
          <span className="mt-1 block text-xs text-slate-400">PDF / 图片 / 微信聊天记录</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("portal.aiParsingProgress")}</span>
          <strong className="mt-2 block text-2xl font-black text-[#22b8aa]">98.5%</strong>
          <span className="mt-1 block text-xs text-slate-400">结合 Nemotron / GPT 视觉模型</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("portal.duplicateAlert")}</span>
          <strong className="mt-2 block text-2xl font-black text-amber-400">2 组</strong>
          <span className="mt-1 block text-xs text-amber-300/80">同 VIN / 车架号交叉校验</span>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[.04] p-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t("portal.readyToPublish")}</span>
          <strong className="mt-2 block text-2xl font-black text-white">35 台</strong>
          <span className="mt-1 block text-xs text-slate-400">符合出口 PDI 准备标准</span>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <h3 className="text-base font-black text-white">{t("portal.batchImportTitle")}</h3>
          <p className="mt-1 text-xs text-slate-400">支持拖拽 Excel、车辆识别登记表、供应商朋友圈图片或微信截图</p>
          <div className="mt-4 grid h-36 place-items-center rounded-xl border border-dashed border-white/20 bg-black/20 text-center">
            <div>
              <p className="text-xs font-bold text-slate-300">{t("portal.dropFilesHere")}</p>
              <p className="mt-1 text-[10px] text-slate-500">自动提取 VIN、外观/内饰颜色、指导价、车商报价与定金要求</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[.03] p-5">
          <h3 className="text-base font-black text-white">{t("portal.workflowPreviewTitle")}</h3>
          <div className="mt-4 grid gap-3 text-xs text-slate-300">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
              <span>1. 原始凭证采集 (Excel / 图片 OCR)</span>
              <span className="text-[#22b8aa] font-bold">{t("portal.stepPassed")}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
              <span>2. 结构化字段映射 (字段校验无空格)</span>
              <span className="text-[#22b8aa] font-bold">{t("portal.stepPassed")}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 p-3">
              <span>3. 多维表格 `vehicle_sources` 增量同步</span>
              <span className="text-amber-400 font-bold">{t("portal.stepInDev")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDashboard({ data }: { data: BootstrapData }) {
  const { t } = useTranslation();
  // 按车型去重取最大库存（同车型不同颜色共享库存池，不能累加）
  const stockByModel = new Map<string, number>();
  for (const v of data.vehicles) {
    const mk = `${v.brand}|${v.model}|${v.year}`;
    stockByModel.set(mk, Math.max(stockByModel.get(mk) || 0, v.stockQuantity));
  }
  const totalStock = Array.from(stockByModel.values()).reduce((s, q) => s + q, 0);
  const modelCount = (data.vehicleModels || []).length;
  const quoteValue = data.quotes.reduce((sum, quote) => sum + quote.unitPrice * Math.max(quote.quantity, 1), 0);
  const latestInquiries = [...data.inquiries]
    .sort((a, b) => getDateTime(b.updatedAt || b.createdAt) - getDateTime(a.updatedAt || a.createdAt))
    .slice(0, 6);
  const lowStock = data.vehicles.filter((vehicle) => vehicle.stockQuantity <= 2).slice(0, 6);

  return (
    <div className="grid min-w-0 gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat label={t("portal.modelRepo")} value={String(modelCount)} note={`${data.vehicles.length} 条车源 / ${totalStock} 台库存`} />
        <AdminStat label={t("portal.inquiries")} value={String(data.inquiries.length)} note={`${latestInquiries.length} 条近期动态`} />
        <AdminStat label={t("portal.quoteVersions")} value={String(data.quotes.length)} note={formatUsdStrict(quoteValue)} />
        <AdminStat label={t("portal.orders")} value={String(data.orders.length)} note={formatUsdStrict(data.orders.reduce((sum, order) => sum + order.total, 0))} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <AdminPanel title={t("portal.recentInquiries")} subtitle="来自飞书 Inquiries / Quotes 表">
          <AdminTable
            headers={[t("portal.inquiryNo"), t("portal.vehicle"), t("portal.quantity"), t("portal.status"), t("portal.latestQuote")]}
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
            emptyText={t("portal.noInquiries")}
          />
        </AdminPanel>

        <AdminPanel title={t("portal.stockAlert")} subtitle="低库存和待确认车辆">
          <AdminTable
            headers={[t("portal.vehicle"), t("portal.stockQuantity"), t("portal.location"), t("portal.supplyType")]}
            rows={lowStock.map((vehicle) => [
              vehicleName(vehicle),
              `${vehicle.stockQuantity} 台`,
              vehicle.location || "-",
              <AdminStatusBadge key="status" status={getSupplyType(vehicle)} />,
            ])}
            emptyText={t("portal.noLowStock")}
          />
        </AdminPanel>
      </section>
    </div>
  );
}

function ModelFullSpecsCard({ group }: { group: ModelProfileGroup }) {
  const { t } = useTranslation();
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

  return (
    <div className="grid gap-4 rounded-xl border border-white/10 bg-[#0c1322] p-4 text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#22b8aa]/20 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-[#5ee6d8]">
              {safeText(group.brand)} · {safeText(group.model)}
            </span>
            <span className="text-[10px] text-slate-400">({group.variants.length} {t("portal.variantsInStock")})</span>
          </div>
          <h4 className="mt-1 text-sm font-black text-white">{safeText(group.marketPosition) || `${safeText(group.brand)} ${safeText(group.model)} ${t("portal.fullTechSpecs")}`}</h4>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          <AdminSummaryChip label={t("portal.dataSource")} value={safeText(v.sourceName) || "飞书 Base 认证数据"} />
          {v.sourceUrl ? (
            <a href={v.sourceUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-[#22b8aa]/30 bg-[#22b8aa]/10 px-2.5 py-1 font-bold text-[#5ee6d8] hover:bg-[#22b8aa] hover:text-black">
              {t("portal.feishuSource")}
            </a>
          ) : null}
          {v.brochureUrl ? (
            <a href={v.brochureUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 font-bold text-amber-300 hover:bg-amber-500 hover:text-black">
              {t("portal.pdfBrochure")}
            </a>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-[#22b8aa]/20 bg-[#22b8aa]/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-[#22b8aa]/20 pb-1.5">
            <strong className="font-black text-[#5ee6d8]">⚡ {t("portal.batteryAndCharging")}</strong>
            <span className="text-[9px] text-[#22b8aa]">BATTERY & CHARGING</span>
          </div>
          <dl className="grid gap-2 text-slate-300">
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.batteryCapacity")}</dt>
              <dd className="mt-0.5 font-medium text-white">{batteryVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.batteryType")}</dt>
              <dd className="mt-0.5 font-medium text-white">{batteryTypeVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.batteryMaker")}</dt>
              <dd className="mt-0.5 font-medium text-white">{batteryMakerVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.cltcRange")}</dt>
              <dd className="mt-0.5 font-bold text-[#5ee6d8]">{rangeVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.energyConsumption")}</dt>
              <dd className="mt-0.5 font-medium text-white">{energyConsumptionVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.chargingSpecs")}</dt>
              <dd className="mt-0.5 font-medium text-white">{chargingVal}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
            <strong className="font-black text-indigo-300">🏁 {t("portal.motorAndPerformance")}</strong>
            <span className="text-[9px] text-indigo-400">MOTOR & PERFORMANCE</span>
          </div>
          <dl className="grid gap-2 text-slate-300">
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.motorPower")}</dt>
              <dd className="mt-0.5 font-medium text-white">{motorPowerVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.motorTorque")}</dt>
              <dd className="mt-0.5 font-medium text-white">{motorTorqueVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.driveType")}</dt>
              <dd className="mt-0.5 font-medium text-white">{driveTypeVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.acceleration")}</dt>
              <dd className="mt-0.5 font-bold text-indigo-300">{accelerationVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.topSpeed")}</dt>
              <dd className="mt-0.5 font-medium text-white">{topSpeedVal}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-amber-500/20 pb-1.5">
            <strong className="font-black text-amber-300">🚗 {t("portal.bodyAndChassis")}</strong>
            <span className="text-[9px] text-amber-400">BODY & CHASSIS</span>
          </div>
          <dl className="grid gap-2 text-slate-300">
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.dimensions")}</dt>
              <dd className="mt-0.5 font-medium text-white">{dimensionsVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.wheelbase")}</dt>
              <dd className="mt-0.5 font-medium text-white">{wheelbaseVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.seatsDoors")}</dt>
              <dd className="mt-0.5 font-medium text-white">{seatsVal ? `${seatsVal}座` : "-"} / {doorsVal ? `${doorsVal}门` : "-"}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.suspension")}</dt>
              <dd className="mt-0.5 font-medium text-white">{frontSuspensionVal || "-"} / {rearSuspensionVal || "-"}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.weightTrunk")}</dt>
              <dd className="mt-0.5 font-medium text-white">{curbWeightVal || "-"} / {trunkCapacityVal || "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.03] p-3">
          <div className="mb-2 flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
            <strong className="font-black text-emerald-300">🛡️ {t("portal.adasAndWarranty")}</strong>
            <span className="text-[9px] text-emerald-400">ADAS & COMPLIANCE</span>
          </div>
          <dl className="grid gap-2 text-slate-300">
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.adas")}</dt>
              <dd className="mt-0.5 font-bold text-emerald-300">{adasVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">{t("portal.warranty")}</dt>
              <dd className="mt-0.5 font-medium text-white">{warrantyVal}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">国内官方指导价</dt>
              <dd className="mt-0.5 font-bold text-amber-300">{group.guidePriceSummary || v.msrpChina || "-"}</dd>
            </div>
            <div>
              <dt className="text-[10px] text-slate-500">出口合规/备注</dt>
              <dd className="mt-0.5 font-medium text-white">{v.exportNotes || "符合海关出口通用检验标准"}</dd>
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
  const { t } = useTranslation();
  const groups = useMemo(() => buildModelProfileGroups(data), [data]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(() => null);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleGroups = groups.filter((group) => modelProfileGroupMatchesSearch(group, normalizedSearch));

  // Auto-select first visible group when search changes
  const effectiveSelectedKey = selectedKey && visibleGroups.some((g) => g.key === selectedKey) ? selectedKey : (visibleGroups[0]?.key ?? null);
  const selectedGroup = groups.find((g) => g.key === effectiveSelectedKey) ?? null;

  return (
    <div className="grid gap-5">
      <AdminPanel title={t("portal.titleModels")} subtitle="全量展示飞书 Base 关联数据：包含三电系统、电机驱动、尺寸轴距、智驾等级与合规出口字段">
        {/* Feishu banner */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#22b8aa]/30 bg-[#22b8aa]/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#22b8aa]/20 text-lg">🖼️</div>
            <div>
              <strong className="block text-sm font-bold text-white">飞书带图册实时车型公开视图</strong>
              <p className="mt-0.5 text-xs text-slate-300">包含外观图册、配置参数与现车价格一览，支持免登录公开分享与查阅。</p>
            </div>
          </div>
          <a
            href="https://ecn4k98ibq2i.feishu.cn/share/base/view/shrcndRVOEpCUH8QjhvM151zcDg"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#22b8aa] px-4 py-2.5 text-xs font-black text-[#0c1322] transition hover:bg-[#5ee6d8]"
          >
            <span>打开飞书图册一览 ↗</span>
          </a>
        </div>

        {/* Search bar + summary */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            搜索车型
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="品牌、车型、年款、版本、级别、电池类型、电机功率、智驾等级"
            />
          </label>
          <div className="flex items-center gap-2 pb-0.5">
            <AdminSummaryChip label="车型" value={`${visibleGroups.length} / ${groups.length}`} tone="accent" />
            <AdminSummaryChip label="版本" value={`${visibleGroups.reduce((sum, group) => sum + group.variants.length, 0)} 个`} />
          </div>
        </div>

        {/* Master-detail layout with explicit height */}
        <div className="flex h-[calc(100vh-280px)] min-h-[550px] max-h-[850px] gap-0 overflow-hidden rounded-xl border border-white/10">
          {/* LEFT: model list */}
          <div
            className={`flex w-full shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#070e1b] lg:w-80 xl:w-96 ${
              selectedGroup ? "hidden lg:flex" : "flex"
            }`}
          >
            {visibleGroups.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-4 py-12 text-center text-sm text-slate-600">
                暂无匹配车型
              </div>
            ) : null}
            {visibleGroups.map((group) => {
              const isSelected = group.key === effectiveSelectedKey;
              return (
                <button
                  key={group.key}
                  type="button"
                  onClick={() => setSelectedKey(group.key)}
                  className={`flex w-full items-start gap-3 border-b border-white/[.06] px-4 py-3.5 text-left transition cursor-pointer last:border-0 ${
                    isSelected
                      ? "bg-[#22b8aa]/10 shadow-[inset_3px_0_0_#22b8aa]"
                      : "hover:bg-white/[.03]"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-[#22b8aa]" : "text-slate-500"}`}>
                        {group.brand}
                      </span>
                      <span className="shrink-0 rounded-full bg-white/[.06] px-1.5 py-0.5 text-[9px] font-black text-slate-400">
                        {group.variants.length}版
                      </span>
                    </div>
                    <strong className={`mt-0.5 block truncate text-sm ${isSelected ? "text-white" : "text-slate-200"}`}>
                      {group.model}
                    </strong>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {group.segment ? (
                        <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-[10px] text-slate-400">{group.segment}</span>
                      ) : null}
                      {group.energyType ? (
                        <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-[10px] text-slate-400">{group.energyType}</span>
                      ) : null}
                      {group.rangeSummary ? (
                        <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-[10px] text-slate-400">{group.rangeSummary}</span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* RIGHT: detail panel */}
          <div className={`flex-1 overflow-y-auto bg-[#0a1120] ${selectedGroup ? "flex flex-col" : "hidden lg:flex"}`}>
            {!selectedGroup ? (
              <div className="flex flex-1 items-center justify-center px-8 py-16 text-center">
                <div>
                  <div className="mb-3 text-4xl">🚗</div>
                  <p className="text-sm text-slate-500">从左侧选择一款车型查看详情</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-0">
                {/* Detail header */}
                <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-white/10 bg-[#0a1120]/95 px-5 py-4 backdrop-blur">
                  <div className="flex items-center gap-3">
                    {/* Back button on mobile */}
                    <button
                      type="button"
                      onClick={() => setSelectedKey(null)}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/15 text-slate-300 transition hover:border-white/30 lg:hidden cursor-pointer"
                      aria-label="返回列表"
                    >
                      ←
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#22b8aa]">{selectedGroup.brand}</span>
                        {selectedGroup.segment ? (
                          <Badge variant="accent">{selectedGroup.segment}</Badge>
                        ) : null}
                      </div>
                      <h2 className="text-lg font-black text-white">{selectedGroup.model}</h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminSummaryChip label="版本" value={`${selectedGroup.variants.length} 个`} tone="accent" />
                    {selectedGroup.energyType ? <AdminSummaryChip label="能源" value={selectedGroup.energyType} /> : null}
                    {selectedGroup.guidePriceSummary ? <AdminSummaryChip label="指导价" value={selectedGroup.guidePriceSummary} /> : null}
                  </div>
                </div>

                {/* Market position */}
                {selectedGroup.marketPosition ? (
                  <div className="border-b border-white/[.06] bg-white/[.02] px-5 py-3">
                    <p className="text-xs text-slate-400">{selectedGroup.marketPosition}</p>
                  </div>
                ) : null}

                {/* Full spec card */}
                <div className="p-4 sm:p-5">
                  <ModelFullSpecsCard group={selectedGroup} />
                </div>
              </div>
            )}
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}

function AdminVehicles({ data, onEdit }: { data: BootstrapData; onEdit: (vehicle: Vehicle) => void }) {
  const { t } = useTranslation();
  const sellableModels = buildSellableModels(data);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [supplyFilter, setSupplyFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const normalizedSearch = searchQuery.trim().toLowerCase();

  // 从真实数据中动态提取下拉筛选选项
  const brandOptions = useMemo(() => {
    const set = new Set<string>();
    data.vehicles.forEach((v) => {
      if (v.brand?.trim()) set.add(v.brand.trim());
    });
    sellableModels.forEach((m) => {
      if (m.brand?.trim()) set.add(m.brand.trim());
    });
    return Array.from(set).sort();
  }, [data.vehicles, sellableModels]);

  const colorOptions = useMemo(() => {
    const set = new Set<string>();
    data.vehicles.forEach((v) => {
      const ext = v.exteriorColor || v.color;
      if (ext && ext.trim() && ext !== "-") set.add(ext.trim());
      if (v.interiorColor && v.interiorColor.trim() && v.interiorColor !== "-") set.add(v.interiorColor.trim());
    });
    return Array.from(set).sort();
  }, [data.vehicles]);

  const supplierOptions = useMemo(() => {
    const set = new Set<string>();
    data.vehicles.forEach((v) => {
      if (v.supplier?.trim()) set.add(v.supplier.trim());
    });
    return Array.from(set).sort();
  }, [data.vehicles]);

  const isAllDefault = !normalizedSearch && supplyFilter === "all" && brandFilter === "all" && colorFilter === "all" && supplierFilter === "all";

  const visibleModels = sellableModels
    .map((item) => {
      const rawVehicles = vehiclesForSellableModel(data.vehicles, item).filter((vehicle) =>
        vehicleMatchesAdminFilters(vehicle, item, normalizedSearch, supplyFilter, brandFilter, colorFilter, supplierFilter)
      );
      const offers = item.offers.filter((offer) =>
        offerMatchesAdminFilters(offer, item, normalizedSearch, supplyFilter, brandFilter, colorFilter, supplierFilter)
      );
      const modelMatches = modelMatchesAdminFilters(item, normalizedSearch, brandFilter);
      // 只有当颜色/供应商/供应状态筛选都未激活时，才允许 modelMatches 回退到显示全部
      const hasDetailFilter = colorFilter !== "all" || supplierFilter !== "all" || supplyFilter !== "all";

      const effectiveOffers = isAllDefault
        ? item.offers
        : offers.length > 0
          ? offers
          : (modelMatches && !hasDetailFilter ? item.offers : []);
      const effectiveRawVehicles = isAllDefault
        ? vehiclesForSellableModel(data.vehicles, item)
        : rawVehicles.length > 0
          ? rawVehicles
          : (modelMatches && !hasDetailFilter ? vehiclesForSellableModel(data.vehicles, item) : []);

      return {
        ...item,
        offers: effectiveOffers,
        rawVehicles: effectiveRawVehicles,
        modelMatches,
      };
    })
    .filter((item) => item.offers.length > 0 || item.rawVehicles.length > 0 || isAllDefault);

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
      {/* 顶部 Header 说明区 (只读模式，去除不合理的录入与新建按钮) */}
      <section className="rounded-2xl border border-white/10 bg-[#070e1b] p-5 shadow-2xl shadow-black/20">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{t("portal.titleVehicles")}</h1>
          <p className="mt-1.5 text-xs font-medium text-slate-400">
            按车型集合查看配置版本、现车数量、预订周期和价格有效期。
          </p>
        </div>

        {/* 动态实用筛选与全文搜索工具栏 */}
        <div className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto] sm:items-center">
          {/* 全文搜索框 */}
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500">
              🔍
            </span>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              placeholder={t("portal.searchPlaceholder")}
            />
          </div>

          {/* 全部品牌下拉 */}
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1424] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">{t("portal.allBrands")}</option>
            {brandOptions.map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>

          {/* 全部颜色下拉 */}
          <select
            value={colorFilter}
            onChange={(e) => setColorFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1424] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">{t("portal.allColors")}</option>
            {colorOptions.map((color) => (
              <option key={color} value={color}>{color}</option>
            ))}
          </select>

          {/* 全部供应商下拉 */}
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1424] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">{t("portal.allSuppliers")}</option>
            {supplierOptions.map((supplier) => (
              <option key={supplier} value={supplier}>{supplier}</option>
            ))}
          </select>

          {/* 供应状态下拉 */}
          <select
            value={supplyFilter}
            onChange={(e) => setSupplyFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1424] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">{t("portal.allStatuses")}</option>
            <option value="in-stock">{t("portal.inStock")}</option>
            <option value="preorder">{t("portal.preorder")}</option>
            <option value="no-stock">{t("portal.noStock")}</option>
          </select>

          {/* 重置按钮 */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setBrandFilter("all");
              setColorFilter("all");
              setSupplierFilter("all");
              setSupplyFilter("all");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-xs font-bold text-slate-300 transition hover:border-[#22b8aa] hover:bg-[#22b8aa]/10 hover:text-white"
          >
            ↻ {t("portal.reset")}
          </button>
        </div>
      </section>

      {/* 结果统计 Summary Bar (现车总台数根据要求隐藏) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-bold text-slate-400">
        <div>
          找到 <span className="font-mono font-bold text-[#5ee6d8]">{visibleModels.length}</span> 个车型集合，
          <span className="font-mono font-bold text-[#5ee6d8]">
            {visibleModels.reduce((acc, m) => acc + (m.offers?.length || 0), 0)}
          </span> 个配置版本
        </div>
      </div>

      {/* 车型卡片 Accordion 逐层结构 */}
      <div className="grid gap-4">
        {visibleModels.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#070e1b] p-10 text-center text-sm font-medium text-slate-500">
            没有找到匹配的车源及配置版本
          </div>
        ) : (
          visibleModels.map((item) => {
            const isExpanded = expandedModels.has(item.key);
            const rawVehicles = item.rawVehicles || [];
            const offers = item.offers || [];

            return (
              <section
                key={item.key}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#070e1b] shadow-xl transition"
              >
                {/* 1级车型 Header (包含折叠展开控制) */}
                <header
                  onClick={() => toggleModel(item.key)}
                  className="flex cursor-pointer flex-col gap-4 border-b border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5 hover:bg-white/[.02]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-[#5ee6d8] transition-transform duration-200">
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    <div>
                      <h2 className="text-lg font-black text-white sm:text-xl">
                        {item.brand} {item.model}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">
                        {offers.length > 0 ? `${offers.length} 个配置版本` : ""}
                        {offers.length > 0 && rawVehicles.length > 0 ? " · " : ""}
                        {rawVehicles.length > 0 ? `${rawVehicles.length} 条原始批次` : ""}
                        {offers.length === 0 && rawVehicles.length === 0 ? "暂无车源数据" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">现车</span>
                      <span className="font-mono font-black text-white text-sm">
                        {item.stockQuantity > 0 ? `${item.stockQuantity} 台` : "-"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">价格</span>
                      {item.priceTermsSummary.length > 0 ? (
                        <div className="flex flex-col items-end gap-0.5">
                          {item.priceTermsSummary.map((pt) => (
                            <span
                              key={pt.term}
                              className={`font-mono text-xs font-black ${
                                pt.term === "FOB"
                                  ? "text-amber-400"
                                  : pt.term === "FCA"
                                  ? "text-cyan-300"
                                  : "text-emerald-300"
                              }`}
                            >
                              {pt.term} {formatUsdStrict(pt.amount)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono font-black text-amber-400">
                          {item.fobPriceRange ? item.fobPriceRange.replace(/^FOB\s*/i, "") : "待录入价格"}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ml-2 rounded-lg border border-white/10 bg-white/[.04] px-3.5 py-1.5 text-xs font-bold text-[#5ee6d8] transition hover:bg-[#22b8aa] hover:text-[#07111f]"
                    >
                      {isExpanded ? "收起版本" : "查看版本"}
                    </button>
                  </div>
                </header>

                {/* 2级配置版本与车源明细表格 */}
                {isExpanded && (
                  <div className="p-4 sm:p-5">
                    <AdminTable
                      headers={["资源 ID", "美金报价", "配置版本", "车源地点", "左右舵 / 版本", "供应商", "外观 / 内饰颜色", "库存状态"]}
                      rows={rawVehicles.map((vehicle) => [
                        <span key="id" className="font-mono text-xs font-bold text-[#22b8aa]">{vehicle.id}</span>,
                        <div key="price" className="flex flex-col gap-1">
                          {vehicle.priceTermsList && vehicle.priceTermsList.length > 0 ? (
                            vehicle.priceTermsList.map((p) => (
                              <span
                                key={p.term}
                                className={`w-fit rounded-lg border px-2.5 py-0.5 font-mono text-xs font-black shadow-sm ${
                                  p.term === "FOB"
                                    ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                    : p.term === "FCA"
                                    ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-300"
                                    : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                                }`}
                              >
                                {p.term} {formatUsdStrict(p.amount)}
                              </span>
                            ))
                          ) : vehicle.price ? (
                            <span className="w-fit rounded-lg border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 font-mono text-xs font-black text-amber-400 shadow-sm">
                              {vehicle.priceTerm || "FOB"} {formatUsdStrict(vehicle.price)}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">待报价</span>
                          )}
                          {vehicle.cost ? <span className="font-mono text-[10px] text-slate-500">成本 {formatUsdStrict(vehicle.cost)}</span> : null}
                        </div>,
                        <strong key="trim" className="text-xs font-bold text-white">
                          {compactJoin([vehicle.year ? `${vehicle.year}款` : "", vehicle.trim || "未指定配置", vehicle.configuration])}
                        </strong>,
                        <span key="loc" className="text-xs font-medium text-slate-200">{vehicle.location || "未指定地点"}</span>,
                        <span key="spec" className="text-[11px] font-bold text-[#5ee6d8]">
                          {compactJoin([vehicle.steering || "左舵 LHD", vehicle.marketVersion || "国内版"])}
                        </span>,
                        <span key="supplier" className="text-xs font-medium text-slate-200">{vehicle.supplier || "合作车商"}</span>,
                        <span key="color" className="text-xs text-slate-400">
                          {formatColorPair(vehicle.exteriorColor || vehicle.color, vehicle.interiorColor)}
                        </span>,
                        <div key="stock" className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-300">{vehicle.stockQuantity > 0 ? `${vehicle.stockQuantity} 台` : "现车/按需"}</span>
                          <AdminStatusBadge status={getSupplyType(vehicle)} />
                        </div>,
                      ])}
                      emptyText="暂无车源数据"
                    />
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>
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
          <Textarea value={form.publicNotes} onChange={(event) => updateField("publicNotes", event.target.value)} />
        </FormField>

        {canEditOptionalField("Color Notes") && (
          <FormField label="颜色内部备注">
            <Textarea value={form.colorNotes} onChange={(event) => updateField("colorNotes", event.target.value)} placeholder="以实拍图为准、供应商原始描述等" />
          </FormField>
        )}

        {canEditOptionalField("Color Confirmed") && (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-bold text-slate-300">
            <span>颜色已确认</span>
            <Switch
              checked={form.colorConfirmed}
              onCheckedChange={(val) => updateField("colorConfirmed", val)}
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-bold text-slate-300">
          <span>对外上架显示</span>
          <Switch
            checked={form.isListed}
            onCheckedChange={(val) => updateField("isListed", val)}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button disabled={saving} variant="default">
            {saving ? "保存中..." : "保存到飞书"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AdminPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <Card className="min-w-0 overflow-hidden shadow-2xl shadow-black/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-black text-white">{title}</CardTitle>
        {subtitle ? <CardDescription className="text-xs text-slate-400">{subtitle}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function AdminStat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card className="p-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
      <strong className="mt-2 block text-2xl font-black text-white">{value}</strong>
      <span className="mt-2 block text-xs text-slate-500">{note}</span>
    </Card>
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
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={headers.length} className="py-8 text-center text-slate-500">
              {emptyText}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="break-words">
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
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

  const activeModels = (data.vehicleModels || []).filter((model) => {
    const st = (model.status || "active").toLowerCase().trim();
    return st === "active" || st === "published" || st === "online" || st === "在售" || st === "启用" || !/archived|draft|disabled|下架|停售/i.test(st);
  });
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
    // 同车型不同颜色共享库存池，取最大值而非累加
    if (supplyType === "In Stock") {
      entry.item.stockQuantity = Math.max(entry.item.stockQuantity, vehicle.stockQuantity);
    }
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
        priceTermsList: vehicle.priceTermsList ?? [],
      });
    }
  }

  return Array.from(grouped.values())
    .map(({ item, offerMap }) => {
      const offers = Array.from(offerMap.values()).sort((a, b) => {
        const stockRank = Number(b.supplyType === "In Stock") - Number(a.supplyType === "In Stock");
        return stockRank || (a.price || Number.MAX_SAFE_INTEGER) - (b.price || Number.MAX_SAFE_INTEGER);
      });

      // 汇总该车型所有 offer 的 FOB/EXW/FCA 价格区间（取各 term 的最低~最高）
      const termMap = new Map<string, { min: number; max: number }>();
      for (const offer of offers) {
        for (const pt of offer.priceTermsList) {
          const existing = termMap.get(pt.term);
          if (!existing) {
            termMap.set(pt.term, { min: pt.amount, max: pt.amount });
          } else {
            existing.min = Math.min(existing.min, pt.amount);
            existing.max = Math.max(existing.max, pt.amount);
          }
        }
      }
      const termOrder = ["FOB", "EXW", "FCA"];
      const priceTermsSummary: PriceTerm[] = termOrder
        .filter((t) => termMap.has(t))
        .map((t) => {
          const range = termMap.get(t)!;
          // 取区间最低值代表该 term 的报价（用于卡片展示）
          return { term: t, amount: range.min };
        });

      return {
        ...item,
        offers,
        priceTermsSummary,
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

function modelMatchesAdminFilters(item: SellableModel, query: string, brandFilter: string) {
  if (brandFilter !== "all") {
    const itemB = (item.brand || "").toLowerCase();
    const filterB = brandFilter.toLowerCase();
    if (!itemB.includes(filterB) && !filterB.includes(itemB)) return false;
  }
  if (!query) return true;
  const fullText = adminSearchText([item.brand, item.model, item.year, item.segment, item.fobPriceRange]);
  const keywords = query.split(/\s+/).filter(Boolean);
  return keywords.every((kw) => fullText.includes(kw));
}

function offerMatchesAdminFilters(
  offer: VehicleOffer,
  item: SellableModel,
  query: string,
  supplyFilter: string,
  brandFilter: string,
  colorFilter: string,
  supplierFilter: string
) {
  if (brandFilter !== "all") {
    const itemB = (item.brand || "").toLowerCase();
    const filterB = brandFilter.toLowerCase();
    if (!itemB.includes(filterB) && !filterB.includes(itemB)) return false;
  }

  if (colorFilter !== "all") {
    const ext = (offer.exteriorColor || "").toLowerCase();
    const intColor = (offer.interiorColor || "").toLowerCase();
    const target = colorFilter.toLowerCase();
    if (!ext.includes(target) && !intColor.includes(target)) return false;
  }

  if (supplierFilter !== "all") {
    // offer 的底层 vehicles 中至少一个供应商匹配
    const hasMatchingSupplier = offer.vehicles.some((v) =>
      (v.supplier || "").toLowerCase() === supplierFilter.toLowerCase()
    );
    if (!hasMatchingSupplier) return false;
  }

  if (!supplyTypeMatchesFilter(offer.supplyType, supplyFilter)) return false;
  if (!query) return true;

  const fullText = adminSearchText([
    item.brand,
    item.model,
    item.segment,
    offer.year,
    offer.trim,
    offer.specs,
    offer.configuration,
    offer.exteriorColor,
    offer.interiorColor,
    offer.badge,
    offer.supplyType,
    offer.leadTime,
    offer.location,
    offer.price ? formatUsdStrict(offer.price) : offer.priceLabel,
  ]);
  const keywords = query.split(/\s+/).filter(Boolean);
  return keywords.every((kw) => fullText.includes(kw));
}

function vehicleMatchesAdminFilters(
  vehicle: Vehicle,
  item: SellableModel,
  query: string,
  supplyFilter: string,
  brandFilter: string,
  colorFilter: string,
  supplierFilter: string
) {
  if (brandFilter !== "all") {
    const b = (vehicle.brand || item.brand || "").toLowerCase();
    const filterB = brandFilter.toLowerCase();
    if (!b.includes(filterB) && !filterB.includes(b)) return false;
  }

  if (colorFilter !== "all") {
    const ext = (vehicle.exteriorColor || vehicle.color || vehicle.supplierExteriorColor || "").toLowerCase();
    const intColor = (vehicle.interiorColor || vehicle.supplierInteriorColor || "").toLowerCase();
    const target = colorFilter.toLowerCase();
    if (!ext.includes(target) && !intColor.includes(target)) return false;
  }

  if (supplierFilter !== "all") {
    const s = (vehicle.supplier || "").toLowerCase();
    if (s !== supplierFilter.toLowerCase()) return false;
  }

  if (!supplyTypeMatchesFilter(getSupplyType(vehicle), supplyFilter)) return false;
  if (!query) return true;

  const fullText = adminSearchText([
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
    vehicle.steering,
    vehicle.marketVersion,
    vehicle.supplier,
    vehicle.recorder,
    vehicle.location,
    vehicle.status,
    vehicle.inventoryStatus,
    vehicle.leadTime,
    vehicle.publicNotes,
    vehicle.partnerPrice ? formatUsdStrict(vehicle.partnerPrice) : "",
    vehicle.cost ? formatUsdStrict(vehicle.cost) : "",
    vehicle.price ? formatUsdStrict(vehicle.price) : "",
  ]);
  const keywords = query.split(/\s+/).filter(Boolean);
  return keywords.every((kw) => fullText.includes(kw));
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
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            ✕
          </Button>
        </div>
      </DialogHeader>
      <div className="max-h-[calc(80vh-6rem)] overflow-y-auto pr-1">
        {children}
      </div>
    </Dialog>
  );
}

function FormField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
