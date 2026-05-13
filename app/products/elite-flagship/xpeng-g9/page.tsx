import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "XPENG",
    name: "G9",
    fob: "$37,700 - $51,400",
    battery: "98.0 kWh",
    batteryType: "NCM / LFP",
    range: "702 km",
    charging: "800V smart-driving benchmark - SiC platform + Dynaudio cabin",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/XpengG9/XpengG9%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Guangzhou",
  },
  category: "elite-flagship" as const,
  title: "XPENG G9",
  subtitle: "The 800V Smart-Driving Benchmark",
  heroDesc: "XPENG's flagship SUV sets the standard for 800V charging and autonomous driving. Strong reputation in Nordic and Southeast Asian markets.",
  stat1Label: "km CLTC Range", stat1Value: "702",
  stat2Label: "800V SiC", stat2Value: "Platform",
  stat3Label: "N. Europe", stat3Value: "Approved",
  whyTitle: "Why It Sells",
  whyDesc: "Europe approved. The smartest 800V SUV in its class.",
  features: [
    { icon: "\u26A1", title: "800V Silicon Carbide Platform", desc: "Industry-leading SiC power electronics deliver 10-80% charge in 15 minutes." },
    { icon: "\uD83C\uDFB5", title: "Dynaudio Confidence Sound", desc: "22-speaker Dynaudio Confidence system with 2,250W amplifier." },
    { icon: "\uD83C\uDDEA\uD83C\uDDFA", title: "Nordic & SE Asia Stronghold", desc: "Top-selling Chinese premium EV in Norway, Denmark, and Thailand." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size SUV" }, { label: "Range (CLTC)", value: "702 km" }, { label: "Battery Capacity", value: "98 kWh" }, { label: "Battery Type", value: "NCM (3C Fast Charge)" }, { label: "Motor Power", value: "405 kW (551 hp)" }, { label: "Drive Type", value: "Dual Motor AWD" }, { label: "0 - 100 km/h", value: "3.9 sec" }, { label: "Top Speed", value: "200 km/h" }, { label: "DC Fast Charge", value: "~15 min (10% -> 80%)" }, { label: "Max Charging Power", value: "480 kW" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "5 Yrs / 120,000 km" }, { label: "Dimensions (LxWxH)", value: "4,891 x 1,937 x 1,680 mm" }, { label: "Wheelbase", value: "2,998 mm" }, { label: "Boot Volume", value: "660 L" }, { label: "Seating", value: "5 Seats" }, { label: "Audio", value: "Dynaudio 22-Speaker" }, { label: "Screens", value: "Dual 14.96\" + 10.25\"" }, { label: "Airbags", value: "8" },
  ],
  fits: [
    { icon: "\uD83C\uDF0D", title: "Cold-Climate Buyer", desc: "Proven winter performance in Scandinavia. Heat pump standard.", accent: "Winter-proof" },
    { icon: "\uD83C\uDFB5", title: "Audiophile Driver", desc: "The Dynaudio system alone justifies a test drive.", accent: "Concert hall on wheels" },
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", title: "Tech-Forward Family", desc: "XPILOT 4.0 autonomous driving reduces fatigue on family road trips.", accent: "Family tech leader" },
  ],
  relatedModels: [
    { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" }, { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" }, { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" },
  ],
  tags: ["Premium SUV", "800V Benchmark"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/XpengG9/XpengG9%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/XpengG9/XpengG9%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/XpengG9/XpengG9%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/XpengG9/XpengG9%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/XpengG9/XpengG9%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$124K - $170K" }, { units: 20, display: "$248K - $340K" }, { units: 50, display: "$620K - $850K" }, { units: 100, display: "$1.24M - $1.7M" },
  ],
  batchMargin: { low: "$12,400", high: "$17,000" },
};
export default function Page() { return <VehicleDetail data={data} />; }
