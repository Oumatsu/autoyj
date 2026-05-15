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
                "linear-gradient(to top, var(--color-bg) 0%, transparent 40%)",
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
                modules: "5 Modules",
                level: "All Levels",
                levelCls: "bg-white/5 text-white border border-white/10",
                img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80",
              },
              {
                num: "04",
                title: "Battery Maintenance & Safety Protocols",
                desc: "High-voltage safety, thermal management, and diagnostic tools. Essential for any service centre handling Chinese EVs.",
                modules: "6 Modules",
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
                modules: "8 Modules",
                level: "Advanced",
                levelCls: "bg-red-500/10 text-red-400 border border-red-500/30",
                img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=600&q=80",
              },
            ].map((course, i) => (
              <div
                key={i}
                className="glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 group cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={course.img}
                    alt={course.title}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                  <div className="absolute top-4 left-4">
                    <span className="text-[10px] font-black px-3 py-1.5 rounded-full bg-black/60 text-white uppercase tracking-wider">
                      {course.modules}
                    </span>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                      Course {course.num}
                    </span>
                    <span
                      className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${course.levelCls}`}
                    >
                      {course.level}
                    </span>
                  </div>
                  <h3 className="text-lg font-black italic text-white uppercase tracking-tight mb-3">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-xs font-light leading-relaxed mb-6">
                    {course.desc}
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    Enroll Now(Not open yet) →
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=2000&q=80"
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
                Partner Exclusive
              </div>
              <h2
                className="sh mb-6"
                style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)" }}
              >
                Full <span className="text-accent">Curriculum</span> Access.
              </h2>
              <p className="text-gray-500 text-lg font-light italic mb-10 max-w-lg mx-auto">
                Active dealer partners receive complimentary access to all
                Academy courses and certification tracks.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/contact"
                  className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg"
                >
                  Become a Partner
                </Link>
                <a
                  href="https://wa.me/qr/F7M2RQADCE3KN1"
                  className="btn-outline px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic"
                >
                  WhatsApp Inquiry
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
