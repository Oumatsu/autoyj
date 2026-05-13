import Link from "next/link";
import { HeroSlider } from "@/components/HeroSlider";
import { SectionTabs } from "@/components/SectionTabs";
import { TcoCounter } from "@/components/TcoCounter";

export default function HomePage() {
  return (
    <>
      <HeroSlider />
      <SectionTabs />

      {/* Trust Bar */}
      <div
        className="py-10 border-y"
        style={{ background: "#000", borderColor: "rgba(197,160,89,.08)" }}
      >
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <span className="text-[9px] font-black tracking-[.3em] uppercase text-gray-700">
              Trusted Supply Chain Partners
            </span>
            <div className="flex flex-wrap items-center gap-10 md:gap-14 opacity-25 grayscale">
              <span className="text-sm font-black italic uppercase tracking-tight">
                Cosco
              </span>
              <span className="text-sm font-black italic uppercase tracking-tight">
                Maersk
              </span>
              <span className="text-sm font-black italic uppercase tracking-tight">
                SGS
              </span>
              <span className="text-sm font-black italic uppercase tracking-tight">
                TÜV Rheinland
              </span>
              <span className="text-sm font-black italic uppercase tracking-tight">
                Lloyd&apos;s Register
              </span>
              <span className="text-sm font-black italic uppercase tracking-tight">
                BV Group
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Curated Vehicles */}
      <section className="py-20 md:py-28 bg-b" id="products">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="label label-gold mb-4">Curated for Profit</div>
              <h2 className="sh">
                The <span className="text-accent">Eco</span>{" "}
                <span className="text-theme">Winners</span> Circle.
              </h2>
            </div>
            <Link
              href="/products"
              className="btn-outline px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase self-start md:self-auto whitespace-nowrap"
            >
              Full Catalog →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Revenue King */}
            <div>
              <Link href="/products/revenue-king" className="block">
                <div className="v-card aspect-[4/5] border border-accent/20">
                  <img
                    src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80"
                    className="w-full h-full object-cover absolute inset-0"
                    alt="Revenue King"
                  />
                  <div className="v-card-overlay" />
                  <div className="absolute top-8 left-8">
                    <span
                      className="text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest"
                      style={{ background: "var(--color-green)", color: "#000" }}
                    >
                      High ROI
                    </span>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="label mb-2">Category 01</div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                      Revenue King
                    </h3>
                    <p className="text-gray-400 text-xs mt-2 font-light">
                      Ride-hailing &amp; urban fleets. Up to $350/mo saved.
                    </p>
                  </div>
                </div>
              </Link>
              <div className="mt-5 flex items-center justify-between px-1">
                <div className="flex flex-wrap gap-2">
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,.1)",
                      color: "var(--color-green)",
                    }}
                  >
                    Network Taxi
                  </span>
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,.1)",
                      color: "var(--color-green)",
                    }}
                  >
                    LFP Battery
                  </span>
                </div>
                <Link
                  href="/products/revenue-king"
                  className="nav-link green text-[10px]"
                >
                  Explore →
                </Link>
              </div>
            </div>

            {/* Elite Flagship */}
            <div>
              <Link href="/products/elite-flagship" className="block">
                <div
                  className="v-card aspect-[4/5] border border-theme/25"
                  style={{ boxShadow: "0 0 40px rgba(197,160,89,.07)" }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1563720360172-67b8f3dce741?auto=format&fit=crop&w=800&q=80"
                    className="w-full h-full object-cover absolute inset-0"
                    alt="Elite Flagship"
                  />
                  <div className="v-card-overlay" />
                  <div className="absolute top-8 left-8">
                    <span
                      className="text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest"
                      style={{
                        background: "var(--color-gold)",
                        color: "#000",
                      }}
                    >
                      Premium Yield
                    </span>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="label label-gold mb-2">Category 02</div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                      Elite Flagship
                    </h3>
                    <p className="text-gray-400 text-xs mt-2 font-light">
                      Government &amp; corporate. The B2B social currency.
                    </p>
                  </div>
                </div>
              </Link>
              <div className="mt-5 flex items-center justify-between px-1">
                <div className="flex flex-wrap gap-2">
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(197,160,89,.1)",
                      color: "var(--color-gold)",
                    }}
                  >
                    Government
                  </span>
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(197,160,89,.1)",
                      color: "var(--color-gold)",
                    }}
                  >
                    800V Charge
                  </span>
                </div>
                <Link
                  href="/products/elite-flagship"
                  className="nav-link text-[10px]"
                >
                  Explore →
                </Link>
              </div>
            </div>

            {/* Utility Pro */}
            <div>
              <Link href="/products/utility-pro" className="block">
                <div className="v-card aspect-[4/5] border border-accent/20">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80"
                    className="w-full h-full object-cover absolute inset-0"
                    alt="Utility Pro"
                  />
                  <div className="v-card-overlay" />
                  <div className="absolute top-8 left-8">
                    <span
                      className="text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest"
                      style={{ background: "var(--color-green)", color: "#000" }}
                    >
                      Durable Offroad
                    </span>
                  </div>
                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="label mb-2">Category 03</div>
                    <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                      Utility Pro
                    </h3>
                    <p className="text-gray-400 text-xs mt-2 font-light">
                      All-terrain &amp; logistics. Fuel costs cut 50–60%.
                    </p>
                  </div>
                </div>
              </Link>
              <div className="mt-5 flex items-center justify-between px-1">
                <div className="flex flex-wrap gap-2">
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,.1)",
                      color: "var(--color-green)",
                    }}
                  >
                    Off-Road
                  </span>
                  <span
                    className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,.1)",
                      color: "var(--color-green)",
                    }}
                  >
                    V2L Export
                  </span>
                </div>
                <Link
                  href="/products/utility-pro"
                  className="nav-link green text-[10px]"
                >
                  Explore →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works — 4 Steps */}
      <section
        id="solutions"
        className="py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.3) grayscale(15%)" }}
            alt="Logistics"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.65)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 15%, transparent 85%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="text-center mb-20">
            <div className="label justify-center mb-4">
              Transparent Process
            </div>
            <h2 className="sh">
              The <span className="text-theme">Gold</span>{" "}
              <span className="text-accent">Eco-Standard</span>.
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-10">
            {[
              {
                num: "01",
                title: "Needs Assessment",
                desc: "Tell us your market, budget, use case. We match the right vehicle within 2 hours.",
                badge: "2h Response SLA",
                badgeClass: "text-accent",
                pulse: true,
              },
              {
                num: "02",
                title: "Rapid Sourcing",
                desc: "Direct factory access. Best FOB price locked in. Batch scheduling across our full supplier network.",
                badge: "Direct Factory Access",
                badgeClass: "text-gray-600",
              },
              {
                num: "03",
                title: "Transparent PDI",
                desc: "50-point inspection. Full container loading video before shipment. No surprises at the port.",
                badge: "50-Point PDI",
                badgeClass: "",
                badgeStyle: {
                  background: "rgba(197,160,89,.1)",
                  color: "var(--color-gold)",
                },
              },
              {
                num: "04",
                title: "Delivery & Empower",
                desc: "Starter parts kit included. Marketing assets + sales scripts + tech support to help you sell faster.",
                badge: "Turnkey Dealer Support",
                badgeClass: "text-accent",
              },
            ].map((step, i) => (
              <div key={i} className="step-card glass rounded-3xl p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`num-circle border ${
                      i < 2 ? "border-theme" : "border-accent"
                    }`}
                    style={{ color: i < 2 ? "var(--color-gold)" : "var(--color-green)" }}
                  >
                    {step.num}
                  </div>
                  {step.pulse && <div className="pulse-dot mt-2" />}
                </div>
                <h4 className="text-white font-black uppercase tracking-wider text-sm mb-3">
                  {step.title}
                </h4>
                <p className="text-gray-500 text-xs leading-relaxed font-light">
                  {step.desc}
                </p>
                <div className="mt-6">
                  {step.badgeStyle ? (
                    <span className="text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest" style={step.badgeStyle}>
                      {step.badge}
                    </span>
                  ) : (
                    <span className={`text-[9px] font-black tracking-widest uppercase ${step.badgeClass}`}>
                      {step.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "50+", label: "PDI Checkpoints", cls: "text-theme" },
              { num: "2h", label: "Quote Response", cls: "text-accent" },
              { num: "15+", label: "Years Pedigree", cls: "text-white" },
              { num: "100%", label: "Transparent", cls: "text-accent" },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass rounded-[2rem] p-8 text-center glass-sm"
              >
                <div className={`text-4xl font-black italic mb-1 ${stat.cls}`}>
                  {stat.num}
                </div>
                <div className="text-[10px] font-black tracking-[.3em] uppercase text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EV vs ICE TCO */}
      <section className="py-20 md:py-28 bg-a" id="tco">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="label label-gold mb-5">
                The Numbers Don&apos;t Lie
              </div>
              <h2 className="sh mb-6">
                EV vs Petrol.
                <br />
                <span className="text-theme">Real</span>{" "}
                <span className="text-accent">Profit</span>.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8 italic">
                Your customers switch to EV because it saves them real money
                every month. Give them the data that closes the deal.
              </p>
              <div className="space-y-5 mb-10">
                {[
                  {
                    num: "01",
                    text: 'Fuel savings: <span class="text-white">$180–$500 per month</span>',
                    cls: "border-theme",
                    color: "var(--color-gold)",
                  },
                  {
                    num: "02",
                    text: 'Lower maintenance: <span class="text-white">No oil changes, fewer brake jobs</span>',
                    cls: "border-accent",
                    color: "var(--color-green)",
                  },
                  {
                    num: "03",
                    text: '3-year net saving: <span class="text-accent">$6,000–$18,000 per vehicle</span>',
                    cls: "border-theme",
                    color: "var(--color-gold)",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`num-circle border ${item.cls} mt-0.5`}
                      style={{
                        color: item.color,
                        width: "22px",
                        height: "22px",
                        fontSize: "9px",
                      }}
                    >
                      {item.num}
                    </div>
                    <p
                      className="text-xs font-black uppercase tracking-wider text-gray-400"
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  </div>
                ))}
              </div>
              <a
                href="#contact"
                className="btn-primary inline-block px-10 py-5 rounded text-sm font-black tracking-widest uppercase italic"
              >
                Get My Profit Estimate
              </a>
            </div>

            {/* Visual bars */}
            <div className="glass rounded-[2.5rem] p-8 md:p-10">
              <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-8">
                Monthly Operating Cost — Mid-Size Sedan
              </div>

              {/* EV */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Electric Vehicle (EV)
                  </span>
                  <span className="text-xs font-black text-accent">
                    ~$120 / mo
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full"
                  style={{ background: "rgba(255,255,255,.04)" }}
                >
                  <div
                    className="bar-fill h-2.5 rounded-full"
                    style={{
                      width: "22%",
                      background: "linear-gradient(to right,#10B981,#059669)",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[9px] text-gray-600">
                    ⚡ Electricity ~$60
                  </span>
                  <span className="text-[9px] text-gray-600">
                    🔧 Maintenance ~$60
                  </span>
                </div>
              </div>

              {/* ICE */}
              <div className="mb-10">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Petrol Vehicle (ICE)
                  </span>
                  <span
                    className="text-xs font-black"
                    style={{ color: "#EF4444" }}
                  >
                    ~$420 / mo
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full"
                  style={{ background: "rgba(255,255,255,.04)" }}
                >
                  <div
                    className="bar-fill h-2.5 rounded-full"
                    style={{
                      width: "78%",
                      background: "linear-gradient(to right,#EF4444,#B91C1C)",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="text-[9px] text-gray-600">
                    ⛽ Fuel ~$280
                  </span>
                  <span className="text-[9px] text-gray-600">
                    🔧 Service ~$140
                  </span>
                </div>
              </div>

              {/* Savings */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(197,160,89,.06)",
                  border: "1px solid rgba(197,160,89,.15)",
                }}
              >
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-2">
                  Monthly Savings Per Vehicle
                </div>
                <div className="text-5xl font-black italic text-white mb-1">
                  $<TcoCounter />
                </div>
                <div className="text-[9px] font-black tracking-widest uppercase text-theme">
                  $10,800 saved over 3 years
                </div>
              </div>
              <p className="text-[9px] text-gray-700 mt-4 text-center">
                *Mid-size sedan, local fuel price $1.4/L, 3,000km/month, East
                Africa avg.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insights + Academy */}
      <section
        id="insights"
        className="py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.3) grayscale(15%)" }}
            alt="Tech"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.65)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 15%, transparent 85%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="label justify-center mb-4">
              Knowledge is Your Edge
            </div>
            <h2 className="sh">
              <span className="text-theme">Expert</span> Tools
              <br />
              Built for Dealers.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Market Report */}
            <div className="glass rounded-[3rem] p-10 md:p-14 flex flex-col justify-between min-h-[300px]">
              <div>
                <div className="label label-gold mb-5">
                  Market Intelligence
                </div>
                <h3 className="text-3xl font-black uppercase italic text-white tracking-tight mb-4">
                  2026 Africa EV
                  <br />
                  Export Report
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  Top 20 models ranked by Africa ROI. Import policy updates.
                  Real margin data. Used by dealers across Ethiopia to make
                  smarter sourcing decisions.
                </p>
              </div>
              <Link
                href="/insights"
                className="btn-outline inline-block mt-8 px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase self-start"
              >
                Download Free →
              </Link>
            </div>

            {/* Academy */}
            <div
              className="glass rounded-[3rem] p-10 md:p-14 flex flex-col justify-between min-h-[300px]"
              id="academy"
              style={{ borderColor: "rgba(16,185,129,.2)" }}
            >
              <div>
                <div className="label mb-5">EV Growth Academy</div>
                <h3 className="text-3xl font-black uppercase italic text-white tracking-tight mb-4">
                  Turn Your Team
                  <br />
                  into EV Experts.
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  Free training modules: EV basics, battery safety for African
                  climates, sales scripts, and showroom SOPs. Ready to use from
                  day one.
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <Link
                  href="/academy"
                  className="btn-primary inline-block px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase"
                >
                  Browse Academy →
                </Link>
                <div className="flex items-center gap-2">
                  <div className="pulse-dot" />
                  <span className="text-[9px] font-black tracking-widest uppercase text-accent">
                    Free Access
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-20 md:py-28 bg-b" id="about">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label label-gold mb-6">Who We Are</div>
              <div className="text-5xl italic font-serif mb-3 text-theme">
                &ldquo;
              </div>
              <p className="text-2xl md:text-3xl font-light leading-relaxed text-white italic mb-6">
                We don&apos;t just sell cars.
                <br />
                We <span className="text-theme">build dealerships</span>.
              </p>
              <p className="text-gray-500 text-sm leading-relaxed font-light mb-10">
                Our dual-track strategy goes beyond sourcing. We equip every
                partner with the tools, knowledge, and support to win in their
                local market — from day one.
              </p>
              <Link
                href="#"
                className="btn-outline inline-block px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase"
              >
                Meet the Team →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { num: "15+", label: "Years Pedigree", cls: "text-theme" },
                {
                  num: "100%",
                  label: "Transparent",
                  cls: "text-accent",
                  border: "rgba(16,185,129,.2)",
                },
                {
                  num: "50pt",
                  label: "PDI Every Vehicle",
                  cls: "text-accent",
                  border: "rgba(16,185,129,.2)",
                },
                { num: "2h", label: "Quote Response", cls: "text-theme" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-[2rem] p-10 text-center"
                  style={
                    item.border
                      ? { borderColor: item.border }
                      : undefined
                  }
                >
                  <div className={`text-5xl font-black italic mb-2 ${item.cls}`}>
                    {item.num}
                  </div>
                  <div className="text-[10px] font-black tracking-[.3em] uppercase text-gray-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <section className="py-20 md:py-28 bg-a" id="lead-magnet">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-xl mx-auto text-center">
            <div className="label justify-center mb-5">
              Free Insider Report
            </div>
            <h2 className="sh mb-4">
              2026 China EV
              <br />
              <span className="text-theme">Export Report</span>.
            </h2>
            <p className="text-gray-500 text-base font-light leading-relaxed mb-10">
              Top 20 models ranked by Africa ROI. Real import margin data. Used
              by dealers across Ethiopia to source smarter.
            </p>

            <div className="glass rounded-[2.5rem] p-8 md:p-10 text-left">
              <div className="flex flex-col gap-4 mb-5">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full px-5 py-4 rounded-xl text-sm font-medium outline-none"
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(197,160,89,.15)",
                    color: "#fff",
                  }}
                />
                <input
                  type="tel"
                  placeholder="WhatsApp number (with country code)"
                  className="w-full px-5 py-4 rounded-xl text-sm font-medium outline-none"
                  style={{
                    background: "rgba(255,255,255,.04)",
                    border: "1px solid rgba(197,160,89,.15)",
                    color: "#fff",
                  }}
                />
              </div>
              <button className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic">
                Download Free Report →
              </button>
              <p className="text-[10px] text-gray-700 mt-4 text-center">
                No spam. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
