import Link from "next/link";

const content = `<p>When a Chinese EV leaves a factory in Shenzhen, Tianjin, or Chongqing headed for East or West Africa, it will move by one of two ocean freight methods: <strong>RoRo (Roll-on Roll-off)</strong> or <strong>container</strong>. Both deliver vehicles. They differ substantially in cost, risk profile, loading process, transit time, and the type of port infrastructure they require at the receiving end.</p>
<p>Understanding this choice is not an abstraction â€?it affects your per-unit landed cost, your insurance exposure, and the condition of vehicles when they arrive. This article provides the framework for making the right decision based on shipment size, destination port, and vehicle type.</p>
<h2>How RoRo Works</h2>
<p>RoRo ships are purpose-built vehicle carriers â€?also called Pure Car and Truck Carriers (PCTCs). Vehicles drive onto the vessel under their own power or are towed using low-profile trailers, then secured to the deck with straps and wheel chocks. At the destination port, vehicles drive or are towed off.</p>
<p>RoRo is the dominant method for new vehicle manufacturer export worldwide, including virtually all Japanese used vehicle exports to East Africa that have defined the industry for 30 years. The largest RoRo ships carry up to 7,000 CEUs (Car Equivalent Units).</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/roro-vs-container/container-ship.jpg" alt="Large container ship at sea representing the alternative ocean freight method using standard ISO containers for vehicle shipment" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Container shipping requires vehicles to be placed inside 20- or 40-foot ISO containers â€?either one vehicle per 40ft container or two smaller vehicles in a single container with careful blocking and bracing.</p>
  </div>
</div>
<h2>How Container Shipping Works</h2>
<p>Container shipping uses standard ISO 20-foot or 40-foot boxes. Vehicles are driven into containers at the loading end, secured with wheel chocks and tie-down straps, and sealed for ocean transit. At the destination, vehicles are lifted off and driven out.</p>
<p>A standard 40-foot container fits one mid-size sedan or SUV with room for accessories. Some configurations allow two compact vehicles (like the BYD Seagull or MG4) with careful arrangement. A 20-foot container fits one compact vehicle.</p>
<p>Container shipping requires additional labour at both ends for loading and unloading, and specialised container handling equipment at the destination port. However, it provides the vehicle with a physical enclosure that protects against weather, theft, and damage during transit.</p>
<h2>Side-by-Side Comparison</h2>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Factor</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">RoRo</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Container</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Cost per vehicle</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Lower (no container rental, simpler handling)</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Higher (container rental + lashing + handling)</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Transit time</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Typically 20â€?5 days China â†?East Africa</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Similar; +2â€? days for container port logistics</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Vehicle exposure</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Open deck; weather and salt spray exposure</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Enclosed; fully protected from elements</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Minimum shipment</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Single vehicle (most RoRo operators)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Single vehicle (one container)</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Bulk discount</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Yes â€?significant savings at 10+ units</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Less pronounced</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">EV battery risk</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Battery at 30-50% charge required</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Same restriction applies</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Port compatibility</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Requires dedicated RoRo berth</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Any container terminal</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Theft risk in transit</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Low (vessels are managed)</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Low (containers are sealed)</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Condition on arrival</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Generally excellent; minor dust</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Excellent; fully enclosed</td></tr>
</table></div>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/roro-vs-container/port-logistics.jpg" alt="Port logistics operations representing the vehicle clearance process at East African ports including Mombasa and Djibouti" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Port infrastructure matters: Djibouti has a dedicated RoRo terminal (Doraleh Multi-Purpose Port). Mombasa handles both RoRo and container vehicles. Dar es Salaam's RoRo capacity is more limited â€?container may be preferable for Tanzania-bound shipments.</p>
  </div>
</div>
<h2>When to Choose RoRo</h2>
<p>RoRo is typically the right choice when:</p>
<h2>When to Choose Container</h2>
<p>Container is typically right when:</p>
<h2>The EV-Specific Consideration: Battery State at Loading</h2>
<p>This is the one area where EV shipping differs from ICE vehicle shipping and where importers consistently encounter unexpected costs or delays.</p>
<p>Most RoRo terminals and container yards require EV batteries to be at <strong>30â€?span class="hl-gold">50% </span>state of charge at loading</strong>. Vehicles arriving at the terminal with depleted or fully charged batteries may be refused loading or subject to on-site charging/discharging that adds cost and delay.</p>
<p>Chinese exporters working with legitimate OEM channels typically manage this â€?vehicles are parked at export yards for days to weeks, and charge levels are monitored. Grey-market traders moving vehicles directly from registrations to ports may deliver vehicles at <span class="hl-gold">0% </span>charge (never been driven, never been charged since factory). This creates a loading issue that is your problem to solve, not theirs.</p>
<h2>Sources</h2>
<p>Grimaldi Lines â€?Chinaâ€“Africa RoRo service documentation (2025â€?026)</p>
<p>Djibouti Ports & Free Zones Authority â€?Doraleh RoRo terminal specifications</p>
<p>Kenya Ports Authority â€?Mombasa RoRo and container import procedures (2025)</p>
<p>Freightos â€?<em>"RoRo vs Container: Auto Shipping Explained"</em> (2025)</p>
<p>BIMCO â€?<em>"Pure Car and Truck Carrier Market Update"</em> (Q1 2026)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Evexport Intelligence Desk Â· March 2026</p>
`;

export default function ArticlePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/insights" className="hover:text-gold transition">Insights</Link>
            <span className="mx-2">/</span>
            <span className="text-white">Sourcing</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-accent/10 text-accent border border-accent/30" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Sourcing Intelligence
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  RoRo or Container? How African EV Importers Should Choose Their Shipping Method
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  When a Chinese EV leaves a factory in Shenzhen, Tianjin, or Chongqing headed for East or West Africa, it will move by one of two ocean freight methods: RoRo (Ro
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>March 15, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    6 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/roro-vs-container/hero.jpg" alt="RoRo or Container? How African EV Importers Should Choose Their Shipping Method" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">RoRo</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Container Shipping</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Logistics</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Africa Import</span>
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
