import Link from "next/link";

const content = `<p>The Africa E-Mobility Alliance's 2025 report identified spare parts availability — specifically, parts within 30 days — as the single most <span class="hl-green">important</span> factor in commercial fleet buyer decision-making. More <span class="hl-green">important</span> than purchase price. More <span class="hl-green">important</span> than range. More <span class="hl-green">important</span> than brand.</p>
<p>For Ethiopian EV dealers operating without official OEM franchise relationships — which is the current reality for virtually all Chinese EV importers in Ethiopia — this creates an operational challenge that is also a competitive differentiation opportunity. The dealer who solves the parts supply problem gains a durable advantage that cannot be matched by price competition alone.</p>
<p>This guide outlines the practical architecture for building a spare parts supply chain in Ethiopia without an OEM parts distribution agreement.</p>
<h2>The Parts Priority Hierarchy</h2>
<p>Not all EV parts carry the same supply urgency. The starting point for any parts strategy is understanding which categories create the most customer exposure risk.</p>
<p>High-voltage fuses and contactors</p>
<p>12V auxiliary battery</p>
<p>Charging port and inlet assembly</p>
<p>Brake pad sets and brake fluid</p>
<p>Cabin air filters and pollen filters</p>
<p>Wiper blades</p>
<p>These are high-frequency consumable and safety items. Running out of brake pads or having a faulty charging inlet creates immediate operational downtime for a commercial vehicle.</p>
<p>BMS (Battery Management System) control module</p>
<p>Onboard charger module</p>
<p>DC-DC converter</p>
<p>Suspension components (shock absorbers, control arm bushings)</p>
<p>Cooling system components (water pump, coolant lines for battery thermal management)</p>
<p>Tyres (local sourcing usually possible but size availability varies)</p>
<p>High-voltage battery pack (full or cell-level replacement)</p>
<p>Main drive motor or motor controller</p>
<p>Power distribution unit (PDU)</p>
<p>Body panels and structural components</p>
<p>The Tier 3 list is where most EV dealers get into trouble. A dealer whose customer's vehicle is immobilised waiting for a drive motor from China — with a 10-week lead time — has a retention problem that price competition cannot solve.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/chinese-ev-spare-parts-ethiopia/parts-workshop.jpg" alt="Auto repair workshop with vehicle on a lift representing the technical infrastructure and parts inventory needed for Chinese EV maintenance in Ethiopia" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Ethiopian EV technicians trained on Chinese EVs exist in growing numbers in Addis Ababa — the constraint is parts supply, not technical capability. A well-stocked consignment inventory for Tier 1 and Tier 2 parts is the single highest-impact operational investment an EV dealer can make.</p>
  </div>
</div>
<h2>Building Your Parts Supply Architecture</h2>
<h3>Step 1: Identify Your Core Fleet Models and Map Their Parts</h3>
<p>Start with the specific vehicles in your customer fleet — or the specific models you import. Parts are model-specific. A BYD Seagull charging port does not fit a BYD Atto 3. A Chery Tiggo suspension component does not cross to a BYD Dolphin.</p>
<p>For each model you service, map:</p>
<p>The full service interval parts list (from the OEM service manual — obtain from your Chinese supplier)</p>
<p>The most common failure modes reported by other operators of that model</p>
<p>The fast-wear consumables specific to Ethiopian conditions (dust ingress, heat, road conditions)</p>
<p>Ethiopian conditions are harder on certain components than Chinese conditions. Dusty roads affect air filtration systems more aggressively. Unpaved surfaces increase suspension component wear. High ambient temperatures stress cooling systems. Your parts inventory should weight toward categories where Ethiopian conditions accelerate wear.</p>
<h3>Step 2: Establish a Chinese Parts Supplier</h3>
<p>For Chinese EV parts, you have three sourcing options:</p>
<h3>Step 3: Build a Consignment Inventory</h3>
<p>A consignment inventory — parts held in your warehouse against anticipated future demand — eliminates the waiting time for your most <span class="hl-green">critical</span> items. The upfront cost is real, but so is the customer retention value.</p>
<p>A practical starter consignment inventory for an Ethiopian dealer maintaining 20–30 vehicles <em>（以下建议数量为参考值，基于行业实践经验，实际根据车队规模和车型组合调整）</em>：</p>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Part Category</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Recommended Stock Level</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">12V auxiliary batteries (matched to fleet models)</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">4–6 units</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Charging cables (Type 2, matching fleet inlets)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">3–4 units</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Charging port assemblies</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">2 units per model</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Brake pad sets (front + rear)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">8–10 sets per model</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Air filters + pollen filters</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">10 sets per model</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Coolant (EV-grade)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">20 litres</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">High-voltage fuses (assorted, matched to fleet)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">20–30 units</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">BMS modules (if sourced; high value but critical)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">1–2 units</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Suspension bushings (front subframe)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">4 sets per model</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Wiper blade sets</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">10 sets</td></tr>
</table></div>
<p>Invest in this inventory before you need it. The cost of stocking it is far lower than the cost of a commercial customer whose vehicle is idle for 8 weeks while a part travels from Shenzhen.</p>
<h3>Step 4: Develop an Ethiopian Technical Capability</h3>
<p>Parts supply is necessary but not sufficient. Parts must be installed correctly. In Addis Ababa, EV-trained technicians exist in growing numbers — trained through manufacturer training programmes, YouTube-mediated self-learning, and formal TVET programmes that began incorporating EV content from 2023 onwards.</p>
<p>Invest in:</p>
<p>Sending 1–2 mechanics to a formal Chinese EV technical training programme (several Chinese OEMs offer this in Guangzhou or through African partners)</p>
<p>Purchasing a basic EV diagnostic tool compatible with your fleet models (most Chinese EVs use OBD2 with brand-specific diagnostic apps)</p>
<p>Joining or establishing an informal network with other Ethiopian EV dealers for parts sharing and technical knowledge exchange</p>
<h2>The Competitive Advantage Calculation</h2>
<p>A dealer who can resolve a customer's EV issue in 3 days — versus a competitor who quotes 10 weeks — does not need to compete on price. That service differential is worth thousands of USD in customer lifetime value.</p>
<p>Commercial fleet buyers — taxi operators, NGOs, government entities — make repeat vehicle purchase decisions. The fleet operator whose 30 Seagulls were reliably serviced by your team becomes your customer for the next 30 vehicles. The fleet operator whose vehicles sat idle waiting for parts goes to whoever promises them they've solved the problem.</p>
<p>Parts supply is not a logistics problem. It is a customer retention strategy.</p>
<h2>Sources</h2>
<p>Africa E-Mobility Alliance — <em>Africa E-Mobility Report 2025</em> (after-sales infrastructure section)</p>
<p>Alibaba / 1688 — Chinese auto parts B2B marketplace (reference for sourcing methodology)</p>
<p>BYD official — service manual and parts catalogue availability policy</p>
<p>Ethiopian Technical and Vocational Education and Training (TVET) Agency — EV curriculum status (2023–2025)</p>
<p>迪拜汽车零件集散市场 — 迪拜是中国EV零件在中东/非洲地区的主要转运集散地，部分经销商通过迪拜中间商可将到货周期压缩至3-4周（编辑注：基于行业实践，非特定机构数据）</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Evexport Intelligence Desk · March 2026</p>
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
            <span className="text-white">Operator</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-accent/10 text-accent border border-accent/30" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Operator Hub
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  Building a Chinese EV Spare Parts Supply Chain in Ethiopia Without an Official OEM Network
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  The Africa E-Mobility Alliance\'s 2025 report identified spare parts availability — specifically, parts within 30 days — as the single most important factor in 
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>March 10, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    8 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/chinese-ev-spare-parts-ethiopia/hero.jpg" alt="Building a Chinese EV Spare Parts Supply Chain in Ethiopia Without an Official OEM Network" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Spare Parts</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">After-Sales</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Ethiopia</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">EV Maintenance</span>
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
