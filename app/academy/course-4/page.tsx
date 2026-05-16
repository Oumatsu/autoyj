import Link from "next/link";

const sections = [
  {
    id: "hv-safety",
    num: "1",
    title: "High-Voltage Safety",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "High-voltage (HV) systems in EVs operate at 400V to 800V — lethal levels that demand rigorous safety protocols. Every service centre handling Chinese EVs must implement standardized HV safety procedures before any technician touches a vehicle." },
      { type: "ul", items: ["Follow strict PPE protocols: insulated gloves, face shield, HV-rated footwear.", "Use only insulated tools rated for the vehicle's voltage level.", "Implement lockout/tagout (LOTO) procedures before any battery service work.", "Maintain a minimum two-person rule — never work on HV systems alone."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "Technicians trained in HV safety prevented accidents during battery replacements in Nigerian service centers. Proper LOTO procedures and insulated tooling eliminated electrical incidents entirely after implementation." },
      { type: "img", src: "https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=1000&q=80", alt: "High-voltage safety equipment" },
      { type: "glass-box", text: "Service Integration Point: We provide detailed safety manuals, PPE recommendations, and staff training modules for all dealer service centers." },
    ],
  },
  {
    id: "thermal-management",
    num: "2",
    title: "Thermal Management",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Battery temperature directly affects performance, lifespan, and safety. In African climates where ambient temperatures regularly exceed 35°C, proper thermal management is critical for preventing accelerated degradation and thermal runaway events." },
      { type: "ul", items: ["Proper battery cooling extends lifespan and prevents thermal runaway.", "Active liquid cooling systems maintain optimal operating range of 20-35°C.", "Passive ventilation methods provide backup thermal regulation.", "Regular thermal inspection should be part of every scheduled service."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "Service centers in hot climates (e.g., Sudan) installed temperature monitoring systems to prevent overheating, reducing battery-related service calls by 40% within six months." },
      { type: "img", src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80", alt: "Battery thermal management" },
      { type: "glass-box", text: "Service Integration Point: Thermal management guides, system setup recommendations, and monitoring tools are available to all authorized service centers." },
    ],
  },
  {
    id: "diagnostic-tools",
    num: "3",
    title: "Diagnostic Tools",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Modern EV diagnostics go far beyond traditional OBD-II scanning. Understanding battery management system (BMS) data, cell voltage balancing, and insulation resistance testing is essential for any service centre handling Chinese EV imports." },
      { type: "ul", items: ["Use battery management software and OBD-II tools for fault detection and performance monitoring.", "Monitor cell voltage variance — imbalance beyond 50mV indicates pending failure.", "Track insulation resistance: values below 500Ω/V indicate compromised HV isolation.", "Log thermal data over time to identify gradual degradation patterns."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "Early detection of cell imbalance in EVs prevented costly full-battery replacements in fleet operations. A Nairobi fleet operator saved $12,000 by replacing individual cells rather than the entire pack after routine BMS diagnostics flagged the issue." },
      { type: "img", src: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1000&q=80", alt: "EV diagnostic tools" },
      { type: "glass-box", text: "Service Integration Point: We provide diagnostic software, reporting templates, and remote support to help your service team maintain peak battery performance." },
    ],
  },
];

export default function Course4Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1581092335397-9583eb92d232?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.35) grayscale(20%)" }}
            alt="Battery Maintenance"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, var(--color-bg) 12%, rgba(0,0,0,.55) 35%, transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5) 20%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-16 pt-40">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/academy" className="hover:text-gray-400 transition">Academy</Link>
            <span>/</span>
            <span className="text-gray-500">Course 4</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/10 text-white uppercase tracking-wider">3 Modules</span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 uppercase tracking-wider">Advanced</span>
            </div>
            <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-4" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              Battery Maintenance<br /><span className="text-theme">Safety Protocols</span>
            </h1>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed max-w-xl">
              High-voltage safety, thermal management, and diagnostic tools. Essential for any service centre handling Chinese EVs.
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
              Ensure safe handling, maintenance, and diagnostics of high-voltage EV batteries in service centers across Africa.
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
                    if (item.type === "p") {
                      return <p key={i} className="text-gray-400 text-base font-light leading-relaxed mb-5">{item.text}</p>;
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
              Ready for <span className="text-theme">Module 05</span>?
            </h2>
            <p className="text-gray-500 text-base font-light italic mb-8">
              Proceed to the next course in the Academy curriculum.
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
