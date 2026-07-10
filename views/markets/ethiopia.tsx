"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";

const fadeToMid = [
  "linear-gradient(to bottom,",
  "  transparent 0%,",
  "  rgba(28,28,28,0.05) 5%,",
  "  rgba(28,28,28,0.10) 10%,",
  "  rgba(28,28,28,0.15) 15%,",
  "  rgba(28,28,28,0.20) 20%,",
  "  rgba(28,28,28,0.25) 25%,",
  "  rgba(28,28,28,0.30) 30%,",
  "  rgba(28,28,28,0.35) 35%,",
  "  rgba(28,28,28,0.40) 40%,",
  "  rgba(28,28,28,0.45) 45%,",
  "  rgba(28,28,28,0.50) 50%,",
  "  rgba(28,28,28,0.55) 55%,",
  "  rgba(28,28,28,0.60) 60%,",
  "  rgba(28,28,28,0.65) 65%,",
  "  rgba(28,28,28,0.70) 70%,",
  "  rgba(28,28,28,0.75) 75%,",
  "  rgba(28,28,28,0.80) 80%,",
  "  rgba(28,28,28,0.85) 85%,",
  "  rgba(28,28,28,0.90) 90%,",
  "  rgba(28,28,28,0.95) 95%,",
  "  rgba(28,28,28,1.00) 100%",
  ")",
].join("\n");

const fadeFromMid = [
  "linear-gradient(to bottom,",
  "  rgba(28,28,28,1.00) 0%,",
  "  rgba(28,28,28,0.95) 5%,",
  "  rgba(28,28,28,0.90) 10%,",
  "  rgba(28,28,28,0.85) 15%,",
  "  rgba(28,28,28,0.80) 20%,",
  "  rgba(28,28,28,0.72) 28%,",
  "  rgba(28,28,28,0.60) 38%,",
  "  rgba(28,28,28,0.45) 50%,",
  "  rgba(28,28,28,0.30) 64%,",
  "  rgba(28,28,28,0.15) 80%,",
  "  transparent 100%",
  ")",
].join("\n");

