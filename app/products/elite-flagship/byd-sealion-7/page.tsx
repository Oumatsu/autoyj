import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Sealion 7",
    fob: "$27,100 - $34,300",
    battery: "82.5 kWh",
    batteryType: "LFP",
    range: "610 km",
    charging: "[2025 Flagship SUV] e-Platform 3.0 Evo - 23,000 rpm motor + dual-gun fast charge + global flagship",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/sealion/sealion%20display.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "elite-flagship" as const,
  title: "BYD Sealion 7",
  subtitle: "2025 Global Flagship SUV",
  heroDesc: "BYD's newest global flagship SUV targets the Model Y premium segment. e-Platform 3.0 Evo, 23,000 rpm world-leading motor, and dual-gun fast charging technology.",
  stat1Label: "km CLTC Range", stat1Value: "610",
  stat2Label: "Motor RPM", stat2Value: "23K",
  stat3Label: "800V", stat3Value: "Platform",
  whyTitle: "Why It Sells",
  whyDesc: "BYD's global SUV ambassador. The Model Y alternative.",
  features: [
    { icon: "\u26A1", title: "23,000 RPM Motor", desc: "World's fastest mass-production electric motor." },
    { icon: "\uD83D\uDD0C", title: "Dual-Gun Fast Charge", desc: "Plug into two DC chargers simultaneously for double the charging speed." },
    { icon: "\uD83C\uDF0D", title: "Global Flagship Strategy", desc: "Designed for left and right-hand drive markets worldwide." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size SUV" }, { label: "Range (CLTC)", value: "610 km" }, { label: "Battery Capacity", value: "82.5 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "230 kW (313 hp)" }, { label: "Drive Type", value: "RWD / Dual Motor AWD" }, { label: "0 - 100 km/h", value: "6.7 sec" }, { label: "Top Speed", value: "200 km/h" }, { label: "DC Fast Charge", value: "~25 min (10% -> 80%)" }, { label: "Platform", value: "e-Platform 3.0 Evo" },
  ],
  specsRight: [
    { label: "Suspension", value: "Double Wishbone / Multi-Link" }, { label: "Battery Warranty", value: "8 Yrs / 160,000 km" }, { label: "Dimensions (LxWxH)", value: "4,830 x 1,925 x 1,620 mm" }, { label: "Wheelbase", value: "2,930 mm" }, { label: "Boot Volume", value: "500 L" }, { label: "Seating", value: "5 Seats" }, { label: "Sunroof", value: "Panoramic Glass" }, { label: "Screen", value: "15.6\" Rotating" }, { label: "Airbags", value: "9" },
  ],
  fits: [
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", title: "Premium Family", desc: "Spacious 5-seat SUV with class-leading safety.", accent: "Family upgrade" },
    { icon: "\uD83C\uDF0D", title: "Export Market Pioneer", desc: "Engineered for global homologation.", accent: "Global ready" },
    { icon: "\uD83D\uDCBC", title: "Executive Mobility", desc: "Professional presence with BYD reliability.", accent: "Corporate premium" },
  ],
  relatedModels: [
    { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" }, { name: "XPENG G9", href: "/products/elite-flagship/xpeng-g9" }, { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" },
  ],
  tags: ["Premium SUV", "New Launch"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/sealion/sealion%20detail%20(5).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/sealion/sealion%20detail%20(4).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/sealion/sealion%20detail%20(3).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/sealion/sealion%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/sealion/sealion%20detail%20(1).webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$90K - $114K" }, { units: 20, display: "$180K - $228K" }, { units: 50, display: "$450K - $570K" }, { units: 100, display: "$900K - $1.14M" },
  ],
  batchMargin: { low: "$9,000", high: "$11,400" },
};
export default function Page() { return <VehicleDetail data={data} />; }
