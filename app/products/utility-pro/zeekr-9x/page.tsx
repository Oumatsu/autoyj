import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Zeekr",
    name: "9X",
    fob: "$64,500 - $83,000",
    battery: "70 kWh",
    batteryType: "NCM (PHEV)",
    range: "1,250 km (Ext)",
    charging: "[Global Hyper-Luxury SUV] 900V浩瀚-S架构 — 1,030 kW tri-motor + 3.1s 0-100 + 6-seat + 6C super-fast charge",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20display.png",
    status: "factory",
    statusText: "Factory Order: 30 Days",
  },
  category: "utility-pro" as const,
  title: "Zeekr 9X",
  subtitle: "Hyper-Luxury SUV",
  heroDesc: "Zeekr's flagship hyper-luxury SUV based on the浩瀚-S architecture. 1,030 kW tri-motor, 3.1s 0-100, 900V 6C super-fast charging, and a 6-seat ultra-luxury cabin.",
  stat1Label: "Range (Ext)", stat1Value: "1,250km",
  stat2Label: "0-100 km/h", stat2Value: "3.1s",
  stat3Label: "900V", stat3Value: "6C Charge",
  whyTitle: "Why It Sells",
  whyDesc: "Hypercar performance in a 6-seat luxury SUV. 900V 6C charging redefines what's possible.",
  features: [
    { icon: "\u26A1", title: "900V 6C Ultra-Fast Charge", desc: "20-80% in just 9 minutes. 70 kWh battery with 6C骁遥 technology for unmatched charging speed." },
    { icon: "\uD83D\uDE80", title: "Tri-Motor 1,030 kW", desc: "Three electric motors deliver 1,030 kW (1,400 hp) — 3.1s 0-100 km/h. The world's fastest full-size SUV." },
    { icon: "\uD83D\uDCBA", title: "6-Seat Ultra-Luxury Cabin", desc: "2+2+2布局 with second-row rotating seats,双腔空悬, 48V active stabilizer bars, and Naim audio." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Large Luxury SUV" }, { label: "Range (CLTC EV)", value: "300 / 380 km" }, { label: "Range (Combined)", value: "1,250 km" }, { label: "Battery Capacity", value: "55 / 70 kWh" }, { label: "Battery Type", value: "NCM (6C)" }, { label: "System Power", value: "660 - 1,030 kW" }, { label: "Drive Type", value: "AWD (Tri-Motor)" }, { label: "0 - 100 km/h", value: "3.1 sec (Hyper)" }, { label: "Top Speed", value: "240 km/h" }, { label: "DC Fast Charge", value: "9 min (20% -> 80%)" },
  ],
  specsRight: [
    { label: "Engine", value: "2.0T PHEV" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,239 x 2,019 x 1,819 mm" }, { label: "Wheelbase", value: "3,169 mm" }, { label: "Body Torsion", value: "41,600 N·m/°" }, { label: "Seating Capacity", value: "6 Seats (2+2+2)" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "8" }, { label: "V2L Support", value: "6 kW" },
  ],
  fits: [
    { icon: "\uD83D\uDC51", title: "Ultra-Luxury Buyer", desc: "The pinnacle of Chinese automotive engineering. Hyper-luxury at a fraction of European rivals.", accent: "New luxury" },
    { icon: "\uD83D\uDE96", title: "VIP Transport", desc: "6-seat layout with rotating rear chairs, executive冰箱, and Naim audio for premium chauffeured transport.", accent: "Executive class" },
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", title: "Tech Titan Family", desc: "3.1s acceleration, 9-min charging, and 6-seat comfort. The ultimate tech-family statement.", accent: "Family flagship" },
  ],
  relatedModels: [
    { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" }, { name: "BYD Tang L EV", href: "/products/elite-flagship/byd-tang-l-ev" }, { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Hongqi E-HS9", href: "/products/elite-flagship/hongqi-e-hs9" },
  ],
  tags: ["Pickup Truck", "Ultra-Luxury PHEV"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(4).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(3).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/001/001%20detail%20(1).png", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 5, display: "$215K - $280K" }, { units: 10, display: "$430K - $560K" }, { units: 20, display: "$860K - $1.12M" }, { units: 50, display: "$2.15M - $2.8M" },
  ],
  batchMargin: { low: "$43,000", high: "$56,000" },
  trimData: [
    { name: "Max 55", range: "1,000+ km", accel: "3.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Soft Nappa", fob: "Lowest" },
    { name: "Ultra 70", range: "1,250 km", accel: "3.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "Hyper ★", range: "1,250 km", accel: "3.1 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa", fob: "Mid ★", rec: true },
    { name: "Hyper Black", range: "1,250 km", accel: "3.1 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa + Suede", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: 900V · 6C fast charge · 2+2+2 6-seat · Dual-chamber air suspension.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
