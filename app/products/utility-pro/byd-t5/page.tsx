import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "T5",
    fob: "$23,300 - $24,700",
    battery: "85.0 kWh",
    batteryType: "LFP Blade",
    range: "275 km",
    charging: "Built for bulk urban delivery - Blade Battery + reinforced frame",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20display.webp",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "utility-pro" as const,
  title: "BYD T5",
  subtitle: "Electric Light Truck",
  heroDesc: "Purpose-built for bulk urban delivery. Blade Battery safety, reinforced ladder frame, and super-fast DC charging.",
  stat1Label: "km NEDC Range", stat1Value: "275",
  stat2Label: "Monthly Saving", stat2Value: "$600",
  stat3Label: "Blade", stat3Value: "Battery",
  whyTitle: "Why It Sells",
  whyDesc: "The diesel killer. Zero emissions, maximum savings.",
  features: [
    { icon: "\uD83D\uDCB0", title: "$600+/mo Saving", desc: "Electricity costs ~15% of equivalent diesel. Combined with lower maintenance." },
    { icon: "\uD83D\uDD0B", title: "Super Fast Charging", desc: "120 kW DC fast charging gets you back on the road in 30 minutes." },
    { icon: "\uD83D\uDCE6", title: "Flexible Upfitting", desc: "Available as chassis-cab for custom bodies. Flatbed, box van, refrigerated." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Light Truck (4.5t)" }, { label: "Range (NEDC)", value: "275 km" }, { label: "Battery Capacity", value: "85 kWh" }, { label: "Battery Type", value: "LFP Blade" }, { label: "Motor Power", value: "130 kW (177 hp)" }, { label: "Drive Type", value: "Rear-Wheel Drive" }, { label: "Top Speed", value: "100 km/h" }, { label: "DC Fast Charge", value: "~30 min (10% -> 80%)" }, { label: "AC Slow Charge", value: "~10 hrs" }, { label: "GVW", value: "4,495 kg" },
  ],
  specsRight: [
    { label: "Payload", value: "~1,500 kg" }, { label: "Warranty", value: "5 Yrs / 200,000 km" }, { label: "Frame", value: "Ladder Frame" }, { label: "Wheelbase", value: "3,360 mm" }, { label: "Turning Radius", value: "6.5 m" }, { label: "Cab Configuration", value: "Single Cab" }, { label: "Infotainment", value: "10.1\" Screen" }, { label: "Air Conditioning", value: "Standard" }, { label: "Regenerative Braking", value: "Multi-Level" },
  ],
  fits: [
    { icon: "\uD83D\uDE9B", title: "Urban Delivery Fleet", desc: "The ideal last-mile vehicle. Quiet enough for early-morning deliveries.", accent: "Last-mile champion" },
    { icon: "\uD83C\uDFEA", title: "Wholesale Distribution", desc: "Predictable TCO with minimal maintenance.", accent: "Predictable costs" },
    { icon: "\uD83C\uDF0D", title: "Green Logistics", desc: "Meet corporate ESG targets and city zero-emission zone requirements.", accent: "ESG compliant" },
  ],
  relatedModels: [
    { name: "Foton eAumark", href: "/products/utility-pro/foton-eaumark" }, { name: "Farizon Super Van", href: "/products/utility-pro/farizon-super-van" }, { name: "Maxus eDeliver 9", href: "/products/utility-pro/maxus-edeliver-9" }, { name: "Farizon Xingxiang V", href: "/products/utility-pro/farizon-xingxiang-v" },
  ],
  tags: ["Micro Truck", "Blade Battery"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20detail%20(5).jpeg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20detail%20(4).jpeg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20detail%20(3).jpeg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20detail%20(2).jpeg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20detail%20(1).webp", cat: "Detail", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T5/T5%20detail%20(1).jpeg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$77K - $82K" }, { units: 20, display: "$154K - $164K" }, { units: 50, display: "$385K - $410K" }, { units: 100, display: "$770K - $820K" },
  ],
  batchMargin: { low: "$7,700", high: "$8,200" },
};
export default function Page() { return <VehicleDetail data={data} />; }
