import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Xiaomi",
    name: "YU7",
    fob: "$35,400 - $46,200",
    battery: "101 kWh",
    batteryType: "LFP / NCM",
    range: "835 km",
    charging: "[Bestselling Premium SUV] Xiaomi's first SUV — 835 km max range + 3.2s 0-100 + HyperOS + HAD smart driving",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20display.jpg",
    status: "factory",
    statusText: "Factory Order: 33+ Weeks",
  },
  category: "elite-flagship" as const,
  title: "Xiaomi YU7",
  subtitle: "Premium Performance SUV",
  heroDesc: "Xiaomi's first SUV — a high-performance luxury SUV with up to 835 km range, 3.2s 0-100 time, and the full Xiaomi HyperOS ecosystem.",
  stat1Label: "km CLTC Range", stat1Value: "835",
  stat2Label: "0-100 km/h", stat2Value: "3.2s",
  stat3Label: "800V", stat3Value: "Platform",
  whyTitle: "Why It Sells",
  whyDesc: "The most anticipated EV of 2025. Luxury SUV performance with Xiaomi's smart ecosystem and market-defining pricing.",
  features: [
    { icon: "\u26A1", title: "Super 800V Platform", desc: "Ultra-fast charging — 10-80% in 12 minutes. 835 km max range eliminates range anxiety." },
    { icon: "\uD83D\uDCF1", title: "Xiaomi HyperOS", desc: "Full Xiaomi ecosystem integration with 16.1\" central display, HUD, and seamless device connectivity." },
    { icon: "\uD83E\uDD16", title: "HAD Smart Driving", desc: "End-to-end autonomous driving with 700 TOPS computing power and highway/city NOA capability." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Large SUV" }, { label: "Range (CLTC)", value: "770 / 835 km" }, { label: "Battery Capacity", value: "101 kWh" }, { label: "Battery Type", value: "LFP / NCM" }, { label: "Motor Power", value: "235 - 508 kW (320 - 690 hp)" }, { label: "Drive Type", value: "RWD / AWD" }, { label: "0 - 100 km/h", value: "3.2 sec (Max AWD)" }, { label: "Top Speed", value: "253 km/h" }, { label: "DC Fast Charge", value: "~12 min (10% -> 80%)" }, { label: "Drag Coefficient", value: "0.245 Cd" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 160,000 km" }, { label: "Dimensions (LxWxH)", value: "4,999 x 1,996 x 1,600 mm" }, { label: "Wheelbase", value: "3,000 mm" }, { label: "Boot Volume", value: "678 - 1,758 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "8" }, { label: "V2L Support", value: "3.3 kW" },
  ],
  fits: [
    { icon: "\uD83D\uDC51", title: "Premium SUV Buyer", desc: "Luxury, performance, and technology at a price that redefines the segment.", accent: "Category redefined" },
    { icon: "\uD83D\uDDA5\uFE0F", title: "Xiaomi Ecosystem User", desc: "Seamless integration with Xiaomi phones, home devices, and the full HyperOS ecosystem.", accent: "Smart life" },
    { icon: "\uD83D\uDE80", title: "Performance Enthusiast", desc: "3.2s 0-100 with Brembo brakes, air suspension, and sports car DNA.", accent: "SUV supercar" },
  ],
  relatedModels: [
    { name: "Xiaomi SU7 Ultra", href: "/products/elite-flagship/xiaomi-su7-ultra" }, { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" }, { name: "BYD Han EV", href: "/products/elite-flagship/byd-han-ev" }, { name: "XPENG G9", href: "/products/elite-flagship/xpeng-g9" },
  ],
  tags: ["Premium SUV", "800V Platform"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(3).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(1).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(4).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/YU7/YU7%20detail%20(2).png", cat: "Exterior", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$120K - $155K" }, { units: 20, display: "$240K - $310K" }, { units: 50, display: "$600K - $775K" }, { units: 100, display: "$1.2M - $1.55M" },
  ],
  batchMargin: { low: "$12,000", high: "$15,500" },
  trimData: [
    { name: "Standard RWD", range: "835 km", accel: "5.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "Pro AWD", range: "770 km", accel: "4.3 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "Max AWD ★", range: "760 km", accel: "3.2 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Nappa Leather", fob: "Mid ★", rec: true },
    { name: "GT", range: "700 km", accel: "2.8 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa + Alcantara", fob: "Premium" },
  ],
  trimNote: "* 2025 model year. All trims share: Super 800V · Xiaomi HyperOS · HAD smart driving · Air suspension.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
