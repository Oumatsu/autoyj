import Link from "next/link";
import { vehicles as revenueVehicles } from "./revenue-king/data";
import { vehicles as eliteVehicles } from "./elite-flagship/data";
import { vehicles as utilityVehicles } from "./utility-pro/data";

export default function ProductsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://6a0327d1fc46b5b25f3480d6.imgix.net/Our-solutions-durability-and-fatigue.avif"
            className="w-full h-full object-cover"
            style={{ filter: "contrast(1.1)" }}
            alt="Curated Selection Background"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0, 0, 0, 0.45)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-bg) 0%, transparent 40%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 text-center pt-16">
          <div className="label justify-center mb-6">
            Expertly Curated Selection
          </div>
          <h1
            className="sh mb-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            Proven <span className="text-theme">Market</span>
            <br />
            <span className="text-accent">Champions</span>.
          </h1>
          <p className="text-gray-300 text-lg font-light italic max-w-2xl mx-auto leading-relaxed">
            The world&apos;s best-selling electric vehicles, hand-picked by
            expert buyers for their reliability, durability, and proven
            performance on African roads.
          </p>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-24 bg-a overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          {/* Category 01: Revenue King */}
          <div id="cat-01" className="mb-40 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label mb-4">Category 01</div>
                <h2
                  className="sh mb-4"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  Revenue <span className="text-accent">King</span>.
                </h2>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  The highest-ROI EVs for ride-hailing fleets and network taxis.
                  Built for volume, durability, and maximum fuel-to-electric
                  savings.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="w-8 h-px bg-white/10" />
                Avg. Monthly Saving: $280
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  name: "BYD Seagull",
                  badge: "Global #1",
                  badgeCls: "bg-gold text-black",
                  saving: "Save $250/mo",
                  tags: ["LFP Blade", "405km Range"],
                  img: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=800&q=80",
                  link: "/products/byd-seagull",
                },
                {
                  name: "GAC Aion RT",
                  badge: "2025 New King",
                  badgeCls: "bg-accent/20 text-accent border border-accent/30",
                  saving: "Save $380/mo",
                  tags: ["LiDAR ADAS", "520km Range"],
                  img: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80",
                  link: null,
                },
                {
                  name: "BYD Qin PLUS",
                  badge: null,
                  badgeCls: "",
                  saving: "Save $350/mo",
                  tags: ["Million-Unit Proof", "510km Range"],
                  img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/2qin-plus-ev-p.webp",
                  link: null,
                },
                {
                  name: "Galaxy E5",
                  badge: "Global Model",
                  badgeCls: "bg-white/5 text-gray-500 border border-white/10",
                  saving: "Save $220/mo",
                  tags: ["Aegis Battery", "530km Range"],
                  img: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80",
                  link: null,
                },
              ].map((car, i) => {
                const CardContent = (
                  <div className="group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-500 cursor-pointer">
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img
                        src={car.img}
                        alt={car.name}
                        className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                      {car.badge && (
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <span
                            className={`text-[8px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wider ${car.badgeCls}`}
                          >
                            {car.badge}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
                          {car.saving}
                        </div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
                          {car.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {car.tags.map((tag, j) => (
                          <span
                            key={j}
                            className="text-[8px] font-black px-2 py-1 rounded bg-white/5 text-gray-500 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] font-black text-theme uppercase tracking-widest flex items-center gap-2">
                        {car.link
                          ? "View Matrix Analysis →"
                          : "Details Coming Soon"}
                      </div>
                    </div>
                  </div>
                );

                return car.link ? (
                  <Link key={i} href={car.link}>
                    {CardContent}
                  </Link>
                ) : (
                  <div key={i}>{CardContent}</div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <Link
                href="/products/revenue-king"
                className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-accent/40 transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                  Discover Full Revenue Matrix ({revenueVehicles.length}+ Models)
                </span>
                <span className="w-6 h-px bg-white/10 group-hover:bg-accent/50 transition-all" />
                <span className="text-accent group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Category 02: Elite Flagship */}
          <div id="cat-02" className="mb-40 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label label-gold mb-4">Category 02</div>
                <h2
                  className="sh mb-4"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  Elite <span className="text-theme">Flagship</span>.
                </h2>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  Top-tier luxury and high-tech intelligence. The social
                  currency for government, corporate, and premium private
                  markets.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="w-8 h-px bg-white/10" />
                Avg. Monthly Saving: $500+
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* AITO M9 - Large Card */}
              <div className="group relative bg-bg3/30 rounded-[3rem] overflow-hidden border border-white/5 hover:border-theme/30 transition-all duration-500 cursor-pointer col-span-1 lg:col-span-2">
                <div className="aspect-[21/9] overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80"
                    alt="AITO M9"
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                    <div className="label label-gold mb-4">
                      The Tech Pinnacle
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
                      AITO M9
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base font-light italic max-w-md leading-relaxed mb-8">
                      Huawei&apos;s ADS 3.0 tech masterpiece. Executive
                      projection headlights and the most advanced chassis in the
                      industry.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="px-6 py-3 rounded-full bg-theme text-black text-[10px] font-black uppercase tracking-widest">
                        Performance King
                      </div>
                      <div className="px-6 py-3 rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                        Save $500+/mo
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {[
                {
                  name: "Zeekr 001",
                  tag: "800V Ultra-Fast Charge",
                  desc: "Extreme handling and range. The fastest charging executive shooting brake in the market.",
                  label: "Tech Icon",
                  img: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?auto=format&fit=crop&w=800&q=80",
                },
                {
                  name: "Xiaomi SU7 Ultra",
                  tag: "1500+ Horsepower",
                  desc: "The ultimate social currency for tech-elite buyers. Carbon-fiber aero with peak acceleration.",
                  label: "Performance Icon",
                  img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
                },
              ].map((car, i) => (
                <div
                  key={i}
                  className="group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-theme/30 transition-all duration-500 cursor-pointer"
                >
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="text-[9px] font-black text-theme uppercase tracking-[0.2em] mb-1">
                        {car.tag}
                      </div>
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                        {car.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">
                      {car.desc}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="text-[10px] font-black text-theme uppercase tracking-widest">
                        {car.label}
                      </div>
                      <div className="text-[10px] font-black text-gray-600 uppercase">
                        Details Coming Soon
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/products/elite-flagship"
                className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-theme/40 transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                  Discover Full Elite Series ({eliteVehicles.length}+ Models)
                </span>
                <span className="w-6 h-px bg-white/10 group-hover:bg-theme/50 transition-all" />
                <span className="text-theme group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>

          {/* Category 03: Utility Pro */}
          <div id="cat-03" className="mb-24 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label mb-4">Category 03</div>
                <h2
                  className="sh mb-4"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  Utility <span className="text-accent">Pro</span>.
                </h2>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  Extreme productivity workhorses. From off-road pickups to
                  digital cargo vans, built for all-terrain business.
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="w-8 h-px bg-white/10" />
                Fuel Saving: 50% - 80%
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[
                {
                  name: "BYD Shark",
                  tag: "V2L Mobile Power",
                  desc: "PHEV Pickup with DMO off-road platform. 1000km+ total range for the hardest jobs.",
                  label: "Hybrid Power",
                  sub: "Pickup Pro",
                  img: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80",
                },
                {
                  name: "Radar RD6",
                  tag: "SUV Comfort Pickup",
                  desc: "Pure electric efficiency for urban logistics and farms. 6kW external discharge capacity.",
                  label: "Production Power",
                  sub: "Eco Logistics",
                  img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80",
                },
                {
                  name: "Super Van",
                  tag: "Digital Logistics",
                  desc: "The future of city cargo. Steer-by-wire with flat-floor cargo optimization for 11m³+ volume.",
                  label: "Digital Cargo",
                  sub: "Next-Gen Van",
                  img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/b499683c8d996730819daad124c318ee.jpeg",
                },
              ].map((car, i) => (
                <div
                  key={i}
                  className="group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-500 cursor-pointer"
                >
                  <div className="aspect-[16/9] overflow-hidden relative">
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
                        {car.tag}
                      </div>
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                        {car.name}
                      </h3>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">
                      {car.desc}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="text-[10px] font-black text-accent uppercase tracking-widest">
                        {car.label}
                      </div>
                      <div className="text-[10px] font-black text-gray-600 uppercase italic">
                        {car.sub}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <Link
                href="/products/utility-pro"
                className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-accent/40 transition-all"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                  Discover Full Utility Matrix ({utilityVehicles.length}+ Models)
                </span>
                <span className="w-6 h-px bg-white/10 group-hover:bg-accent/50 transition-all" />
                <span className="text-accent group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80"
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
                Market-Ready Inventory
              </div>
              <h2
                className="sh mb-6"
                style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)" }}
              >
                Secure Your <span className="text-accent">Batch</span> FOB
                <br />
                <span className="text-theme">Pricing</span> Now.
              </h2>
              <p className="text-gray-500 text-lg font-light italic mb-10 max-w-lg mx-auto">
                We respond to all professional batch inquiries with current
                factory lead times and FOB quotes within 2 hours.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://wa.me/your-number"
                  className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg"
                >
                  WhatsApp Batch Inquiry
                </a>
                <Link
                  href="/contact"
                  className="glass px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic text-white hover:bg-white/5 transition"
                >
                  Request Full Catalog PDF
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
