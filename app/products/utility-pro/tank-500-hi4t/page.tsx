import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Tank",
    name: "500 Hi4-T",
    fob: "$47,900 - $56,400",
    battery: "37.1 kWh",
    batteryType: "NCM (PHEV)",
    range: "790 km (Ext)",
    charging: "Hardcore off-road PHEV - mechanical 4WD + luxury interior",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20display.jpg",
    status: "factory",
    statusText: "Factory Order: 28 Days",
  },
  category: "utility-pro" as const,
  title: "Tank 500 Hi4-T",
  subtitle: "Off-Road Luxury PHEV",
  heroDesc: "GWM's Tank brand delivers genuine off-road capability with luxury interior - now PHEV. Mechanical 4WD with locking differentials.",
  stat1Label: "km Range (Ext)", stat1Value: "790",
  stat2Label: "Mechanical", stat2Value: "4WD",
  stat3Label: "Off-Road", stat3Value: "Proven",
  whyTitle: "Why It Sells",
  whyDesc: "Real off-road ability. Real luxury. PHEV efficiency.",
  features: [
    { icon: "\uD83D\uDD27", title: "Mechanical 4WD System", desc: "Genuine transfer case, low-range gearing, and locking differentials." },
    { icon: "\uD83D\uDECB\uFE0F", title: "Nappa Leather Luxury", desc: "Massage seats, dual 12.3\" screens, and premium audio." },
    { icon: "\u26A1", title: "PHEV Dual Character", desc: "Silent electric commuting during the week. Unlimited range with 2.0T engine for weekends." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size Off-Road SUV" }, { label: "Range (Ext PHEV)", value: "790 km" }, { label: "Battery Capacity", value: "37.1 kWh" }, { label: "Battery Type", value: "NCM (PHEV)" }, { label: "Engine", value: "2.0T + Dual E-Motors" }, { label: "Drive Type", value: "Mechanical 4WD + Lockers" }, { label: "0 - 100 km/h", value: "6.9 sec" }, { label: "Wading Depth", value: "800 mm" }, { label: "Pure Electric", value: "120 km (NEDC)" }, { label: "Ground Clearance", value: "224 mm" },
  ],
  specsRight: [
    { label: "Suspension", value: "Double Wishbone / Multi-Link" }, { label: "Warranty", value: "5 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,078 x 1,934 x 1,905 mm" }, { label: "Wheelbase", value: "2,850 mm" }, { label: "Seating", value: "5 / 7 Seats" }, { label: "Infotainment", value: "14.6\" + 12.3\" Dual Screen" }, { label: "Audio", value: "Infinity 12-Speaker" }, { label: "Tow Rating", value: "2,500 kg" }, { label: "Airbags", value: "8" },
  ],
  fits: [
    { icon: "\uD83C\uDFD4\uFE0F", title: "Serious Off-Roader", desc: "Ladder frame, mechanical lockers, and 800mm wading depth.", accent: "Trail master" },
    { icon: "\uD83C\uDFDB\uFE0F", title: "Government VIP Transport", desc: "The official vehicle choice for officials in challenging terrain.", accent: "Official transport" },
    { icon: "\uD83C\uDFD5\uFE0F", title: "Luxury Adventurer", desc: "Weekend warrior who refuses to compromise on comfort.", accent: "Adventure in luxury" },
  ],
  relatedModels: [
    { name: "BYD Shark", href: "/products/utility-pro/byd-shark" }, { name: "GWM Cannon EV", href: "/products/utility-pro/gwm-cannon-ev" }, { name: "Radar RD6", href: "/products/utility-pro/radar-rd6" }, { name: "Dongfeng Rich 6 EV", href: "/products/utility-pro/dongfeng-rich-6-ev" },
  ],
  tags: ["Off-Road SUV", "PHEV 4WD"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(7).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(6).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(5).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(4).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(3).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(2).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$158K - $186K" }, { units: 20, display: "$316K - $372K" }, { units: 50, display: "$790K - $930K" }, { units: 100, display: "$1.58M - $1.86M" },
  ],
  batchMargin: { low: "$15,800", high: "$18,600" },
};
export default function Page() { return <VehicleDetail data={data} />; }
