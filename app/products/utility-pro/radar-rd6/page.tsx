import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Radar",
    name: "RD6",
    fob: "$20,800 - $38,400",
    battery: "86.0 kWh",
    batteryType: "LFP",
    range: "520 km",
    charging: "6 kW V2L + SUV-grade comfort",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20display.webp",
    status: "in-stock",
    statusText: "In Stock: Hangzhou",
  },
  category: "utility-pro" as const,
  title: "Radar RD6",
  subtitle: "Premium EV Pickup",
  heroDesc: "Geely's Radar brand redefines the pickup as a premium EV. 6 kW V2L export, SUV-quality ride comfort.",
  stat1Label: "km NEDC Range", stat1Value: "520",
  stat2Label: "Op Cost vs Diesel", stat2Value: "80% less",
  stat3Label: "V2L", stat3Value: "6 kW",
  whyTitle: "Why It Sells",
  whyDesc: "Pickup capability with SUV comfort at 1/5 the running cost.",
  features: [
    { icon: "\uD83D\uDD0C", title: "6 kW V2L Power Export", desc: "The most powerful V2L in any pickup. Run welders, construction equipment." },
    { icon: "\uD83D\uDECB\uFE0F", title: "SUV-Grade Comfort", desc: "Coil spring rear suspension delivers genuine SUV ride quality." },
    { icon: "\uD83C\uDF92", title: "Large Frunk", desc: "70L front trunk for secure, weatherproof storage." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size Pickup" }, { label: "Range (NEDC)", value: "520 km" }, { label: "Battery Capacity", value: "86 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "200 kW (272 hp)" }, { label: "Drive Type", value: "Rear-Wheel Drive" }, { label: "0 - 100 km/h", value: "6.9 sec" }, { label: "Top Speed", value: "185 km/h" }, { label: "DC Fast Charge", value: "~30 min (30% -> 80%)" }, { label: "Ground Clearance", value: "195 mm" },
  ],
  specsRight: [
    { label: "Payload", value: "865 kg" }, { label: "Warranty", value: "5 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,260 x 1,900 x 1,830 mm" }, { label: "Wheelbase", value: "3,120 mm" }, { label: "Cargo Bed", value: "1,525 x 1,450 x 540 mm" }, { label: "Frunk Volume", value: "70 L" }, { label: "Seating", value: "5 Seats" }, { label: "Sunroof", value: "Standard" }, { label: "V2L", value: "6 kW Standard" },
  ],
  fits: [
    { icon: "\uD83C\uDFD7\uFE0F", title: "Premium Worksite Vehicle", desc: "6 kW V2L powers tools on site. SUV comfort for the commute home.", accent: "Premium workhorse" },
    { icon: "\uD83C\uDFD5\uFE0F", title: "Outdoor Lifestyle", desc: "V2L camping, frunk for gear, and a comfortable cabin for road trips.", accent: "Lifestyle pickup" },
    { icon: "\uD83C\uDFE2", title: "Estate Management", desc: "Quiet electric operation ideal for high-end estates, resorts, and golf courses.", accent: "Estate-grade quiet" },
  ],
  relatedModels: [
    { name: "Dongfeng Rich 6 EV", href: "/products/utility-pro/dongfeng-rich-6-ev" }, { name: "GWM Cannon EV", href: "/products/utility-pro/gwm-cannon-ev" }, { name: "BYD Shark", href: "/products/utility-pro/byd-shark" }, { name: "Tank 500 Hi4-T", href: "/products/utility-pro/tank-500-hi4t" },
  ],
  tags: ["Pickup Truck", "Lifestyle"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20detail%20(3).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20detail%20(2).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20detail%20(1).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/RD6/RD6%20detail%20(1).jpeg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$69K - $127K" }, { units: 20, display: "$138K - $254K" }, { units: 50, display: "$345K - $635K" }, { units: 100, display: "$690K - $1.27M" },
  ],
  batchMargin: { low: "$6,900", high: "$12,700" },
};
export default function Page() { return <VehicleDetail data={data} />; }
