import Link from "next/link";

const content = `<p>When the IEA reported that African EV sales more than doubled in 2024, reaching nearly 11,000 units, that headline obscured a <span class="hl-green">critical</span> geographic reality: <strong>the vast majority of that growth happened in two countries</strong> — Morocco and Egypt — each of which exceeded 2,000 EV sales for the first time.</p>
<p>For Sub-Saharan African dealers, this is not irrelevant geography. North Africa consistently leads Sub-Saharan adoption curves by two to three years in automotive trends, and understanding what drove Morocco and Egypt's acceleration illuminates what Sub-Saharan markets will look like by 2027–2028.</p>
<h2>Morocco: The Most EV-Friendly Import Regime on the Continent</h2>
<p>Morocco has constructed the most attractive EV import environment in Africa:</p>
<p>- <strong><span class="hl-gold">0% </span>import duty</strong> on qualifying electric vehicles</p>
<p>- <strong>Minimal VAT treatment</strong> — a $30,000 EV incurs approximately $750 in tariffs under Morocco's qualifying criteria</p>
<p>- <strong>VAT exemption</strong> for EVs meeting specific technical standards</p>
<p>- Active government fleet electrification programme for public administration vehicles</p>
<p>The result is a landed cost advantage that makes EVs directly price-competitive with equivalent ICE vehicles in several segments for the first time. Morocco's EV market grew from a negligible base to over 2,000 sales in 2024 — with Chinese brands capturing the majority of that growth.</p>
<p>Morocco's geographic position also makes it significant beyond its own market. As a manufacturing hub with proximity to Europe (and currently building relationships with several Chinese OEM assembly projects), Morocco is emerging as a potential regional distribution point for North and West African EV supply chains.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/morocco-egypt-ev-surge-2025/cairo.jpg" alt="Cairo, Egypt urban landscape representing the scale of the automotive market that Egypt's EV policy is beginning to capture" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Cairo — home to over 20 million residents and one of Africa's largest urban vehicle fleets. Egypt's 20,000 EV target by 2030 has been backed by concrete import incentives that are already driving results.*</p>
  </div>
</div>
<h2>Egypt: Scale Market With a 2030 Target</h2>
<p>Egypt's EV market development follows a different model from Morocco's. Where Morocco's growth is primarily driven by import incentives, Egypt has paired import policy changes with a <strong>national 20,000 EV by 2030 target</strong> backed by government fleet procurement commitments.</p>
<p>Egypt's EV import framework includes:</p>
<p>- Reduced customs duties for qualifying EVs (specific rates vary by vehicle class and country of origin)</p>
<p>- Government procurement targets driving public sector EV adoption</p>
<p>- Pilot charging infrastructure deployment in Cairo and Alexandria</p>
<p>Egypt exceeded 2,000 EV sales in 2024, matching Morocco's milestone. Given Egypt's much larger vehicle market (annual new car sales of 200,000–300,000 units versus Morocco's 150,000), the penetration rate remains lower — but the absolute growth trajectory is significant.</p>
<p>Chinese brands are particularly well-positioned in Egypt because China and Egypt have an existing strong trade relationship, and Chinese vehicles already have significant brand recognition in the Egyptian market through prior ICE imports.</p>
<h2>The Sub-Saharan Parallel: What Comes Next</h2>
<p>The North Africa experience provides a clear pattern for Sub-Saharan market development:</p>
<p>Kenya, South Africa, and Nigeria are approximately 18–24 months behind Morocco and Egypt on this curve. Dealers establishing market presence now are entering at the Phase 1-to-2 transition — the optimal moment to build brand and infrastructure before Phase 3 demand arrives.</p>
<h2>What Both Markets Have in Common</h2>
<p>Despite their different policy approaches, Morocco and Egypt share characteristics that explain their relative success:</p>
<p>- <strong>Urban density</strong> — both have major metropolitan centres where the limited charging infrastructure challenge is manageable</p>
<p>- <strong>Existing Chinese trade relationships</strong> — Chinese vehicles were already familiar to consumers before the EV wave arrived</p>
<p>- <strong>Government as a first mover</strong> — public sector fleet electrification created visible, trusted early deployments that built consumer confidence</p>
<p>- <strong>Regulatory clarity</strong> — both markets have relatively clear import classification processes, reducing the compliance risk that deters dealers in some Sub-Saharan markets</p>
<h2>Sources</h2>
<p>- IEA — *Global EV Outlook 2025*: Africa sales data</p>
<p>- EV24.Africa — *"EV Market Forecast in Africa to 2030"*</p>
<p>- Africa E-Mobility Alliance — *Africa E-Mobility Report 2025*</p>
<p>- EV24.Africa — *"EV Import Duty in Africa Explained: Country-by-Country Guide"* (Morocco and Egypt sections)</p>
<ul>
  <li>Published by Evexport Intelligence Desk · July 2026*</li>
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
            <span className="text-white">Market</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-white/5 text-white border border-white/10" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Market Analysis
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  Morocco and Egypt Are Leading Africa\'s EV Surge. Sub-Saharan Dealers Should Pay Attention.
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  When the IEA reported that African EV sales more than doubled in 2024, reaching nearly 11,000 units, that headline obscured a critical geographic reality: the v
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>July 5, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    6 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/morocco-egypt-ev-surge-2025/hero.jpg" alt="Morocco and Egypt Are Leading Africa\'s EV Surge. Sub-Saharan Dealers Should Pay Attention." className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Morocco</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Egypt</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">North Africa</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">EV Adoption</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Market Trends</span>
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
