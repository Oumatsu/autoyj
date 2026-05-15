import VehicleDetail from "../../_VehicleDetail";

const data = {
  vehicle: {
    brand: "BYD",
    name: "Tang L EV",
    fob: "$32,100 - $40,600",
    battery: "100.5 kWh",
    batteryType: "LFP Blade",
    range: "670 km",
    charging: "[Super e-Platform] BYD's flagship 7-seat SUV — 810 kW tri-motor + 3.6s 0-100 + Megawatt flash charging + LiDAR",
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/M9/M9%20display.webp",
    status: "factory",
    statusText: "Factory Order: 21 Days",
  },
  category: "elite-flagship" as const,
  title: "BYD Tang L EV",
  subtitle: "Family Flagship SUV",
  heroDesc: "BYD's most advanced family SUV on the Super e-Platform. Tri-motor AWD with 810 kW, 3.6s 0-100, and Megawatt flash charging for the whole family.",
  stat1Label: "km CLTC Range", stat1Value: "670",
  stat2Label: "0-100 km/h", stat2Value: "3.6s",
  stat3Label: "810kW", stat3Value: "Tri-Motor",
  whyTitle: "Why It Sells",
  whyDesc: "Flagship performance meets family practicality. 7 seats, 3.6s acceleration, and BYD's latest technology.",
  features: [
    { icon: "\u26A1", title: "Super e-Platform", desc: "1,000V architecture with Megawatt flash charging. 10-80% in just 10 minutes with dual-gun charging." },
    { icon: "\uD83D\uDE80", title: "Tri-Motor AWD", desc: "230 kW front + 580 kW rear = 810 kW combined. Hypercar-level performance in a family SUV." },
    { icon: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67", title: "7-Seat Family SUV", desc: "2+3+2 seating with heated/ventilated/massage seats for first two rows. 21-speaker premium audio." },
  ],
  specsLeft: [
    { label: "Vehicle Class", value: "Mid-Large SUV (7-Seat)" }, { label: "Range (CLTC)", value: "600 / 670 km" }, { label: "Battery Capacity", value: "100.5 kWh" }, { label: "Battery Type", value: "LFP Blade (2nd Gen)" }, { label: "Motor Power", value: "500 - 810 kW (680 - 1,102 hp)" }, { label: "Drive Type", value: "RWD / Tri-Motor AWD" }, { label: "0 - 100 km/h", value: "3.6 sec (Tri-Motor)" }, { label: "Top Speed", value: "220 km/h" }, { label: "DC Fast Charge", value: "~10 min (30% -> 80% Dual Gun)" }, { label: "V2L Export", value: "6 kW" },
  ],
  specsRight: [
    { label: "Household Charging", value: "Yes - 220V" }, { label: "Battery Warranty", value: "8 Yrs / 150,000 km" }, { label: "Dimensions (LxWxH)", value: "5,040 x 1,996 x 1,760 mm" }, { label: "Wheelbase", value: "2,950 mm" }, { label: "Boot Volume", value: "235 - 1,650 L" }, { label: "Seating Capacity", value: "7 Seats (2+3+2)" }, { label: "Sunroof", value: "✓ Panoramic" }, { label: "Airbags", value: "8" }, { label: "DiPilot 300", value: "LiDAR + Orin X" },
  ],
  fits: [
    { icon: "\uD83D\uDC69\u200D\uD83D\uDC69\u200D\uD83D\uDC66", title: "Large Family", desc: "7 seats with genuine third-row comfort. The ultimate family road trip vehicle.", accent: "Family flagship" },
    { icon: "\uD83D\uDE99", title: "Executive Transport", desc: "Premium interior, massage seats, and 3.6s performance for VIP transport services.", accent: "VIP ready" },
    { icon: "\uD83C\uDFD5\uFE0F", title: "Outdoor Family", desc: "V2L power, huge cargo capacity, and flash charging for zero-worry adventures.", accent: "Adventure base" },
  ],
  relatedModels: [
    { name: "BYD Sealion 7", href: "/products/elite-flagship/byd-sealion-7" }, { name: "BYD Han EV", href: "/products/elite-flagship/byd-han-ev" }, { name: "AITO M9", href: "/products/elite-flagship/aito-m9" }, { name: "Li Auto L6", href: "/products/elite-flagship/li-auto-l6" },
  ],
  tags: ["Premium SUV", "7-Seat Family"],
  galleryImages: [
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/M9/M9%20detail%20(5).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/M9/M9%20detail%20(4).webp", cat: "Exterior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/M9/M9%20detail%20(3).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/M9/M9%20detail%20(2).webp", cat: "Interior", label: "" },
    { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/M9/M9%20detail%20(1).webp", cat: "Detail", label: "" },
  ],
  batchLevels: [
    { units: 10, display: "$108K - $138K" }, { units: 20, display: "$216K - $276K" }, { units: 50, display: "$540K - $690K" }, { units: 100, display: "$1.08M - $1.38M" },
  ],
  batchMargin: { low: "$10,800", high: "$13,800" },
  trimData: [
    { name: "670 RWD", range: "670 km", accel: "5.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Leatherette", fob: "Lowest" },
    { name: "670 RWD Pro", range: "670 km", accel: "5.5 sec", sunroof: "✓ Panoramic", airbags: "6", seat: "Nappa Leather", fob: "Low" },
    { name: "600 AWD ★", range: "600 km", accel: "3.6 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Nappa Leather", fob: "Mid ★", rec: true },
    { name: "600 AWD Ultimate", range: "600 km", accel: "3.6 sec", sunroof: "✓ Panoramic", airbags: "8", seat: "Full Nappa", fob: "Premium" },
  ],
  trimNote: "* Current model year. All trims share: LFP Blade · DiPilot 300 LiDAR · Super e-Platform · V2L · 7-seat.<br />Pricing on request — varies by order volume & destination port.",
};
export default function Page() { return <VehicleDetail data={data} />; }
