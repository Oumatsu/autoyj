import Link from "next/link";

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <img
          src="/pic/hero/0.webp"
          className="w-full block"
          style={{ filter: "brightness(.95)", marginBottom: "-7.5%" }}
          alt="Export Logistics"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(28,28,28,.6) 28%, transparent 75%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, rgba(28,28,28,0.00) 0%, rgba(28,28,28,0.02) 2%, rgba(28,28,28,0.04) 4%, rgba(28,28,28,0.06) 6%, rgba(28,28,28,0.08) 8%, rgba(28,28,28,0.10) 10%, rgba(28,28,28,0.12) 12%, rgba(28,28,28,0.14) 14%, rgba(28,28,28,0.16) 16%, rgba(28,28,28,0.18) 18%, rgba(28,28,28,0.20) 20%, rgba(28,28,28,0.22) 22%, rgba(28,28,28,0.24) 24%, rgba(28,28,28,0.26) 26%, rgba(28,28,28,0.28) 28%, rgba(28,28,28,0.30) 30%, rgba(28,28,28,0.32) 32%, rgba(28,28,28,0.34) 34%, rgba(28,28,28,0.36) 36%, rgba(28,28,28,0.38) 38%, rgba(28,28,28,0.40) 40%, rgba(28,28,28,0.42) 42%, rgba(28,28,28,0.44) 44%, rgba(28,28,28,0.46) 46%, rgba(28,28,28,0.48) 48%, rgba(28,28,28,0.50) 50%, rgba(28,28,28,0.52) 52%, rgba(28,28,28,0.54) 54%, rgba(28,28,28,0.56) 56%, rgba(28,28,28,0.58) 58%, rgba(28,28,28,0.60) 60%, rgba(28,28,28,0.62) 62%, rgba(28,28,28,0.64) 64%, rgba(28,28,28,0.66) 66%, rgba(28,28,28,0.68) 68%, rgba(28,28,28,0.70) 70%, rgba(28,28,28,0.72) 72%, rgba(28,28,28,0.74) 74%, rgba(28,28,28,0.76) 76%, rgba(28,28,28,0.78) 78%, rgba(28,28,28,0.80) 80%, rgba(28,28,28,0.82) 82%, rgba(28,28,28,0.84) 84%, rgba(28,28,28,0.86) 86%, rgba(28,28,28,0.88) 88%, rgba(28,28,28,0.90) 90%, rgba(28,28,28,0.92) 92%, rgba(28,28,28,0.94) 94%, rgba(28,28,28,0.96) 96%, rgba(28,28,28,0.98) 98%, rgba(28,28,28,1.00) 100%)"
          }}
        />

        <div className="container absolute inset-0 z-10 flex flex-col items-center justify-center px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="label label-gold mb-6 text-[11px]">
              Precision Export Solutions
            </div>
            <h1
              className="sh mb-8"
              style={{ fontSize: "clamp(3rem, 7.5vw, 6.5rem)" }}
            >
              Quality <span className="text-accent">Verified</span>
              <br />
              Delivered Transparently.
            </h1>
            <p
              className="text-xl text-gray-400 font-light italic border-l-2 pl-8 leading-relaxed max-w-xl"
              style={{ borderColor: "var(--color-green)" }}
            >
              Eliminating the uncertainty of China-to-Africa EV exports with
              rigorous 50-point PDI and end-to-end visual tracking.
            </p>
          </div>
        </div>
      </section>

      {/* PDI & Quality Standards */}
      <section id="pdi" className="py-20 md:py-28 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="label mb-6">PDI & Quality Control</div>
              <h2 className="sh mb-8">
                The <span className="text-theme">50-Point</span>
                <br />
                Gold Standard.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
                Every vehicle we source undergoes a comprehensive pre-delivery
                inspection at our designated facility before moving to the port.
                We don&apos;t just ship; we validate.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl border-accent/20">
                  <div className="text-3xl font-black italic text-accent mb-1">
                    100%
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-600">
                    Inspection Rate
                  </div>
                </div>
                <div className="glass p-6 rounded-2xl border-theme/20">
                  <div className="text-3xl font-black italic text-theme mb-1">
                    Digital
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-600">
                    PDI Reports
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[3rem] p-8 md:p-12">
              <div className="text-[10px] font-black tracking-widest uppercase text-accent mb-8 flex items-center gap-3">
                <span className="pulse-dot" /> PDI Checklist Categories
              </div>
              <div className="space-y-6">
                {[
                  {
                    title: "Battery & Powertrain",
                    items: [
                      "SoH (State of Health) Verification",
                      "High-Voltage Cable Insulation Check",
                      "DC/AC Charging Port Functionality",
                    ],
                  },
                  {
                    title: "Exterior & Structural",
                    items: [
                      "Paint Depth & Micro-Scratch Audit",
                      "Sealant Integrity & Water-Leak Test",
                      "Underbody Suspension & Shield Check",
                    ],
                  },
                  {
                    title: "Systems & Software",
                    items: [
                      "Infotainment Language & GPS Setup",
                      "ADAS Calibration & Sensor Check",
                      "Factory Key & Remote App Sync",
                    ],
                  },
                ].map((cat, i) => (
                  <div key={i}>
                    <h4 className="text-xs font-black uppercase text-white mb-3 tracking-widest">
                      {cat.title}
                    </h4>
                    <div className="grid gap-2">
                      {cat.items.map((item, j) => (
                        <div key={j} className="pdi-item">
                          <div className="pdi-check" />
                          <span className="text-xs text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Proof: Video Loading */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Port Loading"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.65)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="label label-gold justify-center mb-6">
              Zero Surprises
            </div>
            <h2 className="sh mb-8">
              Every Loading.
              <br />
              <span className="text-theme">On HD Video</span>.
            </h2>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed mb-12">
              We provide a full HD walkthrough of your container loading
              process. You see the condition of each vehicle, the securing
              methods, and the final seal — before the ship ever leaves China.
            </p>
            <div className="inline-flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-theme/10 border border-theme text-theme mb-3">
                  ▶
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
                  Walkthrough
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-accent/10 border border-accent text-accent mb-3">
                  ✓
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
                  Seal Verification
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Starter Parts Kit */}
      <section id="parts" className="py-20 md:py-28 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass rounded-[3rem] p-10 md:p-14 border-theme/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-theme/5 rounded-bl-full pointer-events-none" />
                <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-8">
                  Typical &quot;Class A&quot; Kit Inventory
                </div>
                <div className="space-y-4">
                  {[
                    ["Brake Pads (Full Set)", "× 2"],
                    ["HEPA Cabin Filters", "× 4"],
                    ["Wiper Blade Sets", "× 2"],
                    ["Auxiliary 12V Battery", "× 1"],
                    ["Charging Cable (Type 2)", "× 1"],
                    ["OBD2 Diagnostic Tool", "× 1"],
                  ].map(([name, qty], i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-white/5 pb-2"
                    >
                      <span className="text-sm text-gray-400 font-light">
                        {name}
                      </span>
                      <span className="text-xs font-black text-theme">
                        {qty}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-8 text-[9px] text-gray-600 italic">
                  Customized per model (BYD, GAC, Geely) and per market
                  requirement.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="label mb-6">Operational Uptime</div>
              <h2 className="sh mb-8">
                Starter <span className="text-accent">Parts Kit</span> Bundle.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                Don&apos;t let a missing air filter or worn brake pad stall
                your sales. We offer pre-packaged maintenance kits tailored to
                your specific fleet models, shipped inside the vehicle to
                maximize logistics efficiency.
              </p>
              <div className="flex items-start gap-4 mb-10">
                <div className="num-circle bg-accent/10 border border-accent text-accent">
                  !
                </div>
                <p className="text-sm text-gray-400 italic">
                  &quot;Availability of basic parts is the #1 hurdle for
                  African EV buyers. We solve it at the point of export.&quot;
                </p>
              </div>
              <Link
                href="/solutions/configure-kit"
                className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
              >
                Configure My Kit →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Service Centre Setup */}
      <section id="service" className="py-20 md:py-28 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label label-gold mb-6">
                After-Sales Infrastructure
              </div>
              <h2 className="sh mb-8">
                Build Your Own{" "}
                <span className="text-theme">Service Centre</span>.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                We represent leading Chinese automotive maintenance equipment
                brands. When your dealership is ready to offer in-house EV
                servicing, we supply the complete setup — from diagnostics to
                high-voltage safety tooling.
              </p>
              <Link
                href="/solutions/request-quote"
                className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
              >
                Request Setup Quote →
              </Link>
            </div>
            <div className="grid gap-4">
              {[
                {
                  num: "01",
                  title: "EV Diagnostics Station",
                  desc: "Battery SoH reader, OBD multi-brand scanner, HV insulation tester",
                  cls: "text-theme border-theme",
                },
                {
                  num: "02",
                  title: "Workshop Lifts & Tooling",
                  desc: "4-post alignment lift, wheel balancer, EV-rated floor jack sets",
                  cls: "text-theme border-theme",
                },
                {
                  num: "03",
                  title: "Technician Onboarding",
                  desc: "Remote training guide + Chinese-English technical manual set included",
                  cls: "text-accent border-accent",
                },
              ].map((item, i) => (
                <div key={i} className="glass rounded-2xl p-6 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${item.cls}`}
                    style={{
                      background:
                        i < 2
                          ? "rgba(197,160,89,.1)"
                          : "rgba(16,185,129,.1)",
                      border: `1px solid ${
                        i < 2
                          ? "rgba(197,160,89,.25)"
                          : "rgba(16,185,129,.25)"
                      }`,
                    }}
                  >
                    {item.num}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white mb-1">
                      {item.title}
                    </div>
                    <p className="text-xs text-gray-600 font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Support */}
      <section className="py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Dealer Support"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.55)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="label label-gold justify-center mb-6">
              Dealer Empowerment
            </div>
            <h2 className="sh mb-8">
              Sales <span className="text-theme">Ready</span> from Day 1.
            </h2>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed mb-12">
              We provide every partner with high-res marketing packs: studio
              photos, Facebook ad templates, and technical selling points for
              your showroom team.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: "Visuals",
                  desc: "4K Unbranded Images & Video Tours",
                  cls: "text-theme",
                },
                {
                  title: "Digital",
                  desc: "FB & Instagram Campaign Templates",
                  cls: "text-accent",
                },
                {
                  title: "Technical",
                  desc: "Sales Scripts & Battery Safety Guides",
                  cls: "text-white",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-[2rem]"
                  style={{
                    background: "rgba(0,0,0,.42)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <h5
                    className={`text-[10px] font-black uppercase tracking-widest ${item.cls} mb-2`}
                  >
                    {item.title}
                  </h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trade Terms */}
      <section id="finance" className="py-20 md:py-28 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label mb-6">Flexible Trade Terms</div>
              <h2 className="sh mb-8">
                <span className="text-theme">30 / 70</span> CIF.
                <br />
                Your Pace.
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                Most suppliers demand 100% T/T upfront. We accept a 30% deposit
                to confirm your order, with the 70% balance due against shipping
                documents — you pay the majority only when your vehicles are
                already on the water.
              </p>
              <Link
                href="/contact"
                className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg"
              >
                Discuss Terms →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "30%",
                  label: "Deposit to\nConfirm Order",
                  cls: "text-theme",
                },
                {
                  value: "CIF",
                  label: "Delivered to\nYour Port",
                  cls: "text-accent",
                  border: "rgba(16,185,129,.25)",
                },
                {
                  value: "70%",
                  label: "Against Bill\nof Lading",
                  cls: "text-theme",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-[2rem] p-8 text-center flex flex-col items-center gap-3"
                  style={
                    item.border
                      ? { borderColor: item.border }
                      : undefined
                  }
                >
                  <div
                    className={`text-4xl font-black italic ${item.cls}`}
                    style={
                      item.value === "CIF"
                        ? { fontSize: "1.5rem" }
                        : undefined
                    }
                  >
                    {item.value}
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA removed to avoid duplication with Start the Conversation section */}
    </>
  );
}
