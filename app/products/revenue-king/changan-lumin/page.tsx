import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Changan",
    name: "Lumin",
    fob: "$5,400 - $8,800",
    battery: "27.9 kWh",
    batteryType: "LFP",
    range: "301 km",
    charging: "Premium quality at entry price - high-strength steel + flexible charging",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lumin/lumin%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Chongqing",
  },
  category: "revenue-king" as const,
  title: "Changan Lumin",
  subtitle: "Premium Micro EV",
  heroDesc: "Ultra-affordable without feeling cheap. High-strength steel body, cute design, and flexible charging options.",
  stat1Label: "km Range", stat1Value: "301",
  stat2Label: "Monthly Saving", stat2Value: "$150",
  stat3Label: "From", stat3Value: "$5.4K",
  whyTitle: "Why It Sells",
  whyDesc: "Maximum value, minimum footprint. Premium feel at bottom price.",
  features: [
    { icon: "\uD83D\uDCAA", title: "High-Strength Steel", desc: "60%+ high-strength steel in the body structure - unusual at this price point." },
    { icon: "\uD83D\uDD0C", title: "Flexible Charging", desc: "Standard 220V household socket charges overnight. No special charger installation needed." },
    { icon: "\uD83C\uDF80", title: "Irresistible Design", desc: "Cute, rounded aesthetics with 7 colour options that drive showroom traffic." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Micro Hatchback" }, { label: "Range (NEDC)", value: "301 km" }, { label: "Battery Capacity", value: "27.9 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "35 kW (48 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 50 km/h", value: "6.5 sec" }, { label: "Top Speed", value: "101 km/h" }, { label: "Slow Charge", value: "~8 hrs (0 -> 100%)" }, { label: "Turning Radius", value: "4.5 m" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V (Standard)" }, { label: "Battery Warranty", value: "8 Yrs / 120,000 km" }, { label: "Dimensions (LxWxH)", value: "3,270 x 1,700 x 1,545 mm" }, { label: "Wheelbase", value: "1,980 mm" }, { label: "Boot Volume", value: "104 L" }, { label: "Seating Capacity", value: "4 Seats" }, { label: "Infotainment", value: "7\" Digital Cluster" }, { label: "Airbags", value: "2" }, { label: "High-Strength Steel", value: "60%+" },
  ],
  fits: [
    { icon: "\uD83C\uDFE0", title: "Family Second Car", desc: "The ultimate second vehicle. Park it anywhere, charge it from any socket.", accent: "Ideal 2nd car" },
    { icon: "\uD83C\uDF93", title: "Student Transport", desc: "Affordable enough for parents buying a first car for university-bound children.", accent: "Student favourite" },
    { icon: "\uD83C\uDFD8\uFE0F", title: "Senior Mobility", desc: "Easy entry/exit, simple controls, and compact dimensions.", accent: "Senior friendly" },
  ],
  relatedModels: [
    { name: "Wuling Bingo Plus", href: "/products/revenue-king/wuling-bingo-plus" }, { name: "Leapmotor T03", href: "/products/revenue-king/leapmotor-t03" }, { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" },
  ],
  tags: ["Micro EV", "Budget Hero"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lumin/lumin%20detail%20(2).jpeg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lumin/lumin%20detail%20(1).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lumin/lumin%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lumin/lumin%20detail%20(1).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lumin/lumin%20detail%20(1).jpeg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$19K - $28K" }, { units: 20, display: "$38K - $56K" }, { units: 50, display: "$95K - $140K" }, { units: 100, display: "$190K - $280K" },
  ],
  batchMargin: { low: "$1,900", high: "$2,800" },
};
export default function Page() { return <VehicleDetail data={data} />; }
