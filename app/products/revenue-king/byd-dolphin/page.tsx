import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Dolphin",
    fob: "$14,300 - $18,500",
    battery: "44.9 kWh",
    batteryType: "LFP Blade",
    range: "420 km",
    charging: "2025 comfort suspension - e-Platform 3.0 + heat pump across all trims",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/dolphin/dolphin%20display.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "revenue-king" as const,
  title: "BYD Dolphin",
  subtitle: "2025 Edition",
  heroDesc: "Global brand recognition with 2025 upgraded comfort suspension. e-Platform 3.0 with standard heat pump.",
  stat1Label: "km CLTC Range", stat1Value: "420",
  stat2Label: "Monthly Saving", stat2Value: "$280",
  stat3Label: "e-Platform", stat3Value: "3.0",
  whyTitle: "Why It Sells",
  whyDesc: "Refined and recognised. The Urban EV benchmark.",
  features: [
    { icon: "\uD83D\uDD0B", title: "Heat Pump Standard", desc: "All trims feature a heat pump for superior winter range retention." },
    { icon: "\uD83C\uDF0D", title: "Global Brand Equity", desc: "Dolphin is sold in 50+ countries. Your customers already trust the BYD name." },
    { icon: "\u26A1", title: "e-Platform 3.0", desc: "Dedicated EV platform means integrated battery, efficient packaging, and class-leading cabin space." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Small Hatchback" }, { label: "Range (CLTC)", value: "420 km" }, { label: "Battery Capacity", value: "44.9 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "70 kW (95 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "10.5 sec" }, { label: "Top Speed", value: "150 km/h" }, { label: "DC Fast Charge", value: "~30 min (30% -> 80%)" }, { label: "AC Slow Charge", value: "~7 hrs (0 -> 100%)" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,125 x 1,770 x 1,570 mm" }, { label: "Wheelbase", value: "2,700 mm" }, { label: "Boot Volume", value: "345 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Available (Higher Trims)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "Not Supported" },
  ],
  fits: [
    { icon: "\uD83C\uDFD9\uFE0F", title: "Urban Professional", desc: "The ideal daily driver for professionals who want brand equity and refinement.", accent: "All-round excellence" },
    { icon: "\uD83C\uDFE1", title: "Family Second Car", desc: "Perfect school-run and weekend machine. Low running costs.", accent: "Lowest running costs" },
    { icon: "\uD83D\uDD04", title: "Fleet Upgrader", desc: "Higher resale value and brand trust make fleet rotation easier.", accent: "Strong residual value" },
  ],
  relatedModels: [
    { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" }, { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" }, { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" }, { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" },
  ],
  tags: ["Hatchback", "LFP Blade"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/dolphin/dolphin%20detail%20(3).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/dolphin/dolphin%20detail%20(2).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/dolphin/dolphin%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/dolphin/dolphin%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/dolphin/dolphin%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$48K - $60K" }, { units: 20, display: "$96K - $120K" }, { units: 50, display: "$240K - $300K" }, { units: 100, display: "$480K - $600K" },
  ],
  batchMargin: { low: "$4,800", high: "$6,000" },
};
export default function Page() { return <VehicleDetail data={data} />; }
