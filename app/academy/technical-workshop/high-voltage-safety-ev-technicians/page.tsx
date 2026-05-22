import Link from "next/link";

const content = `<p>High voltage safety rules for EV technicians are the non-negotiable foundation of any electric vehicle workshop operation. Unlike ICE vehicles where most risks are mechanical or involve hot fluids, EVs carry 200–800V DC electrical systems that can cause cardiac arrest from a single contact.</p>
<div class="rounded-[1.5rem] p-6 my-10" style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);">
  <p class="text-sm font-bold text-accent mb-2">CRITICAL SAFETY NOTICE</p>
  <p class="text-xs text-gray-400 leading-relaxed">High voltage (HV) systems in EVs operate at 200–800 volts DC. Direct contact can cause cardiac arrest, severe burns, or death. Never work on HV components without completing the isolation procedure described in this guide.</p>
</div>
<h2>Understanding the EV High Voltage System</h2>
<p><strong>Voltage levels in Chinese EVs:</strong> Most 400V platform vehicles (BYD Atto 3, MG4, Chery Omoda E5): 350–450V nominal. 800V platform vehicles: 700–800V nominal. Orange cables = HV. Always.</p>
<p><strong>What contains HV:</strong> Battery pack, main inverter, on-board charger (OBC), DC-DC converter, HVAC compressor motor, all orange-sheathed cables. <strong>What does NOT contain HV:</strong> 12V auxiliary battery, CAN bus/data cables, lighting systems.</p>
<h2>The Mandatory Isolation Procedure</h2>
<p><strong>Step 1:</strong> Switch off the ignition and remove the key or key fob. Place it at minimum 5 metres away.</p>
<p><strong>Step 2:</strong> Disconnect the 12V auxiliary battery — negative terminal first.</p>
<p><strong>Step 3:</strong> Wait for the discharge period. Minimum 5 minutes for 400V, 15 minutes for 800V platform vehicles.</p>
<p><strong>Step 4:</strong> Remove the HV service disconnect / maintenance plug. Pull using insulated tools only. Place it in your pocket — this is your physical lock-out mechanism.</p>
<p><strong>Step 5:</strong> Verify isolation with an insulation resistance tester (megohmmeter, rated for 1,000V DC minimum). Test between HV positive and chassis ground, and between HV negative and chassis ground.</p>
<p><strong>Step 6:</strong> Lock out and tag out. Place a physical lockout tag: "HV SYSTEM ISOLATED — DO NOT ENERGISE."</p>
<h2>Personal Protective Equipment (PPE) Requirements</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">PPE item</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Specification</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Insulated gloves</td><td class="p-4 text-sm text-gray-300">Class 00 (500V) or Class 0 (1,000V)</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Face shield</td><td class="p-4 text-sm text-gray-300">Clear polycarbonate, anti-flash rated</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Insulated boots</td><td class="p-4 text-sm text-gray-300">1,000V rated (EH-rated)</td></tr></tbody></table>
</div>
<h2>Workshop Setup Requirements</h2>
<ul><li>Insulated floor matting (rubber, minimum 1,000V rated)</li><li>Dedicated lockbox for service disconnects</li><li>First aid kit including AED</li><li>Posted HV emergency procedure</li><li>Insulation resistance tester, calibrated within 12 months</li><li>Fire extinguisher rated for electrical fires (CO₂ or dry chemical)</li></ul>
<h2>Emergency Response: If a Technician Contacts HV</h2>
<p><strong>Do not touch the person until you are certain the HV circuit is broken.</strong> A person in contact with a live HV circuit will cause current to flow through anyone who touches them.</p>
<p><strong>Correct sequence:</strong> Call for help immediately. Hit the workshop emergency stop. Use insulated tools to break the circuit. Check for cardiac arrest. Call emergency services. Begin CPR/AED if trained.</p>
<h2>Common Mistakes Ethiopian Technicians Make</h2>
<ol><li>Treating a switched-off EV as safe</li><li>Removing the 12V battery but skipping the service disconnect</li><li>Using a standard automotive multimeter to check HV</li><li>Performing work without PPE "just for a quick check"</li><li>Letting the service disconnect out of personal possession</li></ol>
<h2>Sources</h2>
<p>IEC 60903 — Rubber Insulating Gloves for Working Live</p>
<p>IEC 60900 — Insulating Hand Tools for Working Live</p>
<p>GB/T 18384 — Chinese National Standard for EV Electrical Safety</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

export default function HighVoltageSafetyPage() {
  return (
    <><main className="pt-32 pb-24 relative z-10">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
          <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
          <Link href="/academy/technical-workshop" className="hover:text-gold transition">Technical Workshop</Link><span className="mx-2">/</span>
          <span className="text-white">HV Safety</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-8 xl:col-span-8">
            <header className="mb-12">
              <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", borderColor: "rgba(16,185,129,.3)" }}>Technical Workshop</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">High Voltage Safety Rules for EV Technicians: What You Must Know Before Opening the Bonnet</h1>
              <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">High voltage safety is not optional in EV service. The risks are different from ICE vehicles — and the consequences of mistakes are immediate and severe.</p>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span className="text-white">Youguard Academy</span></div>
                <div>May 16, 2026</div>
                <div className="flex items-center gap-2 text-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>10 min</div>
              </div>
            </header>
            <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1600&q=80" alt="HV Safety" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
            </div>
            <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Safety</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">HV</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Technician</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                  <div><div className="text-sm font-bold text-white">Safety Training</div><div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div></div>
                </div>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need HV safety equipment sourcing advice? We can help.</p>
                <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main></>
  );
}
