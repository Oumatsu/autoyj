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
}

interface VehicleFit {
  icon: string;
  title: string;
  desc: string;
  accent: string;
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
}

const DEFAULT_GALLERY: GalleryImage[] = [
  { src: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=1200&q=80", cat: "Exterior", label: "Front View" },
  { src: "https://images.unsplash.com/photo-1620800615569-42b781a62dcb?auto=format&fit=crop&w=1200&q=80", cat: "Exterior", label: "Side Profile" },
  { src: "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1200&q=80", cat: "Interior", label: "Dashboard" },
];

const DEFAULT_BATCH_LEVELS = [
  { units: 10, display: "CNY 315K – CNY 455K" },
  { units: 20, display: "CNY 630K – CNY 910K" },
  { units: 50, display: "CNY 1.58M – CNY 2.28M" },
  { units: 100, display: "CNY 3.15M – CNY 4.55M" },
];

const DEFAULT_BATCH_MARGIN = { low: "CNY 31,500", high: "CNY 45,500" };

export default function VehicleDetail({ data }: { data: DetailData }) {
  const v = data.vehicle;
  const gallery: GalleryImage[] = data.galleryImages || DEFAULT_GALLERY;
  const batchLevels = data.batchLevels || DEFAULT_BATCH_LEVELS;
  const batchMargin = data.batchMargin || DEFAULT_BATCH_MARGIN;
  const [galIdx, setGalIdx] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [batchIdx, setBatchIdx] = useState(0);

  const goGallery = useCallback((dir: number) => {
    if (animating) return;
    setAnimating(true);
    setGalIdx((prev) => (prev + dir + gallery.length) % gallery.length);
    setTimeout(() => setAnimating(false), 600);
  }, [animating, gallery.length]);

  const prevIdx = (galIdx - 1 + gallery.length) % gallery.length;
  const nextIdx = (galIdx + 1) % gallery.length;

  const batch = batchLevels[batchIdx];

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-screen flex items-end overflow-hidden bg-bg2">
        <div className="absolute inset-0">
          <img src={v.img} className="w-full h-full object-cover" style={{ filter: "grayscale(100%) brightness(.6)" }} alt={v.name} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,15,15,.95) 10%, rgba(15,15,15,.35) 42%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,15,15,.5) 28%, transparent 75%)" }} />
        </div>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 40% 40% at 70% 40%, rgba(16,185,129,.06) 0%, transparent 70%)" }} />

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
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/your-number" className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg">WhatsApp Inquiry</a>
                <Link href="#specs" className="px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition">View Full Specs ↓</Link>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20"><div className="text-3xl font-black italic text-accent mb-1">{data.stat1Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{data.stat1Label}</div></div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-theme/20"><div className="text-3xl font-black italic text-theme mb-1">{data.stat2Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{data.stat2Label}</div></div>
              <div className="glass rounded-[1.5rem] p-5 text-center border-accent/20"><div className="text-xl font-black italic text-white mb-1">{data.stat3Value}</div><div className="text-[8px] font-black tracking-[.25em] uppercase text-gray-600">{data.stat3Label}</div></div>
              <div className="col-span-3 glass rounded-[1.5rem] px-6 py-4 flex items-center justify-between border-theme/10">
                <div className="flex items-center gap-2.5"><div className="pulse-dot" /><span className="text-[10px] font-black tracking-widest uppercase text-gray-500">Factory FOB Price</span></div>
                <Link href="/contact" className="text-[10px] font-black tracking-widest uppercase text-theme hover:text-white transition">Request Batch Quote →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <section className="bg-black py-8 md:py-12">
        <style>{`@keyframes imgSwitchIn { from { opacity: 0.5; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } } .img-switch-in { animation: imgSwitchIn 500ms cubic-bezier(0.4, 0, 0.2, 1) both; }`}</style>
        <div className="container mx-auto px-4 md:px-8 max-w-6xl">
          <div className="relative" style={{ height: "clamp(280px, 50vw, 540px)" }}>
            <div className="relative h-full rounded-2xl overflow-hidden bg-black">
              <div className="absolute left-0 top-0 w-[7%] h-full cursor-pointer overflow-hidden" onClick={() => goGallery(-1)}>
                <img src={gallery[prevIdx].src} className="w-full h-full object-cover transition-opacity duration-700" alt={gallery[prevIdx].label} style={{ opacity: 0.4, borderRadius: "0 0.75rem 0.75rem 0" }} />
                <div className="absolute inset-0 bg-black/35" style={{ borderRadius: "0 0.75rem 0.75rem 0" }} />
              </div>
              <div className="relative mx-auto w-[85%] h-full cursor-zoom-in" style={{ zIndex: 1 }} onClick={() => {}}>
                <img key={`center-img-${galIdx}`} src={gallery[galIdx].src} className="w-full h-full object-cover rounded-xl img-switch-in" alt={gallery[galIdx].label} />
                <div className="absolute bottom-4 left-4 bg-black/65 border border-accent/30 text-accent text-[9px] font-black tracking-[.3em] uppercase px-3 py-1 rounded-full z-10">{gallery[galIdx].cat}</div>
                <div className="absolute bottom-4 right-4 bg-black/65 text-white/50 text-[10px] font-black tracking-[.2em] px-3 py-1 rounded-full z-10">{galIdx + 1} / {gallery.length}</div>
              </div>
              <div className="absolute right-0 top-0 w-[7%] h-full cursor-pointer overflow-hidden" onClick={() => goGallery(1)}>
                <img src={gallery[nextIdx].src} className="w-full h-full object-cover transition-opacity duration-700" alt={gallery[nextIdx].label} style={{ opacity: 0.4, borderRadius: "0.75rem 0 0 0.75rem" }} />
                <div className="absolute inset-0 bg-black/35" style={{ borderRadius: "0.75rem 0 0 0.75rem" }} />
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); goGallery(-1); }} className="absolute top-1/2 -translate-y-1/2 left-3 md:left-5 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20">&lsaquo;</button>
            <button onClick={(e) => { e.stopPropagation(); goGallery(1); }} className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 w-10 h-10 md:w-11 md:h-11 rounded-full bg-black/55 border border-white/10 text-white text-xl flex items-center justify-center hover:bg-gold/85 hover:text-black transition z-20">&rsaquo;</button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/55 text-[11px] font-black tracking-[.18em] uppercase pointer-events-none whitespace-nowrap z-10">{gallery[galIdx].label}</div>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6">
            {gallery.map((_, i) => (
              <button key={i} onClick={() => { if (i !== galIdx) goGallery(i - galIdx); }} className={`w-2 h-2 rounded-full transition-all ${i === galIdx ? "bg-gold w-5" : "bg-white/20 hover:bg-white/40"}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Buyer Logic / Key Features */}
      <section className="py-12 md:py-16 bg-a">
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
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(22,22,22,.6) 0%, transparent 30%, transparent 70%, rgba(22,22,22,.7) 100%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">
            <div>
              <div className="label label-gold mb-5">The Business Case</div>
              <h2 className="sh mb-5" style={{ fontSize: "clamp(2rem,4.5vw,3.5rem)" }}>Your Margin.<br /><span className="text-theme">Your Market</span>.</h2>
              <p className="text-gray-300 text-base font-light leading-relaxed mb-8">Forward-thinking fleet buyers are ready to transition from ICE to EV — but they need the right price point. The {v.brand} {v.name} lands exactly in that gap: an accessible entry price backed by a powerful total-cost-of-ownership story. That gap is your margin.</p>
              <div className="space-y-4 mb-8">
                {["Low FOB entry — accessible minimum order quantity", "Fast inventory turnover — strong monthly savings close deals quickly", `Typical 10-unit batch gross: ${batchMargin.low} – ${batchMargin.high}`].map((text, i) => (
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
              <p className="text-[9px] text-gray-700 text-center">*Based on typical emerging market retail pricing. <Link href="/contact" className="text-theme hover:text-white transition">Request a detailed quote</Link>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specs */}
      <section id="specs" className="py-12 md:py-16 relative overflow-hidden">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.35) grayscale(20%)" }} alt="" /><div className="absolute inset-0" style={{ background: "rgba(10,10,10,.60)" }} /></div>
        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4"><div><div className="label mb-3">Full Specifications</div><h2 className="text-2xl font-black uppercase italic tracking-tight text-white">{v.brand} {v.name}</h2></div></div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(16,185,129,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-accent mb-6 flex items-center gap-2"><span className="w-4 h-px bg-accent inline-block" />Performance & Range</div>
              {data.specsLeft.map((spec, j) => (<div key={j} className="spec-row"><span className="spec-label">{spec.label}</span><span className="spec-val">{spec.value}</span></div>))}
            </div>
            <div className="glass rounded-[2rem] p-8" style={{ background: "rgba(0,0,0,.45)", borderColor: "rgba(197,160,89,.2)" }}>
              <div className="text-[9px] font-black tracking-widest uppercase text-theme mb-6 flex items-center gap-2"><span className="w-4 h-px bg-theme inline-block" />Dimensions & Features</div>
              {data.specsRight.map((spec, j) => (<div key={j} className="spec-row"><span className="spec-label">{spec.label}</span><span className="spec-val">{spec.value}</span></div>))}
            </div>
          </div>
          <p className="text-[10px] text-gray-700 mt-5 text-center">Specifications shown for latest model year. Multiple trim levels available — contact us for full trim comparison.</p>
        </div>
      </section>

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

      {/* CTA + Related */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1600&q=80" className="w-full h-full object-cover" style={{ filter: "brightness(.28) grayscale(15%)" }} alt="" /><div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,10,.55) 0%, rgba(10,10,10,.28) 35%, rgba(10,10,10,.5) 75%, rgba(10,10,10,.88) 100%)" }} /></div>
        <section className="py-16 md:py-20 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="rounded-[4rem] p-12 md:p-20 text-center" style={{ background: "rgba(0,0,0,.38)", border: "1px solid rgba(197,160,89,.18)", backdropFilter: "blur(20px)" }}>
              <div className="flex justify-center mb-5"><div className="pulse-dot w-2.5 h-2.5" /></div>
              <div className="label justify-center mb-5">Ready to Order?</div>
              <h2 className="sh mb-4" style={{ fontSize: "clamp(2rem,5vw,4rem)" }}>Get Your {v.brand} {v.name}<br /><span className="text-accent">Batch FOB Quote.</span></h2>
              <p className="text-gray-400 text-base font-light italic mb-10 max-w-md mx-auto">Tell us your quantity and destination port. We respond within 2 hours with a transparent factory FOB price.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a href="https://wa.me/your-number" className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg">WhatsApp Us Now</a>
                <Link href="/contact" className="px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic border border-accent/40 text-accent hover:bg-accent hover:text-black transition">Send an Enquiry</Link>
              </div>
              <p className="text-[10px] text-gray-600 mt-8 font-black tracking-widest uppercase">Response within 2 hours · No commitment required</p>
            </div>
          </div>
        </section>
        <section className="py-8 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-5">Other {data.category === "revenue-king" ? "Revenue King" : data.category === "elite-flagship" ? "Elite Flagship" : "Utility Pro"} Models</div>
            <div className="flex flex-wrap gap-3">
              {data.relatedModels.map((link) => (<Link key={link.name} href={link.href} className="glass px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider text-gray-400 hover:text-white transition border-theme/15">{link.name}</Link>))}
              <Link href={`/products/${data.category}`} className="px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider border border-accent/40 text-accent hover:bg-accent hover:text-black transition">View All Models →</Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
