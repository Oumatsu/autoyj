import Link from "next/link";

const content = `<p>The IEA's Global EV Outlook 2025 contains a data point that deserves more attention than it has received: <strong>across all emerging economies outside China, Chinese-manufactured EVs accounted for <span class="hl-gold">75% </span>of the total increase in electric car sales in 2024</strong>.</p>
<p>In Brazil and Thailand —currently the most advanced emerging EV markets outside China —Chinese imports represented <strong><span class="hl-gold">85% </span>of all EV sales</strong>. In Indonesia, Malaysia, and Mexico, the figure was 60%.</p>
<p>Africa is still in earlier stages of this transition, but the directional signal is clear. When emerging markets electrify, they do so overwhelmingly with Chinese vehicles. African dealers who build their sourcing relationships and technical competency around Chinese OEMs are not taking a bet on the unknown —they are positioning for the dominant outcome that has already materialised everywhere else.</p>
<h2>Why Chinese OEMs Win in Emerging Markets</h2>
<p>The <span class="hl-gold">75% </span>figure is not a coincidence or a temporary market anomaly. It reflects structural advantages that have compounded over a decade of policy-driven investment.</p>
<h3>Price Leadership</h3>
<p>The domestic price competition in China's NEV market —where more than 30 brands are competing aggressively —has driven vehicle costs to levels that no other country's manufacturers can match. A capable urban EV from a credible Chinese brand can be sourced for $10,000—18,000 FOB, a price point that is simply unavailable from Korean, Japanese, or European manufacturers.</p>
<h3>LFP Battery Cost Advantage</h3>
<p>Chinese manufacturers, led by CATL and BYD, produce the majority of the world's LFP battery capacity. LFP chemistry is cheaper to produce than NCM, more thermally stable, and better suited to equatorial operating conditions. Chinese OEMs have integrated this advantage vertically —controlling the battery supply chain gives them a cost floor that foreign manufacturers cannot undercut.</p>
<h3>Speed of Model Development</h3>
<p>Chinese OEMs are releasing new models at a pace that no Western manufacturer matches. BYD alone introduced more than a dozen distinct models across its product line in 2024—025. This rapid iteration means African dealers can access current-generation technology, not vehicles designed for a different market and adapted as an afterthought.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/china-brands-emerging-markets/global-market.jpg" alt="Global emerging market map highlighting the regions where Chinese EV exports are establishing dominant market positions" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Chinese EV brand market share in emerging economies: Brazil 85%, Thailand 85%, Indonesia 60%, Mexico 60%, Africa —still early, but the trajectory is unambiguous.</p>
  </div>
</div>
<h2>The Brand Landscape: Who Is Active in Africa</h2>
<p>Not all Chinese OEMs are equally committed to the African market. Understanding which brands have genuine Africa strategies —versus those treating the continent as an overflow destination for unsold inventory —is <span class="hl-green">critical</span> for dealers choosing long-term partners.</p>
<h3>BYD</h3>
<p>The world's largest EV manufacturer by volume is the most actively Africa-focused Chinese brand. South Africa has been the primary anchor market, with BYD planning to expand its dealer network from 13 to 60—0 by end of 2026. BYD's Africa strategy is explicitly long-term —they are building service infrastructure, not just selling units.</p>
<h3>Chery</h3>
<p>Chery's expansion into South Africa is accelerating, with eight hybrid and plug-in hybrid models being introduced in 2025—026, plus a commitment to bring its full EV range (iCar brand) to the market. Chery has an existing dealer infrastructure in several African markets through its ICE vehicle business, making the EV transition operationally smoother than for brands entering from scratch.</p>
<h3>SAIC (MG)</h3>
<p>MG —technically a British brand now owned by SAIC —has a significant global EV presence and is present in South Africa. The MG4 and ZS EV are among the more recognised Chinese-origin EVs on the continent. SAIC operates a global after-sales parts network serving international markets, with European regional distribution infrastructure that supports Africa-facing supply chains through its MG authorised importer programme.</p>
<h3>Geely / Geometry</h3>
<p>Geely's Geometry brand is specifically positioned for emerging markets at competitive price points. Less visible in Africa currently than BYD or Chery, but has a manufacturing base and supply chain that supports RHD production for right-hand-drive African markets.</p>
<h2>What Dealers Should Evaluate</h2>
<p>When choosing which Chinese OEM to partner with for long-term sourcing, the <span class="hl-gold">75% </span>market share figure is useful context —but the operational questions matter more:</p>
<p><strong>Does the OEM produce native RHD units</strong>, or are vehicles converted after production? (Warranty and safety implications)</p>
<p><strong>What is the after-sales parts supply chain for your specific market?</strong> Spare parts availability within 30 days is a minimum viable standard for a dealership.</p>
<p><strong>Does the brand have a regional export office</strong> that can provide documentation, technical support, and priority production allocation?</p>
<p><strong>What is the warranty policy for export vehicles</strong>, and does it apply in your country of operation?</p>
<p>The brand with the best marketing profile is not always the best sourcing partner. Operational depth matters more than brand awareness in markets where the after-sales experience will make or break your reputation.</p>
<h2>Sources</h2>
<p>IEA —<em>Global EV Outlook 2025</em>: Chinese imports in emerging markets data</p>
<p>CnEVPost —<em>"BYD to nearly triple dealer network in South Africa by 2026"</em> (June 2025)</p>
<p>CNBC Africa —<em>"China's BYD to nearly triple South Africa dealers' network"</em> (2025)</p>
<p>Asia Financial —<em>"Chinese EV-Makers Eyeing South Africa Amid Global Trade Rows"</em></p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Evexport Intelligence Desk · June 2026</p>
`;

export default function ArticlePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/insights" className="hover:text-gold transition">Insights</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Market</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-white/5 text-white border border-white/10" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Market Analysis
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  Chinese Brands Now Drive 75% of Emerging Market EV Growth. Here\'s What That Means for Africa.
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  The IEA\'s Global EV Outlook 2025 contains a data point that deserves more attention than it has received: across all emerging economies outside China, Chinese-
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>June 3, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    7 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/china-brands-emerging-markets/hero.jpg" alt="Chinese Brands Now Drive 75% of Emerging Market EV Growth. Here\'s What That Means for Africa." className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">China EV Brands</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Market Share</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Emerging Markets</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">BYD</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Chery</span>
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 xl:col-span-4">
              <div className="sticky top-[120px] space-y-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl group-hover:bg-gold/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                    <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">Free Download</div>
                    <h3 className="text-xl font-black italic text-white mb-4">The 50-Point Factory PDI Checklist</h3>
                    <p className="text-gray-400 text-xs font-light leading-relaxed mb-8">Don't import blind. Download the exact technical inspection checklist our engineers use before loading any vehicle in Shanghai.</p>
                    <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.705 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Get PDF via WhatsApp
                    </a>
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" alt="Consultant" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover group-hover:border-green transition-colors" />
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-green transition-colors">Speak to an Expert</div>
                      <div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Available Now</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Have specific questions about vehicle models or wholesale pricing? Our procurement team responds in 15 minutes.</p>
                  <Link href="/contact" className="w-full block text-center btn-outline py-3 rounded text-[10px] font-black tracking-widest uppercase hover:bg-green hover:text-black hover:border-green transition-colors">
                    Book a Consultation
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
