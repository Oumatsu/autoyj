import Link from "next/link";

export default function EthiopiaMarketPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.75)" }}
            alt="Addis Ababa"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-bg) 0%, transparent 40%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 pt-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="pulse-dot" />
              <span className="text-accent text-[10px] font-black uppercase tracking-[.3em]">
                Priority Market
              </span>
            </div>
            <h1
              className="sh mb-8"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              Ethiopia.
              <br />
              <span className="text-theme">Africa&apos;s</span> Next EV
              <br />
              <span className="text-accent">Powerhouse</span>.
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 pl-8 leading-relaxed max-w-xl" style={{ borderColor: "rgba(197,160,89,.3)" }}>
              With zero-tariff EV imports, the world&apos;s cheapest renewable
              electricity, and a government mandate to phase out ICE vehicles,
              Ethiopia is the most compelling EV market on the continent.
            </p>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-24 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="label label-gold mb-6">Market Overview</div>
              <h2 className="sh mb-8">
                Why <span className="text-theme">Ethiopia</span>?
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                Ethiopia has emerged as the most aggressive adopter of EV policy
                in Africa. The government&apos;s 10-year plan targets 150,000+
                electric vehicles on the road by 2030, backed by the continent&apos;s
                most favorable import tariff structure.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: "0%", label: "Import Tariff on Fully Electric Vehicles" },
                  { value: "$0.02", label: "Industrial Electricity per kWh" },
                  { value: "150K+", label: "Government EV Target by 2030" },
                  { value: "120M+", label: "Population & Growing Middle Class" },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-6 text-center">
                    <div className="text-3xl font-black italic text-theme mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 leading-relaxed">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-[3rem] p-10 md:p-14">
              <div className="text-[10px] font-black tracking-widest uppercase text-accent mb-8">
                Key Policy Drivers
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: "Zero Import Tariff",
                    desc: "Fully electric vehicles pay 0% import duty, compared to up to 200% for ICE vehicles. This single policy makes Chinese EVs cheaper in Addis Ababa than in Nairobi.",
                  },
                  {
                    title: "Cheapest Electricity in Africa",
                    desc: "The Grand Ethiopian Renaissance Dam (GERD) provides industrial electricity at ~$0.02/kWh — making per-km EV running costs virtually negligible.",
                  },
                  {
                    title: "ICE Phase-Out Mandate",
                    desc: "The Ministry of Transport has announced a phased ban on ICE vehicle imports, creating urgent demand for EV alternatives across all segments.",
                  },
                  {
                    title: "Chinese OEM Preference",
                    desc: "Strong bilateral trade relations and existing Chinese infrastructure investment create natural brand affinity for BYD, Geely, and GAC products.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-theme/10 border border-theme/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-theme">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Vehicles */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="label justify-center mb-4">Curated for Ethiopia</div>
              <h2 className="sh">
                Top <span className="text-theme">Performers</span> in Market.
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  name: "BYD Seagull",
                  segment: "Ride-Hailing King",
                  reason: "405km range, LFP safety, and sub-$12K FOB pricing make this the #1 choice for Addis taxi fleets.",
                  img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80",
                },
                {
                  name: "GAC Aion RT",
                  segment: "Premium Fleet",
                  reason: "LiDAR ADAS and 520km range appeal to corporate and government procurement contracts.",
                  img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80",
                },
                {
                  name: "Farizon Super Van",
                  segment: "Last-Mile Logistics",
                  reason: "With Addis Ababa's booming e-commerce sector, electric cargo vans offer unmatched urban delivery economics.",
                  img: "https://images.unsplash.com/photo-1517524008410-d4484e313a21?auto=format&fit=crop&w=600&q=80",
                },
              ].map((car, i) => (
                <div
                  key={i}
                  className="glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
                      {car.segment}
                    </div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
                      {car.name}
                    </h3>
                    <p className="text-gray-500 text-xs font-light leading-relaxed">
                      {car.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label mb-6">Export Logistics</div>
              <h2 className="sh mb-8">
                Shanghai <span className="text-accent">→</span>{" "}
                <span className="text-theme">Djibouti</span>.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                Our established RoRo and container routes from Shanghai/Ningbo
                to Djibouti Port ensure reliable 28-35 day transit. From
                Djibouti, the new Addis-Djibouti railway provides seamless
                inland transport to the capital.
              </p>
              <Link
                href="/contact"
                className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg"
              >
                Request Ethiopia FOB Quote →
              </Link>
            </div>
            <div className="glass rounded-[3rem] p-10 md:p-14">
              <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-8">
                Route Timeline
              </div>
              <div className="space-y-6">
                {[
                  { step: "01", label: "Factory Collection", time: "Day 1-3" },
                  { step: "02", label: "Shanghai Port Loading", time: "Day 4-7" },
                  { step: "03", label: "Maritime Transit", time: "Day 8-28" },
                  { step: "04", label: "Djibouti Port Clearance", time: "Day 29-32" },
                  { step: "05", label: "Rail to Addis Ababa", time: "Day 33-35" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-theme/10 border border-theme/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-theme">
                        {item.step}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs font-black text-white uppercase tracking-wider">
                        {item.label}
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt=""
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.45)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-bg) 0%, transparent 15%)",
            }}
          />
        </div>

        <section className="py-24 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div
              className="glass rounded-[4rem] p-12 md:p-20 text-center"
              style={{ borderColor: "rgba(197,160,89,.25)" }}
            >
              <div className="label justify-center mb-6">
                Ethiopia Priority Desk
              </div>
              <h2
                className="sh mb-6"
                style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)" }}
              >
                Secure Your{" "}
                <span className="text-accent">Market</span> Position.
              </h2>
              <p className="text-gray-500 text-lg font-light italic mb-10 max-w-lg mx-auto">
                Early movers in Ethiopia are capturing dealership territories.
                Request your exclusive market analysis and batch pricing today.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/qr/F7M2RQADCE3KN1"
                  className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg"
                >
                  WhatsApp Priority Desk
                </a>
                <Link
                  href="/contact"
                  className="btn-outline px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic"
                >
                  Submit Dealer Application
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
