"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { vehicles } from "../../app/products/revenue-king/data";

const ITEMS_PER_PAGE = 6;
const DEFAULT_ORDER = vehicles.map((vehicle) => vehicle.link.split("/").pop()).filter(Boolean);

function defaultOrderRank(vehicle: { link?: string; name?: string }) {
  const slug = vehicle.link?.split("/").pop();
  const slugRank = slug ? DEFAULT_ORDER.indexOf(slug) : -1;
  if (slugRank >= 0) return slugRank;

  const nameRank = vehicles.findIndex((item) => item.name.toLowerCase() === vehicle.name?.toLowerCase());
  return nameRank >= 0 ? nameRank : Number.MAX_SAFE_INTEGER;
}

function generatePageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [];

  pages.push(1);

  if (current > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) {
    pages.push("ellipsis");
  }

  pages.push(total);

  return pages;
}

function parsePriceLow(fob: string): number {
  const match = fob.match(/\$([0-9,]+)/);
  if (!match) return Infinity;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function parseRangeNum(range: string): number {
  const match = range.match(/([0-9,]+)\s*km/);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ""), 10);
}

function inventoryDotClass(status?: string) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "in-stock" || normalized.startsWith("in stock")) return "inventory-dot inventory-dot-in-stock";
  if (normalized.includes("production")) return "inventory-dot inventory-dot-production";
  return "inventory-dot inventory-dot-tbc";
}

function inventoryStatusText(vehicle: any, fallbackInStock: string, fallbackFactory: string) {
  if (vehicle.statusText) return vehicle.statusText;
  const normalized = (vehicle.status || "").toLowerCase();
  if (normalized === "in-stock" || normalized.startsWith("in stock")) return fallbackInStock;
  if (normalized.includes("production")) return "Production";
  if (normalized.includes("tbc")) return "TBC";
  return fallbackFactory;
}

