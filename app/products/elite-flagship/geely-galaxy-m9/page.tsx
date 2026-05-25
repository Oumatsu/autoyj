import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Geely",
    name: "Galaxy M9",
    fob: "$30,000 - $37,100",
    battery: "60.0 kWh",
    batteryType: "LFP",
    range: "1,500 km (Ext)",
    charging: "[Value Bombshell] Only air suspension + tri-motor AWD in class - 5.2m full-size 6-seat SUV + AI cockpit",
    img: "/pic/elite-flagship/Galaxym9/7.webp",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "elite-flagship" as const,
  title: "Geely Galaxy M9",
  subtitle: "The Value Bombshell",
  heroDesc: "The only vehicle under $40K with air suspension, tri-motor AWD, and a full-size 6-seat layout. Geely's answer to the Li Auto L9 - at nearly half the price",
  stat1Label: "km Range (Ext)", stat1Value: "1,500",
  stat2Label: "Air Susp", stat2Value: "Standard",
  stat3Label: "6-Seat", stat3Value: "Full-Size",
  whyTitle: "Why It Sells",
  whyDesc: "The value equation breaks the segment. Full-size luxury at compact price.",
  features: [
    { icon: "\uD83C\uDFD7\uFE0F", title: "Air Suspension Standard", desc: "Full air suspension with CDC adaptive damping at a price point where competitors charge extra." },
    { icon: "\u26A1", title: "Tri-Motor EREV", desc: "1.5T range extender + 3 electric motors deliver AWD with intelligent torque vectoring." },
    { icon: "\uD83E\uDD16", title: "AI Smart Cockpit", desc: "Geely's latest AI voice assistant understands natural language." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Full-Size 6-Seat SUV" }, { label: "Range (Ext EREV)", value: "1,500 km" }, { label: "Battery Capacity", value: "60 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "System Power", value: "Tri-Motor AWD" }, { label: "Drive Type", value: "Tri-Motor EREV AWD" }, { label: "0 - 100 km/h", value: "5.5 sec" }, { label: "Top Speed", value: "200 km/h" }, { label: "Fuel Tank", value: "60 L (EREV)" }, { label: "CLTC Pure Electric", value: "200 km" },
  ],
  specsRight: [
    { label: "Suspension", value: "Air + CDC Adaptive" }, { label: "Warranty", value: "5 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,230 x 1,999 x 1,800 mm" }, { label: "Wheelbase", value: "3,105 mm" }, { label: "Seating", value: "2+2+2 Six Seats" }, { label: "Audio", value: "Premium Surround" }, { label: "Rear Entertainment", value: "Dual Ceiling Screens" }, { label: "Sunroof", value: "Dual Panoramic" }, { label: "Airbags", value: "8" },
  ],
  fits: [
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66", title: "Large Family", desc: "Three-row configuration with independent second-row captain's chairs.", accent: "Family first class" },
    { icon: "\uD83D\uDCBC", title: "Value-Driven Executive", desc: "Full-size luxury SUV running costs at economy car levels.", accent: "Smart luxury" },
    { icon: "\uD83C\uDF0D", title: "Long-Distance Traveller", desc: "1,500 km range means cross-border trips without refuelling.", accent: "Cross-border ready" },
  ],
  relatedModels: [
    { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" }, { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Hongqi E-HS9", href: "/products/elite-flagship/hongqi-e-hs9" }, { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" },
  ],
  tags: ["Premium SUV", "EREV Value"],
  galleryImages: [
    { src: "/pic/elite-flagship/Galaxym9/1.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/9.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/8.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/10.webp", cat: "Exterior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/4.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/5.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/0.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/2.webp", cat: "Interior", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/3.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/13.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/11.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/12.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/15.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/14.webp", cat: "Detail", label: "" },
    { src: "/pic/elite-flagship/Galaxym9/16.webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$100K - $120K" }, { units: 20, display: "$200K - $240K" }, { units: 50, display: "$500K - $600K" }, { units: 100, display: "$1M - $1.2M" },
  ],
  batchMargin: { low: "$10,000", high: "$12,000" },
  trimData: [
    { name: "Standard", range: "650 km", accel: "6.8 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Lowest" },
    { name: "Comfort", range: "800 km", accel: "6.2 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Semi-Aniline", fob: "Low" },
    { name: "Premium", range: "1,500 km", accel: "5.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Semi-Aniline", fob: "Mid ★", rec: true },
    { name: "Flagship AWD", range: "1,400 km", accel: "4.8 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Aniline", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: LFP battery · Air suspension · Tri-motor AWD · AI cockpit.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
