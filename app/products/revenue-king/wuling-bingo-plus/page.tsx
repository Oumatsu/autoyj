import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "Wuling",
    name: "Bingo Plus",
    fob: "$12,800 - $14,100",
    battery: "37.9 kWh",
    batteryType: "LFP",
    range: "510 km",
    charging: "Retro design + 510 km range + effortless driving",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/bingoplus/bingoplus%20display.jpg",
    status: "in-stock",
    statusText: "In Stock: Liuzhou",
  },
  category: "revenue-king" as const,
  title: "Wuling Bingo Plus",
  subtitle: "Retro Charm, Modern Range",
  heroDesc: "Retro-inspired design that turns heads, with 510 km of practical range that eliminates anxiety.",
  stat1Label: "km NEDC Range", stat1Value: "510",
  stat2Label: "Monthly Saving", stat2Value: "$180",
  stat3Label: "Retro", stat3Value: "Design",
  whyTitle: "Why It Sells",
  whyDesc: "Style meets substance. 510 km range in a fashion-forward package.",
  features: [
    { icon: "\uD83C\uDFA8", title: "Designer Looks", desc: "European-inspired retro styling at a fraction of the cost. Available in 8 youthful colours." },
    { icon: "\uD83D\uDD0B", title: "Segment-Leading Range", desc: "510 km from a compact battery means exceptional efficiency." },
    { icon: "\uD83D\uDE0A", title: "Effortless Driving", desc: "Lightweight, nimble, and incredibly easy to park. Perfect for first-time EV buyers." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Small Hatchback" }, { label: "Range (NEDC)", value: "510 km" }, { label: "Battery Capacity", value: "37.9 kWh" }, { label: "Battery Type", value: "LFP" }, { label: "Motor Power", value: "50 kW (68 hp)" }, { label: "Drive Type", value: "Front-Wheel Drive" }, { label: "0 - 50 km/h", value: "4.9 sec" }, { label: "Top Speed", value: "120 km/h" }, { label: "DC Fast Charge", value: "~35 min (30% -> 80%)" }, { label: "AC Slow Charge", value: "~5.5 hrs (0 -> 100%)" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 120,000 km" }, { label: "Dimensions (LxWxH)", value: "3,950 x 1,708 x 1,580 mm" }, { label: "Wheelbase", value: "2,560 mm" }, { label: "Boot Volume", value: "230 L" }, { label: "Seating Capacity", value: "4 Seats" }, { label: "Infotainment", value: "10.25\" Touchscreen" }, { label: "Airbags", value: "2" }, { label: "V2L Support", value: "Not Supported" },
  ],
  fits: [
    { icon: "\uD83C\uDF93", title: "First-Time EV Buyer", desc: "The easiest entry into EV ownership. Simple, stylish, and surprisingly spacious.", accent: "Perfect first EV" },
    { icon: "\uD83D\uDC69", title: "Urban Style Seeker", desc: "For buyers who want their car to make a statement.", accent: "Style icon" },
    { icon: "\uD83C\uDFD8\uFE0F", title: "Neighbourhood Runner", desc: "School drop-offs, market trips, and errands. The ultimate neighbourhood vehicle.", accent: "Local hero" },
  ],
  relatedModels: [
    { name: "Changan Lumin", href: "/products/revenue-king/changan-lumin" }, { name: "Leapmotor T03", href: "/products/revenue-king/leapmotor-t03" }, { name: "BYD Seagull", href: "/products/revenue-king/byd-seagull" }, { name: "BYD Dolphin", href: "/products/revenue-king/byd-dolphin" },
  ],
  tags: ["Hatchback", "510 km Range"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/bingoplus/bingo%20detail%20(4).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/bingoplus/bingo%20detail%20(3).jpg", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/bingoplus/bingo%20detail%20(2).jpg", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/bingoplus/bingo%20detail%20(1).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/bingoplus/bingo%20detail%20(1).jpg", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$42K - $45K" }, { units: 20, display: "$84K - $90K" }, { units: 50, display: "$210K - $225K" }, { units: 100, display: "$420K - $450K" },
  ],
  batchMargin: { low: "$4,200", high: "$4,500" },
};
export default function Page() { return <VehicleDetail data={data} />; }
