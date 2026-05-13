import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Shark",
    fob: "$55,200 - $59,500",
    battery: "29.6 kWh",
    batteryType: "LFP (PHEV)",
    range: "840 km (Ext)",
    charging: "[2025 Global Spotlight] DMO off-road platform - high-power V2L export + 1,000 km+ range, 50-60% fuel savings",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20display.png",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "utility-pro" as const,
  title: "BYD Shark",
  subtitle: "The PHEV Pickup King",
  heroDesc: "The pickup that changes everything. DMO off-road platform, 3.3 kW V2L mobile power station, and 840 km+ range with 50-60% fuel savings.",
  stat1Label: "km Range (Ext)", stat1Value: "840",
  stat2Label: "Fuel Saved", stat2Value: "60%",
  stat3Label: "V2L", stat3Value: "3.3 kW",
  whyTitle: "Why It Sells",
  whyDesc: "The diesel killer. All the capability, none of the fuel bill.",
  features: [
    { icon: "\u26A1", title: "PHEV Powertrain", desc: "1.5T engine + dual electric motors output 430 hp. 5.7 sec 0-100 km/h." },
    { icon: "\uD83D\uDD0C", title: "3.3 kW V2L Mobile Generator", desc: "Power tools, campsites, emergency equipment." },
    { icon: "\uD83C\uDFD4\uFE0F", title: "DMO Off-Road Platform", desc: "Dual Mode Off-Road with virtual differential locks. Intelligent torque distribution." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size Pickup" }, { label: "Range (NEDC Ext)", value: "840 km" }, { label: "Battery Capacity", value: "29.6 kWh" }, { label: "Battery Type", value: "LFP Blade (PHEV)" }, { label: "System Power", value: "321 kW (436 hp)" }, { label: "Drive Type", value: "Dual Motor 4WD" }, { label: "0 - 100 km/h", value: "5.7 sec" }, { label: "Payload", value: "835 kg" }, { label: "Towing Capacity", value: "2,500 kg" }, { label: "Fuel Economy", value: "7.5L/100km (HEV)" },
  ],
  specsRight: [
    { label: "Ground Clearance", value: "210 mm (Loaded)" }, { label: "Warranty", value: "6 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,457 x 1,971 x 1,925 mm" }, { label: "Wheelbase", value: "3,260 mm" }, { label: "Cargo Bed", value: "1,450 L" }, { label: "Approach Angle", value: "31 deg" }, { label: "Departure Angle", value: "19.3 deg" }, { label: "Seating", value: "5 Seats" }, { label: "V2L", value: "3.3 kW Standard" },
  ],
  fits: [
    { icon: "\uD83C\uDFD7\uFE0F", title: "Construction & Mining", desc: "Replace diesel pickups and generators with one vehicle.", accent: "Job site ready" },
    { icon: "\uD83C\uDFD5\uFE0F", title: "Overland Explorer", desc: "V2L powers the campsite. PHEV range reaches remote trails.", accent: "Overland king" },
    { icon: "\uD83C\uDFDB\uFE0F", title: "Government Fleet", desc: "Dramatically lower fuel and maintenance costs vs diesel Hilux/Ranger fleets.", accent: "Fleet transformer" },
  ],
  relatedModels: [
    { name: "Radar RD6", href: "/products/utility-pro/radar-rd6" }, { name: "GWM Cannon EV", href: "/products/utility-pro/gwm-cannon-ev" }, { name: "Tank 500 Hi4-T", href: "/products/utility-pro/tank-500-hi4t" }, { name: "Dongfeng Rich 6 EV", href: "/products/utility-pro/dongfeng-rich-6-ev" },
  ],
  tags: ["Pickup Truck", "PHEV"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20detail%20(4).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20detail%20(3).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20detail%20(2).jpeg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20detail%20(1).webp", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/shark/shark%20detail%20(1).jpeg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$182K - $197K" }, { units: 20, display: "$364K - $394K" }, { units: 50, display: "$910K - $985K" }, { units: 100, display: "$1.82M - $1.97M" },
  ],
  batchMargin: { low: "$18,200", high: "$19,700" },
};
export default function Page() { return <VehicleDetail data={data} />; }
