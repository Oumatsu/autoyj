"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

type Category = "revenue-king" | "elite-flagship" | "utility-pro";

interface GalleryImage {
  src: string;
  cat: string;
  label: string;
}

interface VehicleSpec {
  label: string;
  value: string;
  green?: boolean;
  gold?: boolean;
}

interface VehicleFit {
  icon: string;
  title: string;
  desc: string;
  accent: string;
}

interface TrimItem {
  name: string;
  range: string;
  accel: string;
  sunroof: string;
  airbags: string;
  seat: string;
  fob: string;
  rec?: boolean;
}

interface DetailData {
  vehicle: {
    brand: string;
    name: string;
    fob: string;
    battery: string;
    batteryType: string;
    range: string;
    charging: string;
    img: string;
    status: string;
    statusText: string;
  };
  category: Category;
  title: string;
  subtitle: string;
  heroDesc: string;
  stat1Label: string;
  stat1Value: string;
  stat2Label: string;
  stat2Value: string;
  stat3Label: string;
  stat3Value: string;
  whyTitle: string;
  whyDesc: string;
  features: { icon: string; title: string; desc: string }[];
  specsLeft: VehicleSpec[];
  specsRight: VehicleSpec[];
  fits: VehicleFit[];
  relatedModels: { name: string; href: string }[];
  tags: string[];
  galleryImages?: GalleryImage[];
  batchLevels?: { units: number; display: string }[];
  batchMargin?: { low: string; high: string };
  trimData?: TrimItem[];
  trimNote?: string;
}

