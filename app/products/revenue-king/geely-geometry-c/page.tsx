import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Geely",
    name: "Geometry C",
    fob: "$18,500 - $22,800",
    battery: "70.0 kWh",
    batteryType: "LFP",
    range: "550 km",
    charging: "ME bestseller - exceptional real-world range + extreme heat optimised",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "revenue-king" as const,
  title: "Geely Geometry C",
  subtitle: "Middle East Champion",
  heroDesc: "The veteran that conquered Middle East markets. Exceptional real-world range accuracy and extreme climate optimisation.",
  stat1Label: "km NEDC Range", stat1Value: "550",
  stat2Label: "Monthly Saving", stat2Value: "$320",
  stat3Label: "Heat", stat3Value: "Optimised",
  whyTitle: "Why It Sells",
  whyDesc: "Built for the heat. Proven in the world's toughest climates.",
  features: [
    { icon: "\uD83C\uDF21\uFE0F", title: "Extreme Heat Optimised", desc: "Battery thermal management system engineered for 45-degree C+ ambient temperatures." },
    { icon: "\uD83D\uDEE3\uFE0F", title: "L2 Driving Assistance", desc: "Adaptive cruise and lane centring reduce driver fatigue on long highway stretches." },
    { icon: "\uD83C\uDFC6", title: "Proven Export Record", desc: "Top-selling Chinese EV in multiple Middle Eastern markets for 3 consecutive years." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact SUV" }, { label: "Range (NEDC)", value: "550 km" }, { label: "Battery Capacity", value: "70.0 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "150 kW (204 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "7.0 sec" }, { label: "Top Speed", value: "170 km/h" }, { label: "DC Fast Charge", value: "~30 min (30% -> 80%)" }, { label: "Range Accuracy", value: "More than 90% Real-World" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,432 x 1,833 x 1,560 mm" }, { label: "Wheelbase", value: "2,700 mm" }, { label: "Boot Volume", value: "340 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Panoramic (Optional)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "Not Supported" },
  ],
  fits: [
    { icon: "\uD83C\uDF0D", title: "Hot-Climate Fleet", desc: "The undisputed champion for Middle East and North African markets.", accent: "Heat-proof" },
    { icon: "\uD83D\uDE95", title: "Inter-City Taxi", desc: "High real-world range accuracy means drivers can plan routes confidently.", accent: "Long-haul ready" },
    { icon: "\uD83D\uDCCA", title: "Government Fleet", desc: "Established service network makes this the lowest-risk EV for government procurement.", accent: "Govt. approved" },
  ],
  relatedModels: [
    { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" }, { name: "GAC Aion Y Plus", href: "/products/revenue-king/gac-aion-y-plus" }, { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" }, { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" },
  ],
  tags: ["Compact SUV", "Hot Climate"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20detail%20(5).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20detail%20(1).png", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/geometryc/geometryc%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$62K - $75K" }, { units: 20, display: "$124K - $150K" }, { units: 50, display: "$310K - $375K" }, { units: 100, display: "$620K - $750K" },
  ],
  batchMargin: { low: "$6,200", high: "$7,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
