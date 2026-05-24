import Link from "next/link";

const content = `<p>EV battery degradation — the gradual loss of a battery pack's ability to hold its original charge — is the single most common concern customers raise before buying an electric vehicle in Africa. This guide explains how lithium battery degradation actually works, what accelerates it in African operating conditions, and how to use this knowledge to close deals rather than lose them.</p>
<h2>What Degradation Actually Is</h2>
<p>A lithium-ion battery pack contains hundreds or thousands of individual cells. Each cell stores energy through a reversible chemical reaction. Over time and repeated charge/discharge cycles, this reaction becomes slightly less efficient. The result is a gradual reduction in the amount of energy the pack can hold — this is capacity fade.</p>
<p><strong>The key number to know:</strong> Most lithium battery packs (including BYD Blade Battery and the NMC/LFP chemistry in MG, Chery, and other Chinese EVs) retain 70–80% of their original capacity after 1,500–2,000 full charge cycles.</p>
<p><strong>What this means in practice:</strong> A 400 km rated range vehicle loses roughly 20–30% capacity after 1,500 cycles. At that point, range is 280–320 km — still usable for most daily applications.</p>
<h2>The Four Factors That Accelerate Degradation</h2>
<h3>Factor 1: Heat (the biggest accelerant)</h3>
<p>High temperature is lithium battery chemistry's primary enemy. At elevated temperature, the electrolyte inside each cell degrades faster. For vehicles parked in direct sun with no shade — a black-roofed car can reach 60–70°C interior temperatures — passive battery heating is a genuine degradation accelerant over a multi-year ownership period.</p>
<h3>Factor 2: Charging to 100% and discharging to 0% repeatedly</h3>
<p>Lithium cells experience the most electrochemical stress at the extremes of their state of charge. For daily use, charge to 80–90% and avoid running below 15–20% regularly. Reserve 100% charge for long trips where full range is needed.</p>
<h3>Factor 3: Repeated fast charging</h3>
<p>DC fast charging delivers energy at high current. High current = more heat. More heat = faster degradation. Taxi fleet operators who fast-charge multiple times per day will see faster degradation than personal use owners.</p>
<h3>Factor 4: Calendar ageing</h3>
<p>Even a battery never used degrades over time. This effect is minor over typical ownership periods (3–7 years).</p>
<h2>LFP vs NMC: Chemistry Matters for African Dealers</h2>
<p><strong>LFP (Lithium Iron Phosphate):</strong> Lower peak energy density but significantly more thermally stable. Can be charged to 100% regularly with minimal penalty. Better suited to African climate conditions.</p>
<p><strong>NMC (Nickel Manganese Cobalt):</strong> Higher energy density but more sensitive to heat and to charging above 90% regularly.</p>
<h2>Using This Knowledge in a Sales Conversation</h2>
<p>When a customer says "I'm worried the battery will wear out":</p>
<ol class="space-y-2"><li>Acknowledge the concern is reasonable</li><li>Explain the mechanism briefly: "Batteries do lose a small amount of capacity over time — around 2–3% per year in normal use."</li><li>Anchor to real numbers: "After 8 years of daily use in Addis, you'd expect around 85% of the original range."</li><li>Name the controllable factors: avoid charging to 100% every day, and park in shade in hot weather</li><li>Close on confidence</li></ol>
<h2>Sources</h2>
<p>BloombergNEF — Battery Price and Performance Survey (2025)</p>
<p>CATL — LFP vs NMC Battery Chemistry Technical Overview (2024)</p>
<p>IEA — Global EV Outlook 2025</p>
<p>Africa E-Mobility Alliance — EV Ownership Survey, East Africa (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

const CAT_ARTICLES = [
  { title: "High Altitude and Dust in Ethiopia: How They Affect Your EV", slug: "high-altitude-dust-ethiopia-ev" },
  { title: "EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa", slug: "ev-range-explained-africa" },
];

export default function HowEvBatteriesDegradePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
            <Link href="/academy/ev-fundamentals" className="hover:text-gold transition">EV Fundamentals</Link><span className="mx-2">/</span>
            <span className="text-white">Battery Degradation</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>EV Fundamentals</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">How EV Batteries Degrade: What African Dealers Need to Understand and Tell Customers</h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Battery degradation is the most common customer concern about EVs — and the most misunderstood.</p>
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
                    8 min
                  </div>
                </div>
              </header>
              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
                <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1600&q=80" alt="EV Battery Degradation" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>
              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Battery</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Degradation</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">LFP</span>
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
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" alt="Expert" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" />
                    <div>
                      <div className="text-sm font-bold text-white">Speak to an Expert</div>
                      <div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Have questions about battery technology? Our team responds in 2 hours.</p>
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
