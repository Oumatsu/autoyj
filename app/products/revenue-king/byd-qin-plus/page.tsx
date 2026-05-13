import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Qin PLUS EV",
    fob: "CNY 119,800 – 139,800",
    battery: "57.6 kWh",
    batteryType: "LFP Blade",
    range: "510 km",
    charging: "1M+ units validated — ultra-low drag + large boot + lowest after-sales costs",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/2qin-plus-ev-p.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "revenue-king" as const,
  title: "BYD Qin PLUS EV",
  subtitle: "The Million-Unit King",
  heroDesc: "The most mature supply chain in the industry. Over one million units validated — ultra-low drag coefficient, cavernous boot, and the lowest after-sales parts cost of any EV in its class.",
  stat1Label: "km CLTC Range",
  stat1Value: "510",
  stat2Label: "Monthly Saving",
  stat2Value: "CNY 2,450",
  stat3Label: "Million+",
  stat3Value: "Built",
  whyTitle: "Why It Sells",
  whyDesc: "Proven at scale. The lowest-risk EV purchase.",
  features: [
    { icon: "📦", title: "Lowest After-Sales Cost", desc: "With 1M+ units on the road, parts are ubiquitous and cheap. Your service centre will thank you for stocking the Qin." },
    { icon: "🌬️", title: "Ultra-Low Drag (0.21 Cd)", desc: "Aerodynamic efficiency translates directly to real-world range. The Qin delivers more km per kWh than most rivals." },
    { icon: "📐", title: "Segment-Leading Boot (450L)", desc: "Ride-hailing drivers need cargo space for airport runs. The Qin's boot comfortably fits 2 large suitcases plus carry-ons." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact Sedan" },
    { label: "Range (CLTC)", value: "510 km" },
    { label: "Battery Capacity", value: "57.6 kWh" },
    { label: "Battery Type", value: "LFP Blade" },
    { label: "Motor Power", value: "100 kW (136 hp)" },
    { label: "Drive Type", value: "Front-Wheel Drive" },
    { label: "0 – 100 km/h", value: "7.3 sec" },
    { label: "Top Speed", value: "160 km/h" },
    { label: "DC Fast Charge", value: "~30 min (30%→80%)" },
    { label: "Drag Coefficient", value: "0.21 Cd" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes — 220V" },
    { label: "Battery Warranty", value: "8 Yrs / 150,000 km" },
    { label: "Dimensions (L×W×H)", value: "4,765 × 1,837 × 1,495 mm" },
    { label: "Wheelbase", value: "2,718 mm" },
    { label: "Boot Volume", value: "450 L" },
    { label: "Seating Capacity", value: "5 Seats" },
    { label: "Sunroof", value: "Standard (Mid+ Trim)" },
    { label: "Airbags", value: "6" },
    { label: "V2L Support", value: "Supported" },
  ],
  fits: [
    { icon: "🚖", title: "Premium Ride-Hailing", desc: "The industry standard for Didi-level ride-hailing. Higher fare categories, more passenger space, and lower running costs than any ICE sedan.", accent: "Industry benchmark" },
    { icon: "📊", title: "Fleet Manager", desc: "Predictable TCO with well-documented maintenance schedules. Parts availability is unmatched — no vehicle out of service for weeks.", accent: "Predictable TCO" },
    { icon: "🏢", title: "Corporate Fleet", desc: "The safe, sensible choice for company car pools. Professional appearance, proven reliability, and strong resale value.", accent: "Corporate standard" },
  ],
  relatedModels: [
    { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" },
    { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" },
    { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" },
    { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" },
  ],
  tags: ["Sedan", "LFP Blade"],
};

export default function Page() {
  return <VehicleDetail data={data} />;
}
