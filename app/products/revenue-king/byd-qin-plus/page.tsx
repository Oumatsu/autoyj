import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Qin PLUS EV",
    fob: "$17,100 - $20,000",
    battery: "57.6 kWh",
    batteryType: "LFP Blade",
    range: "510 km",
    charging: "1M+ units validated - ultra-low drag + large boot + lowest after-sales costs",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/qinplusev/qinplusev%20display.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "revenue-king" as const,
  title: "BYD Qin PLUS EV",
  subtitle: "The Million-Unit King",
  heroDesc: "The most mature supply chain in the industry. Over one million units validated with ultra-low drag and cavernous boot.",
  stat1Label: "km CLTC Range", stat1Value: "510",
  stat2Label: "Monthly Saving", stat2Value: "$350",
  stat3Label: "Million+", stat3Value: "Built",
  whyTitle: "Why It Sells",
  whyDesc: "Proven at scale. The lowest-risk EV purchase.",
  features: [
    { icon: "\uD83D\uDCE6", title: "Lowest After-Sales Cost", desc: "With 1M+ units on the road, parts are ubiquitous and cheap." },
    { icon: "\uD83C\uDF2C\uFE0F", title: "Ultra-Low Drag (0.21 Cd)", desc: "Aerodynamic efficiency translates directly to real-world range." },
    { icon: "\uD83D\uDCD0", title: "Segment-Leading Boot (450L)", desc: "Ride-hailing drivers need cargo space for airport runs. The Qin delivers." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact Sedan" }, { label: "Range (CLTC)", value: "510 km" }, { label: "Battery Capacity", value: "57.6 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "100 kW (136 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "7.3 sec" }, { label: "Top Speed", value: "160 km/h" }, { label: "DC Fast Charge", value: "~30 min (30% -> 80%)" }, { label: "Drag Coefficient", value: "0.21 Cd" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,765 x 1,837 x 1,495 mm" }, { label: "Wheelbase", value: "2,718 mm" }, { label: "Boot Volume", value: "450 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Standard (Mid+ Trim)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "Supported" },
  ],
  fits: [
    { icon: "\uD83D\uDE96", title: "Premium Ride-Hailing", desc: "The industry standard for Didi-level ride-hailing. Higher fare categories, more passenger space.", accent: "Industry benchmark" },
    { icon: "\uD83D\uDCCA", title: "Fleet Manager", desc: "Predictable TCO with well-documented maintenance schedules.", accent: "Predictable TCO" },
    { icon: "\uD83C\uDFE2", title: "Corporate Fleet", desc: "The safe, sensible choice for company car pools. Professional appearance.", accent: "Corporate standard" },
  ],
  relatedModels: [
    { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" }, { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" }, { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" }, { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" },
  ],
  tags: ["Sedan", "LFP Blade"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/qinplusev/qinplusev%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/qinplusev/qinplusev%20detail%20(2).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/qinplusev/qinplusev%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/qinplusev/qinplusev%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/qinplusev/qinplusev%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$57K - $65K" }, { units: 20, display: "$114K - $130K" }, { units: 50, display: "$285K - $325K" }, { units: 100, display: "$570K - $650K" },
  ],
  batchMargin: { low: "$5,700", high: "$6,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
