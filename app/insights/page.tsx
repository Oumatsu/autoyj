import Link from "next/link";

export default function InsightsPage() {
  return (
    <>
      {/* Page Header */}
      <header className="pt-32 pb-12 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-theme" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              Market <span className="text-accent">Intelligence</span>
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
            The <span className="text-theme">Insights</span>{" "}
            <span className="text-accent">Desk</span>.
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">
            Real-time policy updates, tariff analyses, and export logistics
            tracking for the African EV sector.
          </p>
        </div>
      </header>

      {/* Main Editorial Section */}
      <main className="py-12 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          {/* Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
            {/* Lead Story */}
            <Link
              href="/insights/article"
              className="lg:col-span-8 hero-card relative rounded-2xl overflow-hidden flex flex-col justify-end p-8 min-h-[500px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
                className="hero-card-img absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105"
                style={{ filter: "brightness(0.6)" }}
                alt="Policy Update"
              />
              <div className="hero-card-overlay absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
              <div className="hero-card-content relative z-20">
                <span className="tag tag-policy mb-4 inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-gold/10 text-gold border border-gold/30">
                  Breaking Policy
                </span>
                <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight mb-3">
                  Ethiopia Announces Zero-Tariff Extension on EV Imports Through
                  2026
                </h2>
                <p className="text-gray-300 font-light text-sm mb-4 max-w-xl">
                  The Ministry of Finance confirms continued exemptions for
                  fully electric vehicles, triggering a massive surge in
                  commercial fleet orders from Chinese OEMs.
                </p>
                <div className="meta-text text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-3">
                  <span>By Evexport Desk</span> <span>•</span>{" "}
                  <span>2 Hours Ago</span>
                </div>
              </div>
            </Link>

            {/* Right Column */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              {[
                {
                  tag: "Market Report",
                  tagCls: "tag-market bg-white/5 text-white",
                  title:
                    "Q3 Data: BYD Surpasses Toyota in Nairobi Ride-Hailing",
                  date: "Oct 10, 2026",
                  img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=600&q=80",
                },
                {
                  tag: "Logistics",
                  tagCls: "tag-logistics bg-accent/10 text-accent border border-accent/30",
                  title:
                    "Shanghai Port Wait Times Decrease for RoRo Vessels",
                  date: "Oct 08, 2026",
                  img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
                },
              ].map((item, i) => (
                <Link
                  key={i}
                  href="/insights/article"
                  className="hero-card relative rounded-2xl overflow-hidden flex flex-col justify-end p-6 min-h-[235px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={item.img}
                    className="hero-card-img absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700"
                    style={{ filter: "brightness(0.6)" }}
                    alt=""
                  />
                  <div className="hero-card-overlay absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                  <div className="hero-card-content relative z-20">
                    <span className={`tag mb-3 inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.tagCls}`}>
                      {item.tag}
                    </span>
                    <h3 className="text-xl font-black italic text-white leading-tight mb-2">
                      {item.title}
                    </h3>
                    <div className="meta-text text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {item.date}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* Chronological Feed */}
            <div className="lg:col-span-8">
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                <div className="text-xs font-black uppercase tracking-widest text-white">
                  Latest Intelligence
                </div>
                <div className="h-px bg-white/10 flex-grow" />
              </div>

              <div className="space-y-2">
                {[
                  {
                    tag: "Tariff Update",
                    tagCls: "tag-policy bg-gold/10 text-gold border border-gold/30",
                    title:
                      "Nigeria Considers Reduced Import Duties for CKD (Completely Knocked Down) EVs",
                    desc: "To stimulate local assembly, the Nigerian government is drafting a bill that drastically lowers tariffs for CKD kits sourced from China.",
                    date: "Oct 05, 2026",
                    read: "4 Min Read",
                    img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    tag: "Market Data",
                    tagCls: "tag-market bg-white/5 text-white",
                    title:
                      "Kenya Power Announces Special EV Charging Tariff for Commercial Fleets",
                    desc: "A new off-peak industrial tariff could reduce fleet charging costs by an additional 40%, making the TCO case for EVs even stronger.",
                    date: "Oct 03, 2026",
                    read: "3 Min Read",
                    img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80",
                  },
                  {
                    tag: "Logistics",
                    tagCls: "tag-logistics bg-accent/10 text-accent border border-accent/30",
                    title:
                      "COSCO Launches Dedicated China-East Africa EV RoRo Service",
                    desc: "A new monthly RoRo route from Ningbo to Mombasa promises to cut transit times by 8 days for East African EV importers.",
                    date: "Sep 28, 2026",
                    read: "5 Min Read",
                    img: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=400&q=80",
                  },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href="/insights/article"
                    className="news-item flex flex-col md:flex-row gap-8 py-8 border-b border-white/5 hover:bg-white/[0.02] hover:px-4 hover:rounded-2xl hover:border-b-0 transition-all duration-300"
                  >
                    <div className="news-img-wrap hidden md:block w-[200px] h-[140px] rounded-xl overflow-hidden flex-shrink-0">
                      <img
                        src={item.img}
                        className="w-full h-full object-cover transition-transform duration-500"
                        style={{ filter: "grayscale(20%)" }}
                        alt=""
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className={`tag mb-3 inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${item.tagCls}`}>
                        {item.tag}
                      </span>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">
                        {item.desc}
                      </p>
                      <div className="meta-text text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                        {item.date} <span>•</span> {item.read}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="sticky top-28">
                <div className="glass rounded-[2rem] p-8 mb-8">
                  <div className="text-[10px] font-black uppercase tracking-widest text-theme mb-6">
                    Subscribe to Intelligence
                  </div>
                  <p className="text-gray-500 text-xs font-light mb-6">
                    Weekly briefings on African EV policy, tariffs, and market
                    data. Delivered to your WhatsApp.
                  </p>
                  <a
                    href="https://wa.me/your-number"
                    className="btn-primary w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase italic flex items-center justify-center gap-2"
                  >
                    Join WhatsApp Channel
                  </a>
                </div>

                <div className="glass rounded-[2rem] p-8">
                  <div className="text-[10px] font-black uppercase tracking-widest text-accent mb-6">
                    Trending Topics
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Ethiopia Tariff",
                      "LFP Battery",
                      "RoRo Shipping",
                      "Kenya EV Policy",
                      "BYD Africa",
                      "CKD Assembly",
                      "Carbon Credits",
                      "Mombasa Port",
                    ].map((topic, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-white/5 text-gray-400 border border-white/5 cursor-pointer hover:border-gold hover:text-gold transition-all"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