export default function RevenueKingPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"default" | "price_low" | "price_high" | "range_high" | "range_low">("default");
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({});

  useEffect(() => {
    fetch("/api/portal/public/products")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: any) => {
        const filtered = data.filter((p: any) => p.category === "revenue-king");
        const mapped = filtered.map((p: any) => {
          const fallback = vehicles.find((v) => v.name.toLowerCase() === p.name.toLowerCase() || p.slug.includes(v.name.toLowerCase()));
          return {
            brand: p.brand,
            name: p.name,
            fob: p.fob || (fallback ? fallback.fob : ""),
            battery: p.battery || (fallback ? fallback.battery : ""),
            batteryType: p.tags?.find((t: string) => t.includes("LFP") || t.includes("NCM")) || (fallback ? fallback.batteryType : ""),
            range: p.range || (fallback ? fallback.range : ""),
            charging: p.charging || p.desc || (fallback ? fallback.charging : ""),
            img: p.img || (fallback ? fallback.img : ""),
            status: p.status || (fallback ? fallback.status : "tbc"),
            statusText: p.statusText || (fallback ? fallback.statusText : "TBC"),
            link: p.link || (fallback ? fallback.link : `/products/revenue-king/${p.slug}`),
            tags: p.tags && p.tags.length ? p.tags : (fallback ? fallback.tags : []),
          };
        });
        setProducts(mapped);
      })
      .catch(() => {});
  }, []);

  const displayVehicles = products || vehicles;

  const handleFilterToggle = useCallback((group: string, label: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      const existing = prev[group];
      const nextSet = new Set(existing || []);
      if (nextSet.has(label)) {
        nextSet.delete(label);
        if (nextSet.size === 0) delete next[group];
        else next[group] = nextSet;
      } else {
        next[group] = new Set([...nextSet, label]);
      }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const sortedVehicles = useMemo(() => {
    const sorted = [...displayVehicles];
    switch (sortBy) {
      case "default":
        sorted.sort((a, b) => defaultOrderRank(a) - defaultOrderRank(b));
        break;
      case "price_low":
        sorted.sort((a, b) => parsePriceLow(a.fob) - parsePriceLow(b.fob));
        break;
      case "price_high":
        sorted.sort((a, b) => parsePriceLow(b.fob) - parsePriceLow(a.fob));
        break;
      case "range_high":
        sorted.sort((a, b) => parseRangeNum(b.range) - parseRangeNum(a.range));
        break;
      case "range_low":
        sorted.sort((a, b) => parseRangeNum(a.range) - parseRangeNum(b.range));
        break;
    }
    return sorted;
  }, [displayVehicles, sortBy]);

  const filteredVehicles = useMemo(() => {
    let result = sortedVehicles;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        v.brand.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q)
      );
    }
    const groups = Object.keys(activeFilters);
    if (groups.length === 0) return result;
    return result.filter(v =>
      groups.every(group => {
        const checked = activeFilters[group];
        if (!checked || checked.size === 0) return true;
        return v.tags.some((tag: string) => checked.has(tag));
      })
    );
  }, [sortedVehicles, search, activeFilters]);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as typeof sortBy);
    setCurrentPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filteredVehicles.length / ITEMS_PER_PAGE));

  const pageVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredVehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage, filteredVehicles]);

  const pageNumbers = useMemo(
    () => generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const showingStart = filteredVehicles.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, filteredVehicles.length);

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero */}
      <header className="pt-32 pb-20 relative z-10 overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="/pic/hero/photo-1593941707882-a5bba14938c7.webp"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.3) grayscale(20%)" }}
            alt="Urban Fleet"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,0.65)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-mid) 0%, transparent 60%)",
            }}
          />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <LocaleLink
                href="/products"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                {t("productsRevenueKing.breadcrumb")}
              </LocaleLink>
              <span className="text-gray-600">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                {t("productsRevenueKing.category")}
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
            >
              {t("productsRevenueKing.heading")}{" "}
              <span className="text-theme">{t("productsRevenueKing.headingAccent1")}</span>{" "}
              <span className="text-accent">{t("productsRevenueKing.headingAccent2")}</span>
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 leading-relaxed max-w-2xl">
              {t("productsRevenueKing.description")}
            </p>
          </div>
        </div>
      </header>

      {/* Main Catalog */}
      <main className="py-12 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-3">
              <div className="sticky top-[120px]">
                <div className="mb-10 relative">
                  <input
                    type="text"
                    placeholder={t("productsRevenueKing.searchPlaceholder") as string}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-sm text-white focus:border-gold outline-none transition-colors"
                  />
                  <svg
                    className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>

                <button
                  onClick={() => { setActiveFilters({}); setSearch(""); setCurrentPage(1); }}
                  className="w-full text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 hover:text-white transition mb-6 text-left flex items-center gap-2"
                >
                  <span className="text-xs">&times;</span> {t("productsRevenueKing.clearAllFilters")}
                </button>

                <FilterGroup title={t("productsRevenueKing.filterGroups.bodyStyle")}>
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.hatchback")} checked={activeFilters["Body Style"]?.has("Hatchback (Sub-Compact)") || false} onChange={() => handleFilterToggle("Body Style", "Hatchback (Sub-Compact)")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.compactSuv")} checked={activeFilters["Body Style"]?.has("Compact SUV") || false} onChange={() => handleFilterToggle("Body Style", "Compact SUV")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.sedan")} checked={activeFilters["Body Style"]?.has("Sedan") || false} onChange={() => handleFilterToggle("Body Style", "Sedan")} />
                </FilterGroup>

                <FilterGroup title={t("productsRevenueKing.filterGroups.batteryChemistry")}>
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.lfp")} checked={activeFilters["Battery Chemistry"]?.has("LFP (Lithium Iron Phosphate)") || false} onChange={() => handleFilterToggle("Battery Chemistry", "LFP (Lithium Iron Phosphate)")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.ncm")} checked={activeFilters["Battery Chemistry"]?.has("NCM (Ternary Lithium)") || false} onChange={() => handleFilterToggle("Battery Chemistry", "NCM (Ternary Lithium)")} />
                </FilterGroup>

                <FilterGroup title={t("productsRevenueKing.filterGroups.range")}>
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.rangeUnder300")} checked={activeFilters["Urban Range (NEDC)"]?.has("Under 300 km") || false} onChange={() => handleFilterToggle("Urban Range (NEDC)", "Under 300 km")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.range300to450")} checked={activeFilters["Urban Range (NEDC)"]?.has("300 km - 450 km") || false} onChange={() => handleFilterToggle("Urban Range (NEDC)", "300 km - 450 km")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.rangeAbove450")} checked={activeFilters["Urban Range (NEDC)"]?.has("450 km +") || false} onChange={() => handleFilterToggle("Urban Range (NEDC)", "450 km +")} />
                </FilterGroup>

                <FilterGroup title={t("productsRevenueKing.filterGroups.price")}>
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.priceUnder15k")} checked={activeFilters["Price"]?.has("Under $15,000") || false} onChange={() => handleFilterToggle("Price", "Under $15,000")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.price15to20k")} checked={activeFilters["Price"]?.has("$15,000 - $20,000") || false} onChange={() => handleFilterToggle("Price", "$15,000 - $20,000")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.priceAbove20k")} checked={activeFilters["Price"]?.has("Above $20,000") || false} onChange={() => handleFilterToggle("Price", "Above $20,000")} />
                </FilterGroup>

                <FilterGroup title={t("productsRevenueKing.filterGroups.steeringSetup")}>
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.lhd")} checked={activeFilters["Steering Setup"]?.has("LHD (Left-Hand Drive)") || false} onChange={() => handleFilterToggle("Steering Setup", "LHD (Left-Hand Drive)")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.rhd")} checked={activeFilters["Steering Setup"]?.has("RHD (Right-Hand Drive)") || false} onChange={() => handleFilterToggle("Steering Setup", "RHD (Right-Hand Drive)")} />
                </FilterGroup>

                <FilterGroup title={t("productsRevenueKing.filterGroups.availability")} last>
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.inStock")} checked={activeFilters["Availability"]?.has("In Stock (Port)") || false} onChange={() => handleFilterToggle("Availability", "In Stock (Port)")} />
                  <FilterCheckbox label={t("productsRevenueKing.filterOptions.factoryOrder")} checked={activeFilters["Availability"]?.has("Factory Order (14+ Days)") || false} onChange={() => handleFilterToggle("Availability", "Factory Order (14+ Days)")} />
                </FilterGroup>
              </div>
            </aside>

            {/* Vehicle Grid */}
            <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                  {t("productsRevenueKing.showing")
                    .replace("{start}", String(showingStart))
                    .replace("{end}", String(showingEnd))
                    .replace("{total}", String(filteredVehicles.length))}
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                    {t("productsRevenueKing.sortBy")}
                  </span>
                  <select value={sortBy} onChange={handleSortChange} className="bg-transparent border-none text-gold text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="default" className="bg-bg text-white">
                      {t("productsRevenueKing.sortOptions.default")}
                    </option>
                    <option value="price_low" className="bg-bg text-white">
                      {t("productsRevenueKing.sortOptions.priceLow")}
                    </option>
                    <option value="price_high" className="bg-bg text-white">
                      {t("productsRevenueKing.sortOptions.priceHigh")}
                    </option>
                    <option value="range_high" className="bg-bg text-white">
                      {t("productsRevenueKing.sortOptions.rangeHigh")}
                    </option>
                    <option value="range_low" className="bg-bg text-white">
                      {t("productsRevenueKing.sortOptions.rangeLow")}
                    </option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-0">
                {pageVehicles.map((v) => (
                  <VehicleCard key={`${v.brand}-${v.name}`} vehicle={v} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="relative overflow-hidden bg-a">
        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-16 pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16">
            <div className="lg:col-span-3" />
            <div className="lg:col-span-9">
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="page-btn page-btn-wide disabled:opacity-30 disabled:pointer-events-none"
                >
                  {t("productsRevenueKing.prev").split(" ")[0]} {t("productsRevenueKing.prev").split(" ").slice(1).join(" ")}
                </button>

                {pageNumbers.map((page, idx) =>
                  page === "ellipsis" ? (
                    <span key={`ellipsis-${idx}`} className="text-gray-600 px-2 text-sm">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`page-btn ${page === currentPage ? "active" : ""}`}
                    >
                      {page}
                    </button>
                  )
                )}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="page-btn page-btn-wide disabled:opacity-30 disabled:pointer-events-none"
                >
                  {t("productsRevenueKing.next").split(" ").slice(0, -1).join(" ")} {t("productsRevenueKing.next").split(" ").slice(-1)[0]}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterGroup({
  title,
  children,
  last,
}: {
  title: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={last ? "border-none" : ""}
      style={
        last
          ? { paddingBottom: "1.5rem", marginBottom: "1.5rem" }
          : {
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              paddingBottom: "1.5rem",
              marginBottom: "1.5rem",
            }
      }
    >
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-4">
        {title}
      </div>
      {children}
    </div>
  );
}

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-[10px] cursor-pointer mb-2 group">
      <input
        type="checkbox"
        className="hidden peer"
        checked={checked}
        onChange={onChange}
      />
      <span className="w-4 h-4 border border-white/20 rounded flex items-center justify-center transition-all peer-checked:bg-gold peer-checked:border-gold">
        <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">✓</span>
      </span>
      <span className="text-sm text-gray-400 group-hover:text-white transition-colors peer-checked:text-gold peer-checked:font-semibold">
        {label}
      </span>
    </label>
  );
}

