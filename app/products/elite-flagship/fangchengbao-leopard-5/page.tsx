import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Fangchengbao",
    name: "Leopard 5",
    fob: "$33,200 - $46,000",
    battery: "31.8 kWh",
    batteryType: "LFP Blade",
    range: "1,310 km (Ext)",
    charging: "DMO super hybrid off-road platform — 4.8s 0-100 + 35° approach + Tank Turn + dual lockers",
    img: "/pic/elite-flagship/leopard5/7.webp",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "elite-flagship" as const,
  title: "Fangchengbao Leopard 5",
  subtitle: "DMO Off-Road SUV",
  heroDesc: "BYD's DMO super hybrid off-road SUV combining 4.8s performance with genuine off-road capability. Tank Turn, dual lockers, and a 35-degree approach angle",
  stat1Label: "0-100 km/h", stat1Value: "4.8s",
  stat2Label: "Range (Ext)", stat2Value: "1,310km",
  stat3Label: "DMO", stat3Value: "Platform",
  whyTitle: "Why It Sells",
  whyDesc: "Supercar acceleration meets genuine off-road capability. Unbeatable value proposition.",
  features: [
    { icon: "\u26A1", title: "DMO Super Hybrid", desc: "1.5T + dual electric motors deliver 505 kW combined output and 760 N·m of torque." },
    { icon: "\uD83C\uDFD4\uFE0F", title: "Genuine Off-Road", desc: "35° approach angle, dual lockers, Tank Turn, and intelligent terrain recognition system." },
    { icon: "\uD83D\uDEE1\uFE0F", title: "Blade Battery Safety", desc: "LFP Blade battery with CTB architecture for maximum body rigidity and safety." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Size Off-Road SUV" }, { label: "Range (CLTC EV)", value: "125 - 210 km" }, { label: "Range (Combined)", value: "1,310 km" }, { label: "Battery Capacity", value: "31.8 / 47.8 kWh" }, { label: "Battery Type", value: "LFP Blade (CTB)" }, { label: "System Power", value: "505 kW (687 hp)" }, { label: "Drive Type", value: "Dual-Motor 4WD" }, { label: "0 - 100 km/h", value: "4.8 sec" }, { label: "Top Speed", value: "180 km/h" }, { label: "Approach / Depart", value: "35° / 32°" },
  ],
  specsRight: [
    { label: "Engine", value: "1.5T 194 hp" }, { label: "Battery Warranty", value: "8 Yrs (Unlimited Miles)" }, { label: "Dimensions (LxWxH)", value: "4,890 x 1,970 x 1,920 mm" }, { label: "Wheelbase", value: "2,800 mm" }, { label: "Fuel Tank", value: "83 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "6 kW" },
  ],
  fits: [
    { icon: "\uD83C\uDFD4\uFE0F", title: "Off-Road Enthusiast", desc: "Genuine off-road hardware with dual lockers and Tank Turn for extreme terrain.", accent: "Trail ready" },
    { icon: "\uD83D\uDE95", title: "Overlander", desc: "1,310 km combined range means non-stop cross-country adventures.", accent: "Go further" },
    { icon: "\uD83D\uDC51", title: "Status SUV Buyer", desc: "Distinctive design and premium interior attract those seeking something unique.", accent: "Stand out" },
  ],
  relatedModels: [
    { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Geely Galaxy M9", href: "/products/elite-flagship/geely-galaxy-m9" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" }, { name: "Hongqi E-HS9", href: "/products/elite-flagship/hongqi-e-hs9" },
  ],
  tags: ["Premium SUV", "DMO Off-Road"],
  galleryImages: [
    { src: "/pic/elite-flagship/leopard5/1.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/leopard5/2.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/leopard5/3.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/leopard5/4.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/leopard5/5.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/leopard5/6.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/leopard5/8.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/leopard5/9.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/leopard5/10.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/leopard5/11.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/leopard5/12.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/leopard5/13.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$112K - $155K" }, { units: 20, display: "$224K - $310K" }, { units: 50, display: "$560K - $775K" }, { units: 100, display: "$1.12M - $1.55M" },
  ],
  batchMargin: { low: "$11,200", high: "$15,500" },
  trimData: [
    { name: "125 Max", range: "1,310 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "125 Ultra", range: "1,310 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "210 Ultra ★", range: "1,310 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Mid ★", rec: true },
    { name: "210 Qiankun", range: "1,310 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Full Nappa", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: DMO platform · 4WD · Dual lockers · Tank Turn · LFP Blade.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
