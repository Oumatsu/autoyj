import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Geely",
    name: "Geome",
    fob: "$10,000 - $13,800",
    battery: "40.16 kWh",
    batteryType: "LFP",
    range: "410 km",
    charging: "Smart electric hatchback — Flyme Auto connectivity + 36 storage compartments + 540° camera",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Star/Geome%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "revenue-king" as const,
  title: "Geely Geome",
  subtitle: "Smart Urban Hatch",
  heroDesc: "A cleverly designed electric hatchback with Flyme Auto smart connectivity, generous interior space, and 36 clever storage compartments.",
  stat1Label: "km CLTC Range", stat1Value: "410",
  stat2Label: "Monthly Saving", stat2Value: "$200",
  stat3Label: "70L", stat3Value: "Frunk",
  whyTitle: "Why It Sells",
  whyDesc: "Smart storage meets smart driving. The urban commuter's best friend.",
  features: [
    { icon: "\uD83D\uDCF1", title: "Flyme Auto Connectivity", desc: "Seamless smartphone integration with Carlink, Flyme Link, and HUAWEI HiCar support." },
    { icon: "\uD83E\uDDF8", title: "36 Storage Compartments", desc: "Class-leading number of clever cubbies and compartments including a 70L front trunk." },
    { icon: "\uD83D\uDCF7", title: "540° Camera System", desc: "Transparent底盘 view gives you a complete picture of your surroundings for confident parking." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact Hatchback" }, { label: "Range (CLTC)", value: "410 km" }, { label: "Battery Capacity", value: "40.16 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "85 kW (116 hp)" }, { label: "Drive Type", value: "Rear-Wheel Drive" }, { label: "0 - 100 km/h", value: "11.2 sec" }, { label: "Top Speed", value: "135 km/h" }, { label: "DC Fast Charge", value: "~21 min (30% -> 80%)" }, { label: "Boot Volume", value: "375 L (1,320 L folded)" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,135 x 1,805 x 1,570 mm" }, { label: "Wheelbase", value: "2,650 mm" }, { label: "Frunk Volume", value: "70 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Available (Higher Trims)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "3.3 kW" },
  ],
  fits: [
    { icon: "\uD83C\uDFE0", title: "Urban Commuter", desc: "Perfect daily driver with enough range for a week of city driving.", accent: "City optimised" },
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC66", title: "Small Family", desc: "Plenty of storage and 5-seat capacity make it practical for family errands.", accent: "Family ready" },
    { icon: "\uD83D\uDECD\uFE0F", title: "First EV Buyer", desc: "Affordable entry point with smart technology and a trusted brand.", accent: "Smart starter" },
  ],
  relatedModels: [
    { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" }, { name: "Geely Geometry C", href: "/products/revenue-king/geely-geometry-c" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" }, { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" },
  ],
  tags: ["Hatchback", "Smart Connectivity"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Star/Geome%20detail%20(1).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Star/Geome%20detail%20(2).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Star/Geome%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Star/Geome%20detail%20(4).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Star/Geome%20detail%20(5).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$33K - $45K" }, { units: 20, display: "$66K - $90K" }, { units: 50, display: "$165K - $225K" }, { units: 100, display: "$330K - $450K" },
  ],
  batchMargin: { low: "$3,300", high: "$4,500" },
  trimData: [
    { name: "Youth", range: "310 km", accel: "12.5 sec", sunroof: "✗ None", airbags: "4", seat: "Fabric", fob: "Lowest" },
    { name: "Dream", range: "310 km", accel: "12.5 sec", sunroof: "○ Optional", airbags: "4", seat: "Fabric", fob: "Low" },
    { name: "Freedom ★", range: "410 km", accel: "11.2 sec", sunroof: "○ Optional", airbags: "6", seat: "Leatherette", fob: "Mid ★", rec: true },
    { name: "Exploration+", range: "410 km", accel: "11.2 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "PVC Leather", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: LFP battery · RWD · Smart connectivity · 36 storage compartments.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
