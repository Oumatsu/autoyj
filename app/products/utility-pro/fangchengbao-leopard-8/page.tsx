import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Fangchengbao",
    name: "Leopard 8",
    fob: "$55,800 - $58,800",
    battery: "36.8 kWh",
    batteryType: "LFP Blade (PHEV)",
    range: "1,380 km (Ext)",
    charging: "[Flagship Off-Road] DMO super hybrid — Huawei ADS dual LiDAR + Tank Turn + 800V flash charge + 6/7 seat luxury",
    img: "/pic/utility-pro/leopard8/7.webp",
    status: "factory",
    statusText: "Factory Order: 28 Days",
  },
  category: "utility-pro" as const,
  title: "Fangchengbao Leopard 8",
  subtitle: "Flagship Off-Road SUV",
  heroDesc: "BYD's flagship off-road SUV combining DMO super hybrid with Huawei ADS 4.1.5 dual LiDAR smart driving. 1,380 km combined range, 4.8s acceleration, and genuine 4WD capability",
  stat1Label: "Range (Ext)", stat1Value: "1,380km",
  stat2Label: "0-100 km/h", stat2Value: "4.8s",
  stat3Label: "Huawei ADS", stat3Value: "Dual LiDAR",
  whyTitle: "Why It Sells",
  whyDesc: "The world's first Huawei ADS-equipped off-road SUV. Uncompromising luxury meets genuine越野 capability.",
  features: [
    { icon: "\u26A1", title: "DMO Super Hybrid", desc: "2.0T engine + dual motors deliver 550 kW combined. 1,380 km total range for unlimited adventures." },
    { icon: "\uD83E\uDD16", title: "Huawei ADS 4.1.5", desc: "Dual front/rear LiDAR with city/highway NOA and越野场景全覆盖智能驾驶." },
    { icon: "\uD83D\uDEE1\uFE0F", title: "Yunnian-P Ultra Suspension", desc: "Intelligent hydraulic body control with 300mm wheel lift for极限脱困 and 3-wheel driving." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Large Off-Road SUV" }, { label: "Range (CLTC EV)", value: "200 km" }, { label: "Range (Combined)", value: "1,380 km" }, { label: "Battery Capacity", value: "36.8 / 46.7 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "System Power", value: "550 kW (748 hp)" }, { label: "Drive Type", value: "Dual-Motor 4WD" }, { label: "0 - 100 km/h", value: "4.8 sec" }, { label: "Top Speed", value: "180 km/h" }, { label: "Flash Charge", value: "800V Platform" },
  ],
  specsRight: [
    { label: "Engine", value: "2.0T 272 hp" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,195 x 1,994 x 1,905 mm" }, { label: "Wheelbase", value: "2,920 mm" }, { label: "Fuel Tank", value: "91.5 L" }, { label: "Seating Capacity", value: "6 / 7 Seats" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "8" }, { label: "V2L Support", value: "6 kW" },
  ],
  fits: [
    { icon: "\uD83C\uDFD4\uFE0F", title: "Expedition Leader", desc: "1,380 km range and genuine 4WD make this the ultimate overland vehicle for long-range expeditions.", accent: "Expedition ready" },
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", title: "Family Off-Roader", desc: "6/7 seat luxury cabin with华为智能座舱. The whole family explores in comfort.", accent: "Family explorer" },
    { icon: "\uD83C\uDFC6", title: "Status Seeker", desc: "Rugged luxury that commands respect. The Leopard 8 is a statement of power and success.", accent: "Ultimate status" },
  ],
  relatedModels: [
    { name: "Fangchengbao Leopard 5", href: "/products/elite-flagship/fangchengbao-leopard-5" }, { name: "Tank 500 Hi4-T", href: "/products/utility-pro/tank-500-hi4t" }, { name: "GWM Cannon EV", href: "/products/utility-pro/gwm-cannon-ev" }, { name: "BYD Shark", href: "/products/utility-pro/byd-shark" },
  ],
  tags: ["Pickup Truck", "DMO Off-Road"],
  galleryImages: [
    { src: "/pic/utility-pro/leopard8/1.webp", cat: "Exterior", label: "" },
    { src: "/pic/utility-pro/leopard8/2.webp", cat: "Exterior", label: "" },
    { src: "/pic/utility-pro/leopard8/4.webp", cat: "Exterior", label: "" },
    { src: "/pic/utility-pro/leopard8/0.webp", cat: "Interior", label: "" },
    { src: "/pic/utility-pro/leopard8/5.webp", cat: "Interior", label: "" },
    { src: "/pic/utility-pro/leopard8/6.webp", cat: "Detail", label: "" },
    { src: "/pic/utility-pro/leopard8/3.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 5, display: "$190K - $200K" }, { units: 10, display: "$380K - $400K" }, { units: 20, display: "$760K - $800K" }, { units: 50, display: "$1.9M - $2.0M" },
  ],
  batchMargin: { low: "$38,000", high: "$40,000" },
  trimData: [
    { name: "7-Seat", range: "1,380 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "6-Seat", range: "1,380 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "Flash ★", range: "1,380 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa", fob: "Mid ★", rec: true },
    { name: "Flash Ultra", range: "1,380 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa + Wood", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: DMO · 4WD · Dual lockers · Yunnian-P suspension · LFP Blade.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
