"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const galleryImages = [
  { src: "/pic/revenue-king/seagull/0.webp", cat: "Exterior", label: "" },
  { src: "/pic/revenue-king/seagull/1.webp", cat: "Exterior", label: "" },
  { src: "/pic/revenue-king/seagull/2.webp", cat: "Exterior", label: "" },
  { src: "/pic/revenue-king/seagull/3.webp", cat: "Exterior", label: "" },
  { src: "/pic/revenue-king/seagull/4.webp", cat: "Interior", label: "" },
  { src: "/pic/revenue-king/seagull/5.webp", cat: "Interior", label: "" },
  { src: "/pic/revenue-king/seagull/6.webp", cat: "Interior", label: "" },
  { src: "/pic/revenue-king/seagull/9.webp", cat: "Interior", label: "" },
  { src: "/pic/revenue-king/seagull/10.webp", cat: "Detail", label: "" },
  { src: "/pic/revenue-king/seagull/11.webp", cat: "Detail", label: "" },
  { src: "/pic/revenue-king/seagull/12.webp", cat: "Detail", label: "" },
  { src: "/pic/revenue-king/seagull/13.webp", cat: "Detail", label: "" },
  { src: "/pic/revenue-king/seagull/14.webp", cat: "Detail", label: "" },
  { src: "/pic/revenue-king/seagull/15.webp", cat: "Detail", label: "" },
  { src: "/pic/revenue-king/seagull/16.webp", cat: "Detail", label: "" },
];

const trimData = [
  { name: "Standard", range: "305 km", accel: "10.9 sec", sunroof: "✗ None", airbags: "4", seat: "Fabric", fob: "Lowest" },
  { name: "Comfort", range: "305 km", accel: "10.9 sec", sunroof: "✗ None", airbags: "6", seat: "Fabric", fob: "Low" },
  { name: "Honor", range: "405 km", accel: "9.7 sec", sunroof: "○ Optional", airbags: "6", seat: "Leatherette", fob: "Mid ★", rec: true },
  { name: "Distinguished", range: "405 km", accel: "9.7 sec", sunroof: "✓ Standard", airbags: "6", seat: "Full Leather", fob: "Premium" },
];

const batchLevels = [
  { units: 10, display: "$45K – $65K" },
  { units: 20, display: "$90K – $130K" },
  { units: 50, display: "$225K – $325K" },
  { units: 100, display: "$450K – $650K" },
];

const seagullTrimCards = [
  {
    name: "305km Vitality",
    cn: "305km Huo Li",
    price: "RMB 69,800",
    range: "305 km",
    battery: "30.08 kWh",
    charge: "30 kW DC",
    summary: "Lowest landed cost. Best for price-sensitive taxi fleets.",
    highlights: ["Lowest MSRP", "305 km CLTC", "Core safety kit"],
  },
  {
    name: "305km Freedom",
    cn: "305km Zi You",
    price: "RMB 78,800",
    range: "305 km",
    battery: "30.08 kWh",
    charge: "30 kW DC",
    summary: "Same range as Vitality, but with stronger cockpit and ADAS.",
    highlights: ["DiPilot L2", "12.8 in screen", "Seat heating"],
  },
  {
    name: "405km Ease",
    cn: "405km Zi Zai",
    price: "RMB 78,800",
    range: "405 km",
    battery: "38.88 kWh",
    charge: "40 kW DC",
    summary: "Long-range battery at the same list price as 305km Freedom.",
    highlights: ["405 km CLTC", "38.88 kWh battery", "Side airbags"],
  },
  {
    name: "405km Fly",
    cn: "405km Fei Xiang",
    price: "RMB 85,800",
    range: "405 km",
    battery: "38.88 kWh",
    charge: "40 kW DC",
    summary: "Best export recommendation: long range plus full comfort tech.",
    highlights: ["Best export pick", "405 km + DiPilot", "Highest resale story"],
    rec: true,
  },
];

