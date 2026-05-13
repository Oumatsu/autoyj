import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Zeekr",
    name: "001",
    fob: "$38,400 - $47,000",
    battery: "100 kWh",
    batteryType: "NCM / LFP",
    range: "750 km",
    charging: "Full-range 800V + LiDAR - ultra-fast charging + in-house motor + top-tier shooting brake design",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20display.png",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "elite-flagship" as const,
  title: "Zeekr 001",
  subtitle: "The Shooting Brake Icon",
  heroDesc: "The vehicle that defined the premium Chinese EV segment. Full-range 800V architecture, LiDAR, and that iconic shooting brake design.",
  stat1Label: "km CLTC Range", stat1Value: "750",
  stat2Label: "800V", stat2Value: "Platform",
  stat3Label: "LiDAR", stat3Value: "Smart",
  whyTitle: "Why It Sells",
  whyDesc: "Iconic design. Supercar charging speed. The shooting brake legend.",
  features: [
    { icon: "\uD83C\uDFA8", title: "Iconic Shooting Brake Design", desc: "The 001 essentially created the premium Chinese EV shooting brake segment." },
    { icon: "\u26A1", title: "Ultra-Fast Charging", desc: "10-80% charge in 15 minutes. The quickest top-up in its class." },
    { icon: "\uD83D\uDD27", title: "In-House Motor Technology", desc: "Zeekr's self-developed SiC motor delivers 310 kW with exceptional efficiency." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Shooting Brake / Sport Wagon" }, { label: "Range (CLTC)", value: "750 km" }, { label: "Battery Capacity", value: "100 kWh" }, { label: "Battery Type", value: "NCM / LFP Option" }, { label: "Motor Power", value: "310 kW (RWD) / 580 kW (AWD)" }, { label: "Drive Type", value: "RWD / Dual Motor AWD" }, { label: "0 - 100 km/h", value: "3.3 sec (AWD)" }, { label: "Top Speed", value: "220 km/h" }, { label: "DC Fast Charge", value: "~15 min (10% -> 80%)" }, { label: "Platform", value: "SEA Architecture" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "5 Yrs / 120,000 km" }, { label: "Dimensions (LxWxH)", value: "4,970 x 1,999 x 1,548 mm" }, { label: "Wheelbase", value: "3,005 mm" }, { label: "Boot Volume", value: "539 L (1,311 L folded)" }, { label: "Seating", value: "5 Seats" }, { label: "Sunroof", value: "Panoramic EC Glass" }, { label: "Audio", value: "Yamaha 12-Speaker" }, { label: "Airbags", value: "7" },
  ],
  fits: [
    { icon: "\uD83C\uDFCE\uFE0F", title: "Design-Conscious Driver", desc: "For buyers who refuse to compromise between form and function.", accent: "Design icon" },
    { icon: "\uD83C\uDF0D", title: "European Market Entrant", desc: "Already homologated for EU markets including Germany and Netherlands.", accent: "EU proven" },
    { icon: "\uD83D\uDCBC", title: "Premium Fleet", desc: "The practical shooting brake format offers SUV-like cargo space with sedan dynamics.", accent: "Practical premium" },
  ],
  relatedModels: [
    { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" }, { name: "Xiaomi SU7 Ultra", href: "/products/elite-flagship/xiaomi-su7-ultra" }, { name: "XPENG G9", href: "/products/elite-flagship/xpeng-g9" }, { name: "Stelato S9", href: "/products/elite-flagship/stelato-s9" },
  ],
  tags: ["Executive Sedan", "800V Shooting Brake"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(3).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(3).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(2).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(1).webp", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(1).png", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$125K - $155K" }, { units: 20, display: "$250K - $310K" }, { units: 50, display: "$625K - $775K" }, { units: 100, display: "$1.25M - $1.55M" },
  ],
  batchMargin: { low: "$12,500", high: "$15,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
