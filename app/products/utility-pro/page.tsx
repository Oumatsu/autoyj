"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

const ITEMS_PER_PAGE = 6;

const vehicles = [
  {
    brand: "BYD",
    name: "T3 Cargo Van",
    fob: "$18,500",
    battery: "47.5 kWh",
    batteryType: "LFP Blade",
    range: "280 km",
    charging: "V2L 3.3 kW Export",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  {
    brand: "Dongfeng",
    name: "Rich 6 EV Pickup",
    fob: "$22,800",
    battery: "68.8 kWh",
    batteryType: "LFP",
    range: "350 km",
    charging: "1 Ton Payload / 4WD",
    img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
    status: "in-stock",
    statusText: "In Stock: Wuhan",
  },
  {
    brand: "Geely",
    name: "Farizon FX Pickup",
    fob: "$24,500",
    battery: "86.6 kWh",
    batteryType: "LFP",
    range: "380 km",
    charging: "V2L 6 kW Export",
    img: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=800&q=80",
    status: "factory",
    statusText: "Factory Order: 18 Days",
  },
  {
    brand: "Changan",
    name: "Kaicheng V919",
    fob: "$16,200",
    battery: "50.3 kWh",
    batteryType: "LFP",
    range: "260 km",
    charging: "Last-Mile Delivery Van",
    img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=800&q=80",
    status: "in-stock",
    statusText: "In Stock: Chongqing",
  },
  {
    brand: "Wuling",
    name: "Hongguang Mini EV Truck",
    fob: "$8,900",
    battery: "26.0 kWh",
    batteryType: "LFP",
    range: "220 km",
    charging: "Micro Cargo / Urban",
    img: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80",
    status: "in-stock",
    statusText: "In Stock: Liuzhou",
  },
  {
    brand: "JMC",
    name: "E-Lushun Pickup",
    fob: "$21,000",
    battery: "63.8 kWh",
    batteryType: "NCM",
    range: "320 km",
    charging: "200mm Clearance / AWD",
    img: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    status: "factory",
    statusText: "Factory Order: 25 Days",
  },
  {
    brand: "SAIC Maxus",
    name: "EV90 Panel Van",
    fob: "$26,500",
    battery: "88.5 kWh",
    batteryType: "LFP",
    range: "340 km",
    charging: "12 m³ Cargo Volume",
    img: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  {
    brand: "Foton",
    name: "Viewato EV Bus",
    fob: "$35,000",
    battery: "106.9 kWh",
    batteryType: "LFP",
    range: "400 km",
    charging: "19-Seat Shuttle / V2L",
    img: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=800&q=80",
    status: "factory",
    statusText: "Factory Order: 30 Days",
  },
];

const specLabels: Record<string, string> = {
  "47.5 kWh": "Battery",
  "68.8 kWh": "Battery",
  "86.6 kWh": "Battery",
  "50.3 kWh": "Battery",
  "26.0 kWh": "Battery",
  "63.8 kWh": "Battery",
  "88.5 kWh": "Battery",
  "106.9 kWh": "Battery",
  "280 km": "Range (NEDC)",
  "350 km": "Range (NEDC)",
  "380 km": "Range (NEDC)",
  "260 km": "Range (NEDC)",
  "220 km": "Range (NEDC)",
  "320 km": "Range (NEDC)",
  "340 km": "Range (NEDC)",
  "400 km": "Range (NEDC)",
  "V2L 3.3 kW Export": "V2L Output",
  "1 Ton Payload / 4WD": "Capability",
  "V2L 6 kW Export": "V2L Output",
  "Last-Mile Delivery Van": "Use Case",
  "Micro Cargo / Urban": "Use Case",
  "200mm Clearance / AWD": "Capability",
  "12 m³ Cargo Volume": "Cargo",
  "19-Seat Shuttle / V2L": "Configuration",
};

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

export default function UtilityProPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(vehicles.length / ITEMS_PER_PAGE);

  const pageVehicles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return vehicles.slice(start, start + ITEMS_PER_PAGE);
  }, [currentPage]);

  const pageNumbers = useMemo(
    () => generatePageNumbers(currentPage, totalPages),
    [currentPage, totalPages]
  );

  const showingStart = (currentPage - 1) * ITEMS_PER_PAGE + 1;
  const showingEnd = Math.min(currentPage * ITEMS_PER_PAGE, vehicles.length);

  return (
    <>
      <header className="pt-32 pb-20 relative z-10 overflow-hidden min-h-[50vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.3) grayscale(20%)" }}
            alt="Utility Fleet"
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
                Category 03
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
            >
              The{" "}
              <span className="text-accent">Utility</span>{" "}
              <span className="text-theme">Pro</span>{" "}
              Fleet.
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-accent/30 pl-6 leading-relaxed max-w-2xl">
              All-terrain EVs built for logistics, construction, and off-grid
              operations. V2L power export, high clearance, and fuel costs
              slashed 50–60%. Work harder, spend less.
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

                <FilterGroup title="Vehicle Type">
                  <FilterCheckbox label="Pickup Truck" defaultChecked />
                  <FilterCheckbox label="Cargo Van" defaultChecked />
                  <FilterCheckbox label="Micro Truck" />
                  <FilterCheckbox label="Shuttle Bus" />
                </FilterGroup>

                <FilterGroup title="Battery Chemistry">
                  <FilterCheckbox label="LFP (Lithium Iron Phosphate)" defaultChecked />
                  <FilterCheckbox label="NCM (Ternary Lithium)" />
                </FilterGroup>

                <FilterGroup title="Range (NEDC)">
                  <FilterCheckbox label="Under 250 km" />
                  <FilterCheckbox label="250 km - 350 km" defaultChecked />
                  <FilterCheckbox label="350 km +" />
                </FilterGroup>

                <FilterGroup title="Est. FOB Price">
                  <FilterCheckbox label="Under $15,000" />
                  <FilterCheckbox label="$15,000 - $25,000" defaultChecked />
                  <FilterCheckbox label="Above $25,000" />
                </FilterGroup>

                <FilterGroup title="Capability">
                  <FilterCheckbox label="V2L Power Export" defaultChecked />
                  <FilterCheckbox label="4WD / AWD" />
                  <FilterCheckbox label="High Clearance (200mm+)" />
                </FilterGroup>

                <FilterGroup title="Availability" last>
                  <FilterCheckbox label="In Stock (Port)" defaultChecked />
                  <FilterCheckbox label="Factory Order (18+ Days)" />
                </FilterGroup>
              </div>
            </aside>

            <div className="lg:col-span-9">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-white/5 pb-6">
                <div className="text-[10px] font-black tracking-widest uppercase text-gray-500">
                  Showing {showingStart}–{showingEnd} of {vehicles.length} Models
                </div>
                <div className="flex gap-4 items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                    Sort By:
                  </span>
                  <select className="bg-transparent border-none text-gold text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer">
                    <option value="utility" className="bg-bg text-white">
                      Utility Score
                    </option>
                    <option value="price_low" className="bg-bg text-white">
                      Price: Low to High
                    </option>
                    <option value="range" className="bg-bg text-white">
                      Range: High to Low
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
                  ← Prev
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
                  Next →
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
                    E
                  </div>
                  <span className="text-base font-black tracking-tighter uppercase italic text-white">
                    Evexport<span className="text-theme">web</span>
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
                      className="hover:text-white transition"
                    >
                      Elite Flagship EVs
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products/utility-pro"
                      className="text-white"
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
                      Market Reports
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
                © 2026 EVEXPORTWEB Eco Supply Chain. All Rights Reserved.
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
  defaultChecked,
}: {
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-[10px] cursor-pointer mb-2 group">
      <input
        type="checkbox"
        className="hidden peer"
        defaultChecked={defaultChecked}
      />
      <span className="w-4 h-4 border border-white/20 rounded flex items-center justify-center transition-all peer-checked:bg-gold peer-checked:border-gold">
        <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
          ✓
        </span>
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
    <div className="v-card-compact group">
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
              Est. FOB
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
          <span className="group-hover:translate-x-1 transition-transform">
            →
          </span>
        </div>
      </div>
    </div>
  );
}
