"use client";

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Loading from "../../components/Loading";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { RefreshCw } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";
import { sanitizeDisplayData } from "@/lib/display-text";
import { getPortalSession, invalidatePortalSession } from "@/lib/portal-session-client";
import { formatPortalHeader, formatPortalRole, formatPortalStatus, localizeVehicleValue, portalRoleLabels } from "@/lib/portal-english";
import type { AccountType, PortalRole, PriceTier } from "@/lib/users";
import { QuotationTemplatePreview } from "@/components/portal/QuotationTemplatePreview";
import { appendInquiryComment, inquiryCommentAuthorClass } from "@/lib/inquiry-comment-state";
import { buildInquiryCommentThreads, inquiryListDetails, replyReference } from "@/lib/inquiry-workflow";

type AdminModule = "dashboard" | "vehicle_models" | "vehicles" | "quotes" | "orders" | "payments" | "logistics" | "customers" | "staff";
type AdminIconName = "dashboard" | "vehicle_models" | "vehicles" | "quotes" | "orders" | "payments" | "logistics" | "customers" | "staff";

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

type VehicleGalleryImage = {
  src: string;
  cat?: string;
  label?: string;
};

type VehicleModel = {
  id: string;
  brand: string;
  model: string;
  trim: string;
  modelStyle?: string | null;
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
  galleryImages?: VehicleGalleryImage[];
  brochureUrl: string;
  sourceUrl: string;
  sourceName: string;
  lastSyncedAt: string;
  fullSpecsJson: string;
  status: string;
  recommendationRank: number | null;
  trimOrder?: number | null;
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
  exteriorColorEnglish?: string | null;
  interiorColorEnglish?: string | null;
  supplierExteriorColor: string;
  supplierInteriorColor: string;
  colorCode: string;
  colorNotes: string;
  colorConfirmed: boolean;
  configuration: string;
  supplier: string;
  supplierQuoteYear?: string | null;
  supplierQuoteMonth?: string | null;
  productionYear?: string | null;
  productionMonth?: string | null;
  recorder: string;
  location: string;
  steering?: string;
  marketVersion?: string;
  status: string;
  exportStatus: string;
  stockQuantity: number;
  modelStockQuantity?: number | null;
  trimStockQuantity?: number | null;
  colorStockQuantity?: number | null;
  waitDays?: number | null;
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
  // Extended internal fields (admin/sales only)
  guidePriceCny?: number | null;
  currency?: string | null;
  syncBatchId?: string | null;
  syncedAt?: string | null;
  minOrderQuantity?: number | null;
  fullOrderQuantity?: number | null;
  sourceStage?: string | null;
  inventoryStatus?: string | null;
  reviewer?: string | null;
  developer?: string | null;
  mediaSourcePath?: string | null;
  experienceNotes?: string | null;
  autoCorrectionNotes?: string | null;
  duplicateCheck?: string | null;
  recommendationSlot?: string | null;
  recommendationRank?: number | null;
};

type PriceTerm = { term: string; amount: number };
type PriceTermSummary = { term: string; min: number; max: number };

type SellableModel = {
  key: string;
  brand: string;
  model: string;
  year: string;
  segment: string;
  imageUrl: string;
  stockQuantity: number;
  hasStockQuantity: boolean;
  preorderAvailable: boolean;
  fobPriceRange: string;
  recommendationRank: number | null;
  /** 姹囨€昏杞﹀瀷鎵€鏈?offer 涓嚭鐜拌繃鐨?FOB/EXW/FCA 浠锋牸鍖洪棿 */
  priceTermsSummary: PriceTermSummary[];
  offers: VehicleOffer[];
};

type ModelProfileGroup = {
  key: string;
  brand: string;
  model: string;
  years: string[];
  variants: VehicleModel[];
  imageUrl: string;
  galleryImages: VehicleGalleryImage[];
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
  /** 璇ユ壒娆″疄闄呭～鍐欑殑 1~3 涓环鏍奸」锛屾潵鑷?FOB/EXW/FCA 缇庨噾浠?*/
  priceTermsList: PriceTerm[];
};

type VehicleResourceColor = {
  key: string;
  exteriorColor: string;
  interiorColor: string;
  quantity: number;
  hasStockQuantity: boolean;
  priceTerms: PriceTerm[];
  priceByLocation: Array<{ location: string; term: string; amount: number }>;
  vehicles: Vehicle[];
};

