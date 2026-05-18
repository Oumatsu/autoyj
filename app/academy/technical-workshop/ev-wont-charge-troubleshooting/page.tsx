import Link from "next/link";

const content = `<p>A charging fault can occur at any point in the circuit. Understanding the path that electricity takes from the grid to the battery helps you isolate where the fault lies.</p>
<p><strong>AC charging path:</strong> Grid → EVSE → Charge port → On-Board Charger (OBC) → DC-DC conversion → HV battery pack.</p>
<p><strong>DC fast charging path:</strong> DC charger → Charge port → BMS (bypasses OBC) → HV battery pack.</p>
<p><strong>Key insight:</strong> If the vehicle charges on AC but not DC (or vice versa), you have immediately isolated the fault to one half of the charging system.</p>
<h2>Diagnostic Flowchart</h2>
<p><strong>Q1:</strong> Does the vehicle charge on a different cable/EVSE?<br/>Yes → Cable or EVSE fault. No → Continue.</p>
<p><strong>Q2:</strong> Does the vehicle charge at a different location?<br/>Yes → Supply issue at original location. No → Continue.</p>
<p><strong>Q3:</strong> Does it charge on AC but not DC (or vice versa)?<br/>AC only fails → OBC or AC charge port. DC only fails → DC charge port or BMS communication.</p>
<h2>Step 1: Test the 12V Auxiliary Battery First</h2>
<p>This step alone resolves approximately 20% of "won't charge" faults. The charge port lock, OBC control relay, BMS, and charging communication system all require 12V power. With the vehicle off, voltage should be 12.4V or above.</p>
<h2>Step 2: Inspect the Charge Port</h2>
<p>Look for scored or burnt contacts, debris, bent pins, or a stuck port lock. If contacts are scored: clean with electrical contact cleaner and a soft applicator. Do not use sandpaper.</p>
<h2>Step 3: Check for Fault Codes</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Fault code</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Module</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Meaning</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">OBC supply voltage fault</td><td class="p-4 text-sm text-gray-300">OBC</td><td class="p-4 text-sm text-gray-300">Grid voltage out of range</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">BMS charging contactor fault</td><td class="p-4 text-sm text-gray-300">BMS</td><td class="p-4 text-sm text-gray-300">Contactor stuck or wiring fault</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Charge port temperature high</td><td class="p-4 text-sm text-gray-300">Port sensor</td><td class="p-4 text-sm text-gray-300">Overheating at contacts</td></tr></tbody></table>
</div>
<h2>Step 4: Grid Quality Issues</h2>
<p>Many Chinese EV on-board chargers are calibrated for 220V ±10%. African grid supply frequently falls outside these parameters. Voltage sag, voltage spikes, and frequency instability all cause charging faults. An automatic voltage regulator (AVR) between the wall socket and the EVSE resolves most grid-quality charging faults.</p>
<h2>Step 5: OBC Fault Diagnosis</h2>
<p>If fault codes point to OBC internal fault, or if the vehicle charges on DC but not AC: confirm 12V control power is reaching the OBC, confirm AC input is reaching the OBC. If both are confirmed and OBC does not activate, the OBC requires replacement.</p>
<h2>Step 6: DC Fast Charging Specific Faults</h2>
<p>Check connector compatibility (CCS2 vs CHAdeMO check), communication handshake, and battery temperature limits. The BMS will not allow DC fast charging if battery temperature is outside permitted range.</p>
<h2>Common Causes by Frequency</h2>
<ol><li>Weak/dead 12V auxiliary battery</li><li>Grid voltage out of range</li><li>Damaged charge port contacts</li><li>Faulty charging cable or EVSE</li><li>OBC internal fault</li><li>BMS charging contactor fault</li><li>DC charge communication fault</li></ol>
<h2>Sources</h2>
<p>IEC 61851 — Electric Vehicle Conductive Charging System</p>
<p>ISO 15118 — Vehicle to Grid Communication Interface</p>
<p>Africa E-Mobility Alliance — EV Charging Infrastructure Challenges (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

export default function EvWontChargePage() {
  return (
    <><main className="pt-32 pb-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
          <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
          <Link href="/academy/technical-workshop" className="hover:text-gold transition">Technical Workshop</Link><span className="mx-2">/</span>
          <span className="text-white">Charging Troubleshooting</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-8 xl:col-span-8">
            <header className="mb-12">
              <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(239,68,68,.1)", color: "#F87171", borderColor: "rgba(239,68,68,.3)" }}>Technical Workshop</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">EV Won't Charge: A Step-by-Step Troubleshooting Guide for African Technicians</h1>
              <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Charging failures are the second most common EV complaint after range anxiety. Most are caused by one of six root causes.</p>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span className="text-white">Youguard Academy</span></div>
                <div>May 16, 2026</div>
                <div className="flex items-center gap-2 text-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>9 min</div>
              </div>
            </header>
            <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
              <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=1600&q=80" alt="EV Charging" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
            </div>
            <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Charging</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Troubleshooting</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">OBC</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                  <div><div className="text-sm font-bold text-white">Need Help?</div><div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div></div>
                </div>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Can't resolve a charging issue? Our technical team can help diagnose.</p>
                <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main></>
  );
}
