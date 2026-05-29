import Link from "next/link";

const content = `<p>Ethiopian operating conditions — altitude, dust, grid instability, heat in lowland regions — create fault patterns that don't appear in Chinese OEM technical documentation. This field reference covers what technicians are actually seeing.</p>
<h2>Category 1: Altitude and Thermal Faults</h2>
<h3>1A — BMS Thermal Warning During Fast Charging</h3>
<p><strong>Symptom:</strong> Vehicle stops fast charging mid-session. At 2,400m (Addis Ababa), air-cooled battery systems dissipate heat less effectively. Fast charging adds 30–60°C of heat to the battery cells.</p>
<p><strong>Diagnosis:</strong> Read BMS temperature data live during charge attempt. Inspect cooling inlet vents for dust blockage. Check if fault occurs only after multiple consecutive fast charges.</p>
<h3>1B — Reduced Range Complaints</h3>
<p>This is not a fault — it is an expected consequence of altitude, cold morning temperatures, dust-clogged cabin air filters, and BMS thermal throttling. In most cases, cleaning the cabin filter and educating the customer on altitude-adjusted range expectations closes the complaint.</p>
<h2>Category 2: Dust-Related Faults</h2>
<h3>2A — Cabin HVAC Blower Noise</h3>
<p>Severely clogged cabin air filter forcing the blower motor to work beyond its design load. Replace cabin air filter. For Ethiopian conditions, advise 10,000 km replacement intervals.</p>
<h3>2B — Charging Port Contact Faults</h3>
<p>Dust accumulation scores copper contact surfaces. Inspect with a torch. Clean with electrical contact cleaner. Replace if severely scored.</p>
<h3>2C — Cooling System Efficiency Drop</h3>
<p>Blocked cooling inlets at front bumper or undercarriage. Clean with low-pressure compressed air. Establish 5,000 km inspection schedule.</p>
<h2>Category 3: Grid Quality Faults</h2>
<h3>3A — OBC Fault After Generator Charging</h3>
<p>Generator sets produce voltage spikes or high harmonic distortion. Clear OBC fault code and test charge on stable grid supply. If fault returns, OBC may have sustained damage. Advise using AVR for generator charging.</p>
<h3>3B — 12V Battery Depletion from Grid Outages</h3>
<p>Extended grid outages prevent AC charging, causing the 12V battery to self-discharge. Jump-start the 12V battery or use a 12V battery charger. If deep discharge has occurred multiple times, replace the battery.</p>
<h2>Category 4: High-Mileage Fleet Faults</h2>
<h3>4A — Front Brake Pad Wear</h3>
<p>EV regenerative braking primarily acts on rear axle. Front brakes handle more load. Standard pad replacement with shorter interval expectations.</p>
<h3>4B — Tyre Wear Patterns</h3>
<p>Instant torque delivery causes higher wear on drive tyres. Check and set correct tyre pressure at every service. Rotate tyres at 10,000 km.</p>
<h3>4C — Door Seal Water Ingress</h3>
<p>High mileage degrades door seals. Ethiopian rainy season brings heavy daily rainfall. Inspect seals at 60,000 km+ service intervals.</p>
<h2>Quick Reference: Ethiopian Fault Frequency</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Fault</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Frequency</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Primary cause</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Cabin filter blockage</td><td class="p-4 text-sm text-gray-300">Very high</td><td class="p-4 text-sm text-gray-300">Dust</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">12V battery depletion</td><td class="p-4 text-sm text-gray-300">High</td><td class="p-4 text-sm text-gray-300">Grid instability</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">OBC fault from generator</td><td class="p-4 text-sm text-gray-300">High</td><td class="p-4 text-sm text-gray-300">Grid quality</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Reduced range complaints</td><td class="p-4 text-sm text-gray-300">Very high</td><td class="p-4 text-sm text-gray-300">Altitude + HVAC</td></tr></tbody></table>
</div>
<h2>Sources</h2>
<p>Africa E-Mobility Alliance — EV Operational Challenges in Sub-Saharan Africa (2025)</p>
<p>Ethiopian Electric Power — Grid Reliability Report (2024)</p>
<p>Ethiopian Roads Authority — Road Surface Condition Data (2024)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

export default function CommonFaultPatternsPage() {
  return (
    <><main className="pt-32 pb-24 relative z-10 bg-a">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
          <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
          <Link href="/academy/technical-workshop" className="hover:text-gold transition">Technical Workshop</Link><span className="mx-2">/</span>
          <span className="text-white">Fault Patterns</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-8 xl:col-span-8">
            <header className="mb-12">
              <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", borderColor: "rgba(16,185,129,.3)" }}>Technical Workshop</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">Common Fault Patterns in Chinese EVs Operating in Ethiopia: A Field Reference</h1>
              <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Ethiopian operating conditions create fault patterns that don't appear in OEM technical documentation.</p>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span className="text-white">Youguard Academy</span></div>
                <div>May 16, 2026</div>
                <div className="flex items-center gap-2 text-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>9 min</div>
              </div>
            </header>
            <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1600&q=80" alt="Fault Patterns" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
            </div>
            <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Fault Patterns</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Ethiopia</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Field Guide</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                  <div><div className="text-sm font-bold text-white">Field Support</div><div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div></div>
                </div>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need help diagnosing a tricky fault? Our technical team can assist.</p>
                <a href="/qr" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main></>
  );
}
