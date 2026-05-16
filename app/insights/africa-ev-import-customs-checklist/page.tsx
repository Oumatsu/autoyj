import Link from "next/link";

const content = `<p>African customs clearance for imported vehicles has always been document-intensive. Chinese EVs add two new layers of complexity: <strong>battery-specific technical requirements</strong> that existing ICE vehicle documentation frameworks were not designed for, and the <strong>new OEM documentation requirements</strong> introduced by China's January 2026 export regulations.</p>
<p>This checklist is based on the documented requirements of the four largest African EV import markets by volume: Ethiopia, Kenya, Nigeria, and Ghana. Country-specific variations are noted where they apply. For any individual shipment, work with a licensed customs clearing agent in the destination country — this guide provides the framework, not the legal instrument.</p>
<h2>Part 1: China-Side Export Documents</h2>
<p>These documents are generated before the vehicle leaves China. Missing any of them creates a problem that cannot be resolved at the African port.</p>
<h3>1. Bill of Lading (BL)</h3>
<p>The fundamental ocean freight document. For RoRo shipments, this is typically a <strong>RoRo Bill of Lading</strong> issued by the shipping line. For container shipments, a standard container BL applies.</p>
<p>The BL must state:</p>
<p>- Consignee name and address (your entity in the destination country)</p>
<p>- Vessel name and voyage number</p>
<p>- Port of loading and port of discharge</p>
<p>- Vehicle description (make, model, year)</p>
<p>- Container or RoRo slot number</p>
<p>- Freight terms (FOB, CIF, etc.)</p>
<h3>2. Commercial Invoice</h3>
<p>Issued by the seller. Must show:</p>
<p>- Seller and buyer details</p>
<p>- VIN number</p>
<p>- Vehicle description (make, model, year, engine/motor type)</p>
<p>- Transaction price in USD (or agreed currency)</p>
<p>- Payment terms</p>
<h3>3. Packing List</h3>
<p>A supporting document confirming the vehicle contents and accessories. For EVs, should explicitly list the charging cable type(s) included.</p>
<div class="rounded-[1.5rem] overflow-hidden my-10">
  <img src="images/africa-ev-import-customs-checklist/port-inspection.jpg" alt="Port inspection and vehicle clearance operations representing the customs examination process at East African ports" class="w-full h-auto object-cover" style="max-height:450px;">
  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">
    <p class="text-xs text-gray-500 font-light italic leading-relaxed">Physical inspection at Djibouti or Mombasa is routine. Vehicles selected for examination are checked against documentation — VIN plate, engine number (or motor serial number for EVs), and general condition. Discrepancies between document descriptions and physical vehicle generate holds.</p>
  </div>
</div>
<h3>4. Certificate of Origin (COO)</h3>
<p>Certifies that the vehicle was manufactured in China. Issued by the China Council for the Promotion of International Trade (CCPIT) or the relevant Chinese Chamber of Commerce.</p>
<p>Important for African markets: COO determines which trade agreement duty rates apply. Ethiopia, Kenya, Nigeria, and Ghana are all members of COMESA or ECOWAS, but these regional agreements do not extend preferences to Chinese imports. Standard MFN duty rates apply in all four markets unless a bilateral arrangement applies.</p>
<h3>5. Vehicle Inspection Certificate / Pre-Shipment Inspection Report (PSI)</h3>
<p>Several African countries (including Ethiopia and Nigeria) require a Pre-Shipment Inspection certificate from an approved inspection company (Bureau Veritas, SGS, Intertek) confirming the vehicle matches the stated specifications, VIN, and condition.</p>
<p>For Ethiopia: QSAE (Quality and Standards Authority of Ethiopia) has approved several inspection entities. Confirm current approved inspectors before shipment.</p>
<h3>6. OEM After-Sales Service Confirmation Document</h3>
<p>This document must:</p>
<p>- Be issued by the vehicle manufacturer (not a dealer or trader)</p>
<p>- Carry the manufacturer's official seal (公章)</p>
<p>- Specify the destination country</p>
<p>- Reference the VIN number</p>
<p>If your vehicle was manufactured or first registered in 2025 or 2026 and was exported within 180 days of its registration date, absence of this document means the vehicle cannot legally leave China. Any supplier who cannot provide this document for a recently-manufactured vehicle is a compliance red flag.</p>
<h2>Part 2: Technical Documents for EVs</h2>
<p>Standard ICE vehicle imports require an engine number. EVs require a different set of technical identifiers.</p>
<h3>7. Battery Specification Sheet</h3>
<p>A technical document from the battery manufacturer (CATL, BYD, SVOLT, or the OEM) specifying:</p>
<p>- Battery chemistry (LFP, NCM, sodium-ion)</p>
<p>- Nominal capacity (kWh)</p>
<p>- Voltage</p>
<p>- UN number for dangerous goods classification</p>
<p>- Battery serial number</p>
<p>Many African customs authorities now require UN38.3 dangerous goods transport documentation for EV battery shipments. This is increasingly enforced at Djibouti and Mombasa.</p>
<h3>8. UN38.3 Test Summary (Dangerous Goods Transport Certificate)</h3>
<p>EV batteries are classified as dangerous goods under international transport regulations. The UN38.3 test summary is the document proving the battery has been certified for safe transport.</p>
<p>For Chinese EV brands, this document should be available from the OEM or battery supplier. It is not commonly required for RoRo ocean freight of assembled vehicles (as distinct from batteries shipped separately), but port authorities in Kenya and Ethiopia have occasionally requested it for physical inspection lots.</p>
<h3>9. EV Homologation or Type Approval Documentation</h3>
<p>Several African markets are moving toward requiring evidence that imported EVs meet local or international safety standards. This is currently <strong>mandatory in South Africa</strong> (SABS approval) and increasingly requested (though not always mandatory) in Kenya and Ethiopia.</p>
<p>For vehicles without home-country type approval documentation, importers sometimes use an independent inspection certificate as a substitute. Confirm the current requirements with a licensed clearing agent before finalising the shipment.</p>
<h2>Part 3: Destination-Specific Additional Requirements</h2>
<h3>Ethiopia</h3>
<p>- <strong>ERCA Import Declaration (Customs Form)</strong>: filed at the port of entry (typically Djibouti, cleared by Ethiopian customs liaison officers stationed there)</p>
<p>- <strong>Letter of Credit or Bank Transfer Proof</strong>: ERCA requires evidence of payment channel (wire transfer through licensed Ethiopian bank or an approved forex mechanism)</p>
<p>- <strong>QSAE Pre-Shipment Inspection Report</strong>: from an approved inspector (see above)</p>
<h3>Kenya</h3>
<p>- <strong>Kenya Revenue Authority Single Customs Territory (SCT) declaration</strong>: applies to vehicles entering through EAC partner state ports (Djibouti, Dar es Salaam)</p>
<p>- <strong>Kenya Bureau of Standards (KEBS) Permit</strong>: required for vehicles that have not previously been approved under a recognised international type approval scheme</p>
<p>- <strong>Age restriction documentation</strong>: Kenya restricts import of vehicles over 8 years old; for Chinese EVs, manufacture date confirmation is required</p>
<h3>Nigeria</h3>
<p>- <strong>NAFDAC / SON permits for EV batteries</strong>: Nigeria Standards Organisation (SON) has developed inspection protocols for imported EV batteries; requirements were expanding in 2025</p>
<p>- <strong>Form M (Import licence)</strong>: issued by Nigerian banks; required before goods can be shipped</p>
<p>- <strong>Combined Certificate of Value and Origin (CCVO)</strong>: required for Nigeria customs valuation</p>
<h3>Ghana</h3>
<p>- <strong>Customs Declaration (CD)</strong>: filed through Ghana Revenue Authority's Integrated Customs Management System (ICUMS)</p>
<p>- <strong>Road Traffic Authority (DVLA) vehicle inspection</strong>: for used and reconditioned imports; new vehicles may be exempt</p>
<p>- <strong>2024 zero-tariff eligibility documentation</strong>: since Ghana's 2024 automotive import tariff revision, EVs meeting specific technical criteria qualify for zero import duty — documentation of those criteria is required to claim the exemption</p>
<h2>The Master Checklist</h2>
<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm"><tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">#</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Document</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Always Required</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">EV-Specific</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Notes</th></tr>
<tr><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">1</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Bill of Lading</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">✓</th><th class="py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left">Match consignee name exactly</th></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">2</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Commercial Invoice</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">✓</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Realistic CIF values</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">3</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Packing List</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">✓</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Include charging cable</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">4</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Certificate of Origin</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">✓</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">CCPIT-issued</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">5</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Pre-Shipment Inspection</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Most markets</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Bureau Veritas / SGS / Intertek</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">6</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">OEM After-Sales Confirmation</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">If <180 days old</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">2026 requirement; OEM seal mandatory</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">7</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Battery Specification Sheet</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">✓</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Chemistry, kWh, serial number</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">8</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">UN38.3 Test Summary</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">✓</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Increasingly enforced</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">9</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Type Approval / Homologation</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">SA mandatory</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">✓</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">KE/ET increasingly required</td></tr>
<tr><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">10</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Country-specific permits</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">Per destination</td><td class="py-3 px-4 text-sm text-gray-300 border-b border-white/5">See Part 3 above</td></tr>
</table></div>
<h2>Sources</h2>
<p>- Ethiopian Revenues and Customs Authority (ERCA) — import documentation requirements (2025–2026)</p>
<p>- Kenya Revenue Authority — Single Customs Territory procedures and vehicle import guidelines</p>
<p>- Nigeria Customs Service — Form M and CCVO requirements</p>
<p>- Ghana Revenue Authority — ICUMS vehicle import declaration guidance</p>
<p>- China Council for the Promotion of International Trade (CCPIT) — Certificate of Origin issuance procedures</p>
<p>- IMO — IMDG Code: UN38.3 dangerous goods classification for lithium batteries</p>
<ul>
  <li>本文清单基于2026年2月各市场清关实践整理。各国海关文件要求及新规（包括埃塞俄比亚OEM售后确认函等）可随政策调整变化，建议在出运前向目标市场持牌清关行确认最新有效文件要求。*</li>
</ul>
<ul>
  <li>Published by Evexport Intelligence Desk · February 2026*</li>
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
            <span className="text-white">Sourcing</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border bg-accent/10 text-accent border border-accent/30" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  Sourcing Intelligence
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  The Complete Document Checklist for Importing a Chinese EV Into Africa
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  African customs clearance for imported vehicles has always been document-intensive.
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>February 20, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    7 min
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/africa-ev-import-customs-checklist/hero.jpg" alt="The Complete Document Checklist for Importing a Chinese EV Into Africa" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Import Compliance</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Customs Clearance</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Documentation</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Africa EV</span>
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
