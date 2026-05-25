import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "AITO",
    name: "M9",
    fob: "$67,100 - $84,300",
    battery: "100 kWh",
    batteryType: "NCM / EREV",
    range: "1,400 km (Ext)",
    charging: "[China's Tech Pinnacle] Huawei ADS 3.0",
    img: "/pic/elite-flagship/M9/6.webp",
    status: "factory",
    statusText: "Factory Order: 28 Days",
  },
  category: "elite-flagship" as const,
  title: "AITO M9",
  subtitle: "China's Tech Pinnacle",
  heroDesc: "The definitive Chinese luxury SUV powered by Huawei ADS 3.0. Projection headlights, Turing intelligent chassis, and the full Huawei ecosystem",
  stat1Label: "km Range (Ext)", stat1Value: "1,474",
  stat2Label: "Monthly Saving", stat2Value: "$500",
  stat3Label: "Huawei", stat3Value: "ADS 3.0",
  whyTitle: "Why It Sells",
  whyDesc: "The technology flagship. Huawei's finest in SUV form.",
  features: [
    { icon: "\uD83E\uDDE0", title: "Huawei ADS 3.0 Autonomy", desc: "4 LiDAR units + 13 cameras enable highway and city NOA." },
    { icon: "\uD83D\uDCA1", title: "Million-Pixel Projection Headlights", desc: "Projects navigation cues, pedestrian warnings, and entertainment onto the road surface." },
    { icon: "\uD83C\uDFD7\uFE0F", title: "Turing Intelligent Chassis", desc: "Air suspension + CDC adaptive dampers scan the road 100x/second." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size Luxury SUV" }, { label: "Range (Ext EREV)", value: "1,474 km" }, { label: "Battery Capacity", value: "52 kWh (EREV)" }, { label: "Battery Type", value: "NCM" }, { label: "System Power", value: "365 kW (496 hp)" }, { label: "Drive Type", value: "Dual Motor AWD" }, { label: "0 - 100 km/h", value: "4.9 sec" }, { label: "Top Speed", value: "200 km/h" }, { label: "Fuel Tank", value: "65 L (EREV)" }, { label: "CLTC Pure Electric", value: "290 km" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "4 Yrs / 100,000 km" }, { label: "Dimensions (LxWxH)", value: "5,230 x 1,999 x 1,800 mm" }, { label: "Wheelbase", value: "3,110 mm" }, { label: "Boot Volume", value: "1,252 L (6-Seat)" }, { label: "Seating", value: "5 / 6 / 4 Seats" }, { label: "Audio", value: "25-Speaker HUAWEI SOUND" }, { label: "Screens", value: "15.6\" + 16\" + AR-HUD" }, { label: "Airbags", value: "10" },
  ],
  fits: [
    { icon: "\uD83C\uDFDB\uFE0F", title: "Government VIP", desc: "The natural choice for diplomatic corps and government VIP transport.", accent: "Diplomatic grade" },
    { icon: "\uD83D\uDCBC", title: "C-Suite Executive", desc: "Zero-gravity rear seats, privacy screens, and Huawei ecosystem integration.", accent: "Mobile boardroom" },
    { icon: "\uD83D\uDC51", title: "Luxury Fleet Operator", desc: "Replace ageing S-Class and 7-Series fleets with superior technology.", accent: "Fleet flagship" },
  ],
  relatedModels: [
    { name: "Hongqi E-HS9", href: "/products/elite-flagship/hongqi-e-hs9" }, { name: "Stelato S9", href: "/products/elite-flagship/stelato-s9" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" }, { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" },
  ],
  tags: ["Premium SUV", "Huawei ADS"],
  galleryImages: [
    { src: "/pic/elite-flagship/M9/7.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/M9/8.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/M9/9.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/M9/11.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/M9/12.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/M9/1.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/M9/2.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/M9/0.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/M9/5.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/M9/4.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/M9/3.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/M9/13.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 5, display: "$220K - $280K" }, { units: 10, display: "$440K - $560K" }, { units: 20, display: "$880K - $1.12M" }, { units: 50, display: "$2.2M - $2.8M" },
  ],
  batchMargin: { low: "$44,000", high: "$56,000" },
  trimData: [
    { name: "Standard", range: "600 km", accel: "5.6 sec", sunroof: "✗ None", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "Comfort", range: "750 km", accel: "4.9 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Nappa Leather", fob: "Low" },
    { name: "Smart", range: "1,400 km", accel: "4.3 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Semi-Aniline", fob: "Mid ★", rec: true },
    { name: "Ultimate", range: "1,400 km", accel: "4.3 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Aniline", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: Huawei ADS 3.0 · Turing chassis · AWD · Projection headlights.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
