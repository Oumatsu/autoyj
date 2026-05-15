import Link from "next/link";

export function Footer() {
  return (
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
          style={{ background: "rgba(10,10,10,.45)" }}
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
            Start the Conversation
          </div>
          <h2
            className="sh mb-6"
            style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)" }}
          >
            The <span className="text-accent">Green</span>{" "}
            <span className="text-theme">Empire</span>
            <br />
            Starts Here.
          </h2>
          <p className="text-gray-500 text-lg font-light italic mb-10 max-w-lg mx-auto">
            Response within 2 hours. No commitment required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://wa.me/qr/F7M2RQADCE3KN1"
              className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg"
            >
              WhatsApp Us Now
            </a>
            <a
              href="mailto:alan@youguard.cn"
              className="btn-outline px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic"
            >
              Send an Enquiry
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10" id="contact">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,.96) 0%, rgba(0,0,0,.82) 45%, rgba(0,0,0,.5) 75%, transparent 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-6 md:px-12 py-16">
          <div className="grid md:grid-cols-4 gap-10 mb-14">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div
                  className="w-8 h-8 rounded flex items-center justify-center font-black italic text-black"
                  style={{
                    background: "linear-gradient(135deg,#D4AF37,#C5A059)",
                  }}
                >
                  A
                </div>
                <span className="text-base font-black tracking-tighter uppercase italic">
                    <span className="text-gray-400">auto</span><span className="text-theme">YJ</span>
                  </span>
              </div>
              <p className="text-gray-600 text-xs font-light leading-relaxed">
                China&apos;s trusted EV sourcing partner for African dealers.
                Expert-curated, transparently delivered.
              </p>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                Vehicles
              </div>
              <ul className="space-y-3 text-xs text-gray-600 font-light">
                <li>
                  <Link
                    href="/products/revenue-king"
                    className="hover:text-white transition"
                  >
                    Revenue King EVs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/elite-flagship"
                    className="hover:text-white transition"
                  >
                    Elite Flagship EVs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/products/utility-pro"
                    className="hover:text-white transition"
                  >
                    Utility Pro EVs
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="hover:text-theme transition"
                  >
                    Dealer Profit Estimate ↗
                  </Link>
                </li>
              </ul>
              <div className="text-[10px] font-black tracking-widest uppercase mb-3 mt-6 text-theme">
                Markets We Serve
              </div>
              <Link
                href="/markets/ethiopia"
                className="text-xs text-gray-600 hover:text-theme transition"
              >
                → Ethiopia Focus
              </Link>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                Solutions
              </div>
              <ul className="space-y-3 text-xs text-gray-600 font-light">
                <li>
                  <Link
                    href="/solutions"
                    className="hover:text-white transition"
                  >
                    PDI &amp; Quality
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solutions#parts"
                    className="hover:text-white transition"
                  >
                    Starter Parts Kit
                  </Link>
                </li>
                <li>
                  <Link
                    href="/solutions#marketing"
                    className="hover:text-white transition"
                  >
                    Marketing Assets
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition">
                    Custom Sourcing
                  </Link>
                </li>
              </ul>
              <div className="text-[10px] font-black tracking-widest uppercase mb-3 mt-6 text-theme">
                Markets We Serve
              </div>
              <Link
                href="/markets/ethiopia"
                className="text-xs text-gray-600 hover:text-theme transition"
              >
                → Ethiopia Focus
              </Link>
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                Resources
              </div>
              <ul className="space-y-3 text-xs text-gray-600 font-light mb-6">
                <li>
                  <Link href="/insights" className="hover:text-white transition">
                    Insights
                  </Link>
                </li>
                <li>
                  <Link
                    href="/academy"
                    className="hover:text-white transition text-accent"
                  >
                    EV Academy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#contact"
                    className="hover:text-white transition"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
              <div className="text-[10px] font-black tracking-widest uppercase mb-3 text-theme">
                Markets We Serve
              </div>
              <Link
                href="#"
                className="text-xs text-gray-600 hover:text-theme transition"
              >
                → Ethiopia
              </Link>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(197,160,89,.06)" }}
          >
            <p className="text-[9px] font-black tracking-[.4em] uppercase text-gray-700">
              © 2026 autoYJ Eco Supply Chain. All Rights Reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-[9px] font-black tracking-widest uppercase text-gray-700 hover:text-gray-500 transition"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-[9px] font-black tracking-widest uppercase text-gray-700 hover:text-gray-500 transition"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
