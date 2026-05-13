import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Li Auto",
    name: "L6",
    fob: "$35,700 - $40,000",
    battery: "36.8 kWh",
    batteryType: "LFP (EREV)",
    range: "1,390 km (Ext)",
    charging: "[Safest EREV Bet] China's #1 luxury EREV SUV 2024 - TV + fridge + sofa, 60% cheaper to run than ICE rivals",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/L6/L6%20display.jpeg",
    status: "in-stock",
    statusText: "In Stock: Beijing",
  },
  category: "elite-flagship" as const,
  title: "Li Auto L6",
  subtitle: "China's #1 EREV SUV",
  heroDesc: "2024's best-selling Chinese luxury EREV SUV. The 'mobile living room' formula combined with extremely efficient range extension.",
  stat1Label: "km Range (Ext)", stat1Value: "1,390",
  stat2Label: "Saving vs ICE", stat2Value: "60%",
  stat3Label: "#1 EREV", stat3Value: "SUV",
  whyTitle: "Why It Sells",
  whyDesc: "The safest bet in luxury EREV. Proven, comfortable, efficient.",
  features: [
    { icon: "\uD83D\uDCFA", title: "Mobile Living Room", desc: "Dual 15.7\" screens, in-car refrigerator, and Nappa leather seats that recline fully." },
    { icon: "\u26FD", title: "60% Cheaper Than ICE", desc: "EREV architecture means daily commuting on pure electric with a petrol generator for long trips." },
    { icon: "\uD83E\uDD16", title: "Li AD Max", desc: "Li Auto's proprietary ADAS with LiDAR handles highway and city driving." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size Luxury SUV" }, { label: "Range (Ext EREV)", value: "1,390 km" }, { label: "Battery Capacity", value: "36.8 kWh" }, { label: "Battery Type", value: "LFP (EREV)" }, { label: "System Power", value: "330 kW (449 hp)" }, { label: "Drive Type", value: "Dual Motor AWD" }, { label: "0 - 100 km/h", value: "5.4 sec" }, { label: "Top Speed", value: "180 km/h" }, { label: "Fuel Tank", value: "65 L" }, { label: "CLTC Pure Electric", value: "212 km" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "5 Yrs / 100,000 km" }, { label: "Dimensions (LxWxH)", value: "4,925 x 1,960 x 1,735 mm" }, { label: "Wheelbase", value: "2,920 mm" }, { label: "Seating", value: "5 Seats" }, { label: "Screens", value: "Dual 15.7\" + HUD" }, { label: "Refrigerator", value: "Dual-Zone 8.8L" }, { label: "Audio", value: "19-Speaker" }, { label: "Airbags", value: "9" },
  ],
  fits: [
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66", title: "Modern Family", desc: "The most family-friendly luxury SUV in China.", accent: "Family perfected" },
    { icon: "\uD83D\uDE97", title: "ICE Converts", desc: "The perfect gateway from ICE luxury to electrified driving.", accent: "Gateway to EV" },
    { icon: "\uD83C\uDFD5\uFE0F", title: "Weekend Escapist", desc: "1,390 km range means spontaneous weekend trips.", accent: "Spontaneous adventure" },
  ],
  relatedModels: [
    { name: "Geely Galaxy M9", href: "/products/elite-flagship/geely-galaxy-m9" }, { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" }, { name: "XPENG G9", href: "/products/elite-flagship/xpeng-g9" },
  ],
  tags: ["Premium SUV", "EREV Leader"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/L6/L6%20detail%20(3).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/L6/L6%20detail%20(2).png", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/L6/L6%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/L6/L6%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/L6/L6%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$118K - $132K" }, { units: 20, display: "$236K - $264K" }, { units: 50, display: "$590K - $660K" }, { units: 100, display: "$1.18M - $1.32M" },
  ],
  batchMargin: { low: "$11,800", high: "$13,200" },
};
export default function Page() { return <VehicleDetail data={data} />; }
