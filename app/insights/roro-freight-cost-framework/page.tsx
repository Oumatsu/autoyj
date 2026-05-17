import Link from "next/link";

const content = `<p>Most African EV importers receive a single freight quote from their forwarder and treat it as a fixed cost. The reality is more complex: RoRo freight pricing is composed of multiple components, each of which can vary based on carrier, lane, timing, vehicle type, and market conditions.</p>
<p>Understanding the structure of RoRo freight costs — rather than just the bottom-line number — allows importers to identify the factors within their control, benchmark quotes from different providers, and anticipate cost changes before they affect margins.</p>
<p>This is a framework article. It explains how RoRo costs are built up, what each component represents, and what variables affect each. It does not quote current rates, which change frequently and must be obtained from your freight forwarder or carrier directly.</p>
<h2>The RoRo Freight Cost Components</h2>
<h3>1. Base Ocean Freight (BOF)</h3>
<p>The base freight rate is the core charge for moving a vehicle from the Chinese loading port to the African destination port on the RoRo vessel. It is quoted in USD per vehicle, based on a CEU (Car Equivalent Unit) classification.</p>
<p>CEU classification reflects the physical footprint of the vehicle on the car deck:</p>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Vehicle Type</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">CEU</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Relative Base Rate</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Small hatchback (BYD Seagull, MG4)</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">1.0</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Lowest</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Compact SUV (BYD Atto 3, Chery Tiggo)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">1.0–1.2</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Low-Medium</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Large SUV / pickup (BYD Shark 6)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">1.3–1.6</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Medium-High</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Electric bus / commercial van</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">2.5–4.0</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">High</td></tr>
</table></div>
<p>Base freight rates reflect the lane supply-demand balance, fuel costs, and carrier capacity utilisation. China–East Africa rates have historically been lower than China–Europe or China–US rates due to lower lane volume, but have been elevated in 2024–2026 due to Red Sea disruptions.</p>
<h3>2. Bunker Adjustment Factor (BAF)</h3>
<p>The BAF is a fuel surcharge that carriers adjust periodically (typically quarterly) to reflect changes in marine fuel costs. When oil prices rise, BAF rises. When they fall, BAF falls.</p>
<p>BAF is typically quoted as a USD amount per CEU and is <strong>separate from the base freight</strong>. A common mistake is to compare freight quotes that include BAF against quotes that exclude it — ensure you are comparing apples to apples.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/roro-freight-cost-framework/shipping-route.jpg" alt="Global shipping route map representing the China-to-Africa RoRo lane and the routing decisions that affect freight cost and transit time" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">The Red Sea disruptions since late 2023 have bifurcated China–East Africa freight into Suez Canal routing (faster, lower fuel cost but higher risk surcharges) and Cape of Good Hope routing (safer but 14–21 days longer and higher fuel cost). Both routes carry different cost structures.</p>
  </div>
</div>
<h3>3. Port Surcharges</h3>
<p>Carriers add port-specific surcharges that reflect the cost of handling at each port. These typically include:</p>
<p>These surcharges are often quoted separately from base freight. A complete freight cost comparison must include all port surcharges at both origin and destination.</p>
<h3>4. War Risk / Security Premium (Red Sea context)</h3>
<p>Since late 2023, carriers operating through the Red Sea / Suez Canal route have imposed a war risk surcharge on shipments transiting this zone, reflecting elevated insurance costs and risk premiums. Carriers routing via the Cape of Good Hope do not impose this surcharge but have higher base freight and BAF due to the longer distance.</p>
<p>In 2025–2026, some carriers have resumed Suez Canal routing for certain sailings while others maintain Cape routing. The surcharge status changes with the security situation and is typically disclosed at booking.</p>
<h3>5. EV-Specific Surcharges</h3>
<p>Pure BEV and PHEV vehicles may attract <strong>battery hazardous materials surcharges</strong> from some carriers, reflecting the additional safety requirements for transporting lithium-ion battery vehicles. This surcharge is not universal — it varies by carrier and is applied differently to assembled vehicles (where batteries are installed in the vehicle) versus batteries shipped separately.</p>
<p>Carriers typically require:</p>
<p>EV battery state of charge documentation at loading</p>
<p>Dangerous goods declaration under IMDG Code</p>
<p>UN38.3 test certification for the battery type</p>
<p>Some carriers do not differentiate EV surcharges from standard vehicle rates for assembled vehicles, treating the lithium battery as part of the normal vehicle rather than a separate dangerous goods item. Clarify with your specific carrier at booking.</p>
<h2>How Route Choice Affects Total Cost</h2>
<p>The Red Sea disruption has created a meaningful choice between two routing options, each with different cost structures:</p>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Factor</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Suez Canal Route</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Cape of Good Hope Route</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Transit time (China → Djibouti)</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">20–28 days</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">35–48 days</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Base freight level</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Lower</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Higher (longer distance)</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">BAF</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Lower (shorter distance)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Higher (more fuel)</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">War risk surcharge</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Yes (variable)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">No</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Total cost comparison</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Variable; must calculate for specific sailings</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Variable; typically 15–25% higher total</td></tr>
</table></div>
<p>The Suez route is generally cheaper when war risk surcharges are moderate; the Cape route becomes more competitive when war risk surcharges are high or when you have flexibility to absorb longer transit times.</p>
<h2>Benchmarking and Negotiation</h2>
<p>RoRo freight is not a fixed commodity price — it is negotiable, particularly for committed volumes.</p>
<h2>The Complete Cost Checklist</h2>
<p>When obtaining a freight quote, ensure the following are explicitly included or excluded with separate costs provided:</p>
<p>[ ] Base ocean freight (per vehicle, per CEU)</p>
<p>[ ] Bunker Adjustment Factor (BAF) — current quarter rate</p>
<p>[ ] Port congestion surcharge (PCS) — origin and destination</p>
<p>[ ] Terminal handling charges (THC) — destination port</p>
<p>[ ] War risk / security surcharge (if applicable)</p>
<p>[ ] EV battery surcharge (if applicable)</p>
<p>[ ] Documentation fees</p>
<p>[ ] Marine insurance (typically separate from freight)</p>
<p>[ ] Inland transport (destination port to your location — typically separate)</p>
<h2>Sources</h2>
<p>BIMCO — <em>"Pure Car and Truck Carrier market overview"</em> (Q1 2026)</p>
<p>Grimaldi Lines — China-Africa RoRo service documentation and surcharge schedules (2025–2026)</p>
<p>Höegh Autoliners — carrier rate structure and EV shipping requirements (2025)</p>
<p>UNCTAD — <em>Review of Maritime Transport 2025</em></p>
<p>Freightos — <em>"Understanding RoRo freight rates: a guide for importers"</em> (2025)</p>
<p>IMO — IMDG Code: lithium battery transport requirements</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Evexport Intelligence Desk · February 2026</p>
`;

export default function ArticlePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/insights" className="hover:text-gold transition">Insights</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Pricing</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-gold/10 text-gold border border-gold/30" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Pricing & Trade
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  How RoRo Freight Costs Are Structured: A Framework for African EV Importers
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  Most African EV importers receive a single freight quote from their forwarder and treat it as a fixed cost.
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>February 10, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    6 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/roro-freight-cost-framework/hero.jpg" alt="How RoRo Freight Costs Are Structured: A Framework for African EV Importers" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">RoRo Freight</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Shipping Costs</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Logistics</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">China Africa Trade</span>
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
