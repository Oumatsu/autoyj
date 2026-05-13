import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Xiaomi",
    name: "SU7 Ultra",
    fob: "$75,700",
    battery: "101 kWh",
    batteryType: "NCM",
    range: "630 km",
    charging: "Performance social currency - 1,500+ hp + carbon-fibre aero kit",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20display.png",
    status: "factory",
    statusText: "Factory Order: 35 Days",
  },
  category: "elite-flagship" as const,
  title: "Xiaomi SU7 Ultra",
  subtitle: "1,548 Horsepower",
  heroDesc: "1,548 hp, carbon-fibre aero package, and Xiaomi's ecosystem integration make this the ultimate tech executive's social currency.",
  stat1Label: "Horsepower", stat1Value: "1,548",
  stat2Label: "0-100 km/h", stat2Value: "1.98s",
  stat3Label: "CLTC", stat3Value: "630 km",
  whyTitle: "Why It Sells",
  whyDesc: "The ultimate statement. Xiaomi's halo car defines what's possible.",
  features: [
    { icon: "\uD83D\uDE80", title: "Hypercar Acceleration", desc: "0-100 km/h in 1.98 seconds. Tri-motor setup with Xiaomi's self-developed V8s motor at 27,200 rpm." },
    { icon: "\uD83C\uDFCE\uFE0F", title: "Carbon-Fibre Aero", desc: "Full carbon aero package: front splitter, side skirts, rear diffuser, and active rear wing." },
    { icon: "\uD83D\uDCF1", title: "Xiaomi Ecosystem", desc: "Native HyperOS integration with Xiaomi phones, watches, and smart home." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Performance Sedan" }, { label: "Range (CLTC)", value: "630 km" }, { label: "Battery Capacity", value: "101 kWh" }, { label: "Battery Type", value: "NCM (CATL Qilin)" }, { label: "Peak Power", value: "1,138 kW (1,548 hp)" }, { label: "Drive Type", value: "Tri-Motor AWD" }, { label: "0 - 100 km/h", value: "1.98 sec" }, { label: "Top Speed", value: "350 km/h" }, { label: "800V Platform", value: "875V Architecture" }, { label: "Fast Charge", value: "5-80% in 11 min" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "5 Yrs / 100,000 km" }, { label: "Dimensions (LxWxH)", value: "5,115 x 1,970 x 1,465 mm" }, { label: "Wheelbase", value: "3,000 mm" }, { label: "Cd (Drag Coeff)", value: "0.195" }, { label: "Seating", value: "5 Seats" }, { label: "Brakes", value: "Carbon Ceramic (Optional)" }, { label: "Wheels", value: "21\" Forged" }, { label: "Airbags", value: "7" },
  ],
  fits: [
    { icon: "\uD83C\uDFCE\uFE0F", title: "Performance Enthusiast", desc: "Porsche Taycan Turbo GT performance at less than half the price.", accent: "Track-ready" },
    { icon: "\uD83D\uDCF1", title: "Tech Executive", desc: "Xiaomi ecosystem users will find seamless integration irresistible.", accent: "Ecosystem lock-in" },
    { icon: "\uD83C\uDF1F", title: "Brand Influencer", desc: "Every SU7 Ultra on the road is free advertising for your dealership.", accent: "Showroom magnet" },
  ],
  relatedModels: [
    { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" }, { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" }, { name: "XPENG G9", href: "/products/elite-flagship/xpeng-g9" }, { name: "Stelato S9", href: "/products/elite-flagship/stelato-s9" },
  ],
  tags: ["Performance Sedan", "1,548 hp"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20detail%20(3).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20detail%20(2).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20detail%20(1).png", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/SU7ultra/SU7ultra%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 5, display: "$125K - $125K" }, { units: 10, display: "$250K - $250K" }, { units: 20, display: "$500K - $500K" }, { units: 50, display: "$1.25M - $1.25M" },
  ],
  batchMargin: { low: "$25,000", high: "$25,000" },
};
export default function Page() { return <VehicleDetail data={data} />; }
