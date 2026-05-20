"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";

const tabSectionIds = ["hero", "fundamentals", "playbook", "workshop", "vault"];

const fundamentalsArticles = [
  {
    title: "High Altitude and Dust in Ethiopia: How They Affect Your EV",
    tag: "Battery Tech",
    slug: "high-altitude-dust-ethiopia-ev",
    desc: "Understanding how high altitude and dust affect EVs in Ethiopia is essential knowledge for any dealer or technician.",
    img: "https://images.unsplash.com/photo-1527853787696-f7be74f2e39a?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "EV Range Explained: Why the Spec Sheet Number Doesn't Apply in Africa",
    tag: "Infrastructure",
    slug: "ev-range-explained-africa",
    desc: "The range figure on a Chinese EV's spec sheet is not the range your customer will experience in Africa.",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "How EV Batteries Degrade: What African Dealers Need to Understand",
    tag: "TCO Analysis",
    slug: "how-ev-batteries-degrade",
    desc: "Battery degradation is the most common customer concern — and the most misunderstood by dealers.",
    img: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=800&q=80",
  },
];

const playbookArticles = [
  {
    title: "The 5 EV Objections Every African Dealer Will Face",
    tag: "Objection Handling",
    slug: "ev-objections-african-dealers",
    desc: "Battery life, charging, parts, resale, price — the five objections that account for most stalled EV deals.",
  },
  {
    title: "The TCO Conversation Guide: How to Win EV Sales on Total Cost",
    tag: "Fleet Pitch",
    slug: "tco-conversation-guide",
    desc: "The TCO conversation is the most powerful tool an EV dealer has in Africa.",
  },
  {
    title: "How to Run an EV Test Drive That Closes Deals",
    tag: "Showroom SOP",
    slug: "ev-test-drive-guide",
    desc: "A well-structured 20-minute drive converts more fence-sitters than any amount of objection handling.",
  },
];

const workshopArticles = [
  {
    title: "High Voltage Safety Rules for EV Technicians",
    tag: "High Voltage",
    slug: "high-voltage-safety-ev-technicians",
    desc: "The non-negotiable safety protocol for any workshop servicing Chinese EVs.",
    img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Chinese EV Diagnostic Tools: What Actually Works",
    tag: "Diagnostics",
    slug: "chinese-ev-diagnostic-tools",
    desc: "LAUNCH X431 vs AUTEL vs brand-specific — what to buy and what to skip.",
    img: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "The 12V Auxiliary Battery: Why It Fails, How to Fix It",
    tag: "Diagnostics",
    slug: "12v-auxiliary-battery-ev",
    desc: "The single most common cause of 'dead EV' complaints — and the easiest to fix.",
    img: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "EV Won't Charge: Troubleshooting Guide",
    tag: "Diagnostics",
    slug: "ev-wont-charge-troubleshooting",
    desc: "Most charging faults are caused by one of six root causes.",
    img: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Common Fault Patterns in Chinese EVs in Ethiopia",
    tag: "Field Reference",
    slug: "common-fault-patterns-ethiopia",
    desc: "Altitude, dust, grid instability — fault patterns that don't appear in OEM documentation.",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Voltage Fluctuation and EV Charging in Ethiopia",
    tag: "Field Reference",
    slug: "voltage-fluctuation-ev-charger-ethiopia",
    desc: "Grid voltage is one of the most underappreciated causes of EV charging faults.",
    img: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=800&q=80",
  },
];

const vaultItems = [
  {
    type: "Excel Model",
    title: "2026 Fleet ROI Calculator",
    desc: "Plug in local electricity rates and petrol prices to instantly generate a 5-year cost comparison for your commercial clients.",
  },
  {
    type: "PDF Checklist",
    title: "The 50-Point Factory PDI",
    desc: "The exact Pre-Delivery Inspection checklist our engineers use in Shanghai before loading your vehicles into the container.",
  },
  {
    type: "PDF Whitepaper",
    title: "Africa RHD Import Guide",
    desc: "A comprehensive breakdown of which Chinese factories are producing true Right-Hand Drive models and their export availability.",
  },
];

