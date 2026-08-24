"use client";

import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
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
import { defaultPriceTierForRole, type AccountType, type PortalRole, type PriceTier } from "@/lib/users";
import { QuotationTemplatePreview } from "@/components/portal/QuotationTemplatePreview";
import { InquiryVehiclePicker, type InquiryVehicleTarget } from "@/components/portal/InquiryVehiclePickerField";
import { InquiryTitleField } from "@/components/portal/InquiryTitleField";
import { requiresInquiryTitle } from "@/lib/inquiry-vehicle-selection";
import { appendInquiryComment, inquiryCommentAuthorClass } from "@/lib/inquiry-comment-state";
import { buildInquiryCommentThreads, canViewInquiryNumber, inquiryListDetails, replyReference } from "@/lib/inquiry-workflow";
import { useDashboardNavigation } from "@/components/DashboardNavigationContext";
import { FeaturedVehicleCarousel } from "@/components/portal/FeaturedVehicleCarousel";
import { InquiryRequestPanel } from "@/components/portal/InquiryRequestPanel";
import type { InquiryRequest } from "@/lib/inquiry-requests";
import { selectFeaturedVehicleResources } from "@/lib/featured-vehicle-resources";

type AdminModule = "dashboard" | "vehicle_models" | "vehicles" | "quotes" | "orders" | "payments" | "logistics" | "accounts";
type AdminIconName = "dashboard" | "vehicle_models" | "vehicles" | "quotes" | "orders" | "payments" | "logistics" | "accounts";

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
  modelStyle?: string | null;
  // Extended internal fields (admin/sales only)
  guidePriceCny?: number | null;
  currency?: string | null;
  syncBatchId?: string | null;
  syncedAt?: string | null;
  minOrderQuantity?: number | null;
  fullOrderQuantity?: number | null;
  sourceStage?: string | null;
  inventoryStatus?: string | null;
  vehicleClass?: string | null;
  reviewer?: string | null;
  developer?: string | null;
  mediaSourcePath?: string | null;
  experienceNotes?: string | null;
  autoCorrectionNotes?: string | null;
  duplicateCheck?: string | null;
  recommendationSlot?: string | null;
  recommendationRank?: number | null;
  featuredRank?: number | null;
  featuredImageUrl?: string | null;
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
  /** 汇总该车型所有 offer 中出现过的 FOB/EXW/FCA 价格区间 */
  priceTermsSummary: PriceTermSummary[];
  offers: VehicleOffer[];
  vehicles?: Vehicle[];
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
  title?: string;
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
  creatorName?: string;
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

type InquiryCommentInquiry = { inquiryNo: string; vehicleModel: string; title: string; quantity: number; destinationPort: string; tradeTerm: string; notes: string; createdAt: string; creatorName: string; };
type InquiryNote = { id: string; noteId: string; inquiryNo: string; parentNoteId: string; authorUserId: string; authorName: string; authorRole: string; body: string; isPublic: boolean; createdAt: string; deletedAt?: string; isHiddenPlaceholder?: boolean; inquiry?: InquiryCommentInquiry; };
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

export type PortalUserRecord = {
  user_id: string;
  customer_id: string;
  name: string;
  email: string;
  company: string;
  whatsapp: string;
  telegram_chat_id: string;
  telegram_username: string;
  account_type: AccountType;
  role: PortalRole;
  access_code: string;
  status: "Active" | "Disabled";
  created_at: string;
  updated_at: string;
  bound_chat_id?: string;
  bound_telegram_username?: string;
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
  inquiryRequests: InquiryRequest[];
  inquiryStatusHistory: InquiryStatusHistory[];
  orders: Order[];
  internalUsers: InternalUser[];
  customers: Customer[];
  portalUsers?: PortalUserRecord[];
  telegramBinding?: {
    bound: boolean;
    telegramUsername: string | null;
    bindingUrl: string;
  };
};

function mergeBootstrapData(current: BootstrapData | null, incoming: BootstrapData): BootstrapData {
  if (!current) return incoming;

  // `/bootstrap` deliberately omits the heavy trim payload. Keep the coupled
  // model rows and their specifications until `/vehicle-models` is reloaded.
  const keepHydratedModels = current.vehicleModelSpecs.length > 0 && incoming.vehicleModelSpecs.length === 0;
  return {
    ...incoming,
    vehicleModels: keepHydratedModels ? current.vehicleModels : incoming.vehicleModels,
    vehicleModelSpecs: keepHydratedModels ? current.vehicleModelSpecs : incoming.vehicleModelSpecs,
    vehicles: incoming.vehicles.length > 0 ? incoming.vehicles : current.vehicles,
  };
}

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
  { key: "quotes", labelKey: "portal.navQuotes", roles: ["admin", "sales", "partner", "customer"], icon: "quotes", badge: "preview" },
  { key: "orders", labelKey: "portal.navOrders", roles: ["admin", "sales", "finance", "partner", "customer"], icon: "orders", badge: "development" },
  { key: "payments", labelKey: "portal.navPayments", roles: ["admin", "finance"], icon: "payments", badge: "development" },
  { key: "logistics", labelKey: "portal.navLogistics", roles: ["admin", "sales", "partner", "customer"], icon: "logistics", badge: "development" },
  { key: "accounts", labelKey: "portal.navAccounts", roles: ["admin"], icon: "accounts", badge: "development" },
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

// 模块全局缓存（跨路由切换/组件卸载挂载共享，实现页面切换 0 次重复请求与并发去重）
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
  const [isLocalDev, setIsLocalDev] = useState(false);
  const [showPreviewTestLogin, setShowPreviewTestLogin] = useState(false);

  const [activeAdminModule, setActiveAdminModule] = useState<AdminModule>("dashboard");
  const [targetInquiryNo, setTargetInquiryNo] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const host = window.location.hostname.toLowerCase();
      setIsLocalDev(host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]");
      setShowPreviewTestLogin(
        host.includes("workers.dev") ||
        host.includes("youguard-preview") ||
        host.includes("preview")
      );

      const params = new URLSearchParams(window.location.search);
      const inq = params.get("inquiry");
      const tab = params.get("tab");
      if (inq) {
        setTargetInquiryNo(inq);
        setActiveAdminModule("quotes");
      } else if (tab === "quotes" || tab === "vehicles" || tab === "orders" || tab === "accounts") {
        setActiveAdminModule(tab as AdminModule);
      }
    }
  }, []);
  const [selectedSellableModel, setSelectedSellableModel] = useState<SellableModel | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [inquiryForm, setInquiryForm] = useState<InquiryForm>(emptyInquiryForm);
  const [counterQuote, setCounterQuote] = useState<Quote | null>(null);
  const [counterPrice, setCounterPrice] = useState("");
  const [counterMessage, setCounterMessage] = useState("");

  const handleNavigateInquiry = useCallback((inquiryNo: string) => {
    setTargetInquiryNo(inquiryNo);
    setActiveAdminModule("quotes");
  }, []);

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
    setData((prev) => {
      const merged = mergeBootstrapData(prev, bootstrap);
      globalBootstrapData = merged;
      globalBootstrapPromise = Promise.resolve(merged);
      return merged;
    });
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
    const validModules: AdminModule[] = ["dashboard", "vehicle_models", "vehicles", "quotes", "orders", "payments", "logistics", "accounts"];
    const syncFromUrl = () => {
      const pathname = window.location.pathname.toLowerCase();
      const segments = pathname.split("/").filter(Boolean);
      const lastSegment = (segments[segments.length - 1] || "").replaceAll("-", "_");

      if (lastSegment === "staff" || lastSegment === "customers" || lastSegment === "users") {
        const canonicalPath = pathname.replace(/\/(staff|customers|users)$/, "/accounts");
        if (canonicalPath !== pathname) {
          window.history.replaceState({}, "", canonicalPath + window.location.search);
        }
      }

      const params = new URLSearchParams(window.location.search);
      const queryTab = (params.get("tab") || params.get("module") || "").toLowerCase().replaceAll("-", "_");

      const normalize = (val: string): AdminModule | null => {
        if (!val) return null;
        if (val === "profiles") return "vehicle_models";
        if (val === "accounts" || val === "users" || val === "customers" || val === "staff") return "accounts";
        if (validModules.includes(val as AdminModule)) return val as AdminModule;
        return null;
      };

      const matched = normalize(queryTab) || normalize(lastSegment);
      if (matched) {
        setActiveAdminModule(matched);
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
      const res = await api<{ vehicleModels: VehicleModel[]; vehicleModelSpecs: VehicleModelSpec[] }>("/api/portal/vehicle-models");
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
      targetInquiryNo={targetInquiryNo}
      data={data}
      error={error}
      isModuleLoading={moduleLoading}
      onModuleChange={handleModuleChange}
      onNavigateInquiry={handleNavigateInquiry}
      onLogout={logout}
      onReload={checkSessionAndLoad}
      onRefreshVehicles={refreshVehicles}
      onRefreshData={refreshBootstrap}
    />
  );
}

