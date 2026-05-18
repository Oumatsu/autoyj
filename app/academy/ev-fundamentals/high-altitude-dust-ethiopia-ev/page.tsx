import Link from "next/link";

const content = `<p>The widely repeated claim that EVs "don't care about altitude" is partially true and mostly misleading. Unlike internal combustion engines, electric motors do not require oxygen for combustion — so you will not see the 10–15% power loss that ICE vehicles suffer above 2,000m. However, altitude creates three real effects that dealers and technicians must understand.</p>
<h2>Why Altitude Matters for Electric Vehicles</h2>
<h3>1. Air cooling efficiency drops</h3>
<p>Most Chinese EVs sold in Africa use air-cooled or passively ventilated battery packs. At 2,400m, air density is roughly 76% of sea-level density. This means the cooling airflow passing through or around the battery pack carries less heat per unit volume. Under sustained load — climbing a long gradient, running at highway speed, or fast-charging repeatedly — thermal management is less effective than the manufacturer's sea-level specifications assume.</p>
<p>Practical implication: on sustained highland climbs, battery temperature may rise faster than the BMS expects. Well-designed BMS units will throttle output to protect the pack. Less sophisticated BMS implementations in lower-cost models may not respond quickly enough.</p>
<h3>2. Regenerative braking output is slightly reduced</h3>
<p>Regen braking works by running the motor as a generator. At altitude, slightly lower air resistance and reduced rolling resistance means the regen capture opportunity is also marginally lower. This effect is small (1–3%) and rarely operationally significant.</p>
<h3>3. HVAC system works harder</h3>
<p>Air conditioning and cabin heating systems operate on refrigerant cycles, which are affected by ambient air density. In thin air, the compressor works harder to move the same amount of thermal energy. This increases energy draw from the battery. At Addis Ababa's altitude combined with its cold mornings (temperatures frequently below 10°C at dawn), heater demand in particular can reduce effective range by 15–20% compared to manufacturer range figures tested at sea level.</p>
<h2>Altitude and Fast Charging</h2>
<p>Fast charging (DC charging at 30kW+) is the primary context where altitude becomes a serious concern in Ethiopia. Fast charging generates significant heat inside the battery pack. At sea level, the thermal management system — whether active liquid cooling or passive air cooling — is rated to handle this heat load. At 2,400m, the reduced air cooling efficiency described above applies directly.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse">
    <thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Charging scenario</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Sea level</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">2,400m (Addis)</th></tr></thead>
    <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">30kW session, 20–80% SOC</td><td class="p-4 text-sm text-gray-300">Normal</td><td class="p-4 text-sm text-gray-300">Monitor for thermal throttling after 40 min</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">60kW session, multiple back-to-back</td><td class="p-4 text-sm text-gray-300">Normal</td><td class="p-4 text-sm text-gray-300">High risk of BMS thermal limit trigger</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Overnight slow charge (7kW AC)</td><td class="p-4 text-sm text-gray-300">Normal</td><td class="p-4 text-sm text-gray-300">Unaffected — low heat generation</td></tr></tbody>
  </table>
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5"><p class="text-xs text-gray-500 font-light italic">Editorial estimate — specific thresholds vary by model and BMS implementation.</p></div>
</div>
<h2>How Dust Affects EVs: Three Entry Points</h2>
<p>Ethiopia's road network is approximately 85% unpaved outside major urban centres. Dust affects EVs through three distinct entry points.</p>
<h3>Entry Point 1: Cooling inlets and radiators</h3>
<p>Fine particulate matter accumulates in cooling inlets, reducing airflow and insulating surfaces against heat dissipation. Inspect and clean cooling inlets every 5,000 km or monthly during dry season.</p>
<h3>Entry Point 2: Cabin air filters and HVAC</h3>
<p>In Ethiopian dust conditions, cabin air filters clog 2–3x faster than in the vehicle's design market. Replace cabin air filters every 10,000 km in Ethiopian conditions.</p>
<h3>Entry Point 3: Connector contacts and charging ports</h3>
<p>Dust accumulation inside the charging port is an underappreciated failure mode. Install a rubber cap on the charging port when the vehicle is not charging. Clean the port before each charging session in dusty environments.</p>
<h2>What Dealers Should Tell Customers at Point of Sale</h2>
<p><strong>On range:</strong> "The manufacturer range figure is tested at sea level in moderate temperature. In Addis, expect 80–85% of that figure in typical daily driving."</p>
<p><strong>On charging:</strong> "Prefer slow overnight charging when possible. Do not stack multiple fast-charge sessions back-to-back."</p>
<p><strong>On maintenance intervals:</strong> "In Ethiopian conditions, cabin filters need replacing more often than the owner manual states. Keep the charging port capped when not in use."</p>
<h2>Summary: The Addis Checklist</h2>
<ul><li>Set customer range expectations to 80–85% of rated figure on handover</li><li>Advise slow overnight charging as primary method; limit back-to-back fast charging</li><li>Inspect and clean cooling inlets every 5,000 km</li><li>Replace cabin air filters every 10,000 km</li><li>Fit rubber cap on charging port; clean before every fast-charge session</li><li>Know whether your models use active liquid cooling or passive air cooling</li></ul>
<h2>Sources</h2>
<p>Ethiopian Roads Authority — Road Network Status Report (2024)</p>
<p>Ethiopian Meteorological Institute — Addis Ababa Climate Data (altitude 2,355m, temperature range)</p>
<p>China Automotive Technology and Research Center (CATARC) — EV BMS Thermal Management Technical Standards (2024)</p>
<p>Africa E-Mobility Alliance — EV Operational Challenges in Sub-Saharan Africa (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

const CAT_ARTICLES = [
  { title: "How EV Batteries Degrade: What African Dealers Need to Know", slug: "how-ev-batteries-degrade" },
  { title: "EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa", slug: "ev-range-explained-africa" },
];

export default function HighAltitudeDustPage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link>
            <span className="mx-2">/</span>
            <Link href="/academy/ev-fundamentals" className="hover:text-gold transition">EV Fundamentals</Link>
            <span className="mx-2">/</span>
            <span className="text-white">High Altitude & Dust</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>EV Fundamentals</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">High Altitude and Dust in Ethiopia: How They Affect Your EV</h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Understanding how high altitude and dust affect EVs in Ethiopia is essential knowledge for any dealer or technician operating in the East African market.</p>
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
                <img src="https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?auto=format&fit=crop&w=1600&q=80" alt="High Altitude and Dust in Ethiopia" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>
              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Ethiopia EV</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">High Altitude</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Dust</span>
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
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Have specific questions about EV operations in Ethiopia? Our team responds in 2 hours.</p>
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
