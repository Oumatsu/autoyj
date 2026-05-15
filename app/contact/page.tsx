"use client";

export default function ContactPage() {
  return (
    <main className="pt-32 pb-24 relative z-10 min-h-screen flex items-center bg-a">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          {/* Left Column */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full">
            <div>
              <div className="label label-gold mb-6">Initiate Partnership</div>
              <h1 className="sh mb-6 leading-tight">
                The <span className="text-theme">Deal</span>{" "}
                <span className="text-accent">Room</span>.
              </h1>
              <p
                className="text-gray-400 text-lg font-light leading-relaxed mb-12 border-l-2 border-theme/30 pl-5"
                style={{ borderColor: "rgba(197,160,89,.3)" }}
              >
                Direct access to our Shanghai procurement desk. Submit your
                fleet requirements below for a curated wholesale matrix, or
                connect immediately via our priority channels.
              </p>

              <div className="space-y-4 mb-16">
                <a
                  href="https://wa.me/qr/F7M2RQADCE3KN1"
                  className="contact-card group flex items-center gap-4 p-6 rounded-2xl border border-white/5 hover:border-gold transition-all duration-300 hover:translate-x-1"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="contact-icon w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gold group-hover:bg-green group-hover:text-black transition-all">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-green mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />{" "}
                      Priority Channel
                    </div>
                    <div className="text-white font-bold group-hover:text-green transition-colors">
                      WhatsApp Business
                    </div>
                    <div className="text-xs text-gray-500 font-light mt-1">
                      Average response: 15 mins
                    </div>
                  </div>
                </a>

                <a
                  href="mailto:sales@autoyj.com"
                  className="contact-card group flex items-center gap-4 p-6 rounded-2xl border border-white/5 hover:border-gold transition-all duration-300 hover:translate-x-1"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div className="contact-icon w-12 h-12 rounded-full flex items-center justify-center bg-white/5 text-gold group-hover:bg-gold group-hover:text-black transition-all">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                      Official Desk
                    </div>
                    <div className="text-white font-bold">
                      sales@autoyj.com
                    </div>
                    <div className="text-xs text-gray-500 font-light mt-1">
                      For official RFQs and L/C inquiries
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                    Headquarters
                  </div>
                  <div className="text-sm text-gray-300 font-semibold mb-1">
                    Shanghai, China
                  </div>
                  <div className="text-xs text-gray-500 font-light">
                    Global Export & Logistics Hub
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-gray-600 mb-2">
                    SLA Guarantee
                  </div>
                  <div className="text-sm text-theme font-semibold mb-1">
                    Strict 30/70 T/T
                  </div>
                  <div className="text-xs text-gray-500 font-light">
                    Secure, global banking standards
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-7">
            <div className="glass rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-10 relative z-10">
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-2">
                  Dealer Application
                </h3>
                <p className="text-gray-400 text-xs font-light">
                  Fill out the parameters below to receive a curated matrix of
                  available inventory and wholesale pricing.
                </p>
              </div>

              <form
                className="space-y-6 relative z-10"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(
                    "Form submission simulation. In production, this connects to your backend/CRM."
                  );
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input w-full"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      Company / Dealership *
                    </label>
                    <input
                      type="text"
                      required
                      className="form-input w-full"
                      placeholder="Autos Africa Ltd."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      className="form-input w-full"
                      placeholder="+254 700 000 000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                      Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="form-input w-full"
                      placeholder="john@company.com"
                    />
                  </div>
                </div>

                <div className="py-2 border-b border-white/5" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 ml-1">
                      Target Market *
                    </label>
                    <select required className="form-input w-full">
                      <option value="" disabled selected>
                        Select Destination...
                      </option>
                      <option value="east-africa">
                        East Africa (Kenya, Tanzania, etc.)
                      </option>
                      <option value="west-africa">
                        West Africa (Nigeria, Ghana, etc.)
                      </option>
                      <option value="south-africa">Southern Africa</option>
                      <option value="north-africa">North Africa</option>
                      <option value="other">Other Region</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 ml-1">
                      Estimated Monthly Volume *
                    </label>
                    <select required className="form-input w-full">
                      <option value="" disabled selected>
                        Select Volume...
                      </option>
                      <option value="1-3">
                        1 - 3 Units (Trial / Initial Order)
                      </option>
                      <option value="4-9">
                        4 - 9 Units (1x40HQ Container)
                      </option>
                      <option value="10-20">
                        10 - 20 Units (Fleet Setup)
                      </option>
                      <option value="20+">20+ Units (Master Dealer)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gold mb-2 ml-1">
                    Primary Interest *
                  </label>
                  <select required className="form-input w-full">
                    <option value="" disabled selected>
                      Select Vehicle Category...
                    </option>
                    <option value="revenue-king">
                      Revenue King Matrix (Ride-hailing/Budget)
                    </option>
                    <option value="elite">
                      Elite Flagship (Premium SUV/Sedan)
                    </option>
                    <option value="utility">
                      Utility Pro (Vans/Pickups)
                    </option>
                    <option value="parts">
                      Starter Parts Kit & Maintenance Only
                    </option>
                    <option value="mixed">Mixed Container Strategy</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 ml-1">
                    Specific Requirements or Models
                  </label>
                  <textarea
                    rows={4}
                    className="form-input w-full resize-none"
                    placeholder="e.g., Interested in BYD Seagull LHD, must include home chargers..."
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic"
                    style={{
                      boxShadow: "0 0 40px -10px rgba(197,160,89,0.5)",
                    }}
                  >
                    Submit Deal Application
                  </button>
                  <p className="text-center text-[9px] font-black uppercase tracking-widest text-gray-600 mt-4">
                    Your data is secure. We never share dealer metrics.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
