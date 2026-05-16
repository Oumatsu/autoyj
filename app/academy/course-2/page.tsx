import Link from "next/link";

const sections = [
  {
    id: "coo",
    num: "1",
    title: "Certificate of Origin (COO)",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "The Certificate of Origin (COO) is a crucial international trade document that certifies the country of manufacture of your vehicles. In China-to-Africa EV exports, it is one of the most frequently requested documents by customs authorities across the continent." },
      { type: "ul", items: ["COO certifies that the vehicle is manufactured in China and is essential for customs clearance in most African countries.", "Includes information such as manufacturer details, VIN, production date, and country of origin."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "For an EV shipment to Kenya, a complete COO is required to claim reduced import duties under the African Continental Free Trade Area (AfCFTA) preferences." },
      { type: "img", src: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1000&q=80", alt: "Export documentation" },
      { type: "glass-box", text: "Service Integration Point: We provide ready-to-use COO templates and verification services to ensure accuracy and compliance with destination country requirements." },
    ],
  },
  {
    id: "battery-certifications",
    num: "2",
    title: "Battery Safety Certifications",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Lithium battery safety certifications are non-negotiable for EV exports. Every shipment — whether by sea or air — must comply with international standards that govern the safe transport and operation of high-voltage battery systems." },
      { type: "h4", text: "Key International Standards" },
      { type: "ul", items: ["UN38.3 — Required for all lithium battery shipments (air and sea). Simulates altitude, temperature, vibration, shock, and short-circuit conditions.", "IEC62133 — Safety standard for portable sealed alkaline and lithium cells.", "MSDS (Material Safety Data Sheet) — Documents handling, storage, and emergency response procedures."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "EVs exported to Egypt must include battery certification documentation to pass port inspection. Missing or incomplete certifications can result in containers being held at port for weeks." },
      { type: "img", src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80", alt: "Battery safety certification" },
      { type: "glass-box", text: "Service Integration Point: We provide certified battery test reports and consultation on local safety requirements for all major African import markets." },
    ],
  },
  {
    id: "customs-clearance",
    num: "3",
    title: "Customs Clearance for African Ports",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Each African port has unique import regulations, documentation requirements, and inspection procedures. Successful clearance depends on understanding these local nuances and preparing the correct paperwork in advance." },
      { type: "h4", text: "Typical Documentation Requirements" },
      { type: "ul", items: ["Certificate of Origin (COO)", "Commercial Invoice", "Packing List", "Battery Safety Certificates (UN38.3, MSDS)", "Import License (varies by country)", "Bill of Lading (B/L)"] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "In Lagos, Nigeria, incomplete battery certification can delay clearance by 2–3 weeks, resulting in significant demurrage charges. Proper document preparation upfront eliminates these costly delays." },
      { type: "img", src: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80", alt: "Port customs clearance" },
      { type: "glass-box", text: "Service Integration Point: We offer step-by-step clearance support and document preparation services for all major African ports including Mombasa, Dar es Salaam, Lagos, Tema, and Durban." },
    ],
  },
];

export default function Course2Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.35) grayscale(20%)" }}
            alt="Export Compliance"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, var(--color-bg) 12%, rgba(0,0,0,.55) 35%, transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5) 20%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-16 pt-40">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/academy" className="hover:text-gray-400 transition">Academy</Link>
            <span>/</span>
            <span className="text-gray-500">Course 2</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/10 text-white uppercase tracking-wider">3 Modules</span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider" style={{ background: "rgba(197,160,89,.1)", color: "var(--color-gold)", borderColor: "rgba(197,160,89,.3)" }}>Intermediate</span>
            </div>
            <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-4" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              China EV Export<br /><span className="text-theme">Compliance & Documentation</span>
            </h1>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed max-w-xl">
              Navigate the paperwork: Certificate of Origin, battery safety certifications, and customs clearance for African ports.
            </p>
          </div>
        </div>
      </section>

      {/* Objective */}
      <section className="py-16 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="glass rounded-[2.5rem] p-10 md:p-14 max-w-4xl mx-auto" style={{ borderColor: "rgba(197,160,89,.2)" }}>
            <div className="label label-gold mb-4">Objective</div>
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Understand the key export compliance requirements for Chinese EVs, including Certificate of Origin, battery safety certifications, and customs clearance processes for African ports.
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
                              <span className="text-theme mt-1.5 flex-shrink-0" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-gold)" }} />
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
                        <div key={i} className="glass rounded-[1.5rem] p-6 md:p-8 mb-8" style={{ borderColor: "rgba(197,160,89,.15)" }}>
                          <div className="flex items-start gap-3">
                            <span className="text-theme text-lg flex-shrink-0 mt-0.5">✦</span>
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
              Ready for <span className="text-theme">Module 03</span>?
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
