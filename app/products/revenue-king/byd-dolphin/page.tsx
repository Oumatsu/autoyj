import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Dolphin (海豚)",
    fob: "CNY 99,800 – 129,800",
    battery: "44.9 kWh",
    batteryType: "LFP Blade",
    range: "420 km",
    charging: "2025 comfort suspension — e-Platform 3.0 + heat pump across all trims",
    img: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&w=1200&q=80",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "revenue-king" as const,
  title: "BYD Dolphin",
  subtitle: "海豚 — 2025 Edition",
  heroDesc: "Global brand recognition with 2025 upgraded comfort suspension. e-Platform 3.0 with standard heat pump — the refined urban EV that outsells its ICE rivals daily.",
  stat1Label: "km CLTC Range",
  stat1Value: "420",
  stat2Label: "Monthly Saving",
  stat2Value: "CNY 1,960",
  stat3Label: "e-Platform",
  stat3Value: "3.0",
  whyTitle: "Why It Sells",
  whyDesc: "Refined and recognised. The Urban EV benchmark.",
  features: [
    { icon: "🔋", title: "Heat Pump Standard", desc: "All trims feature a heat pump for superior winter range retention — a feature many competitors charge extra for." },
    { icon: "🌍", title: "Global Brand Equity", desc: "Dolphin is sold in 50+ countries. Your customers already trust the BYD name, reducing your sales friction." },
    { icon: "⚡", title: "e-Platform 3.0", desc: "Dedicated EV platform means integrated battery, efficient packaging, and class-leading cabin space in a compact footprint." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Small Hatchback" },
    { label: "Range (CLTC)", value: "420 km" },
    { label: "Battery Capacity", value: "44.9 kWh" },
    { label: "Battery Type", value: "LFP Blade" },
    { label: "Motor Power", value: "70 kW (95 hp)" },
    { label: "Drive Type", value: "Front-Wheel Drive" },
    { label: "0 – 100 km/h", value: "10.5 sec" },
    { label: "Top Speed", value: "150 km/h" },
    { label: "DC Fast Charge", value: "~30 min (30%→80%)" },
    { label: "AC Slow Charge", value: "~7 hrs (0→100%)" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes — 220V" },
    { label: "Battery Warranty", value: "8 Yrs / 150,000 km" },
    { label: "Dimensions (L×W×H)", value: "4,125 × 1,770 × 1,570 mm" },
    { label: "Wheelbase", value: "2,700 mm" },
    { label: "Boot Volume", value: "345 L" },
    { label: "Seating Capacity", value: "5 Seats" },
    { label: "Sunroof", value: "Available (Higher Trims)" },
    { label: "Airbags", value: "6" },
    { label: "V2L Support", value: "Not Supported" },
  ],
  fits: [
    { icon: "🏙️", title: "Urban Professional", desc: "The ideal daily driver for professionals who want brand equity and refinement without the premium price tag.", accent: "All-round excellence" },
    { icon: "🏡", title: "Family Second Car", desc: "Perfect school-run and weekend machine. Low running costs make it the default choice for family errands.", accent: "Lowest running costs" },
    { icon: "🔄", title: "Fleet Upgrader", desc: "The natural step up from budget EVs. Higher resale value and brand trust make fleet rotation easier.", accent: "Strong residual value" },
  ],
  relatedModels: [
    { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" },
    { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" },
    { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" },
    { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" },
  ],
  tags: ["Hatchback", "LFP Blade"],
};

export default function Page() {
  return <VehicleDetail data={data} />;
}
