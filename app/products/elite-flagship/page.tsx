"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { vehicles, specLabels } from "./data";

const ITEMS_PER_PAGE = 6;

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

export default function EliteFlagshipPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"price_low" | "price_high" | "range_high" | "range_low">("price_low");
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({});

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
    const sorted = [...vehicles];
    switch (sortBy) {
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
  }, [sortBy]);

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
        return v.tags.some(tag => checked.has(tag));
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
      <header className="pt-32 pb-20 relative z-10 overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.3) grayscale(20%)" }}
            alt="Elite Fleet"
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
              <Link
                href="/products"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                Vehicles
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                Category 02
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
            >
              The{" "}
              <span className="text-theme">Elite</span>{" "}
              <span style={{ color: "var(--color-gold)" }}>Flagship</span>{" "}
              Circle.
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 leading-relaxed max-w-2xl">
              Premium EVs crafted for government fleets, diplomatic corps, and
              C-suite mobility. 800V architecture, executive-grade comfort, and
              the B2B social currency that commands respect.
            </p>
          </div>
        </div>
      </header>

      <main className="py-12 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start">
            <aside className="lg:col-span-3">
              <div className="sticky top-[120px]">
                <div className="mb-10 relative">
                  <input
                    type="text"
                    placeholder="Search models..."
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
                  <span className="text-xs">×</span> Clear All Filters
                </button>

                <FilterGroup title="Body Style">
                  <FilterCheckbox label="Executive Sedan" checked={activeFilters["Body Style"]?.has("Executive Sedan") || false} onChange={() => handleFilterToggle("Body Style", "Executive Sedan")} />
                  <FilterCheckbox label="Premium SUV" checked={activeFilters["Body Style"]?.has("Premium SUV") || false} onChange={() => handleFilterToggle("Body Style", "Premium SUV")} />
                  <FilterCheckbox label="Diplomatic MPV" checked={activeFilters["Body Style"]?.has("Diplomatic MPV") || false} onChange={() => handleFilterToggle("Body Style", "Diplomatic MPV")} />
                </FilterGroup>

                <FilterGroup title="Battery Chemistry">
                  <FilterCheckbox label="LFP Blade (BYD)" checked={activeFilters["Battery Chemistry"]?.has("LFP Blade (BYD)") || false} onChange={() => handleFilterToggle("Battery Chemistry", "LFP Blade (BYD)")} />
                  <FilterCheckbox label="NCM (Ternary Lithium)" checked={activeFilters["Battery Chemistry"]?.has("NCM (Ternary Lithium)") || false} onChange={() => handleFilterToggle("Battery Chemistry", "NCM (Ternary Lithium)")} />
                  <FilterCheckbox label="Semi-Solid State" checked={activeFilters["Battery Chemistry"]?.has("Semi-Solid State") || false} onChange={() => handleFilterToggle("Battery Chemistry", "Semi-Solid State")} />
                </FilterGroup>

                <FilterGroup title="Range (CLTC)">
                  <FilterCheckbox label="Under 500 km" checked={activeFilters["Range (CLTC)"]?.has("Under 500 km") || false} onChange={() => handleFilterToggle("Range (CLTC)", "Under 500 km")} />
                  <FilterCheckbox label="500 km - 700 km" checked={activeFilters["Range (CLTC)"]?.has("500 km - 700 km") || false} onChange={() => handleFilterToggle("Range (CLTC)", "500 km - 700 km")} />
                  <FilterCheckbox label="700 km +" checked={activeFilters["Range (CLTC)"]?.has("700 km +") || false} onChange={() => handleFilterToggle("Range (CLTC)", "700 km +")} />
                </FilterGroup>

                <FilterGroup title="Price">
                  <FilterCheckbox label="$35,000 - $50,000" checked={activeFilters["Price"]?.has("$35,000 - $50,000") || false} onChange={() => handleFilterToggle("Price", "$35,000 - $50,000")} />
                  <FilterCheckbox label="$50,000 - $65,000" checked={activeFilters["Price"]?.has("$50,000 - $65,000") || false} onChange={() => handleFilterToggle("Price", "$50,000 - $65,000")} />
                  <FilterCheckbox label="Above $65,000" checked={activeFilters["Price"]?.has("Above $65,000") || false} onChange={() => handleFilterToggle("Price", "Above $65,000")} />
                </FilterGroup>

                <FilterGroup title="Charging Standard">
                  <FilterCheckbox label="800V Platform" checked={activeFilters["Charging Standard"]?.has("800V Platform") || false} onChange={() => handleFilterToggle("Charging Standard", "800V Platform")} />
                  <FilterCheckbox label="Battery Swap (NIO)" checked={activeFilters["Charging Standard"]?.has("Battery Swap (NIO)") || false} onChange={() => handleFilterToggle("Charging Standard", "Battery Swap (NIO)")} />
                  <FilterCheckbox label="EREV (Extended Range)" checked={activeFilters["Charging Standard"]?.has("EREV (Extended Range)") || false} onChange={() => handleFilterToggle("Charging Standard", "EREV (Extended Range)")} />
                </FilterGroup>

                <FilterGroup title="Availability" last>
                  <FilterCheckbox label="In Stock (Port)" checked={activeFilters["Availability"]?.has("In Stock (Port)") || false} onChange={() => handleFilterToggle("Availability", "In Stock (Port)")} />
                  <FilterCheckbox label="Factory Order (21+ Days)" checked={activeFilters["Availability"]?.has("Factory Order (21+ Days)") || false} onChange={() => handleFilterToggle("Availability", "Factory Order (21+ Days)")} />
                </FilterGroup>
              </div>
            </aside>

            <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                  Showing {showingStart}–{showingEnd} of {filteredVehicles.length} Models
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                    Sort By:
                  </span>
                  <select value={sortBy} onChange={handleSortChange} className="bg-transparent border-none text-gold text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="price_low" className="bg-bg text-white">
                      Price: Low to High
                    </option>
                    <option value="price_high" className="bg-bg text-white">
                      Price: High to Low
                    </option>
                    <option value="range_high" className="bg-bg text-white">
                      Range: High to Low
                    </option>
                    <option value="range_low" className="bg-bg text-white">
                      Range: Low to High
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

      <div className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Global Export Shipping"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.55)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 100px)",
            }}
          />
        </div>

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
                  {"←"} Prev
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
                  Next {"→"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer className="relative z-10" id="contact">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,.96) 0%, rgba(0,0,0,.82) 45%, rgba(0,0,0,.5) 75%, transparent 100%)",
            }}
          />
          <div className="relative z-10 container mx-auto px-6 md:px-12 py-16">
            <div className="grid md:grid-cols-4 gap-10 mb-14">
              <div>
                <div className="flex items-center gap-2.5 mb-5">
                  <div
                    className="w-8 h-8 rounded flex items-center justify-center font-black italic text-black"
                    style={{
                      background: "linear-gradient(135deg,#D4AF37,#C5A059)",
                    }}
                  >
                    A
                  </div>
                  <span className="text-base font-black tracking-tighter uppercase italic">
                    <span className="text-gray-400">auto</span><span className="text-theme">YJ</span>
                  </span>
                </div>
                <p className="text-gray-600 text-xs font-light leading-relaxed">
                  China&apos;s trusted EV sourcing partner for African dealers.
                  Expert-curated, transparently delivered.
                </p>
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  Vehicles
                </div>
                <ul className="space-y-3 text-xs text-gray-600 font-light">
                  <li>
                    <Link
                      href="/products/revenue-king"
                      className="hover:text-white transition"
                    >
                      Revenue King EVs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products/elite-flagship"
                      className="text-white"
                    >
                      Elite Flagship EVs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products/utility-pro"
                      className="hover:text-white transition"
                    >
                      Utility Pro EVs
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  Solutions
                </div>
                <ul className="space-y-3 text-xs text-gray-600 font-light">
                  <li>
                    <Link
                      href="/solutions#pdi"
                      className="hover:text-white transition"
                    >
                      PDI &amp; Quality
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#parts"
                      className="hover:text-white transition"
                    >
                      Starter Parts Kit
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#service"
                      className="hover:text-white transition"
                    >
                      Service Centre Setup
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#marketing"
                      className="hover:text-white transition"
                    >
                      Marketing Assets
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/solutions#finance"
                      className="hover:text-white transition"
                    >
                      Trade Terms
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  Resources
                </div>
                <ul className="space-y-3 text-xs text-gray-600 font-light">
                  <li>
                    <Link
                      href="/insights"
                      className="hover:text-white transition"
                    >
                      Insights
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/academy"
                      className="hover:text-white transition text-accent"
                    >
                      EV Academy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/about"
                      className="hover:text-white transition"
                    >
                      About Us
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div
              className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
              style={{ borderTop: "1px solid rgba(197,160,89,.06)" }}
            >
              <p className="text-[9px] font-black tracking-[.4em] uppercase text-gray-700">
                &copy; 2026 autoYJ Eco Supply Chain. All Rights Reserved.
              </p>
              <div className="flex gap-6">
                <Link
                  href="/privacy"
                  className="text-[9px] font-black tracking-widest uppercase text-gray-700 hover:text-gray-500 transition"
                >
                  Privacy
                </Link>
                <Link
                  href="/terms"
                  className="text-[9px] font-black tracking-widest uppercase text-gray-700 hover:text-gray-500 transition"
                >
                  Terms
                </Link>
              </div>
            </div>
          </div>
        </footer>
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
  vehicle: (typeof vehicles)[number];
}) {
  const specEntries = [
    { label: specLabels[vehicle.battery] || "Battery", value: vehicle.battery, accent: vehicle.batteryType },
    { label: specLabels[vehicle.range] || "Range", value: vehicle.range },
    { label: specLabels[vehicle.charging] || "Spec", value: vehicle.charging },
  ];

  return (
    <Link href={vehicle.link || "#"} className={`v-card-compact group ${!vehicle.link ? "pointer-events-none" : ""}`}>
      <div className="v-card-compact-img-wrap">
        <img
          src={vehicle.img}
          alt={`${vehicle.brand} ${vehicle.name}`}
          className="v-card-compact-img"
        />
        <div className="v-card-compact-overlay" />
        <div className="absolute bottom-4 left-5 flex items-center gap-2">
          <span
            className={
              vehicle.status === "in-stock"
                ? "pulse-dot w-1.5 h-1.5"
                : "w-1.5 h-1.5 rounded-full bg-theme shadow-[0_0_8px_rgba(197,160,89,0.8)]"
            }
          />
          <span className="text-[9px] font-black tracking-[0.2em] uppercase text-white drop-shadow-md">
            {vehicle.statusText}
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
              Est. Price
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
                      spec.accent === "LFP" || spec.accent === "LFP Blade"
                        ? "text-accent"
                        : "text-white"
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
          <span>View Full Spec Sheet</span>
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </div>
      </div>
    </Link>
  );
}
