import Link from "next/link";

const IMGS = [
  "https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?auto=format&fit=crop&w=600&q=80",
  "/pic/academy/photo-1518770660439-4636190af475.webp",
  "/pic/academy/photo-1559136555-9303baea8ebd.webp",
];

const articles = [
  { title: "High Altitude and Dust in Ethiopia: How They Affect Your EV", date: "May 16, 2026", readTime: "9 min", slug: "high-altitude-dust-ethiopia-ev", overview: "Understanding how high altitude and dust affect EVs in Ethiopia is essential knowledge for any dealer or technician." },
  { title: "EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa", date: "May 17, 2026", readTime: "7 min", slug: "ev-range-explained-africa", overview: "The range figure on a Chinese EV's spec sheet is not the range your customer will experience in Africa." },
  { title: "How EV Batteries Degrade: What African Dealers Need to Understand and Tell Customers", date: "May 17, 2026", readTime: "8 min", slug: "how-ev-batteries-degrade", overview: "Battery degradation is the most common customer concern — and the most misunderstood." },
];

export default function EvFundamentalsPage() {
  return (
    <>
      <header className="pt-32 pb-16 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/academy" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Academy</Link>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">EV Fundamentals</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">EV <span className="text-accent">Fundamentals</span></h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">Master the core technology: LFP vs NMC batteries, motor types, charging standards, and how African conditions affect EV performance.</p>
        </div>
      </header>
      <main className="py-16 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {articles.map((a, i) => (
              <Link key={a.slug} href={`/academy/ev-fundamentals/${a.slug}`} className="glass rounded-[1.5rem] p-8 block hover:border-green/30 transition-all duration-300 group relative overflow-hidden">
                <img src={IMGS[i]} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
                <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">0{i + 1}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", border: "1px solid rgba(16,185,129,.3)" }}>EV Fundamentals</span>
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
