import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Hongqi",
    name: "E-HS9",
    fob: "$84,300 - $111,400",
    battery: "120 kWh",
    batteryType: "NCM",
    range: "510 km",
    charging: "\"China's Rolls-Royce\" - unparalleled presence, air suspension + opulent interior, ME & Central Asia status symbol",
    img: "/pic/elite-flagship/E-HS9/6.webp",
    status: "factory",
    statusText: "Factory Order: 35 Days",
  },
  category: "elite-flagship" as const,
  title: "Hongqi E-HS9",
  subtitle: "China's Rolls-Royce",
  heroDesc: "Unmatched road presence with Hongqi's flagship DNA. Air suspension, opulent 4-seat configuration, and the strongest status signal in Middle East and Central Asian markets",
  stat1Label: "km Range", stat1Value: "690",
  stat2Label: "Monthly Saving", stat2Value: "$500",
  stat3Label: "4/6/7", stat3Value: "Seats",
  whyTitle: "Why It Sells",
  whyDesc: "Presence that commands respect. The ultimate status mobile.",
  features: [
    { icon: "\uD83D\uDC51", title: "Unmatched Road Presence", desc: "5.2m length with Hongqi's iconic vertical grille. No other vehicle commands this level of visual authority." },
    { icon: "\uD83D\uDECB\uFE0F", title: "4-Seat Executive Configuration", desc: "Individual rear captain's chairs with massage, ventilation, heating, and electric ottomans." },
    { icon: "\uD83C\uDFD7\uFE0F", title: "Air Suspension Standard", desc: "Active air suspension with continuous damping control. Absorbs broken roads effortlessly." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size Luxury SUV" }, { label: "Range (NEDC)", value: "690 km" }, { label: "Battery Capacity", value: "120 kWh" }, { label: "Battery Type", value: "NCM (CATL)" }, { label: "Motor Power", value: "405 kW (551 hp)" }, { label: "Drive Type", value: "Dual Motor AWD" }, { label: "0 - 100 km/h", value: "5.0 sec" }, { label: "Top Speed", value: "200 km/h" }, { label: "DC Fast Charge", value: "~30 min" }, { label: "Energy Density", value: "206 Wh/kg" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + Adaptive" }, { label: "Warranty", value: "4 Yrs / 100,000 km" }, { label: "Dimensions (LxWxH)", value: "5,209 x 2,010 x 1,731 mm" }, { label: "Wheelbase", value: "3,110 mm" }, { label: "Boot Volume", value: "350-760 L" }, { label: "Seating", value: "4 / 6 / 7 Seats" }, { label: "Audio", value: "BOSE Premium" }, { label: "Ambient Light", value: "253 Colours" }, { label: "Airbags", value: "8" },
  ],
  fits: [
    { icon: "\uD83D\uDC51", title: "Royal & Diplomatic", desc: "The standard for state occasions in multiple Belt & Road countries.", accent: "State-level presence" },
    { icon: "\uD83C\uDFE8", title: "Luxury Hotel Fleet", desc: "Define your 5-star hotel's arrival experience. The E-HS9 makes every guest feel like a head of state.", accent: "5-star standard" },
    { icon: "\uD83D\uDC8E", title: "Private Collector", desc: "Limited production and iconic Hongqi heritage make this a genuine collector's piece.", accent: "Collector's item" },
  ],
  relatedModels: [
    { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Stelato S9", href: "/products/elite-flagship/stelato-s9" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" }, { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" },
  ],
  tags: ["Premium SUV", "Ultra Luxury"],
  galleryImages: [
    { src: "/pic/elite-flagship/E-HS9/7.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/8.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/9.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/10.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/11.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/0.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/1.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/2.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/E-HS9/5.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/E-HS9/4.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/E-HS9/3.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/E-HS9/12.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/E-HS9/13.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/E-HS9/14.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/E-HS9/15.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 5, display: "$125K - $165K" }, { units: 10, display: "$250K - $330K" }, { units: 20, display: "$500K - $660K" }, { units: 50, display: "$1.25M - $1.65M" },
  ],
  batchMargin: { low: "$25,000", high: "$33,000" },
  trimData: [
    { name: "Standard", range: "410 km", accel: "6.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Lowest" },
    { name: "Comfort", range: "510 km", accel: "5.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Semi-Aniline", fob: "Low" },
    { name: "Premium", range: "510 km", accel: "5.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Full Aniline", fob: "Mid ★", rec: true },
    { name: "Flagship AWD", range: "460 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Aniline", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: NCM battery · AWD · Air suspension · Executive rear seats.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
