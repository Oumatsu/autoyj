import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Leapmotor",
    name: "Lafa 5",
    fob: "$12,800 - $16,800",
    battery: "67.1 kWh",
    batteryType: "LFP",
    range: "605 km",
    charging: "Next-gen LEAP 3.5 platform — 800V architecture + LiDAR smart driving + 2.5K cockpit",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lafa5-deultra/lafa5%20display.png",
    status: "factory",
    statusText: "Factory Order: 14 Days",
  },
  category: "revenue-king" as const,
  title: "Leapmotor Lafa 5",
  subtitle: "Tech Disruptor",
  heroDesc: "Leapmotor's latest strategic model bringing 800V architecture, LiDAR autonomous driving, and 605km range to the mass market at an incredible price",
  stat1Label: "km CLTC Range", stat1Value: "605",
  stat2Label: "Monthly Saving", stat2Value: "$300",
  stat3Label: "800V", stat3Value: "Platform",
  whyTitle: "Why It Sells",
  whyDesc: "Future-proof technology at a present-day price.",
  features: [
    { icon: "\u26A1", title: "800V Architecture", desc: "30-80% charge in just 18 minutes. 800V platform reduces charging time dramatically." },
    { icon: "\uD83D\uDCF1", title: "8295P Cockpit Chip", desc: "Top-tier Qualcomm Snapdragon 8295P processor with 14.6\" 2.5K display for ultra-responsive infotainment." },
    { icon: "\uD83D\uDEE0\uFE0F", title: "LiDAR Smart Driving", desc: "Optional 128-line LiDAR with 27 sensors enables highway and city NOA functionality." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact Hatchback" }, { label: "Range (CLTC)", value: "515 / 605 km" }, { label: "Battery Capacity", value: "56.2 / 67.1 kWh" }, { label: "Battery Type", value: "LFP (CTC 2.0 Plus)" }, { label: "Motor Power", value: "132 - 160 kW (180 - 218 hp)" }, { label: "Drive Type", value: "Rear-Wheel Drive" }, { label: "0 - 100 km/h", value: "6.4 sec (Max)" }, { label: "Top Speed", value: "185 km/h" }, { label: "DC Fast Charge", value: "~18 min (30% -> 80%)" }, { label: "Drag Coefficient", value: "0.256 Cd" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,430 x 1,880 x 1,520 mm" }, { label: "Wheelbase", value: "2,735 mm" }, { label: "Boot Volume", value: "435 L (1,400 L folded)" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "1.02m² Panoramic (Pro+)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "3.3 kW" },
  ],
  fits: [
    { icon: "\uD83D\uDC68\u200D\uD83D\uDCBB", title: "Tech Enthusiast", desc: "LiDAR, 800V, 8295P chip — cutting-edge tech at an unbeatable price point.", accent: "Future-proof" },
    { icon: "\uD83D\uDE96", title: "Ride-Hailing Driver", desc: "Spacious cabin, fast charging, and 605km range mean more trips, less downtime.", accent: "Max uptime" },
    { icon: "\uD83C\uDFE2", title: "Young Professional", desc: "Sporty design and premium tech attract young buyers seeking style and substance.", accent: "Style meets tech" },
  ],
  relatedModels: [
    { name: "Leapmotor T03", href: "/products/revenue-king/leapmotor-t03" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" }, { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" }, { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" },
  ],
  tags: ["Hatchback", "800V Platform"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lafa5-deultra/lafa5%20detail%20(1).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lafa5-deultra/lafa5%20detail%20(4).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lafa5-deultra/lafa5%20detail%20(1).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lafa5-deultra/lafa5%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/lafa5-deultra/lafa5%20detail%20(2).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$45K - $58K" }, { units: 20, display: "$90K - $116K" }, { units: 50, display: "$225K - $290K" }, { units: 100, display: "$450K - $580K" },
  ],
  batchMargin: { low: "$4,500", high: "$5,800" },
  trimData: [
    { name: "515 Plus", range: "515 km", accel: "8.7 sec", sunroof: "✗ None", airbags: "4", seat: "Fabric", fob: "Lowest" },
    { name: "515 Pro", range: "515 km", accel: "6.4 sec", sunroof: "○ Panoramic", airbags: "6", seat: "Leatherette", fob: "Low" },
    { name: "605 Pro ★", range: "605 km", accel: "6.4 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Mid ★", rec: true },
    { name: "605 Max", range: "605 km", accel: "6.4 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: LFP CTC 2.0+ battery · RWD · 800V architecture · 12-speaker audio.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
