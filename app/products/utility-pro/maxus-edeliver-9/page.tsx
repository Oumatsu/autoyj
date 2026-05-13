import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Maxus",
    name: "eDeliver 9",
    fob: "$34,300 - $41,400",
    battery: "88.5 kWh",
    batteryType: "LFP / NCM",
    range: "353 km",
    charging: "Maxus flagship EV van - 11 m3 cargo space + top safety rating",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver9%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "utility-pro" as const,
  title: "Maxus eDeliver 9",
  subtitle: "Flagship EV Van",
  heroDesc: "SAIC Maxus's battle-tested flagship EV van. 11 m3 cargo space, top Euro NCAP safety rating, and proven export success.",
  stat1Label: "km NEDC Range", stat1Value: "353",
  stat2Label: "Cargo", stat2Value: "11 m3",
  stat3Label: "Euro", stat3Value: "NCAP",
  whyTitle: "Why It Sells",
  whyDesc: "The premium cargo van. EU safety certified, globally proven.",
  features: [
    { icon: "\uD83D\uDCE6", title: "11 m3 Class-Leading Cargo", desc: "The largest cargo volume in its segment. Designed for medium-haul logistics." },
    { icon: "\uD83D\uDEE1\uFE0F", title: "Top Euro NCAP Safety", desc: "The only EV cargo van with a Gold NCAP rating." },
    { icon: "\uD83C\uDF0F", title: "EU & Australia Proven", desc: "Years of export success in RHD markets. Homologation already established." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Large Cargo Van" }, { label: "Range (NEDC)", value: "353 km" }, { label: "Battery Capacity", value: "88.5 kWh" }, { label: "Battery Type", value: "LFP / NCM Option" }, { label: "Motor Power", value: "150 kW (204 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "Top Speed", value: "130 km/h" }, { label: "DC Fast Charge", value: "~40 min (10% -> 80%)" }, { label: "AC Slow Charge", value: "~12 hrs" }, { label: "GVW", value: "3,500 kg" },
  ],
  specsRight: [
    { label: "Payload", value: "~1,200 kg" }, { label: "Warranty", value: "5 Yrs / 200,000 km" }, { label: "Dimensions (LxWxH)", value: "5,940 x 2,062 x 2,525 mm" }, { label: "Wheelbase", value: "3,760 mm" }, { label: "Cargo Volume", value: "11 m3" }, { label: "Side Door", value: "Wide Sliding" }, { label: "Rear Door", value: "270 deg Barn Doors" }, { label: "Safety Rating", value: "Euro NCAP Gold" }, { label: "Export Markets", value: "EU + AU + UK" },
  ],
  fits: [
    { icon: "\uD83D\uDE9B", title: "Inter-City Logistics", desc: "353 km range covers most inter-city delivery routes.", accent: "Inter-city ready" },
    { icon: "\uD83C\uDFEA", title: "Retail Supply Chain", desc: "11 m3 volume handles bulk retail deliveries efficiently.", accent: "Bulk delivery" },
    { icon: "\uD83C\uDF0F", title: "Export Market Entry", desc: "Already homologated for RHD markets. Fastest path to an EV van fleet.", accent: "RHD ready" },
  ],
  relatedModels: [
    { name: "Farizon Super Van", href: "/products/utility-pro/farizon-super-van" }, { name: "Farizon Xingxiang V", href: "/products/utility-pro/farizon-xingxiang-v" }, { name: "BYD T5", href: "/products/utility-pro/byd-t5" }, { name: "Foton eAumark", href: "/products/utility-pro/foton-eaumark" },
  ],
  tags: ["Cargo Van", "Large Volume"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver%20detail%20(6).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver%20detail%20(5).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver%20detail%20(4).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver%20detail%20(2).jpg", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/edeliver/edeliver%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$114K - $137K" }, { units: 20, display: "$228K - $274K" }, { units: 50, display: "$570K - $685K" }, { units: 100, display: "$1.14M - $1.37M" },
  ],
  batchMargin: { low: "$11,400", high: "$13,700" },
};
export default function Page() { return <VehicleDetail data={data} />; }
