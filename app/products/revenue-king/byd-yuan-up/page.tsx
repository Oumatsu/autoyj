import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Yuan UP",
    fob: "$10,200 - $16,700",
    battery: "45.12 kWh",
    batteryType: "LFP Blade",
    range: "401 km",
    charging: "Best-selling compact SUV — DiLink smart cockpit + Blade Battery + V2L + 360° camera",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/yuanup/yuanup%20display.png",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "revenue-king" as const,
  title: "BYD Yuan UP",
  subtitle: "Bestselling Compact SUV",
  heroDesc: "BYD's popular compact electric SUV combining Blade Battery safety with DiLink smart systems. The perfect package for first-time EV buyers and urban fleets.",
  stat1Label: "km CLTC Range", stat1Value: "401",
  stat2Label: "Monthly Saving", stat2Value: "$250",
  stat3Label: "e-Platform", stat3Value: "3.0",
  whyTitle: "Why It Sells",
  whyDesc: "Trusted brand, proven platform, unbeatable value.",
  features: [
    { icon: "\uD83D\uDD0B", title: "Blade Battery Safety", desc: "BYD's proprietary LFP Blade Battery passes nail penetration test with zero thermal runaway." },
    { icon: "\uD83D\uDDA5\uFE0F", title: "DiLink Smart Cockpit", desc: "10.1-12.8\" rotating touchscreen with voice control, OTA updates, and app ecosystem." },
    { icon: "\u26A1", title: "V2L Power Export", desc: "3.3 kW vehicle-to-load capability turns your car into a mobile power station." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Sub-Compact SUV" }, { label: "Range (CLTC)", value: "301 / 401 / 505 km" }, { label: "Battery Capacity", value: "32 / 45.12 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "70 - 130 kW (95 - 177 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "7.9 - 12.0 sec" }, { label: "Top Speed", value: "160 km/h" }, { label: "DC Fast Charge", value: "~30 min (30% -> 80%)" }, { label: "Max Fast Charge", value: "65 kW" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,310 x 1,830 x 1,675 mm" }, { label: "Wheelbase", value: "2,620 mm" }, { label: "Boot Volume", value: "1,320 L (Seats Folded)" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Available (Higher Trims)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "3.3 kW" },
  ],
  fits: [
    { icon: "\uD83C\uDFE0", title: "Young Family", desc: "Compact SUV size with spacious interior and top safety ratings.", accent: "Family approved" },
    { icon: "\uD83D\uDE96", title: "Ride-Hailing Fleet", desc: "Low running costs and trusted brand reputation attract more riders.", accent: "Fleet favourite" },
    { icon: "\uD83D\uDC69\u200D\uD83C\uDF93", title: "First-Time EV Owner", desc: "Accessible price with full BYD after-sales network for peace of mind.", accent: "Worry-free entry" },
  ],
  relatedModels: [
    { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" }, { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" }, { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" }, { name: "GAC Aion Y Plus", href: "/products/revenue-king/gac-aion-y-plus" },
  ],
  tags: ["Compact SUV", "LFP Blade"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/yuanup/yuanup%20detail%20(3).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/yuanup/yuanup%20detail%20(2).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/yuanup/yuanup%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/yuanup/yuanup%20detail%20(1).jpeg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/yuanup/yuanup%20detail%20(4).png", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$35K - $55K" }, { units: 20, display: "$70K - $110K" }, { units: 50, display: "$175K - $275K" }, { units: 100, display: "$350K - $550K" },
  ],
  batchMargin: { low: "$3,500", high: "$5,500" },
  trimData: [
    { name: "Leading", range: "301 km", accel: "12.0 sec", sunroof: "✗ None", airbags: "4", seat: "Fabric", fob: "Lowest" },
    { name: "Vitality", range: "401 km", accel: "7.9 sec", sunroof: "○ Optional", airbags: "6", seat: "Fabric", fob: "Low" },
    { name: "Leading ★", range: "401 km", accel: "7.9 sec", sunroof: "✓ Standard", airbags: "6", seat: "Leatherette", fob: "Mid ★", rec: true },
    { name: "Beyond", range: "401 km", accel: "7.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Full Leather", fob: "Premium" },
  ],
  trimNote: "* 2025 model year. All trims share: LFP Blade battery · FWD · DiLink cockpit · 8-yr battery warranty.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
