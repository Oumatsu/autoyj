import Link from "next/link";

const content = `<p>The 12V auxiliary battery in Chinese EVs is the most overlooked — and most failure-prone — component in the vehicle. While the traction battery (HV pack) powers the motor, the 12V battery powers every control module, relay, sensor, and communication system. When it fails, the vehicle will not start, will not enter Ready mode, and in many cases will not even unlock.</p>
<h2>What the 12V Battery Does in an EV</h2>
<p>In an ICE vehicle, the 12V battery cranks the starter motor and runs accessories. In an EV, it powers: all ECUs (VCU, BMS, MCU, OBC, DCDC), all relays including HV contactors, door locking, lighting, instrument cluster, infotainment, ADAS systems, and the charge port lock actuator.</p>
<p><strong>Critical implication:</strong> If the 12V battery is dead, none of these systems wake up. The HV contactors cannot close. The vehicle cannot enter Ready mode even though the traction battery has full charge.</p>
<h2>How the 12V Battery Is Recharged in an EV</h2>
<p>EVs have a DC-DC converter that steps voltage down from the HV traction battery to 12–14V. Three failure scenarios are unique to EVs:</p>
<p><strong>1. Vehicle left parked with no AC charging:</strong> The 12V battery runs standby systems. After 2–3 weeks in hot conditions, it can self-discharge past recovery.</p>
<p><strong>2. DC-DC converter failure:</strong> If the DC-DC converter fails, the 12V battery is not recharged while driving.</p>
<p><strong>3. High heat accelerating degradation:</strong> Ethiopian temperatures accelerate lead-acid battery degradation. A 12V battery that lasts 4–5 years in China may last 18–24 months in Ethiopia.</p>
<h2>Diagnosing a 12V Failure</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Open circuit voltage</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Battery state</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">12.6–12.8V</td><td class="p-4 text-sm text-gray-300">Fully charged</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">12.2–12.4V</td><td class="p-4 text-sm text-gray-300">50–75% charged, needs charging</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Below 10.5V</td><td class="p-4 text-sm text-gray-300">Likely sulfated — replace</td></tr></tbody></table>
</div>
<h2>Replacement Procedure</h2>
<p>Most Chinese EVs use a 12V AGM (Absorbent Glass Mat) battery. Using a flooded battery as a replacement works but will fail faster in EV service.</p>
<p><strong>Steps:</strong> Complete HV isolation procedure → disconnect negative terminal first → remove hold-down bracket → install new battery (same or higher CCA) → reconnect positive first → verify key fob pairing → clear fault codes with diagnostic tool.</p>
<h2>Customer Advice: Preventing 12V Failures</h2>
<ul><li>Plug in when parked for more than a week — AC charging keeps the DC-DC active</li><li>Do not leave accessories running with the vehicle off</li><li>In hot climates, expect 2–3 year lifespan, not 4–5 years</li></ul>
<h2>12V Failure vs HV Battery Failure</h2>
<div class="rounded-[1.5rem] overflow-hidden my-10 border border-white/5">
  <table class="w-full border-collapse"><thead><tr class="bg-white/[0.03]"><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">Symptom</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">12V failure</th><th class="text-left p-4 text-[10px] font-black uppercase tracking-wider text-gray-400">HV failure</th></tr></thead>
  <tbody><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Vehicle completely unresponsive</td><td class="p-4 text-sm text-gray-300">Yes</td><td class="p-4 text-sm text-gray-300">Rarer</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Charging port light not activating</td><td class="p-4 text-sm text-gold">Yes</td><td class="p-4 text-sm text-gray-300">No</td></tr><tr class="border-t border-white/5"><td class="p-4 text-sm text-gray-300">Repair cost</td><td class="p-4 text-sm text-gold">Low</td><td class="p-4 text-sm text-accent">Very high</td></tr></tbody></table>
</div>
<h2>Sources</h2>
<p>Battery Council International — AGM Battery Technical Manual (2024)</p>
<p>Africa E-Mobility Alliance — EV Workshop Common Fault Survey, East Africa (2025)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

export default function AuxiliaryBatteryPage() {
  return (
    <><main className="pt-32 pb-24 relative z-10 bg-a">
      <div className="container mx-auto px-6 md:px-12">
        <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
          <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
          <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
          <Link href="/academy/technical-workshop" className="hover:text-gold transition">Technical Workshop</Link><span className="mx-2">/</span>
          <span className="text-white">12V Battery</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
          <div className="lg:col-span-8 xl:col-span-8">
            <header className="mb-12">
              <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", borderColor: "rgba(16,185,129,.3)" }}>Technical Workshop</span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">The 12V Auxiliary Battery in Chinese EVs: Why It Fails, How to Test It, How to Replace It</h1>
              <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">The 12V auxiliary battery is the single most common cause of "dead EV" complaints — and the easiest to fix correctly.</p>
              <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div><span className="text-white">Youguard Academy</span></div>
                <div>May 16, 2026</div>
                <div className="flex items-center gap-2 text-gold"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>8 min</div>
              </div>
            </header>
            <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
              <img src="/pic/academy/0.webp" alt="12V Battery" className="w-full h-full object-cover" />
              <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
            </div>
            <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">12V Battery</span>
                <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Diagnostics</span>
              </div>
            </div>
          </div>
          <aside className="lg:col-span-4 xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                <div className="flex items-center gap-4 mb-6">
                  <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                  <div><div className="text-sm font-bold text-white">Need Parts?</div><div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div></div>
                </div>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">We can help source AGM batteries for your workshop stock.</p>
                <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main></>
  );
}
