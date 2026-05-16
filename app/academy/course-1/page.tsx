import Link from "next/link";

const sections = [
  {
    id: "battery-chemistry",
    num: "1",
    title: "Battery Chemistry: LFP vs NMC",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "The battery is the single most expensive and most important component in any electric vehicle. Understanding the two dominant chemistries — LFP and NMC — is essential for every sales professional." },
      { type: "h4", text: "LFP (Lithium Iron Phosphate)" },
      { type: "ul", items: ["Pros: High safety, long cycle life, lower cost.", "Cons: Lower energy density, slightly heavier."] },
      { type: "h4", text: "NMC (Nickel Manganese Cobalt)" },
      { type: "ul", items: ["Pros: High energy density, suitable for long-range/high-performance vehicles.", "Cons: Higher cost, thermal stability challenges."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "Urban delivery EVs in African cities often prioritize LFP for durability and safety. Luxury EV SUVs targeting long-range trips often use NMC to maximize range." },
      { type: "img", src: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80", alt: "Battery technology comparison" },
      { type: "glass-box", text: "Service Integration Point: We provide detailed battery specifications, comparison charts, and consultation services to help sales teams present accurate technical information to clients." },
    ],
  },
  {
    id: "motor-types",
    num: "2",
    title: "Motor Types",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Electric vehicles use different motor types depending on their performance goals, cost targets, and operating environment. Knowing the difference helps you match the right vehicle to the right customer." },
      { type: "h4", text: "Permanent Magnet Synchronous Motor (PMSM)" },
      { type: "ul", items: ["High efficiency, compact design, low maintenance.", "Ideal for passenger EVs where efficiency and performance are valued."] },
      { type: "h4", text: "Induction Motor (IM)" },
      { type: "ul", items: ["Robust, simpler design, slightly lower efficiency.", "Suitable for heavy-duty fleet EVs in environments with limited maintenance infrastructure."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "PMSM is recommended for EVs sold in regions where efficiency and performance are valued over initial cost. IM is suitable for heavy-duty fleet EVs in environments with limited maintenance infrastructure." },
      { type: "img", src: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1000&q=80", alt: "Electric motor types" },
      { type: "glass-box", text: "Service Integration Point: Technical sheets and efficiency comparison tables for motor types are available to support client discussions." },
    ],
  },
  {
    id: "charging-standards",
    num: "3",
    title: "Charging Standards",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Charging infrastructure is a top concern for EV buyers. Understanding the different standards and their regional compatibility is critical for addressing customer questions." },
      { type: "h4", text: "AC Charging (Slow/Medium)" },
      { type: "ul", items: ["Suitable for overnight or workplace charging.", "Uses standard Type 2 or GB/T connectors depending on the market."] },
      { type: "h4", text: "DC Fast Charging" },
      { type: "ul", items: ["Reduces charging time to 30-60 minutes for long-distance trips.", "Essential for fleet operators with high daily mileage."] },
      { type: "h4", text: "CHAdeMO vs CCS" },
      { type: "ul", items: ["Standardized connectors with regional compatibility variations.", "Chinese EVs typically use GB/T standard — adapters are available for African markets."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "In African urban areas, AC charging may suffice for daily commuting, while DC fast charging is recommended for intercity travel and fleet operations." },
      { type: "img", src: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1000&q=80", alt: "EV charging station" },
      { type: "glass-box", text: "Service Integration Point: Localized charging network maps and customer-ready communication templates are provided to support sales explanations." },
    ],
  },
  {
    id: "range-anxiety",
    num: "4",
    title: "Explaining Range Anxiety",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Range anxiety is the #1 objection first-time EV buyers raise. Your ability to address this concern confidently can make or break the sale." },
      { type: "p", text: "Range anxiety is the concern that an EV may run out of battery before reaching a charging station. Mitigation strategies include battery management systems, trip planning applications, and access to fast-charging networks." },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A 400 km-range EV easily covers daily commutes of 50-100 km, reducing range anxiety. In most African cities, the average daily commute is under 80 km — meaning even a 300 km EV provides a 3-4 day buffer between charges." },
      { type: "img", src: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80", alt: "EV dashboard showing range" },
      { type: "glass-box", text: "Service Integration Point: Sales scripts, infographics, and demo materials are provided to effectively communicate solutions to customers." },
    ],
  },
];

export default function Course1Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.35) grayscale(20%)" }}
            alt="EV Fundamentals"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, var(--color-bg) 12%, rgba(0,0,0,.55) 35%, transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5) 20%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-16 pt-40">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/academy" className="hover:text-gray-400 transition">Academy</Link>
            <span>/</span>
            <span className="text-gray-500">Course 1</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/10 text-white uppercase tracking-wider">4 Modules</span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-accent/10 text-accent border border-accent/30 uppercase tracking-wider">Beginner</span>
            </div>
            <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-4" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              EV Fundamentals<br /><span className="text-theme">for Sales Teams</span>
            </h1>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed max-w-xl">
              Master the core technology: LFP vs NMC batteries, motor types, charging standards, and how to explain range anxiety to customers.
            </p>
          </div>
        </div>
      </section>

      {/* Objective */}
      <section className="py-16 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="glass rounded-[2.5rem] p-10 md:p-14 max-w-4xl mx-auto border-accent/20">
            <div className="label mb-4 text-accent">Objective</div>
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Master the core technologies of electric vehicles (EVs), including battery chemistry (LFP vs NMC), motor types, charging standards, and how to explain range anxiety to customers.
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
                              <span className="text-accent mt-1.5 flex-shrink-0" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-green)" }} />
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
                        <div key={i} className="glass rounded-[1.5rem] p-6 md:p-8 mb-8 border-accent/15">
                          <div className="flex items-start gap-3">
                            <span className="text-accent text-lg flex-shrink-0 mt-0.5">✦</span>
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
              Ready for <span className="text-theme">Module 02</span>?
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
