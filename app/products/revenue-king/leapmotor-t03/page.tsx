import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Leapmotor",
    name: "T03",
    fob: "$7,100 - $10,000",
    battery: "41.3 kWh",
    batteryType: "LFP",
    range: "403 km",
    charging: "Stellantis-backed + European standards + dual 8\"+10\" screens",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/T03%20display.png",
    status: "factory",
    statusText: "Factory Order: 14 Days",
  },
  category: "revenue-king" as const,
  title: "Leapmotor T03",
  subtitle: "European Standard, Chinese Price",
  heroDesc: "Stellantis Group backing assures European quality standards. Dual screens and voice control at an unbeatable price.",
  stat1Label: "km NEDC Range", stat1Value: "403",
  stat2Label: "Monthly Saving", stat2Value: "$200",
  stat3Label: "Stellantis", stat3Value: "Backed",
  whyTitle: "Why It Sells",
  whyDesc: "European DNA. World-class quality assurance at entry-level pricing.",
  features: [
    { icon: "\uD83C\uDDEA\uD83C\uDDFA", title: "Stellantis Backed", desc: "Leapmotor's partnership with Stellantis ensures European quality control." },
    { icon: "\uD83D\uDCF1", title: "Dual Screen Cockpit", desc: "8\" digital cluster + 10\" centre touchscreen as standard." },
    { icon: "\uD83D\uDD0B", title: "Outstanding Efficiency", desc: "41.3 kWh battery achieves 403 km - one of the most efficient EVs in its class." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Micro Hatchback" }, { label: "Range (NEDC)", value: "403 km" }, { label: "Battery Capacity", value: "41.3 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "55 kW (75 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 50 km/h", value: "5.0 sec" }, { label: "Top Speed", value: "110 km/h" }, { label: "DC Fast Charge", value: "~36 min (30% -> 80%)" }, { label: "AC Slow Charge", value: "~6.5 hrs (0 -> 100%)" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 120,000 km" }, { label: "Dimensions (LxWxH)", value: "3,620 x 1,652 x 1,577 mm" }, { label: "Wheelbase", value: "2,400 mm" }, { label: "Boot Volume", value: "210 L" }, { label: "Seating Capacity", value: "4 Seats" }, { label: "Infotainment", value: "8\" + 10\" Dual Screen" }, { label: "Airbags", value: "2" }, { label: "Voice Control", value: "Standard" },
  ],
  fits: [
    { icon: "\uD83C\uDFD9\uFE0F", title: "City Commuter", desc: "The perfect urban runabout. Tiny footprint means easy parking anywhere.", accent: "Ultimate city car" },
    { icon: "\uD83C\uDF93", title: "Tech-Savvy Youth", desc: "Dual screens and voice control appeal to younger buyers.", accent: "Tech forward" },
    { icon: "\uD83D\uDD04", title: "Fleet Starter Pack", desc: "The lowest-risk entry into EV fleet operations.", accent: "Low risk entry" },
  ],
  relatedModels: [
    { name: "Changan Lumin", href: "/products/revenue-king/changan-lumin" }, { name: "Wuling Bingo Plus", href: "/products/revenue-king/wuling-bingo-plus" }, { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" },
  ],
  tags: ["Micro EV", "European Standard"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/T03%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/T03%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/T03%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/T03%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/T03%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$24K - $33K" }, { units: 20, display: "$48K - $66K" }, { units: 50, display: "$120K - $165K" }, { units: 100, display: "$240K - $330K" },
  ],
  batchMargin: { low: "$2,400", high: "$3,300" },
};
export default function Page() { return <VehicleDetail data={data} />; }
