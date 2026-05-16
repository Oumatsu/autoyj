import Link from "next/link";

const sections = [
  {
    id: "ice-vs-ev",
    num: "1",
    title: "ICE vs EV Cost Comparison",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Building a convincing total cost of ownership (TCO) comparison between ICE and EV is the foundation of every corporate fleet proposal. African fleet operators need to see real numbers — not global averages — that reflect their local fuel prices, electricity tariffs, and maintenance costs." },
      { type: "p", text: "A comprehensive TCO analysis includes purchase price, fuel/energy cost, maintenance, insurance, and residual value. In many African markets, the fuel saving alone can offset the higher upfront EV price within 18–24 months." },
      { type: "h4", text: "Key Cost Factors" },
      { type: "ul", items: ["Purchase Price: Include import duties, taxes, and shipping.", "Fuel vs Energy: Compare petrol/diesel cost per km vs electricity cost per km at local tariffs.", "Maintenance: EVs have 40-60% fewer moving parts than ICE vehicles.", "Insurance: Premiums may differ — factor in local insurance class ratings.", "Residual Value: Estimate based on battery degradation curves and local market demand."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A logistics company in Kenya saved 25% on annual operating costs by switching to EVs for their last-mile delivery fleet. The savings came primarily from fuel cost elimination and reduced brake/powertrain maintenance." },
      { type: "img", src: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1000&q=80", alt: "Cost comparison chart" },
      { type: "glass-box", text: "Service Integration Point: Ready-to-use TCO calculator, preloaded with regional data, and customizable reporting templates for your proposals." },
    ],
  },
  {
    id: "roi-proposal",
    num: "2",
    title: "ROI Proposal Building",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Corporate decision-makers don't buy vehicles — they buy financial outcomes. Your ROI proposal must translate technical specifications into clear business metrics: payback period, annual savings, and emissions reduction targets." },
      { type: "ul", items: ["Present cost savings, emissions reduction, and incentives clearly to decision-makers.", "Show 3-year and 5-year total cost projections with clear break-even points.", "Include sensitivity analysis for fuel price volatility and electricity tariff changes.", "Highlight non-financial benefits: brand positioning, regulatory compliance, and driver satisfaction."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "Corporate clients are more likely to adopt EV fleets when proposals show precise ROI and payback periods. A Nairobi-based courier company signed a 50-vehicle EV order after receiving a TCO analysis showing 28% cost reduction and 18-month payback." },
      { type: "img", src: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1000&q=80", alt: "ROI proposal presentation" },
      { type: "glass-box", text: "Service Integration Point: Proposal templates and visual dashboards that integrate TCO calculations — ready to customize for each corporate client." },
    ],
  },
];

export default function Course5Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.35) grayscale(20%)" }}
            alt="Fleet TCO"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, var(--color-bg) 12%, rgba(0,0,0,.55) 35%, transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5) 20%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-16 pt-40">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/academy" className="hover:text-gray-400 transition">Academy</Link>
            <span>/</span>
            <span className="text-gray-500">Course 5</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/10 text-white uppercase tracking-wider">2 Modules</span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full border uppercase tracking-wider" style={{ background: "rgba(197,160,89,.1)", color: "var(--color-gold)", borderColor: "rgba(197,160,89,.3)" }}>Intermediate</span>
            </div>
            <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-4" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              Fleet TCO Calculator<br /><span className="text-theme">Masterclass</span>
            </h1>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed max-w-xl">
              Build compelling ROI proposals for corporate clients. Compare ICE vs EV total cost of ownership with real African fuel and electricity data.
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
              Build compelling ROI proposals for corporate clients, comparing ICE vs EV total cost of ownership using real African fuel and electricity data.
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
              Ready for <span className="text-theme">Module 06</span>?
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
