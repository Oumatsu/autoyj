"use client";

import Link from "next/link";

export default function RequestQuotePage() {
  return (
    <>
      <section className="pt-32 pb-20 relative z-10 overflow-hidden min-h-[50vh] flex items-center bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Link
                href="/solutions"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                Solutions
              </Link>
              <span className="text-gray-600">/</span>
              <Link
                href="/solutions#service"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                Service Centre
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                Quote
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              Request a{" "}
              <span className="text-theme">Service Centre</span>{" "}
              Setup Quote.
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 leading-relaxed max-w-2xl">
              From diagnostics to high-voltage tooling — get a complete
              equipment list and investment estimate tailored to your
              dealership scale.
            </p>
          </div>
        </div>
      </section>

      <main className="py-12 bg-b relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Equipment Preview */}
            <aside className="lg:col-span-5 order-2 lg:order-1">
              <div className="sticky top-[120px] space-y-6">
                {/* Tier Reference */}
                <div className="glass rounded-[2rem] p-8 md:p-10 border-theme/20">
                  <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-6">
                    Service Centre Tiers
                  </div>
                  <div className="space-y-5">
                    {[
                      {
                        tier: "Essential",
                        price: "$12,000 – $18,000",
                        desc: "1-bay workshop. Diagnostic tools, basic lifts, EV safety kit. Ideal for dealers starting EV after-sales.",
                        color: "text-accent",
                      },
                      {
                        tier: "Professional",
                        price: "$25,000 – $40,000",
                        desc: "3-bay workshop. Full diagnostics, alignment, HV battery tools, technician onboarding.",
                        color: "text-theme",
                      },
                      {
                        tier: "Master",
                        price: "$55,000+",
                        desc: "5+ bay facility. Battery SoH station, spray booth prep, multi-brand scanner suite, remote support SLA.",
                        color: "text-gold",
                      },
                    ].map((tier, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-black/20 border border-white/5"
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-xs font-black uppercase tracking-widest ${tier.color}`}
                          >
                            {tier.tier}
                          </span>
                          <span className="text-xs font-bold text-white">
                            {tier.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 font-light leading-relaxed">
                          {tier.desc}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What's Included */}
                <div className="glass rounded-[2rem] p-8 md:p-10 border-accent/10">
                  <div className="text-[10px] font-black tracking-widest uppercase text-accent mb-6">
                    What&apos;s Included
                  </div>
                  <div className="space-y-3">
                    {[
                      "Equipment sourcing from leading Chinese brands",
                      "Factory-to-port logistics coordination",
                      "Installation guide & layout drawings",
                      "Remote technician training sessions",
                      "12-month spare parts warranty on tooling",
                      "Ongoing WhatsApp support channel",
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-accent text-[10px] font-black">
                            ✓
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-light">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Quote Form */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="glass rounded-[2rem] p-8 md:p-12">
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2">
                  Tell Us About Your Facility
                </h2>
                <p className="text-gray-400 text-xs font-light mb-10">
                  Complete the form below and our infrastructure team will
                  prepare a detailed equipment list and CIF quote within 48
                  hours.
                </p>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(
                      "Quote request submitted. Our infrastructure team will respond within 48 hours."
                    );
                  }}
                >
                  {/* Service Tier */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Target Service Tier *
                    </h4>
                    <div className="grid gap-3">
                      {[
                        {
                          value: "essential",
                          label: "Essential — 1-Bay Workshop",
                          desc: "Basic diagnostics and maintenance",
                        },
                        {
                          value: "professional",
                          label: "Professional — 3-Bay Workshop",
                          desc: "Full diagnostics, alignment, HV tools",
                        },
                        {
                          value: "master",
                          label: "Master — 5+ Bay Facility",
                          desc: "Complete EV service centre with battery station",
                        },
                      ].map((tier, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="radio"
                            name="tier"
                            value={tier.value}
                            className="hidden peer"
                            defaultChecked={i === 1}
                          />
                          <span className="w-5 h-5 rounded-full border-2 border-white/20 flex items-center justify-center flex-shrink-0 transition-all peer-checked:border-gold">
                            <span className="w-2.5 h-2.5 rounded-full bg-gold opacity-0 peer-checked:opacity-100 transition-opacity" />
                          </span>
                          <div>
                            <div className="text-sm text-white font-semibold">
                              {tier.label}
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              {tier.desc}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Facility Details */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Facility Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Workshop Size (m²) *
                        </label>
                        <select
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select size...
                          </option>
                          <option value="under-100">Under 100 m²</option>
                          <option value="100-200">100 – 200 m²</option>
                          <option value="200-500">200 – 500 m²</option>
                          <option value="500-plus">500 m² +</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Target Monthly Vehicles *
                        </label>
                        <select
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select volume...
                          </option>
                          <option value="1-10">1 – 10 vehicles</option>
                          <option value="10-30">10 – 30 vehicles</option>
                          <option value="30-100">30 – 100 vehicles</option>
                          <option value="100-plus">100+ vehicles</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Power Supply (3-Phase?)
                        </label>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select...
                          </option>
                          <option value="3phase-available">
                            3-Phase Available
                          </option>
                          <option value="single-phase">
                            Single Phase Only
                          </option>
                          <option value="unknown">Not Sure Yet</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Existing Technician Count
                        </label>
                        <select
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select...
                          </option>
                          <option value="0">0 — Starting from scratch</option>
                          <option value="1-3">1 – 3 technicians</option>
                          <option value="4-10">4 – 10 technicians</option>
                          <option value="10-plus">10+ technicians</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Equipment Preferences */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Equipment Preferences
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          name: "EV Battery SoH Diagnostic Station",
                          desc: "Reads battery health, cell balance, and degradation",
                          price: "From $3,500",
                        },
                        {
                          name: "4-Post Alignment Lift (5 Ton)",
                          desc: "EV-rated, with rolling jack bridge",
                          price: "From $4,200",
                        },
                        {
                          name: "Multi-Brand OBD2 Scanner Suite",
                          desc: "Covers BYD, GAC, Geely, Wuling diagnostics",
                          price: "From $2,800",
                        },
                        {
                          name: "HV Insulation Tester & Safety Kit",
                          desc: "CAT III 1000V rated, gloves + rescue hook",
                          price: "From $950",
                        },
                        {
                          name: "Wheel Balancer & Tyre Changer",
                          desc: "Automatic, fits 10\"–24\" rims",
                          price: "From $3,200",
                        },
                        {
                          name: "Technician Onboarding Package",
                          desc: "Remote training + bilingual manuals",
                          price: "From $1,500",
                        },
                      ].map((equip, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="checkbox"
                            className="hidden peer"
                            defaultChecked={i < 4}
                          />
                          <span className="w-5 h-5 border-2 border-white/20 rounded flex items-center justify-center flex-shrink-0 transition-all peer-checked:bg-gold peer-checked:border-gold">
                            <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
                              ✓
                            </span>
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-white font-semibold">
                              {equip.name}
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              {equip.desc}
                            </div>
                          </div>
                          <span className="text-xs font-bold text-theme w-24 text-right">
                            {equip.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Your Contact Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Company *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="Autos Africa Ltd."
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Country / Market *
                        </label>
                        <select
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select destination...
                          </option>
                          <option value="kenya">Kenya</option>
                          <option value="tanzania">Tanzania</option>
                          <option value="uganda">Uganda</option>
                          <option value="nigeria">Nigeria</option>
                          <option value="ghana">Ghana</option>
                          <option value="ethiopia">Ethiopia</option>
                          <option value="rwanda">Rwanda</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      Additional Requirements
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                      placeholder="e.g., Need spray booth, specific brand preference, timeline constraints..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic"
                    style={{
                      boxShadow: "0 0 40px -10px rgba(197,160,89,0.5)",
                    }}
                  >
                    Request Setup Quote →
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-gray-600 mt-3">
                    You will receive a detailed equipment list and CIF quote
                    within 48 hours.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* CTA Banner */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Workshop"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="label label-gold justify-center mb-4">
              Prefer to Talk?
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">
              Discuss your facility needs directly.
            </h3>
            <p className="text-gray-400 text-sm font-light mb-8">
              Our infrastructure specialists can advise on workshop layout,
              power requirements, and local compliance for your market.
            </p>
            <Link
              href="/contact"
              className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
            >
              Contact Infrastructure Team →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
