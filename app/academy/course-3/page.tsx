import Link from "next/link";

const sections = [
  {
    id: "online-showroom",
    num: "1",
    title: "Online Showroom Setup",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Your online showroom is the first impression most customers will have of your dealership. In African markets where mobile internet penetration is high but physical dealerships may be concentrated in capital cities, a well-crafted digital presence is your most cost-effective customer acquisition channel." },
      { type: "ul", items: ["Create a localized website and product catalog tailored to African markets.", "Showcase key vehicle specifications, features, and promotions with high-quality imagery.", "Integrate real-time inventory management so customers see accurate stock levels."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A South African dealership increased leads by 35% after launching a mobile-friendly catalog with real-time inventory updates, WhatsApp click-to-chat integration, and customer testimonials." },
      { type: "img", src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80", alt: "Digital showroom" },
      { type: "glass-box", text: "Service Integration Point: We provide internal EV management systems to track inventory, leads, and customer interactions — fully integrated with your online showroom." },
    ],
  },
  {
    id: "facebook-advertising",
    num: "2",
    title: "Facebook Advertising",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "Facebook remains the dominant social platform across most African markets, making it the ideal channel for EV dealership advertising. With precise demographic and interest-based targeting, you can reach potential buyers at a fraction of traditional advertising costs." },
      { type: "ul", items: ["Use pre-designed ad templates targeting local demographics and interests.", "Optimize campaigns for impressions, clicks, and conversions based on your sales funnel stage.", "Retarget website visitors with dynamic vehicle inventory ads."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "Targeting Nairobi residents aged 25–45 with mid-range EV ads increased showroom visits by 20% within the first month of campaign launch." },
      { type: "img", src: "https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?auto=format&fit=crop&w=1000&q=80", alt: "Facebook advertising" },
      { type: "glass-box", text: "Service Integration Point: Ready-to-use ad templates, creative assets, and campaign setup guidance are provided to all dealer partners." },
    ],
  },
  {
    id: "whatsapp-automation",
    num: "3",
    title: "WhatsApp Business Automation",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "WhatsApp is the de facto communication platform across Africa. Automating your WhatsApp Business account transforms it from a simple messaging tool into a 24/7 sales engine that nurtures leads, shares inventory, and books test drives without additional staff." },
      { type: "ul", items: ["Automate customer engagement with welcome messages, vehicle catalog sharing, and booking reminders.", "Set up quick replies for frequently asked questions about range, pricing, and delivery.", "Use broadcast lists to notify prospects about new arrivals and promotions."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "A dealership in Lagos reduced response time to inquiries from 24 hours to under 30 minutes after implementing WhatsApp Business automation with catalog integration." },
      { type: "img", src: "https://images.unsplash.com/photo-1611605698335-8b1569810432?auto=format&fit=crop&w=1000&q=80", alt: "WhatsApp Business" },
      { type: "glass-box", text: "Service Integration Point: Automation setup and training for WhatsApp Business integrated with your management system are included in our dealer enablement package." },
    ],
  },
  {
    id: "local-seo",
    num: "4",
    title: "Local SEO for African Markets",
    content: [
      { type: "h3", text: "Overview" },
      { type: "p", text: "When African buyers search for EVs, they turn to Google Maps and local search. Optimizing for these platforms ensures your dealership appears when potential customers are actively looking, making local SEO one of the highest-ROI digital investments you can make." },
      { type: "ul", items: ["Optimize Google Maps and local search listings to improve visibility.", "Include relevant keywords, local contact information, and operational hours.", "Collect and respond to customer reviews to build trust and improve rankings."] },
      { type: "h3", text: "Case Example" },
      { type: "p", text: "SEO improvements helped a Kenyan dealer rank top for 'EV for sale Nairobi', increasing web leads by 50% within three months of implementation." },
      { type: "img", src: "https://images.unsplash.com/photo-1571721795195-a2ca2d3370a9?auto=format&fit=crop&w=1000&q=80", alt: "Local SEO" },
      { type: "glass-box", text: "Service Integration Point: SEO audit reports, content templates, and guidance for local market optimization are provided to help you dominate your local search results." },
    ],
  },
];

export default function Course3Page() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.35) grayscale(20%)" }}
            alt="Digital Marketing"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--color-bg) 0%, var(--color-bg) 12%, rgba(0,0,0,.55) 35%, transparent 50%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(0,0,0,.5) 20%, transparent 60%)" }} />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 pb-16 pt-40">
          <nav className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase mb-8 text-gray-600">
            <Link href="/academy" className="hover:text-gray-400 transition">Academy</Link>
            <span>/</span>
            <span className="text-gray-500">Course 3</span>
          </nav>
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/10 text-white uppercase tracking-wider">4 Modules</span>
              <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-white/5 text-white border border-white/10 uppercase tracking-wider">All Levels</span>
            </div>
            <h1 className="font-black italic uppercase tracking-tighter text-white leading-none mb-4" style={{ fontSize: "clamp(2.5rem,6vw,5rem)" }}>
              Dealership Digital<br /><span className="text-theme">Marketing Playbook</span>
            </h1>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed max-w-xl">
              Launch your EV showroom online: Facebook ad templates, WhatsApp Business automation, and local SEO for African markets.
            </p>
          </div>
        </div>
      </section>

      {/* Objective */}
      <section className="py-16 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="glass rounded-[2.5rem] p-10 md:p-14 max-w-4xl mx-auto" style={{ borderColor: "rgba(255,255,255,.1)" }}>
            <div className="label mb-4" style={{ color: "var(--color-gold)" }}>Objective</div>
            <p className="text-gray-300 text-lg font-light leading-relaxed">
              Launch and manage a successful EV showroom online, leveraging Facebook ads, WhatsApp Business, local SEO, and internal management systems.
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
                              <span className="text-theme mt-1.5 flex-shrink-0" style={{ width: "5px", height: "5px", borderRadius: "50%", background: "var(--color-gold)" }} />
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
            <div className="label justify-center mb-4" style={{ color: "var(--color-gold)" }}>Continue Learning</div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight mb-6">
              Ready for <span className="text-theme">Module 04</span>?
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
