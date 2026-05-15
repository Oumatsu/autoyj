import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Fangchengbao",
    name: "Ti 3",
    fob: "$18,500 - $26,800",
    battery: "72.96 kWh",
    batteryType: "LFP Blade",
    range: "501 km",
    charging: "BYD's Formula Leopard — Star Wars design + 4.9s 0-100 + 151L front trunk + drone-ready",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(3).jpg",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "revenue-king" as const,
  title: "Fangchengbao Ti 3",
  subtitle: "Formula Leopard EV SUV",
  heroDesc: "BYD's Formula Leopard brand brings the rugged Ti 3 — a Star Wars-inspired compact SUV with 4.9s acceleration, AWD capability, and a massive 151L front trunk.",
  stat1Label: "km CLTC Range", stat1Value: "501",
  stat2Label: "0-100 km/h", stat2Value: "4.9s",
  stat3Label: "151L", stat3Value: "Frunk",
  whyTitle: "Why It Sells",
  whyDesc: "Rugged style meets EV performance. The Ti 3 is an off-road inspired SUV with supercar acceleration.",
  features: [
    { icon: "\uD83D\uDE80", title: "Dual-Motor AWD", desc: "110 kW front + 200 kW rear motors deliver 310 kW combined and 4.9s 0-100 km/h." },
    { icon: "\uD83E\uDEE0", title: "Star Wars Design", desc: "Hard-edged sci-fi inspired styling with 'jet fighter' cockpit, LED light bars, and exposed spare box." },
    { icon: "\uD83E\uDE9A", title: "151L Electric Front Trunk", desc: "Massive powered frunk for extra cargo. Plus 28L rear storage box for adventure gear." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact SUV" }, { label: "Range (CLTC)", value: "501 km" }, { label: "Battery Capacity", value: "72.96 kWh" }, { label: "Battery Type", value: "LFP Blade (CTB)" }, { label: "Motor Power (Combined)", value: "310 kW (422 hp)" }, { label: "Drive Type", value: "Dual-Motor AWD" }, { label: "0 - 100 km/h", value: "4.9 sec" }, { label: "Top Speed", value: "201 km/h" }, { label: "DC Fast Charge", value: "~18 min (30% -> 80%)" }, { label: "Approach/Depart", value: "25° / 28°" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,605 x 1,900 x 1,720 mm" }, { label: "Wheelbase", value: "2,745 mm" }, { label: "Front Trunk Volume", value: "151 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "6 kW Export" },
  ],
  fits: [
    { icon: "\uD83C\uDFD4\uFE0F", title: "Outdoor Adventurer", desc: "High ground clearance, rugged styling, and V2L power for off-grid camping trips.", accent: "Adventure built" },
    { icon: "\uD83D\uDE99", title: "Lifestyle SUV Buyer", desc: "Unique design stands out from the crowd. The Ti 3 makes a statement wherever it goes.", accent: "Head-turner" },
    { icon: "\uD83D\uDCA1", title: "Tech Pioneer", desc: "Drone-ready platform and BYD's latest EVO technology appeal to early adopters.", accent: "Innovation first" },
  ],
  relatedModels: [
    { name: "GAC Aion Y Plus", href: "/products/revenue-king/gac-aion-y-plus" }, { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" }, { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" },
  ],
  tags: ["Compact SUV", "AWD Performance"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(1).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Hi4-T/Hi4-T%20detail%20(1).webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$62K - $90K" }, { units: 20, display: "$124K - $180K" }, { units: 50, display: "$310K - $450K" }, { units: 100, display: "$620K - $900K" },
  ],
  batchMargin: { low: "$6,200", high: "$9,000" },
  trimData: [
    { name: "RWD Pro", range: "501 km", accel: "6.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Fabric", fob: "Lowest" },
    { name: "RWD Max", range: "501 km", accel: "6.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Low" },
    { name: "AWD Max ★", range: "501 km", accel: "4.9 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Mid ★", rec: true },
    { name: "AWD Ultra", range: "501 km", accel: "4.9 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: LFP Blade (CTB) · iTAC torque control · Yunnian-C suspension (higher trims).<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
