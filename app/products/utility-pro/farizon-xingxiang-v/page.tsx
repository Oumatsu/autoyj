import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Farizon",
    name: "Xingxiang V",
    fob: "$14,800 - $19,500",
    battery: "41.9 kWh",
    batteryType: "LFP",
    range: "260 km",
    charging: "Farizon urban delivery champ - 6 m3 cargo",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/xingxiangv/xingxiangv%20display.webp",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "utility-pro" as const,
  title: "Farizon Xingxiang V",
  subtitle: "Urban Delivery Champion",
  heroDesc: "Geely Farizon's urban delivery champion. 6 m3 cargo bay, nearly zero failure rate in real-world fleet operations.",
  stat1Label: "km NEDC Range", stat1Value: "260",
  stat2Label: "Cargo", stat2Value: "6 m3",
  stat3Label: "Monthly Saving", stat3Value: "$425",
  whyTitle: "Why It Sells",
  whyDesc: "The reliable workhorse. Proven in thousands of delivery fleets.",
  features: [
    { icon: "\u2705", title: "Near-Zero Failure Rate", desc: "Extensive real-world fleet data shows class-leading reliability." },
    { icon: "\uD83D\uDD27", title: "Mature After-Sales Network", desc: "Farizon's commercial vehicle service network covers all major cities." },
    { icon: "\uD83D\uDCE6", title: "6 m3 Optimised Cargo Bay", desc: "Square-shaped cargo area eliminates wasted space." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size Cargo Van" }, { label: "Range (NEDC)", value: "260 km" }, { label: "Battery Capacity", value: "41.9 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "60 kW (82 hp)" }, { label: "Drive Type", value: "Rear-Wheel Drive" }, { label: "Top Speed", value: "100 km/h" }, { label: "DC Fast Charge", value: "~40 min (10% -> 80%)" }, { label: "AC Slow Charge", value: "~6.5 hrs" }, { label: "Cargo Volume", value: "6 m3" },
  ],
  specsRight: [
    { label: "Payload", value: "~900 kg" }, { label: "Warranty", value: "5 Yrs / 200,000 km" }, { label: "Dimensions (LxWxH)", value: "4,840 x 1,735 x 1,990 mm" }, { label: "Wheelbase", value: "2,930 mm" }, { label: "Turning Radius", value: "5.7 m" }, { label: "Side Door", value: "Manual Sliding" }, { label: "Rear Door", value: "180 deg Barn Doors" }, { label: "Spare Parts", value: "Widely Available" }, { label: "Aftersales", value: "Nationwide Network" },
  ],
  fits: [
    { icon: "\uD83D\uDE9A", title: "Last-Mile Delivery", desc: "The volume leader for urban parcel delivery.", accent: "Volume leader" },
    { icon: "\uD83C\uDFEA", title: "Small Business Logistics", desc: "Affordable entry price and proven reliability.", accent: "Small biz champion" },
    { icon: "\uD83D\uDD04", title: "Fleet Rotation", desc: "Mature parts network simplifies fleet rotation.", accent: "Fleet friendly" },
  ],
  relatedModels: [
    { name: "Farizon Super Van", href: "/products/utility-pro/farizon-super-van" }, { name: "Maxus eDeliver 9", href: "/products/utility-pro/maxus-edeliver-9" }, { name: "BYD T5", href: "/products/utility-pro/byd-t5" }, { name: "Foton eAumark", href: "/products/utility-pro/foton-eaumark" },
  ],
  tags: ["Cargo Van", "Urban Delivery"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/xingxiangv/xingxiangv%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/xingxiangv/xingxiangv%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/xingxiangv/xingxiangv%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/xingxiangv/xingxiangv%20detail%20(1).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/xingxiangv/xingxiangv%20detail%20(1).jpeg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$49K - $65K" }, { units: 20, display: "$98K - $130K" }, { units: 50, display: "$245K - $325K" }, { units: 100, display: "$490K - $650K" },
  ],
  batchMargin: { low: "$4,900", high: "$6,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