export default function AcademyPage() {
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const syncTabTop = useCallback(() => {
    const navbar = document.getElementById("navbar");
    const tabBar = tabBarRef.current;
    if (!tabBar || !navbar) return;
    tabBar.style.top = navbar.offsetHeight - 1 + "px";
  }, []);

  useEffect(() => {
    syncTabTop();
    const handleScroll = () => {
      syncTabTop();
      const hero = heroRef.current;
      const tabBar = tabBarRef.current;
      if (!hero || !tabBar) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      tabBar.classList.toggle("visible", heroBottom < window.innerHeight * 0.25);
      const mid = window.innerHeight * 0.45;
      let active: string | null = null;
      tabSectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.getBoundingClientRect().top <= mid) active = id;
      });
      setActiveId(active);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [syncTabTop]);

  const scrollTo = (targetId: string) => {
    const target = document.getElementById(targetId);
    const navbar = document.getElementById("navbar");
    const tabBar = tabBarRef.current;
    if (!target || !navbar || !tabBar) return;
    const offset = navbar.offsetHeight + tabBar.offsetHeight + 10;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <>
      {/* Section Tabs */}
      <div id="section-tabs" ref={tabBarRef} role="navigation" aria-label="Page sections">
        <div className="tab-inner">
          <button
            className={`tab-btn ${activeId === "hero" ? "active" : ""}`}
            onClick={() => scrollTo("hero")}
          >
            Intelligence Hub
          </button>
          <button
            className={`tab-btn ${activeId === "fundamentals" ? "active" : ""}`}
            onClick={() => scrollTo("fundamentals")}
          >
            ev-fundamentals
          </button>
          <button
            className={`tab-btn ${activeId === "playbook" ? "active" : ""}`}
            onClick={() => scrollTo("playbook")}
          >
            dealer-playbook
          </button>
          <button
            className={`tab-btn ${activeId === "workshop" ? "active" : ""}`}
            onClick={() => scrollTo("workshop")}
          >
            technical-workshop
          </button>
        </div>
      </div>

      {/* Hero */}
      <section
        id="hero"
        ref={heroRef}
        className="relative min-h-[70vh] flex items-center overflow-hidden scroll-mt-24"
      >
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "grayscale(40%)" }}
            alt="EV Tech"
          />
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.65)" }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-mid) 0%, var(--color-mid) 12%, rgba(28,28,28,0.5) 40%, transparent 55%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-32 pb-20 text-center">
          <div className="label justify-center mb-6">B2B Dealer Enablement</div>
          <h1
            className="sh mb-8"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          >
            The EV <span className="text-accent">Academy</span>.
          </h1>
          <p className="text-xl text-gray-400 font-light italic leading-relaxed max-w-2xl mx-auto mb-10">
            Master the transition from ICE to EV. Technical playbooks, sales SOPs, and maintenance
            blueprints designed exclusively for African dealerships.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollTo("vault")}
              className="btn-primary px-10 py-4 rounded-full text-xs font-black tracking-widest uppercase shadow-lg"
            >
              Access The Vault
            </button>
          </div>
        </div>
      </section>

      {/* EV Fundamentals */}
      <section id="fundamentals" className="py-24 bg-a scroll-mt-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
            <div>
              <div className="label mb-3">Module 01</div>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                EV <span className="text-theme">Fundamentals</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-light italic text-right hidden md:block">
              Core physics, battery chemistry, and grid infrastructure fundamentals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {fundamentalsArticles.map((a, i) => (
              <Link
                key={i}
                href={`/academy/ev-fundamentals/${a.slug}`}
                className="article-card block"
              >
                <div className="article-img-wrap">
                  <img src={a.img} className="article-img" alt={a.title} />
                </div>
                <div className="article-content">
                  <span className="tag tag-basics">{a.tag}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{a.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-light mb-6">{a.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gold">
                    Read Playbook →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="/academy/ev-fundamentals"
              className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-gold/40 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                Explore Full EV Fundamentals Library
              </span>
              <span className="w-6 h-px bg-white/10 group-hover:bg-gold/50 transition-all" />
              <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Dealer Playbook */}
      <section id="playbook" className="py-24 bg-b scroll-mt-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
            <div>
              <div className="label label-gold mb-3">Module 02</div>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                Dealer <span className="text-theme">Playbook</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-light italic text-right hidden md:block">
              Overcoming objections and closing high-ticket commercial fleet deals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {playbookArticles.map((a, i) => (
              <Link
                key={i}
                href={`/academy/dealer-playbook/${a.slug}`}
                className="article-card block"
              >
                <div className="article-content">
                  <span className="tag tag-sales">{a.tag}</span>
                  <h3 className="text-2xl font-black italic text-white mb-4">{a.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light mb-6">{a.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gold">
                    Access Script →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="/academy/dealer-playbook"
              className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-gold/40 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                Explore Full Sales Curriculum
              </span>
              <span className="w-6 h-px bg-white/10 group-hover:bg-gold/50 transition-all" />
              <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Technical Workshop */}
      <section id="workshop" className="py-24 bg-a scroll-mt-24">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
            <div>
              <div className="label mb-3" style={{ color: "var(--color-green)" }}>Module 03</div>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                Technical <span className="text-accent">Workshop</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-light italic text-right hidden md:block">
              Technical protocols, diagnostics, and high-voltage safety standards.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {workshopArticles.slice(0, 2).map((a, i) => (
              <Link
                key={i}
                href={`/academy/technical-workshop/${a.slug}`}
                className="article-card flex md:flex-row block"
              >
                <div className="article-img-wrap md:w-2/5 md:aspect-auto">
                  <img src={a.img} className="article-img" alt={a.title} />
                </div>
                <div className="article-content md:w-3/5">
                  <span className="tag tag-maintenance">{a.tag}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{a.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-light mb-6">{a.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-green">
                    View Protocol →
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="/academy/technical-workshop"
              className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-green/40 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                Explore Full Maintenance Protocols
              </span>
              <span className="w-6 h-px bg-white/10 group-hover:bg-green/50 transition-all" />
              <span className="text-accent group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* The Vault */}
      <section
        id="vault"
        className="relative py-48 scroll-mt-24 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=2000&q=80"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.2) contrast(1.1) grayscale(40%)" }}
            alt="Vault"
          />
          <div className="absolute inset-0" style={{ background: "rgba(10,10,10,0.65)" }} />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="label justify-center mb-4 label-gold">Exclusive Access</div>
            <h2 className="sh mb-6">
              The <span className="text-theme">Dealer</span> Vault.
            </h2>
            <p className="text-gray-400 text-lg font-light italic max-w-2xl mx-auto">
              Proprietary documentation, Excel models, and checklists reserved strictly for verified
              African import partners.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vaultItems.map((item, i) => (
              <div key={i} className="vault-card group">
                <div className="vault-lock">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-4">
                  {item.type}
                </div>
                <h3 className="text-2xl font-black italic text-white mb-4">{item.title}</h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-8">{item.desc}</p>
                <a
                  href="https://wa.me/qr/F7M2RQADCE3KN1"
                  className="text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-2 group-hover:gap-4 transition-all"
                >
                  Request via WhatsApp <span className="text-lg">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
