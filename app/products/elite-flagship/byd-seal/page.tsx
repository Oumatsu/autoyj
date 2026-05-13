import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Seal",
    fob: "$25,700 - $35,700",
    battery: "82.5 kWh",
    batteryType: "LFP",
    range: "700 km",
    charging: "LiDAR + 800V fast charge - CTB technology + DiPilot 300",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seal/seal%20display.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "elite-flagship" as const,
  title: "BYD Seal",
  subtitle: "The Tesla Fighter",
  heroDesc: "2025 upgrade adds LiDAR and 800V fast charging to BYD's most beautiful sedan. CTB (Cell-to-Body) technology and DiPilot 300 autonomous driving.",
  stat1Label: "km CLTC Range", stat1Value: "700",
  stat2Label: "800V", stat2Value: "Platform",
  stat3Label: "LiDAR", stat3Value: "Smart",
  whyTitle: "Why It Sells",
  whyDesc: "Beautiful. Fast. Smart. The complete sports sedan package.",
  features: [
    { icon: "\uD83D\uDD2D", title: "LiDAR + DiPilot 300", desc: "2025's major upgrade brings roof-mounted LiDAR enabling city and highway navigation assist." },
    { icon: "\u26A1", title: "800V SiC Platform", desc: "10-80% charge in 25 minutes. Class-leading charging speeds and excellent efficiency." },
    { icon: "\uD83C\uDFD7\uFE0F", title: "CTB (Cell-to-Body)", desc: "Battery pack integrated into the body structure increases torsional rigidity 40% vs traditional designs." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size Sport Sedan" }, { label: "Range (CLTC)", value: "700 km" }, { label: "Battery Capacity", value: "82.5 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "230 kW (313 hp)" }, { label: "Drive Type", value: "RWD / Dual Motor AWD" }, { label: "0 - 100 km/h", value: "5.9 sec (RWD)" }, { label: "Top Speed", value: "180 km/h" }, { label: "DC Fast Charge", value: "~25 min (10% -> 80%)" }, { label: "Platform", value: "e-Platform 3.0 Evo" },
  ],
  specsRight: [
    { label: "Suspension", value: "Double Wishbone / 5-Link" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,800 x 1,875 x 1,460 mm" }, { label: "Wheelbase", value: "2,920 mm" }, { label: "Boot Volume", value: "400 L" }, { label: "Seating", value: "5 Seats" }, { label: "Sunroof", value: "Panoramic Glass" }, { label: "Infotainment", value: "15.6\" Rotating Screen" }, { label: "Airbags", value: "9" },
  ],
  fits: [
    { icon: "\uD83C\uDFCE\uFE0F", title: "Driving Enthusiast", desc: "Double-wishbone front suspension and rear-wheel-drive dynamics deliver genuine sports sedan handling.", accent: "Driver's car" },
    { icon: "\uD83D\uDCBC", title: "Executive Commuter", desc: "700 km range eliminates charging stops on most business trips.", accent: "All-day range" },
    { icon: "\uD83C\uDF1F", title: "Design-Conscious Buyer", desc: "Arguably BYD's most beautiful car. The Seal attracts buyers who previously only considered European brands.", accent: "Design leader" },
  ],
  relatedModels: [
    { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" }, { name: "Xiaomi SU7 Ultra", href: "/products/elite-flagship/xiaomi-su7-ultra" }, { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" }, { name: "XPENG G9", href: "/products/elite-flagship/xpeng-g9" },
  ],
  tags: ["Executive Sedan", "800V Platform"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seal/seal%20detail%20(5).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seal/seal%20detail%20(4).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seal/seal%20detail%20(3).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seal/seal%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seal/seal%20detail%20(1).webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$85K - $118K" }, { units: 20, display: "$170K - $236K" }, { units: 50, display: "$425K - $590K" }, { units: 100, display: "$850K - $1.18M" },
  ],
  batchMargin: { low: "$8,500", high: "$11,800" },
};
export default function Page() { return <VehicleDetail data={data} />; }
