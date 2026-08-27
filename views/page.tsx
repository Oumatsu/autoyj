"use client";

import { HeroSlider } from "@/components/HeroSlider";
import { SectionTabs } from "@/components/SectionTabs";
import { TcoCounter } from "@/components/TcoCounter";
import { ScrollColorCard } from "@/components/ScrollColorCard";
import { useTranslation, T } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HomePage() {
  const { t, tArray, locale } = useTranslation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    fetch("/api/portal/session", { credentials: "include" })
      .then((res) => res.json() as Promise<{ user?: unknown }>)
      .then((data) => { setIsLoggedIn(Boolean(data.user)); })
      .catch(() => { setIsLoggedIn(false); });
  }, []);

  return (
    <main id="main-content">
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      <HeroSlider />
      <SectionTabs />

      {/* Trust Bar */}
      <div
        className="py-8 sm:py-10 border-y"
        style={{ background: "#000", borderColor: "rgba(197,160,89,.08)" }}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4 sm:gap-6">
            <span className="text-[8px] sm:text-[9px] font-black tracking-[.2em] sm:tracking-[.3em] uppercase text-gray-400">
              {t("home.trustBar.label")}
            </span>
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 md:gap-14 opacity-80 text-gray-300">
              {tArray("home.trustBar.partners").map(
                (name) => (
                  <span
                    key={name}
                    className="text-xs sm:text-sm font-black italic uppercase tracking-tight"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Curated Vehicles */}
      <section className="py-16 sm:py-20 md:py-28 bg-b" id="products">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16">
            <div>
              <div className="label label-gold mb-3 sm:mb-4">
                {t("home.products.label")}
              </div>
              <h2 className="sh">
                <T keyName="home.products.title" defaultValue={t("home.products.title")} params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }} />
              </h2>
            </div>
            <LocaleLink
              href="/products"
              className="btn-outline px-6 sm:px-8 py-2.5 sm:py-3 rounded text-[10px] sm:text-[11px] font-black tracking-widest uppercase self-start sm:self-auto whitespace-nowrap"
            >
              {t("common.fullCatalog")}
            </LocaleLink>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-10">
            {/* Revenue King */}
            <ProductCard
              href="/products/revenue-king"
              image="/pic/hero/Ti3 display.webp"
              productKey="revenueKing"
              tagColor="green"
            />

            {/* Elite Flagship */}
            <ProductCard
              href="/products/elite-flagship"
              image="/pic/elite-flagship/E-HS9/6cut.webp"
              productKey="eliteFlagship"
              tagColor="gold"
              cardStyle={{ boxShadow: "0 0 40px rgba(197,160,89,.07)" }}
              borderColor="border-theme/25"
            />

            {/* Utility Pro */}
            <ProductCard
              href="/products/utility-pro"
              image="/pic/utility-pro/9x/6cut.webp"
              productKey="utilityPro"
              tagColor="green"
            />
          </div>
        </div>
      </section>

      {/* How It Works — 4 Steps */}
      <section
        id="solutions"
        className="py-16 sm:py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="/pic/hero/photo-1578575437130-527eed3abbec.webp"
            className="object-cover"
            style={{ filter: "brightness(.3) grayscale(15%)" }}
            alt="Logistics"
            fill
            sizes="100vw"
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

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-14 sm:mb-20">
            <div className="label justify-center mb-4">
              {t("home.process.label")}
            </div>
            <h2 className="sh">
              <T keyName="home.process.title" defaultValue={t("home.process.title")} params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }} />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-10">
            {[
              {
                num: "01",
                title: t("home.process.steps.0.title"),
                desc: t("home.process.steps.0.desc"),
                badge: t("home.process.steps.0.badge"),
                badgeClass: "text-accent",
                pulse: true,
              },
              {
                num: "02",
                title: t("home.process.steps.1.title"),
                desc: t("home.process.steps.1.desc"),
                badge: t("home.process.steps.1.badge"),
                badgeClass: "text-gray-600",
              },
              {
                num: "03",
                title: t("home.process.steps.2.title"),
                desc: t("home.process.steps.2.desc"),
                badge: t("home.process.steps.2.badge"),
                badgeClass: "",
                badgeStyle: {
                  background: "rgba(197,160,89,.1)",
                  color: "var(--color-gold)",
                },
              },
              {
                num: "04",
                title: t("home.process.steps.3.title"),
                desc: t("home.process.steps.3.desc"),
                badge: t("home.process.steps.3.badge"),
                badgeClass: "text-accent",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="step-card glass rounded-2xl sm:rounded-3xl p-5 sm:p-8"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className={`num-circle border ${
                      i < 2 ? "border-theme" : "border-accent"
                    }`}
                    style={{
                      color:
                        i < 2 ? "var(--color-gold)" : "var(--color-green)",
                    }}
                  >
                    {step.num}
                  </div>
                  {step.pulse && <div className="pulse-dot mt-2" />}
                </div>
                <h3 className="text-white font-black uppercase tracking-wider text-sm mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed font-light">
                  {step.desc}
                </p>
                <div className="mt-6">
                  {step.badgeStyle ? (
                    <span
                      className="text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest"
                      style={step.badgeStyle}
                    >
                      {step.badge}
                    </span>
                  ) : (
                    <span
                      className={`text-[9px] font-black tracking-widest uppercase ${step.badgeClass}`}
                    >
                      {step.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { num: "50+", label: t("home.process.stats.0.label") },
              { num: "2h", label: t("home.process.stats.1.label") },
              { num: "10+", label: t("home.process.stats.2.label") },
              { num: "100%", label: t("home.process.stats.3.label") },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass rounded-[2rem] p-8 text-center glass-sm"
              >
                <div
                  className={`text-4xl font-black italic mb-1 ${
                    i === 0 || i === 3 ? "text-theme" : "text-accent"
                  }`}
                >
                  {stat.num}
                </div>
                <div className="text-[10px] font-black tracking-[.3em] uppercase text-gray-500">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* EV vs ICE TCO */}
      <section className="py-16 sm:py-20 md:py-28 bg-a" id="tco">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="label label-gold mb-5">
                {t("home.tco.label")}
              </div>
              <h2 className="sh text-[24px] sm:text-[32px] font-black tracking-tight leading-tight mb-6">
                <T keyName="home.tco.title" defaultValue={t("home.tco.title")} params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }} />
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8 italic">
                {t("home.tco.desc")}
              </p>
              <div className="space-y-5 mb-10">
                {[
                  {
                    num: "01",
                    prefix: t("home.tco.benefits.0.prefix"),
                    value: t("home.tco.benefits.0.value"),
                    cls: "border-theme",
                    color: "var(--color-gold)",
                  },
                  {
                    num: "02",
                    prefix: t("home.tco.benefits.1.prefix"),
                    value: t("home.tco.benefits.1.value"),
                    cls: "border-accent",
                    color: "var(--color-green)",
                  },
                  {
                    num: "03",
                    prefix: t("home.tco.benefits.2.prefix"),
                    value: t("home.tco.benefits.2.value"),
                    cls: "border-theme",
                    color: "var(--color-gold)",
                    accent: true,
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`num-circle border ${item.cls} mt-0.5`}
                      style={{
                        color: item.color,
                        width: "22px",
                        height: "22px",
                        fontSize: "9px",
                      }}
                    >
                      {item.num}
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider text-gray-400">
                      {item.prefix}
                      <span
                        className={
                          item.accent ? "text-accent" : "text-white"
                        }
                      >
                        {item.value}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
              <a
                href="#contact"
                className="btn-primary inline-block px-10 py-5 rounded text-sm font-black tracking-widest uppercase italic"
              >
                {t("home.tco.cta")}
              </a>
            </div>

            {/* Visual bars */}
            <div className="glass rounded-[2.5rem] p-8 md:p-10">
              <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 mb-8">
                {t("home.tco.chartTitle")}
              </div>

              {/* EV */}
              <div className="mb-8">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {t("home.tco.evLabel")}
                  </span>
                  <span className="text-xs font-black text-accent">
                    {t("home.tco.evValue")}
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full"
                  style={{ background: "rgba(255,255,255,.04)" }}
                >
                  <div
                    className="bar-fill h-2.5 rounded-full"
                    style={{
                      width: "22%",
                      background: "linear-gradient(to right,#10B981,#059669)",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  {tArray("home.tco.evBreakdown").map(
                    (text, i) => (
                      <span key={i} className="text-[9px] text-gray-600">
                        {text}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* ICE */}
              <div className="mb-10">
                <div className="flex justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    {t("home.tco.iceLabel")}
                  </span>
                  <span
                    className="text-xs font-black"
                    style={{ color: "#EF4444" }}
                  >
                    {t("home.tco.iceValue")}
                  </span>
                </div>
                <div
                  className="w-full h-2.5 rounded-full"
                  style={{ background: "rgba(255,255,255,.04)" }}
                >
                  <div
                    className="bar-fill h-2.5 rounded-full"
                    style={{
                      width: "78%",
                      background: "linear-gradient(to right,#EF4444,#B91C1C)",
                    }}
                  />
                </div>
                <div className="flex gap-3 mt-2">
                  {tArray("home.tco.iceBreakdown").map(
                    (text, i) => (
                      <span key={i} className="text-[9px] text-gray-600">
                        {text}
                      </span>
                    )
                  )}
                </div>
              </div>

              {/* Savings */}
              <div
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "rgba(197,160,89,.06)",
                  border: "1px solid rgba(197,160,89,.15)",
                }}
              >
                <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 mb-2">
                  {t("home.tco.savingsLabel")}
                </div>
                <div className="text-5xl font-black italic text-white mb-1">
                  $<TcoCounter />
                </div>
                <div className="text-[9px] font-black tracking-widest uppercase text-theme">
                  {t("home.tco.savingsValue")}
                </div>
              </div>
              <p className="text-[9px] text-gray-700 mt-4 text-center">
                {t("home.tco.disclaimer")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Insights + Academy */}
      <section
        id="insights"
        className="py-16 sm:py-20 md:py-28 relative overflow-hidden"
      >
        <div className="absolute inset-0">
          <Image
            src="/pic/page/photo-1520038410233-7141be7e6f97.webp"
            className="object-cover"
            style={{ filter: "brightness(.3) grayscale(15%)" }}
            alt="Tech"
            fill
            sizes="100vw"
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

        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-12 sm:mb-16">
            <div className="label justify-center mb-3 sm:mb-4">
              {t("home.insights.label")}
            </div>
            <h2 className="sh text-[24px] sm:text-[32px] font-black tracking-tight leading-tight whitespace-pre-line">
              <T keyName="home.insights.title" defaultValue={t("home.insights.title")} params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }} />
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            {/* Market Report */}
            <div className="glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-14 flex flex-col justify-between min-h-[260px] sm:min-h-[300px]">
              <div>
                <div className="label label-gold mb-5">
                  {t("home.insights.report.label")}
                </div>
                <h3 className="text-3xl font-black uppercase italic text-white tracking-tight mb-4 whitespace-pre-line">
                  {t("home.insights.report.title")}
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  {t("home.insights.report.desc")}
                </p>
              </div>
              <LocaleLink
                href="/insights"
                className="btn-outline inline-block mt-8 px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase self-start"
              >
                {t("common.downloadFree")}
              </LocaleLink>
            </div>

            {/* Academy */}
            <div
              className="glass rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 md:p-14 flex flex-col justify-between min-h-[260px] sm:min-h-[300px]"
              id="academy"
              style={{ borderColor: "rgba(16,185,129,.2)" }}
            >
              <div>
                <div className="label mb-5">
                  {t("home.insights.academy.label")}
                </div>
                <h3 className="text-3xl font-black uppercase italic text-white tracking-tight mb-4 whitespace-pre-line">
                  {t("home.insights.academy.title")}
                </h3>
                <p className="text-gray-500 text-sm font-light leading-relaxed">
                  {t("home.insights.academy.desc")}
                </p>
              </div>
              <div className="flex items-center gap-4 mt-8">
                <LocaleLink
                  href="/academy"
                  className="btn-primary inline-block px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase"
                >
                  {t("common.browseAcademy")}
                </LocaleLink>
                <div className="flex items-center gap-2">
                  <div className="pulse-dot" />
                  <span className="text-[9px] font-black tracking-widest uppercase text-accent">
                    {t("home.insights.academy.freeAccess")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Teaser */}
      <section className="py-16 sm:py-20 md:py-28 bg-b" id="about">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <div>
              <div className="label label-gold mb-6">
                {t("home.about.label")}
              </div>
              <div className="text-5xl italic font-serif mb-3 text-theme">
                {t("home.about.quoteOpen")}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white/90 leading-relaxed italic mb-6">
                <T keyName="home.about.quote" defaultValue={t("home.about.quote")} params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }} />
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed font-light mb-10">
                {t("home.about.desc")}
              </p>
              <LocaleLink
                href="/about"
                className="btn-outline inline-block px-8 py-3 rounded text-[11px] font-black tracking-widest uppercase"
              >
                {t("home.about.cta")}
              </LocaleLink>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { num: "10+", label: t("home.about.stats.0.label") },
                { num: "100%", label: t("home.about.stats.1.label") },
                { num: "50pt", label: t("home.about.stats.2.label") },
                { num: "2h", label: t("home.about.stats.3.label") },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-[2rem] p-6 sm:p-10 text-center"
                  style={
                    i === 1 || i === 2
                      ? { borderColor: "rgba(16,185,129,.2)" }
                      : undefined
                  }
                >
                  <div
                    className={`text-4xl min-[419px]:text-5xl font-black italic mb-2 ${
                      i === 0 || i === 3 ? "text-theme" : "text-accent"
                    }`}
                  >
                    {item.num}
                  </div>
                  <div className="text-[10px] font-black tracking-[.3em] uppercase text-gray-500">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Lead Magnet */}
      <section className="py-16 sm:py-20 md:py-28 bg-a" id="lead-magnet">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="max-w-xl mx-auto text-center">
            <div className="label justify-center mb-5">
              {t("home.leadMagnet.label")}
            </div>
            <h2 className="sh text-[24px] sm:text-[36px] font-black tracking-tight leading-tight mb-4 whitespace-pre-line">
              <T keyName="home.leadMagnet.title" defaultValue={t("home.leadMagnet.title")} params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }} />
            </h2>
            <p className="text-gray-500 text-base font-light leading-relaxed mb-10">
              {t("home.leadMagnet.desc")}
            </p>

            <div className="glass rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 text-left">
              {isLoggedIn ? (
                <a
                  href="/reports/global_ev_outlook_report_2025.pdf"
                  download="Global_EV_Outlook_Report_2025.pdf"
                  className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic cursor-pointer transition-all duration-300 hover:scale-[1.02] block text-center"
                >
                  {t("home.leadMagnet.cta")}
                </a>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="w-full btn-primary py-5 rounded-xl text-sm font-black tracking-widest uppercase italic cursor-pointer transition-all duration-300 hover:scale-[1.02]"
                >
                  {t("home.leadMagnet.cta")}
                </button>
              )}
              <p className="text-[10px] text-gray-700 mt-4 text-center">
                {t("home.leadMagnet.privacy")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Login Guidance Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-all duration-300">
          <div className="glass w-full max-w-md p-6 sm:p-8 rounded-[2rem] border border-theme/20 shadow-2xl relative text-left">
            <h3 className="text-lg font-bold text-white mb-2">
              {t("home.leadMagnet.modalTitle")}
            </h3>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              {t("home.leadMagnet.modalDesc")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-5 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase border border-white/10 text-gray-400 hover:text-white hover:border-white/20 transition-all cursor-pointer text-center"
              >
                {t("home.leadMagnet.modalCancel")}
              </button>
              <a
                href="/portal?redirect=%2F%23lead-magnet"
                className="flex-1 px-5 py-3.5 rounded-xl text-xs font-black tracking-widest uppercase btn-primary text-center cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center"
              >
                {t("home.leadMagnet.modalCta")}
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function ProductCard({
  href,
  image,
  productKey,
  tagColor,
  cardStyle,
  borderColor = "border-accent/20",
}: {
  href: string;
  image: string;
  productKey: "revenueKing" | "eliteFlagship" | "utilityPro";
  tagColor: "green" | "gold";
  cardStyle?: React.CSSProperties;
  borderColor?: string;
}) {
  const { t } = useTranslation();
  const badgeStyle =
    tagColor === "gold"
      ? { background: "var(--color-gold)", color: "#000" }
      : { background: "var(--color-green)", color: "#000" };

  return (
    <div>
      <LocaleLink href={href} className="block">
        <ScrollColorCard
          className={`v-card aspect-[4/5] border ${borderColor}`}
          style={cardStyle}
        >
          <Image
            src={image}
            className="object-cover absolute inset-0"
            alt={t(`home.products.${productKey}.title`)}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="v-card-overlay" />
          <div className="absolute top-8 left-8">
            <span
              className="text-[9px] font-black px-3 py-1 rounded uppercase tracking-widest"
              style={badgeStyle}
            >
              {t(`home.products.${productKey}.badge`)}
            </span>
          </div>
          <div className="absolute bottom-8 left-8 right-8">
            <div
              className={`label mb-2 ${
                tagColor === "gold" ? "label-gold" : ""
              }`}
            >
              {t(`home.products.${productKey}.category`)}
            </div>
            <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
              {t(`home.products.${productKey}.title`)}
            </h3>
            <p className="text-gray-400 text-xs mt-2 font-light">
              {t(`home.products.${productKey}.desc`)}
            </p>
          </div>
        </ScrollColorCard>
      </LocaleLink>
      <div className="mt-5 flex items-center justify-between px-1">
        <div className="flex flex-wrap gap-2">
          <span
            className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background:
                tagColor === "gold"
                  ? "rgba(197,160,89,.1)"
                  : "rgba(16,185,129,.1)",
              color:
                tagColor === "gold"
                  ? "var(--color-gold)"
                  : "var(--color-green)",
            }}
          >
            {t(`home.products.${productKey}.tags.0`)}
          </span>
          <span
            className="text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full"
            style={{
              background:
                tagColor === "gold"
                  ? "rgba(197,160,89,.1)"
                  : "rgba(16,185,129,.1)",
              color:
                tagColor === "gold"
                  ? "var(--color-gold)"
                  : "var(--color-green)",
            }}
          >
            {t(`home.products.${productKey}.tags.1`)}
          </span>
        </div>
        <LocaleLink
          href={href}
          className={`nav-link text-[10px] ${
            tagColor === "green" ? "green" : ""
          }`}
        >
          {t("common.explore")} →
        </LocaleLink>
      </div>
    </div>
  );
}
