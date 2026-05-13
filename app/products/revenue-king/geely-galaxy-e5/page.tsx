import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Geely",
    name: "Galaxy E5",
    fob: "$15,700 - $20,800",
    battery: "60.0 kWh",
    batteryType: "LFP",
    range: "530 km",
    charging: "[Battle-Tested] Shield Short-Blade battery + Galaxy OS + global safety design",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Galaxye5/Galaxye5%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Shanghai",
  },
  category: "revenue-king" as const,
  title: "Geely Galaxy E5",
  subtitle: "The Battle-Tested SUV",
  heroDesc: "Geely's global export pillar with exceptional mechanical quality. Shield Short-Blade battery, Galaxy OS, and global safety certification make this the all-rounder compact SUV.",
  stat1Label: "km CLTC Range", stat1Value: "530",
  stat2Label: "Monthly Saving", stat2Value: "$220",
  stat3Label: "Aegis", stat3Value: "Battery",
  whyTitle: "Why It Sells",
  whyDesc: "The safest bet. Geely's global safety standard in an affordable SUV.",
  features: [
    { icon: "\uD83D\uDEE1\uFE0F", title: "Shield Short-Blade Battery", desc: "Geely's proprietary battery passes 36-ton tank crush tests and 8-needle simultaneous puncture." },
    { icon: "\uD83D\uDCF1", title: "Galaxy OS + Flyme Auto", desc: "15.4-inch 2.5K display with 7nm chip. Voice control covers 95% of vehicle functions. OTA keeps the car fresh." },
    { icon: "\uD83C\uDF0D", title: "Global Safety Certified", desc: "Euro NCAP & ANCAP dual 5-star rating. The only Chinese EV SUV in its class with both certifications." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact SUV" }, { label: "Range (CLTC)", value: "530 km" }, { label: "Battery Capacity", value: "60.22 kWh" }, { label: "Battery Type", value: "LFP (Shield)" }, { label: "Motor Power", value: "160 kW (218 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "6.9 sec" }, { label: "Top Speed", value: "180 km/h" }, { label: "DC Fast Charge", value: "~20 min (30% -> 80%)" }, { label: "AC Slow Charge", value: "~9 hrs (0 -> 100%)" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "Lifetime (1st Owner)" }, { label: "Dimensions (LxWxH)", value: "4,615 x 1,901 x 1,670 mm" }, { label: "Wheelbase", value: "2,750 mm" }, { label: "Boot Volume", value: "461 L" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Panoramic (Mid+ Trim)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "6.5 kW Export" },
  ],
  fits: [
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", title: "Family SUV Buyer", desc: "The safest choice for families. Dual 5-star safety, spacious cabin, and low running costs.", accent: "Family safety first" },
    { icon: "\uD83C\uDFDE\uFE0F", title: "Active Lifestyle", desc: "V2L support turns the E5 into a mobile power station for camping trips.", accent: "Adventure ready" },
    { icon: "\uD83D\uDCCA", title: "Company Fleet SUV", desc: "Global certifications simplify insurance and compliance.", accent: "Compliant globally" },
  ],
  relatedModels: [
    { name: "GAC Aion Y Plus", href: "/products/revenue-king/gac-aion-y-plus" }, { name: "Geely Geometry C", href: "/products/revenue-king/geely-geometry-c" }, { name: "BYD Qin PLUS EV", href: "/products/revenue-king/byd-qin-plus" }, { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" },
  ],
  tags: ["Compact SUV", "Dual 5-Star"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Galaxye5/Galaxye5%20detail%20(5).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Galaxye5/Galaxye5%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Galaxye5/Galaxye5%20detail%20(3).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Galaxye5/Galaxye5%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/Galaxye5/Galaxye5%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$50K - $65K" }, { units: 20, display: "$100K - $130K" }, { units: 50, display: "$250K - $325K" }, { units: 100, display: "$500K - $650K" },
  ],
  batchMargin: { low: "$5,000", high: "$6,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
