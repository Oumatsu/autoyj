import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "GAC Motor",
    name: "Aion Y Plus",
    fob: "$14,300 - $22,800",
    battery: "51.9 kWh",
    batteryType: "LFP",
    range: "430 km",
    charging: "Box design + wide-opening doors + camping-friendly",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/Yplus%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Guangzhou",
  },
  category: "revenue-king" as const,
  title: "GAC Aion Y Plus",
  subtitle: "The Space Box",
  heroDesc: "Unique boxy design maximises interior volume. Wide-opening doors, configurable rear seats, and camping-friendly features.",
  stat1Label: "km NEDC Range", stat1Value: "430",
  stat2Label: "Monthly Saving", stat2Value: "$300",
  stat3Label: "Box", stat3Value: "Design",
  whyTitle: "Why It Sells",
  whyDesc: "Space reimagined. Not just a car - a mobile room.",
  features: [
    { icon: "\uD83D\uDEAA", title: "90-degree Opening Doors", desc: "Rear doors open nearly perpendicular to the body for unparalleled access." },
    { icon: "\u26FA", title: "Camping Mode", desc: "Front seats fold fully flat to create a 1.8m bed. Combined with V2L power export." },
    { icon: "\uD83D\uDCD0", title: "TARDIS Interior", desc: "Despite compact external dimensions, the boxy shape yields class-leading headroom." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Compact MPV/SUV" }, { label: "Range (NEDC)", value: "430 km" }, { label: "Battery Capacity", value: "51.9 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "100 kW (136 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 100 km/h", value: "8.5 sec" }, { label: "Top Speed", value: "150 km/h" }, { label: "DC Fast Charge", value: "~30 min (30% -> 80%)" }, { label: "Turning Radius", value: "5.5 m" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "4,535 x 1,870 x 1,650 mm" }, { label: "Wheelbase", value: "2,750 mm" }, { label: "Boot Volume", value: "402 L (1,200 L folded)" }, { label: "Seating Capacity", value: "5 Seats" }, { label: "Sunroof", value: "Panoramic (Optional)" }, { label: "Airbags", value: "6" }, { label: "V2L Support", value: "3.3 kW" },
  ],
  fits: [
    { icon: "\uD83D\uDE95", title: "Mobility Service", desc: "Wide-opening doors and flat floor make this ideal for accessible conversions.", accent: "Accessible by design" },
    { icon: "\uD83C\uDFD5\uFE0F", title: "Weekend Adventurer", desc: "Built-in camping mode with fold-flat seats and V2L power.", accent: "Built for adventure" },
    { icon: "\uD83D\uDCE6", title: "Last-Mile Delivery", desc: "Remove the rear seats for 1,200L of flat cargo space.", accent: "Cargo master" },
  ],
  relatedModels: [
    { name: "Geely Galaxy E5", href: "/products/revenue-king/geely-galaxy-e5" }, { name: "Wuling Bingo Plus", href: "/products/revenue-king/wuling-bingo-plus" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" }, { name: "GAC Aion RT", href: "/products/revenue-king/gac-aion-rt" },
  ],
  tags: ["Compact SUV", "Mobile Office"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/Yplus%20detail%20(3).jpeg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/Yplus%20detail%20(2).jpeg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/Yplus%20detail%20(1).png", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/Yplus%20detail%20(1).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/T03/Yplus%20detail%20(1).jpeg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$48K - $75K" }, { units: 20, display: "$96K - $150K" }, { units: 50, display: "$240K - $375K" }, { units: 100, display: "$480K - $750K" },
  ],
  batchMargin: { low: "$4,800", high: "$7,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
