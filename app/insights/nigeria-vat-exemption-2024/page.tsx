import Link from "next/link";

const content = `<p>In September 2024, Nigeria's federal government quietly enacted one of the most significant EV import policy changes on the continent. The <strong>VAT Modification Order 2024</strong> exempted electric vehicles and their assembly components from Value Added Tax — while simultaneously removing the Import Adjustment Tax (IAT) that had previously applied to larger-engine ICE vehicles.</p>
<p>The change received limited press coverage relative to its commercial significance. For dealers importing EVs into Nigeria, it directly reduces the landed cost on every unit and every spare part order.</p>
<h2>What the VAT Modification Order 2024 Actually Covers</h2>
<p>The Order, which took effect in September 2024, applies VAT exemption to:</p>
<p>- <strong>Fully assembled electric vehicles</strong> (CBU imports)</p>
<p>- <strong>EV assembly parts and components</strong> — covering SKD and CKD kits</p>
<p>- <strong>Services directly related to EV manufacturing, assembly, and sales</strong></p>
<p>Simultaneously, the <strong>Import Adjustment Tax (IAT)</strong> — which was previously levied on ICE vehicles according to engine displacement — no longer applies to electric vehicles. EVs do not have an engine, so they were not subject to the IAT in any case, but the Order clarifies this explicitly, removing any ambiguity in customs classification.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/nigeria-vat-exemption-2024/policy-doc.jpg" alt="Official government policy documents representing the VAT Modification Order 2024" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">The VAT Modification Order 2024 was published in Nigeria's Federal Gazette in September 2024 — the legal instrument that dealers should reference in any customs dispute.</p>
  </div>
</div>
<h2>The Cost Impact</h2>
<p>Nigeria's standard VAT rate is <strong>7.5%</strong>. On a $25,000 EV (a reasonable baseline for a commercial-grade Chinese import), the exemption saves approximately <strong>$1,875 per unit</strong> versus a non-exempt import. Across a batch of 20 vehicles, that is a $37,500 cost reduction.</p>
<p>For spare parts orders — where Nigerian dealers have historically faced significant landed cost pressure — the exemption on components provides meaningful ongoing savings throughout the vehicle's service life.</p>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Cost Component</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Pre-September 2024</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Post-September 2024</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">VAT on CBU EV</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">7.5%</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">**0%**</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">VAT on EV assembly parts</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">7.5%</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">**0%**</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Import Adjustment Tax</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Clarified exempt</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Exempt (confirmed)</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Standard import duty</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Varies by HS code</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Unchanged</td></tr>
</table></div>
<h2>What Has Not Changed</h2>
<p>It is <span class="hl-green">important</span> to be precise about what the Order does and does not cover:</p>
<p>- <strong>Standard customs import duties</strong> on vehicles remain unchanged and must still be paid</p>
<p>- <strong>Excise duties</strong> on certain luxury vehicle categories may still apply depending on classification</p>
<p>- The exemption applies to <strong>electric vehicles specifically</strong> — hybrid vehicles that do not meet the full-electric classification threshold may not qualify</p>
<p>Dealers should ensure that their customs agent is correctly classifying imported EVs under the appropriate HS code to benefit from the exemption. Misclassification remains a common source of unexpected duty bills in Nigerian ports.</p>
<h2>Strategic Implications</h2>
<p>Nigeria represents one of the largest automotive markets in Sub-Saharan Africa — and one of the most challenging, given infrastructure constraints, currency volatility, and the dominance of used-vehicle imports. The VAT exemption does not resolve those structural challenges, but it meaningfully improves the economics of building a new-EV dealership.</p>
<p>Combined with the rapidly expanding network of Chinese OEM brands entering West Africa — including BYD, Chery, and SAIC — the policy creates a window for early movers to establish themselves in a market that is still largely unserved by legitimate EV retailers.</p>
<h2>Sources</h2>
<p>- Nigeria Federal Inland Revenue Service — *VAT Modification Order 2024* (September 2024)</p>
<p>- EV24.Africa — *"EV Import Duty in Africa Explained: Country-by-Country Guide"* (2025)</p>
<p>- Africa E-Mobility Alliance — *Africa E-Mobility Report 2025*</p>
<ul>
  <li>Published by Evexport Intelligence Desk · March 2026*</li>
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
                  Nigeria\'s VAT Exemption Order: What Every EV Dealer Must Know
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  In September 2024, Nigeria\'s federal government quietly enacted one of the most significant EV import policy changes on the continent.
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>March 5, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    5 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/nigeria-vat-exemption-2024/hero.jpg" alt="Nigeria\'s VAT Exemption Order: What Every EV Dealer Must Know" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Nigeria</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">VAT</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Import Duty</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">West Africa</span>
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
