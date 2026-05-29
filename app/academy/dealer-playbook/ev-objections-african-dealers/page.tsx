import Link from "next/link";

const content = `<p>After thousands of sales conversations across East and West African markets, the same five concerns surface repeatedly: battery life, charging infrastructure, spare parts, resale value, and price premium. Knowing that these objections are coming — and having a structured, credible response ready for each — is the core skill that separates dealers who convert EV enquiries from those who lose them to ICE alternatives.</p>
<h2>Objection 1: "What happens when the battery dies?"</h2>
<p><strong>The honest answer:</strong> Modern lithium battery packs in Chinese EVs are designed for 1,000–1,500 full charge cycles before reaching 80% of original capacity. At typical urban driving distances in Addis Ababa or Nairobi (40–60 km/day), this translates to 8–12 years of daily use.</p>
<p><strong>The redirect:</strong> "The battery is designed to last longer than most buyers keep a car. What affects battery health most is how you charge it — and we will walk you through that before you drive off the lot."</p>
<h2>Objection 2: "Where will I charge it? The grid here is unreliable."</h2>
<p><strong>The honest answer:</strong> Home charging (overnight, on a standard 220V socket with a slow charger) is the resilient model for African EV ownership. A brief grid interruption of 1–2 hours simply means slightly less charge by morning.</p>
<p><strong>The redirect:</strong> "The way most people charge in Addis is overnight at home on a slow charger — similar to how you charge your phone. A short power cut just means you get 90% charge instead of 100%."</p>
<h2>Objection 3: "What if something breaks? Where do I get parts?"</h2>
<p><strong>The honest answer:</strong> For high-volume Chinese brands — BYD, Chery, MG, SAIC — local parts networks in East Africa are building out rapidly. For the brands we stock, we maintain a local buffer of high-turnover consumables.</p>
<h2>Objection 4: "Will I be able to sell it when I want to upgrade?"</h2>
<p><strong>The honest answer:</strong> EV resale markets in East Africa are early-stage but improving. BYD and MG used vehicles are transacting in Addis Ababa and Nairobi's used car markets. The trajectory is toward more liquidity, not less.</p>
<h2>Objection 5: "It costs more than a petrol car of the same size."</h2>
<p><strong>The honest answer:</strong> The purchase price gap is real. The correct response is to acknowledge it and then reframe the conversation around total cost of ownership. For most buyers, the total cost is lower even if the upfront price is higher.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse">
    <thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Cost component</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ICE</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">EV</th></tr></thead>
    <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Fuel/electricity per 100km</td><td class="p-4 text-sm text-gray-300">~ETB 450–600</td><td class="p-4 text-sm text-gray-300">~ETB 80–120</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Oil changes per year</td><td class="p-4 text-sm text-gray-300">3–4 x ETB 2,000–3,000</td><td class="p-4 text-sm text-gray-300">None</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Brake pad wear</td><td class="p-4 text-sm text-gray-300">Standard</td><td class="p-4 text-sm text-gray-300">Reduced (regen braking)</td></tr></tbody>
  </table>
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5"><p class="text-xs text-gray-500 font-light italic">Costs based on Ethiopian Energy Authority data as of Q1 2026.</p></div>
</div>
<h2>Closing After Objections</h2>
<p>Once you have addressed an objection, do not immediately move to the next topic. Confirm the answer landed with a simple: "Does that answer your concern?" Then transition to the test drive — the EV's driving experience almost always makes a positive impression.</p>
<h2>Sources</h2>
<p>Africa E-Mobility Alliance — EV Sales Conversion Research, Sub-Saharan Dealers (2025)</p>
<p>Ethiopian Electric Power — Grid Reliability Statistics (2024)</p>
<p>Ethiopian Energy Authority — Electricity tariff data (2026)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

const CAT_ARTICLES = [
  { title: "The TCO Conversation Guide: How to Win EV Sales on Total Cost", slug: "tco-conversation-guide" },
  { title: "How to Run an EV Test Drive That Closes Deals", slug: "ev-test-drive-guide" },
];

export default function EvObjectionsPage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
            <Link href="/academy/dealer-playbook" className="hover:text-gold transition">Dealer Playbook</Link><span className="mx-2">/</span>
            <span className="text-white">EV Objections</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", borderColor: "rgba(197,160,89,.3)" }}>Dealer Playbook</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">The 5 EV Objections Every African Dealer Will Face — And How to Answer Them</h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Handling objections confidently is the difference between a test drive and a signed contract.</p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">Youguard Academy</span>
                  </div>
                  <div>May 16, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    8 min
                  </div>
                </div>
              </header>
              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1600&q=80" alt="Sales Conversation" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>
              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Sales</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Objections</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Conversion</span>
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
                    <h3 className="text-xl font-black italic text-white mb-4">More Dealer Playbook</h3>
                    <div className="space-y-3">
                      {CAT_ARTICLES.map((a) => (
                        <Link key={a.slug} href={`/academy/dealer-playbook/${a.slug}`} className="block text-xs text-gray-400 hover:text-white transition border-l-2 border-gold/30 pl-3 py-1">{a.title}</Link>
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
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need help with sales training? Our team can help.</p>
                  <a href="/qr" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
