import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Stelato",
    name: "S9",
    fob: "$57,100 - $64,300",
    battery: "100 kWh",
    batteryType: "NCM",
    range: "800 km",
    charging: "[Huawei Flagship Sedan] Rivals S-Class - zero-gravity rear seats + privacy screen + ADS advanced autonomy",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/S9/S9%20display.png",
    status: "factory",
    statusText: "Factory Order: 30 Days",
  },
  category: "elite-flagship" as const,
  title: "Stelato S9",
  subtitle: "Huawei S-Class Rival",
  heroDesc: "Huawei and BAIC's joint flagship sedan targets the Mercedes S-Class. Zero-gravity rear seats, electrochromic privacy screen, and Huawei ADS 3.0.",
  stat1Label: "km CLTC Range", stat1Value: "800",
  stat2Label: "Monthly Saving", stat2Value: "$350",
  stat3Label: "ADS", stat3Value: "3.0",
  whyTitle: "Why It Sells",
  whyDesc: "The S-Class challenger. Rear-seat experience redefined.",
  features: [
    { icon: "\uD83D\uDECF\uFE0F", title: "Zero-Gravity Rear Seats", desc: "NASA-inspired 121-degree recline minimises spinal pressure. Heating, ventilation, and 10-point massage." },
    { icon: "\uD83E\uDE9F", title: "Electrochromic Privacy Screen", desc: "Switch the rear cabin from transparent to opaque at the touch of a button." },
    { icon: "\uD83E\uDDE0", title: "Huawei ADS 3.0", desc: "City and highway autonomous driving with 192-line LiDAR." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size Executive Sedan" }, { label: "Range (CLTC)", value: "800 km" }, { label: "Battery Capacity", value: "100 kWh" }, { label: "Battery Type", value: "NCM (CATL)" }, { label: "Motor Power", value: "390 kW (530 hp)" }, { label: "Drive Type", value: "Dual Motor AWD" }, { label: "0 - 100 km/h", value: "3.9 sec" }, { label: "Top Speed", value: "210 km/h" }, { label: "800V Platform", value: "Yes" }, { label: "DC Fast Charge", value: "~15 min (30% -> 80%)" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "4 Yrs / 100,000 km" }, { label: "Dimensions (LxWxH)", value: "5,160 x 1,987 x 1,480 mm" }, { label: "Wheelbase", value: "3,050 mm" }, { label: "Boot Volume", value: "500 L" }, { label: "Seating", value: "4 / 5 Seats" }, { label: "Audio", value: "HUAWEI SOUND 25-Speaker" }, { label: "Rear Screen", value: "32\" Projection" }, { label: "Airbags", value: "9" },
  ],
  fits: [
    { icon: "\uD83C\uDFDB\uFE0F", title: "Ministerial Motorcade", desc: "Designed for government leaders who demand discretion and comfort.", accent: "State-grade privacy" },
    { icon: "\uD83D\uDCBC", title: "CEO Transport", desc: "The rear seat experience exceeds the S-Class at half the price.", accent: "CEO's office" },
    { icon: "\uD83C\uDFE8", title: "Premium Chauffeur Service", desc: "Define your chauffeur brand with the most advanced rear cabin in the segment.", accent: "Premium fleet" },
  ],
  relatedModels: [
    { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Hongqi E-HS9", href: "/products/elite-flagship/hongqi-e-hs9" }, { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" }, { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" },
  ],
  tags: ["Executive Sedan", "Huawei Inside"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/S9/S9%20detail%20(3).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/S9/S9%20detail%20(2).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/S9/S9%20detail%20(2).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/S9/S9%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/S9/S9%20detail%20(1).png", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$190K - $210K" }, { units: 20, display: "$380K - $420K" }, { units: 50, display: "$950K - $1.05M" }, { units: 100, display: "$1.9M - $2.1M" },
  ],
  batchMargin: { low: "$19,000", high: "$21,000" },
};
export default function Page() { return <VehicleDetail data={data} />; }
