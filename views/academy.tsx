"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import {
  translateAcademyLesson,
  translateAcademyVaultItem,
} from "@/views/academy/academyTranslations";

const tabSectionIds = ["hero", "fundamentals", "playbook", "workshop", "vault"];

export default function AcademyPage() {
  const { t } = useTranslation();
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  const [fundamentalsArticles, setFundamentalsArticles] = useState<any[]>([]);
  const [playbookArticles, setPlaybookArticles] = useState<any[]>([]);
  const [workshopArticles, setWorkshopArticles] = useState<any[]>([]);
  const [vaultItems, setVaultItems] = useState<any[]>([]);

  const localizedFundamentals = fundamentalsArticles.map((lesson) =>
    translateAcademyLesson(lesson, t),
  );
  const localizedPlaybook = playbookArticles.map((lesson) =>
    translateAcademyLesson(lesson, t),
  );
  const localizedWorkshop = workshopArticles.map((lesson) =>
    translateAcademyLesson(lesson, t),
  );
  const localizedVault = vaultItems.map((item) =>
    translateAcademyVaultItem(item, t),
  );

  const syncTabTop = useCallback(() => {
    const navbar = document.getElementById("navbar");
    const tabBar = tabBarRef.current;
    if (!tabBar || !navbar) return;
    tabBar.style.top = navbar.offsetHeight - 1 + "px";
  }, []);

  useEffect(() => {
    fetch("/api/portal/public/academy")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data: any) => {
        if (data?.lessons) {
          setFundamentalsArticles(data.lessons.fundamentals || []);
          setPlaybookArticles(data.lessons.playbook || []);
          setWorkshopArticles(data.lessons.workshop || []);
        }
        if (data?.vault) {
          setVaultItems(data.vault || []);
        }
      })
      .catch((err) => {
        console.error("Error loading academy Bitable data:", err);
      });
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
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Section Tabs */}
      <div id="section-tabs" ref={tabBarRef} role="navigation" aria-label="Page sections">
        <div className="tab-inner">
          <button
            className={`tab-btn ${activeId === "hero" ? "active" : ""}`}
            onClick={() => scrollTo("hero")}
          >
            <span className="min-[498px]:hidden">{t("academy.tabs.hub")}</span>
            <span className="hidden min-[498px]:inline">{t("academy.tabs.hubFull")}</span>
          </button>
          <button
            className={`tab-btn ${activeId === "fundamentals" ? "active" : ""}`}
            onClick={() => scrollTo("fundamentals")}
          >
            <span className="min-[498px]:hidden">{t("academy.tabs.fundamentals")}</span>
            <span className="hidden min-[498px]:inline">{t("academy.tabs.fundamentalsFull")}</span>
          </button>
          <button
            className={`tab-btn ${activeId === "playbook" ? "active" : ""}`}
            onClick={() => scrollTo("playbook")}
          >
            <span className="min-[498px]:hidden">{t("academy.tabs.playbook")}</span>
            <span className="hidden min-[498px]:inline">{t("academy.tabs.playbookFull")}</span>
          </button>
          <button
            className={`tab-btn ${activeId === "workshop" ? "active" : ""}`}
            onClick={() => scrollTo("workshop")}
          >
            <span className="min-[498px]:hidden">{t("academy.tabs.workshop")}</span>
            <span className="hidden min-[498px]:inline">{t("academy.tabs.workshopFull")}</span>
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
            src="/pic/hero/photo-1593941707882-a5bba14938c7.webp"
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

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 pt-24 sm:pt-32 pb-16 sm:pb-20 text-center">
          <div className="label justify-center mb-6">{t("academy.hero.badge")}</div>
          <h1
            className="sh mb-8"
            style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
          >
            {t("academy.hero.heading")}{" "}
            <span className="text-accent">{t("academy.hero.headingAccent")}</span>
          </h1>
          <p className="text-xl text-gray-400 font-light italic leading-relaxed max-w-2xl mx-auto mb-10">
            {t("academy.hero.description")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => scrollTo("vault")}
              className="btn-primary px-10 py-4 rounded-full text-xs font-black tracking-widest uppercase shadow-lg"
            >
              {t("academy.hero.cta")}
            </button>
          </div>
        </div>
      </section>

      {/* EV Fundamentals */}
      <section id="fundamentals" className="py-16 sm:py-24 bg-a scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
            <div>
              <div className="label mb-3">{t("academy.fundamentals.badge")}</div>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                {t("academy.fundamentals.heading")}{" "}
                <span className="text-theme">{t("academy.fundamentals.headingAccent")}</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-light italic text-right hidden md:block">
              {t("academy.fundamentals.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {localizedFundamentals.map((lesson, i) => (
              <LocaleLink
                key={lesson.slug}
                href={`/academy/ev-fundamentals/${lesson.slug}`}
                className="article-card block"
              >
                <div className="article-img-wrap">
                  <img src={lesson.img} className="article-img" alt={lesson.title} />
                </div>
                <div className="article-content">
                  <span className="tag tag-basics">{lesson.tag}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{lesson.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-light mb-6">{lesson.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gold">
                    {t("academy.fundamentals.readLink")}
                  </div>
                </div>
              </LocaleLink>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <LocaleLink
              href="/academy/ev-fundamentals"
              className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-gold/40 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                {t("academy.fundamentals.exploreMore")}
              </span>
              <span className="w-6 h-px bg-white/10 group-hover:bg-gold/50 transition-all" />
              <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
            </LocaleLink>
          </div>
        </div>
      </section>

      {/* Dealer Playbook */}
      <section id="playbook" className="py-16 sm:py-24 bg-b scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
            <div>
              <div className="label label-gold mb-3">{t("academy.playbook.badge")}</div>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                {t("academy.playbook.heading")}{" "}
                <span className="text-theme">{t("academy.playbook.headingAccent")}</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-light italic text-right hidden md:block">
              {t("academy.playbook.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {localizedPlaybook.map((lesson) => (
              <LocaleLink
                key={lesson.slug}
                href={`/academy/dealer-playbook/${lesson.slug}`}
                className="article-card block"
              >
                <div className="article-content">
                  <span className="tag tag-sales">{lesson.tag}</span>
                  <h3 className="text-2xl font-black italic text-white mb-4">{lesson.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed font-light mb-6">{lesson.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-gold">
                    {t("academy.playbook.accessLink")}
                  </div>
                </div>
              </LocaleLink>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <LocaleLink
              href="/academy/dealer-playbook"
              className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-gold/40 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                {t("academy.playbook.exploreMore")}
              </span>
              <span className="w-6 h-px bg-white/10 group-hover:bg-gold/50 transition-all" />
              <span className="text-gold group-hover:translate-x-1 transition-transform">→</span>
            </LocaleLink>
          </div>
        </div>
      </section>

      {/* Technical Workshop */}
      <section id="workshop" className="py-16 sm:py-24 bg-a scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-white/5 pb-8">
            <div>
              <div className="label mb-3" style={{ color: "var(--color-green)" }}>{t("academy.workshop.badge")}</div>
              <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                {t("academy.workshop.heading")}{" "}
                <span className="text-accent">{t("academy.workshop.headingAccent")}</span>
              </h2>
            </div>
            <p className="text-gray-500 text-sm max-w-sm font-light italic text-right hidden md:block">
              {t("academy.workshop.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {localizedWorkshop.slice(0, 2).map((lesson) => (
              <LocaleLink
                key={lesson.slug}
                href={`/academy/technical-workshop/${lesson.slug}`}
                className="article-card flex md:flex-row block"
              >
                <div className="article-img-wrap md:w-2/5 md:aspect-auto">
                  <img src={lesson.img} className="article-img" alt={lesson.title} />
                </div>
                <div className="article-content md:w-3/5">
                  <span className="tag tag-maintenance">{lesson.tag}</span>
                  <h3 className="text-xl font-bold text-white mb-3">{lesson.title}</h3>
                  <p className="text-gray-400 text-xs leading-relaxed font-light mb-6">{lesson.desc}</p>
                  <div className="mt-auto pt-4 border-t border-white/5 text-[9px] font-black uppercase tracking-widest text-green">
                    {t("academy.workshop.viewLink")}
                  </div>
                </div>
              </LocaleLink>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <LocaleLink
              href="/academy/technical-workshop"
              className="group flex items-center gap-4 px-10 py-4 rounded-full border border-white/10 hover:border-green/40 transition-all"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 group-hover:text-white">
                {t("academy.workshop.exploreMore")}
              </span>
              <span className="w-6 h-px bg-white/10 group-hover:bg-green/50 transition-all" />
              <span className="text-accent group-hover:translate-x-1 transition-transform">→</span>
            </LocaleLink>
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
            src="/pic/page/photo-1555215695-3004980ad54e.webp"
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

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="label justify-center mb-4 label-gold">{t("academy.vault.badge")}</div>
            <h2 className="sh mb-6">
              {t("academy.vault.heading")}{" "}
              <span className="text-theme">{t("academy.vault.headingAccent")}</span>{" "}
              {t("academy.vault.headingSuffix")}
            </h2>
            <p className="text-gray-400 text-lg font-light italic max-w-2xl mx-auto">
              {t("academy.vault.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {localizedVault.map((vaultItem) => (
              <div key={vaultItem.translationId} className="vault-card group">
                <div className="vault-lock">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-4">
                  {vaultItem.type}
                </div>
                <h3 className="text-2xl font-black italic text-white mb-4">{vaultItem.title}</h3>
                <p className="text-gray-400 text-xs font-light leading-relaxed mb-8">{vaultItem.desc}</p>
                <LocaleLink
                  href="/qr"
                  className="text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-2 group-hover:gap-4 transition-all"
                >
                  {t("academy.vault.requestViaWhatsApp")} <span className="text-lg">→</span>
                </LocaleLink>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
