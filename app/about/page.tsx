import Link from "next/link";

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            alt="Mission"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-mid) 10%, rgba(15,15,15,0.5) 45%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="pulse-dot" />
              <span className="text-accent text-[10px] font-black uppercase tracking-[.3em]">
                Dual-Track Strategy
              </span>
            </div>
            <h1
              className="sh mb-8"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              We Don&apos;t Just
              <br />
              <span className="text-theme">Sell Cars</span>.
              <br />
              We Build Dealerships.
            </h1>
            <p
              className="text-xl text-gray-400 font-light italic border-l-2 pl-8 leading-relaxed max-w-xl"
              style={{ borderColor: "rgba(197,160,89,.3)" }}
            >
              Most exporters simply ship cars. We architect dealerships. Our
              comprehensive ecosystem equips African importers with curated
              vehicles, specialized maintenance tools, technical guidance,
              starter parts, and marketing assets to dominate their local
              markets.
            </p>
          </div>
        </div>
      </section>

      {/* Heritage */}
      <section id="heritage" className="py-32 bg-a scroll-mt-48">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="label label-gold mb-6">Our Heritage</div>
              <h2 className="sh mb-8">
                15+ Years of
                <br />
                <span className="text-theme">Combined</span> Expertise.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-12">
                Headquartered in{" "}
                <strong>Shanghai, China</strong>—the global epicenter of
                advanced EV manufacturing and logistics—autoYJ was forged
                to bridge the gap between Tier-1 automotive factories and the
                African market&apos;s demand for a reliable, end-to-end green
                mobility partner.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-[2rem] p-6 text-center shadow-2xl glass-sm">
                  <div className="text-4xl font-black italic text-theme mb-2">
                    200+
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-400">
                    Batches Shipped
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-6 text-center shadow-2xl glass-sm">
                  <div className="text-4xl font-black italic text-accent mb-2">
                    12
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-400">
                    African Markets
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-6 text-center shadow-2xl glass-sm">
                  <div className="text-4xl font-black italic text-white mb-2">
                    30+
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-400">
                    Brands Sourced
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-light italic text-white leading-relaxed mb-8 relative z-10">
                &quot;True partnership isn&apos;t about the transaction;
                it&apos;s about the inventory turnover and the dealer&apos;s
                sustainable growth.&quot;
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-px bg-theme" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  The Founders&apos; Vision
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Logistics Network */}
      <section className="relative py-48 scroll-mt-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.4) contrast(1.2) grayscale(40%)" }}
            alt="Global Network"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,0.5)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="max-w-2xl">
            <div className="label mb-4">Export Infrastructure</div>
            <h2 className="sh mb-8">
              Global <span className="text-theme">Footprint</span>.
            </h2>
            <p
              className="text-gray-400 text-lg font-light leading-relaxed mb-12 border-l-2 border-theme/30 pl-6"
              style={{ borderColor: "rgba(197,160,89,.3)" }}
            >
              Our supply chain is built for scale and ultimate flexibility.
              Leveraging a pan-China network of deep-water ports customized to
              client logistics, to primary customs hubs across the African
              continent, we manage the entire export lifecycle. We provide
              end-to-end routing, eliminating the friction of cross-border EV
              procurement.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {[
              {
                title: "RoRo & Container",
                desc: "Flexible shipping modes. Whether securing RoRo slots for fleet volumes or optimizing 40HQ container packing for mixed batches.",
              },
              {
                title: "Customs Clearance",
                desc: "Pre-validated export documentation (CoO, EV specific battery certs) ensuring rapid processing at destination ports.",
              },
              {
                title: "Port-to-Port Tracking",
                desc: "Complete transparency from the moment vehicles leave the factory floor until they arrive at your designated terminal.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass rounded-[2rem] p-8 glass-sm hover:border-gold transition-colors duration-500 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-3">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-light">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SLA */}
      <section id="sla" className="py-32 bg-b scroll-mt-48">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <div className="label justify-center mb-4">Our Commitment</div>
            <h2 className="sh">
              The <span className="text-theme">SLA</span> Guarantee.
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "2h Response",
                desc: "Batch quotes and factory availability confirmed within 2 hours of inquiry.",
                cls: "border-theme text-theme",
              },
              {
                num: "02",
                title: "Video Loading",
                desc: "HD container loading footage provided for every single vehicle in your shipment.",
                cls: "border-accent text-accent",
              },
              {
                num: "03",
                title: "Parts Mastery",
                desc: "Custom starter parts kits available for all curated models to ensure zero downtime.",
                cls: "border-theme text-theme",
              },
              {
                num: "04",
                title: "Secure Transactions",
                desc: "We operate on a strict, transparent 30/70 T/T structure. Original compliance documents (BoL, Invoice, CoO) are dispatched immediately upon final settlement.",
                cls: "border-accent text-accent",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass rounded-[2rem] p-8 glass-sm hover:-translate-y-2 transition duration-300 cursor-default"
              >
                <div className={`num-circle mb-6 border ${item.cls}`}>
                  {item.num}
                </div>
                <h4 className="text-white font-black uppercase tracking-wider text-sm mb-3">
                  {item.title}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt=""
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.65)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 12%)",
            }}
          />
        </div>

        <section className="relative z-10 container mx-auto px-6 md:px-12 pt-24 pb-20">
          <div
            className="rounded-[4rem] p-12 md:p-20 text-center"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(197,160,89,0.25)",
              backdropFilter: "blur(25px)",
              WebkitBackdropFilter: "blur(25px)",
            }}
          >
            <div className="label justify-center mb-6">
              Ready to Partner?
            </div>
            <h2
              className="sh mb-6"
              style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)" }}
            >
              Join the <span className="text-accent">Green</span>{" "}
              <span className="text-theme">Network</span>.
            </h2>
            <p className="text-gray-500 text-lg font-light italic mb-10 max-w-lg mx-auto">
              Scale your dealership with China&apos;s most transparent EV
              sourcing partner.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/qr/F7M2RQADCE3KN1"
                className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg"
              >
                WhatsApp Us Now
              </a>
              <Link
                href="/contact"
                className="btn-outline px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic"
              >
                Get Dealer Pricing
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
