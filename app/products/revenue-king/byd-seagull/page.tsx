"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const galleryImages = [
  { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20detail%20(2).webp", cat: "Exterior", label: "" },
  { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20detail%20(2).jpg", cat: "Exterior", label: "" },
  { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20detail%20(1).webp", cat: "Interior", label: "" },
  { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20detail%20(1).png", cat: "Interior", label: "" },
  { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20detail%20(1).jpg", cat: "Detail", label: "" },
  { src: "https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20detail%20(1).jpeg", cat: "Detail", label: "" },
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
      {/* Hero */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-bg2">
        <div className="absolute inset-0">
          <img
            src="https://6a0327d1fc46b5b25f3480d6.imgix.net/seagull/seagull%20display.png"
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(100%) brightness(.95)" }}
            alt="BYD Seagull"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,15,15,.95) 10%, rgba(15,15,15,.35) 42%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,15,15,.5) 28%, transparent 75%)" }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 40% at 70% 40%, rgba(16,185,129,.06) 0%, transparent 70%)" }} />

        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-20 pt-36">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition">Home</Link>
            <span>/</span>
            <Link href="/products/revenue-king" className="hover:text-accent transition text-accent">Revenue King</Link>
            <span>/</span>
            <span className="text-gray-500">BYD Seagull</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ background: "var(--color-gold)", color: "#000" }}>Global #1</span>
                <span className="text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ background: "rgba(16,185,129,.15)", color: "var(--color-green)", border: "1px solid rgba(16,185,129,.25)" }}>Revenue King</span>
              </div>
              <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-2" style={{ fontSize: "clamp(3.5rem,9vw,8rem)" }}>
                BYD<br />Seagull
              </h1>
              <p className="text-2xl font-light italic text-gray-500 mb-8">海鸥 — 2024 Edition</p>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-10 max-w-lg italic border-l-2 pl-6" style={{ borderColor: "rgba(16,185,129,.45)" }}>
                The world&apos;s top-selling compact EV. The strongest weapon against the used ICE market — your customers save up to $250 every month.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/your-number" className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg">
                  WhatsApp Inquiry
                </a>
                <Link href="#specs" className="px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition">
                  View Full Specs ↓</Link>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
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
                <Link href="/contact" className="text-[10px] font-black tracking-widest uppercase text-theme hover:text-white transition">
                  Request Batch Quote →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-black py-8 md:py-12">
        <style>{`
          @keyframes imgSwitchIn {
            from { opacity: 0.5; transform: scale(0.96); }
            to   { opacity: 1;   transform: scale(1);    }
          }
          .img-switch-in {
            animation: imgSwitchIn 500ms cubic-bezier(0.4, 0, 0.2, 1) both;
          }
        `}</style>
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="relative" style={{ height: "clamp(280px, 50vw, 540px)" }}>
            <div className="relative h-full rounded-2xl overflow-hidden bg-black">

              {/* Left peek — pinned to left screen edge */}
              <div
                className="absolute left-0 top-0 w-[7%] h-full cursor-pointer overflow-hidden"
                onClick={() => goGallery(-1)}
              >
                <img
                  src={galleryImages[prevIdx].src}
                  className="w-full h-full object-cover transition-opacity duration-700"
                  alt={galleryImages[prevIdx].label}
                  style={{ opacity: 0.4, borderRadius: "0 0.75rem 0.75rem 0" }}
                />
                <div className="absolute inset-0 bg-black/35" style={{ borderRadius: "0 0.75rem 0.75rem 0" }} />
              </div>

              {/* Center image — centered with space on both sides */}
              <div
                className="relative mx-auto w-[85%] h-full cursor-zoom-in"
                onClick={openLightbox}
                style={{ zIndex: 1 }}
              >
                <img
                  key={`center-img-${galIdx}`}
                  src={galleryImages[galIdx].src}
                  className="w-full h-full object-cover rounded-xl img-switch-in"
                  alt={galleryImages[galIdx].label}
                />
                <div className="absolute bottom-4 left-4 bg-black/65 border border-accent/30 text-accent text-[9px] font-black tracking-[.3em] uppercase px-3 py-1 rounded-full z-10">
                  {galleryImages[galIdx].cat}
                </div>
              </div>

              {/* Right peek — pinned to right screen edge */}
              <div
                className="absolute right-0 top-0 w-[7%] h-full cursor-pointer overflow-hidden"
                onClick={() => goGallery(1)}
              >
                <img
                  src={galleryImages[nextIdx].src}
                  className="w-full h-full object-cover transition-opacity duration-700"
                  alt={galleryImages[nextIdx].label}
                  style={{ opacity: 0.4, borderRadius: "0.75rem 0 0 0.75rem" }}
                />
                <div className="absolute inset-0 bg-black/35" style={{ borderRadius: "0.75rem 0 0 0.75rem" }} />
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
          <div className="flex items-center justify-center gap-2 mt-6">
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
      <section className="py-12 md:py-16 bg-a">
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
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.28) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,.80) 0%, rgba(10,10,10,.55) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(22,22,22,.6) 0%, transparent 30%, transparent 70%, rgba(22,22,22,.7) 100%)" }} />
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
              <p className="text-[9px] text-gray-700 text-center">*Based on typical East Africa retail pricing. <Link href="/contact" className="text-theme hover:text-white transition">Request a detailed quote</Link>.</p>
            </div>
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

      {/* Specs Table */}
      <section id="specs" className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.35) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "rgba(10,10,10,.60)" }} />
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

      {/* Trim Comparison */}
      <section className="py-10 md:py-14 bg-a">
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
                      {t.rec && <span className="block mt-1 text-[8px] font-black tracking-[.12em] bg-accent text-black px-1.5 py-0.5 rounded inline-block">鈽?RECOMMENDED</span>}
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

      {/* Parts Kit + CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.28) grayscale(15%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,.55) 0%, rgba(10,10,10,.28) 35%, rgba(10,10,10,.5) 75%, rgba(10,10,10,.88) 100%)" }} />
        </div>

        <section className="py-10 md:py-14 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="label label-gold mb-5">Add-On Option</div>
                <h2 className="sh mb-5" style={{ fontSize: "clamp(1.8rem,4vw,3rem)" }}>Class A<br /><span className="text-theme">Parts Kit</span>.</h2>
                <p className="text-gray-400 text-base font-light leading-relaxed mb-6">
                  If your market has limited BYD parts availability, we can source and bundle a starter spare-parts package with your vehicle shipment — one logistics move, zero extra hassle.
                </p>
                <div className="glass rounded-[1.5rem] p-5 mb-6 inline-flex items-start gap-3 border-theme/15">
                  <span className="text-[9px] font-black tracking-[.2em] uppercase text-gray-600 pt-0.5">Note:</span>
                  <span className="text-[11px] font-light text-gray-300 leading-relaxed">This is an <strong className="text-white font-black">optional purchase</strong>, not included in the base price.</span>
                </div>
                <Link href="/solutions/configure-kit" className="btn-outline inline-block px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic">
                  Ask About Parts Kit →</Link>
              </div>
              <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.42)", borderColor: "rgba(197,160,89,.18)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-theme mb-6">Class A Kit — Typical Contents</div>
                <div className="space-y-3">
                  {["Brake pads (front + rear set)", "Wiper blades (pair)", "Cabin air filter", "Fuse assortment kit", "Portable AC charging cable (Type 2 / GB-T)", "Tyre repair kit", "12V auxiliary battery", "OBD diagnostic dongle (BYD compatible)"].map((item) => (
                    <div key={item} className="flex items-center gap-3 text-sm text-gray-400 font-light">
                      <span className="text-accent font-black">✦</span> {item}
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-5 border-t border-white/5">
                  <p className="text-[10px] text-gray-600 font-light">Contents may vary by vehicle trim and your specific market requirements.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="rounded-[4rem] p-12 md:p-20 text-center" style={{ background: "rgba(0,0,0,.38)", border: "1px solid rgba(197,160,89,.18)", backdropFilter: "blur(20px)" }}>
              <div className="flex justify-center mb-5"><div className="pulse-dot w-2.5 h-2.5" /></div>
              <div className="label justify-center mb-5">Ready to Order?</div>
              <h2 className="sh mb-4" style={{ fontSize: "clamp(2rem,5vw,4rem)" }}>Get Your BYD Seagull<br /><span className="text-accent">Batch Quote.</span></h2>
              <p className="text-gray-400 text-base font-light italic mb-10 max-w-md mx-auto">Tell us your quantity and destination port. We respond within 2 hours with a transparent factory price.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://wa.me/your-number" className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg">WhatsApp Us Now</a>
                <Link href="/contact" className="px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition">Send an Enquiry</Link>
              </div>
              <p className="text-[10px] text-gray-600 mt-8 font-black tracking-widest uppercase">Response within 2 hours 路 No commitment required</p>
            </div>
          </div>
        </section>

        {/* Related Vehicles */}
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-5">Other Revenue King Models</div>
            <div className="flex flex-wrap gap-3">
              {[
                { name: "BYD Qin PLUS EV", href: "#" },
                { name: "BYD Dolphin", href: "#" },
                { name: "GAC Aion RT *", href: "#" },
                { name: "Geely Galaxy E5", href: "#" },
              ].map((link) => (
                <Link key={link.name} href={link.href} className="glass px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white transition border-theme/15">
                  {link.name}
                </Link>
              ))}
              <Link href="/products/revenue-king" className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider border border-accent/40 text-accent hover:bg-accent hover:text-black transition">
                View All 10 Models →              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