const seagullDiffGroups = [
  {
    title: "Battery & Charging",
    rows: [
      ["CLTC range", "305 km", "305 km", "405 km", "405 km"],
      ["Battery capacity", "30.08 kWh", "30.08 kWh", "38.88 kWh", "38.88 kWh"],
      ["DC fast charge", "30 kW", "30 kW", "40 kW", "40 kW"],
      ["Curb weight", "1,160 kg", "1,160 kg", "1,240 kg", "1,240 kg"],
    ],
  },
  {
    title: "Driver Assistance",
    rows: [
      ["Camera view", "Reverse", "360 panoramic", "Reverse", "360 panoramic"],
      ["Front parking radar", "No", "Yes", "No", "Yes"],
      ["Cruise", "Fixed speed", "Full-speed ACC", "Fixed speed", "Full-speed ACC"],
      ["DiPilot L2", "No", "Yes", "No", "Yes"],
    ],
  },
  {
    title: "Comfort & Cabin",
    rows: [
      ["Wheel", "15 in steel", "Alloy", "Alloy", "Alloy"],
      ["Instrument cluster", "7 in", "8.8 in LCD", "7 in", "8.8 in LCD"],
      ["Center screen", "10.1 in", "12.8 in", "10.1 in", "12.8 in"],
      ["Driver seat", "Manual", "Power + heat", "Power + heat", "Power + heat"],
      ["Wireless charging", "No", "Yes", "No", "Yes"],
      ["Headlights", "Halogen", "LED", "LED", "LED"],
    ],
  },
  {
    title: "Safety Difference",
    rows: [
      ["Front airbags", "Yes", "Yes", "Yes", "Yes"],
      ["Front side airbags", "No", "No", "Yes", "Yes"],
      ["Side curtains", "Yes", "Yes", "Yes", "Yes"],
      ["Tire pressure", "Alarm", "Display", "Alarm", "Display"],
    ],
  },
];

const seagullSharedFeatures = [
  {
    title: "EV platform",
    items: ["55 kW / 135 Nm PM motor", "Front-wheel drive", "LFP Blade battery", "130 km/h top speed"],
  },
  {
    title: "Body & chassis",
    items: ["3780 x 1715 x 1540 mm", "2500 mm wheelbase", "5-door / 4-seat hatchback", "4.95 m turning radius"],
  },
  {
    title: "Charging & energy",
    items: ["30-80% DC fast charge in 30 min", "AC charging port", "DC charging port", "VTOL external discharge"],
  },
  {
    title: "Standard safety",
    items: ["ABS / EBD / ESP / TCS", "Rear parking radar", "Auto hold", "Hill start control"],
  },
  {
    title: "Daily equipment",
    items: ["Keyless start", "DiLink cockpit", "Bluetooth", "4 speakers"],
  },
  {
    title: "Dealer note",
    items: ["Export availability varies by batch", "Local homologation may differ", "Final config confirmed by VIN"],
  },
];

