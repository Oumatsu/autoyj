import Link from "next/link";

const content = `<p>Diagnosing Chinese EVs requires specific diagnostic tools that support Chinese OEM protocols — the generic OBD2 scanners used for European and Japanese ICE vehicles will not give you full access to EV-specific systems. This guide covers the diagnostic tool landscape as of 2026 and gives you concrete recommendations based on actual workshop applicability.</p>
<h2>Why Standard OBD2 Scanners Fall Short</h2>
<p>Chinese OEMs use their own enhanced protocols layered on top of OBD2 for EV-specific systems: battery management system (BMS), motor controller, on-board charger, DC-DC converter, and HVAC compressor. A generic OBD2 tool will only reach the standardised engine management layer — which, in an EV, is nearly empty.</p>
<h2>Recommended Diagnostic Tools</h2>
<h3>LAUNCH X431 series (most recommended)</h3>
<p>LAUNCH is a Chinese diagnostic equipment company. Their X431 series has the broadest Chinese EV coverage of any aftermarket tool. What it covers: BMS fault codes, battery cell voltage display, charging system faults, motor and inverter diagnostics, active tests, and service resets. Coverage spans BYD, MG, Chery, Great Wall, SAIC, GAC, NIO, and others.</p>
<h3>AUTEL MaxiSYS series</h3>
<p>Another strong option. Some African workshops report preferring the AUTEL interface for ease of use.</p>
<h3>Budget option: Brand-specific tools</h3>
<p>iCarsoft produces brand-specific units for MG and SAIC at lower cost, but they lack multi-brand coverage.</p>
<h2>Connecting a Diagnostic Tool to a Chinese EV</h2>
<p><strong>Step 1:</strong> Locate the OBD2 port — typically under the dashboard on the driver's side.</p>
<p><strong>Step 2:</strong> Vehicle must be in "ready" state for full diagnostic access.</p>
<p><strong>Step 3:</strong> In LAUNCH X431 or AUTEL, navigate: Chinese Brands → [Brand] → [Model] → [Year]. Manual selection gives more reliable results than auto scan.</p>
<p><strong>Step 4:</strong> Access subsystems individually. For EV work, the critical modules are: BMS, VCU, MCU, OBC, DCDC.</p>
<h2>Keeping Your Tools Current</h2>
<p>Renew your LAUNCH X431 or AUTEL Chinese EV software subscription annually. Budget approximately USD 150–250 per year.</p>
<h2>Recommended Starter Setup</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Tool</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Approx. cost (USD)</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">LAUNCH X431 PRO or PRO3S+</td><td class="p-4 text-sm text-gray-300">$800–1,200</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Chinese EV module subscription (annual)</td><td class="p-4 text-sm text-gray-300">$150–250</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Insulation resistance tester (1,000V rated)</td><td class="p-4 text-sm text-gray-300">$80–150</td></tr></tbody></table>
</div>
<h2>Sources</h2>
<p>LAUNCH Tech Co. — X431 Series Product Documentation (2026)</p>
<p>AUTEL Intelligent Technology — MaxiSYS Series Coverage Database (2026)</p>
<p>Africa E-Mobility Alliance — EV Aftermarket Workshop Survey, East Africa (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

export default function ChineseEvDiagnosticToolsPage() {
  return (
    <><main className="pt-32 pb-24 relative z-10 bg-a">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
          <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
          <Link href="/academy/technical-workshop" className="hover:text-gold transition">Technical Workshop</Link><span className="mx-2">/</span>
          <span className="text-white">Diagnostic Tools</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-8 xl:col-span-8">
            <header className="mb-12">
              <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", borderColor: "rgba(16,185,129,.3)" }}>Technical Workshop</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">Chinese EV Diagnostic Tools: What Actually Works in an African Workshop</h1>
              <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">Choosing the wrong diagnostic tool for Chinese EVs means you cannot read faults, cannot clear codes, and cannot do calibrations.</p>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span className="text-white">Youguard Academy</span></div>
                <div>May 16, 2026</div>
                <div className="flex items-center gap-2 text-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>9 min</div>
              </div>
            </header>
            <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
              <img src="/pic/academy/photo-1486312338219-ce68d2c6f44d.webp" alt="Diagnostic Tools" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
            </div>
            <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Diagnostics</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Tools</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">OBD</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img src="/pic/academy/photo-1560250097-0b93528c311a.webp" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                  <div><div className="text-sm font-bold text-white">Equipment Advice</div><div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div></div>
                </div>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need help sourcing diagnostic tools in East Africa? Let's talk.</p>
                <a href="/qr" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main></>
  );
}
