import Link from "next/link";

const content = `<p>Voltage fluctuation and its effects on EV charging in Ethiopia is a topic that almost no Chinese OEM service documentation addresses, yet it causes a significant proportion of charging-related faults and OBC failures.</p>
<h2>The Ethiopian Grid: What Technicians Need to Know</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Zone</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Typical voltage quality</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Central Addis (Bole, Kazanchis)</td><td class="p-4 text-sm text-gray-300">Relatively stable, 215–235V</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Peri-urban Addis (Akaki, Kolfe)</td><td class="p-4 text-sm text-gray-300">Higher variation, 200–245V possible</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Generator-supplied properties</td><td class="p-4 text-sm text-gray-300">200–260V, frequency 48–52Hz</td></tr></tbody></table>
</div>
<h2>How Voltage Fluctuation Causes Charging Faults</h2>
<p>Most Chinese EV OBCs accept 220V AC ±10% (198–242V). Some accept a wider range (170–264V).</p>
<p><strong>Undervoltage (below 198V):</strong> OBC reduces output, slows charging significantly, and below ~175–185V shuts down completely.</p>
<p><strong>Overvoltage (above 242V):</strong> OBC triggers overvoltage protection and shuts down. Severe spikes may damage input protection circuitry.</p>
<p><strong>Frequency instability:</strong> Generator sets running at 48Hz or 52Hz stress the OBC's power factor correction circuit, causing premature PFC component failure.</p>
<h2>Diagnosing Grid-Related Charging Faults</h2>
<p><strong>Step 1:</strong> Ask where the vehicle was charged — generator-related OBC faults are the most common.</p>
<p><strong>Step 2:</strong> Measure supply voltage at the charge point using a true-RMS multimeter over 5–10 minutes.</p>
<p><strong>Acceptable range:</strong> 198–242V (or the OBC's documented range).</p>
<p><strong>Step 3:</strong> Clear the OBC fault code and test on a verified stable supply. If charging succeeds on stable supply, the fault was supply-caused.</p>
<h2>Practical Solutions</h2>
<h3>Solution 1: Automatic Voltage Regulator (AVR)</h3>
<p>An AVR maintains a stable output voltage (typically 220V ±3%) regardless of input variation. Use at any charging location where input voltage is variable.</p>
<p><strong>Sizing:</strong> For a 7kW AC wall box: minimum 7kVA AVR, recommended 10kVA. Approximate cost: ETB 8,000–20,000 for 10kVA.</p>
<h3>Solution 2: Surge Protection Device (SPD) + AVR</h3>
<p>For locations with known voltage spikes (generator-backup properties). Install SPD ahead of the AVR for the most comprehensive protection.</p>
<h3>Solution 3: Dedicated Circuit and Larger Cable Sizing</h3>
<p>Voltage sag during charging is sometimes caused by undersized supply wiring. For a 7kW charger (32A), minimum 6mm² cable for runs up to 20 metres.</p>
<h3>Solution 4: Generator Selection</h3>
<p>Inverter generators produce cleaner output than conventional generators. Minimum 10kVA for a 7kW EV charger.</p>
<h2>Summary Checklist</h2>
<ul><li>Supply voltage measured at charge point: 198–242V during charge session</li><li>No voltage spikes above 250V detected</li><li>Generator supply: inverter type or with ≤3% voltage regulation</li><li>Circuit sizing: minimum 1.25x charge current rated cable</li><li>AVR installed if supply variation exceeds ±5%</li><li>OBC fault codes cleared after supply remediation</li></ul>
<h2>Sources</h2>
<p>Ethiopian Electric Power — Distribution Network Standards (2024)</p>
<p>IEC 61000-3-2 — Limits for Harmonic Current Emissions</p>
<p>CATARC — OBC Input Voltage Tolerance Standards (2024)</p>
<p>Africa E-Mobility Alliance — EV Charging Infrastructure Challenges (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

export default function VoltageFluctuationPage() {
  return (
    <><main className="pt-32 pb-24 relative z-10 bg-a">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
          <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
          <Link href="/academy/technical-workshop" className="hover:text-gold transition">Technical Workshop</Link><span className="mx-2">/</span>
          <span className="text-white">Voltage Fluctuation</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-8 xl:col-span-8">
            <header className="mb-12">
              <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", borderColor: "rgba(16,185,129,.3)" }}>Technical Workshop</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">Voltage Fluctuation and EV Charging in Ethiopia: What Every Technician Must Know</h1>
              <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Ethiopian grid voltage is one of the most underappreciated causes of EV charging faults.</p>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span className="text-white">Youguard Academy</span></div>
                <div>May 16, 2026</div>
                <div className="flex items-center gap-2 text-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>8 min</div>
              </div>
            </header>
            <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
              <img src="https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80" alt="Voltage Fluctuation" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
            </div>
            <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Grid</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Voltage</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">AVR</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                  <div><div className="text-sm font-bold text-white">Infrastructure Help</div><div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div></div>
                </div>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need AVR sourcing advice for your charging installation? Let's talk.</p>
                <a href="/qr" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main></>
  );
}