function AdminPortal({
  data,
  activeModule,
  targetInquiryNo,
  onModuleChange,
  onNavigateInquiry,
  onLogout,
  onReload,
  onRefreshVehicles,
  onRefreshData,
  error,
  isModuleLoading,
}: {
  data: BootstrapData;
  activeModule: AdminModule;
  targetInquiryNo?: string;
  onModuleChange: (module: AdminModule) => void;
  onNavigateInquiry?: (inquiryNo: string) => void;
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
  const { isDashboardNavigationOpen, setDashboardNavigationOpen } = useDashboardNavigation();
  const visibleNav = adminNavItems.filter((item) => item.roles.includes(data.user.role));
  const normalizedActiveModule = visibleNav.some((item) => item.key === activeModule) ? activeModule : "dashboard";
  const activeItem = visibleNav.find((item) => item.key === normalizedActiveModule) || visibleNav[0];
  const totalStock = data.vehicles.reduce((sum, vehicle) => sum + getVehicleStockQuantity(vehicle), 0);
  const openInquiries = data.inquiries.filter((item) => item.status.trim().toLowerCase() === "open").length;
  const orderTotal = data.orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <main className="min-h-screen bg-[#0c1322] text-slate-100 pt-16 sm:pt-20">
      {/* Mobile dashboard context; drawer control lives in the global mobile header. */}
      <div className="sticky top-16 z-40 flex items-center border-b border-white/10 bg-[#0b1425]/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black tracking-wider text-[#22b8aa] uppercase">
            {t("portal.navDashboard")}
          </span>
          <span className="text-slate-500">/</span>
          <span className="text-xs font-bold text-white truncate max-w-[160px]">
            {t(activeItem.labelKey)}
          </span>
        </div>
      </div>

      <div className={`grid min-h-[calc(100vh-5rem)] min-w-0 transition-[grid-template-columns] duration-200 ${sidebarCollapsed ? "lg:grid-cols-[88px_minmax(0,1fr)]" : "lg:grid-cols-[300px_minmax(0,1fr)]"}`}>
        {isDashboardNavigationOpen && (
          <button
            type="button"
            aria-label="Close dashboard navigation"
            onClick={() => setDashboardNavigationOpen(false)}
            className="fixed inset-0 z-30 bg-black/70 lg:hidden"
          />
        )}
        <aside id="dashboard-navigation-drawer" className={`${isDashboardNavigationOpen ? "fixed inset-y-0 left-0 z-50 flex" : "hidden"} min-h-screen w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto border-b border-white/10 bg-[#101827] px-4 py-5 shadow-2xl transition-[padding] duration-200 lg:sticky lg:top-20 lg:z-auto lg:flex lg:h-[calc(100vh-5rem)] lg:w-auto lg:self-start lg:overflow-visible lg:border-b-0 lg:border-r lg:shadow-none ${sidebarCollapsed ? "lg:px-3" : "lg:px-5"}`}>
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
                      setDashboardNavigationOpen(false);
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
                {data.telegramBinding && (
                  <a
                    href={data.telegramBinding.bindingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold transition ${
                      data.telegramBinding.bound
                        ? "text-emerald-400 hover:underline"
                        : "text-[#dfba73] hover:underline"
                    }`}
                    title={
                      data.telegramBinding.bound
                        ? locale === "zh" ? "Telegram 询价与报价通知已激活" : "Telegram alerts active for inquiry replies and updates"
                        : locale === "zh" ? "点击绑定 Telegram 机器人，实时接收新询价与回复通知" : "One-click link Telegram robot for real-time inquiry alerts"
                    }
                  >
                    <svg className="h-3 w-3 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.61 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.25-3.55 3.93-1.64 4.74-1.92 5.27-1.93.12 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.19-.04.35z"/>
                    </svg>
                    <span className="truncate">
                      {data.telegramBinding.bound
                        ? `@${data.telegramBinding.telegramUsername || "Linked"}`
                        : locale === "zh"
                          ? "绑定 Telegram 接收提醒 ↗"
                          : "Link Telegram for Alerts ↗"}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          <header className="mb-6 flex flex-col gap-4 border-b border-white/10 pb-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex items-start gap-3">
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
              <div className="flex flex-wrap items-center justify-start sm:justify-end gap-2.5">
                {data.telegramBinding && (
                  <a
                    href={data.telegramBinding.bindingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={
                      data.telegramBinding.bound
                        ? locale === "zh"
                          ? `已绑定 Telegram 机器人通知 (@${data.telegramBinding.telegramUsername || "已绑定"})，新询价与报价回复将实时推送`
                          : "Telegram alerts active. You will receive real-time push notifications for new replies and status updates."
                        : locale === "zh"
                          ? "点击绑定 Telegram 机器人，实时接收新询价与报价回复通知"
                          : "Click to link Telegram robot to receive instant push alerts for inquiry replies and quotes."
                    }
                    className={`flex items-center gap-1.5 rounded-full border px-3 sm:px-4 py-2 text-[10px] font-black uppercase tracking-wider transition ${
                      data.telegramBinding.bound
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                        : "border-[#c5a059]/40 bg-[#c5a059]/10 text-[#dfba73] hover:bg-[#c5a059]/20"
                    }`}
                  >
                    <svg className="h-3.5 w-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.19-.08-.05-.19-.02-.27 0-.12.03-1.99 1.27-5.61 3.72-.53.36-1.01.54-1.44.53-.47-.01-1.38-.27-2.06-.49-.83-.27-1.49-.42-1.43-.89.03-.25.38-.51 1.05-.78 4.12-1.79 6.87-2.97 8.25-3.55 3.93-1.64 4.74-1.92 5.27-1.93.12 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.19-.04.35z"/>
                    </svg>
                    <span className="truncate max-w-[240px]">
                      {data.telegramBinding.bound
                        ? locale === "zh"
                          ? `已绑定机器人提醒 (@${data.telegramBinding.telegramUsername || "Linked"})`
                          : `Telegram Active (@${data.telegramBinding.telegramUsername || "linked"})`
                        : locale === "zh"
                          ? "绑定 Telegram 接收询价提醒 ↗"
                          : "Link Telegram for Inquiry Alerts ↗"}
                    </span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => void onLogout()}
                  className="rounded-full border border-white/15 px-4 sm:px-5 py-2 text-[10px] font-black uppercase tracking-widest text-gray-400 transition hover:border-white/40 hover:text-white shrink-0"
                >
                  {t("portal.navSignOut")}
                </button>
              </div>
            </div>
          </header>

          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <AdminModuleContent
            activeModule={normalizedActiveModule}
            targetInquiryNo={targetInquiryNo}
            data={data}
            isModuleLoading={isModuleLoading}
            onEditVehicle={setEditingVehicle}
            onRefreshVehicles={onRefreshVehicles}
            onRefreshData={onRefreshData}
            onModuleChange={onModuleChange}
            onNavigateInquiry={onNavigateInquiry}
          />
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
      text="Loading data..."
      subtext="Fetching the latest records from database."
      size="lg"
      fullscreen={false}
      className="rounded-2xl border border-teal-500/20 bg-white/[.03] p-12 shadow-2xl backdrop-blur-md"
    />
  );
}

function AdminModuleContent({
  activeModule,
  targetInquiryNo,
  data,
  isModuleLoading,
  onEditVehicle,
  onRefreshVehicles,
  onRefreshData,
  onModuleChange,
  onNavigateInquiry,
}: {
  activeModule: AdminModule;
  targetInquiryNo?: string;
  data: BootstrapData;
  isModuleLoading?: boolean;
  onEditVehicle: (vehicle: Vehicle) => void;
  onRefreshVehicles: () => Promise<void>;
  onRefreshData: () => Promise<void>;
  onModuleChange?: (module: AdminModule) => void;
  onNavigateInquiry?: (inquiryNo: string) => void;
}) {
  if (isModuleLoading) {
    return <ModuleLoadingSkeleton />;
  }
  switch (activeModule) {
    case "vehicle_models":
      return <AdminProfiles data={data} />;
    case "vehicles":
      return <AdminVehicles data={data} onEdit={onEditVehicle} onRefresh={onRefreshVehicles} onRefreshData={onRefreshData} />;
    case "quotes":
      return <AdminQuotes data={data} initialInquiryNo={targetInquiryNo} onRefresh={onRefreshData} />;
    case "orders":
      return <AdminOrders data={data} />;
    case "payments":
      return <AdminPayments data={data} />;
    case "logistics":
      return <AdminLogistics data={data} />;
    case "accounts":
      return <AdminUserManagement data={data} filterType="all" onRefreshData={onRefreshData} />;
    default:
      return (
        <AdminDashboard
          data={data}
          onNavigateModule={onModuleChange || (() => {})}
          onNavigateInquiry={onNavigateInquiry || (() => {})}
        />
      );
  }
}

function AdminDashboard({
  data,
  onNavigateModule,
  onNavigateInquiry,
}: {
  data: BootstrapData;
  onNavigateModule: (module: AdminModule) => void;
  onNavigateInquiry: (inquiryNo: string) => void;
}) {
  const { t, locale } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");

  // 汇总所有颜色与细分车型的实际库存数量（全量累加）
  const totalStock = data.vehicles.reduce((sum, vehicle) => sum + getVehicleStockQuantity(vehicle), 0);
  const modelCount = (data.vehicleModels || []).length;

  const allInquiries = useMemo(() => {
    return [...data.inquiries].sort(
      (a, b) => getDateTime(b.updatedAt || b.createdAt) - getDateTime(a.updatedAt || a.createdAt)
    );
  }, [data.inquiries]);

  const filteredInquiries = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allInquiries;
    return allInquiries.filter((inquiry) => {
      const matchNo = inquiry.inquiryNo.toLowerCase().includes(q);
      const matchModel = (inquiry.vehicleModel || inquiry.vehicleId || "").toLowerCase().includes(q);
      const matchCustomer = (inquiry.creatorName || inquiry.customerId || "").toLowerCase().includes(q);
      const matchPort = (inquiry.destinationPort || "").toLowerCase().includes(q);
      const matchTrade = (inquiry.tradeTerm || "").toLowerCase().includes(q);
      const matchTitle = (inquiry.title || "").toLowerCase().includes(q);
      return matchNo || matchModel || matchCustomer || matchPort || matchTrade || matchTitle;
    });
  }, [allInquiries, searchQuery]);

  return (
    <div className="grid min-w-0 gap-5">
      {/* Top Metric Cards with direct navigation (2 focused cards) */}
      <section className="grid gap-4 sm:grid-cols-2">
        <AdminStat
          label={t("portal.modelRepo", "Model Repository")}
          value={String(modelCount)}
          note={t("portal.recordStockSummary", { records: data.vehicles.length, count: totalStock })}
          onClick={() => onNavigateModule("vehicle_models")}
        />
        <AdminStat
          label={t("portal.inquiries", "Inquiries")}
          value={String(data.inquiries.length)}
          note={`${allInquiries.length} ${locale === "zh" ? "单有效询价需求" : "Total Sourcing Requests"}`}
          onClick={() => onNavigateModule("quotes")}
        />
      </section>

      {/* All Inquiries Overview Panel with full structured information */}
      <section className="min-w-0">
        <AdminPanel
          title={locale === "zh" ? "询价单全景一览" : locale === "am" ? "የጥያቄዎች አጠቃላይ እይታ" : "Inquiries Overview"}
          subtitle={locale === "zh" ? "全量车源询价需求、贸易条款、目标港口与报价进度一览" : locale === "am" ? "የሁሉም ተሽከርካሪ ግዢ ጥያቄዎች፣ የንግድ ውሎች እና የዋጋ ዝርዝር" : "Complete structured record of all sourcing requests, commercial terms, ports, and quotation progress."}
          action={
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={locale === "zh" ? "搜索单号/车型/客户/港口..." : "Search inquiries..."}
                className="rounded-xl border border-white/10 bg-white/[.04] px-3.5 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-[#5ee6d8] focus:bg-white/[.07] w-48 sm:w-64 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          }
        >
          <AdminTable
            headers={[
              t("portal.inquiryNo", "Inquiry No. & Status"),
              t("portal.vehicle", "Vehicle & Specs"),
              t("portal.customer", "Customer / Initiator"),
              t("portal.quantity", "Demand & Terms"),
              t("portal.destinationPort", "Destination Port"),
              t("portal.targetPrice", "Target Price"),
              t("portal.latestQuote", "Latest Quote"),
            ]}
            rows={filteredInquiries.map((inquiry) => {
              const quote = latestQuoteForInquiry(inquiry.inquiryNo, data.quotes);
              const dateStr = (inquiry.createdAt || "").slice(0, 10);
              return [
                /* 1. 单号与状态 + 日期 */
                <div key={`inq-${inquiry.inquiryNo}`} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigateInquiry(inquiry.inquiryNo)}
                      className="font-bold text-[#5ee6d8] hover:underline text-left flex items-center gap-1 cursor-pointer font-mono"
                    >
                      <span>{inquiry.inquiryNo}</span>
                      <span className="text-[10px] text-slate-400">↗</span>
                    </button>
                    {inquiry.hasUnreadFollowUps && (
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Unread updates" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span>{dateStr || "-"}</span>
                    <AdminStatusBadge status={inquiry.status || "open"} />
                  </div>
                </div>,

                /* 2. 车型与配置 */
                <div key={`model-${inquiry.inquiryNo}`} className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => onNavigateInquiry(inquiry.inquiryNo)}
                    className="text-left text-slate-100 hover:text-[#5ee6d8] hover:underline font-medium text-xs truncate max-w-[280px] block cursor-pointer"
                  >
                    {inquiry.vehicleModel || inquiry.vehicleId}
                  </button>
                  {inquiry.title && inquiry.title !== inquiry.vehicleModel && (
                    <span className="text-[10px] text-slate-400 truncate max-w-[280px]">
                      {inquiry.title}
                    </span>
                  )}
                </div>,

                /* 3. 客户 / 发起人 */
                <div key={`cust-${inquiry.inquiryNo}`} className="text-xs text-slate-300">
                  <span className="font-medium text-white">{inquiry.creatorName || inquiry.customerId || "-"}</span>
                  {inquiry.creatorUserId && inquiry.creatorName && (
                    <span className="block text-[10px] text-slate-500 font-mono">{inquiry.customerId}</span>
                  )}
                </div>,

                /* 4. 数量与贸易条款 */
                <div key={`qty-${inquiry.inquiryNo}`} className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">
                    {t("portal.unitCount", { count: inquiry.quantity })}
                  </span>
                  {inquiry.tradeTerm && (
                    <span className="rounded border border-white/15 bg-white/[.05] px-1.5 py-0.5 text-[10px] font-black uppercase text-amber-200/90">
                      {inquiry.tradeTerm}
                    </span>
                  )}
                </div>,

                /* 5. 目的港口 */
                <span key={`port-${inquiry.inquiryNo}`} className="text-xs text-slate-300">
                  {inquiry.destinationPort || "-"}
                </span>,

                /* 6. 目标价 */
                <span key={`target-${inquiry.inquiryNo}`} className="text-xs font-mono font-medium text-slate-300">
                  {inquiry.targetPrice ? formatUsdStrict(inquiry.targetPrice) : "-"}
                </span>,

                /* 7. 最新报价 */
                <div key={`quote-${inquiry.inquiryNo}`}>
                  {quote ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        {formatUsdStrict(quote.unitPrice)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {quote.quoteNo}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      {t("portal.awaitingQuote", "Awaiting Quote")}
                    </span>
                  )}
                </div>,
              ];
            })}
            emptyText={searchQuery ? (locale === "zh" ? "没有找到符合搜索条件的询价单" : "No inquiries match your search.") : t("portal.noInquiries")}
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
  const comparisonRows = buildModelComparisonRows(group, "full");
  const configurationLabels = ["基础配置", "新增配置", "升级配置"];
  const fullComparisonRows = comparisonRows
    .filter((row) => configurationLabels.includes(row.label) || trimVariants.some((variant) => safeText(row.values[variant.id]).trim()))
    .filter((row) => !/^(版本名称|推荐版本|版本核验状态|最后核验|备注)$/i.test(row.label));
  const configurationRows = configurationLabels.map((label, index) =>
    comparisonRows.find((row) => row.label === label) ?? {
      category: "版本配置",
      label,
      sortOrder: 40 + index,
      values: Object.fromEntries(trimVariants.map((variant) => [variant.id, ""])),
    },
  );
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
                          const isChangeRow = configurationLabels.includes(row.label);
                          const rawValue = safeText(row.values[variant.id]).trim() || "-";
                          const value = localizeVehicleValue(rawValue, locale);
                          return (
                            <div key={`${variant.id}:${row.category}:${row.label}`} className={`min-w-0 ${isChangeRow ? "sm:col-span-2" : ""}`}>
                              <div className={isChangeRow ? "sm:flex sm:items-start sm:gap-4" : ""}>
                                <dt className="shrink-0 text-[10px] font-medium text-slate-400">
                                  {localizeVehicleValue(row.label, locale)}
                                </dt>
                                <dd className={`mt-0.5 break-words text-xs font-semibold leading-5 ${isChangeRow ? "sm:mt-0 sm:flex-1" : ""} ${rawValue === "-" ? "text-slate-600" : "text-slate-100"}`}>
                                  {isChangeRow ? <span className="whitespace-pre-line">{formatTrimFeatureLines(value)}</span> : value}
                                </dd>
                              </div>
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
  const [featuredVehicleId, setFeaturedVehicleId] = useState("");
  const normalizedSearch = searchQuery.trim().toLowerCase();
  const canSeeSupplier = data.user.role !== "partner" && data.user.role !== "customer";
  const canSeeLocation = data.user.role !== "partner" && data.user.role !== "customer";
  const canManageRecommendation = data.user.role === "admin";
  const effectiveSupplierFilter = canSeeSupplier ? supplierFilter : "all";
  const featuredResources = useMemo(() => selectFeaturedVehicleResources(data.vehicles).map((vehicle) => ({
    id: vehicle.id,
    brand: localizeVehicleValue(vehicle.brand, locale),
    model: localizeVehicleValue(vehicle.model, locale),
    trim: localizeVehicleValue(vehicle.trim || vehicle.configuration, locale),
    imageUrl: vehicle.imageUrl,
    priceLabel: vehicle.price != null ? `${vehicle.priceTerm || "FOB"} ${formatUsdStrict(vehicle.price)}` : localizeVehicleValue("Price on request", locale),
  })), [data.vehicles, locale]);

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
      const candidateVehicles = (item.vehicles && item.vehicles.length > 0)
        ? item.vehicles
        : vehiclesForSellableModel(data.vehicles, item, data.vehicleModels || []);
      const rawVehicles = candidateVehicles.filter((vehicle) =>
        vehicleMatchesAdminFilters(vehicle, item, normalizedSearch, supplyFilter, brandFilter, effectiveSupplierFilter, canSeeSupplier, canSeeLocation)
      );
      const offers = item.offers.filter((offer) =>
        offerMatchesAdminFilters(offer, item, normalizedSearch, supplyFilter, brandFilter, effectiveSupplierFilter, canSeeSupplier, canSeeLocation)
      );
      const modelMatches = modelMatchesAdminFilters(item, normalizedSearch, brandFilter);
      const hasDetailFilter = effectiveSupplierFilter !== "all" || supplyFilter !== "all";

      const effectiveOffers = isAllDefault
        ? item.offers
        : offers.length > 0
          ? offers
          : (modelMatches && !hasDetailFilter ? item.offers : []);
      const effectiveRawVehicles = isAllDefault
        ? candidateVehicles
        : rawVehicles.length > 0
          ? rawVehicles
          : (modelMatches && !hasDetailFilter ? candidateVehicles : []);

      const currentStockQuantity = effectiveRawVehicles.reduce((sum, v) => {
        const qty = v.colorStockQuantity ?? (typeof v.stockQuantity === "number" && v.stockQuantity > 0 ? v.stockQuantity : 0);
        return sum + qty;
      }, 0);
      const hasCurrentStockQuantity = effectiveRawVehicles.some((v) => (v.colorStockQuantity !== null && v.colorStockQuantity !== undefined) || (typeof v.stockQuantity === "number" && v.stockQuantity > 0));

      return {
        ...item,
        stockQuantity: currentStockQuantity,
        hasStockQuantity: hasCurrentStockQuantity,
        offers: effectiveOffers,
        rawVehicles: effectiveRawVehicles,
        modelMatches,
      };
    })
    .filter((item) => (isAllDefault ? (item.offers.length > 0 || item.rawVehicles.length > 0) : (item.rawVehicles.length > 0 || item.offers.length > 0)));

  const focusFeaturedVehicle = useCallback((vehicleId: string) => {
    const selectedVehicle = data.vehicles.find((vehicle) => vehicle.id === vehicleId);
    if (!selectedVehicle) return;
    const selectedModel = sellableModels.find((item) => (item.vehicles || []).some((vehicle) => vehicle.id === vehicleId));
    if (!selectedModel) return;
    const selectedVariant = buildVehicleResourceVariants(selectedModel.vehicles || []).find((variant) =>
      variant.vehicles.some((vehicle) => vehicle.id === vehicleId),
    );
    if (!selectedVariant) return;

    setSearchQuery("");
    setBrandFilter("all");
    setSupplierFilter("all");
    setSupplyFilter("all");
    setExpandedModels(new Set([selectedModel.key]));
    setExpandedVariants(new Set([`${selectedModel.key}::${selectedVariant.key}`]));
    setFeaturedVehicleId(vehicleId);
    window.setTimeout(() => {
      document.querySelector(`[data-vehicle-resource-id="${CSS.escape(vehicleId)}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }, [data.vehicles, sellableModels]);

  useEffect(() => {
    if (!featuredVehicleId) return;
    const timeout = window.setTimeout(() => setFeaturedVehicleId(""), 1300);
    return () => window.clearTimeout(timeout);
  }, [featuredVehicleId]);

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

          {/* 供应状态分段选择器 (Segmented Pills) */}
          <div className="flex items-center rounded-xl border border-white/10 bg-[#0c1424] p-0.5">
            {[
              { value: "all", label: t("portal.allStatuses") },
              { value: "in-stock", label: t("portal.inStock") },
              { value: "preorder", label: t("portal.preorder") },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSupplyFilter(opt.value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  supplyFilter === opt.value
                    ? "bg-[#22b8aa] text-white shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

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

      <FeaturedVehicleCarousel
        resources={featuredResources}
        onSelect={focusFeaturedVehicle}
        title={locale === "zh" ? "置顶优秀车源" : locale === "am" ? "የተመረጡ የተሽከርካሪ ሀብቶች" : "Top featured vehicle resources"}
      />

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
                      {item.segment ? (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[#5ee6d8]">
                          {locale === "zh" ? "车型大类" : locale === "am" ? "የተሽከርካሪ ምድብ" : "Vehicle Category"} · {localizeVehicleValue(item.segment, locale)}
                        </p>
                      ) : null}
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
                      const internalRowIds = variant.colors.flatMap((color) => color.vehicles.map((item) => item.id));
                      const externalRowIds = variant.colors.map((color) => color.vehicles.find((item) => item.id === featuredVehicleId)?.id || color.vehicles[0]?.id || "");
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
                                    rowIds={internalRowIds}
                                    highlightedRowId={featuredVehicleId}
                                    rows={variant.colors.flatMap((color) =>
                                      color.vehicles.map((v) => [
                                        <span key="color" className="text-xs text-slate-300">
                                          {formatColorPair(
                                            localizeVehicleValue(locale === "zh" ? v.exteriorColor || v.color : v.exteriorColorEnglish || v.exteriorColor || v.color, locale),
                                            localizeVehicleValue(locale === "zh" ? v.interiorColor : v.interiorColorEnglish || v.interiorColor, locale),
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
                                    rowIds={externalRowIds}
                                    highlightedRowId={featuredVehicleId}
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
    {details.map(([label, value]) => <div key={String(label)} className="rounded border border-white/10 bg-black/10 px-3 py-2"><p className="text-[10px] font-black uppercase tracking-wider text-slate-500">{String(label)}</p><p className="mt-1 text-xs text-slate-200">{String(value)}</p></div>)}
  </div>;
}

function InquiryCommentThread({ thread, onReply, onClose, replyLabel = "Quote reply", closeLabel, hiddenPlaceholderLabel }: { thread: ReturnType<typeof buildInquiryCommentThreads<InquiryNote>>[number]; onReply: (noteId: string) => void; onClose?: (note: InquiryNote) => void; replyLabel?: string; closeLabel?: string; hiddenPlaceholderLabel: string }) {
  const { locale } = useTranslation();
  const { note, replies } = thread;
  return <article id={`note-${note.noteId}`} className="rounded-lg border border-white/10 bg-[#0b1425] p-4">
    {note.isHiddenPlaceholder ? <p className="text-sm italic text-slate-500">{hiddenPlaceholderLabel}</p> : <><div className="flex justify-between gap-2"><p className={`text-xs font-black ${inquiryCommentAuthorClass(note.authorRole)}`}>{note.authorName} <span className="font-medium text-slate-400">{formatPortalRole(note.authorRole as PortalRole, locale)}</span></p><time className="text-[10px] text-slate-500">{formatDate(note.createdAt)}</time></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{note.body}</p><div className="mt-3 flex flex-wrap gap-3"><button type="button" onClick={() => onReply(note.noteId)} className="text-xs text-theme">{replyLabel}</button>{onClose && <button type="button" onClick={() => onClose(note)} className="text-xs text-red-300">{closeLabel || "Close comment"}</button>}</div></>}
    {replies.length > 0 && <div className="mt-3 grid gap-2 border-l-2 border-theme/40 pl-3">{replies.map((reply) => <InquiryCommentThread key={reply.note.id} thread={reply} onReply={onReply} onClose={onClose} replyLabel={replyLabel} closeLabel={closeLabel} hiddenPlaceholderLabel={hiddenPlaceholderLabel} />)}</div>}
  </article>;
}

function AdminQuotes({ data, onRefresh, initialInquiryNo }: { data: BootstrapData; onRefresh: () => Promise<void>; initialInquiryNo?: string }) {
  const { t, locale } = useTranslation();
  const [selectedNo, setSelectedNo] = useState(() => {
    if (initialInquiryNo && data.inquiries.some((i) => i.inquiryNo === initialInquiryNo)) {
      return initialInquiryNo;
    }
    return data.inquiries[0]?.inquiryNo || "";
  });

  useEffect(() => {
    if (initialInquiryNo && data.inquiries.some((i) => i.inquiryNo === initialInquiryNo)) {
      setSelectedNo(initialInquiryNo);
    }
  }, [initialInquiryNo, data.inquiries]);
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
  const [closedInquiries, setClosedInquiries] = useState<Inquiry[]>([]);
  const [showClosedInquiries, setShowClosedInquiries] = useState(false);
  const [commentPendingClosure, setCommentPendingClosure] = useState<InquiryNote | null>(null);
  const copy = locale === "zh" ? {
    search: "搜索车型、客户或询价编号", noResults: "没有符合条件的询价。", inquiryRequest: "询价请求", closeComment: "关闭评论", manageHidden: "管理已关闭评论", hiddenTitle: "已关闭评论", restore: "恢复评论", deletePermanently: "永久删除", cancel: "取消", reply: "引用回复", replyPlaceholder: "写一条回复", messagePlaceholder: "写一条消息", send: "发送消息", saving: "保存中…", postInquiry: "发布询价", units: "数量", brand: "品牌", model: "车型", trim: "版本", quoteReply: "引用回复", hiddenEmpty: "没有已关闭的评论。",
  } : locale === "am" ? {
    search: "ሞዴል፣ ደንበኛ ወይም የጥያቄ ቁጥር ፈልግ", noResults: "ከማጣሪያው ጋር የሚስማማ ጥያቄ የለም።", inquiryRequest: "የጥያቄ ጥያቄ", closeComment: "አስተያየት ዝጋ", manageHidden: "የተዘጉ አስተያየቶችን አስተዳድር", hiddenTitle: "የተዘጉ አስተያየቶች", restore: "አስተያየት መልስ", deletePermanently: "ለዘላለም ሰርዝ", cancel: "ሰርዝ", reply: "ምላሽ ስጥ", replyPlaceholder: "ምላሽ ጻፍ", messagePlaceholder: "መልዕክት ጻፍ", send: "መልዕክት ላክ", saving: "በማስቀመጥ ላይ…", postInquiry: "ጥያቄ አስገባ", units: "ብዛት", brand: "ብራንድ", model: "ሞዴል", trim: "ስሪት", quoteReply: "ምላሽ ስጥ", hiddenEmpty: "የተዘጋ አስተያየት የለም።",
  } : {
    search: "Search vehicle, customer, or inquiry", noResults: "No inquiries match this search.", inquiryRequest: "Inquiry request", closeComment: "Close comment", manageHidden: "Manage closed comments", hiddenTitle: "Closed comments", restore: "Restore comment", deletePermanently: "Delete permanently", cancel: "Cancel", reply: "Quote reply", replyPlaceholder: "Write a reply", messagePlaceholder: "Write a message", send: "Send message", saving: "Saving…", postInquiry: "Post inquiry", units: "Units", brand: "Brand", model: "Model", trim: "Trim", quoteReply: "Quote reply", hiddenEmpty: "No closed comments.",
  };
  const inquiryCloseCopy = locale === "zh"
    ? { startedAt: "开始时间", closeInquiry: "关闭询价", closeInquiryConfirmation: "确定关闭此询价？它将从进行中的讨论中移除。" }
    : locale === "am"
      ? { startedAt: "የጀመረበት ጊዜ", closeInquiry: "ጥያቄን ዝጋ", closeInquiryConfirmation: "ይህን ጥያቄ ለመዝጋት እርግጠኛ ነዎት? ከንቁ ውይይቶች ይወገዳል።" }
      : { startedAt: "Started", closeInquiry: "Close inquiry", closeInquiryConfirmation: "Close this inquiry? It will be removed from active discussions." };
  const closedInquiryCopy = locale === "zh"
    ? { manageClosedInquiries: "管理已关闭询价", closedInquiryTitle: "已关闭询价", closedInquiryDescription: "已关闭询价不会出现在进行中的列表中。恢复后，它会重新显示为新的询价。", closedInquiryEmpty: "没有已关闭的询价。", restoreInquiry: "恢复询价", deleteClosedInquiry: "永久删除询价", deleteInquiryConfirmation: "永久删除此询价及其全部评论、报价、议价和订单记录？此操作无法恢复。", closedAt: "关闭时间", initiator: "发起人" }
    : locale === "am"
      ? { manageClosedInquiries: "የተዘጉ ጥያቄዎችን አስተዳድር", closedInquiryTitle: "የተዘጉ ጥያቄዎች", closedInquiryDescription: "የተዘጉ ጥያቄዎች በንቁ ዝርዝሩ ውስጥ አይታዩም። ከተመለሱ በኋላ እንደ አዲስ ጥያቄ ይታያሉ።", closedInquiryEmpty: "የተዘጋ ጥያቄ የለም።", restoreInquiry: "ጥያቄን መልስ", deleteClosedInquiry: "ጥያቄን ለዘላለም ሰርዝ", deleteInquiryConfirmation: "ይህን ጥያቄ እና ሁሉንም አስተያየቶቹን፣ ጥቅሶቹን፣ ድርድሮቹን እና የትዕዛዝ መዝገቦቹን ለዘላለም ሰርዝ? ይህ ሊመለስ አይችልም።", closedAt: "የተዘጋበት ጊዜ", initiator: "አስጀማሪ" }
      : { manageClosedInquiries: "Manage closed inquiries", closedInquiryTitle: "Closed inquiries", closedInquiryDescription: "Closed inquiries are hidden from active discussions. Restoring one returns it as a new inquiry.", closedInquiryEmpty: "No closed inquiries.", restoreInquiry: "Restore inquiry", deleteClosedInquiry: "Delete inquiry permanently", deleteInquiryConfirmation: "Permanently delete this inquiry and all of its comments, quotes, negotiations, and orders? This cannot be undone.", closedAt: "Closed", initiator: "Initiator" };
  const commentCopy = locale === "zh" ? {
    inquiryRequest: "询价请求", closeComment: "关闭评论", reply: "引用回复", cancel: "取消", replyPlaceholder: "写一条引用回复", messagePlaceholder: "写一条消息", send: "发送消息", sendReply: "发送引用回复", saving: "保存中…", noMessages: "此询价暂无评论。", hiddenTitle: "已关闭的评论", hiddenDescription: "关闭仅会从主会话中隐藏单条评论，不会关闭或删除整条询价。", hiddenEmpty: "没有已关闭的评论。", restore: "恢复评论", deletePermanently: "永久删除", manageHidden: "管理已关闭评论", inquiryNo: "询价单号", vehicle: "关联车型", initiator: "发起人", inquiryStarted: "询价发起时间", subject: "询价标题", quantity: "数量", tradeTerm: "贸易条款", destinationPort: "目的港", initialNote: "初始备注", commentAuthor: "评论作者", commentCreatedAt: "评论创建时间", commentClosedAt: "评论关闭时间", hiddenPlaceholder: "此条评论已被管理员屏蔽", closeWithRepliesTitle: "此评论包含回复", closeWithRepliesDescription: "请选择关闭整个回复链，或仅屏蔽当前评论并保留子评论。", closeThread: "同时关闭子评论", hideOnlyThis: "仅屏蔽此条",
  } : locale === "am" ? {
    inquiryRequest: "የጥያቄ ጥያቄ", closeComment: "አስተያየት ዝጋ", reply: "ጥቅስ ምላሽ", cancel: "ሰርዝ", replyPlaceholder: "የጥቅስ ምላሽ ይጻፉ", messagePlaceholder: "መልእክት ይጻፉ", send: "መልእክት ላክ", sendReply: "የጥቅስ ምላሽ ላክ", saving: "በማስቀመጥ ላይ…", noMessages: "በዚህ ጥያቄ ላይ ገና አስተያየት የለም።", hiddenTitle: "የተዘጉ አስተያየቶች", hiddenDescription: "መዝጋት አንድን አስተያየት ከዋናው ውይይት ብቻ ይደብቃል፤ ጥያቄውን አይዘጋውም ወይም አይሰርዘውም።", hiddenEmpty: "የተዘጉ አስተያየቶች የሉም።", restore: "አስተያየት መልስ", deletePermanently: "በቋሚነት ሰርዝ", manageHidden: "የተዘጉ አስተያየቶችን አስተዳድር", inquiryNo: "የጥያቄ ቁጥር", vehicle: "ተሽከርካሪ", initiator: "አስጀማሪ", inquiryStarted: "ጥያቄ የተጀመረበት ጊዜ", subject: "ርዕስ", quantity: "ብዛት", tradeTerm: "የንግድ ውል", destinationPort: "መድረሻ ወደብ", initialNote: "የመጀመሪያ ማስታወሻ", commentAuthor: "የአስተያየት ጸሐፊ", commentCreatedAt: "አስተያየት የተጻፈበት ጊዜ", commentClosedAt: "አስተያየት የተዘጋበት ጊዜ", hiddenPlaceholder: "ይህ አስተያየት በአስተዳዳሪ ተደብቋል።", closeWithRepliesTitle: "ይህ አስተያየት ምላሾች አሉት", closeWithRepliesDescription: "ሙሉውን የምላሽ ሰንሰለት ይዝጉ ወይም ይህን አስተያየት ብቻ ይደብቁ።", closeThread: "ምላሾቹን ጨምሮ ዝጋ", hideOnlyThis: "ይህን ብቻ ደብቅ",
  } : {
    inquiryRequest: "Inquiry request", closeComment: "Close comment", reply: "Quote reply", cancel: "Cancel", replyPlaceholder: "Write a quote reply", messagePlaceholder: "Write a message", send: "Send message", sendReply: "Send quote reply", saving: "Saving…", noMessages: "No comments in this inquiry yet.", hiddenTitle: "Closed comments", hiddenDescription: "Closing only hides one comment from the main conversation. It does not close or delete the inquiry.", hiddenEmpty: "No closed comments.", restore: "Restore comment", deletePermanently: "Delete permanently", manageHidden: "Manage closed comments", inquiryNo: "Inquiry no.", vehicle: "Vehicle", initiator: "Initiator", inquiryStarted: "Inquiry started", subject: "Inquiry title", quantity: "Quantity", tradeTerm: "Trade term", destinationPort: "Destination port", initialNote: "Initial note", commentAuthor: "Comment author", commentCreatedAt: "Comment created", commentClosedAt: "Comment closed", hiddenPlaceholder: "This comment has been hidden by an administrator.", closeWithRepliesTitle: "This comment has replies", closeWithRepliesDescription: "Close the entire reply thread, or hide only this comment and keep its replies visible.", closeThread: "Close with replies", hideOnlyThis: "Hide only this comment",
  };
  const inquiries = data.inquiries.filter((inquiry) => inquiry.status.trim().toLowerCase() !== "closed");
  const visibleInquiries = inquiries.filter((inquiry) => {
    const haystack = `${inquiry.vehicleModel} ${inquiry.title} ${inquiry.customerId} ${inquiry.inquiryNo}`.toLowerCase();
    return !inquirySearch.trim() || haystack.includes(inquirySearch.trim().toLowerCase());
  });
  const selected = visibleInquiries.find((item) => item.inquiryNo === selectedNo) || visibleInquiries[0];
  const notes = postedNotes.filter((note) => note.inquiryNo === selected?.inquiryNo).reduce((current, note) => appendInquiryComment(current, note), data.inquiryNotes.filter((item) => item.inquiryNo === selected?.inquiryNo));
  const commentThreads = buildInquiryCommentThreads(notes);
  const parent = notes.find((item) => item.noteId === replyTo);
  const canModerateComments = data.user.role === "admin";
  const canViewInquiryNo = canViewInquiryNumber(data.user.role);
  const canCreateQuote = data.user.role === "admin" || data.user.role === "sales";
  const unreadCount = inquiries.filter((inquiry) => inquiry.hasUnreadFollowUps).length;

  const markInquiryRead = useCallback(async (inquiry: Inquiry) => {
    if (!inquiry.hasUnreadFollowUps) return;
    try {
      await api(`/api/portal/inquiries/${encodeURIComponent(inquiry.inquiryNo)}/read`, { method: "POST" });
      await onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not mark inquiry as read");
    }
  }, [onRefresh]);

  useEffect(() => {
    if (selected?.hasUnreadFollowUps) {
      const timer = setTimeout(() => {
        void markInquiryRead(selected);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [markInquiryRead, selected]);

  async function select(inquiry: Inquiry) {
    setSelectedNo(inquiry.inquiryNo);
    setReplyTo("");
    setNote("");
    setShowQuoteComposer(false);
    setError("");
  }
  async function create(event: React.FormEvent) { event.preventDefault(); if ((requiresInquiryTitle(target) && !title.trim()) || !initialNote.trim()) return; setBusy(true); try { await api("/api/portal/inquiries", { method: "POST", body: JSON.stringify({ vehicleId: target.vehicleId, vehicleModel: target.vehicleModel, title, quantity: newInquiryQuantity, tradeTerm: "FOB", notes: initialNote }) }); setShowNew(false); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not start inquiry"); } finally { setBusy(false); } }
  async function post(event: React.FormEvent) { event.preventDefault(); if (!selected || !note.trim()) return; setBusy(true); try { const result = await api<{ note: InquiryNote }>(`/api/portal/inquiries/${encodeURIComponent(selected.inquiryNo)}/notes`, { method: "POST", body: JSON.stringify({ body: note, parentNoteId: replyTo }) }); setPostedNotes((current) => appendInquiryComment(current, result.note)); setNote(""); setReplyTo(""); } catch (e) { setError(e instanceof Error ? e.message : "Could not add follow-up"); } finally { setBusy(false); } }
  async function submitCommentClosure(comment: InquiryNote, mode: "single" | "cascade") { setBusy(true); setError(""); try { const result = await api<{ closedNoteIds: string[] }>(`/api/portal/inquiry-content/note/${encodeURIComponent(comment.noteId)}`, { method: "DELETE", body: JSON.stringify({ reason: "Closed by administrator", mode }) }); const closedNoteIds = new Set(result.closedNoteIds || [comment.noteId]); setPostedNotes((current) => current.filter((item) => !closedNoteIds.has(item.noteId))); setReplyTo(""); setCommentPendingClosure(null); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not close comment"); } finally { setBusy(false); } }
  function closeComment(comment: InquiryNote) { if (notes.some((item) => item.parentNoteId === comment.noteId)) { setCommentPendingClosure(comment); return; } if (!window.confirm(`${copy.closeComment}?`)) return; void submitCommentClosure(comment, "single"); }
  async function closeInquiry(inquiry: Inquiry) { if (!window.confirm(inquiryCloseCopy.closeInquiryConfirmation)) return; setBusy(true); setError(""); try { await api(`/api/portal/inquiries/${encodeURIComponent(inquiry.inquiryNo)}/status`, { method: "PATCH", body: JSON.stringify({ status: "closed" }) }); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not close inquiry"); } finally { setBusy(false); } }
  async function loadHiddenComments() { setBusy(true); setError(""); try { const result = await api<{ notes: InquiryNote[] }>("/api/portal/inquiry-content/deleted"); setHiddenNotes(result.notes); setShowHiddenNotes(true); } catch (e) { setError(e instanceof Error ? e.message : "Could not load closed comments"); } finally { setBusy(false); } }
  async function moderateHiddenComment(noteId: string, action: "restore" | "purge") { if (action === "purge" && !window.confirm(copy.deletePermanently + "?")) return; setBusy(true); setError(""); try { await api(`/api/portal/inquiry-content/note/${encodeURIComponent(noteId)}`, { method: "PATCH", body: JSON.stringify({ action }) }); if (action === "restore") await onRefresh(); await loadHiddenComments(); } catch (e) { setError(e instanceof Error ? e.message : "Could not update closed comment"); } finally { setBusy(false); } }
  async function loadClosedInquiries() { setBusy(true); setError(""); try { const result = await api<{ inquiries: Inquiry[] }>("/api/portal/inquiries/closed"); setClosedInquiries(result.inquiries); setShowClosedInquiries(true); } catch (e) { setError(e instanceof Error ? e.message : "Could not load closed inquiries"); } finally { setBusy(false); } }
  async function restoreClosedInquiry(inquiry: Inquiry) { setBusy(true); setError(""); try { await api(`/api/portal/inquiries/${encodeURIComponent(inquiry.inquiryNo)}/status`, { method: "PATCH", body: JSON.stringify({ action: "restore" }) }); setClosedInquiries((current) => current.filter((item) => item.inquiryNo !== inquiry.inquiryNo)); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not restore inquiry"); } finally { setBusy(false); } }
  async function deleteClosedInquiry(inquiry: Inquiry) { if (!window.confirm(closedInquiryCopy.deleteInquiryConfirmation)) return; setBusy(true); setError(""); try { await api(`/api/portal/inquiries/${encodeURIComponent(inquiry.inquiryNo)}`, { method: "DELETE" }); setClosedInquiries((current) => current.filter((item) => item.inquiryNo !== inquiry.inquiryNo)); await onRefresh(); } catch (e) { setError(e instanceof Error ? e.message : "Could not permanently delete inquiry"); } finally { setBusy(false); } }
  async function createQuotation(event: React.FormEvent) { event.preventDefault(); if (!selected) return; const unitPrice = Number(quotePrice); if (!Number.isFinite(unitPrice) || unitPrice <= 0) { setError("Enter a USD unit price before creating the quotation"); return; } setBusy(true); setError(""); try { const created = await api<{ quoteNo: string; quantity: number; unitPrice: number }>("/api/portal/quotes", { method: "POST", body: JSON.stringify({ inquiryNo: selected.inquiryNo, unitPrice }) }); setPreview({ quoteNo: created.quoteNo, customer: selected.customerId, vehicleModel: selected.vehicleModel, quantity: created.quantity, unitPrice: created.unitPrice, cifTotal: quoteCif || "USD 0.00" }); setShowQuoteComposer(false); } catch (e) { setError(e instanceof Error ? e.message : "Could not create quotation"); } finally { setBusy(false); } }

  return <AdminPanel title={t("portal.inquiryManagementTitle")} subtitle={t("portal.inquiryManagementSubtitle")}>
    {unreadCount > 0 && <p className="mb-4 rounded border border-amber-300/30 bg-amber-300/10 px-3 py-2 text-xs font-semibold text-amber-200">{unreadCount} {copy.send}</p>}
    <div className="mb-4 flex flex-wrap justify-between gap-3"><Input aria-label={copy.search} value={inquirySearch} onChange={(event) => setInquirySearch(event.target.value)} placeholder={copy.search} /><div className="flex flex-wrap gap-3">{canModerateComments && <><button type="button" onClick={() => void loadHiddenComments()} className="rounded border border-white/15 px-4 py-2 text-[10px] font-black uppercase text-slate-200">{copy.manageHidden}</button><button type="button" onClick={() => void loadClosedInquiries()} className="rounded border border-white/15 px-4 py-2 text-[10px] font-black uppercase text-slate-200">{closedInquiryCopy.manageClosedInquiries}</button></>}{canCreateQuote && <button type="button" disabled={!selected} onClick={() => setShowQuoteComposer((value) => !value)} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{t("portal.createQuotation")}</button>}<button type="button" onClick={() => setShowNew((value) => !value)} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{t("portal.startInquiry")}</button></div></div>
    {showQuoteComposer && selected && <form onSubmit={createQuotation} className="mb-4 grid gap-3 rounded-lg border border-gold/40 bg-gold/5 p-4 md:grid-cols-3"><p className="text-xs text-slate-300 md:col-span-3">{selected.vehicleModel} / {selected.quantity} units — the original quotation template will open after creation.</p><Input aria-label="USD unit price" type="number" min="0" step="0.01" value={quotePrice} onChange={(event) => setQuotePrice(event.target.value)} placeholder="FOB unit price (USD)" required /><Input aria-label="CIF total" value={quoteCif} onChange={(event) => setQuoteCif(event.target.value)} placeholder="CIF total (USD, manual entry)" /><button disabled={busy} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{busy ? "Creating..." : "Create and open template"}</button></form>}
    {showNew && <form onSubmit={create} className="mb-4 grid gap-3 rounded-lg border border-theme/30 bg-theme/5 p-4"><InquiryVehiclePicker vehicles={data.vehicles} value={target} onChange={setTarget} /><Input aria-label="Inquiry quantity" type="number" min="1" value={newInquiryQuantity} onChange={(event) => setNewInquiryQuantity(Math.max(1, Number(event.target.value) || 1))} /><InquiryTitleField value={title} onChange={setTitle} required={requiresInquiryTitle(target)} /><textarea value={initialNote} onChange={(event) => setInitialNote(event.target.value)} className="min-h-24 rounded border border-white/15 bg-black/20 p-3 text-sm text-white" /><button disabled={busy || (requiresInquiryTitle(target) && !title.trim()) || !initialNote.trim()} className="btn-primary rounded px-4 py-2 text-[10px] font-black uppercase">{copy.postInquiry}</button></form>}
    {selected && <InquiryRequestPanel inquiryNo={selected.inquiryNo} title={selected.title || selected.vehicleModel} initialVehicleId={selected.vehicleId} vehicles={data.vehicles} requests={data.inquiryRequests || []} user={data.user} onRefresh={onRefresh} />}
    <div className="grid gap-4 xl:grid-cols-[minmax(23rem,0.8fr)_minmax(0,1.2fr)]">
      <aside className="grid content-start max-h-[70vh] gap-2 overflow-y-auto pr-1">
        {visibleInquiries.map((inquiry) => {
          const details = inquiryListDetails(inquiry);
          const isSelected = selected?.inquiryNo === inquiry.inquiryNo;
          return <article key={inquiry.inquiryNo} className={`rounded-lg border p-3 ${isSelected ? "border-white bg-emerald-400/15" : "border-white/10 bg-white/[.03] hover:bg-white/[.06]"}`}>
            <button type="button" onClick={() => void select(inquiry)} className="w-full text-left">
              <div className="flex items-center justify-between gap-2"><span className={`min-w-0 truncate text-xs font-black ${isSelected ? "text-lime-300" : "text-white"}`}>{inquiry.title || details.model}</span>{canViewInquiryNo && <span className="shrink-0 font-mono text-[10px] font-medium text-slate-500">{inquiry.inquiryNo}</span>}{inquiry.hasUnreadFollowUps && <span className="h-2 w-2 shrink-0 rounded-full bg-amber-300" />}</div>
              <time className={`mt-2 block text-[10px] ${isSelected ? "text-lime-200/70" : "text-slate-500"}`}>{inquiryCloseCopy.startedAt}: {formatDate(inquiry.createdAt)}</time>
              <div className={`mt-2 grid gap-1 text-xs ${isSelected ? "text-lime-300" : "text-slate-300"}`}>
                <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.units}</span>{details.quantity}</p>
                {details.brand && <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.brand}</span>{details.brand}</p>}
                <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.model}</span>{details.model}</p>
                {details.trim && <p className="break-words"><span className={`mr-1 ${isSelected ? "text-lime-200" : "text-slate-500"}`}>{copy.trim}</span>{details.trim}</p>}
              </div>
            </button>
            {canModerateComments && <button type="button" disabled={busy} onClick={() => void closeInquiry(inquiry)} className="mt-3 text-[10px] font-black uppercase text-red-300 transition hover:text-red-200 disabled:cursor-wait disabled:opacity-60">{inquiryCloseCopy.closeInquiry}</button>}
          </article>;
        })}
        {visibleInquiries.length === 0 && <p className="rounded border border-dashed border-white/15 p-3 text-xs text-slate-400">{copy.noResults}</p>}
      </aside>
      {selected && <section className="min-w-0">
        <div className="rounded-lg border border-white/10 bg-[#0b1425] p-4">
          <div className="flex items-center gap-2"><p className="text-[10px] font-black uppercase text-theme">{commentCopy.inquiryRequest}</p>{canViewInquiryNo && <span className="font-mono text-[10px] font-medium text-slate-500">{selected.inquiryNo}</span>}</div>
          <h3 className="mt-1 font-black text-white">{selected.title || selected.vehicleModel}</h3>
          <InquirySnapshotDetails inquiry={selected} />
          <p className="mt-3 whitespace-pre-wrap text-sm text-slate-300">{selected.notes}</p>
        </div>
        <div className="mt-4 grid gap-3">
          {commentThreads.map((thread) => <InquiryCommentThread key={thread.note.id} thread={thread} onReply={setReplyTo} onClose={canModerateComments ? closeComment : undefined} replyLabel={commentCopy.reply} closeLabel={commentCopy.closeComment} hiddenPlaceholderLabel={commentCopy.hiddenPlaceholder} />)}
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
    {showHiddenNotes && <Dialog open onOpenChange={(open) => setShowHiddenNotes(open)} className="max-w-4xl"><DialogHeader><DialogTitle>{commentCopy.hiddenTitle}</DialogTitle><DialogDescription>{commentCopy.hiddenDescription}</DialogDescription></DialogHeader><div data-testid="closed-comment-manager" className="grid h-full min-h-0 content-start auto-rows-max grid-cols-1 gap-3 overflow-y-auto p-1 pr-2 md:grid-cols-2 xl:grid-cols-3">{hiddenNotes.length === 0 ? <p className="text-sm text-slate-400">{commentCopy.hiddenEmpty}</p> : hiddenNotes.map((item) => <article key={item.noteId} className="flex min-h-0 flex-col rounded border border-white/10 bg-[#0b1425] p-3"><div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1"><div><p className="font-mono text-[10px] font-black text-theme">{commentCopy.inquiryNo}: {item.inquiry?.inquiryNo || item.inquiryNo}</p><p className="mt-1 text-xs font-bold text-white">{item.inquiry?.vehicleModel || "-"}</p></div><time className="text-[10px] text-slate-500">{commentCopy.commentClosedAt}: {formatDate(item.deletedAt || "")}</time></div><p className="mt-3 text-xs font-black text-white">{commentCopy.commentAuthor}: {item.authorName} <span className="font-medium text-slate-400">{formatPortalRole(item.authorRole as PortalRole, locale)}</span></p><p className="mt-2 max-h-24 overflow-hidden whitespace-pre-wrap text-sm text-slate-300">{item.body}</p><time className="mt-2 text-[10px] text-slate-500">{commentCopy.commentCreatedAt}: {formatDate(item.createdAt)}</time><div className="mt-auto flex flex-wrap gap-3 pt-3"><button type="button" disabled={busy} onClick={() => void moderateHiddenComment(item.noteId, "restore")} className="text-xs text-theme">{commentCopy.restore}</button><button type="button" disabled={busy} onClick={() => void moderateHiddenComment(item.noteId, "purge")} className="text-xs text-red-300">{commentCopy.deletePermanently}</button></div></article>)}</div></Dialog>}
    {commentPendingClosure && <Dialog open onOpenChange={(open) => !open && setCommentPendingClosure(null)} className="max-w-md"><DialogHeader><DialogTitle>{commentCopy.closeWithRepliesTitle}</DialogTitle><DialogDescription>{commentCopy.closeWithRepliesDescription}</DialogDescription></DialogHeader><DialogFooter><button type="button" disabled={busy} onClick={() => setCommentPendingClosure(null)} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-slate-300">{commentCopy.cancel}</button><button type="button" disabled={busy} onClick={() => void submitCommentClosure(commentPendingClosure, "single")} className="rounded border border-amber-300/50 px-3 py-2 text-xs font-black text-amber-200">{commentCopy.hideOnlyThis}</button><button type="button" disabled={busy} onClick={() => void submitCommentClosure(commentPendingClosure, "cascade")} className="rounded border border-red-400/50 px-3 py-2 text-xs font-black text-red-300">{commentCopy.closeThread}</button></DialogFooter></Dialog>}
    {showClosedInquiries && <Dialog open onOpenChange={(open) => setShowClosedInquiries(open)} className="max-w-4xl"><DialogHeader><DialogTitle>{closedInquiryCopy.closedInquiryTitle}</DialogTitle><DialogDescription>{closedInquiryCopy.closedInquiryDescription}</DialogDescription></DialogHeader><div className="grid max-h-[70vh] gap-3 overflow-y-auto p-4">{closedInquiries.length === 0 ? <p className="text-sm text-slate-400">{closedInquiryCopy.closedInquiryEmpty}</p> : closedInquiries.map((inquiry) => <article key={inquiry.inquiryNo} className="rounded border border-white/10 bg-[#0b1425] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-mono text-xs font-black text-theme">{inquiry.inquiryNo}</p><h3 className="mt-1 text-sm font-black text-white">{inquiry.title || inquiry.vehicleModel}</h3></div><div className="flex flex-wrap gap-2"><button type="button" disabled={busy} onClick={() => void restoreClosedInquiry(inquiry)} className="rounded border border-theme/40 px-3 py-2 text-xs font-black text-theme disabled:cursor-wait disabled:opacity-60">{closedInquiryCopy.restoreInquiry}</button><button type="button" disabled={busy} onClick={() => void deleteClosedInquiry(inquiry)} className="rounded border border-red-400/40 px-3 py-2 text-xs font-black text-red-300 disabled:cursor-wait disabled:opacity-60">{closedInquiryCopy.deleteClosedInquiry}</button></div></div><div className="mt-3 grid gap-2 text-xs text-slate-300 sm:grid-cols-2"><p><span className="text-slate-500">{commentCopy.vehicle}</span> {inquiry.vehicleModel || "-"}</p><p><span className="text-slate-500">{closedInquiryCopy.initiator}</span> {inquiry.creatorName || inquiry.customerId || "-"}</p><p><span className="text-slate-500">{commentCopy.inquiryStarted}</span> {formatDate(inquiry.createdAt)}</p><p><span className="text-slate-500">{closedInquiryCopy.closedAt}</span> {formatDate(inquiry.updatedAt)}</p><p><span className="text-slate-500">{commentCopy.quantity}</span> {inquiry.quantity || "-"}</p><p><span className="text-slate-500">{commentCopy.tradeTerm}</span> {inquiry.tradeTerm || "-"}</p><p><span className="text-slate-500">{commentCopy.destinationPort}</span> {inquiry.destinationPort || "-"}</p></div>{inquiry.notes && <p className="mt-3 whitespace-pre-wrap rounded bg-black/20 p-3 text-xs text-slate-300"><span className="mr-2 text-slate-500">{commentCopy.initialNote}</span>{inquiry.notes}</p>}</article>)}</div></Dialog>}
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

function AdminUserManagement({
  data,
  filterType = "all",
  onRefreshData,
}: {
  data: BootstrapData;
  filterType?: "all" | "customers" | "staff";
  onRefreshData: () => Promise<void>;
}) {
  const { t, locale } = useTranslation();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "customers" | "staff">(filterType);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<PortalUserRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    accessCode: "",
    role: "customer" as PortalRole,
    priceTier: "partner" as PriceTier,
    company: "",
    whatsapp: "",
    telegramChatId: "",
    telegramUsername: "",
    status: "Active" as "Active" | "Disabled",
  });

  const allUsers: PortalUserRecord[] = useMemo(() => {
    return data.portalUsers || [];
  }, [data.portalUsers]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter((user) => {
      if (activeTab === "customers" && (user.role === "admin" || user.role === "sales")) return false;
      if (activeTab === "staff" && (user.role !== "admin" && user.role !== "sales")) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.company.toLowerCase().includes(q) ||
        user.user_id.toLowerCase().includes(q) ||
        (user.telegram_username && user.telegram_username.toLowerCase().includes(q)) ||
        (user.whatsapp && user.whatsapp.includes(q))
      );
    });
  }, [allUsers, activeTab, search]);

  const handleCopyTelegramLink = (userId: string) => {
    const url = `https://t.me/youguard_ev_bot?start=bind_${encodeURIComponent(userId)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const openCreateModal = () => {
    const initialRole: PortalRole = activeTab === "staff" ? "sales" : "customer";
    setForm({
      name: "",
      email: "",
      accessCode: "",
      role: initialRole,
      priceTier: defaultPriceTierForRole(initialRole),
      company: "",
      whatsapp: "",
      telegramChatId: "",
      telegramUsername: "",
      status: "Active",
    });
    setEditingUser(null);
    setError("");
    setShowModal(true);
  };

  const openEditModal = (user: PortalUserRecord) => {
    setForm({
      name: user.name,
      email: user.email,
      accessCode: user.access_code || "",
      role: user.role,
      priceTier: defaultPriceTierForRole(user.role),
      company: user.company || "",
      whatsapp: user.whatsapp || "",
      telegramChatId: user.bound_chat_id || user.telegram_chat_id || "",
      telegramUsername: user.bound_telegram_username || user.telegram_username || "",
      status: user.status || "Active",
    });
    setEditingUser(user);
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (editingUser) {
        await api(`/api/portal/admin/users/${encodeURIComponent(editingUser.user_id)}`, {
          method: "PATCH",
          body: JSON.stringify(form),
        });
      } else {
        await api("/api/portal/admin/users", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }
      setShowModal(false);
      await onRefreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user account");
    } finally {
      setBusy(false);
    }
  };

  const handleUnbindTelegram = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to unbind Telegram for "${name}"? The status will revert to Unbound.`)) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/portal/admin/users/${encodeURIComponent(userId)}/telegram`, {
        method: "DELETE",
      });
      await onRefreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to unbind Telegram");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete user account "${name}" (${userId})?`)) {
      return;
    }
    setBusy(true);
    try {
      await api(`/api/portal/admin/users/${encodeURIComponent(userId)}`, {
        method: "DELETE",
      });
      await onRefreshData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AdminPanel
      title={activeTab === "staff" ? "Internal Accounts" : activeTab === "customers" ? "Customer & Partner Accounts" : "User & Account Management"}
      subtitle="Manage administrator, sales, partner, and customer accounts, credentials, WhatsApp, and Telegram bindings"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "all" ? "bg-theme text-black" : "border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            All Accounts ({allUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "customers" ? "bg-theme text-black" : "border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Customers & Partners ({allUsers.filter((u) => u.role === "customer" || u.role === "partner").length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("staff")}
            className={`rounded-full px-4 py-1.5 text-xs font-black uppercase tracking-wider transition ${
              activeTab === "staff" ? "bg-theme text-black" : "border border-white/10 text-gray-400 hover:text-white"
            }`}
          >
            Internal Accounts ({allUsers.filter((u) => u.role === "admin" || u.role === "sales").length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            aria-label="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, company, telegram..."
            className="w-64 max-w-full text-xs"
          />
          <button
            type="button"
            onClick={openCreateModal}
            className="btn-primary flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider shadow-lg"
          >
            <span>+ Add Account</span>
          </button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20 shadow-xl">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/10 bg-white/[0.02]">
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">Account / Identity</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">Role</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">Company</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">WhatsApp</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">Telegram Bot Binding</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">Access Code</TableHead>
              <TableHead className="text-[11px] font-black uppercase tracking-wider text-slate-400">Status</TableHead>
              <TableHead className="text-right text-[11px] font-black uppercase tracking-wider text-slate-400">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-xs text-gray-500">
                  No accounts found matching current filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const tgChatId = user.bound_chat_id || user.telegram_chat_id;
                const tgUsername = user.bound_telegram_username || user.telegram_username;
                const isTelegramBound = Boolean(tgChatId);

                return (
                  <TableRow key={user.user_id} className="border-b border-white/5 transition hover:bg-white/[0.02]">
                    <TableCell className="py-3">
                      <div className="font-bold text-white text-xs">{user.name}</div>
                      <div className="text-[11px] text-gray-400">{user.email}</div>
                      <div className="font-mono text-[10px] text-[#22b8aa]">{user.user_id}</div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className={`inline-flex w-fit items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                        user.role === "admin"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : user.role === "sales"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : user.role === "partner"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      }`}>
                        {formatPortalRole(user.role, locale)}
                      </span>
                    </TableCell>
                    <TableCell className="py-3 text-xs text-gray-300">
                      {user.company || "-"}
                    </TableCell>
                    <TableCell className="py-3">
                      {user.whatsapp ? (
                        <a
                          href={`https://wa.me/${user.whatsapp.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-300 transition hover:bg-emerald-500/20"
                        >
                          <span>{user.whatsapp}</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-gray-600">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3">
                      <div className="flex flex-col gap-1">
                        {isTelegramBound ? (
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 rounded border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                              <span>✅ Linked</span>
                              {tgUsername && <span>(@{tgUsername})</span>}
                            </span>
                            {tgChatId && <span className="font-mono text-[9px] text-gray-400">ID: {tgChatId}</span>}
                            <button
                              type="button"
                              onClick={() => handleUnbindTelegram(user.user_id, user.name)}
                              className="rounded border border-red-500/30 bg-red-500/10 px-1.5 py-0.5 text-[10px] font-bold text-red-300 transition hover:bg-red-500/25"
                              title="Unbind Telegram account and revert back to Unbound state"
                            >
                              ✕ Unlink (解绑)
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                              ⚠️ Unbound
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyTelegramLink(user.user_id)}
                              className="rounded border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-gray-300 transition hover:bg-white/15 hover:text-white"
                              title="Copy Telegram binding link to send to customer"
                            >
                              {copiedId === user.user_id ? "Copied!" : "Copy Link"}
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3">
                      <span className="font-mono text-xs text-gray-300 bg-white/5 px-2 py-1 rounded border border-white/10">{user.access_code}</span>
                    </TableCell>
                    <TableCell className="py-3">
                      <AdminStatusBadge status={user.status || "Active"} />
                    </TableCell>
                    <TableCell className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(user)}
                          className="rounded border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-gray-200 transition hover:border-[#c5a059] hover:bg-[#c5a059]/10 hover:text-[#dfba73]"
                        >
                          Edit
                        </button>
                        {user.user_id !== data.user.userId && (
                          <button
                            type="button"
                            onClick={() => handleDeleteUser(user.user_id, user.name)}
                            className="rounded border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs text-red-300 transition hover:bg-red-500/20"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
            <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0b1425] p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <DialogHeader>
                <DialogTitle className="text-xl font-black text-white">
                  {editingUser ? `Edit Account: ${editingUser.name}` : "Create New Account"}
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-400">
                  {editingUser
                    ? "Update credentials, account role, WhatsApp, or manually configure Telegram chat ID."
                    : "Create a new internal staff or buyer account with login credentials."}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="mt-4 grid gap-3.5">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-bold text-gray-300">Full Name *</Label>
                    <Input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="e.g. Dawit Bekele"
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-gray-300">Email Address *</Label>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="e.g. dawit@example.com"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-[11px] font-bold text-gray-300">Access Code / Password *</Label>
                    <Input
                      required
                      value={form.accessCode}
                      onChange={(e) => setForm({ ...form, accessCode: e.target.value })}
                      placeholder="e.g. pass-2026"
                      className="mt-1 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] font-bold text-gray-300">Company Name</Label>
                    <Input
                      value={form.company}
                      onChange={(e) => setForm({ ...form, company: e.target.value })}
                      placeholder="e.g. Addis EV Motors"
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-bold text-gray-300">Account Type / Role (账号类型)</Label>
                  <div className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {(
                      [
                        { role: "customer", label: "Customer", sub: "海外买家" },
                        { role: "partner", label: "Partner", sub: "合作分销商" },
                        { role: "sales", label: "Sales", sub: "销售顾问" },
                        { role: "admin", label: "Admin", sub: "系统管理员" },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => setForm({ ...form, role: item.role, priceTier: defaultPriceTierForRole(item.role) })}
                        className={`flex flex-col items-center justify-center rounded-xl border p-2.5 text-center transition min-h-[44px] ${
                          form.role === item.role
                            ? "border-[#22b8aa] bg-[#22b8aa]/20 text-[#5ee6d8] font-bold shadow-sm"
                            : "border-white/10 bg-white/[0.03] text-gray-400 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        <span className="text-xs">{item.label}</span>
                        <span className="text-[10px] opacity-60">{item.sub}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[11px] font-bold text-gray-300">WhatsApp / Mobile Number</Label>
                  <Input
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                    placeholder="+251 91 123 4567"
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="rounded-xl border border-gold/30 bg-gold/5 p-3.5">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-[#dfba73]">✈️ Telegram Bot Configuration</div>
                    {(form.telegramChatId || form.telegramUsername) && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, telegramChatId: "", telegramUsername: "" })}
                        className="rounded border border-red-500/30 bg-red-500/15 px-2 py-0.5 text-[10px] font-bold text-red-300 hover:bg-red-500/30 transition"
                      >
                        ✕ Clear / Reset to Unbound (一键清空/解绑)
                      </button>
                    )}
                  </div>
                  <div className="mt-1 text-[10px] text-gray-400">
                    Enter Chat ID manually, click &quot;Clear / Reset to Unbound&quot; to unbind, or let customer tap the invite link.
                  </div>
                  <div className="mt-2.5 grid grid-cols-2 gap-2.5">
                    <div>
                      <Label className="text-[10px] text-gray-300">Telegram Chat ID (数字ID)</Label>
                      <Input
                        value={form.telegramChatId}
                        onChange={(e) => setForm({ ...form, telegramChatId: e.target.value })}
                        placeholder="e.g. 987654321 (Empty = Unbound)"
                        className="mt-1 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <Label className="text-[10px] text-gray-300">Telegram Username (@用户名)</Label>
                      <Input
                        value={form.telegramUsername}
                        onChange={(e) => setForm({ ...form, telegramUsername: e.target.value })}
                        placeholder="e.g. dawit_ev"
                        className="mt-1 text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-lg border border-white/15 px-4 py-2 text-xs font-bold text-gray-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="btn-primary rounded-lg px-5 py-2 text-xs font-black uppercase tracking-wider"
                  >
                    {busy ? "Saving..." : editingUser ? "Update Account" : "Create Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </Dialog>
      )}
    </AdminPanel>
  );
}

function VehicleEditModal({ vehicle, onClose, onSaved }: { vehicle: Vehicle; onClose: () => void; onSaved: () => Promise<void> }) {
  const { locale } = useTranslation();
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
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-[#0c1424] p-1">
              {["In Stock", "Preorder", "Unavailable"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => updateField("status", status)}
                  className={`flex-1 rounded-lg py-1.5 px-2 text-xs font-semibold transition min-h-[36px] ${
                    form.status === status
                      ? "bg-[#22b8aa] text-white shadow-sm font-bold"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
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

function AdminPanel({ title, subtitle, action, children }: { title: string; subtitle: string; action?: ReactNode; children: ReactNode }) {
  const { locale } = useTranslation();
  return (
    <section className="min-w-0">
      <header className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-black text-white">{localizeVehicleValue(title, locale)}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-400">{localizeVehicleValue(subtitle, locale)}</p> : null}
        </div>
        {action && <div>{action}</div>}
      </header>
      {children}
    </section>
  );
}

function AdminStat({ label, value, note, onClick }: { label: string; value: string; note: string; onClick?: () => void }) {
  const card = (
    <Card className={`p-4 transition-all duration-200 ${onClick ? "cursor-pointer hover:border-white/30 hover:bg-white/[.04] active:scale-[0.99] group" : ""}`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</p>
        {onClick && <span className="text-xs text-slate-500 group-hover:text-[#5ee6d8] transition-colors">↗</span>}
      </div>
      <strong className="mt-2 block text-2xl font-black text-white">{value}</strong>
      <span className="mt-2 block text-xs text-slate-500">{note}</span>
    </Card>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="text-left w-full block focus:outline-none cursor-pointer">
        {card}
      </button>
    );
  }
  return card;
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

function AdminTable({ headers, rows, emptyText, rowIds = [], highlightedRowId = "" }: { headers: string[]; rows: ReactNode[][]; emptyText: string; rowIds?: string[]; highlightedRowId?: string }) {
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
            <TableRow
              key={rowIndex}
              data-vehicle-resource-id={rowIds[rowIndex] || undefined}
              className={rowIds[rowIndex] === highlightedRowId ? "animate-featured-resource-flash" : undefined}
            >
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
    case "accounts":
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M15.5 20a4.5 4.5 0 0 1 5-4" />
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
  const models = [...(activeModels.length ? activeModels : data.vehicleModels || [])];
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

  const grouped = new Map<string, { item: SellableModel; offerMap: Map<string, VehicleOffer>; vehicles: Vehicle[] }>();
  for (const vehicle of data.vehicles || []) {
    const directModel = trustedCatalogModelForVehicle(vehicle, modelsByVehicle, modelsByName);
    const canonicalModel = directModel?.model || canonicalCatalogModelName(vehicle.brand, vehicle.model, data.vehicleModels || []);
    const modelInfo = directModel || modelsByName.get(modelResourceKey(vehicle.brand, canonicalModel));
    const modelKey = modelResourceKey(vehicle.brand, canonicalModel);
    if (!grouped.has(modelKey)) {
      grouped.set(modelKey, {
        item: {
          key: modelKey,
          brand: vehicle.brand,
          model: canonicalModel,
          year: vehicle.year,
          segment: vehicle.vehicleClass || modelInfo?.bodyType || inferVehicleSegment(vehicle),
          imageUrl: modelInfo?.imageUrl || vehicle.imageUrl,
          stockQuantity: 0,
          hasStockQuantity: false,
          preorderAvailable: false,
          fobPriceRange: "FOB on request",
          recommendationRank: vehicle.recommendationRank ?? null,
          priceTermsSummary: [],
          offers: [],
          vehicles: [],
        },
        offerMap: new Map(),
        vehicles: [],
      });
    }

    const entry = grouped.get(modelKey)!;
    entry.vehicles.push(vehicle);
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
    if (!entry.item.segment && (vehicle.vehicleClass || modelInfo?.bodyType)) entry.item.segment = vehicle.vehicleClass || modelInfo?.bodyType || "";

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
    .map(({ item, offerMap, vehicles }) => {
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

      const sortedVehicles = [...vehicles].sort((a, b) => {
        const supplyRank = Number(getSupplyType(b) === "In Stock") - Number(getSupplyType(a) === "In Stock");
        return supplyRank || (getFobPrice(a) || Number.MAX_SAFE_INTEGER) - (getFobPrice(b) || Number.MAX_SAFE_INTEGER);
      });

      return {
        ...item,
        vehicles: sortedVehicles,
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

export function vehiclesForSellableModel(vehicles: Vehicle[], item: SellableModel, catalogModels: VehicleModel[] = []) {
  const matched = (item.vehicles && item.vehicles.length > 0)
    ? (() => {
        const itemVehicleIds = new Set(item.vehicles.map((v) => v.id));
        const subset = vehicles.filter((v) => itemVehicleIds.has(v.id));
        return subset.length > 0 ? subset : [];
      })()
    : [];

  let candidates = matched;
  if (candidates.length === 0) {
    const modelsByVehicle = new Map<string, VehicleModel>();
    const modelsByName = new Map<string, VehicleModel>();
    for (const cm of catalogModels) {
      if (cm.id) modelsByVehicle.set(cm.id, cm);
      modelsByName.set(modelResourceKey(cm.brand, cm.model), cm);
    }

    candidates = vehicles.filter((vehicle) => {
      const directModel = trustedCatalogModelForVehicle(vehicle, modelsByVehicle, modelsByName);
      const canonicalModel = directModel?.model || canonicalCatalogModelName(vehicle.brand, vehicle.model, catalogModels);
      const modelKey = modelResourceKey(vehicle.brand, canonicalModel);
      const rawKey = modelResourceKey(vehicle.brand, vehicle.model);
      const strippedKey = modelResourceKey(vehicle.brand, stripPowertrainSuffix(vehicle.model));
      return modelKey === item.key || rawKey === item.key || strippedKey === item.key;
    });
  }

  return candidates.sort((a, b) => {
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
    offer.configuration,
    offer.exteriorColor,
    offer.interiorColor,
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
  return "Other";
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

function trustedCatalogModelForVehicle(
  vehicle: Vehicle,
  modelsByVehicle: Map<string, VehicleModel>,
  modelsByName: Map<string, VehicleModel>,
) {
  const sourceKey = modelResourceKey(vehicle.brand, vehicle.model);
  const namedModel = modelsByName.get(sourceKey);
  if (namedModel) return namedModel;
  const idModel = modelsByVehicle.get(vehicle.modelId);
  return idModel && sharesVehicleModelFamily(vehicle.model, idModel.model) ? idModel : undefined;
}

function sharesVehicleModelFamily(sourceModel: string, catalogModel: string) {
  const normalizedSource = stripPowertrainSuffix(sourceModel).toLowerCase().trim();
  const normalizedCatalog = stripPowertrainSuffix(catalogModel).toLowerCase().trim();
  return normalizedSource === normalizedCatalog
    || normalizedSource.startsWith(`${normalizedCatalog} `)
    || normalizedCatalog.startsWith(`${normalizedSource} `);
}

function stripPowertrainSuffix(model: string) {
  return String(model || "")
    .trim()
    .replace(/\s+(?:ev|dm-?i|phev|erev)$/i, "")
    .trim();
}

function canonicalCatalogModelName(brand: string, model: string, catalogModels: VehicleModel[]) {
  const exactKey = modelResourceKey(brand, model);
  const exact = catalogModels.find((candidate) => modelResourceKey(candidate.brand, candidate.model) === exactKey);
  if (exact) return exact.model;

  const baseModel = stripPowertrainSuffix(model);
  const base = catalogModels.find((candidate) => modelResourceKey(candidate.brand, candidate.model) === modelResourceKey(brand, baseModel));
  return base?.model || model;
}

function vehicleName(vehicle: Vehicle) {
  return `${vehicle.brand} ${vehicle.model} ${vehicle.trim}`.trim() || vehicle.id;
}

function getVehicleStockQuantity(vehicle: Pick<Vehicle, "stockQuantity" | "colorStockQuantity">) {
  return vehicle.colorStockQuantity ?? (typeof vehicle.stockQuantity === "number" && vehicle.stockQuantity > 0 ? vehicle.stockQuantity : 0);
}

function getConfirmedStockQuantity(vehicle: Pick<Vehicle, "colorStockQuantity">) {
  return typeof vehicle.colorStockQuantity === "number" && Number.isFinite(vehicle.colorStockQuantity)
    ? vehicle.colorStockQuantity
    : null;
}

export function isStockAlertEligible(vehicle: Pick<Vehicle, "waitDays" | "colorStockQuantity">) {
  const quantity = getConfirmedStockQuantity(vehicle);
  return getSupplyType(vehicle as Vehicle) === "In Stock" && quantity !== null && quantity >= 0 && quantity <= 2;
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
