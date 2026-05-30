import Link from "next/link";

const IMGS = [
  "/pic/academy/photo-1581092160562-40aa08e78837.webp",
  "/pic/academy/photo-1486312338219-ce68d2c6f44d.webp",
  "/pic/academy/0.webp",
  "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
  "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp",
  "/pic/academy/photo-1581092160562-40aa08e78837.webp",
];

const articles = [
  { title: "High Voltage Safety Rules for EV Technicians: What You Must Know Before Opening the Bonnet", date: "May 16, 2026", readTime: "10 min", slug: "high-voltage-safety-ev-technicians", overview: "The non-negotiable safety protocol for any workshop servicing Chinese EVs." },
  { title: "Chinese EV Diagnostic Tools: What Actually Works in an African Workshop", date: "May 16, 2026", readTime: "9 min", slug: "chinese-ev-diagnostic-tools", overview: "LAUNCH X431 vs AUTEL vs brand-specific — what to buy and what to skip." },
  { title: "The 12V Auxiliary Battery in Chinese EVs: Why It Fails, How to Test It, How to Replace It", date: "May 16, 2026", readTime: "8 min", slug: "12v-auxiliary-battery-ev", overview: "The single most common cause of 'dead EV' complaints — and the easiest to fix." },
  { title: "EV Won't Charge: A Step-by-Step Troubleshooting Guide for African Technicians", date: "May 16, 2026", readTime: "9 min", slug: "ev-wont-charge-troubleshooting", overview: "Most charging faults are caused by one of six root causes." },
  { title: "Common Fault Patterns in Chinese EVs Operating in Ethiopia: A Field Reference", date: "May 16, 2026", readTime: "9 min", slug: "common-fault-patterns-ethiopia", overview: "Altitude, dust, grid instability — fault patterns that don't appear in OEM documentation." },
  { title: "Voltage Fluctuation and EV Charging in Ethiopia: What Every Technician Must Know", date: "May 16, 2026", readTime: "8 min", slug: "voltage-fluctuation-ev-charger-ethiopia", overview: "Grid voltage is one of the most underappreciated causes of EV charging faults." },
];

export default function TechnicalWorkshopPage() {
  return (
    <>
      <header className="pt-32 pb-16 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/academy" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Academy</Link>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Technical Workshop</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">Technical <span className="text-accent">Workshop</span></h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">Hands-on guides for EV technicians — safety, diagnostics, charging, and common faults in African operating conditions.</p>
        </div>
      </header>
      <main className="py-16 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {articles.map((a, i) => (
              <Link key={a.slug} href={`/academy/technical-workshop/${a.slug}`} className="glass rounded-[1.5rem] p-8 block hover:border-accent/30 transition-all duration-300 group relative overflow-hidden">
                <img src={IMGS[i]} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
                <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{String(i + 1).padStart(2, "0")}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", border: "1px solid rgba(16,185,129,.3)" }}>Technical Workshop</span>
                  <span className="text-[9px] text-gray-600">{a.readTime}</span>
                </div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2 group-hover:text-accent transition-colors">{a.title}</h2>
                <p className="text-gray-300 text-sm font-light leading-relaxed mb-3">{a.overview}</p>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{a.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