export default function EthiopiaMarketPage() {
  const { t, tArray } = useTranslation();

  const overviewStats = tArray("marketsEthiopia.overview.stats");
  const policyItems = tArray("marketsEthiopia.policy.items");

  const vehicleImages = [
    "/pic/revenue-king/seagull/7cut.webp",
    "/pic/revenue-king/RT/7cut.webp",
    "/pic/utility-pro/supervan/9.webp",
  ];
  const localVehicles = tArray("marketsEthiopia.vehicles");
  const displayVehicles = localVehicles.map((v, index) => ({
    ...v,
    img: vehicleImages[index] || "",
  }));

  const localSteps = (t("marketsEthiopia.logistics.steps") as any[]) || [];
  const displaySteps = localSteps.map((step, idx) => ({
    step: String(idx + 1).padStart(2, "0"),
    label: step.label,
    time: step.time,
  }));

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/pic/page/photo-1523805009345-7448845a9e53.webp"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.75)" }}
            alt="Addis Ababa"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.4)" }}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              top: "48%",
              background: fadeToMid,
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 pt-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="pulse-dot" />
              <span className="text-accent text-[10px] font-black uppercase tracking-[.3em]">
                {t("marketsEthiopia.hero.badge")}
              </span>
            </div>
            <h1
              className="sh mb-8"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              {t("marketsEthiopia.hero.heading1")}
              <br />
              <span className="text-theme">{t("marketsEthiopia.hero.heading2")}</span>{" "}
              {t("marketsEthiopia.hero.heading3")}
              <br />
              <span className="text-accent">{t("marketsEthiopia.hero.heading4")}</span>
            </h1>
            <p className="text-xl text-gray-400 font-light italic border-l-2 pl-8 leading-relaxed max-w-xl" style={{ borderColor: "rgba(197,160,89,.3)" }}>
              {t("marketsEthiopia.hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-24 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="label label-gold mb-6">{t("marketsEthiopia.overview.label")}</div>
              <h2 className="sh mb-8">
                {t("marketsEthiopia.overview.heading")}{" "}
                <span className="text-theme">{t("marketsEthiopia.overview.headingAccent")}</span>
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                {t("marketsEthiopia.overview.description")}
              </p>
              <div className="grid grid-cols-2 gap-4">
                {overviewStats.map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-6 text-center">
                    <div className="text-3xl font-black italic text-theme mb-1">
                      {stat.value}
                    </div>
                    <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 leading-relaxed">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass rounded-[3rem] p-10 md:p-14">
              <div className="text-[10px] font-black tracking-widest uppercase text-accent mb-8">
                {t("marketsEthiopia.policy.label")}
              </div>
              <div className="space-y-6">
                {policyItems.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-theme/10 border border-theme/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-theme">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-wider mb-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 font-light leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Vehicles */}
          <div className="mb-24">
            <div className="text-center mb-16">
              <div className="label justify-center mb-4">{t("marketsEthiopia.curated.label")}</div>
              <h2 className="sh">
                {t("marketsEthiopia.curated.heading")}{" "}
                <span className="text-theme">{t("marketsEthiopia.curated.headingAccent")}</span>
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {displayVehicles.map((car, i) => (
                <div
                  key={i}
                  className="glass rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-gold/30 transition-all duration-500 group"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={car.img}
                      alt={car.name}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                    />
                  </div>
                  <div className="p-8">
                    <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
                      {car.segment}
                    </div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">
                      {car.name}
                    </h3>
                    <p className="text-gray-500 text-xs font-light leading-relaxed">
                      {car.reason}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logistics */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label mb-6">{t("marketsEthiopia.logistics.label")}</div>
              <h2 className="sh mb-8">
                {t("marketsEthiopia.logistics.heading")}{" "}
                <span className="text-accent">{t("marketsEthiopia.logistics.headingArrow")}</span>{" "}
                <span className="text-theme">{t("marketsEthiopia.logistics.headingAccent")}</span>
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                {t("marketsEthiopia.logistics.description1")}
              </p>
              <p className="text-sm text-gray-500 font-light italic leading-relaxed mb-8 border-l-2 border-accent/30 pl-5">
                {t("marketsEthiopia.logistics.description2")}
              </p>
              <LocaleLink
                href="/contact"
                className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg"
              >
                {t("marketsEthiopia.logistics.quoteButton")}
              </LocaleLink>
            </div>
            <div className="glass rounded-[3rem] p-10 md:p-14">
              <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-8">
                {t("marketsEthiopia.logistics.routeTimeline")}
              </div>
              <div className="space-y-6">
                {displaySteps.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-theme/10 border border-theme/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-[10px] font-black text-theme">
                        {item.step}
                      </span>
                    </div>
                    <div className="flex-grow">
                      <div className="text-xs font-black text-white uppercase tracking-wider">
                        {item.label}
                      </div>
                    </div>
                    <div className="text-[10px] font-black text-gray-600 uppercase tracking-wider">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/pic/page/photo-1523805009345-7448845a9e53.webp"
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
              background: fadeFromMid,
            }}
          />
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{ top: "58%", background: fadeToMid }}
          />
        </div>

        <section className="py-24 relative z-10">
          <div className="container mx-auto px-6 md:px-12">
            <div
              className="glass rounded-[4rem] p-12 md:p-20 text-center"
              style={{ borderColor: "rgba(197,160,89,.25)" }}
            >
              <div className="label justify-center mb-6">
                {t("marketsEthiopia.cta.badge")}
              </div>
              <h2
                className="sh mb-6"
                style={{ fontSize: "clamp(2.5rem,6.5vw,5.5rem)" }}
              >
                {t("marketsEthiopia.cta.heading")}{" "}
                <span className="text-accent">{t("marketsEthiopia.cta.headingAccent")}</span>{" "}
                {t("marketsEthiopia.cta.headingSuffix")}
              </h2>
              <p className="text-gray-500 text-lg font-light italic mb-10 max-w-lg mx-auto">
                {t("marketsEthiopia.cta.description")}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <LocaleLink
                  href="/qr"
                  className="btn-primary px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic shadow-lg"
                >
                  {t("marketsEthiopia.cta.whatsappButton")}
                </LocaleLink>
                <LocaleLink
                  href="/contact"
                  className="btn-outline px-12 py-5 rounded text-sm font-black tracking-widest uppercase italic"
                >
                  {t("marketsEthiopia.cta.applicationButton")}
                </LocaleLink>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
