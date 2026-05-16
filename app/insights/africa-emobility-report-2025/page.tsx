import Link from "next/link";

const content = `<p>Published in September 2025, the <strong>Africa E-Mobility Report 2025</strong> by the Africa E-Mobility Alliance (AEA) is the most comprehensive continent-specific analysis of EV market development currently available. Unlike global reports that treat Africa as a footnote, the AEA report goes country-by-country, segment-by-segment, and policy-by-policy across the continent's most active EV markets.</p>
<p>This analysis draws on the report's key findings and translates them into actionable intelligence for dealers and fleet operators.</p>
<h2>The Continent-Wide Picture</h2>
<p>The report's headline findings confirm and expand on IEA data, adding Africa-specific depth:</p>
<p>- <strong>EV sales more than doubled in 2024</strong> versus 2023, driven primarily by Morocco and Egypt</p>
<p>- <strong>Sales penetration remains below 1%</strong> continent-wide — the lowest of any region globally</p>
<p>- <strong>Three- and two-wheelers</strong> are the fastest-growing EV segment by unit volume in East and West Africa, though outside the scope of this analysis for commercial fleet dealers</p>
<p>- <strong>Government fleet electrification</strong> is the primary demand driver in Sub-Saharan Africa, with commercial consumer purchases lagging behind by 18–24 months</p>
<p>The gap between the headline growth rate (doubling) and the absolute penetration (under 1%) is the defining tension of the African EV market — and the source of both the opportunity and the risk for early-stage dealers.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/africa-emobility-report-2025/report-data.jpg" alt="Data report and analytics interface representing the depth of country-by-country market intelligence in the Africa E-Mobility Report 2025" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">The AEA report covers over 30 African countries with specific data on EV registrations, charging infrastructure, policy frameworks, and OEM presence — the most granular Africa-specific dataset currently published.*</p>
  </div>
</div>
<h2>Country-by-Country Highlights</h2>
<h3>Kenya</h3>
<p>The report identifies Kenya as the most advanced Sub-Saharan EV market by policy maturity. The combination of 0% import duty, an active ride-hailing sector, and Nairobi's urban density create the strongest commercial fleet EV economics on the continent. The report notes that Kenya's EV fleet is growing primarily through commercial channels — taxi operators, logistics companies, and government fleet managers — rather than retail consumer purchases.</p>
<h3>South Africa</h3>
<p>South Africa has the continent's largest existing passenger vehicle market (approximately 500,000 new vehicles per year) and the most sophisticated dealer infrastructure. BYD's rapid network expansion is the dominant story, with the report noting that South Africa's Q1 2025 NEV share of 2.4% already exceeds the continental average by a factor of three. However, South Africa's high import duty on EVs (25%) remains the primary constraint on cost competitiveness.</p>
<h3>Ethiopia</h3>
<p>The report highlights Ethiopia's unique position as the only country globally with an active ICE import ban, while also noting the policy volatility that has characterised its EV incentive framework (VAT reinstatement, customs duty increase). Ethiopia's EV fleet tripled between 2023 and 2025, but primarily in the commercial taxi and ride-hailing sector — consumer purchases remain rare.</p>
<h3>Nigeria</h3>
<p>Noted as a market with significant structural potential (largest economy in Africa, population over 200 million, high urban density in Lagos and Abuja) but limited current EV activity. The 2024 VAT Modification Order is identified as a meaningful policy signal, though implementation challenges and infrastructure constraints are flagged as near-term barriers.</p>
<h3>Rwanda</h3>
<p>Flagged as an interesting outlier — a small market with a comprehensive EV exemption framework (full tax exemption on EVs) and a government that has used EV deployment as a deliberate urban image strategy. Rwanda's EV fleet is disproportionately large relative to its economy and is primarily composed of two- and three-wheelers alongside a small passenger car segment.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/africa-emobility-report-2025/africa-mobility.jpg" alt="Africa transportation and mobility infrastructure representing the physical context in which EV adoption must scale" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">The AEA report notes that Africa's variable infrastructure — particularly electricity grid reliability and road quality — is the primary physical constraint on EV adoption, distinct from policy or pricing factors.*</p>
  </div>
</div>
<h2>The Infrastructure Reality Check</h2>
<p>The report is unusually candid about the barriers that policy analysis alone often understates:</p>
<h2>The Strategic Summary</h2>
<p>The Africa E-Mobility Report 2025 paints a picture of a market that is unambiguously real and growing — but one where execution quality matters more than market entry timing. The dealers who will build durable businesses in African EV markets are those who solve the after-sales equation, not just the procurement equation.</p>
<p>The report is available as a free PDF download from the Africa E-Mobility Alliance website at africaema.org — required reading for any dealer building a serious Africa EV strategy.</p>
<h2>Sources</h2>
<p>- Africa E-Mobility Alliance — *Africa E-Mobility Report 2025* (September 2025), available at africaema.org</p>
<p>- IEA — *Global EV Outlook 2025*</p>
<p>- EV24.Africa — multiple country-specific policy guides (2025–2026)</p>
<ul>
  <li>Published by Evexport Intelligence Desk · October 2025*</li>
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
                  Africa E-Mobility Report 2025: Key Findings Every Dealer Needs to Read
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  Published in September 2025, the Africa E-Mobility Report 2025 by the Africa E-Mobility Alliance (AEA) is the most comprehensive continent-specific analysis of 
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>October 15, 2025</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    8 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/africa-emobility-report-2025/hero.jpg" alt="Africa E-Mobility Report 2025: Key Findings Every Dealer Needs to Read" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Africa E-Mobility</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Market Report</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">AEA 2025</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Fleet Data</span>
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
