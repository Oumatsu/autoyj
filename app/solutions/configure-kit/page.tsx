"use client";

import Link from "next/link";

export default function ConfigureKitPage() {
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
                href="/solutions#parts"
                className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition"
              >
                Starter Parts Kit
              </Link>
              <span className="text-gray-600">/</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                Configure
              </span>
            </div>
            <h1
              className="sh mb-6"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              Configure Your{" "}
              <span className="text-accent">Starter Parts Kit</span>.
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 border-accent/30 pl-6 leading-relaxed max-w-2xl">
              Tailor a maintenance bundle to your exact fleet models. Ship
              inside the vehicle — zero wasted container space.
            </p>
          </div>
        </div>
      </section>

      <main className="py-12 bg-b relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-start">
            {/* Kit Preview Sidebar */}
            <aside className="lg:col-span-5 order-2 lg:order-1">
              <div className="sticky top-[120px]">
                <div className="glass rounded-[2rem] p-8 md:p-10 border-theme/20">
                  <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-6">
                    Your Kit Preview
                  </div>
                  <div className="space-y-4 mb-8">
                    {[
                      { name: "Brake Pads (Full Set)", qty: "× 2", price: "$120" },
                      { name: "HEPA Cabin Filters", qty: "× 4", price: "$48" },
                      { name: "Wiper Blade Sets", qty: "× 2", price: "$36" },
                      { name: "Auxiliary 12V Battery", qty: "× 1", price: "$85" },
                      { name: "Charging Cable (Type 2)", qty: "× 1", price: "$180" },
                      { name: "OBD2 Diagnostic Tool", qty: "× 1", price: "$245" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between border-b border-white/5 pb-2"
                      >
                        <span className="text-sm text-gray-400 font-light">
                          {item.name}
                        </span>
                        <div className="flex gap-4 items-center">
                          <span className="text-xs font-black text-theme">
                            {item.qty}
                          </span>
                          <span className="text-xs text-gray-500 w-14 text-right">
                            {item.price}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/10 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest text-white">
                        Estimated Total
                      </span>
                      <div className="text-right">
                        <div className="text-xl font-black text-theme">
                          $714
                        </div>
                        <span className="text-[9px] text-gray-500">
                          per vehicle kit
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-accent/5 border border-accent/10">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-accent text-xs font-black">!</span>
                      </div>
                      <p className="text-xs text-gray-400 font-light leading-relaxed">
                        Kits are packed inside each vehicle at no extra
                        shipping cost. Customs classification: auto parts
                        (HS 8708) — most markets offer duty-free or
                        reduced-rate clearance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Configuration Form */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="glass rounded-[2rem] p-8 md:p-12">
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2">
                  Build Your Fleet Kit
                </h2>
                <p className="text-gray-400 text-xs font-light mb-10">
                  Select your vehicle models and configure the maintenance
                  bundle for each one.
                </p>

                <form
                  className="space-y-6"
                  onSubmit={(e) => {
                    e.preventDefault();
                    alert(
                      "Kit configuration submitted. Our team will reach out within 24 hours."
                    );
                  }}
                >
                  {/* Vehicle Selection */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Select Vehicle Models
                    </h4>
                    <div className="grid gap-3">
                      {[
                        { brand: "BYD", model: "Seagull Flying", qty: 2 },
                        { brand: "GAC Motor", model: "Aion Y Plus", qty: 1 },
                      ].map((v, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5"
                        >
                          <div className="flex-1">
                            <div className="text-xs font-black uppercase text-white">
                              {v.brand}
                            </div>
                            <div className="text-xs text-gray-400 font-light">
                              {v.model}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase text-gray-500">
                              Qty
                            </span>
                            <input
                              type="number"
                              defaultValue={v.qty}
                              min={1}
                              max={20}
                              className="w-16 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white text-center focus:border-gold outline-none transition-colors"
                            />
                          </div>
                          <button
                            type="button"
                            className="text-gray-600 hover:text-red-400 transition-colors text-lg"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-3 text-[10px] font-black uppercase tracking-widest text-gold hover:text-white transition-colors flex items-center gap-1"
                    >
                      + Add Vehicle Model
                    </button>
                  </div>

                  {/* Parts Selection */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Maintenance Parts
                    </h4>
                    <div className="space-y-3">
                      {[
                        {
                          name: "Brake Pads (Full Axle Set)",
                          desc: "Ceramic compound, OEM-spec",
                          price: "$120",
                        },
                        {
                          name: "HEPA Cabin Filter Set",
                          desc: "PM2.5 filtration, 4-pack",
                          price: "$48",
                        },
                        {
                          name: "Wiper Blade Set (Front + Rear)",
                          desc: "Aero beam design, all-season",
                          price: "$36",
                        },
                        {
                          name: "Auxiliary 12V Battery",
                          desc: "AGM deep-cycle, maintenance-free",
                          price: "$85",
                        },
                        {
                          name: "Charging Cable (Type 2, 7.4 kW)",
                          desc: "5-metre, IP55 weatherproof",
                          price: "$180",
                        },
                        {
                          name: "OBD2 Multi-Brand Diagnostic Tool",
                          desc: "EV battery SoH reader included",
                          price: "$245",
                        },
                      ].map((part, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="checkbox"
                            className="hidden peer"
                            defaultChecked={
                              part.name !== "Charging Cable (Type 2, 7.4 kW)"
                            }
                          />
                          <span className="w-5 h-5 border-2 border-white/20 rounded flex items-center justify-center flex-shrink-0 transition-all peer-checked:bg-gold peer-checked:border-gold">
                            <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
                              ✓
                            </span>
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-white font-semibold">
                              {part.name}
                            </div>
                            <div className="text-xs text-gray-500 font-light">
                              {part.desc}
                            </div>
                          </div>
                          <span className="text-sm font-black text-theme w-16 text-right">
                            {part.price}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Optional Add-Ons */}
                  <div className="border-b border-white/5 pb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 mb-5">
                      Optional Add-Ons
                    </h4>
                    <div className="space-y-3">
                      {[
                        { name: "Tyre Pressure Monitoring Sensors", price: "$42" },
                        { name: "Portable EVSE Charger (3.3 kW)", price: "$160" },
                        { name: "Emergency HV Safety Kit (Gloves + Tester)", price: "$95" },
                      ].map((addon, i) => (
                        <label
                          key={i}
                          className="flex items-center gap-4 p-4 rounded-2xl bg-black/20 border border-white/5 cursor-pointer hover:border-gold/30 transition-all"
                        >
                          <input
                            type="checkbox"
                            className="hidden peer"
                          />
                          <span className="w-5 h-5 border-2 border-white/20 rounded flex items-center justify-center flex-shrink-0 transition-all peer-checked:bg-gold peer-checked:border-gold">
                            <span className="text-black text-[10px] font-black opacity-0 peer-checked:opacity-100 transition-opacity">
                              ✓
                            </span>
                          </span>
                          <div className="flex-1">
                            <div className="text-sm text-gray-300">
                              {addon.name}
                            </div>
                          </div>
                          <span className="text-sm font-medium text-gray-400 w-16 text-right">
                            {addon.price}
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
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="john@company.com"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                          WhatsApp *
                        </label>
                        <input
                          type="tel"
                          required
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors"
                          placeholder="+254 700 000 000"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      Special Requirements
                    </label>
                    <textarea
                      rows={3}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-gold outline-none transition-colors resize-none"
                      placeholder="e.g., Need RHD brake pads, specific tyre brands..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic"
                    style={{
                      boxShadow: "0 0 40px -10px rgba(197,160,89,0.5)",
                    }}
                  >
                    Submit Kit Configuration →
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-gray-600 mt-3">
                    You will receive a detailed quote within 24 hours.
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
            src="https://images.unsplash.com/photo-1520038410233-7141be7e6f97?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Logistics"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="label label-gold justify-center mb-4">
              Need Help?
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic mb-4">
              Not sure which parts you need?
            </h3>
            <p className="text-gray-400 text-sm font-light mb-8">
              Our procurement specialists can build a kit based on your fleet
              size, vehicle models, and target market conditions.
            </p>
            <Link
              href="/contact"
              className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
            >
              Talk to a Specialist →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
