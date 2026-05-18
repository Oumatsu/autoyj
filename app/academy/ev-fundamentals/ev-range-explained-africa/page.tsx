import Link from "next/link";

const content = `<p>Real-world EV range in Africa diverges significantly from manufacturer-stated range figures. The spec sheet number is produced under controlled test conditions that do not reflect African operating realities: altitude, temperature, road conditions, payload, and driving habits all reduce effective range. This guide explains the gap, quantifies it, and gives you the language to communicate it honestly.</p>
<h2>Where the Spec Sheet Number Comes From</h2>
<p>Chinese EVs sold for export are typically rated under the WLTP (Worldwide Harmonised Light Vehicles Test Procedure) standard. WLTP testing is conducted at sea level, at 23°C, with no cargo, on a smooth surface, with HVAC off. The gap between WLTP rated range and real-world range in typical use is 15–25% globally. In African operating conditions, the gap is larger.</p>
<h2>The Six Factors Reducing Range in Africa</h2>
<h3>1. Altitude — 5–10% reduction in Addis</h3>
<p>The HVAC compressor works harder in thinner air, increasing energy draw.</p>
<h3>2. Temperature — 10–20% in cold mornings</h3>
<p>Cabin heating draws directly from the battery. Resistive heating consumes 2–5 kWh/hour.</p>
<h3>3. Road surface — 5–8% on unpaved roads</h3>
<p>Unpaved roads increase rolling resistance versus smooth test track surfaces.</p>
<h3>4. Speed — 20–35% at highway speeds</h3>
<p>EV energy consumption increases exponentially with speed. Highway driving at 100–120 km/h is 20–35% more than WLTP.</p>
<h3>5. Payload — 5–10% fully loaded</h3>
<p>A fully loaded 5-seat vehicle adds 350–500 kg over test conditions.</p>
<h3>6. HVAC usage — 5%+ with continuous AC</h3>
<p>Air conditioning draws 1–3 kW continuously, reducing available range.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse">
    <thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Scenario</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Reduction</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Real-world (400 km rated)</th></tr></thead>
    <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Urban Addis, mild day</td><td class="p-4 text-sm text-gray-300">-15%</td><td class="p-4 text-sm text-gray-300">~340 km</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Cold morning, heater on</td><td class="p-4 text-sm text-gray-300">-25%</td><td class="p-4 text-sm text-gray-300">~300 km</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Highway 100 km/h</td><td class="p-4 text-sm text-gray-300">-30%</td><td class="p-4 text-sm text-gray-300">~280 km</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Fully loaded, highway</td><td class="p-4 text-sm text-gray-300">-35%</td><td class="p-4 text-sm text-gray-300">~260 km</td></tr></tbody>
  </table>
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5"><p class="text-xs text-gray-500 font-light italic">Editorial estimate. Actual results vary by model and conditions.</p></div>
</div>
<h2>How to Communicate Range to Customers</h2>
<p><strong>The correct approach: set the adjusted figure upfront.</strong></p>
<p>"The manufacturer rates this vehicle at X km. In Addis, with our altitude and typical driving, most owners see 80–85% of that — around Y km in practice. That's still more than enough for your daily commute."</p>
<h2>Practical Range Guidance for Ethiopian Routes</h2>
<ul><li>Addis daily commute (30 km round trip): easily manageable</li><li>Addis–Adama (200 km return): comfortable</li><li>Addis–Hawassa (275 km one way): manageable with margin</li><li>Addis–Bahir Dar (560 km): requires charging stop</li></ul>
<h2>Sources</h2>
<p>ICCT — Quantifying Real-World EV Range Divergence from WLTP (2024)</p>
<p>IEA — Global EV Outlook 2025</p>
<p>Africa E-Mobility Alliance — EV Consumer Research, East Africa (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

const CAT_ARTICLES = [
  { title: "High Altitude and Dust in Ethiopia: How They Affect Your EV", slug: "high-altitude-dust-ethiopia-ev" },
  { title: "How EV Batteries Degrade: What African Dealers Need to Know", slug: "how-ev-batteries-degrade" },
];

export default function EvRangeExplainedPage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
            <Link href="/academy/ev-fundamentals" className="hover:text-gold transition">EV Fundamentals</Link><span className="mx-2">/</span>
            <span className="text-white">Range Explained</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>EV Fundamentals</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa</h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">The range figure on a Chinese EV's spec sheet is not the range your customer will experience in Africa.</p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">Youguard Academy</span>
                  </div>
                  <div>May 17, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    7 min
                  </div>
                </div>
              </header>
              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80" alt="EV Range" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>
              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Range</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">WLTP</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Africa</span>
                </div>
              </div>
            </div>
            <aside className="lg:col-span-4 xl:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                    <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">Academy Library</div>
                    <h3 className="text-xl font-black italic text-white mb-4">More EV Fundamentals</h3>
                    <div className="space-y-3">
                      {CAT_ARTICLES.map((a) => (
                        <Link key={a.slug} href={`/academy/ev-fundamentals/${a.slug}`} className="block text-xs text-gray-400 hover:text-white transition border-l-2 border-gold/30 pl-3 py-1">{a.title}</Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                    <div>
                      <div className="text-sm font-bold text-white">Speak to an Expert</div>
                      <div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Have questions about EV range in African conditions? We're here to help.</p>
                  <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
