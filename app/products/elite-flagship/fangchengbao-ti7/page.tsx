import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Fangchengbao",
    name: "Ti 7",
    fob: "$27,800 - $33,000",
    battery: "105.7 kWh",
    batteryType: "LFP Blade (2nd Gen)",
    range: "755 km",
    charging: "[Global Flash Charging King] Boxy SUV — 5-min flash charge + 755 km range + 201L frunk + 7-screen cockpit",
    img: "/pic/elite-flagship/Ti7/5.webp",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "elite-flagship" as const,
  title: "Fangchengbao Ti 7",
  subtitle: "Flash-Charging Boxy SUV",
  heroDesc: "BYD's phenomenon boxy SUV now with EV flash charging. 5-min charge for 400 km range, 755 km total range, and a massive 201L front trunk. The ultimate family adventure vehicle",
  stat1Label: "km CLTC Range", stat1Value: "755",
  stat2Label: "Flash Charge", stat2Value: "5min",
  stat3Label: "201L", stat3Value: "Frunk",
  whyTitle: "Why It Sells",
  whyDesc: "Flash charging eliminates EV anxiety. The boxy SUV that took China by storm, now pure electric.",
  features: [
    { icon: "\u26A1", title: "5-Min Flash Charge", desc: "10-70% in just 5 minutes. Second-gen Blade Battery with megawatt flash charging technology." },
    { icon: "\uD83E\uDE9A", title: "201L Electric Frunk", desc: "Industry-leading front trunk. 84L hidden storage + 1,030L rear + 32.5L rear toolbox = massive capacity." },
    { icon: "\uD83D\uDDA5\uFE0F", title: "7-Screen Cockpit", desc: "15.6\" central + 12.3\" instrument + HUD + rear tablets — AI smart cockpit with full-voice control." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Large SUV" }, { label: "Range (CLTC)", value: "675 / 755 km" }, { label: "Battery Capacity", value: "92 / 105.7 kWh" }, { label: "Battery Type", value: "2nd Gen LFP Blade" }, { label: "Motor Power", value: "300 kW (402 hp)" }, { label: "Drive Type", value: "RWD / AWD" }, { label: "0 - 100 km/h", value: "4.5 sec (AWD)" }, { label: "Top Speed", value: "240 km/h" }, { label: "Flash Charge", value: "5 min (10% -> 70%)" }, { label: "Max Charge Power", value: "1,000V Platform" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,999 x 1,995 x 1,865 mm" }, { label: "Wheelbase", value: "2,920 mm" }, { label: "Frunk + Rear Boot", value: "201L + 1,030L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "✓ Panoramic (2.29m²)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "6 kW" },
  ],
  fits: [
    { icon: "\uD83C\uDFD5\uFE0F", title: "Adventure Family", desc: "Boxy design, massive cargo, and V2L power make it perfect for camping and road trips.", accent: "Family adventurer" },
    { icon: "\uD83D\uDE99", title: "Daily Commuter", desc: "755 km range means charge once every 2 weeks for average daily driving.", accent: "Zero range anxiety" },
    { icon: "\uD83D\uDEE0\uFE0F", title: "Lifestyle Explorer", desc: "201L frunk + 7-seat configurations + 48 storage spots for all your gear.", accent: "Ultimate utility" },
  ],
  relatedModels: [
    { name: "Fangchengbao Leopard 5", href: "/products/elite-flagship/fangchengbao-leopard-5" }, { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" }, { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" },
  ],
  tags: ["Premium SUV", "Flash Charge"],
  galleryImages: [
    { src: "/pic/elite-flagship/Ti7/6.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Ti7/7.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Ti7/8.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Ti7/9.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Ti7/0.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Ti7/1.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Ti7/3.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Ti7/4.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Ti7/10.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Ti7/11.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Ti7/2.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Ti7/12.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Ti7/13.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Ti7/14.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$95K - $115K" }, { units: 20, display: "$190K - $230K" }, { units: 50, display: "$475K - $575K" }, { units: 100, display: "$950K - $1.15M" },
  ],
  batchMargin: { low: "$9,500", high: "$11,500" },
  trimData: [
    { name: "675 RWD", range: "675 km", accel: "6.2 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "755 RWD", range: "755 km", accel: "6.2 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "755 AWD ★", range: "755 km", accel: "4.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Mid ★", rec: true },
    { name: "755 AWD Pro", range: "755 km", accel: "4.5 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: 2nd Gen LFP Blade · 1,000V flash charge · 201L frunk · 7-screen cockpit.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
