import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "GWM",
    name: "Cannon EV",
    fob: "$32,700 - $44,100",
    battery: "37.1 kWh",
    batteryType: "NCM (HEV/PHEV)",
    range: "1,000 km (Ext)",
    charging: "Tank chassis + ultra-rugged body + proven off-road",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20display.jpg",
    status: "factory",
    statusText: "Factory Order: 28 Days",
  },
  category: "utility-pro" as const,
  title: "GWM Cannon EV",
  subtitle: "The Rugged Hybrid",
  heroDesc: "Great Wall Motors' legendary pickup platform goes hybrid. Tank-derived chassis, combat-proven reliability, and 1,000 km extended range.",
  stat1Label: "km Range (Ext)", stat1Value: "1,000",
  stat2Label: "Tank", stat2Value: "Chassis",
  stat3Label: "Overseas", stat3Value: "Proven",
  whyTitle: "Why It Sells",
  whyDesc: "Tank-tough. Battle-proven. The pickup that refuses to break.",
  features: [
    { icon: "\uD83C\uDFD7\uFE0F", title: "Tank-Derived Chassis", desc: "Shares its platform with GWM's military-grade Tank series." },
    { icon: "\uD83C\uDF0D", title: "Global Export Champion", desc: "GWM pickups are sold in 60+ countries with established parts and service networks." },
    { icon: "\u26FD", title: "1,000 km HEV Range", desc: "Hybrid system eliminates range anxiety for remote operations." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size Pickup" }, { label: "Range (HEV Ext)", value: "1,000 km" }, { label: "Battery", value: "37.1 kWh (HEV/PHEV)" }, { label: "Battery Type", value: "NCM" }, { label: "Engine", value: "2.0T + E-Motor" }, { label: "Drive Type", value: "4WD with Lockers" }, { label: "0 - 100 km/h", value: "7.5 sec" }, { label: "Ground Clearance", value: "230 mm" }, { label: "Wading Depth", value: "700 mm" }, { label: "Towing", value: "3,000 kg" },
  ],
  specsRight: [
    { label: "Payload", value: "~1,000 kg" }, { label: "Warranty", value: "5 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,440 x 1,991 x 1,924 mm" }, { label: "Wheelbase", value: "3,230 mm" }, { label: "Cargo Bed", value: "1,520 x 1,520 x 500 mm" }, { label: "Approach/Departure", value: "30 deg / 23 deg" }, { label: "Seating", value: "5 Seats" }, { label: "Spare Tyre", value: "Full-Size Under-Bed" }, { label: "Airbags", value: "6" },
  ],
  fits: [
    { icon: "\u26CF\uFE0F", title: "Mining Operations", desc: "Designed for the world's harshest environments.", accent: "Mining-ready" },
    { icon: "\uD83C\uDFDB\uFE0F", title: "Government & Military", desc: "GWM's military heritage makes the Cannon the natural choice.", accent: "Govt. approved" },
    { icon: "\uD83C\uDF3E", title: "Agricultural Enterprise", desc: "Hybrid efficiency for farm operations with the capability to handle rough terrain.", accent: "Farm tough" },
  ],
  relatedModels: [
    { name: "BYD Shark", href: "/products/utility-pro/byd-shark" }, { name: "Tank 500 Hi4-T", href: "/products/utility-pro/tank-500-hi4t" }, { name: "Dongfeng Rich 6 EV", href: "/products/utility-pro/dongfeng-rich-6-ev" }, { name: "Radar RD6", href: "/products/utility-pro/radar-rd6" },
  ],
  tags: ["Pickup Truck", "Military Grade"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(7).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(6).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(5).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(2).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(1).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/cannonev/cannonev%20detail%20(4).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$108K - $146K" }, { units: 20, display: "$216K - $292K" }, { units: 50, display: "$540K - $730K" }, { units: 100, display: "$1.08M - $1.46M" },
  ],
  batchMargin: { low: "$10,800", high: "$14,600" },
};
export default function Page() { return <VehicleDetail data={data} />; }