type VehicleResourceVariant = {
  key: string;
  vehicle: Vehicle;
  vehicles: Vehicle[];
  stockQuantity: number;
  hasStockQuantity: boolean;
  colors: VehicleResourceColor[];
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
  vehicleSnapshot: string;
  isPublic: boolean;
  creatorUserId: string;
  hasUnreadFollowUps: boolean;
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

type InquiryNote = { id: string; noteId: string; inquiryNo: string; parentNoteId: string; authorUserId: string; authorName: string; authorRole: string; body: string; isPublic: boolean; createdAt: string; deletedAt?: string; };
type InquiryStatusHistory = { id: string; historyId: string; inquiryNo: string; fromStatus: string; toStatus: string; reason: string; actorName: string; actorRole: string; createdAt: string; };

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
  inquiryNotes: InquiryNote[];
  inquiryStatusHistory: InquiryStatusHistory[];
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

const adminRoleLabels: Record<PortalRole, string> = portalRoleLabels;

const adminNavItems: { key: AdminModule; labelKey: string; roles: PortalRole[]; icon: AdminIconName; badge?: "preview" | "development" }[] = [
  { key: "dashboard", labelKey: "portal.navDashboard", roles: ["admin", "sales", "sourcing", "finance", "partner", "customer"], icon: "dashboard", badge: "development" },
  { key: "vehicle_models", labelKey: "portal.navVehicleModels", roles: ["admin", "sales", "sourcing", "partner", "customer"], icon: "vehicle_models", badge: "preview" },
  { key: "vehicles", labelKey: "portal.navVehicleResources", roles: ["admin", "sales", "sourcing", "partner", "customer"], icon: "vehicles", badge: "preview" },
  { key: "quotes", labelKey: "portal.navQuotes", roles: ["admin", "sales", "partner", "customer"], icon: "quotes", badge: "development" },
  { key: "orders", labelKey: "portal.navOrders", roles: ["admin", "sales", "finance", "partner", "customer"], icon: "orders", badge: "development" },
  { key: "payments", labelKey: "portal.navPayments", roles: ["admin", "finance"], icon: "payments", badge: "development" },
  { key: "logistics", labelKey: "portal.navLogistics", roles: ["admin", "sales", "partner", "customer"], icon: "logistics", badge: "development" },
  { key: "customers", labelKey: "portal.navCustomers", roles: ["admin"], icon: "customers", badge: "development" },
  { key: "staff", labelKey: "portal.navStaff", roles: ["admin"], icon: "staff", badge: "development" },
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
  "澶氬獟浣?鏅鸿兘搴ц埍",
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

function formatPriceTermRange({ min, max }: PriceTermSummary) {
  return min === max ? formatUsdStrict(min) : `${formatUsdStrict(min)} - ${formatUsdStrict(max)}`;
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
  return sanitizeDisplayData(data) as T;
}

// 妯″潡鍏ㄥ眬缂撳瓨锛堣法璺敱鍒囨崲/缁勪欢鍗歌浇鎸傝浇鍏变韩锛屽疄鐜伴〉闈㈠垏鎹?0 娆￠噸澶嶈姹備笌骞跺彂鍘婚噸锛?
let globalBootstrapData: BootstrapData | null = null;
let globalBootstrapPromise: Promise<BootstrapData | null> | null = null;

export default function PortalPage() {
  const { t, locale } = useTranslation();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<BootstrapData | null>(() => globalBootstrapData);
  const [loading, setLoading] = useState(!globalBootstrapData);
  const [error, setError] = useState("");
  const [isLocalDev] = useState(() => {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  });
  const [showPreviewTestLogin] = useState(() => {
    if (typeof window === "undefined") return false;
    const host = window.location.hostname.toLowerCase();
    return (
      host.includes("workers.dev") ||
      host.includes("youguard-preview") ||
      host.includes("preview")
    );
  });
  const [activeAdminModule, setActiveAdminModule] = useState<AdminModule>(() => {
    if (typeof window !== "undefined") {
      const pathname = window.location.pathname.toLowerCase();
      const segments = pathname.split("/").filter(Boolean);
      const lastSegment = (segments[segments.length - 1] || "").replaceAll("-", "_") as AdminModule;
      if (lastSegment === "vehicle_models" || lastSegment === "profiles") return "vehicle_models";
      if (lastSegment === "vehicles") return "vehicles";
      if (lastSegment === "quotes" || lastSegment === "inquiries") return "quotes";
      if (lastSegment === "orders") return "orders";
      if (lastSegment === "payments") return "payments";
      if (lastSegment === "logistics") return "logistics";
      if (lastSegment === "customers") return "customers";
      if (lastSegment === "staff") return "staff";

      const params = new URLSearchParams(window.location.search);
      const queryTab = (params.get("tab") || params.get("module") || "").toLowerCase().replaceAll("-", "_");
      if (queryTab === "vehicle_models" || queryTab === "profiles") return "vehicle_models";
      if (queryTab === "vehicles") return "vehicles";
      if (queryTab === "quotes" || queryTab === "inquiries") return "quotes";
      if (queryTab === "orders") return "orders";
      if (queryTab === "payments") return "payments";
      if (queryTab === "logistics") return "logistics";
      if (queryTab === "customers") return "customers";
      if (queryTab === "staff") return "staff";
    }
    return "dashboard";
  });
  const [selectedSellableModel, setSelectedSellableModel] = useState<SellableModel | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>(emptyInquiryForm);
  const [counterQuote, setCounterQuote] = useState<Quote | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const refreshVehicles = useCallback(async () => {
    try {
      const catalog = await api<BootstrapData>("/api/portal/catalog?refresh=1");
      if (catalog) {
        setData(catalog);
        globalBootstrapData = catalog;
      }
    } catch (err) {
      console.error("Failed to refresh catalog:", err);
    }
  }, []);

  const refreshBootstrap = useCallback(async () => {
    const bootstrap = await api<BootstrapData>("/api/portal/bootstrap");
    globalBootstrapData = bootstrap;
    globalBootstrapPromise = Promise.resolve(bootstrap);
    setData(bootstrap);
  }, []);

  const checkSessionAndLoad = useCallback(async (force = false) => {
    if (force) {
      globalBootstrapData = null;
      globalBootstrapPromise = null;
      invalidatePortalSession();
    }

    if (!force && globalBootstrapPromise) {
      try {
        const res = await globalBootstrapPromise;
        setData(res);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 3. 执行真正的网络拉取并写缓存
    const promise = (async () => {
      setError("");
      try {
        const sessionRes = await getPortalSession();
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
    const validModules: AdminModule[] = ["dashboard", "vehicle_models", "vehicles", "quotes", "orders", "payments", "logistics", "customers", "staff"];
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

    const timer = setTimeout(() => {
      void checkSessionAndLoad();
    }, 0);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      clearTimeout(timer);
    };
  }, [checkSessionAndLoad]);

  useEffect(() => {
    if (!data || typeof document === "undefined") return;
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") void refreshBootstrap().catch(() => undefined);
    };
    const interval = window.setInterval(refreshWhenVisible, 30_000);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [data, refreshBootstrap]);

  const [loadedModels, setLoadedModels] = useState(false);
  const [loadedVehicles, setLoadedVehicles] = useState(false);
  const [moduleLoading, setModuleLoading] = useState(false);

  const loadModels = useCallback(async () => {
    if (loadedModels) return;
    setModuleLoading(true);
    try {
      const res = await api<{ vehicleModels: VehicleModel[]; vehicleModelSpecs: VehicleSpec[] }>("/api/portal/vehicle-models");
      if (res) {
        setData((prev) =>
          prev
            ? {
                ...prev,
                vehicleModels: res.vehicleModels || [],
                vehicleModelSpecs: res.vehicleModelSpecs || [],
              }
            : prev
        );
        setLoadedModels(true);
      }
    } catch (e) {
      console.warn("Failed to load vehicle models on demand:", e);
    } finally {
      setModuleLoading(false);
    }
  }, [loadedModels]);

  const loadVehicles = useCallback(async () => {
    if (loadedVehicles) return;
    setModuleLoading(true);
    try {
      const res = await api<{ vehicles: Vehicle[] }>("/api/portal/vehicles");
      if (res) {
        setData((prev) => (prev ? { ...prev, vehicles: res.vehicles || [] } : prev));
        setLoadedVehicles(true);
      }
    } catch (e) {
      console.warn("Failed to load vehicles on demand:", e);
    } finally {
      setModuleLoading(false);
    }
  }, [loadedVehicles]);

  useEffect(() => {
    if (!data) return;
    const timer = setTimeout(() => {
      if (activeAdminModule === "vehicle_models" && !loadedModels && (!data.vehicleModelSpecs || data.vehicleModelSpecs.length === 0)) {
        void loadModels();
      } else if ((activeAdminModule === "vehicles" || activeAdminModule === "quotes") && !loadedVehicles && (!data.vehicles || data.vehicles.length === 0)) {
        void loadVehicles();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [data, activeAdminModule, loadedModels, loadedVehicles, loadModels, loadVehicles]);

  const handleModuleChange = (module: AdminModule) => {
    setActiveAdminModule(module);
    if (typeof window !== "undefined") {
      const segments = window.location.pathname.split("/").filter(Boolean);
      const currentLocale = (segments[0] === "zh" || segments[0] === "am" || segments[0] === "en") ? segments[0] : "en";
      const targetPath = module === "dashboard" ? `/${currentLocale}/dashboard` : `/${currentLocale}/dashboard/${module}`;
      
      // Clear legacy ?tab= query parameter if present when navigating
      const url = new URL(window.location.href);
      url.pathname = targetPath;
      url.searchParams.delete("tab");
      url.searchParams.delete("module");
      
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
    invalidatePortalSession();
    globalBootstrapData = null;
    globalBootstrapPromise = null;
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
      await refreshBootstrap();
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
      await refreshBootstrap();
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
      await refreshBootstrap();
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
              <p className="mt-2 text-xs text-gray-500">Your access level is managed by system administrators.</p>
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
      onModuleChange={handleModuleChange}
      onLogout={logout}
      onReload={checkSessionAndLoad}
      onRefreshVehicles={refreshVehicles}
      onRefreshData={refreshBootstrap}
    />
  );

  return (
    <main className="min-h-screen bg-bg px-4 pb-24 pt-[var(--navbar-h,56px)] sm:px-6">
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
                    <h3 className="mt-2 text-xl font-black uppercase italic text-white">{item.brand} {item.model} {item.year ? t("portal.modelYear", { year: item.year }) : t("portal.modelYearPending")}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <PortalInventoryPill label="Stock" value={t("portal.unitCount", { count: item.stockQuantity })} />
                    <PortalInventoryPill label="Supply" value={formatSupplySummary(item)} />
                    {item.priceTermsSummary.length > 0 ? (
                      item.priceTermsSummary.map((pt) => (
                        <PortalInventoryPill key={pt.term} label={pt.term} value={formatPriceTermRange(pt)} highlight />
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
                        <p className="mt-1 text-xs text-gray-500">{inquiry.vehicleModel} / {t("portal.unitCount", { count: inquiry.quantity })} / {inquiry.tradeTerm} / {inquiry.destinationPort}</p>
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
                    <Info label="Quantity" value={t("portal.unitCount", { count: order.quantity })} />
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
        <Modal title={`${selectedSellableModel.brand} ${selectedSellableModel.model} ${selectedSellableModel.year ? t("portal.modelYear", { year: selectedSellableModel.year }) : t("portal.modelYearPending")} / Sources`} onClose={() => setSelectedSellableModel(null)}>
          <div className="grid gap-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <Info label="Segment" value={selectedSellableModel.segment || "EV"} />
              <Info label="In-stock Qty" value={t("portal.unitCount", { count: selectedSellableModel.stockQuantity })} />
              <Info label="FOB Range" value={selectedSellableModel.fobPriceRange} highlight />
            </div>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full min-w-[760px] border-separate border-spacing-0 text-left text-sm">
                <thead>
                  <tr>
                    {["Year", "Trim / Config", "Color", "Qty", "Supply", "Lead Time", "Location", locale === "zh" ? "报价" : "Quote", "Action"].map((header) => (
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
  onRefreshVehicles,
  onRefreshData,
  error,
  isModuleLoading,
}: {
  data: BootstrapData;
  activeModule: AdminModule;
  onModuleChange: (module: AdminModule) => void;
  onLogout: () => Promise<void>;
  onReload: () => Promise<void>;
  onRefreshVehicles: () => Promise<void>;
  onRefreshData: () => Promise<void>;
  error: string;
  isModuleLoading?: boolean;
}) {
  const { t, locale } = useTranslation();
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const visibleNav = adminNavItems.filter((item) => item.roles.includes(data.user.role));
  const normalizedActiveModule = visibleNav.some((item) => item.key === activeModule) ? activeModule : "dashboard";
  const activeItem = visibleNav.find((item) => item.key === normalizedActiveModule) || visibleNav[0];
  const totalStock = data.vehicles.reduce((sum, vehicle) => sum + getVehicleStockQuantity(vehicle), 0);
  const openInquiries = data.inquiries.filter((item) => !["accepted", "closed", "cancelled"].includes(item.status.trim().toLowerCase())).length;
  const orderTotal = data.orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="min-h-screen bg-[#0c1322] pt-[var(--navbar-h,56px)] text-slate-100">
      <div className={`grid min-h-[calc(100vh-var(--navbar-h,56px))] min-w-0 transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "lg:grid-cols-[88px_minmax(0,1fr)]" : "lg:grid-cols-[300px_minmax(0,1fr)]"}`}>
        {mobileSidebarOpen && (
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          />
        )}
        <aside className={`${mobileSidebarOpen ? "fixed inset-y-[var(--navbar-h,56px)] left-0 z-40 flex" : "hidden"} min-h-[calc(100vh-var(--navbar-h,56px))] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto border-b border-white/10 bg-[#101827] px-4 py-5 shadow-2xl transition-[padding] duration-200 lg:sticky lg:z-auto lg:flex lg:h-[calc(100vh-var(--navbar-h,56px))] lg:w-auto lg:self-start lg:overflow-visible lg:border-b-0 lg:border-r lg:shadow-none ${sidebarCollapsed ? "lg:px-3" : "lg:px-5"}`} style={{ top: "var(--navbar-h, 56px)" }}>
          <div className="min-h-0 flex-1">
            <div className={`flex items-center gap-3 border-b border-white/10 pb-6 ${sidebarCollapsed ? "lg:flex-col lg:justify-center lg:gap-2 lg:pb-4" : ""}`}>
              <div className={`grid shrink-0 place-items-center rounded-2xl bg-[#22b8aa] font-black text-[#0c1322] transition-all duration-200 ${sidebarCollapsed ? "lg:h-12 lg:w-12 lg:text-base" : "h-14 w-14 text-xl"}`}>
                EV
              </div>
              <div className={`min-w-0 flex-1 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                <strong className="block truncate text-lg font-black tracking-tight text-white">{t("portal.exportOperations")}</strong>
                <span className="mt-0.5 block text-xs font-medium text-slate-400">{t("portal.chinaEthiopia")}</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setSidebarCollapsed((current) => !current)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className={`hidden shrink-0 border border-white/10 lg:inline-flex ${sidebarCollapsed ? "lg:h-8 lg:w-8 lg:rounded-lg" : ""}`}
              >
                <svg className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </Button>
            </div>

            <nav className="mt-5 grid gap-1.5">
              {visibleNav.map((item) => {
                const isActive = item.key === normalizedActiveModule;
                return (
                  <a
                    key={item.key}
                    href={item.key === "dashboard" ? `/${locale}/dashboard` : `/${locale}/dashboard/${item.key}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onModuleChange(item.key);
                      setMobileSidebarOpen(false);
                    }}
                      title={t(item.labelKey)}
                      className={`grid min-h-12 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition cursor-pointer ${sidebarCollapsed ? "lg:grid-cols-1 lg:justify-items-center lg:px-0" : ""} ${
                      isActive
                        ? "bg-[#22b8aa]/15 text-[#5ee6d8] shadow-[inset_3px_0_0_#22b8aa]"
                        : "text-slate-400 hover:bg-white/[.06] hover:text-white"
                    }`}
                  >
                    <div className={`flex min-w-0 items-center gap-2.5 ${sidebarCollapsed ? "lg:justify-center" : ""}`}>
                      <AdminNavIcon name={item.icon} />
                      <span className={`min-w-0 whitespace-normal break-words leading-4 ${sidebarCollapsed ? "lg:hidden" : ""}`}>{t(item.labelKey)}</span>
                    </div>
                    {item.badge && !sidebarCollapsed && (
                      <Badge variant={item.badge === "preview" ? "accent" : "amber"} className="whitespace-nowrap px-2 py-1 text-[9px] leading-3">
                        {item.badge === "preview" ? t("portal.badgePreview") : t("portal.badgeDevelopment")}
                      </Badge>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          <div className={`mt-auto shrink-0 rounded-2xl border border-white/10 bg-white/[.04] p-4 ${sidebarCollapsed ? "lg:p-2.5" : ""}`}>
            <div
              className={`flex items-center gap-3 ${sidebarCollapsed ? "lg:justify-center" : ""}`}
              title={sidebarCollapsed ? `${data.user.name || data.user.email} · ${formatPortalRole(data.user.role, locale)}` : undefined}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {(data.user.name || data.user.email || "U").slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className={`min-w-0 flex-1 ${sidebarCollapsed ? "lg:hidden" : ""}`}>
                <strong className="block truncate text-xs font-black text-white">{data.user.name || data.user.email}</strong>
                <p className="truncate text-[10px] text-slate-400">{formatPortalRole(data.user.role, locale)} · {data.user.accountType}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Open dashboard navigation"
                onClick={() => setMobileSidebarOpen(true)}
                className="mt-0.5 shrink-0 border border-white/10 text-slate-200 lg:hidden"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </Button>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.24em] text-[#22b8aa]">
                  {data.user.role === "admin" ? t("portal.administrator") : formatPortalRole(data.user.role, locale)} {t("portal.adminView")}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{activeItem ? t(activeItem.labelKey) : t("portal.navDashboard")}</h1>
              </div>
            </div>
            <div className="flex w-full min-w-0 flex-col gap-3 xl:max-w-[560px]">
              <div className="grid min-w-0 gap-2 text-xs text-slate-400 sm:grid-cols-3">
                <AdminTopMetric label={t("portal.stockUnits")} value={String(totalStock)} />
                <AdminTopMetric label={t("portal.openInquiries")} value={String(openInquiries)} />
                <AdminTopMetric label={t("portal.orderValue")} value={formatUsdStrict(orderTotal)} />
              </div>
              <button
                type="button"
                onClick={() => void onLogout()}
                className="w-fit self-end rounded-full border border-white/15 px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition hover:border-white/40 hover:text-white"
              >
                {t("portal.navSignOut")}
              </button>
            </div>
          </header>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AdminModuleContent
            activeModule={normalizedActiveModule}
            data={data}
            isModuleLoading={isModuleLoading}
            onEditVehicle={setEditingVehicle}
            onRefreshVehicles={onRefreshVehicles}
            onRefreshData={onRefreshData}
          />
        </section>
      </div>
      {editingVehicle && (
        <VehicleEditModal
          vehicle={editingVehicle}
          canSeeSupplier={data.user.role !== "partner" && data.user.role !== "customer"}
          canSeeLocation={data.user.role !== "partner" && data.user.role !== "customer"}
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
      text="Loading data..."
      subtext="Fetching the latest records from database."
      size="lg"
      fullscreen={false}
      className="rounded-2xl border border-teal-500/20 bg-white/[.03] p-12 shadow-2xl backdrop-blur-md"
    />
  );
}

function AdminModuleContent({ activeModule, data, isModuleLoading, onEditVehicle, onRefreshVehicles, onRefreshData }: { activeModule: AdminModule; data: BootstrapData; isModuleLoading?: boolean; onEditVehicle: (vehicle: Vehicle) => void; onRefreshVehicles: () => Promise<void>; onRefreshData: () => Promise<void> }) {
  if (isModuleLoading) {
    return <ModuleLoadingSkeleton />;
  }
  switch (activeModule) {
    case "vehicle_models":
      return <AdminProfiles data={data} />;
    case "vehicles":
      return <AdminVehicles data={data} onEdit={onEditVehicle} onRefresh={onRefreshVehicles} onRefreshData={onRefreshData} />;
    case "quotes":
      return <AdminQuotes data={data} onRefresh={onRefreshData} />;
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
    default:
      return <AdminDashboard data={data} />;
  }
}

function AdminDashboard({ data }: { data: BootstrapData }) {
  const { t } = useTranslation();
  // 汇总所有颜色与细分车型的实际库存数量（全量累加）
  const totalStock = data.vehicles.reduce((sum, vehicle) => sum + getVehicleStockQuantity(vehicle), 0);
  const modelCount = (data.vehicleModels || []).length;
  const quoteValue = data.quotes.reduce((sum, quote) => sum + quote.unitPrice * Math.max(quote.quantity, 1), 0);
  const latestInquiries = [...data.inquiries]
    .sort((a, b) => getDateTime(b.updatedAt || b.createdAt) - getDateTime(a.updatedAt || a.createdAt))
    .slice(0, 6);
  const lowStock = data.vehicles.filter((vehicle) => vehicle.stockQuantity <= 2).slice(0, 6);

  return (
    <div className="grid min-w-0 gap-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AdminStat label={t("portal.modelRepo")} value={String(modelCount)} note={t("portal.recordStockSummary", { records: data.vehicles.length, count: totalStock })} />
        <AdminStat label={t("portal.inquiries")} value={String(data.inquiries.length)} note={`${latestInquiries.length} ${t("portal.recentUpdates")}`} />
        <AdminStat label={t("portal.quoteVersions")} value={String(data.quotes.length)} note={formatUsdStrict(quoteValue)} />
        <AdminStat label={t("portal.orders")} value={String(data.orders.length)} note={formatUsdStrict(data.orders.reduce((sum, order) => sum + order.total, 0))} />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)]">
        <AdminPanel title={t("portal.recentInquiries")} subtitle={t("portal.recentRecordsSubtitle")}>
          <AdminTable
            headers={[t("portal.inquiryNo"), t("portal.vehicle"), t("portal.quantity"), t("portal.latestQuote")]}
            rows={latestInquiries.map((inquiry) => {
              const quote = latestQuoteForInquiry(inquiry.inquiryNo, data.quotes);
              return [
                inquiry.inquiryNo,
                inquiry.vehicleModel || inquiry.vehicleId,
                t("portal.unitCount", { count: inquiry.quantity }),
                quote ? `${quote.quoteNo} / ${formatUsdStrict(quote.unitPrice)}` : t("portal.awaitingQuote"),
              ];
            })}
            emptyText={t("portal.noInquiries")}
          />
        </AdminPanel>

        <AdminPanel title={t("portal.stockAlert")} subtitle={t("portal.lowStockSubtitle")}>
          <AdminTable
            headers={[t("portal.vehicle"), t("portal.stockQuantity"), t("portal.location"), t("portal.supplyType")]}
            rows={lowStock.map((vehicle) => [
              vehicleName(vehicle),
              t("portal.unitCount", { count: vehicle.stockQuantity }),
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
  const { t, locale } = useTranslation();
  const v = group.variants[0] || ({} as VehicleModel);
  const trimVariants = [...getModelTrimVariants(group)].sort((a, b) =>
    (a.trimOrder ?? Number.MAX_SAFE_INTEGER) - (b.trimOrder ?? Number.MAX_SAFE_INTEGER) || a.trim.localeCompare(b.trim),
  );
  const addedFeaturesLabel = locale === "zh" ? "新增配置" : locale === "am" ? "ተጨማሪ ባህሪያት" : "Added Features";
  const upgradeFeaturesLabel = locale === "zh" ? "升级配置" : locale === "am" ? "የተሻሻሉ ባህሪያት" : "Upgrade Features";
  const modelOverviewLabel = locale === "zh" ? "车型概览" : locale === "am" ? "የሞዴል አጠቃላይ እይታ" : "MODEL OVERVIEW";
  const fullComparisonRows = buildModelComparisonRows(group, "full")
    .filter((row) => trimVariants.some((variant) => safeText(row.values[variant.id]).trim()))
    .filter((row) => !/^(版本名称|推荐版本|版本核验状态|最后核验|备注)$/i.test(row.label));
  const configurationRows = fullComparisonRows.filter((row) => ["基础配置", "新增配置", "升级配置"].includes(row.label));
  const groupedComparisonRows = [
    { label: locale === "zh" ? "基本信息" : locale === "am" ? "መሠረታዊ መረጃ" : "Basic Information", rows: fullComparisonRows.filter((row) => row.category === "基本参数" || row.category === "版本") },
    { label: locale === "zh" ? "车身" : locale === "am" ? "አካል" : "Body", rows: fullComparisonRows.filter((row) => row.category === "车身") },
    { label: locale === "zh" ? "三电与性能" : locale === "am" ? "ባትሪ እና አፈጻጸም" : "Battery & Performance", rows: fullComparisonRows.filter((row) => ["电动机", "三电", "性能"].includes(row.category)) },
    { label: locale === "zh" ? "充电" : locale === "am" ? "ቻርጅ" : "Charging", rows: fullComparisonRows.filter((row) => row.category === "电池/充电" || /充电|charging/i.test(row.label)) },
    { label: locale === "zh" ? "其他技术参数" : locale === "am" ? "ሌሎች ቴክኒካዊ መረጃዎች" : "Other Technical Specifications", rows: fullComparisonRows.filter((row) => !["基本参数", "版本", "车身", "电动机", "三电", "性能", "电池/充电", "版本配置"].includes(row.category) && !/充电|charging/i.test(row.label)) },
    { label: locale === "zh" ? "配置变化" : locale === "am" ? "የውቅር ለውጦች" : "Configuration Changes", rows: configurationRows },
  ].map((section) => ({ ...section, rows: section.rows.filter((row, index, rows) => rows.findIndex((item) => item.label === row.label && item.category === row.category) === index) })).filter((section) => section.rows.length > 0);
  const batteryVal = safeText(v.battery) || getModelSpecValue(group.specsByModel, v.id, ["电池容量"]) || "-";
  const batteryTypeVal = safeText(v.batteryType) || getModelSpecValue(group.specsByModel, v.id, ["电池类型"]) || "-";
  const rangeVal = safeText(group.rangeSummary || v.range) || "-";
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
  const curbWeightVal = safeText(v.curbWeight);
  const trunkCapacityVal = safeText(v.trunkCapacity);

  const seatsStr = seatsVal && seatsVal !== "-" ? (seatsVal.toLowerCase().includes("seat") || seatsVal.includes("座") ? seatsVal : `${seatsVal}${locale === "zh" ? "座" : " seats"}`) : "";
  const doorsStr = doorsVal && doorsVal !== "-" ? `${doorsVal}${locale === "zh" ? "门" : " doors"}` : "";
  const seatsDoorsVal = compactJoin([seatsStr, doorsStr]);

  const curbWeightStr = curbWeightVal && curbWeightVal !== "-" ? curbWeightVal : "";
  const trunkCapacityStr = trunkCapacityVal && trunkCapacityVal !== "-" ? trunkCapacityVal : "";
  const weightTrunkVal = compactJoin([curbWeightStr, trunkCapacityStr]);

  const overviewSections = [
    {
      title: `⚡ ${t("portal.batteryAndCharging")}`,
      items: [[t("portal.cltcRange"), rangeVal], [t("portal.batteryCapacity"), batteryVal], [t("portal.batteryType"), batteryTypeVal], [t("portal.chargingSpecs"), chargingVal]],
    },
    {
      title: `🏁 ${t("portal.motorAndPerformance")}`,
      items: [[t("portal.driveType"), driveTypeVal], [t("portal.motorPower"), motorPowerVal], [t("portal.motorTorque"), motorTorqueVal], [t("portal.acceleration"), accelerationVal], [t("portal.topSpeed"), topSpeedVal]],
    },
    {
      title: `🛡️ ${t("portal.bodyAndChassis")}`,
      items: [[t("portal.dimensions"), dimensionsVal], [t("portal.wheelbase"), wheelbaseVal], [t("portal.seatsDoors"), seatsDoorsVal], [t("portal.weightTrunk"), weightTrunkVal]],
    },
  ];

  return (
    <div className="space-y-6 text-xs">
      <section className="border-b border-white/10 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-[#22b8aa]/10 px-2 py-1 font-mono text-[10px] font-black uppercase tracking-wider text-[#5ee6d8]">{localizeVehicleValue(safeText(group.brand), locale)} · {localizeVehicleValue(safeText(group.model), locale)}</span>
              <span className="text-[11px] text-slate-400">{t("portal.variantStockSummary", { count: trimVariants.length })}</span>
            </div>
            <h4 className="mt-2 text-base font-black text-white">{localizeVehicleValue(safeText(group.marketPosition), locale) || `${localizeVehicleValue(safeText(group.brand), locale)} ${localizeVehicleValue(safeText(group.model), locale)} ${t("portal.fullTechSpecs")}`}</h4>
          </div>
          {v.brochureUrl ? (
            <div className="flex flex-wrap items-center gap-2 text-[10px]">
              <a href={v.brochureUrl} target="_blank" rel="noreferrer" className="rounded-md border border-amber-400/25 px-2.5 py-1.5 font-bold text-amber-300 transition hover:bg-amber-400/10">{t("portal.pdfBrochure")}</a>
            </div>
          ) : null}
        </div>
      </section>

      <section>
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{modelOverviewLabel}</p>
          <h5 className="mt-0.5 text-sm font-black text-white">{t("portal.fullTechSpecs")}</h5>
        </div>
        <div className="grid grid-cols-1 gap-3.5">
          {overviewSections.map((section) => (
            <div key={section.title} className="rounded-xl border border-white/10 bg-[#0c1424] p-4 text-xs transition">
              <strong className="block border-b border-white/10 pb-2 text-xs font-bold uppercase tracking-wide text-[#5ee6d8]">{section.title}</strong>
              <dl className="mt-3 grid gap-x-4 gap-y-3 grid-cols-1 sm:grid-cols-2">
                {section.items.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="text-[10px] font-medium text-slate-400">{label}</dt>
                    <dd className="mt-0.5 break-words font-semibold text-slate-100 leading-5">{localizeVehicleValue(value, locale)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {trimVariants.length > 0 ? (
        <section className="border-t border-white/10 pt-6">
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{locale === "zh" ? "版本配置" : locale === "am" ? "የስሪት ውቅሮች" : "CONFIGURATIONS"}</p>
            <h5 className="mt-0.5 text-base font-black text-white">{t("portal.trimCount", { count: trimVariants.length })}</h5>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {trimVariants.map((variant) => (
              <article
                key={variant.id}
                className={`min-w-0 overflow-hidden rounded-xl border bg-[#0a1120] ${variant.recommendationRank ? "border-[#5ee6d8]/50" : "border-white/10"}`}
              >
                <header className={`border-b border-white/10 px-4 py-4 ${variant.recommendationRank ? "bg-[#5ee6d8]/10" : "bg-[#d8edf7] text-slate-950"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <h6 className={`min-w-0 break-words text-sm font-black leading-6 ${variant.recommendationRank ? "text-white" : "text-slate-950"}`}>
                      {localizeVehicleValue(variant.trim || variant.id, locale)}
                    </h6>
                    {variant.recommendationRank ? (
                      <span className="shrink-0 rounded-full bg-[#5ee6d8] px-2 py-1 text-[10px] font-black uppercase tracking-wide text-slate-950">
                        {locale === "zh" ? "推荐" : locale === "am" ? "የሚመከር" : "Recommended"}
                      </span>
                    ) : null}
                  </div>
                </header>
                <div className="space-y-5 p-4">
                  {groupedComparisonRows.map((section) => (
                    <section key={section.label}>
                      <h6 className="border-b border-white/10 pb-2 text-[10px] font-black uppercase tracking-[.14em] text-[#5ee6d8]">
                        {section.label}
                      </h6>
                      <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
                        {section.rows.map((row) => {
                          const isChangeRow = row.label === "新增配置" || row.label === "升级配置";
                          const rawValue = safeText(row.values[variant.id]).trim() || "-";
                          const value = localizeVehicleValue(rawValue, locale);
                          return (
                            <div key={`${variant.id}:${row.category}:${row.label}`} className="min-w-0">
                              <dt className="text-[10px] font-medium text-slate-400">
                                {localizeVehicleValue(row.label, locale)}
                              </dt>
                              <dd className={`mt-0.5 break-words text-xs font-semibold leading-5 ${rawValue === "-" ? "text-slate-600" : "text-slate-100"}`}>
                                {isChangeRow ? <span className="whitespace-pre-line">{formatTrimFeatureLines(value)}</span> : value}
                              </dd>
                            </div>
                          );
                        })}
                      </dl>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ModelGalleryCarousel({
  brand,
  model,
  images,
}: {
  brand: string;
  model: string;
  images: VehicleGalleryImage[];
}) {
  const usableImages = images.filter((image) => Boolean(image.src));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (usableImages.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % usableImages.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [usableImages.length]);

  if (usableImages.length === 0) return null;

  const currentIndex = Math.min(activeIndex, usableImages.length - 1);
  const currentImage = usableImages[currentIndex];
  const move = (offset: number) => {
    setActiveIndex((current) => (current + offset + usableImages.length) % usableImages.length);
  };

  return (
    <section
      aria-label={`${brand} ${model} image gallery`}
      className="overflow-hidden rounded-xl border border-white/10 bg-[#070e1b]"
    >
      <div className="relative aspect-[16/7] min-h-56 overflow-hidden sm:min-h-64">
        <img
          key={currentImage.src}
          src={currentImage.src}
          alt={`${brand} ${model}${currentImage.label ? ` — ${currentImage.label}` : ""}`}
          className="h-full w-full object-cover"
          decoding="async"
        />
        {usableImages.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              aria-label="Previous vehicle image"
              className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-lg text-white backdrop-blur transition hover:bg-black/75"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-label="Next vehicle image"
              className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-black/50 text-lg text-white backdrop-blur transition hover:bg-black/75"
            >
              ›
            </button>
          </>
        ) : null}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-[10px] font-black uppercase tracking-widest text-white">
          <span>{currentImage.label || currentImage.cat || "Vehicle image"}</span>
          <span>{currentIndex + 1} / {usableImages.length}</span>
        </div>
      </div>
      {usableImages.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 border-t border-white/10 px-4 py-3">
          {usableImages.map((image, index) => (
            <button
              key={`${image.src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show vehicle image ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all ${
                index === currentIndex ? "w-8 bg-[#5ee6d8]" : "w-2 bg-white/25 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AdminProfiles({ data }: { data: BootstrapData }) {
  const { t, locale } = useTranslation();
  const groups = useMemo(() => buildModelProfileGroups(data), [data]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKey, setSelectedKey] = useState<string | null>(() => null);
  const [navigatorCollapsed, setNavigatorCollapsed] = useState(false);

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const visibleGroups = groups.filter((group) => modelProfileGroupMatchesSearch(group, normalizedSearch));

  // Auto-select first visible group when search changes
  const effectiveSelectedKey = selectedKey && visibleGroups.some((g) => g.key === selectedKey) ? selectedKey : (visibleGroups[0]?.key ?? null);
  const selectedGroup = groups.find((g) => g.key === effectiveSelectedKey) ?? null;

  return (
    <div className="grid gap-5">
      <AdminPanel title={t("portal.titleModels")} subtitle={t("portal.modelLibrarySubtitle")}>
        {/* Search bar + summary */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="grid flex-1 gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            {t("portal.searchVehicleModels")}
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={t("portal.modelSearchPlaceholder")}
            />
          </label>
          <div className="flex items-center gap-2 pb-0.5">
            <AdminSummaryChip label={t("portal.modelsLabel")} value={`${visibleGroups.length} / ${groups.length}`} tone="accent" />
            <AdminSummaryChip label={t("portal.trimsLabel")} value={String(visibleGroups.reduce((sum, group) => sum + getModelTrimVariants(group).length, 0))} />
          </div>
        </div>

        {/* Master-detail layout with explicit height */}
        <div className="flex h-[calc(100vh-12rem)] min-h-[550px] gap-0 overflow-hidden rounded-xl border border-white/10">
          {/* LEFT: model list */}
          <div
            className={`flex w-full shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#070e1b] ${navigatorCollapsed ? "lg:w-14" : "lg:w-80 xl:w-96"} ${
              selectedGroup ? "hidden lg:flex" : "flex"
            }`}
          >
            <button type="button" onClick={() => setNavigatorCollapsed((value) => !value)} aria-label={navigatorCollapsed ? "Expand vehicle model list" : "Collapse vehicle model list"} className="hidden h-11 shrink-0 border-b border-white/10 text-xs font-black text-[#5ee6d8] lg:block">
              {navigatorCollapsed ? "›" : "‹"}
            </button>
            {!navigatorCollapsed && <>
            {visibleGroups.length === 0 ? (
              <div className="flex flex-1 items-center justify-center px-4 py-12 text-center text-sm text-slate-600">
                No matching vehicle models
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
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0c1424]">
                    {group.imageUrl ? (
                      <img
                        src={group.imageUrl}
                        alt={`${group.brand} ${group.model}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[9px] font-black uppercase tracking-widest text-slate-600">No image</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? "text-[#22b8aa]" : "text-slate-500"}`}>
                        {group.brand}
                      </span>
                      <span className="shrink-0 rounded-full bg-white/[.06] px-1.5 py-0.5 text-[9px] font-black text-slate-400">
                        {t("portal.trimCount", { count: getModelTrimVariants(group).length })}
                      </span>
                    </div>
                    <strong className={`mt-0.5 block truncate text-sm ${isSelected ? "text-white" : "text-slate-200"}`}>
                      {group.model}
                    </strong>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      {group.segment ? (
                        <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-[10px] text-slate-400">{group.segment}</span>
                      ) : null}
                      {group.rangeSummary ? (
                        <span className="rounded bg-white/[.05] px-1.5 py-0.5 text-[10px] text-slate-400">{group.rangeSummary}</span>
                      ) : null}
                      {group.galleryImages.length > 1 ? (
                        <span className="rounded bg-[#22b8aa]/10 px-1.5 py-0.5 text-[10px] text-[#5ee6d8]">
                          {group.galleryImages.length} photos
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
            </>}
          </div>

          {/* RIGHT: detail panel */}
          <div className={`min-h-0 flex-1 overflow-y-auto bg-[#0a1120] ${selectedGroup ? "flex flex-col" : "hidden lg:flex"}`}>
            {!selectedGroup ? (
              <div className="flex flex-1 items-center justify-center px-8 py-16 text-center">
                <div>
                  <div className="mb-3 text-4xl">🚗</div>
                  <p className="text-sm text-slate-500">Select a vehicle model to view details.</p>
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
                      aria-label="Back to model list"
                    >
                      ←
                    </button>
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0c1424]">
                      {selectedGroup.imageUrl ? (
                        <img
                          src={selectedGroup.imageUrl}
                          alt={`${selectedGroup.brand} ${selectedGroup.model}`}
                          className="h-full w-full object-cover"
                          decoding="async"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-[9px] font-black uppercase tracking-widest text-slate-600">No image</div>
                      )}
                    </div>
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
                    <button type="button" onClick={() => setNavigatorCollapsed((value) => !value)} className="hidden rounded border border-white/15 px-2 py-1 text-[10px] font-black text-slate-300 lg:block">{navigatorCollapsed ? "Show models" : "Hide models"}</button>
                    <AdminSummaryChip label={t("portal.trimsLabel")} value={String(getModelTrimVariants(selectedGroup).length)} tone="accent" />
                  </div>
                </div>

                {selectedGroup.galleryImages.some((image) => Boolean(image.src)) ? (
                  <div className="px-4 pt-4 sm:px-5">
                    <ModelGalleryCarousel
                      key={selectedGroup.key}
                      brand={selectedGroup.brand}
                      model={selectedGroup.model}
                      images={selectedGroup.galleryImages}
                    />
                  </div>
                ) : null}

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

function AdminVehicles({ data, onEdit, onRefresh, onRefreshData }: { data: BootstrapData; onEdit: (vehicle: Vehicle) => void; onRefresh: () => Promise<void>; onRefreshData: () => Promise<void> }) {
  const { t, locale } = useTranslation();
  const sellableModels = buildSellableModels(data);
  const [expandedModels, setExpandedModels] = useState<Set<string>>(() => new Set());
  const [inquiryVehicleId, setInquiryVehicleId] = useState("");
  const [expandedVariants, setExpandedVariants] = useState<Set<string>>(() => new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [supplyFilter, setSupplyFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [recommendationRanks, setRecommendationRanks] = useState<Record<string, string>>({});
  const [recommendationBusyId, setRecommendationBusyId] = useState("");
  const [recommendationError, setRecommendationError] = useState("");
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const canSeeSupplier = data.user.role !== "partner" && data.user.role !== "customer";
  const canSeeLocation = data.user.role !== "partner" && data.user.role !== "customer";
  const canManageRecommendation = data.user.role === "admin";
  const effectiveSupplierFilter = canSeeSupplier ? supplierFilter : "all";

  async function saveRecommendationRank(vehicle: Vehicle) {
    const rawRank = (recommendationRanks[vehicle.id] ?? (vehicle.recommendationRank ? String(vehicle.recommendationRank) : "")).trim();
    if (rawRank && !/^[1-9]\d*$/.test(rawRank)) {
      setRecommendationError("Recommendation rank must be a positive integer, or empty to remove it.");
      return;
    }

    setRecommendationBusyId(vehicle.id);
    setRecommendationError("");
    try {
      await api(`/api/portal/vehicles/${encodeURIComponent(vehicle.id)}/recommendation`, {
        method: "PATCH",
        body: JSON.stringify({ rank: rawRank ? Number(rawRank) : null }),
      });
      await onRefreshData();
    } catch (error) {
      setRecommendationError(error instanceof Error ? error.message : "Could not save recommendation rank");
    } finally {
      setRecommendationBusyId("");
    }
  }

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

  const supplierOptions = useMemo(() => {
    if (!canSeeSupplier) return [];
    const set = new Set<string>();
    data.vehicles.forEach((v) => {
      if (v.supplier?.trim()) set.add(v.supplier.trim());
    });
    return Array.from(set).sort();
  }, [canSeeSupplier, data.vehicles]);
  const displaySupplierOptions = supplierOptions;

  const isAllDefault = !normalizedSearch && supplyFilter === "all" && brandFilter === "all" && effectiveSupplierFilter === "all";

  const visibleModels = sellableModels
    .map((item) => {
      const rawVehicles = vehiclesForSellableModel(data.vehicles, item).filter((vehicle) =>
        vehicleMatchesAdminFilters(vehicle, item, normalizedSearch, supplyFilter, brandFilter, effectiveSupplierFilter, canSeeSupplier, canSeeLocation)
      );
      const offers = item.offers.filter((offer) =>
        offerMatchesAdminFilters(offer, item, normalizedSearch, supplyFilter, brandFilter, effectiveSupplierFilter, canSeeSupplier, canSeeLocation)
      );
      const modelMatches = modelMatchesAdminFilters(item, normalizedSearch, brandFilter);
      // 鍙湁褰撻鑹?渚涘簲鍟?渚涘簲鐘舵€佺瓫閫夐兘鏈縺娲绘椂锛屾墠鍏佽 modelMatches 鍥為€€鍒版樉绀哄叏閮?
      const hasDetailFilter = effectiveSupplierFilter !== "all" || supplyFilter !== "all";

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
    .filter((item) => (isAllDefault ? (item.offers.length > 0 || item.rawVehicles.length > 0) : (item.rawVehicles.length > 0 || item.offers.length > 0)));

  function toggleModel(key: string) {
    setExpandedModels((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleVariant(key: string) {
    setExpandedVariants((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="grid gap-5">
      {/* 椤堕儴 Header 璇存槑鍖?(鍙妯″紡锛屽幓闄や笉鍚堢悊鐨勫綍鍏ヤ笌鏂板缓鎸夐挳) */}
      <section className="rounded-2xl border border-white/10 bg-[#070e1b] p-5 shadow-2xl shadow-black/20">
        <div>
          <h1 className="text-2xl font-black text-white sm:text-3xl">{t("portal.titleVehicles")}</h1>
          <p className="mt-1.5 text-xs font-medium text-slate-400">
            {t("portal.vehicleResourcesSubtitle")}
          </p>
        </div>

        {/* 鍔ㄦ€佸疄鐢ㄧ瓫閫変笌鍏ㄦ枃鎼滅储宸ュ叿鏍?*/}
        <div className={`mt-5 grid gap-3 border-t border-white/10 pt-4 sm:items-center ${
          canSeeSupplier
            ? "sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto_auto]"
            : "sm:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,1fr)_auto_auto]"
        }`}>
          {/* 鍏ㄦ枃鎼滅储妗?*/}
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

          {/* 鍏ㄩ儴渚涘簲鍟嗕笅鎷?*/}
          {canSeeSupplier && (
          <select
            value={supplierFilter}
            onChange={(e) => setSupplierFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1424] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">{t("portal.allSuppliers")}</option>
            {displaySupplierOptions.map((supplier) => (
              <option key={supplier} value={supplier}>{localizeVehicleValue(supplier, locale)}</option>
            ))}
          </select>
          )}

          {/* 渚涘簲鐘舵€佷笅鎷?*/}
          <select
            value={supplyFilter}
            onChange={(e) => setSupplyFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#0c1424] px-3 py-2.5 text-xs font-medium text-white outline-none transition focus:border-[#22b8aa]"
          >
            <option value="all">{t("portal.allStatuses")}</option>
            <option value="in-stock">{t("portal.inStock")}</option>
            <option value="preorder">{t("portal.preorder")}</option>
          </select>

          <button
            type="button"
            onClick={() => {
              void onRefresh();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#22b8aa]/30 bg-[#22b8aa]/10 px-3.5 py-2.5 text-xs font-bold text-[#5ee6d8] transition hover:border-[#22b8aa] hover:bg-[#22b8aa]/15 hover:text-white"
            aria-label={t("portal.refreshVehicleResources")}
            title={t("portal.refreshVehicleResources")}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            {t("portal.refreshVehicleResources")}
          </button>

          {/* 重置按钮 */}
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setBrandFilter("all");
              setSupplierFilter("all");
              setSupplyFilter("all");
              setExpandedModels(new Set());
              setExpandedVariants(new Set());
            }}
            className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-2.5 text-xs font-bold text-slate-300 transition hover:border-[#22b8aa] hover:bg-[#22b8aa]/10 hover:text-white"
          >
            {t("portal.reset")}
          </button>
        </div>
      </section>

      {/* 缁撴灉缁熻 Summary Bar (鐜拌溅鎬诲彴鏁版牴鎹姹傞殣钘? */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1 text-xs font-bold text-slate-400">
        <div>
          {t("portal.vehicleTrimSummary", {
            models: visibleModels.length,
            count: visibleModels.reduce((acc, m) => acc + (m.offers?.length || 0), 0),
          })}
        </div>
      </div>

      {/* 车型卡片 Accordion 逐层结构 */}
      <div className="grid gap-4">
        {visibleModels.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#070e1b] p-10 text-center text-sm font-medium text-slate-500">
            No matching vehicle resources or trims found.
          </div>
        ) : (
          visibleModels.map((item) => {
            const isExpanded = expandedModels.has(item.key);
            const rawVehicles = item.rawVehicles || [];
            const variants = buildVehicleResourceVariants(rawVehicles);

            return (
              <section
                key={item.key}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#070e1b] shadow-xl transition"
              >
                {/* 1绾ц溅鍨?Header (鍖呭惈鎶樺彔灞曞紑鎺у埗) */}
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
                          {localizeVehicleValue(item.brand, locale)} {localizeVehicleValue(item.model, locale)}
                      </h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">
                        {variants.length > 0 ? t("portal.trimCount", { count: variants.length }) : ""}
                        {variants.length > 0 && item.hasStockQuantity ? " / " : ""}
                        {item.hasStockQuantity ? t("portal.totalStock", { count: item.stockQuantity }) : localizeVehicleValue("Stock pending confirmation", locale)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">{localizeVehicleValue("Total Stock", locale)}</span>
                      <span className="font-mono font-black text-white text-sm">
                        {item.hasStockQuantity ? t("portal.unitCount", { count: item.stockQuantity }) : "-"}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase tracking-wider text-slate-500">{localizeVehicleValue("Price", locale)}</span>
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
                              {pt.term} {formatPriceTermRange(pt)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-mono font-black text-amber-400">
                          {item.fobPriceRange ? item.fobPriceRange.replace(/^FOB\s*/i, "") : localizeVehicleValue("Price pending", locale)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="ml-2 rounded-lg border border-white/10 bg-white/[.04] px-3.5 py-1.5 text-xs font-bold text-[#5ee6d8] transition hover:bg-[#22b8aa] hover:text-[#07111f]"
                    >
                      {t(isExpanded ? "portal.hideTrims" : "portal.viewTrims")}
                    </button>
                  </div>
                </header>

                {/* 2级配置版本与车源明细表格 */}
                {isExpanded && (
                  <div className="grid gap-3 p-4 sm:p-5">
                    {variants.map((variant) => {
                      const variantKey = `${item.key}::${variant.key}`;
                      const variantExpanded = expandedVariants.has(variantKey);
                      const vehicle = variant.vehicle;
                      return (
                        <section key={variantKey} className="overflow-hidden rounded-xl border border-white/10 bg-[#0b1425]">
                          <button
                            type="button"
                            onClick={() => toggleVariant(variantKey)}
                            className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-white/[.03]"
                          >
                            <div>
                              <div className="text-sm font-bold text-white">
                                {compactJoin([
                                  localizeVehicleValue(vehicle.trim, locale) || localizeVehicleValue("Trim not specified", locale),
                                  localizeVehicleValue(vehicle.configuration, locale),
                                ])}
                              </div>
                              <div className="mt-1 text-xs text-slate-400">
                                {compactJoin([
                                  vehicle.modelStyle ? `Model Year: ${vehicle.modelStyle}` : "",
                                  vehicle.year ? t("portal.modelYear", { year: vehicle.year }) : "",
                                  localizeVehicleValue(vehicle.steering, locale),
                                  localizeVehicleValue(vehicle.marketVersion, locale),
                                ])}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs">
                              <span className="text-slate-400">{t("portal.colorCount", { count: variant.colors.length })}</span>
                              <span className="font-mono font-black text-white">
                                {variant.hasStockQuantity ? t("portal.unitCount", { count: variant.stockQuantity }) : "-"}
                              </span>
                              <span className="text-[#5ee6d8]">{t(variantExpanded ? "portal.hideColors" : "portal.viewColors")}</span>
                            </div>
                          </button>

                          {variantExpanded && (
                            <div className="border-t border-white/10 p-3 sm:p-4">
                              {canSeeSupplier ? (
                                // Admin/Sales: one row per DB vehicle row with all fields
                                <>
                                  <AdminTable
                                    headers={[
                                      formatPortalHeader("外饰 / 内饰颜色", locale),
                                      formatPortalHeader("供应商", locale),
                                      formatPortalHeader("供应商报价批次年月", locale),
                                      formatPortalHeader("生产日期批次年月", locale),
                                      formatPortalHeader("车源地点", locale),
                                      formatPortalHeader("颜色库存", locale),
                                      formatPortalHeader("起订数量", locale),
                                      formatPortalHeader("满订数量", locale),
                                      formatPortalHeader("FOB美金价", locale),
                                      formatPortalHeader("FCA美金价", locale),
                                      formatPortalHeader("EXW美金价", locale),
                                      formatPortalHeader("人民币指导价", locale),
                                      formatPortalHeader("人民币成本价", locale),
                                      formatPortalHeader("下单后需要等待天数", locale),
                                      formatPortalHeader("左右舵", locale),
                                      formatPortalHeader("国际国内版本", locale),
                                      formatPortalHeader("车型款式", locale),
                                      ...(canManageRecommendation ? ["Recommendation rank"] : []),
                                      formatPortalHeader("询盘", locale),
                                    ]}
                                    rows={variant.colors.flatMap((color) =>
                                      color.vehicles.map((v) => [
                                        <span key="color" className="text-xs text-slate-300">
                                          {formatColorPair(
                                            localizeVehicleValue(v.exteriorColor || v.color, locale),
                                            localizeVehicleValue(v.interiorColor, locale),
                                          )}
                                        </span>,
                                        <span key="supplier" className="text-xs text-slate-300">{v.supplier || "-"}</span>,
                                        <span key="quoteBatch" className="font-mono text-xs text-slate-300">{formatYearMonth(v.supplierQuoteYear, v.supplierQuoteMonth)}</span>,
                                        <span key="prodBatch" className="font-mono text-xs text-slate-300">{formatYearMonth(v.productionYear, v.productionMonth)}</span>,
                                        <span key="location" className="text-xs text-slate-300">{localizeVehicleValue(v.location, locale) || "-"}</span>,
                                        <span key="stock" className="font-mono text-xs font-bold text-white">{v.colorStockQuantity != null ? t("portal.unitCount", { count: v.colorStockQuantity }) : "-"}</span>,
                                        <span key="moq" className="font-mono text-xs text-slate-300">{v.minOrderQuantity != null ? String(v.minOrderQuantity) : "-"}</span>,
                                        <span key="foq" className="font-mono text-xs text-slate-300">{v.fullOrderQuantity != null ? String(v.fullOrderQuantity) : "-"}</span>,
                                        <span key="fob" className="font-mono text-xs font-bold text-amber-400">{v.fobUsd != null ? formatUsdStrict(v.fobUsd) : "-"}</span>,
                                        <span key="fca" className="font-mono text-xs text-cyan-300">{v.fcaUsd != null ? formatUsdStrict(v.fcaUsd) : "-"}</span>,
                                        <span key="exw" className="font-mono text-xs text-emerald-300">{v.exwUsd != null ? formatUsdStrict(v.exwUsd) : "-"}</span>,
                                        <span key="cny" className="font-mono text-xs text-slate-300">{v.guidePriceCny != null ? `¥${v.guidePriceCny.toLocaleString()}` : "-"}</span>,
                                        <span key="cost" className="font-mono text-xs text-slate-300">{v.cost != null ? `¥${v.cost.toLocaleString()}` : "-"}</span>,
                                        <span key="wait" className="text-xs text-slate-300">{v.waitDays != null ? (v.waitDays === 0 ? t("portal.availableNow") : t("portal.dayCount", { count: v.waitDays })) : "-"}</span>,
                                        <span key="steering" className="text-xs text-slate-300">{localizeVehicleValue(v.steering, locale) || "-"}</span>,
                                        <span key="market" className="text-xs text-slate-300">{localizeVehicleValue(v.marketVersion, locale) || "-"}</span>,
                                        <span key="modelStyle" className="font-mono text-xs text-slate-300">{v.modelStyle || "-"}</span>,
                                        ...(canManageRecommendation ? [
                                          <div key="recommendation" className="flex min-w-36 items-center gap-1">
                                            <input
                                              aria-label={`Recommendation rank for ${v.id}`}
                                              inputMode="numeric"
                                              value={recommendationRanks[v.id] ?? (v.recommendationRank ? String(v.recommendationRank) : "")}
                                              onChange={(event) => setRecommendationRanks((current) => ({ ...current, [v.id]: event.target.value }))}
                                              className="w-16 rounded border border-white/15 bg-slate-950 px-2 py-1 text-xs text-white"
                                              placeholder="-"
                                            />
                                            <button
                                              type="button"
                                              onClick={() => void saveRecommendationRank(v)}
                                              disabled={recommendationBusyId === v.id}
                                              className="rounded border border-theme/60 px-2 py-1 text-[10px] font-black text-theme disabled:opacity-50"
                                            >
                                              {recommendationBusyId === v.id ? "..." : "Save"}
                                            </button>
                                          </div>,
                                        ] : []),
                                        <button key="inquiry" type="button" onClick={() => setInquiryVehicleId((current) => current === v.id ? "" : v.id)} className="text-xs font-black text-theme">{formatPortalHeader(inquiryVehicleId === v.id ? "隐藏询盘" : "询盘", locale)}</button>,
                                      ])
                                    )}
                                    emptyText={formatPortalHeader("无库存记录", locale)}
                                  />
                                  {inquiryVehicleId && variant.colors.some((color) => color.vehicles.some((vehicle) => vehicle.id === inquiryVehicleId)) && <VehicleInquiryPanel vehicle={data.vehicles.find((vehicle) => vehicle.id === inquiryVehicleId)!} data={data} onRefresh={onRefreshData} />}
                                </>
                              ) : (
                                // External users: color-grouped view
                                <>
                                  <AdminTable
                                    headers={[
                                      formatPortalHeader("外饰 / 内饰颜色", locale),
                                      formatPortalHeader("颜色库存", locale),
                                      ...(canSeeLocation ? [formatPortalHeader("车源地点", locale)] : []),
                                      formatPortalHeader("美金报价", locale),
                                      formatPortalHeader("下单后需要等待天数", locale),
                                      formatPortalHeader("询盘", locale),
                                    ]}
                                    rows={variant.colors.map((color) => {
                                      const colorVehicle = color.vehicles[0];
                                      const locations = Array.from(new Set(color.vehicles.map((item) => item.location).filter(Boolean)));
                                      return [
                                        <span key="color" className="text-xs text-slate-300">
                                          {formatColorPair(
                                            localizeVehicleValue(locale === "zh" ? color.exteriorColor : color.vehicles[0]?.exteriorColorEnglish || color.exteriorColor, locale),
                                            localizeVehicleValue(locale === "zh" ? color.interiorColor : color.vehicles[0]?.interiorColorEnglish || color.interiorColor, locale),
                                          )}
                                        </span>,
                                        <span key="stock" className="font-mono text-xs font-bold text-white">
                                          {color.hasStockQuantity ? t("portal.unitCount", { count: color.quantity }) : "-"}
                                        </span>,
                                        ...(canSeeLocation
                                          ? [<span key="location" className="text-xs text-slate-300">{locations.length ? locations.map((location) => localizeVehicleValue(location, locale)).join(" / ") : "-"}</span>]
                                          : []),
                                        <div key="price" className="grid gap-1">
                                          {color.priceByLocation.length > 0 ? color.priceByLocation.map((price) => (
                                            <span key={`${price.location}-${price.term}-${price.amount}`} className="w-fit rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
                                              {localizeVehicleValue(price.location, locale)} · {price.term} {formatUsdStrict(price.amount)}
                                            </span>
                                          )) : colorVehicle.price ? (
                                            <span className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-xs font-bold text-amber-400">
                                              {colorVehicle.priceTerm || "FOB"} {formatUsdStrict(colorVehicle.price)}
                                            </span>
                                          ) : "-"}
                                        </div>,
                                        <span key="fulfillment" className="text-xs text-slate-300">{formatFulfillmentStatus(colorVehicle, (count) => count === 0 ? t("portal.availableNow") : t("portal.dayCount", { count }))}</span>,
                                        <button key="inquiry" type="button" onClick={() => setInquiryVehicleId((current) => current === colorVehicle.id ? "" : colorVehicle.id)} className="text-xs font-black text-theme">{formatPortalHeader(inquiryVehicleId === colorVehicle.id ? "隐藏询盘" : "询盘", locale)}</button>,
                                      ];
                                    })}
                                    emptyText={formatPortalHeader("无库存记录", locale)}
                                  />
                                  {inquiryVehicleId && variant.colors.some((color) => color.vehicles.some((vehicle) => vehicle.id === inquiryVehicleId)) && <VehicleInquiryPanel vehicle={data.vehicles.find((vehicle) => vehicle.id === inquiryVehicleId)!} data={data} onRefresh={onRefreshData} />}
                                </>
                              )}
                            </div>
                          )}
                        </section>
                      );
                    })}
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

function VehicleInquiryPanel({ vehicle, data, onRefresh }: { vehicle: Vehicle; data: BootstrapData; onRefresh: () => Promise<void> }) {
  const [message, setMessage] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [selectedInquiryNo, setSelectedInquiryNo] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [postedNotes, setPostedNotes] = useState<InquiryNote[]>([]);
  const inquiries = data.inquiries.filter((item) => item.vehicleId === vehicle.id);
  const targetInquiry = inquiries.find((item) => item.inquiryNo === selectedInquiryNo) || inquiries[0];
  const notes = postedNotes
    .filter((item) => item.inquiryNo === targetInquiry?.inquiryNo)
    .reduce((current, item) => appendInquiryComment(current, item), data.inquiryNotes.filter((item) => item.inquiryNo === targetInquiry?.inquiryNo));

  async function post(event: React.FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    setError("");
    try {
      if (targetInquiry) {
        const result = await api<{ note: InquiryNote }>(`/api/portal/inquiries/${encodeURIComponent(targetInquiry.inquiryNo)}/notes`, {
          method: "POST",
          body: JSON.stringify({ body: message, parentNoteId: replyTo }),
        });
        setPostedNotes((current) => appendInquiryComment(current, result.note));
      } else {
        await api("/api/portal/inquiries", {
          method: "POST",
          body: JSON.stringify({ vehicleId: vehicle.id, quantity: 1, tradeTerm: "FOB", notes: message }),
        });
        await onRefresh();
      }
      setMessage("");
      setReplyTo("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not post inquiry message");
    } finally {
      setBusy(false);
    }
  }

  return <section className="mt-3 rounded-lg border border-theme/30 bg-theme/5 p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-theme">Inquiry discussion</p><p className="mt-1 text-xs text-slate-300">{[vehicle.brand, vehicle.model, vehicle.configuration || vehicle.trim, vehicle.color].filter(Boolean).join(" / ")}</p></div><span className="text-xs text-slate-400">{notes.length} messages</span></div>{inquiries.length > 1 && <div className="mt-3 grid gap-2"><p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Private conversations</p>{inquiries.map((inquiry) => <button key={inquiry.inquiryNo} type="button" onClick={() => { setSelectedInquiryNo(inquiry.inquiryNo); setReplyTo(""); }} className={`rounded border p-2 text-left text-xs ${targetInquiry?.inquiryNo === inquiry.inquiryNo ? "border-theme bg-theme/10 text-white" : "border-white/10 text-slate-300"}`}>{inquiry.inquiryNo} · {inquiry.customerId}</button>)}</div>}<div className="mt-3 grid gap-2">{notes.map((item) => <article key={item.id} className="rounded border border-white/10 bg-black/15 p-3"><p className={`text-xs font-black ${inquiryCommentAuthorClass(item.authorRole)}`}>{item.authorName}</p>{item.parentNoteId && <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-theme">Quote reply</p>}<p className="mt-1 text-sm text-slate-300">{item.body}</p><button type="button" onClick={() => setReplyTo(item.noteId)} className="mt-2 text-[10px] font-black uppercase text-theme">Quote reply</button></article>)}{notes.length === 0 && <p className="text-xs text-slate-400">No messages yet.</p>}</div><form onSubmit={post} className="mt-3 grid gap-2">{replyTo && <div className="flex justify-between text-xs text-theme">Quote reply to a specific message <button type="button" onClick={() => setReplyTo("")}>Cancel</button></div>}<textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder={replyTo ? "Write a quote reply" : "Describe your purchase intention or ask a question"} className="min-h-20 rounded border border-white/15 bg-black/20 p-3 text-sm text-white" /><div className="flex justify-between">{error ? <span className="text-xs text-red-300">{error}</span> : <span />}<button disabled={busy || !message.trim()} className="btn-primary rounded px-3 py-2 text-[10px] font-black uppercase">{busy ? "Saving..." : targetInquiry ? "Send message" : "Send inquiry request"}</button></div></form></section>;
}

type InquirySnapshot = Record<string, unknown>;

function parseInquirySnapshot(value: string): InquirySnapshot {
  try {
    const snapshot = JSON.parse(value);
    return snapshot && typeof snapshot === "object" ? snapshot as InquirySnapshot : {};
  } catch {
    return {};
  }
}

function InquirySnapshotDetails({ inquiry }: { inquiry: Inquiry }) {
  const { locale } = useTranslation();
  const labels = locale === "zh" ? {
    model: "车型", quantity: "数量", color: "颜色", configuration: "配置", steering: "方向盘", marketVersion: "市场版本", location: "所在地", tradeTerm: "贸易条款", fobPrice: "FOB 价格", targetPrice: "目标价格", destinationPort: "目的港", units: "辆",
  } : locale === "am" ? {
    model: "ሞዴል", quantity: "ብዛት", color: "ቀለም", configuration: "ውቅር", steering: "መሪ", marketVersion: "የገበያ ስሪት", location: "ቦታ", tradeTerm: "የንግድ ውል", fobPrice: "FOB ዋጋ", targetPrice: "የታለመ ዋጋ", destinationPort: "የመድረሻ ወደብ", units: "ክፍሎች",
  } : {
    model: "Model", quantity: "Quantity", color: "Color", configuration: "Configuration", steering: "Steering", marketVersion: "Market version", location: "Location", tradeTerm: "Trade term", fobPrice: "FOB price", targetPrice: "Target price", destinationPort: "Destination port", units: "units",
  };
  const snapshot = parseInquirySnapshot(inquiry.vehicleSnapshot);
  const details = [
    [labels.model, [snapshot.brand, snapshot.model, snapshot.variant].filter(Boolean).join(" ") || inquiry.vehicleModel],
    [labels.quantity, `${inquiry.quantity} ${labels.units}`],
    [labels.color, [snapshot.exteriorColor, snapshot.interiorColor, snapshot.color].filter(Boolean).join(" / ")],
    [labels.configuration, snapshot.configuration],
    [labels.steering, snapshot.steering],
    [labels.marketVersion, snapshot.marketVersion],
    [labels.location, snapshot.location],
    [labels.tradeTerm, inquiry.tradeTerm],
    [labels.fobPrice, snapshot.priceUsd ? `USD ${Number(snapshot.priceUsd).toLocaleString()}` : ""],
    [labels.targetPrice, inquiry.targetPrice ? `USD ${inquiry.targetPrice.toLocaleString()}` : ""],
    [labels.destinationPort, inquiry.destinationPort],
  ].filter(([, value]) => Boolean(value));

  return <div className="mt-4 grid gap-2 border-t border-white/10 pt-3 sm:grid-cols-2 xl:grid-cols-3">
    {details.map(([label, value]) => <div key={String(label)} className="rounded border border-white/10 bg-black/10 px-3 py-2"><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-xs text-slate-200">{String(value)}</p></div>)}
  </div>;
}

function InquiryCommentThread({ thread, onReply, onClose, replyLabel = "Quote reply", closeLabel }: { thread: ReturnType<typeof buildInquiryCommentThreads<InquiryNote>>[number]; onReply: (noteId: string) => void; onClose?: (note: InquiryNote) => void; replyLabel?: string; closeLabel?: string }) {
  const { locale } = useTranslation();
  const { note, replies } = thread;
  return <article id={`note-${note.noteId}`} className="rounded-lg border border-white/10 bg-[#0b1425] p-4">
    <div className="flex justify-between gap-2"><p className={`text-xs font-black ${inquiryCommentAuthorClass(note.authorRole)}`}>{note.authorName} <span className="font-medium text-slate-400">{formatPortalRole(note.authorRole as PortalRole, locale)}</span></p><time className="text-[10px] text-slate-500">{formatDate(note.createdAt)}</time></div>
    <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{note.body}</p>
    <div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => onReply(note.noteId)} className="text-xs text-theme">{replyLabel}</button>{onClose && <button type="button" onClick={() => onClose(note)} className="text-xs text-red-300">{closeLabel || "Close comment"}</button>}</div>
    {replies.length > 0 && <div className="mt-3 grid gap-2 border-l-2 border-theme/40 pl-3">{replies.map((reply) => <InquiryCommentThread key={reply.note.id} thread={reply} onReply={onReply} onClose={onClose} replyLabel={replyLabel} closeLabel={closeLabel} />)}</div>}
  </article>;
}

function AdminQuotes({ data, onRefresh }: { data: BootstrapData; onRefresh: () => Promise<void> }) {
  const { t, locale } = useTranslation();
  const [selectedNo, setSelectedNo] = useState(data.inquiries[0]?.inquiryNo || "");
  const [note, setNote] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [showNew, setShowNew] = useState(data.inquiries.length === 0);
  const [target, setTarget] = useState<InquiryVehicleTarget>({ vehicleId: "", vehicleModel: "" });
  const [newInquiryQuantity, setNewInquiryQuantity] = useState(1);
  const [title, setTitle] = useState("");
  const [initialNote, setInitialNote] = useState("");
  const [inquirySearch, setInquirySearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [postedNotes, setPostedNotes] = useState<InquiryNote[]>([]);
  const [showQuoteComposer, setShowQuoteComposer] = useState(false);
  const [quotePrice, setQuotePrice] = useState("");
  const [quoteCif, setQuoteCif] = useState("");
  const [preview, setPreview] = useState<{ quoteNo: string; customer: string; vehicleModel: string; quantity: number; unitPrice: number; cifTotal: string } | null>(null);
  const [hiddenNotes, setHiddenNotes] = useState<InquiryNote[]>([]);
  const [showHiddenNotes, setShowHiddenNotes] = useState(false);
  const copy = locale === "zh" ? {
    search: "搜索车型、客户或询价编号", noResults: "没有符合条件的询价。", inquiryRequest: "询价请求", closeComment: "关闭评论", manageHidden: "管理已关闭评论", hiddenTitle: "已关闭评论", restore: "恢复评论", deletePermanently: "永久删除", cancel: "取消", reply: "引用回复", replyPlaceholder: "写一条回复", messagePlaceholder: "写一条消息", send: "发送消息", saving: "保存中…", postInquiry: "发布询价", units: "数量", brand: "品牌", model: "车型", trim: "版本", quoteReply: "引用回复", hiddenEmpty: "没有已关闭的评论。",
  } : locale === "am" ? {
    search: "ሞዴል፣ ደንበኛ ወይም የጥያቄ ቁጥር ፈልግ", noResults: "ከማጣሪያው ጋር የሚስማማ ጥያቄ የለም።", inquiryRequest: "የጥያቄ ጥያቄ", closeComment: "አስተያየት ዝጋ", manageHidden: "የተዘጉ አስተያየቶችን አስተዳድር", hiddenTitle: "የተዘጉ አስተያየቶች", restore: "አስተያየት መልስ", deletePermanently: "ለዘላለም ሰርዝ", cancel: "ሰርዝ", reply: "ምላሽ ስጥ", replyPlaceholder: "ምላሽ ጻፍ", messagePlaceholder: "መልዕክት ጻፍ", send: "መልዕክት ላክ", saving: "በማስቀመጥ ላይ…", postInquiry: "ጥያቄ አስገባ", units: "ብዛት", brand: "ብራንድ", model: "ሞዴል", trim: "ስሪት", quoteReply: "ምላሽ ስጥ", hiddenEmpty: "የተዘጋ አስተያየት የለም።",
  } : {
    search: "Search vehicle, customer, or inquiry", noResults: "No inquiries match this search.", inquiryRequest: "Inquiry request", closeComment: "Close comment", manageHidden: "Manage closed comments", hiddenTitle: "Closed comments", restore: "Restore comment", deletePermanently: "Delete permanently", cancel: "Cancel", reply: "Quote reply", replyPlaceholder: "Write a reply", messagePlaceholder: "Write a message", send: "Send message", saving: "Saving…", postInquiry: "Post inquiry", units: "Units", brand: "Brand", model: "Model", trim: "Trim", quoteReply: "Quote reply", hiddenEmpty: "No closed comments.",
  };
  const commentCopy = locale === "zh" ? {
    inquiryRequest: "询价请求", closeComment: "关闭评论", reply: "引用回复", cancel: "取消", replyPlaceholder: "写一条引用回复", messagePlaceholder: "写一条消息", send: "发送消息", sendReply: "发送引用回复", saving: "保存中…", noMessages: "此询价暂无评论。", hiddenTitle: "已关闭的评论", hiddenDescription: "关闭仅会从主会话中隐藏单条评论，不会关闭或删除整条询价。", hiddenEmpty: "没有已关闭的评论。", restore: "恢复评论", deletePermanently: "永久删除", manageHidden: "管理已关闭评论",
  } : locale === "am" ? {
    inquiryRequest: "የጥያቄ ጥያቄ", closeComment: "አስተያየት ዝጋ", reply: "ጥቅስ ምላሽ", cancel: "ሰርዝ", replyPlaceholder: "የጥቅስ ምላሽ ይጻፉ", messagePlaceholder: "መልእክት ይጻፉ", send: "መልእክት ላክ", sendReply: "የጥቅስ ምላሽ ላክ", saving: "በማስቀመጥ ላይ…", noMessages: "በዚህ ጥያቄ ላይ ገና አስተያየት የለም።", hiddenTitle: "የተዘጉ አስተያየቶች", hiddenDescription: "መዝጋት አንድን አስተያየት ከዋናው ውይይት ብቻ ይደብቃል፤ ጥያቄውን አይዘጋውም ወይም አይሰርዘውም።", hiddenEmpty: "የተዘጉ አስተያየቶች የሉም።", restore: "አስተያየት መልስ", deletePermanently: "በቋሚነት ሰርዝ", manageHidden: "የተዘጉ አስተያየቶችን አስተዳድር",
  } : {
    inquiryRequest: "Inquiry request", closeComment: "Close comment", reply: "Quote reply", cancel: "Cancel", replyPlaceholder: "Write a quote reply", messagePlaceholder: "Write a message", send: "Send message", sendReply: "Send quote reply", saving: "Saving…", noMessages: "No comments in this inquiry yet.", hiddenTitle: "Closed comments", hiddenDescription: "Closing only hides one comment from the main conversation. It does not close or delete the inquiry.", hiddenEmpty: "No closed comments.", restore: "Restore comment", deletePermanently: "Delete permanently", manageHidden: "Manage closed comments",
  };
  const inquiries = data.inquiries;
  const visibleInquiries = inquiries.filter((inquiry) => {
    const haystack = `${inquiry.vehicleModel} ${inquiry.title} ${inquiry.customerId} ${inquiry.inquiryNo}`.toLowerCase();
    return !inquirySearch.trim() || haystack.includes(inquirySearch.trim().toLowerCase());
  });
  const selected = visibleInquiries.find((item) => item.inquiryNo === selectedNo) || visibleInquiries[0];
  const activeInquiryNo = selected?.inquiryNo || "";
  useEffect(() => {
    if (selectedNo === activeInquiryNo) return;
    setSelectedNo(activeInquiryNo);
    setReplyTo("");
    setNote("");
    setShowQuoteComposer(false);
  }, [activeInquiryNo, selectedNo]);
  const notes = postedNotes.filter((note) => note.inquiryNo === selected?.inquiryNo).reduce((current, note) => appendInquiryComment(current, note), data.inquiryNotes.filter((item) => item.inquiryNo === selected?.inquiryNo));
  const commentThreads = buildInquiryCommentThreads(notes);
  const parent = notes.find((item) => item.noteId === replyTo);
  const canModerateComments = data.user.role === "admin";
  const canCreateQuote = data.user.role === "admin" || data.user.role === "sales";
  const unreadCount = inquiries.filter((inquiry) => inquiry.hasUnreadFollowUps).length;

  async function select(inquiry: Inquiry) { setSelectedNo(inquiry.inquiryNo); setError(""); if (inquiry.hasUnreadFollowUps) { await api(`/api/portal/inquiries/${encodeURIComponent(inquiry.inquiryNo)}/read`, { method: "POST" }); await onRefresh(); } }
  async function create(event: React.FormEvent) { event.preventDefault(); if ((!target.vehicleModel && !title.trim()) || !initialNote.trim()) return; setBusy(true); try { await api("/api/portal/inquiries", { method: "POST", body: JSON.stringify({ vehicleId: target.vehicleId, vehicleModel: target.vehicleModel, title, quantity: newInquiryQuantity, tradeTerm: "FOB", notes: initialNote }) }); setShowNew(false); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not start inquiry"); } finally { setBusy(false); } }
  async function post(event: React.FormEvent) { event.preventDefault(); if (!selected || !note.trim()) return; setBusy(true); try { const result = await api<{ note: InquiryNote }>(`/api/portal/inquiries/${encodeURIComponent(selected.inquiryNo)}/notes`, { method: "POST", body: JSON.stringify({ body: note, parentNoteId: replyTo }) }); setPostedNotes((current) => appendInquiryComment(current, result.note)); setNote(""); setReplyTo(""); } catch (e) { setError(e instanceof Error ? e.message : "Could not add follow-up"); } finally { setBusy(false); } }
  async function closeComment(comment: InquiryNote) { if (!window.confirm(`${copy.closeComment}?`)) return; setBusy(true); setError(""); try { await api(`/api/portal/inquiry-content/note/${encodeURIComponent(comment.noteId)}`, { method: "DELETE", body: JSON.stringify({ reason: "Closed by administrator" }) }); setPostedNotes((current) => current.filter((item) => item.noteId !== comment.noteId)); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not close comment"); } finally { setBusy(false); } }
  async function loadHiddenComments() { setBusy(true); setError(""); try { const result = await api<{ notes: InquiryNote[] }>("/api/portal/inquiry-content/deleted"); setHiddenNotes(result.notes); setShowHiddenNotes(true); } catch (e) { setError(e instanceof Error ? e.message : "Could not load closed comments"); } finally { setBusy(false); } }
  async function moderateHiddenComment(noteId: string, action: "restore" | "purge") { if (action === "purge" && !window.confirm(copy.deletePermanently + "?")) return; setBusy(true); setError(""); try { await api(`/api/portal/inquiry-content/note/${encodeURIComponent(noteId)}`, { method: "PATCH", body: JSON.stringify({ action }) }); if (action === "restore") await onRefresh(); await loadHiddenComments(); } catch (e) { setError(e instanceof Error ? e.message : "Could not update closed comment"); } finally { setBusy(false); } }
  async function createQuotation(event: React.FormEvent) { event.preventDefault(); if (!selected) return; const unitPrice = Number(quotePrice); if (!Number.isFinite(unitPrice) || unitPrice <= 0) { setError("Enter a USD unit price before creating the quotation"); return; } setBusy(true); setError(""); try { const created = await api<{ quoteNo: string; quantity: number; unitPrice: number }>("/api/portal/quotes", { method: "POST", body: JSON.stringify({ inquiryNo: selected.inquiryNo, unitPrice }) }); setPreview({ quoteNo: created.quoteNo, customer: selected.customerId, vehicleModel: selected.vehicleModel, quantity: created.quantity, unitPrice: created.unitPrice, cifTotal: quoteCif || "USD 0.00" }); setShowQuoteComposer(false); } catch (e) { setError(e instanceof Error ? e.message : "Could not create quotation"); } finally { setBusy(false); } }

  return <AdminPanel title={t("portal.inquiryManagementTitle")} subtitle={t("portal.inquiryManagementSubtitle")}>
    {unreadCount > 0 && <p className="mb-4 rounded border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200">{unreadCount} {copy.send}</p>}
    <div className="mb-4 flex flex-wrap justify-between gap-3"><Input aria-label={copy.search} value={inquirySearch} onChange={(event) => setInquirySearch(event.target.value)} placeholder={copy.search} /><div className="flex flex-wrap gap-3">{canModerateComments && <button type="button" onClick={() => void loadHiddenComments()} className="rounded border border-white/15 px-4 py-2 text-[10px] font-black uppercase text-slate-200">{copy.manageHidden}</button>}{canCreateQuote && <button type="button" disabled={!selected} onClick={() => setShowQuoteComposer((value) => !value)} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{t("portal.createQuotation")}</button>}<button type="button" onClick={() => setShowNew((value) => !value)} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{t("portal.startInquiry")}</button></div></div>
    {showQuoteComposer && selected && <form onSubmit={createQuotation} className="mb-4 grid gap-3 rounded-lg border border-gold/40 bg-gold/5 p-4 md:grid-cols-3"><p className="text-xs text-slate-300 md:col-span-3">{selected.vehicleModel} / {selected.quantity} units — the original quotation template will open after creation.</p><Input aria-label="USD unit price" type="number" min="0" step="0.01" value={quotePrice} onChange={(event) => setQuotePrice(event.target.value)} placeholder="FOB unit price (USD)" required /><Input aria-label="CIF total" value={quoteCif} onChange={(event) => setQuoteCif(event.target.value)} placeholder="CIF total (USD, manual entry)" /><button disabled={busy} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{busy ? "Creating..." : "Create and open template"}</button></form>}
    {showNew && <form onSubmit={create} className="mb-4 grid gap-3 rounded-lg border border-theme/30 bg-theme/5 p-4"><InquiryVehiclePicker vehicles={data.vehicles} value={target} onChange={setTarget} /><Input aria-label="Inquiry quantity" type="number" min="1" value={newInquiryQuantity} onChange={(event) => setNewInquiryQuantity(Math.max(1, Number(event.target.value) || 1))} /><Input aria-label="Inquiry title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder={target.vehicleModel ? "Inquiry title (optional)" : "Inquiry title (required when no vehicle is selected)"} required={!target.vehicleModel} /><textarea value={initialNote} onChange={(event) => setInitialNote(event.target.value)} className="min-h-24 rounded border border-white/15 bg-black/20 p-3 text-sm text-white" /><button disabled={busy || (!target.vehicleModel && !title.trim()) || !initialNote.trim()} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{copy.postInquiry}</button></form>}
    <div className="grid gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]">
      <aside className="grid content-start max-h-[70vh] gap-2 overflow-y-auto pr-1">
        {visibleInquiries.map((inquiry) => {
          const details = inquiryListDetails(inquiry);
          const isSelected = selected?.inquiryNo === inquiry.inquiryNo;
          return <button key={inquiry.inquiryNo} type="button" onClick={() => void select(inquiry)} className={`rounded-lg border p-3 text-left ${isSelected ? "border-white bg-emerald-400/15" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}>
            <div className="flex items-center justify-between gap-2"><span className={`font-mono text-xs font-black ${isSelected ? "text-lime-300" : "text-white"}`}>{inquiry.inquiryNo}</span>{inquiry.hasUnreadFollowUps && <span className="h-2 w-2 rounded-full bg-amber-300" />}</div>
            <div className={`mt-2 grid gap-1 text-xs ${isSelected ? "text-lime-300" : "text-slate-300"}`}>
              <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.units}</span>{details.quantity}</p>
              {details.brand && <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.brand}</span>{details.brand}</p>}
              <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.model}</span>{details.model}</p>
              {details.trim && <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.trim}</span>{details.trim}</p>}
            </div>
          </button>;
        })}
        {visibleInquiries.length === 0 && <p className="rounded border border-dashed border-white/15 p-3 text-xs text-slate-400">{copy.noResults}</p>}
      </aside>
      {selected && <section className="min-w-0">
        <div className="rounded-lg border border-white/10 bg-[#0b1425] p-4">
          <p className="text-[10px] font-black uppercase text-theme">{commentCopy.inquiryRequest}</p>
          <h3 className="mt-1 font-black text-white">{selected.inquiryNo}</h3>
          <InquirySnapshotDetails inquiry={selected} />
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{selected.notes}</p>
        </div>
        <div className="mt-4 grid gap-3">
          {commentThreads.map((thread) => <InquiryCommentThread key={thread.note.id} thread={thread} onReply={setReplyTo} onClose={canModerateComments ? closeComment : undefined} replyLabel={commentCopy.reply} closeLabel={commentCopy.closeComment} />)}
          {notes.length === 0 && <p className="text-sm text-slate-400">{commentCopy.noMessages}</p>}
        </div>
        <form onSubmit={post} className="mt-4 grid gap-2">
          {replyTo && <div className="flex justify-between rounded border border-theme/30 bg-theme/5 px-3 py-2 text-xs text-theme">{parent ? replyReference(parent) : commentCopy.reply}<button type="button" onClick={() => setReplyTo("")}>{commentCopy.cancel}</button></div>}
          <textarea value={note} maxLength={4000} onChange={(event) => setNote(event.target.value)} placeholder={replyTo ? commentCopy.replyPlaceholder : commentCopy.messagePlaceholder} className="min-h-24 rounded border border-white/10 bg-black/20 p-3 text-sm text-white" />
          <button disabled={busy || !note.trim()} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{busy ? commentCopy.saving : replyTo ? commentCopy.sendReply : commentCopy.send}</button>
          {error && <p className="text-xs text-red-300">{error}</p>}
        </form>
      </section>}
    </div>
    {showHiddenNotes && <Dialog open onOpenChange={(open) => setShowHiddenNotes(open)} className="max-w-2xl"><DialogHeader><DialogTitle>{commentCopy.hiddenTitle}</DialogTitle><DialogDescription>{commentCopy.hiddenDescription}</DialogDescription></DialogHeader><div className="grid max-h-96 gap-3 overflow-y-auto p-4">{hiddenNotes.length === 0 ? <p className="text-sm text-slate-400">{commentCopy.hiddenEmpty}</p> : hiddenNotes.map((item) => <article key={item.noteId} className="rounded border border-white/10 p-3"><p className="text-xs font-black text-white">{item.authorName}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{item.body}</p><div className="mt-3 flex gap-3"><button type="button" disabled={busy} onClick={() => void moderateHiddenComment(item.noteId, "restore")} className="text-xs text-theme">{commentCopy.restore}</button><button type="button" disabled={busy} onClick={() => void moderateHiddenComment(item.noteId, "purge")} className="text-xs text-red-300">{commentCopy.deletePermanently}</button></div></article>)}</div></Dialog>}
    {preview && <Dialog open onOpenChange={(open) => !open && setPreview(null)} className="max-w-[min(96vw,1200px)] p-3"><DialogHeader><DialogTitle>Official quotation {preview.quoteNo}</DialogTitle><DialogDescription>The document below is the original quotation template, prefilled from this inquiry.</DialogDescription></DialogHeader><div><QuotationTemplatePreview {...preview} /></div></Dialog>}
  </AdminPanel>;
}

function AdminOrders({ data }: { data: BootstrapData }) {
  const { t } = useTranslation();
  return (
    <AdminPanel title={t("portal.orderManagementTitle")} subtitle={t("portal.orderManagementSubtitle")}>
      <AdminTable
        headers={[t("portal.orderNo"), t("portal.customer"), t("portal.quoteNo"), t("portal.vehicle"), t("portal.quantity"), t("portal.total"), t("portal.status"), t("portal.created")]}
        rows={data.orders.map((order) => {
          const customer = findCustomer(data, order.customerId);
          return [
            order.orderNo,
            customer?.company || order.customerId || "-",
            order.quoteNo || "-",
            order.vehicleId,
            t("portal.unitCount", { count: order.quantity }),
            formatUsdStrict(order.total),
            <AdminStatusBadge key="status" status={order.status || "Draft"} />,
            formatDate(order.createdAt),
          ];
        })}
        emptyText={t("portal.noOrders")}
      />
    </AdminPanel>
  );
}

function AdminPayments({ data }: { data: BootstrapData }) {
  const { t } = useTranslation();
  const total = data.orders.reduce((sum, order) => sum + order.total, 0);
  const paid = data.orders
    .filter((order) => order.status.toLowerCase().includes("paid"))
    .reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="grid gap-5">
      <section className="grid gap-4 md:grid-cols-3">
        <AdminStat label={t("portal.orderReceivables")} value={formatUsdStrict(total)} note={t("portal.orderCount", { count: data.orders.length })} />
        <AdminStat label={t("portal.received")} value={formatUsdStrict(paid)} note={t("portal.basedOnOrderStatus")} />
        <AdminStat label={t("portal.outstanding")} value={formatUsdStrict(Math.max(total - paid, 0))} note={t("portal.paymentDetailPending")} />
      </section>
      <AdminPanel title={t("portal.paymentsTitle")} subtitle={t("portal.paymentsSubtitle")}>
        <AdminTable
          headers={[t("portal.orderNo"), t("portal.customer"), t("portal.paymentTerms"), t("portal.orderValue"), t("portal.paymentStatus")]}
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
          emptyText={t("portal.noFinanceRecords")}
        />
      </AdminPanel>
    </div>
  );
}

function AdminLogistics({ data }: { data: BootstrapData }) {
  const { t } = useTranslation();
  const shippedCount = data.orders.filter((order) => /ship|shipped|shipping|装船|发运/i.test(order.status)).length;
  const customsCount = data.orders.filter((order) => /custom|clearance|清关/i.test(order.status)).length;
  const steps = [
    ["Inquiries", data.inquiries.length, "Customer requirements"],
    ["Quotes", data.quotes.length, "Sales quote versions"],
    ["Orders", data.orders.length, "Confirmed purchases"],
    ["Payments", data.orders.filter((order) => /paid|deposit|付款|定金/i.test(order.status)).length, "Financial status"],
    ["Shipment", shippedCount, "Export dispatch"],
    ["Customs", customsCount, "Destination-port workflow"],
  ];

  return (
    <div className="grid gap-5">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {steps.map(([label, count, note]) => (
          <AdminStat key={String(label)} label={String(label)} value={String(count)} note={String(note)} />
        ))}
      </section>
      <AdminPanel title={t("portal.exportWorkflowTitle")} subtitle={t("portal.exportWorkflowSubtitle")}>
        <AdminTable
          headers={[t("portal.orderNo"), t("portal.customer"), t("portal.vehicle"), t("portal.quantity"), t("portal.currentStage"), t("portal.created")]}
          rows={data.orders.map((order) => {
            const customer = findCustomer(data, order.customerId);
            return [
              order.orderNo,
              customer?.company || order.customerId || "-",
              order.vehicleId,
              t("portal.unitCount", { count: order.quantity }),
              <AdminStatusBadge key="status" status={order.status || "Draft"} />,
              formatDate(order.createdAt),
            ];
          })}
          emptyText={t("portal.noExportWorkflowRecords")}
        />
      </AdminPanel>
    </div>
  );
}

function AdminCustomers({ data }: { data: BootstrapData }) {
  const { t, locale } = useTranslation();
  const customers = data.customers || [];
  return (
    <AdminPanel title={t("portal.customerAccountsTitle")} subtitle={t("portal.customerAccountsSubtitle")}>
      <AdminTable
        headers={[t("portal.userId"), t("portal.company"), t("portal.contact"), t("portal.email"), t("portal.role"), t("portal.priceTier"), t("portal.country"), t("portal.status")]}
        rows={customers.map((customer) => [
          <span key="id" className="font-mono text-xs text-[#22b8aa]">{customer.customerId}</span>,
          customer.company || "-",
          customer.contact || "-",
          customer.email || "-",
          formatPortalRole(customer.role, locale),
          customer.priceTier,
          customer.country || "-",
          <AdminStatusBadge key="status" status={customer.status || "Active"} />,
        ])}
        emptyText={t("portal.noCustomerAccounts")}
      />
    </AdminPanel>
  );
}

function AdminStaff({ data }: { data: BootstrapData }) {
  const { t, locale } = useTranslation();
  const users = data.internalUsers || [];
  const rows =
    users.length > 0
      ? users.map((user) => [
          user.userId || "-",
          user.name || "-",
          user.email || "-",
          formatPortalRole(user.role, locale),
          compactJoin([
            user.canEditVehicles ? "Vehicle editing" : "",
            user.canSeeCost ? "Cost visibility" : "",
            user.canSeeSupplier ? "Supplier visibility" : "",
          ]),
          user.department || "-",
          user.status || "Active",
        ])
      : [
          [data.user.userId || "USR-ADMIN", data.user.name || data.user.email, data.user.email, formatPortalRole(data.user.role, locale), t("portal.currentSignedInAccount"), "-", t("portal.active")],
        ];

  return (
    <AdminPanel title={t("portal.staffAccountsTitle")} subtitle={t("portal.staffAccountsSubtitle")}>
      <AdminTable
        headers={[t("portal.userId"), t("portal.name"), t("portal.email"), t("portal.role"), t("portal.permissions"), t("portal.department"), t("portal.status")]}
        rows={rows.map((row) => [
          <span key="id" className="font-mono text-xs text-[#22b8aa]">{row[0]}</span>,
          row[1],
          row[2],
          row[3],
          row[4] || "-",
          row[5],
          <AdminStatusBadge key="status" status={row[6]} />,
        ])}
        emptyText={t("portal.noStaffAccounts")}
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
      setError(saveError instanceof Error ? saveError.message : "Unable to save changes.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title={`Edit vehicle resource / ${vehicle.id}`} onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {canEditOptionalField("Model ID") && (
            <FormField label="Model ID">
              <input value={form.modelId} onChange={(event) => updateField("modelId", event.target.value)} placeholder="MDL-001" />
            </FormField>
          )}
          <FormField label="Status">
            <select value={form.status} onChange={(event) => updateField("status", event.target.value)}>
              <option>In Stock</option>
              <option>Preorder</option>
              <option>Unavailable</option>
            </select>
          </FormField>
          <FormField label="Color">
            <input value={form.color} onChange={(event) => updateField("color", event.target.value)} />
          </FormField>
          {canEditOptionalField("Exterior Color") && (
            <FormField label="Exterior color">
              <input value={form.exteriorColor} onChange={(event) => updateField("exteriorColor", event.target.value)} placeholder="White" />
            </FormField>
          )}
          {canEditOptionalField("Interior Color") && (
            <FormField label="Interior color">
              <input value={form.interiorColor} onChange={(event) => updateField("interiorColor", event.target.value)} placeholder="Black" />
            </FormField>
          )}
          {canEditOptionalField("Supplier Exterior Color") && (
            <FormField label="Supplier exterior color">
              <input value={form.supplierExteriorColor} onChange={(event) => updateField("supplierExteriorColor", event.target.value)} placeholder={locale === "zh" ? "珍珠白 / 极地白" : "Pearl White / Polar White"} />
            </FormField>
          )}
          {canEditOptionalField("Supplier Interior Color") && (
            <FormField label="Supplier interior color">
              <input value={form.supplierInteriorColor} onChange={(event) => updateField("supplierInteriorColor", event.target.value)} placeholder={locale === "zh" ? "黑内 / 米内" : "Black Interior / Beige Interior"} />
            </FormField>
          )}
          {canEditOptionalField("Color Code") && (
            <FormField label="Color code">
              <input value={form.colorCode} onChange={(event) => updateField("colorCode", event.target.value)} />
            </FormField>
          )}
          {canEditOptionalField("Configuration") && (
            <FormField label="Configuration">
              <input value={form.configuration} onChange={(event) => updateField("configuration", event.target.value)} placeholder="Standard export configuration" />
            </FormField>
          )}
          {canEditOptionalField("Supplier") && (
            <FormField label="Supplier">
              <input value={form.supplier} onChange={(event) => updateField("supplier", event.target.value)} />
            </FormField>
          )}
          {canEditOptionalField("Recorder") && (
            <FormField label="Recorded by">
              <input value={form.recorder} onChange={(event) => updateField("recorder", event.target.value)} placeholder="Recorder name" />
            </FormField>
          )}
          <FormField label="Location">
            <input value={form.location} onChange={(event) => updateField("location", event.target.value)} />
          </FormField>
          <FormField label="Stock quantity">
            <input type="number" min="0" value={form.stockQuantity} onChange={(event) => updateField("stockQuantity", event.target.value)} />
          </FormField>
          {canEditOptionalField("Lead Time") && (
            <FormField label="Lead time">
              <input value={form.leadTime} onChange={(event) => updateField("leadTime", event.target.value)} placeholder="30-45 days after deposit" />
            </FormField>
          )}
          <FormField label="Partner price">
            <input type="number" value={form.partnerPrice} onChange={(event) => updateField("partnerPrice", event.target.value)} />
          </FormField>
          <FormField label="Customer price">
            <input type="number" value={form.customerPrice} onChange={(event) => updateField("customerPrice", event.target.value)} />
          </FormField>
          <FormField label="Cost">
            <input type="number" value={form.cost} onChange={(event) => updateField("cost", event.target.value)} />
          </FormField>
          {canEditOptionalField("Price Valid Until") && (
            <FormField label="Price valid until">
              <input value={form.priceValidUntil} onChange={(event) => updateField("priceValidUntil", event.target.value)} placeholder="2026-07-31" />
            </FormField>
          )}
          <FormField label="Image URL">
            <input value={form.imageUrl} onChange={(event) => updateField("imageUrl", event.target.value)} />
          </FormField>
        </div>

        <FormField label="Notes">
          <Textarea value={form.publicNotes} onChange={(event) => updateField("publicNotes", event.target.value)} />
        </FormField>

        {canEditOptionalField("Color Notes") && (
          <FormField label="Internal color notes">
            <Textarea value={form.colorNotes} onChange={(event) => updateField("colorNotes", event.target.value)} placeholder="Use actual photos and supplier source descriptions as references." />
          </FormField>
        )}

        {canEditOptionalField("Color Confirmed") && (
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-bold text-slate-300">
            <span>Color confirmed</span>
            <Switch
              checked={form.colorConfirmed}
              onCheckedChange={(val) => updateField("colorConfirmed", val)}
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.04] px-4 py-3 text-xs font-bold text-slate-300">
          <span>List publicly</span>
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
            Cancel
          </Button>
          <Button disabled={saving} variant="default">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function AdminPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const { locale } = useTranslation();
  return (
    <section className="min-w-0">
      <header className="mb-5 border-b border-white/10 pb-4">
        <h2 className="text-lg font-black text-white">{localizeVehicleValue(title, locale)}</h2>
        {subtitle ? <p className="mt-1 text-xs text-slate-400">{localizeVehicleValue(subtitle, locale)}</p> : null}
      </header>
      {children}
    </section>
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
  const { locale } = useTranslation();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((header) => (
            <TableHead key={header}>{localizeVehicleValue(header, locale)}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={headers.length} className="py-8 text-center text-slate-500">
              {localizeVehicleValue(emptyText, locale)}
            </TableCell>
          </TableRow>
        ) : (
          rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <TableCell key={cellIndex} className="break-words">
                  {typeof cell === "string" ? localizeVehicleValue(cell, locale) : cell}
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
  const { locale } = useTranslation();
  const displayStatus = formatPortalStatus(status, locale);
  const normalized = displayStatus.toLowerCase();
  const tone =
    /active|accepted|listed|paid|启用|已|active/.test(normalized)
      ? "border-[#22b8aa]/30 bg-[#22b8aa]/10 text-[#5ee6d8]"
      : /pending|draft|wait|待/.test(normalized)
        ? "border-amber-300/25 bg-amber-300/10 text-amber-200"
        : "border-white/10 bg-white/[.05] text-slate-300";

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${tone}`}>
      {displayStatus}
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

function getModelTrimVariants(group: ModelProfileGroup) {
  return group.variants.filter((variant) => safeText(variant.trim).trim());
}

function mergeModelGalleryImages(
  existing: VehicleGalleryImage[],
  incoming: VehicleGalleryImage[],
): VehicleGalleryImage[] {
  const seen = new Set<string>();
  return [...existing, ...incoming].filter((image) => {
    if (!image.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}

function modelGalleryImages(model: VehicleModel): VehicleGalleryImage[] {
  const images = (Array.isArray(model.galleryImages) ? model.galleryImages : [])
    .filter((image) => image && typeof image.src === "string" && image.src.trim() && image.src !== "/pic/hero/0.webp")
    .map((image) => ({
      src: image.src,
      cat: image.cat || "Exterior",
      label: image.label || "Vehicle image",
    }));
  const coverImage = model.imageUrl !== "/pic/hero/0.webp" ? model.imageUrl : "";
  return images.length > 0
    ? images
    : coverImage
      ? [{ src: coverImage, cat: "Exterior", label: "Main Profile" }]
      : [];
}

export function buildModelProfileGroups(data: BootstrapData): ModelProfileGroup[] {
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
    const modelGallery = modelGalleryImages(model);
    const modelImage = modelGallery[0]?.src || "";
    const key = normalizeKey(model.brand, model.model);
    if (!grouped.has(key)) {
      grouped.set(key, {
        key,
        brand: model.brand,
        model: model.model,
        years: [],
        variants: [],
        imageUrl: modelImage,
        galleryImages: modelGallery,
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
    group.galleryImages = mergeModelGalleryImages(group.galleryImages, modelGallery);
    const specificImage = group.galleryImages.find((image) => image.src !== "/pic/hero/0.webp")?.src;
    if ((!group.imageUrl || group.imageUrl === "/pic/hero/0.webp") && (specificImage || modelImage)) {
      group.imageUrl = specificImage || modelImage;
    }
    if (model.year && !group.years.includes(model.year)) group.years.push(model.year);
  }

  const groups = [...grouped.values()];
  for (const group of groups) {
    group.variants.sort((a, b) => {
      const trimOrder = (a.trimOrder ?? Number.MAX_SAFE_INTEGER) - (b.trimOrder ?? Number.MAX_SAFE_INTEGER);
      if (trimOrder) return trimOrder;
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
  return groups.sort((a, b) => {
    const aRank = recommendationRankForModelGroup(a);
    const bRank = recommendationRankForModelGroup(b);
    return compareRecommendationRanks(aRank, bRank) || `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
  });
}

function recommendationRankForModelGroup(group: ModelProfileGroup) {
  return group.variants
    .map((variant) => variant.recommendationRank)
    .reduce<number | null>((best, rank) => compareRecommendationRanks(best, rank) <= 0 ? best : rank ?? null, null);
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

function buildVariantDifferenceSteps(group: ModelProfileGroup, locale: string = "zh"): VariantDifferenceStep[] {
  const ignoredNames = new Set(["品牌", "车系", "车型", "年款", "版本", "版本名称", "市场定位", "原始参数JSON", "出口备注", "版本核对", "中国官方指导价", "国内官方指导价", "基础配置"]);
  const entryNames = new Set(["车身级别", "能源类型", "CLTC续航", "电池容量", "电池类型", "电机总功率", "驱动方式", "座位数"]);
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
    return {
      variant,
      label: index === 0 ? "入门版底座" : index === group.variants.length - 1 ? "最高配升级" : "加价升级",
      price: getModelSpecValue(group.specsByModel, variant.id, ["中国官方指导价"]),
      range: getModelSpecValue(group.specsByModel, variant.id, ["CLTC续航"]),
      sections: sectionItems.length ? [{
        label: index === 0 ? "基础配置" : `第 ${index + 1} 档新增/升级`,
        tone: upgradeStepColor(index),
        isCurrent: true,
        items: sectionItems,
      }] : [],
    };
  });
}

function upgradeStepColor(index: number) {
  return ["#f4d35e", "#5ee6d8", "#8fb7ff", "#f5a3c7", "#b6e36a"][index % 5];
}

function specCategoryTone(category: string) {
  const normalized = category.toLowerCase();
  if (/(battery|charging|powertrain)/.test(normalized)) return "#5ee6d8";
  if (/(safety|adas|assist)/.test(normalized)) return "#8fb7ff";
  if (/(comfort|interior|seat)/.test(normalized)) return "#f5a3c7";
  if (/(exterior|lighting|glass)/.test(normalized)) return "#f4d35e";
  if (/(body|chassis|wheel)/.test(normalized)) return "#b6e36a";
  return "#94a3b8";
}

function upgradeSpecRank(spec: VehicleModelSpec) {
  const normalized = `${spec.category} ${spec.name}`.toLowerCase();
  if (/(range|battery|motor|drive|charge|power)/.test(normalized)) return 10;
  if (/(safety|assist|adas)/.test(normalized)) return 50;
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

export function buildSellableModels(data: BootstrapData): SellableModel[] {
  const modelsByVehicle = new Map<string, VehicleModel>();
  const modelsByName = new Map<string, VehicleModel>();
  for (const item of data.vehicleModels || []) {
    if (item.id) modelsByVehicle.set(item.id, item);
    modelsByName.set(modelResourceKey(item.brand, item.model), item);
  }

  const grouped = new Map<string, { item: SellableModel; offerMap: Map<string, VehicleOffer> }>();
  for (const vehicle of data.vehicles || []) {
    const modelInfo = modelsByVehicle.get(vehicle.modelId) || modelsByName.get(modelResourceKey(vehicle.brand, vehicle.model));
    const modelKey = modelResourceKey(vehicle.brand, vehicle.model);
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
          hasStockQuantity: false,
          preorderAvailable: false,
          fobPriceRange: "FOB on request",
          recommendationRank: vehicle.recommendationRank ?? null,
          offers: [],
        },
        offerMap: new Map(),
      });
    }

    const entry = grouped.get(modelKey)!;
    const supplyType = getSupplyType(vehicle);
    const itemStock = vehicle.colorStockQuantity ?? (typeof vehicle.stockQuantity === "number" && vehicle.stockQuantity > 0 ? vehicle.stockQuantity : null);
    if (itemStock !== null && itemStock !== undefined) {
      entry.item.stockQuantity += itemStock;
      entry.item.hasStockQuantity = true;
    }
    entry.item.preorderAvailable = entry.item.preorderAvailable || supplyType === "Preorder";
    entry.item.recommendationRank = compareRecommendationRanks(entry.item.recommendationRank, vehicle.recommendationRank) <= 0
      ? entry.item.recommendationRank
      : vehicle.recommendationRank ?? null;
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
      existing.quantity += itemStock ?? vehicle.stockQuantity;
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
        quantity: itemStock ?? vehicle.stockQuantity,
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

      // 汇总该车型所有 offer 的 FOB/EXW/FCA 价格区间（取各 term 的最低与最高）
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
      const priceTermsSummary: PriceTermSummary[] = termOrder
        .filter((t) => termMap.has(t))
        .map((t) => {
          const range = termMap.get(t)!;
          return { term: t, min: range.min, max: range.max };
        });

      return {
        ...item,
        offers,
        priceTermsSummary,
        fobPriceRange: formatFobRange(offers.map((offer) => offer.price).filter((price): price is number => Boolean(price))),
      };
    })
    .sort((a, b) => {
      const recommendationOrder = compareRecommendationRanks(a.recommendationRank, b.recommendationRank);
      const inStockRank = Number(b.offers.some((offer) => offer.supplyType === "In Stock")) - Number(a.offers.some((offer) => offer.supplyType === "In Stock"));
      return recommendationOrder || inStockRank || Number(b.hasStockQuantity) - Number(a.hasStockQuantity) || b.stockQuantity - a.stockQuantity || a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model) || b.year.localeCompare(a.year);
    });
}

export function buildVehicleResourceVariants(vehicles: Vehicle[]): VehicleResourceVariant[] {
  const grouped = new Map<string, VehicleResourceVariant>();

  for (const vehicle of vehicles) {
    const key = normalizeKey(
      vehicle.year,
      vehicle.trim,
      vehicle.configuration,
      vehicle.steering,
      vehicle.marketVersion,
    );
    let variant = grouped.get(key);
    if (!variant) {
      variant = {
        key,
        vehicle,
        vehicles: [],
        stockQuantity: 0,
        hasStockQuantity: false,
        colors: [],
      };
      grouped.set(key, variant);
    }

    variant.vehicles.push(vehicle);
    const itemStock = vehicle.colorStockQuantity ?? (typeof vehicle.stockQuantity === "number" && vehicle.stockQuantity > 0 ? vehicle.stockQuantity : null);
    if (itemStock !== null && itemStock !== undefined) {
      variant.stockQuantity += itemStock;
      variant.hasStockQuantity = true;
    }

    const exteriorColor = vehicle.exteriorColor || vehicle.color;
    const colorKey = normalizeKey(exteriorColor, vehicle.interiorColor);
    let color = variant.colors.find((item) => item.key === colorKey);
    if (!color) {
      color = {
        key: colorKey,
        exteriorColor,
        interiorColor: vehicle.interiorColor,
        quantity: 0,
        hasStockQuantity: false,
        priceTerms: [],
        priceByLocation: [],
        vehicles: [],
      };
      variant.colors.push(color);
    }
    color.vehicles.push(vehicle);
    if (itemStock !== null && itemStock !== undefined) {
      color.quantity += itemStock;
      color.hasStockQuantity = true;
    }
  }

  return Array.from(grouped.values())
    .map((variant) => ({
      ...variant,
      colors: variant.colors
        .map((color) => ({ ...color, priceTerms: uniqueVehiclePriceTerms(color.vehicles), priceByLocation: vehiclePriceByLocation(color.vehicles) }))
        .sort((a, b) =>
          formatColorPair(a.exteriorColor, a.interiorColor).localeCompare(formatColorPair(b.exteriorColor, b.interiorColor)),
        ),
    }))
    .sort((a, b) =>
      compactJoin([a.vehicle.trim, a.vehicle.configuration, a.vehicle.year]).localeCompare(
        compactJoin([b.vehicle.trim, b.vehicle.configuration, b.vehicle.year]),
      ),
    );
}

export function buildInquiryVehiclePickerOptions(vehicles: Vehicle[]) {
  const grouped = new Map<string, { key: string; brand: string; model: string; vehicles: Vehicle[] }>();

  for (const vehicle of vehicles) {
    const key = modelResourceKey(vehicle.brand, vehicle.model);
    const existing = grouped.get(key);
    if (existing) existing.vehicles.push(vehicle);
    else grouped.set(key, { key, brand: vehicle.brand, model: vehicle.model, vehicles: [vehicle] });
  }

  return Array.from(grouped.values())
    .map((model) => ({ ...model, variants: buildVehicleResourceVariants(model.vehicles) }))
    .sort((left, right) => compactJoin([left.brand, left.model]).localeCompare(compactJoin([right.brand, right.model])));
}

function getFobPrice(vehicle: Vehicle) {
  return vehicle.price;
}

function compareRecommendationRanks(left: number | null | undefined, right: number | null | undefined) {
  const leftRank = left && left > 0 ? left : Number.MAX_SAFE_INTEGER;
  const rightRank = right && right > 0 ? right : Number.MAX_SAFE_INTEGER;
  return leftRank - rightRank;
}

function vehiclePriceByLocation(vehicles: Vehicle[]) {
  const unique = new Map<string, { location: string; term: string; amount: number }>();
  for (const vehicle of vehicles) {
    for (const price of vehicle.priceTermsList || []) {
      const location = vehicle.location || "China";
      unique.set(`${location}:${price.term}:${price.amount}`, { location, term: price.term, amount: price.amount });
    }
  }
  return Array.from(unique.values()).sort((a, b) => a.location.localeCompare(b.location) || a.term.localeCompare(b.term) || a.amount - b.amount);
}

export function vehiclesForSellableModel(vehicles: Vehicle[], item: SellableModel) {
  return vehicles
    .filter((vehicle) => modelResourceKey(vehicle.brand, vehicle.model) === item.key)
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
  supplierFilter: string,
  canSeeSupplier = true,
  canSeeLocation = true
) {
  if (brandFilter !== "all") {
    const itemB = (item.brand || "").toLowerCase();
    const filterB = brandFilter.toLowerCase();
    if (!itemB.includes(filterB) && !filterB.includes(itemB)) return false;
  }

  if (canSeeSupplier && supplierFilter !== "all") {
    // offer 鐨勫簳灞?vehicles 涓嚦灏戜竴涓緵搴斿晢鍖归厤
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
    ...(canSeeLocation ? [offer.location] : []),
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
  supplierFilter: string,
  canSeeSupplier = true,
  canSeeLocation = true
) {
  if (brandFilter !== "all") {
    const b = (vehicle.brand || item.brand || "").toLowerCase();
    const filterB = brandFilter.toLowerCase();
    if (!b.includes(filterB) && !filterB.includes(b)) return false;
  }

  if (canSeeSupplier && supplierFilter !== "all") {
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
    ...(canSeeSupplier ? [vehicle.supplierExteriorColor, vehicle.supplierInteriorColor] : []),
    vehicle.colorCode,
    vehicle.configuration,
    vehicle.steering,
    vehicle.marketVersion,
    ...(canSeeSupplier ? [vehicle.supplier] : []),
    vehicle.recorder,
    ...(canSeeLocation ? [vehicle.location] : []),
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
  if (vehicle.waitDays === 0) return "In Stock";
  if (vehicle.waitDays !== null && vehicle.waitDays !== undefined && vehicle.waitDays > 0) return "Preorder";
  // waitDays not available — fall back to stockQuantity
  if (typeof vehicle.stockQuantity === "number" && vehicle.stockQuantity > 0) return "In Stock";
  return "Unknown";
}

function formatFulfillmentStatus(vehicle: Vehicle, formatDays: (count: number) => string) {
  if (vehicle.waitDays !== null && vehicle.waitDays !== undefined) {
    return formatDays(vehicle.waitDays);
  }
  return "-";
}

function formatFobRange(prices: number[]) {
  if (prices.length === 0) return "FOB on request";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return `FOB ${formatUsdStrict(min)} - ${formatUsdStrict(max)}`;
}

function formatSupplySummary(item: SellableModel) {
  return item.stockQuantity > 0 ? "In Stock" : "Pre-order Only";
}

function formatColorPair(exteriorColor: string, interiorColor: string) {
  const ext = (exteriorColor || "").trim();
  const int = (interiorColor || "").trim();
  const validExt = ext && ext !== "-" && ext !== "未指定" ? ext : "";
  const validInt = int && int !== "-" && int !== "未指定" ? int : "";

  if (validExt && validInt && validExt !== validInt) {
    return `${validExt} / ${validInt}`;
  }
  return validExt || validInt || "-";
}

function formatYearMonth(year?: string | number | null, month?: string | number | null): string {
  if (!year && !month) return "-";
  const y = year ? String(year).trim() : "";
  let m = month ? String(month).trim() : "";

  // Handle combined strings in year field (e.g. "2025-08", "2025/8", "2025.08", "2025年8月")
  if (y && !m) {
    const match = y.match(/^(\d{4})[-/.\u5e74](\d{1,2})[\u6708]?$/);
    if (match) {
      return `${match[1]}-${match[2].padStart(2, "0")}`;
    }
  }

  if (m) {
    m = m.replace(/月/g, "").trim();
    if (/^\d+$/.test(m)) {
      m = m.padStart(2, "0");
    }
  }
  if (y && m) return `${y}-${m}`;
  if (y) return y;
  if (m) return m;
  return "-";
}

function normalizeKey(...values: Array<string | number | null | undefined>) {
  return values.map((value) => String(value ?? "").trim().toLowerCase()).join("::");
}

function uniqueVehiclePriceTerms(vehicles: Vehicle[]): PriceTerm[] {
  const unique = new Map<string, PriceTerm>();
  for (const vehicle of vehicles) {
    const terms = vehicle.priceTermsList?.length
      ? vehicle.priceTermsList
      : vehicle.price !== null && vehicle.price !== undefined
        ? [{ term: vehicle.priceTerm || "FOB", amount: vehicle.price }]
        : [];
    for (const term of terms) {
      unique.set(normalizeKey(term.term, term.amount), term);
    }
  }
  const termOrder = ["FOB", "EXW", "FCA"];
  return Array.from(unique.values()).sort((a, b) => {
    const order = termOrder.indexOf(a.term) - termOrder.indexOf(b.term);
    return order || a.amount - b.amount;
  });
}

function modelResourceKey(brand: string, model: string) {
  const normalizedBrand = String(brand || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  const normalizedModel = String(model || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
  const modelWithoutRepeatedBrand = normalizedBrand && normalizedModel.startsWith(normalizedBrand)
    ? normalizedModel.slice(normalizedBrand.length)
    : normalizedModel;
  return `${normalizedBrand}::${modelWithoutRepeatedBrand}`;
}

function vehicleName(vehicle: Vehicle) {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`.trim() || vehicle.id;
}

function getVehicleStockQuantity(vehicle: Pick<Vehicle, "stockQuantity" | "colorStockQuantity">) {
  return vehicle.colorStockQuantity ?? (typeof vehicle.stockQuantity === "number" && vehicle.stockQuantity > 0 ? vehicle.stockQuantity : 0);
}

function compactJoin(values: Array<string | number | null | undefined>) {
  const text = values
    .map((value) => String(value ?? "").trim())
    .filter((val) => val && val !== "-" && val !== "未指定")
    .join(" / ");
  return text || "-";
}

function formatTrimFeatureLines(value: string) {
  return value
    .split(/[;；]\s*/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
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