export default function BydSeagullPage() {
  const [galIdx, setGalIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [batchIdx, setBatchIdx] = useState(0);

  const goGallery = useCallback((dir: number) => {
    if (animating) return;
    setAnimating(true);
    setGalIdx((prev) => (prev + dir + galleryImages.length) % galleryImages.length);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const prevIdx = (galIdx - 1 + galleryImages.length) % galleryImages.length;
  const nextIdx = (galIdx + 1) % galleryImages.length;

  const batch = batchLevels[batchIdx];

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero */}
      <section data-vd-hero className="relative lg:min-h-screen flex items-end overflow-hidden bg-black w-full" style={{ aspectRatio: "4/3" }}>
        <style>{`@media (min-width: 1024px) { [data-vd-hero] { aspect-ratio: auto !important; height: 100vh; } }`}</style>
        <div className="absolute inset-0">
          <img
            src="/pic/revenue-king/seagull/8.webp"
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%) brightness(.95)" }}
            alt="BYD Seagull"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(28,28,28,.5) 28%, transparent 75%)" }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 40% at 70% 40%, rgba(16,185,129,.06) 0%, transparent 70%)" }} />
        <div
          className="absolute bottom-0 left-0 right-0 pointer-events-none z-0"
          style={{
            height: "clamp(120px, 14vh, 220px)",
            background: [
              `linear-gradient(`,
              `  to top,`,
              `  rgba(0,0,0,1) 0%,`,
              `  rgba(0,0,0,0.92) 18%,`,
              `  rgba(0,0,0,0.72) 38%,`,
              `  rgba(0,0,0,0.38) 62%,`,
              `  rgba(0,0,0,0.12) 82%,`,
              `  rgba(0,0,0,0) 100%`,
              `)`,
            ].join("\n"),
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 pb-12 lg:pb-20 pt-20 lg:pt-36">
          <nav className="hidden min-[504px]:flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition">Home</Link>
            <span>/</span>
            <Link href="/products/revenue-king" className="hover:text-accent transition text-accent">Revenue King</Link>
            <span>/</span>
            <span className="text-gray-500">BYD Seagull</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="hidden min-[504px]:flex items-center gap-3 mb-5">
                <span className="text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ background: "var(--color-gold)", color: "#000" }}>Global #1</span>
                <span className="text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ background: "rgba(16,185,129,.15)", color: "var(--color-green)", border: "1px solid rgba(16,185,129,.25)" }}>Revenue King</span>
              </div>
              <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-2" style={{ fontSize: "clamp(3.5rem,9vw,8rem)" }}>
                BYD<br />Seagull
              </h1>
              <p className="text-2xl font-light italic text-gray-500 mb-8">The Global #1 EV</p>
              <p className="hidden lg:block text-gray-300 text-base font-light leading-relaxed mb-10 max-w-lg italic border-l-2 pl-6" style={{ borderColor: "rgba(16,185,129,.45)" }}>
                The world&apos;s top-selling compact EV. The strongest weapon against the used ICE market — your customers save up to $250 every month.
              </p>
              <div className="hidden min-[456px]:flex flex-wrap gap-4">
                <a href="/qr" className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg">
                  WhatsApp Inquiry
                </a>
                <Link href="#specs" className="px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition">
                  View Full Specs ↓</Link>
              </div>
            </div>

            <div className="hidden min-[812px]:grid grid-cols-3 gap-3">
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20">
                <div className="text-3xl font-black italic text-accent mb-1">405</div>
                <div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">km CLTC Range</div>
              </div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-theme/20">
                <div className="text-3xl font-black italic text-theme mb-1">$250</div>
                <div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">Max Monthly Saving</div>
              </div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20">
                <div className="text-xl font-black italic text-white mb-1">Blade</div>
                <div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">LFP Battery</div>
              </div>
              <div className="col-span-3 glass rounded-[1.5rem] px-6 py-4 flex items-center justify-between border-theme/10">
                <div className="flex items-center gap-2.5">
                  <div className="pulse-dot" />
                  <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">Factory Price</span>
                </div>
                <Link href="/solutions/request-quote" className="text-[10px] font-black tracking-widest uppercase text-theme hover:text-white transition">
                  Request Batch Quote →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge: Hero (black) → Gallery (black) — same color, no bridge needed */}

      {/* Gallery — 21-stop fine gradient: #000 → mid at 2% intervals */}
      <section
        className="py-8 md:py-12 relative"
        style={{
          background: [
            `linear-gradient(to bottom,`,
            `  #000 0%,`,
            `  #000 60%,`,
            `  #010101 62%,`,
            `  #030303 64%,`,
            `  #040404 66%,`,
            `  #060606 68%,`,
            `  #070707 70%,`,
            `  #080808 72%,`,
            `  #0a0a0a 74%,`,
            `  #0b0b0b 76%,`,
            `  #0d0d0d 78%,`,
            `  #0e0e0e 80%,`,
            `  #0f0f0f 82%,`,
            `  #111111 84%,`,
            `  #121212 86%,`,
            `  #141414 88%,`,
            `  #151515 90%,`,
            `  #161616 92%,`,
            `  #181818 94%,`,
            `  #191919 96%,`,
            `  #1b1b1b 98%,`,
            `  #1c1c1c 100%`,
            `)`,
          ].join("\n"),
        }}
      >
        <style>{`
          @keyframes imgSwitchIn {
            from { opacity: 0.5; transform: scale(0.96); }
            to   { opacity: 1;   transform: scale(1);    }
          }
          .img-switch-in {
            animation: imgSwitchIn 500ms cubic-bezier(0.4, 0, 0.2, 1) both;
          }
        `}</style>
        <div className="container mx-auto px-2 md:px-6 max-w-7xl">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">

              {/* Left peek — pinned to left screen edge */}
              <div
                className="absolute left-0 inset-y-0 w-[18%] cursor-pointer overflow-hidden"
                onClick={() => goGallery(-1)}
              >
                <img
                  src={galleryImages[prevIdx].src}
                  className="h-full object-cover transition-opacity duration-700"
                  alt={galleryImages[prevIdx].label}
                  style={{ width: "200%", opacity: 0.4, borderRadius: "0 0.75rem 0.75rem 0", objectPosition: "right" }}
                />
              </div>

              {/* Center image — 16:9 aspect ratio drives the height */}
              <div
                className="relative mx-auto w-[60%] cursor-zoom-in"
                onClick={openLightbox}
                style={{ zIndex: 1, aspectRatio: "16/9" }}
              >
                <img
                  key={`center-img-${galIdx}`}
                  src={galleryImages[galIdx].src}
                  className="w-full h-full object-cover rounded-xl img-switch-in"
                  alt={galleryImages[galIdx].label}
                />
              </div>

              {/* Right peek — pinned to right screen edge */}
              <div
                className="absolute right-0 inset-y-0 w-[18%] cursor-pointer overflow-hidden"
                onClick={() => goGallery(1)}
              >
                <img
                  src={galleryImages[nextIdx].src}
                  className="h-full object-cover transition-opacity duration-700"
                  alt={galleryImages[nextIdx].label}
                  style={{ width: "200%", opacity: 0.4, borderRadius: "0.75rem 0 0 0.75rem", objectPosition: "left" }}
                />
              </div>

            </div>

            {/* Navigation arrows */}
            <button
              onClick={(e) => { e.stopPropagation(); goGallery(-1); }}
              className="absolute top-1/2 -translate-y-1/2 left-3 md:left-5 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20"
            >
              &lsaquo;
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goGallery(1); }}
              className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20"
            >
              &rsaquo;
            </button>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-2 mt-6 relative z-10">
            {galleryImages.map((_, i) => (
              <button
                key={i}
                onClick={() => { if (i !== galIdx) goGallery(i - galIdx); }}
                className={`w-2 h-2 rounded-full transition-all ${i === galIdx ? "bg-gold w-5" : "bg-white/20 hover:bg-white/40"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95" onClick={closeLightbox}>
          <button className="absolute top-5 right-6 w-10 h-10 rounded-full bg-white/7 border border-white/15 text-white text-lg flex items-center justify-center hover:bg-white/15 transition z-10" onClick={closeLightbox}>&times;</button>
          <button className="absolute top-1/2 -translate-y-1/2 left-5 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white text-2xl flex items-center justify-center hover:bg-gold/60 hover:text-black transition" onClick={(e) => { e.stopPropagation(); goGallery(-1); }}>&lsaquo;</button>
          <img src={galleryImages[galIdx].src} className="max-w-[92vw] max-h-[88vh] object-contain rounded-md" alt="" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 -translate-y-1/2 right-5 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white text-2xl flex items-center justify-center hover:bg-gold/60 hover:text-black transition" onClick={(e) => { e.stopPropagation(); goGallery(1); }}>&rsaquo;</button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-[11px] font-black tracking-[.2em]">{galIdx + 1} / {galleryImages.length}</div>
        </div>
      )}

      {/* Why It Sells */}
      <section className="py-12 md:py-16" style={{ background: "var(--color-mid)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="label mb-5">Why It Sells</div>
              <h2 className="sh mb-6" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
                The Strongest Weapon<br />Against <span className="text-theme">Used ICE</span>.
              </h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">
                The BYD Seagull consistently outsells every competitor in its class globally. For your customers still driving Toyota Vitz or Honda Fit — this is the upgrade that pays for itself within months.
              </p>
              <div className="flex flex-wrap gap-3">
                {["Network Taxi", "Urban Fleet", "Family 2nd Car", "First EV Buyer"].map((tag) => (
                  <span key={tag} className="text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)" }}>{tag}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { icon: "🛡️", title: "Blade Battery Safety", desc: "BYD's proprietary LFP Blade cell design eliminates thermal runaway — the #1 safety concern your customers ask about. Zero fire risk, maximum owner confidence." },
                { icon: "📱", title: 'Rotating 10.1" Touchscreen', desc: "A premium feature typically seen in $30,000+ cars — now standard in a budget EV. Your showroom's strongest visual closer when customers sit inside." },
                { icon: "✅", title: "1M+ Units Validated", desc: "Over one million Seagulls in daily operation worldwide. The maturity of this platform means lower defect rates, globally available parts, and minimal after-sales headache." },
              ].map((feat, i) => (
                <div key={i} className="rounded-[2rem] p-7 bg-white/[0.02] border border-accent/10 hover:border-accent/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "rgba(16,185,129,.1)" }}>{feat.icon}</div>
                    <div>
                      <h4 className="text-white font-black uppercase tracking-wider text-sm mb-2">{feat.title}</h4>
                      <p className="text-gray-300 text-sm font-light leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dealer ROI */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/pic/page/photo-1449965408869-eaa3f722e40d.webp" className="w-full h-full object-cover" style={{ filter: "brightness(.28) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,.80) 0%, rgba(10,10,10,.55) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <div className="label label-gold mb-5">The Business Case</div>
              <h2 className="sh mb-5" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>
                Your Margin.<br /><span className="text-theme">Your Market</span>.
              </h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">
                Africa&apos;s compact-car buyers are priced out of $25,000+ EVs but hungry to cut fuel bills. The Seagull lands exactly in the gap — an accessible entry price with a maximum cost-saving argument. That gap is your margin.
              </p>
              <div className="space-y-4 mb-8">
                {[
                  "Low entry price — accessible minimum order quantity",
                  "Fast inventory turnover — $200/mo saving closes deals quickly",
                  "Typical 10-unit batch gross: $45,000 – $65,000",
                ].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", border: "1px solid rgba(197,160,89,.3)" }}>{i + 1}</div>
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="glass rounded-[1.5rem] p-6 inline-block" style={{ background: "rgba(0,0,0,.4)", borderColor: "rgba(197,160,89,.25)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-1">Estimated Gross Margin per Unit</div>
                <div className="text-4xl font-black italic text-theme">$4,500 – $6,500</div>
              </div>
            </div>
            <div className="glass rounded-[2.5rem] p-8 md:p-10" style={{ background: "rgba(0,0,0,.48)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-8">Batch Profit Estimator</div>
              <div className="mb-8">
                <div className="flex justify-between mb-4">
                  <span className="text-xs font-black uppercase tracking-wider text-white">Units Ordered</span>
                  <span className="text-xs font-black text-theme">{batch.units} units</span>
                </div>
                <div className="flex gap-2">
                  {batchLevels.map((lvl, i) => (
                    <button
                      key={i}
                      onClick={() => setBatchIdx(i)}
                      className="flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition"
                      style={i === batchIdx ? { background: "var(--color-gold)", color: "#000" } : { background: "rgba(255,255,255,.06)", color: "#6B7280" }}
                    >
                      {lvl.units}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl p-6 text-center mb-6" style={{ background: "rgba(197,160,89,.08)", border: "1px solid rgba(197,160,89,.25)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">Estimated Gross Profit</div>
                <div className="text-4xl font-black italic text-white mb-1">{batch.display}</div>
                <div className="text-[9px] font-black tracking-widest uppercase text-theme">Before import duties & local costs</div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-xs"><span className="text-gray-600 font-black uppercase tracking-wider">Units</span><span className="text-white font-black">{batch.units}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-600 font-black uppercase tracking-wider">Margin / unit</span><span className="text-theme font-black">$4,500 – $6,500</span></div>
                <div className="flex justify-between text-xs border-t pt-3" style={{ borderColor: "rgba(255,255,255,.05)" }}><span className="text-gray-400 font-black uppercase tracking-wider">Total gross</span><span className="text-accent font-black">{batch.display}</span></div>
              </div>
              <p className="text-[9px] text-gray-700 text-center">*Based on typical East Africa retail pricing. <Link href="/solutions/request-quote" className="text-theme hover:text-white transition">Request a detailed quote</Link>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Table */}
      <section id="specs" className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/pic/page/photo-1503376780353-7e6692767b70.webp" className="w-full h-full object-cover" style={{ filter: "brightness(.35) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "rgba(10,10,10,.60)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="label mb-3">Full Specifications</div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">BYD Seagull — 2024 · 405km Trim</h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(16,185,129,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-accent mb-6 flex items-center gap-2"><span className="w-4 h-px bg-accent inline-block" /> Performance & Range</div>
              {[
                ["Vehicle Class", "Small Sedan"],
                ["Range (CLTC)", "405 km", true],
                ["Battery Capacity", "38.88 kWh"],
                ["Battery Type", "LFP Blade", false, true],
                ["Motor Power", "70 kW (95 hp)"],
                ["Drive Type", "Front-Wheel Drive"],
                ["0 – 100 km/h", "9.7 sec"],
                ["Top Speed", "130 km/h"],
                ["DC Fast Charge", "~30 min (30%→80%)", true],
                ["AC Slow Charge", "~6 hrs (0→100%)"],
              ].map(([label, value, green, gold], j) => (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 gap-3">
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase text-[#9CA3AF] flex-shrink-0">{label}</span>
                  <span className={`text-xs font-extrabold text-right ${green ? "text-accent" : gold ? "text-theme" : "text-white"}`}>{value}</span>
                </div>
              ))}
            </div>
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(197,160,89,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-theme mb-6 flex items-center gap-2"><span className="w-4 h-px bg-theme inline-block" /> Dimensions & Features</div>
              {[
                ["Household Charging", "Yes — 220V / ~18 hrs", true],
                ["Battery Warranty", "8 Yrs / 150,000 km", false, true],
                ["Dimensions (L×W×H)", "3,780 × 1,715 × 1,540 mm"],
                ["Boot Volume", "226 L"],
                ["Seating Capacity", "5 Seats"],
                ["Sunroof", "Available (Higher Trims)"],
                ["Ground Clearance", "130 mm"],
                ["Airbags", "6 (Front + Side + Curtain)"],
                ["V2L Support", "Not Supported"],
              ].map(([label, value, green, gold], j) => (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 gap-3">
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase text-[#9CA3AF] flex-shrink-0">{label}</span>
                  <span className={`text-xs font-extrabold text-right ${green ? "text-accent" : gold ? "text-theme" : "text-white"}`} style={value === "Not Supported" ? { color: "#6B7280" } : undefined}>{value}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-gray-700 mt-5 text-center">Specs shown for 2024 405km long-range trim. Multiple trim levels available — contact us for full trim comparison.</p>
        </div>
      </section>

      {/* Trim Comparison - configuration poster style */}
      <section className="py-14 md:py-20 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="label mb-3">All Versions - Side by Side</div>
              <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight text-white">
                BYD Seagull Trim Map
              </h2>
              <p className="text-gray-500 text-sm font-light mt-3 max-w-2xl">
                Differences are grouped like a showroom configuration sheet: version cards first, then only the equipment that changes, followed by all-trim standard equipment.
              </p>
            </div>
            <div className="text-[10px] font-black uppercase tracking-[.18em] text-gray-600">
              2025 China domestic trims / export config must be confirmed by VIN
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-5 mb-8">
            {seagullTrimCards.map((trim) => (
              <div
                key={trim.name}
                className={`relative rounded-[2rem] p-6 border transition-colors ${
                  trim.rec
                    ? "bg-accent/[0.08] border-accent/45 shadow-[0_0_40px_rgba(16,185,129,.08)]"
                    : "bg-white/[0.025] border-white/10"
                }`}
              >
                {trim.rec && (
                  <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[8px] font-black uppercase tracking-[.16em] text-black">
                    Recommended
                  </div>
                )}
                <div className="text-[10px] font-black uppercase tracking-[.18em] text-gray-600 mb-2">
                  {trim.cn}
                </div>
                <h3 className="text-xl font-black italic uppercase tracking-tight text-white mb-4">
                  {trim.name}
                </h3>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">Range</div>
                    <div className={`text-lg font-black italic ${trim.range === "405 km" ? "text-accent" : "text-white"}`}>{trim.range}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">Battery</div>
                    <div className="text-lg font-black italic text-theme">{trim.battery}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">DC Charge</div>
                    <div className="text-sm font-black text-white">{trim.charge}</div>
                  </div>
                  <div>
                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-600 mb-1">China MSRP</div>
                    <div className="text-sm font-black text-white">{trim.price}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-light leading-relaxed mb-5 min-h-[48px]">
                  {trim.summary}
                </p>
                <div className="space-y-2">
                  {trim.highlights.map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-gray-400">
                      <span className={`h-1.5 w-1.5 rounded-full ${trim.rec ? "bg-accent" : "bg-theme"}`} />
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto rounded-[2rem] border border-white/10 bg-black/25 mb-8">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[220px_repeat(4,1fr)] border-b border-white/10">
                <div className="p-4 text-[10px] font-black uppercase tracking-[.2em] text-gray-600">
                  Difference Only
                </div>
                {seagullTrimCards.map((trim) => (
                  <div
                    key={trim.name}
                    className={`p-4 text-center border-l border-white/5 ${trim.rec ? "bg-accent/[0.08]" : ""}`}
                  >
                    <div className="text-[10px] font-black uppercase tracking-[.14em] text-white">{trim.name}</div>
                    <div className="text-[9px] font-black uppercase tracking-[.12em] text-gray-600 mt-1">{trim.price}</div>
                  </div>
                ))}
              </div>

              {seagullDiffGroups.map((group) => (
                <div key={group.title}>
                  <div className="px-4 py-3 bg-white/[0.035] border-b border-white/5 text-[10px] font-black uppercase tracking-[.18em] text-accent">
                    {group.title}
                  </div>
                  {group.rows.map(([label, ...values]) => (
                    <div key={label} className="grid grid-cols-[220px_repeat(4,1fr)] border-b border-white/[0.04] last:border-b-0">
                      <div className="px-4 py-3 text-[10px] font-black uppercase tracking-[.1em] text-gray-500">
                        {label}
                      </div>
                      {values.map((value, idx) => {
                        const isPositive = value === "Yes" || value.includes("405") || value.includes("360") || value.includes("DiPilot") || value.includes("12.8") || value.includes("Power");
                        const isNo = value === "No" || value === "Halogen" || value.includes("steel") || value === "Manual";
                        return (
                          <div
                            key={`${label}-${idx}`}
                            className={`px-4 py-3 text-center text-xs font-bold border-l border-white/[0.04] ${
                              seagullTrimCards[idx].rec ? "bg-accent/[0.06]" : ""
                            }`}
                          >
                            <span className={isPositive ? "text-accent" : isNo ? "text-gray-600" : "text-white"}>
                              {value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-theme/20 bg-theme/[0.045] p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
              <div>
                <div className="label label-gold mb-3">All Trims Include</div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
                  Standard Equipment Across Every Version
                </h3>
              </div>
              <Link href="/contact" className="btn-primary px-7 py-3 rounded text-xs font-black tracking-widest uppercase italic flex-shrink-0">
                Request Trim Pricing
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {seagullSharedFeatures.map((group) => (
                <div key={group.title} className="rounded-2xl bg-black/20 border border-white/5 p-5">
                  <div className="text-[10px] font-black uppercase tracking-[.18em] text-theme mb-4">{group.title}</div>
                  <div className="space-y-2">
                    {group.items.map((item) => (
                      <div key={item} className="flex gap-2 text-xs text-gray-400 font-light leading-relaxed">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-700 mt-5">
              Data note: BYD Ethiopia currently publishes 305KM Active and 405KM Fly export specs; the four-column map above uses China domestic 2025 trim configuration names for comparison planning. Confirm exact export equipment by VIN before quoting.
            </p>
          </div>
        </div>
      </section>

      {/* Legacy Trim Comparison */}
      <section className="hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10">
            <div className="label mb-3">All Versions — Side by Side</div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Choose Your Trim</h2>
            <p className="text-gray-500 text-sm font-light mt-2">6 key decision factors 鈥?everything else is identical across all trims.</p>
          </div>
          <div className="overflow-x-auto pb-2 rounded-[1.5rem] border border-white/10 bg-white/[0.025]">
            <table className="w-full border-collapse min-w-[720px]">
              <thead>
                <tr>
                  <th className="py-3.5 px-3.5 text-[10px] font-black tracking-[.15em] uppercase border-b border-white/[0.07] text-left w-[210px] text-[#4B5563]"></th>
                  {trimData.map((t) => (
                    <th key={t.name} className={`py-3.5 px-3.5 text-[10px] font-black tracking-[.15em] uppercase border-b border-white/[0.07] text-center ${t.rec ? "border-b-2 border-b-accent bg-accent/[0.07] rounded-t-xl text-white" : "text-[#6B7280]"}`}>
                      {t.range}<br /><span className="text-[9px] font-semibold">{t.name}</span>
                      {t.rec && <span className="block mt-1 text-[8px] font-black tracking-[.12em] bg-accent text-theme px-1.5 py-0.5 rounded inline-block">★ RECOMMENDED</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Range (CLTC)", key: "range" as const, diff: true },
                  { label: "0 – 100 km/h", key: "accel" as const, diff: true },
                  { label: "Sunroof", key: "sunroof" as const, diff: true },
                  { label: "Airbags", key: "airbags" as const, diff: true },
                  { label: "Seat Material", key: "seat" as const, diff: true },
                  { label: "Price Level", key: "fob" as const, diff: true },
                ].map((row) => (
                  <tr key={row.label} className={row.diff ? "[&>td]:text-[#F3F4F6]" : ""}>
                    <td className={`py-2.5 px-3.5 text-[10px] font-black tracking-[.08em] uppercase text-left ${row.diff ? "text-accent border-l-2 border-l-accent pl-2.5" : "text-[#6B7280]"}`}>{row.label}</td>
                    {trimData.map((t, j) => {
                      const val = t[row.key];
                      const isRec = t.rec;
                      const isGreen = row.key === "range" && val.includes("405");
                      return (
                        <td key={j} className={`py-2.5 px-3.5 text-xs font-bold border-b border-white/[0.04] text-center align-middle ${isRec ? "bg-accent/[0.07]" : ""}`}>
                          <span style={{ color: isGreen ? "var(--color-green)" : val === "✗ None" ? "#F87171" : isRec ? "var(--color-green)" : undefined, fontWeight: isGreen ? 900 : 700 }}>
                            {val}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-5">
            <p className="text-[10px] text-gray-700">
              * 2024 model year. All trims share: LFP Blade battery · FWD · 130 km/h top speed · 8-yr battery warranty.<br />
              Pricing on request — varies by order volume & destination port.
            </p>
            <Link href="/contact" className="btn-primary px-7 py-3 rounded text-xs font-black tracking-widest uppercase italic flex-shrink-0">
              Request Trim Pricing →</Link>
          </div>
        </div>
      </section>

      {/* Fit For */}
      <section className="py-12 md:py-16 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="label justify-center mb-3">Ideal Customer Profile</div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Who Should Buy This Car?</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: "🚖", title: "Network Taxi Operator", desc: "High daily mileage makes the fuel saving dramatic. Drivers reduce costs by $200+/mo, improving retention and attracting new recruits to your fleet.", accent: "Best ROI in category", accentColor: "var(--color-green)" },
              { icon: "🏙️", title: "Urban Family — 2nd Car", desc: "School runs, market trips, daily commutes under 80km/day. Charges overnight at home from a standard socket. Eliminates petrol spending entirely for weekday use.", accent: "Home charging compatible", accentColor: "var(--color-gold)" },
              { icon: "🏪", title: "Entry-Level Fleet Dealer", desc: "Start with 5–10 units and the lowest possible per-unit risk. The Seagull's 1M+ validation record means minimal warranty claims and easy resale if needed.", accent: "Lowest entry risk", accentColor: "var(--color-green)" },
            ].map((fit, i) => (
              <div key={i} className="rounded-[2rem] p-7 bg-white/[0.015] border border-theme/10 hover:border-accent/25 hover:bg-accent/[0.03] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-lg flex-shrink-0" style={i === 1 ? { background: "rgba(197,160,89,.1)" } : { background: "rgba(16,185,129,.12)" }}>{fit.icon}</div>
                <h4 className="text-white font-black uppercase tracking-wider text-sm mb-3">{fit.title}</h4>
                <p className="text-gray-300 text-sm font-light leading-relaxed mb-5">{fit.desc}</p>
                <div className="text-[9px] font-black tracking-widest uppercase" style={{ color: fit.accentColor }}>{fit.accent}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


    </>
  );
}
