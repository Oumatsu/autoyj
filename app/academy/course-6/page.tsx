import Link from "next/link";

const sections = [
  {
    id: "equipment-procurement",
    num: "1",
    title: "Equipment Procurement",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Setting up an EV service centre requires specialized equipment that differs significantly from traditional ICE workshops. The right tools not only enable proper diagnostics and repairs but also ensure technician safety when working with high-voltage systems." },
      { type: "h4", text: "Essential Equipment Categories" },
      { type: "ul", items: ["Lifting Systems: Insulated hydraulic lifts rated for EV curb weights, with battery pack removal capabilities.", "Diagnostic Machines: OEM-level scan tools capable of reading BMS, motor controller, and thermal system data.", "Battery Handling Equipment: Insulated battery drop tables, HV disconnect tools, and certified storage racks.", "Thermal Management Tools: Coolant fill/vacuum stations, thermal imaging cameras, and insulation testers.", "Safety Gear: HV-rated insulated gloves (Class 0), arc flash face shields, insulating mats, and lockout/tagout kits."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A new service centre in Egypt reduced downtime by 40% after installing recommended diagnostic and lifting equipment. The investment paid for itself within 8 months through faster service turnaround." },
      { type: "img", src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1000&q=80", alt: "Service centre equipment" },
      { type: "glass-box", text: "Service Integration Point: We provide curated procurement lists and supplier contacts for all essential EV service centre equipment, verified for compatibility with Chinese EV brands." },
    ],
  },
  {
    id: "technician-training",
    num: "2",
    title: "Technician Training",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Well-trained technicians are the backbone of any successful EV service centre. Unlike ICE vehicles where mechanical experience transfers directly, EV service requires a combination of high-voltage safety knowledge, software diagnostic skills, and battery system expertise that most traditional mechanics do not possess." },
      { type: "ul", items: ["Battery Safety: High-voltage disconnect procedures, emergency response to thermal events, and proper PPE usage.", "Electrical Systems: HV component identification, inverter and DC-DC converter diagnostics, and insulation testing.", "Software Diagnostics: BMS data interpretation, CAN bus analysis, and firmware update procedures.", "Customer Service: EV-specific consultation skills — explaining range, charging, and battery health to owners."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A Nigerian dealership trained 12 technicians through a structured 6-week program combining classroom theory and hands-on practice. Within 3 months, their EV service bay was handling 40+ vehicles per month with zero safety incidents." },
      { type: "img", src: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1000&q=80", alt: "Technician training" },
      { type: "glass-box", text: "Service Integration Point: We offer structured training modules, certification programs, and ongoing remote support for service teams across all partner dealerships." },
    ],
  },
  {
    id: "parts-inventory",
    num: "3",
    title: "Parts Inventory Management",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Effective parts inventory management is critical for minimizing vehicle downtime and maximizing service revenue. EV spare parts differ significantly from ICE — the high-value items are battery modules, inverters, and chargers rather than alternators, starters, and exhaust systems." },
      { type: "ul", items: ["Critical Stock: Maintain minimum stock levels for high-turnover items: cabin filters, brake pads (regen-compatible), wiper blades, 12V auxiliary batteries, and charging cables.", "High-Value Items: Battery modules, drive motors, and onboard chargers — stock based on local fleet composition and lead times.", "Inventory System: Implement barcode tracking with automated reorder points and supplier lead time monitoring.", "Supplier Relationships: Establish direct accounts with Chinese OEM parts departments and authorized distributors."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A Tanzanian service centre reduced average repair time from 5 days to 36 hours by implementing a structured inventory system with min/max levels and weekly supplier orders." },
      { type: "img", src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80", alt: "Parts inventory" },
      { type: "glass-box", text: "Service Integration Point: We provide inventory management templates, recommended stock lists by vehicle model, and direct supplier introductions for genuine Chinese EV parts." },
    ],
  },
  {
    id: "warranty-claims",
    num: "4",
    title: "Warranty Claim Processes",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Warranty claim handling is a key differentiator for EV dealerships. Chinese EV manufacturers typically offer 5-8 year battery warranties and 3-5 year vehicle warranties, but the claims process requires meticulous documentation and understanding of OEM-specific procedures." },
      { type: "ul", items: ["Documentation: Maintain detailed service records including diagnostic logs, photos of faulty components, and replacement part serial numbers.", "Claim Categories: Understand the difference between manufacturing defects, wear-and-tear exclusions, and damage claims.", "Submission Timelines: Most OEMs require claim submission within 7-14 days of diagnosis — missed deadlines mean absorbed costs.", "Approval Workflow: Establish a clear escalation path from technician diagnosis → service manager review → OEM claim submission."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A dealership in Ghana improved their warranty claim approval rate from 45% to 92% within 6 months by implementing a standardized documentation checklist and training all technicians on OEM-specific photography requirements." },
      { type: "img", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80", alt: "Warranty documentation" },
      { type: "glass-box", text: "Service Integration Point: We provide warranty claim templates, OEM-specific documentation guides, and direct liaison support with Chinese manufacturer warranty departments." },
    ],
  },
];

export default function Course6Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.35) grayscale(20%)" }}
            alt="Service Centre Setup"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, var(--color-bg) 12%, rgba(0,0,0,.55) 35%, transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5) 20%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-16 pt-40">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/academy" className="hover:text-gray-400 transition">Academy</Link>
            <span>/</span>
            <span className="text-gray-500">Course 6</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/10 text-white uppercase tracking-wider">4 Modules</span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(239,68,68,.1)", color: "#F87171", borderColor: "rgba(239,68,68,.3)" }}>Advanced</span>
            </div>
            <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-4" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              After-Sales Service<br /><span className="text-theme">Centre Setup Guide</span>
            </h1>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed max-w-xl">
              Step-by-step blueprint: equipment procurement, technician training, parts inventory management, and warranty claim processes.
            </p>
          </div>
        </div>
      </section>

      {/* Objective */}
      <section className="py-16 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="glass rounded-[2.5rem] p-10 md:p-14 max-w-4xl mx-auto" style={{ borderColor: "rgba(239,68,68,.2)" }}>
            <div className="label mb-4" style={{ color: "#F87171" }}>Objective</div>
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Provide a step-by-step blueprint for establishing EV service centers, including equipment, technician training, parts management, and warranty handling.
            </p>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-12">
              <div className="label label-gold mb-4">Curriculum</div>
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">
                Course <span className="text-theme">Modules</span>
              </h2>
            </div>

            <div className="space-y-16">
              {sections.map((section) => (
                <div key={section.id} id={section.id}>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Module {section.num}</span>
                    <span className="w-8 h-px bg-white/10" />
                  </div>
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-8" style={{ fontSize: "clamp(1.5rem,3.5vw,2.5rem)" }}>
                    {section.title}
                  </h3>

                  {section.content.map((item, i) => {
                    if (item.type === "h3") {
                      return <h4 key={i} className="text-xl font-black text-white mb-4 mt-8">{item.text}</h4>;
                    }
                    if (item.type === "h4") {
                      return <h5 key={i} className="text-base font-black text-theme uppercase tracking-wider mb-3 mt-6">{item.text}</h5>;
                    }
                    if (item.type === "p") {
                      return <p key={i} className="text-gray-400 text-base font-light leading-relaxed mb-5">{item.text}</p>;
                    }
                    if (item.type === "ul") {
                      return (
                        <ul key={i} className="space-y-2 mb-6">
                          {item.items?.map((li, j) => (
                            <li key={j} className="flex items-start gap-3 text-gray-400 text-sm font-light">
                              <span className="text-red-400 mt-1.5 flex-shrink-0" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#F87171" }} />
                              {li}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    if (item.type === "img") {
                      return (
                        <div key={i} className="rounded-[1.5rem] overflow-hidden mb-8">
                          <img src={item.src} alt={item.alt} className="w-full h-auto object-cover" style={{ maxHeight: "400px" }} />
                        </div>
                      );
                    }
                    if (item.type === "glass-box") {
                      return (
                        <div key={i} className="glass rounded-[1.5rem] p-6 md:p-8 mb-8" style={{ borderColor: "rgba(239,68,68,.15)" }}>
                          <div className="flex items-start gap-3">
                            <span className="text-red-400 text-lg flex-shrink-0 mt-0.5">✦</span>
                            <p className="text-gray-300 text-sm font-light leading-relaxed">{item.text}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}

                  <div className="border-t border-white/5 pt-6 mt-8 flex justify-end">
                    <Link href={`#${section.id}`} className="text-[10px] font-black tracking-widest uppercase text-theme hover:text-white transition">
                      Back to Top ↑
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="py-16 bg-a">
        <div className="container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="label justify-center mb-4">Continue Learning</div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-6">
              You&apos;ve Completed All <span className="text-theme">Courses</span>!
            </h2>
            <p className="text-gray-500 text-base font-light italic mb-8">
              Review any course or contact us for advanced training programs.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/academy" className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic">
                ← Back to Academy
              </Link>
              <a
                href="https://wa.me/qr/F7M2RQADCE3KN1"
                className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg"
              >
                Ask a Question
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