function VehicleCard({
  vehicle,
}: {
  vehicle: any;
}) {
  const { t } = useTranslation();

  const specEntries = [
    { label: t("productsRevenueKing.filterGroups.batteryChemistry") || "Battery", value: vehicle.battery, accent: vehicle.batteryType },
    { label: t("productsRevenueKing.filterGroups.range") || "Range", value: vehicle.range },
    { label: t("productsRevenueKing.filterGroups.steeringSetup") || "Spec", value: vehicle.charging },
  ];

  const statusText = inventoryStatusText(
    vehicle,
    t("productsRevenueKing.filterOptions.inStock"),
    t("productsRevenueKing.filterOptions.factoryOrder"),
  );

  return (
    <LocaleLink href={vehicle.link || "#"} className={`v-card-compact group ${!vehicle.link ? "pointer-events-none" : ""}`}>
      <div className="v-card-compact-img-wrap">
        <img
          src={vehicle.img}
          alt={`${vehicle.brand} ${vehicle.name}`}
          className="v-card-compact-img"
          style={
            vehicle.name === "Lumin Corn"
              ? { filter: "brightness(0.7) sepia(20%)" }
              : vehicle.name === "Nano Box"
                ? { filter: "brightness(0.6) hue-rotate(180deg)" }
                : undefined
          }
        />
        <div className="v-card-compact-overlay" />
        <div className="absolute bottom-4 left-5 flex items-center gap-2">
          <span className={inventoryDotClass(vehicle.status)} />
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white drop-shadow-md">
            {statusText}
          </span>
        </div>
      </div>
      <div className="v-card-compact-content">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">
              {vehicle.brand}
            </div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">
              {vehicle.name}
            </h2>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">
              {t("productsRevenueKing.estPrice")}
            </div>
            <div className="text-xl font-black text-theme">{vehicle.fob}</div>
          </div>
        </div>
        <div className="flex-grow">
          {specEntries.map((spec, j) => (
            <div
              key={j}
              className="flex justify-between py-[10px] border-b border-white/[0.03] last:border-b-0"
            >
              <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                {spec.label}
              </span>
              <span className="text-xs font-bold text-white">
                {spec.value}{" "}
                {spec.accent && (
                  <span
                    className={
                      spec.accent.includes("LFP") ? "text-accent" : "text-white"
                    }
                  >
                    {spec.accent}
                  </span>
                )}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gold flex items-center justify-between">
          <span>{t("productsRevenueKing.viewFullSpec")}</span>
          <span className="group-hover:translate-x-1 transition-transform">
            &rarr;
          </span>
        </div>
      </div>
    </LocaleLink>
  );
}
