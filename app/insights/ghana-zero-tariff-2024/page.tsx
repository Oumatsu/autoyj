import Link from "next/link";

const content = `<p>Ghana's EV import policy is deliberately narrow — and that specificity is what makes it commercially interesting. Unlike blanket exemptions that apply to all EV categories regardless of use, Ghana's zero-tariff framework introduced in 2024 targets <strong>public transport electric vehicles</strong> and <strong>local assembly operations</strong> with an incentive window running through 2032.</p>
<p>For dealers and assemblers positioned to serve Ghana's formal public transit sector, or those exploring CKD/SKD assembly as a business model, this policy offers the most concrete long-term certainty of any EV incentive currently active in West Africa.</p>
<h2>What the Policy Covers</h2>
<p>According to EV24.Africa's reporting on Ghana's automotive import framework, the following exemption structure applies:</p>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Vehicle / Component Category</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Import Duty</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Duration</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">EVs used for **public transportation**</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">**0%**</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Until 2032</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">**SKD kits** imported by registered EV assemblers</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">**0%**</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Until 2032</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">**CKD kits** imported by registered EV assemblers</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">**0%**</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Until 2032</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Private EVs (non-public transport)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">**20%**</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Standard rate</td></tr>
</table></div>
<p>The distinction between public transport and private vehicle use is the defining feature of this policy. A bus operator or a ride-hailing platform that can demonstrate commercial fleet use qualifies. An individual buyer of a private sedan does not.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/ghana-zero-tariff-2024/bus-transport.jpg" alt="Public bus transportation in West Africa, illustrating the fleet-scale opportunity Ghana's policy creates" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Ghana's zero-tariff benefit applies to EVs operating in the formal public transport sector — creating a fleet-scale import opportunity for credentialled operators.</p>
  </div>
</div>
<h2>The Local Assembly Angle</h2>
<p>The SKD and CKD exemption is the most strategically significant element for the medium term. Ghana has an established history of vehicle assembly — Kantanka Automobile has been producing vehicles locally since 2017 — and the government's stated objective is to develop domestic EV manufacturing capability, not simply to maximise imported vehicle volumes.</p>
<p>For Chinese OEM partners with the capacity to supply CKD kits rather than CBU units, this creates a compelling proposal:</p>
<p>- <strong>Lower landed cost</strong> via the zero-tariff CKD route</p>
<p>- <strong>Legitimate "made in Ghana" positioning</strong> for fleet procurement tenders</p>
<p>- <strong>First-mover advantage</strong> in a market where local assembly capacity for EVs is still essentially zero</p>
<p>The registration requirement — importing assemblers must be formally registered with Ghana's automotive industry body — is the primary compliance step, and one that signals the government's intent to build a traceable, accountable supply chain rather than simply waiving tariffs for any operator.</p>
<h2>What This Means for Fleet Dealers</h2>
<p>The 2032 horizon gives operators eight years of cost certainty — a long enough window to build a viable public transport fleet business and amortise the investment in charging infrastructure, workshop training, and spare parts inventory.</p>
<p>Key commercial targets within Ghana's public transport EV market:</p>
<p>- <strong>Urban minibus (tro-tro) electrification</strong> — the dominant informal transit mode in Accra; several electrification pilots are under way</p>
<p>- <strong>Government fleet procurement</strong> — the Ministry of Transport has signalled interest in EV adoption for official vehicle pools</p>
<p>- <strong>Airport and port shuttle services</strong> — high-frequency, fixed-route operations where EV economics are strongest</p>
<h2>Practical Steps</h2>
<p>Dealers looking to access the zero-tariff benefit for public transport EV imports must:</p>
<ol>
  <li>Register as a commercial vehicle operator or fleet manager with the relevant Ghanaian authority</li>
  <li>Confirm intended vehicle use as public transport at point of customs entry</li>
  <li>Ensure the vehicle HS code clearly classifies the unit as a battery electric vehicle (BEV)</li>
</ol>
<p>For the CKD/SKD route, additional registration as an approved assembler is required — a more complex process, but one that unlocks both the zero-tariff benefit and eligibility for future government procurement programmes.</p>
<h2>Sources</h2>
<p>- EV24.Africa — *"Ghana EV Import Guide 2025: Tariffs, Registration & Customs Clearance"*</p>
<p>- EV24.Africa — *"EV Import Duties in Africa (2026): The Countries With the Best Incentives"*</p>
<p>- Africa E-Mobility Alliance — *Africa E-Mobility Report 2025*</p>
<ul>
  <li>本文关税豁免信息基于EV24.Africa的行业报道。建议在执行前向加纳税务局（GRA）官方渠道或持牌清关行核实当前有效文件编号及注册要求。*</li>
</ul>
<ul>
  <li>Published by Evexport Intelligence Desk · April 2026*</li>
</ul>
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
            <span className="text-white">Policy</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-gold/10 text-gold border border-gold/30" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Policy & Tariffs
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  Ghana\'s 8-Year Zero-Tariff Window: The Best Local Assembly Deal in West Africa
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  Ghana\'s EV import policy is deliberately narrow — and that specificity is what makes it commercially interesting.
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>April 2, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    5 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/ghana-zero-tariff-2024/hero.jpg" alt="Ghana\'s 8-Year Zero-Tariff Window: The Best Local Assembly Deal in West Africa" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Ghana</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">West Africa</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">CKD</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Local Assembly</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Zero Tariff</span>
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
