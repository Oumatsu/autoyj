import Link from "next/link";

export default function AcademyPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.85)" }}
            alt="Academy"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-mid) 0%, var(--color-mid) 12%, transparent 45%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 text-center pt-16">
          <div className="label justify-center mb-6">
            Knowledge Transfer
          </div>
          <h1
            className="sh mb-6"
            style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)" }}
          >
            The <span className="text-theme">Academy</span>.
          </h1>
          <p className="text-gray-300 text-lg font-light italic max-w-2xl mx-auto leading-relaxed">
            Empowering African dealers with the technical knowledge to sell,
            service, and scale electric vehicle operations.
          </p>
        </div>
      </section>

      {/* Article Categories */}
      <section className="py-16 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-12">
            <div className="label justify-center mb-3">Browse by Topic</div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-white">Article <span className="text-theme">Library</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <Link href="/academy/ev-fundamentals" className="glass rounded-[2rem] p-10 text-center hover:border-green/40 transition-all duration-300 group relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: "rgba(16,185,129,.15)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3 className="text-white font-black uppercase tracking-wider text-sm mb-3 group-hover:text-accent transition-colors">EV Fundamentals</h3>
                <p className="text-gray-300 text-xs font-light mb-5">Core technology and concepts for sales teams</p>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">3 Articles</span>
              </div>
            </Link>
            <Link href="/academy/dealer-playbook" className="glass rounded-[2rem] p-10 text-center hover:border-theme/40 transition-all duration-300 group relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: "rgba(197,160,89,.15)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="var(--color-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <h3 className="text-white font-black uppercase tracking-wider text-sm mb-3 group-hover:text-theme transition-colors">Dealer Playbook</h3>
                <p className="text-gray-300 text-xs font-light mb-5">Sales techniques, objection handling, TCO</p>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">3 Articles</span>
              </div>
            </Link>
            <Link href="/academy/technical-workshop" className="glass rounded-[2rem] p-10 text-center hover:border-red-400/40 transition-all duration-300 group relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
              <div className="relative z-10">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl" style={{ background: "rgba(239,68,68,.15)" }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </div>
                <h3 className="text-white font-black uppercase tracking-wider text-sm mb-3 group-hover:text-red-400 transition-colors">Technical Workshop</h3>
                <p className="text-gray-300 text-xs font-light mb-5">Diagnostics, safety, and fault patterns</p>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-400">6 Articles</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="py-24 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                num: "01",
                title: "EV Fundamentals for Sales Teams",
                desc: "Master the core technology: LFP vs NMC batteries, motor types, charging standards, and how to explain range anxiety to customers.",
                modules: "4 Modules",
                level: "Beginner",
                levelCls: "bg-accent/10 text-accent border border-accent/30",
                img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80",
              },
              {
                num: "02",
                title: "China EV Export Compliance & Documentation",
                desc: "Navigate the paperwork: Certificate of Origin, battery safety certifications, and customs clearance for African ports.",
                modules: "3 Modules",
                level: "Intermediate",
                levelCls: "bg-theme/10 text-theme border border-theme/30",
                img: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=600&q=80",
              },
              {
                num: "03",
                title: "Dealership Digital Marketing Playbook",
                desc: "Launch your EV showroom online: Facebook ad templates, WhatsApp Business automation, and local SEO for African markets.",
                modules: "4 Modules",
                level: "All Levels",
                levelCls: "bg-white/5 text-white border border-white/10",
                img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
              },
              {
                num: "04",
                title: "Battery Maintenance & Safety Protocols",
                desc: "High-voltage safety, thermal management, and diagnostic tools. Essential for any service centre handling Chinese EVs.",
                modules: "3 Modules",
                level: "Advanced",
                levelCls: "bg-red-500/10 text-red-400 border border-red-500/30",
                img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/academy/DIY-Battery-Maintenance-Tips-and-Safety-Precautions.jpg",
              },
              {
                num: "05",
                title: "Fleet TCO Calculator Masterclass",
                desc: "Build compelling ROI proposals for corporate clients. Compare ICE vs EV total cost of ownership with real African fuel and electricity data.",
                modules: "2 Modules",
                level: "Intermediate",
                levelCls: "bg-theme/10 text-theme border border-theme/30",
                img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
              },
              {
                num: "06",
                title: "After-Sales Service Centre Setup Guide",
                desc: "Step-by-step blueprint: equipment procurement, technician training, parts inventory management, and warranty claim processes.",
                modules: "4 Modules",
                level: "Advanced",
                levelCls: "bg-red-500/10 text-red-400 border border-red-500/30",
                img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80",
              },
            ].map((course, i) => {
              const courseHref = i === 0 ? "/academy/course-1" : i === 1 ? "/academy/course-2" : i === 2 ? "/academy/course-3" : i === 3 ? "/academy/course-4" : i === 4 ? "/academy/course-5" : i === 5 ? "/academy/course-6" : null;
              const isOpen = courseHref !== null;
              return isOpen ? (
                <Link key={i} href={courseHref!} className="glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 group block">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-black/60 text-white uppercase tracking-wider">{course.modules}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Course {course.num}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${course.levelCls}`}>{course.level}</span>
                    </div>
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tight mb-3">{course.title}</h3>
                    <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">{course.desc}</p>
                    <span className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest group-hover:text-white transition">Enroll Now →</span>
                  </div>
                </Link>
              ) : (
                <div key={i} className="glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 group cursor-pointer">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                    <div className="absolute top-4 left-4">
                      <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-black/60 text-white uppercase tracking-wider">{course.modules}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Course {course.num}</span>
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${course.levelCls}`}>{course.level}</span>
                    </div>
                    <h3 className="text-lg font-black italic text-white uppercase tracking-tight mb-3">{course.title}</h3>
                    <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">{course.desc}</p>
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">Coming Soon</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
