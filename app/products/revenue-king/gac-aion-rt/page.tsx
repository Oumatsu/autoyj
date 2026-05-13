import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "GAC Aion",
    name: "RT",
    fob: "$14,300 - $23,700",
    battery: "55.1 kWh",
    batteryType: "LFP",
    range: "520 km",
    charging: "[2025 New King] LiDAR smart driving + executive rear legroom + 400V fast charge",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20display.jpg",
    status: "factory",
    statusText: "Factory Order: 14 Days",
  },
  category: "revenue-king" as const,
  title: "GAC Aion RT",
  subtitle: "2025 New King",
  heroDesc: "Aion's latest global strategic vehicle bringing LiDAR autonomous driving to the affordable segment. Executive-grade rear legroom with 400V fast charging.",
  stat1Label: "km CLTC Range", stat1Value: "520",
  stat2Label: "Monthly Saving", stat2Value: "$380",
  stat3Label: "LiDAR", stat3Value: "Smart",
  whyTitle: "Why It Sells",
  whyDesc: "The 2025 disruptor. LiDAR autonomy at a mass-market price.",
  features: [
    { icon: "\uD83D\uDC41\uFE0F", title: "LiDAR Smart Driving", desc: "Segment-first LiDAR sensor enables highway NOA and city memory pilot." },
    { icon: "\uD83D\uDECB\uFE0F", title: "Executive Rear Legroom", desc: "2,775 mm wheelbase delivers rear kneeroom that rivals the Toyota Camry." },
    { icon: "\u26A1", title: "400V Fast Charge", desc: "30-80% in 18 minutes on a DC fast charger. Minimal downtime between shifts." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact Sedan" }, { label: "Range (CLTC)", value: "520 km" }, { label: "Battery Capacity", value: "55.1 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "150 kW (204 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "7.5 sec" }, { label: "Top Speed", value: "163 km/h" }, { label: "DC Fast Charge", value: "~18 min (30% -> 80%)" }, { label: "Drag Coeff", value: "0.208 Cd" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Warranty", value: "4 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,865 x 1,875 x 1,520 mm" }, { label: "Wheelbase", value: "2,775 mm" }, { label: "Boot Volume", value: "540 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Standard" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "Not Supported" },
  ],
  fits: [
    { icon: "\uD83D\uDE96", title: "Premium Ride-Hailing", desc: "LiDAR autonomy reduces driver fatigue on long shifts.", accent: "Future-proof fleet" },
    { icon: "\uD83C\uDFE2", title: "Corporate Leasing", desc: "Advanced tech package at an accessible price.", accent: "Tech-forward image" },
    { icon: "\uD83D\uDC68\u200D\uD83D\uDCBC", title: "Sales Professional", desc: "Highway NOA means arriving fresh at client meetings.", accent: "Arrive fresh" },
  ],
  relatedModels: [
    { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" }, { name: "GAC Aion Y Plus", href: "/products/revenue-king/gac-aion-y-plus" }, { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" },
  ],
  tags: ["Sedan", "LiDAR Smart"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(5).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(4).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(3).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(1).webp", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RT/RT%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$48K - $78K" }, { units: 20, display: "$96K - $156K" }, { units: 50, display: "$240K - $390K" }, { units: 100, display: "$480K - $780K" },
  ],
  batchMargin: { low: "$4,800", high: "$7,800" },
};
export default function Page() { return <VehicleDetail data={data} />; }
