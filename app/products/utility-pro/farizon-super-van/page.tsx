import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Farizon",
    name: "Super Van",
    fob: "$27,100 - $37,100",
    battery: "66.0 kWh",
    batteryType: "LFP",
    range: "350 km",
    charging: "[2025 Digital Cargo] Geely Farizon flagship - steer-by-wire + flat floor",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20display.png",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "utility-pro" as const,
  title: "Farizon Super Van",
  subtitle: "2025 Digital Cargo Van",
  heroDesc: "Geely Farizon's flagship digital cargo van. Steer-by-wire technology enables a completely flat cargo floor.",
  stat1Label: "km NEDC Range", stat1Value: "350",
  stat2Label: "Space", stat2Value: "+20%",
  stat3Label: "Digital", stat3Value: "Cargo",
  whyTitle: "Why It Sells",
  whyDesc: "More cargo. Less effort. Digital logistics redefined.",
  features: [
    { icon: "\uD83D\uDD27", title: "Steer-by-Wire Technology", desc: "Eliminating the mechanical steering column creates a completely flat floor." },
    { icon: "\uD83D\uDCD0", title: "+20% Space Efficiency", desc: "Flat floor design yields 20% more usable cargo volume." },
    { icon: "\uD83D\uDCF1", title: "Digital Fleet Management", desc: "Integrated telematics, cargo tracking, and route optimisation." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Large Cargo Van" }, { label: "Range (NEDC)", value: "350 km" }, { label: "Battery Capacity", value: "66 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "100 kW (136 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "Top Speed", value: "120 km/h" }, { label: "DC Fast Charge", value: "~40 min (10% -> 80%)" }, { label: "AC Slow Charge", value: "~8 hrs (0 -> 100%)" }, { label: "Cargo Volume", value: "~11 m3" },
  ],
  specsRight: [
    { label: "Steering", value: "Steer-by-Wire" }, { label: "Warranty", value: "5 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,490 x 2,080 x 1,990 mm" }, { label: "Wheelbase", value: "3,360 mm" }, { label: "Payload", value: "~1,400 kg" }, { label: "Side Door", value: "Electric Sliding" }, { label: "Rear Door", value: "270 deg Opening" }, { label: "Telematics", value: "Standard" }, { label: "Load Floor", value: "Completely Flat" },
  ],
  fits: [
    { icon: "\uD83D\uDCE6", title: "Express & Logistics", desc: "Maximise parcels per trip with the flat-floor design.", accent: "Revenue maximiser" },
    { icon: "\uD83C\uDFEA", title: "Retail Distribution", desc: "Electric power eliminates city access restrictions.", accent: "24hr delivery ready" },
    { icon: "\uD83C\uDFE2", title: "Corporate Fleet", desc: "Digital telematics provide fleet managers with unprecedented visibility.", accent: "Fleet intelligence" },
  ],
  relatedModels: [
    { name: "Farizon Xingxiang V", href: "/products/utility-pro/farizon-xingxiang-v" }, { name: "Maxus eDeliver 9", href: "/products/utility-pro/maxus-edeliver-9" }, { name: "BYD T5", href: "/products/utility-pro/byd-t5" }, { name: "Foton eAumark", href: "/products/utility-pro/foton-eaumark" },
  ],
  tags: ["Cargo Van", "Digital"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20detail%20(2).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20detail%20(1).png", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/supervan/supervan%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$90K - $123K" }, { units: 20, display: "$180K - $246K" }, { units: 50, display: "$450K - $615K" }, { units: 100, display: "$900K - $1.23M" },
  ],
  batchMargin: { low: "$9,000", high: "$12,300" },
};
export default function Page() { return <VehicleDetail data={data} />; }
