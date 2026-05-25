import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Han EV",
    fob: "$25,000 - $32,000",
    battery: "83.2 kWh",
    batteryType: "LFP Blade",
    range: "701 km",
    charging: "[Chinese Flagship Sedan] Dragon Face design + Blade Battery + DiPilot 300 LiDAR + Dynaudio audio",
    img: "/pic/elite-flagship/hanev/5.webp",
    status: "in-stock",
    statusText: "In Stock: Shenzhen",
  },
  category: "elite-flagship" as const,
  title: "BYD Han EV",
  subtitle: "Chinese Flagship Sedan",
  heroDesc: "BYD's flagship executive sedan combining Dragon Face design language with Blade Battery safety, now upgraded with LiDAR smart driving and Dynaudio premium audio",
  stat1Label: "km CLTC Range", stat1Value: "701",
  stat2Label: "0-100 km/h", stat2Value: "3.9s",
  stat3Label: "Blade", stat3Value: "Battery",
  whyTitle: "Why It Sells",
  whyDesc: "The definitive Chinese luxury sedan. Proven, refined, and now smarter than ever.",
  features: [
    { icon: "\uD83D\uDEE1\uFE0F", title: "Blade Battery Safety", desc: "World's safest EV battery technology with zero thermal runaway on nail penetration test." },
    { icon: "\uD83D\uDDA5\uFE0F", title: "DiPilot 300 LiDAR", desc: "Laser radar + Orin X chip enables city/highway NOA, valet parking, and advanced collision avoidance." },
    { icon: "\uD83C\uDFB6", title: "Dynaudio Premium Audio", desc: "HiFi-class custom Dynaudio sound system with 12 speakers for an immersive cabin experience." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Executive Sedan" }, { label: "Range (CLTC)", value: "506 / 605 / 701 km" }, { label: "Battery Capacity", value: "83.2 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "170 - 240 kW" }, { label: "Drive Type", value: "FWD / AWD" }, { label: "0 - 100 km/h", value: "3.9 sec (AWD)" }, { label: "Top Speed", value: "210 km/h" }, { label: "DC Fast Charge", value: "~18 min (30% -> 80%)" }, { label: "Drag Coefficient", value: "0.233 Cd" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,995 x 1,910 x 1,495 mm" }, { label: "Wheelbase", value: "2,920 mm" }, { label: "Boot Volume", value: "450 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "8" }, { label: "V2L Support", value: "3.3 kW" },
  ],
  fits: [
    { icon: "\uD83D\uDC51", title: "Executive Transport", desc: "Flagship sedan with executive rear seat comfort and premium brand cachet.", accent: "Flagship status" },
    { icon: "\uD83C\uDFE2", title: "Corporate Fleet", desc: "Low TCO with BYD's extensive service network and proven reliability.", accent: "Business smart" },
    { icon: "\uD83D\uDC69\u200D\uD83D\uDCBB", title: "Tech-Savvy Buyer", desc: "LiDAR autonomous driving and DiLink smart cockpit appeal to early adopters.", accent: "Tech flagship" },
  ],
  relatedModels: [
    { name: "BYD Seal", href: "/products/elite-flagship/byd-seal" }, { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" }, { name: "Stelato S9", href: "/products/elite-flagship/stelato-s9" }, { name: "Zeekr 001", href: "/products/elite-flagship/zeekr-001" },
  ],
  tags: ["Executive Sedan", "LFP Blade"],
  galleryImages: [
    { src: "/pic/elite-flagship/hanev/1.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/hanev/2.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/hanev/3.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/hanev/4.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/hanev/6.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/hanev/7.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/hanev/8.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/hanev/9.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/10.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/11.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/12.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/13.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/14.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/15.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/hanev/16.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$85K - $108K" }, { units: 20, display: "$170K - $216K" }, { units: 50, display: "$425K - $540K" }, { units: 100, display: "$850K - $1.08M" },
  ],
  batchMargin: { low: "$8,500", high: "$10,800" },
  trimData: [
    { name: "Premium", range: "506 km", accel: "6.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "Comfort", range: "605 km", accel: "6.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "Flagship ★", range: "701 km", accel: "4.5 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Nappa Leather", fob: "Mid ★", rec: true },
    { name: "LiDAR AWD", range: "701 km", accel: "3.9 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: LFP Blade · DiLink 5.0 · V2L · 8-yr battery warranty.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
