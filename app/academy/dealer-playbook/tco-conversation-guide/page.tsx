import Link from "next/link";

const content = `<p>The total cost of ownership (TCO) conversation is the most powerful tool an EV dealer has in Africa. Because EV sticker prices are often higher than equivalent ICE vehicles, customers who evaluate only the purchase price will frequently choose the ICE option. The dealers who consistently close EV deals are those who can rapidly and confidently shift the conversation from upfront cost to operating cost over time.</p>
<h2>Why TCO Works as a Sales Conversation</h2>
<p>A customer who objects to an EV's price is not objecting to the vehicle — they are objecting to an incomplete financial picture. When you provide the complete picture — monthly fuel savings, oil service elimination, reduced brake maintenance — most buyers can see that the "expensive" option is actually the economical one.</p>
<h2>The Core TCO Components</h2>
<h3>1. Fuel vs electricity cost</h3>
<p>The single largest monthly saving. The per-kilometre cost gap between petrol and grid electricity is substantial.</p>
<h3>2. Engine oil and filter elimination</h3>
<p>EVs have no engine oil. This is a fixed, recurring saving of ETB 2,000–3,500 per service interval.</p>
<h3>3. Transmission maintenance elimination</h3>
<p>EVs have single-speed reduction gears with minimal maintenance requirements. No clutch, no gearbox.</p>
<h3>4. Brake maintenance reduction</h3>
<p>Regenerative braking significantly extends brake pad life — pads can last 60,000–100,000 km or more.</p>
<h3>5. Exhaust system elimination</h3>
<p>Catalytic converters, mufflers, and exhaust systems are absent in EVs.</p>
<h2>The Calculation: A Real Ethiopian Example</h2>
<p><strong>Scenario:</strong> Customer considering a 200km-range EV vs a 1.5L ICE sedan, planning 60 km/day in Addis.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse">
    <thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Cost category</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">ICE 5-year</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">EV 5-year</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Saving</th></tr></thead>
    <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Fuel / electricity</td><td class="p-4 text-sm text-gray-300">Calculate</td><td class="p-4 text-sm text-gray-300">Calculate</td><td class="p-4 text-sm text-gray-300">ETB [gap]</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Engine oil services</td><td class="p-4 text-sm text-gray-300">ETB 37,500–50,000</td><td class="p-4 text-sm text-gray-300">ETB 0</td><td class="p-4 text-sm text-gold">ETB 37,500–50,000</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Transmission service</td><td class="p-4 text-sm text-gray-300">ETB 5,000–15,000</td><td class="p-4 text-sm text-gray-300">ETB 0</td><td class="p-4 text-sm text-gold">ETB 5,000–15,000</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Brake pads</td><td class="p-4 text-sm text-gray-300">ETB 6,000–12,000</td><td class="p-4 text-sm text-gray-300">ETB 3,000–6,000</td><td class="p-4 text-sm text-gold">ETB 3,000–6,000</td></tr></tbody>
  </table>
</div>
<h2>How to Present This in a Sales Conversation</h2>
<p><strong>Step 1:</strong> Establish the holding period. 3–5 years or more? TCO is strongly in EV's favour.</p>
<p><strong>Step 2:</strong> Establish the usage pattern. Higher mileage = larger monthly fuel saving.</p>
<p><strong>Step 3:</strong> Introduce the fuel comparison first. Start with monthly terms: "At your driving level, you'd spend around ETB X on petrol. In the EV, it's ETB Y. That's ETB Z saving per month."</p>
<p><strong>Step 4:</strong> Add the service savings. "EVs don't need oil changes. That's another ETB X per month."</p>
<p><strong>Step 5:</strong> State the payback. "Over 3 years, the total savings are ETB X. That more than covers the price premium."</p>
<h2>Handling the Birr Depreciation Factor</h2>
<p>Electricity tariffs in Ethiopia are set by the Ethiopian Energy Authority and have historically been more stable than imported-commodity prices. Petrol is USD-denominated and directly tracks Birr depreciation. Electricity is produced domestically from Ethiopian hydropower — it is not directly exposed to exchange rate risk.</p>
<h2>Sources</h2>
<p>Ethiopian Energy Authority — Electricity Tariff Schedule (2026)</p>
<p>National Bank of Ethiopia — Exchange rate historical data (2023–2025)</p>
<p>Africa E-Mobility Alliance — EV Fleet Economics Report (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

const CAT_ARTICLES = [
  { title: "The 5 EV Objections Every African Dealer Will Face", slug: "ev-objections-african-dealers" },
  { title: "How to Run an EV Test Drive That Closes Deals", slug: "ev-test-drive-guide" },
];

export default function TcoConversationGuidePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
            <Link href="/academy/dealer-playbook" className="hover:text-gold transition">Dealer Playbook</Link><span className="mx-2">/</span>
            <span className="text-white">TCO Guide</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", borderColor: "rgba(197,160,89,.3)" }}>Dealer Playbook</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">The TCO Conversation Guide: How to Win EV Sales on Total Cost, Not Sticker Price</h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">The TCO conversation converts price-sensitive buyers. When customers see the monthly cost difference instead of the purchase price gap, most deals become much easier to close.</p>
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
                    9 min
                  </div>
                </div>
              </header>
              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
                <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80" alt="TCO Conversation" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>
              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">TCO</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Sales</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Finance</span>
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
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need a TCO calculator? We can help you build one.</p>
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
