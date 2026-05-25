import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Dongfeng",
    name: "Rich 6 EV",
    fob: "$20,700 - $28,500",
    battery: "68.8 kWh",
    batteryType: "LFP",
    range: "350 km",
    charging: "Classic rugged EV pickup - Nissan Navara platform + high clearance",
    img: "/pic/utility-pro/rich6ev/7.webp",
    status: "in-stock",
    statusText: "In Stock: Wuhan",
  },
  category: "utility-pro" as const,
  title: "Dongfeng Rich 6 EV",
  subtitle: "The Rugged Workhorse",
  heroDesc: "Built on the proven Nissan Navara platform, the Rich 6 EV brings legendary reliability to electric power",
  stat1Label: "km NEDC Range", stat1Value: "350",
  stat2Label: "Platform", stat2Value: "Navara",
  stat3Label: "Mining", stat3Value: "Proven",
  whyTitle: "Why It Sells",
  whyDesc: "Navara bones. Electric heart. The mining industry's favourite EV.",
  features: [
    { icon: "\uD83C\uDFD7\uFE0F", title: "Nissan Navara Platform", desc: "Shared architecture with one of the world's most reliable pickups." },
    { icon: "\u26CF\uFE0F", title: "Mining-Grade Reliability", desc: "Dust-proof battery and motor sealing for extreme environments." },
    { icon: "\uD83D\uDD27", title: "Mature Aftermarket", desc: "Navara platform means widespread parts availability globally." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size Pickup" }, { label: "Range (NEDC)", value: "350 km" }, { label: "Battery Capacity", value: "68.8 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "120 kW (163 hp)" }, { label: "Drive Type", value: "Rear-Wheel Drive" }, { label: "Top Speed", value: "120 km/h" }, { label: "Ground Clearance", value: "215 mm" }, { label: "DC Fast Charge", value: "~45 min (10% -> 80%)" }, { label: "AC Slow Charge", value: "~10 hrs" },
  ],
  specsRight: [
    { label: "Payload", value: "~800 kg" }, { label: "Warranty", value: "5 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,310 x 1,850 x 1,820 mm" }, { label: "Wheelbase", value: "3,150 mm" }, { label: "Cargo Bed", value: "1,510 x 1,560 x 475 mm" }, { label: "Approach/Departure", value: "30 deg / 24 deg" }, { label: "Seating", value: "5 Seats" }, { label: "Spare Parts", value: "Global Navara Network" }, { label: "Airbags", value: "2" },
  ],
  fits: [
    { icon: "\u26CF\uFE0F", title: "Mining Operations", desc: "Dust-sealed, high ground clearance, and Navara reliability.", accent: "Mine certified" },
    { icon: "\uD83C\uDFD7\uFE0F", title: "Construction Site", desc: "Silent electric operation for urban construction sites.", accent: "Site approved" },
    { icon: "\uD83D\uDD27", title: "Fleet Maintainer", desc: "Navara parts availability means your mechanics already know this vehicle.", accent: "Mechanic friendly" },
  ],
  relatedModels: [
    { name: "GWM Cannon EV", href: "/products/utility-pro/gwm-cannon-ev" }, { name: "Radar RD6", href: "/products/utility-pro/radar-rd6" }, { name: "BYD Shark", href: "/products/utility-pro/byd-shark" }, { name: "Tank 500 Hi4-T", href: "/products/utility-pro/tank-500-hi4t" },
  ],
  tags: ["Pickup Truck", "Industrial"],
  galleryImages: [
    { src: "/pic/utility-pro/rich6ev/1.webp", cat: "Exterior", label: "" },
    { src: "/pic/utility-pro/rich6ev/6.webp", cat: "Exterior", label: "" },
    { src: "/pic/utility-pro/rich6ev/3.webp", cat: "Interior", label: "" },
    { src: "/pic/utility-pro/rich6ev/2.webp", cat: "Interior", label: "" },
    { src: "/pic/utility-pro/rich6ev/4.webp", cat: "Detail", label: "" },
    { src: "/pic/utility-pro/rich6ev/5.webp", cat: "Detail", label: "" },
    { src: "/pic/utility-pro/rich6ev/0.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$69K - $94K" }, { units: 20, display: "$138K - $188K" }, { units: 50, display: "$345K - $470K" }, { units: 100, display: "$690K - $940K" },
  ],
  batchMargin: { low: "$6,900", high: "$9,400" },
  trimData: [
    { name: "Standard", range: "260 km", accel: "12.0 sec", sunroof: "✗ None", airbags: "2", seat: "Vinyl", fob: "Lowest" },
    { name: "Comfort", range: "350 km", accel: "10.5 sec", sunroof: "✗ None", airbags: "2", seat: "Fabric", fob: "Low" },
    { name: "Premium", range: "350 km", accel: "10.5 sec", sunroof: "✗ None", airbags: "4", seat: "Leatherette", fob: "Mid ★", rec: true },
    { name: "Flagship AWD", range: "320 km", accel: "9.8 sec", sunroof: "✗ None", airbags: "4", seat: "Leatherette", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: Nissan Navara platform · LFP battery · High clearance · FWD/RWD.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