const DEFAULT_GALLERY: GalleryImage[] = [
  { src: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80", cat: "Exterior", label: "Front View" },
  { src: "https://images.unsplash.com/photo-1620800615569-42b781a62dcb?auto=format&fit=crop&w=1200&q=80", cat: "Exterior", label: "Side Profile" },
  { src: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", cat: "Interior", label: "Dashboard" },
];

const DEFAULT_BATCH_LEVELS = [
  { units: 10, display: "$45K – $65K" },
  { units: 20, display: "$90K – $130K" },
  { units: 50, display: "$225K – $325K" },
  { units: 100, display: "$450K – $650K" },
];

const DEFAULT_BATCH_MARGIN = { low: "$4,500", high: "$6,500" };

export default function VehicleDetail({ data }: { data: DetailData }) {
  const v = data.vehicle;
  const gallery: GalleryImage[] = data.galleryImages || DEFAULT_GALLERY;
  const batchLevels = data.batchLevels || DEFAULT_BATCH_LEVELS;
  const batchMargin = data.batchMargin || DEFAULT_BATCH_MARGIN;
  const [galIdx, setGalIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [batchIdx, setBatchIdx] = useState(0);

  const goGallery = useCallback((dir: number) => {
    if (animating) return;
    setAnimating(true);
    setGalIdx((prev) => (prev + dir + gallery.length) % gallery.length);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, gallery.length]);

  const openLightbox = useCallback(() => setLightboxOpen(true), []);
  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const prevIdx = (galIdx - 1 + gallery.length) % gallery.length;
  const nextIdx = (galIdx + 1) % gallery.length;

  const batch = batchLevels[batchIdx];

  return (
    <>
      <div className="h-14 sm:hidden bg-black w-full" />
      {/* Hero — bottom gradient (transparent → black) bridges into Gallery's pure black */}
      <section className="relative min-h-screen flex items-end bg-black">
        <div className="absolute inset-0">
          <img src={v.img} className="w-full h-full object-cover" style={{ filter: "grayscale(100%) brightness(.6)" }} alt={v.name} />
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

        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-20 pt-36">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition">Home</Link>
            <span>/</span>
            <Link href={`/products/${data.category}`} className="hover:text-accent transition text-accent">
              {data.category === "revenue-king" ? "Revenue King" : data.category === "elite-flagship" ? "Elite Flagship" : "Utility Pro"}
            </Link>
            <span>/</span>
            <span className="text-gray-500">{v.brand} {v.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <div>
              <div className="flex items-center gap-3 mb-5">
                {data.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[9px] font-black px-3 py-1.5 rounded uppercase tracking-widest" style={{ background: "rgba(16,185,129,.15)", color: "var(--color-green)", border: "1px solid rgba(16,185,129,.25)" }}>{tag}</span>
                ))}
              </div>
              <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-2" style={{ fontSize: "clamp(3rem,8vw,7rem)" }}>{v.brand}<br />{v.name}</h1>
              <p className="text-2xl font-light italic text-gray-500 mb-8">{data.subtitle}</p>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-10 max-w-lg italic border-l-2 pl-6" style={{ borderColor: "rgba(16,185,129,.45)" }}>{data.heroDesc}</p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4">
                <a href="/qr" className="btn-primary px-6 sm:px-9 py-3 sm:py-4 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic shadow-lg text-center">WhatsApp Inquiry</a>
                <Link href="#specs" className="px-6 sm:px-9 py-3 sm:py-4 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition text-center">View Full Specs ↓</Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20"><div className="text-3xl font-black italic text-accent mb-1">{data.stat1Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{data.stat1Label}</div></div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-theme/20"><div className="text-3xl font-black italic text-theme mb-1">{data.stat2Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{data.stat2Label}</div></div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20"><div className="text-xl font-black italic text-white mb-1">{data.stat3Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{data.stat3Label}</div></div>
              <div className="col-span-3 glass rounded-[1.5rem] px-6 py-4 flex items-center justify-between border-theme/10">
                <div className="flex items-center gap-2.5"><div className="pulse-dot" /><span className="text-[10px] font-black tracking-widest uppercase text-gray-500">Factory Price</span></div>
                <Link href="/solutions/request-quote" className="text-[10px] font-black tracking-widest uppercase text-theme hover:text-white transition">Request Batch Quote →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bridge: Hero (black) → Gallery (black) — same color, no bridge needed */}

      {/* Gallery — 21-stop fine gradient: #000 → mid at 2% intervals, ~1.4 RGB step per stop */}
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
        <style>{`@keyframes imgSwitchIn { from { opacity: 0.5; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } } .img-switch-in { animation: imgSwitchIn 500ms cubic-bezier(0.4, 0, 0.2, 1) both; }`}</style>
        <div className="container mx-auto px-2 md:px-6 max-w-7xl">
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute left-0 inset-y-0 w-[9%] sm:w-[14%] md:w-[18%] cursor-pointer overflow-hidden hidden sm:block" onClick={() => goGallery(-1)}>
                <img src={gallery[prevIdx].src} className="h-full object-cover transition-opacity duration-700" alt={gallery[prevIdx].label} style={{ width: "200%", opacity: 0.4, borderRadius: "0 0.75rem 0.75rem 0", objectPosition: "right" }} />
              </div>
              <div className="relative mx-auto w-[90%] sm:w-[70%] md:w-[64%] lg:w-[60%] cursor-zoom-in" style={{ zIndex: 1, aspectRatio: "16/9" }} onClick={openLightbox}>
                <img key={`center-img-${galIdx}`} src={gallery[galIdx].src} className="w-full h-full object-cover rounded-xl img-switch-in" alt={gallery[galIdx].label} />
              </div>
              <div className="absolute right-0 inset-y-0 w-[9%] sm:w-[14%] md:w-[18%] cursor-pointer overflow-hidden hidden sm:block" onClick={() => goGallery(1)}>
                <img src={gallery[nextIdx].src} className="h-full object-cover transition-opacity duration-700" alt={gallery[nextIdx].label} style={{ width: "200%", opacity: 0.4, borderRadius: "0.75rem 0 0 0.75rem", objectPosition: "left" }} />
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); goGallery(-1); }} className="absolute top-1/2 -translate-y-1/2 left-1 sm:left-3 md:left-5 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-lg sm:text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20">&lsaquo;</button>
            <button onClick={(e) => { e.stopPropagation(); goGallery(1); }} className="absolute top-1/2 -translate-y-1/2 right-1 sm:right-3 md:right-5 w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-lg sm:text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20">&rsaquo;</button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 relative z-10">
            {gallery.map((_, i) => (
              <button key={i} onClick={() => { if (i !== galIdx) goGallery(i - galIdx); }} className={`w-2 h-2 rounded-full transition-all ${i === galIdx ? "bg-gold w-5" : "bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {lightboxOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95" onClick={closeLightbox}>
          <button className="absolute top-5 right-6 w-10 h-10 rounded-full bg-white/7 border border-white/15 text-white text-lg flex items-center justify-center hover:bg-white/15 transition z-10" onClick={closeLightbox}>&times;</button>
          <button className="absolute top-1/2 -translate-y-1/2 left-5 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white text-2xl flex items-center justify-center hover:bg-gold/60 hover:text-black transition" onClick={(e) => { e.stopPropagation(); goGallery(-1); }}>&lsaquo;</button>
          <img src={gallery[galIdx].src} className="max-w-[92vw] max-h-[88vh] object-contain rounded-md" alt="" onClick={(e) => e.stopPropagation()} />
          <button className="absolute top-1/2 -translate-y-1/2 right-5 w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white text-2xl flex items-center justify-center hover:bg-gold/60 hover:text-black transition" onClick={(e) => { e.stopPropagation(); goGallery(1); }}>&rsaquo;</button>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 text-white/30 text-[11px] font-black tracking-[.2em]">{galIdx + 1} / {gallery.length}</div>
        </div>
      )}

      {/* Buyer Logic / Key Features */}
      <section className="py-12 md:py-16" style={{ position: "relative", background: "var(--color-mid)" }}>
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <div className="label mb-5">{data.whyTitle}</div>
              <h2 className="sh mb-6" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>{data.whyDesc}</h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">{v.charging}</p>
              <div className="flex flex-wrap gap-3">{data.tags.slice(1).map((tag: string) => (<span key={tag} className="text-[9px] font-black px-3 py-1.5 rounded-full tracking-widest uppercase" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)" }}>{tag}</span>))}</div>
            </div>
            <div className="flex flex-col gap-4">
              {data.features.map((feat, i) => (
                <div key={i} className="rounded-[2rem] p-7 bg-white/[0.02] border border-accent/10 hover:border-accent/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg" style={{ background: "rgba(16,185,129,.1)" }}>{feat.icon}</div>
                    <div><h4 className="text-white font-black uppercase tracking-wider text-sm mb-2">{feat.title}</h4><p className="text-gray-300 text-sm font-light leading-relaxed">{feat.desc}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dealer ROI / Business Case */}
      <section className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.28) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(10,10,10,.80) 0%, rgba(10,10,10,.55) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <div className="label label-gold mb-5">The Business Case</div>
              <h2 className="sh mb-5" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>Your Margin.<br /><span className="text-theme">Your Market</span>.</h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">Forward-thinking fleet buyers are ready to transition from ICE to EV — but they need the right price point. The {v.brand} {v.name} lands exactly in that gap: an accessible entry price backed by a powerful total-cost-of-ownership story. That gap is your margin.</p>
              <div className="space-y-4 mb-8">
                {["Low entry price — accessible minimum order quantity", "Fast inventory turnover — strong monthly savings close deals quickly", `Typical 10-unit batch gross: ${batchMargin.low} – ${batchMargin.high}`].map((text, i) => (
                  <div key={i} className="flex items-center gap-3"><div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-black" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", border: "1px solid rgba(197,160,89,.3)" }}>{i + 1}</div><p className="text-xs font-black uppercase tracking-wider text-gray-400">{text}</p></div>
                ))}
              </div>
              <div className="glass rounded-[1.5rem] p-6 inline-block" style={{ background: "rgba(0,0,0,.4)", borderColor: "rgba(197,160,89,.25)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-1">Estimated Gross Margin per Unit</div>
                <div className="text-4xl font-black italic text-theme">{batchMargin.low} – {batchMargin.high}</div>
              </div>
            </div>
            <div className="glass rounded-[2.5rem] p-8 md:p-10" style={{ background: "rgba(0,0,0,.48)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-8">Batch Profit Estimator</div>
              <div className="mb-8">
                <div className="flex justify-between mb-4"><span className="text-xs font-black uppercase tracking-wider text-white">Units Ordered</span><span className="text-xs font-black text-theme">{batch.units} units</span></div>
                <div className="flex gap-2">{batchLevels.map((lvl, i) => (<button key={i} onClick={() => setBatchIdx(i)} className="flex-1 py-2.5 rounded-xl text-xs font-black tracking-wider transition" style={i === batchIdx ? { background: "var(--color-gold)", color: "#000" } : { background: "rgba(255,255,255,.06)", color: "#6B7280" }}>{lvl.units}</button>))}</div>
              </div>
              <div className="rounded-2xl p-6 text-center mb-6" style={{ background: "rgba(197,160,89,.08)", border: "1px solid rgba(197,160,89,.25)" }}>
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-1">Estimated Gross Profit</div>
                <div className="text-4xl font-black italic text-white mb-1">{batch.display}</div>
                <div className="text-[9px] font-black tracking-widest uppercase text-theme">Before import duties & local costs</div>
              </div>
              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-xs"><span className="text-gray-600 font-black uppercase tracking-wider">Units</span><span className="text-white font-black">{batch.units}</span></div>
                <div className="flex justify-between text-xs"><span className="text-gray-600 font-black uppercase tracking-wider">Margin / unit</span><span className="text-theme font-black">{batchMargin.low} – {batchMargin.high}</span></div>
                <div className="flex justify-between text-xs border-t pt-3" style={{ borderColor: "rgba(255,255,255,.05)" }}><span className="text-gray-400 font-black uppercase tracking-wider">Total gross</span><span className="text-accent font-black">{batch.display}</span></div>
              </div>
             <p className="text-[9px] text-gray-700 text-center">*Based on typical emerging market retail pricing. <Link href="/solutions/request-quote" className="text-theme hover:text-white transition">Request a detailed quote</Link>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.35) grayscale(20%)" }} alt="" />
          <div className="absolute inset-0" style={{ background: "rgba(10,10,10,.60)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <div className="label mb-3">Full Specifications</div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">
                {v.brand} {v.name} — {new Date().getFullYear()} Model
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(16,185,129,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-accent mb-6 flex items-center gap-2"><span className="w-4 h-px bg-accent inline-block" /> Performance & Range</div>
              {data.specsLeft.map((spec, j) => {
                const g = spec.green ?? /Range|Motor|Fast Charge|Top Speed|0 .100|100 km|Efficiency|kW|hp/.test(spec.label);
                const o = spec.gold ?? /Battery Type|Battery Capacity|Battery Chem|Drive Type|Platform|Energy Density/.test(spec.label);
                return (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 gap-3">
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase text-[#9CA3AF] flex-shrink-0">{spec.label}</span>
                  <span className={`text-xs font-extrabold text-right ${g ? "text-accent" : o ? "text-theme" : "text-white"}`} style={spec.value === "Not Supported" ? { color: "#6B7280" } : undefined}>{spec.value}</span>
                </div>
                );
              })}
            </div>
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(197,160,89,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-theme mb-6 flex items-center gap-2"><span className="w-4 h-px bg-theme inline-block" /> Dimensions & Features</div>
              {data.specsRight.map((spec, j) => {
                const g = spec.green ?? /Charge|Export|V2L|Warranty/.test(spec.label);
                const o = spec.gold ?? /Dimensions|Seating?|Airbag|Audio|Ambient|Sunroof|Boot|Wheelbase/.test(spec.label);
                return (
                <div key={j} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-b-0 gap-3">
                  <span className="text-[11px] font-bold tracking-[.08em] uppercase text-[#9CA3AF] flex-shrink-0">{spec.label}</span>
                  <span className={`text-xs font-extrabold text-right ${g ? "text-accent" : o ? "text-theme" : "text-white"}`} style={spec.value === "Not Supported" ? { color: "#6B7280" } : undefined}>{spec.value}</span>
                </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-gray-700 mt-5 text-center">Specifications shown for latest model year. Multiple trim levels available — contact us for full trim comparison.</p>
        </div>
      </section>

      {/* Trim Comparison */}
      {data.trimData && data.trimData.length > 0 && (
        <section className="py-10 md:py-14 bg-a">
          <div className="container mx-auto px-6 md:px-12">
            <div className="mb-10">
              <div className="label mb-3">All Versions — Side by Side</div>
              <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Choose Your Trim</h2>
              <p className="text-gray-500 text-sm font-light mt-2">6 key decision factors — everything else is identical across all trims.</p>
            </div>
            <div className="overflow-x-auto pb-2 rounded-[1.5rem] border border-white/10 bg-white/[0.025]">
              <table className="w-full border-collapse min-w-[720px]">
                <thead>
                  <tr>
                    <th className="py-3.5 px-3.5 text-[10px] font-black tracking-[.15em] uppercase border-b border-white/[0.07] text-left w-[210px] text-[#4B5563]"></th>
                    {data.trimData.map((t) => (
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
                      {data.trimData!.map((t, j) => {
                        const val = t[row.key as keyof TrimItem] as string;
                        const isRec = t.rec;
                        const topRange = [...data.trimData!].sort((a, b) => parseInt(b.range) - parseInt(a.range))[0].range;
                        const isBestRange = row.key === "range" && val === topRange;
                        return (
                          <td key={j} className={`py-2.5 px-3.5 text-xs font-bold border-b border-white/[0.04] text-center align-middle ${isRec ? "bg-accent/[0.07]" : ""}`}>
                            <span style={{ color: isBestRange ? "var(--color-green)" : val === "✗ None" ? "#F87171" : isRec ? "var(--color-green)" : undefined, fontWeight: isBestRange ? 900 : 700 }}>
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
              <p className="text-[9px] sm:text-[10px] text-gray-700">
                {(data.trimNote || `* Current model year. All trims share core platform specifications. Pricing on request — varies by order volume & destination port.`).split('<br />').map((line, i, arr) => (
                   <span key={i}>{line}{i < arr.length - 1 ? <br /> : null}</span>
                 ))}
              </p>
              <Link href="/contact" className="btn-primary px-5 sm:px-7 py-2.5 sm:py-3 rounded text-[10px] sm:text-xs font-black tracking-widest uppercase italic flex-shrink-0 whitespace-nowrap">
                Request Trim Pricing →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Fit For */}
      <section className="py-12 md:py-16 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-12"><div className="label justify-center mb-3">Ideal Customer Profile</div><h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Who Should Buy This Vehicle?</h2></div>
          <div className="grid md:grid-cols-3 gap-5">
            {data.fits.map((fit, i) => (
              <div key={i} className="rounded-[2rem] p-7 bg-white/[0.015] border border-theme/10 hover:border-accent/25 hover:bg-accent/[0.03] transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-lg flex-shrink-0" style={i % 2 === 1 ? { background: "rgba(197,160,89,.1)" } : { background: "rgba(16,185,129,.12)" }}>{fit.icon}</div>
                <h4 className="text-white font-black uppercase tracking-wider text-sm mb-3">{fit.title}</h4>
                <p className="text-gray-300 text-sm font-light leading-relaxed mb-5">{fit.desc}</p>
                <div className="text-[9px] font-black tracking-widest uppercase" style={{ color: i % 2 === 1 ? "var(--color-gold)" : "var(--color-green)" }}>{fit.accent}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Related — removed to avoid duplication with global footer */}
    </>
  );
}
