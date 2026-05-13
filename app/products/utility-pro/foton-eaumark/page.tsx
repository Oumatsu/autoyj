import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Foton",
    name: "eAumark",
    fob: "$24,100 - $32,700",
    battery: "106.9 kWh",
    batteryType: "LFP",
    range: "400 km",
    charging: "Global light-truck leader - modular chassis + high-efficiency e-axle",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/eaumark/eaumark%20display.jpg",
    status: "factory",
    statusText: "Factory Order: 30 Days",
  },
  category: "utility-pro" as const,
  title: "Foton eAumark",
  subtitle: "Global Light Truck Leader",
  heroDesc: "Foton's global light truck platform delivers modular chassis versatility, high-efficiency e-axle, and fleet remote monitoring.",
  stat1Label: "km NEDC Range", stat1Value: "400",
  stat2Label: "Monthly Saving", stat2Value: "$800",
  stat3Label: "Modular", stat3Value: "Chassis",
  whyTitle: "Why It Sells",
  whyDesc: "The platform that builds businesses. Modular, monitored, massive TCO savings.",
  features: [
    { icon: "\uD83D\uDCD0", title: "Modular Chassis System", desc: "Engineered for multiple body configurations from a single platform." },
    { icon: "\uD83D\uDCCA", title: "Fleet Remote Monitoring", desc: "Real-time battery health, energy consumption, and location tracking." },
    { icon: "\uD83D\uDD27", title: "Global Service Network", desc: "Foton's worldwide commercial vehicle service infrastructure in 80+ countries." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Light Truck (4.5-7.5t)" }, { label: "Range (NEDC)", value: "400 km" }, { label: "Battery Capacity", value: "106.9 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "160 kW (218 hp)" }, { label: "Drive Type", value: "e-Axle RWD" }, { label: "Top Speed", value: "90 km/h" }, { label: "DC Fast Charge", value: "~60 min (10% -> 80%)" }, { label: "Max Torque", value: "850 N-m" }, { label: "Payload", value: "Up to 3,000 kg" },
  ],
  specsRight: [
    { label: "Chassis Type", value: "Modular" }, { label: "Warranty", value: "5 Yrs / 200,000 km" }, { label: "Frame", value: "High-Strength Steel" }, { label: "Wheelbase Options", value: "3,300 - 4,500 mm" }, { label: "Cab Config", value: "Single / Crew Cab" }, { label: "Remote Monitoring", value: "Standard" }, { label: "Regen Braking", value: "Adaptive" }, { label: "AC Charging", value: "22 kW AC" }, { label: "Body Options", value: "Box / Flatbed / Reefer" },
  ],
  fits: [
    { icon: "\u2744\uFE0F", title: "Cold-Chain Logistics", desc: "The modular chassis accepts refrigeration units directly.", accent: "Cold-chain ready" },
    { icon: "\uD83C\uDFD7\uFE0F", title: "Municipal Services", desc: "Electric power eliminates noise complaints on early-morning routes.", accent: "Municipal grade" },
    { icon: "\uD83D\uDCE6", title: "Regional Distribution", desc: "400 km range handles regional distribution routes.", accent: "Regional workhorse" },
  ],
  relatedModels: [
    { name: "BYD T5", href: "/products/utility-pro/byd-t5" }, { name: "Maxus eDeliver 9", href: "/products/utility-pro/maxus-edeliver-9" }, { name: "Farizon Super Van", href: "/products/utility-pro/farizon-super-van" }, { name: "Farizon Xingxiang V", href: "/products/utility-pro/farizon-xingxiang-v" },
  ],
  tags: ["Micro Truck", "Modular"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/eaumark/eaumark%20detail%20(5).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/eaumark/eaumark%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/eaumark/eaumark%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/eaumark/eaumark%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/eaumark/eaumark%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$80K - $108K" }, { units: 20, display: "$160K - $216K" }, { units: 50, display: "$400K - $540K" }, { units: 100, display: "$800K - $1.08M" },
  ],
  batchMargin: { low: "$8,000", high: "$10,800" },
};
export default function Page() { return <VehicleDetail data={data} />; }
