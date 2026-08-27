"use client";

import Image from "next/image";
import { useTranslation, T } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";

export default function SolutionsPage() {
  const { t, tArray } = useTranslation();

  const pdiChecklist = tArray("solutions.pdi.checklist");
  const kitItems = tArray("solutions.partsKit.kitItems");
  const serviceCentreItems = tArray("solutions.serviceCentre.items");

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero */}
      <section className="relative min-h-[720px] sm:min-h-[780px] lg:min-h-[900px] xl:min-h-[960px] overflow-hidden">
        <Image
          src="/pic/hero/0.webp"
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ filter: "brightness(.28) grayscale(20%)" }}
          alt="Solutions Hero"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0, 0, 0, 0.45)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(28,28,28,0.00) 0%, rgba(28,28,28,0.02) 2%, rgba(28,28,28,0.04) 4%, rgba(28,28,28,0.06) 6%, rgba(28,28,28,0.08) 8%, rgba(28,28,28,0.10) 10%, rgba(28,28,28,0.12) 12%, rgba(28,28,28,0.14) 14%, rgba(28,28,28,0.16) 16%, rgba(28,28,28,0.18) 18%, rgba(28,28,28,0.20) 20%, rgba(28,28,28,0.22) 22%, rgba(28,28,28,0.24) 24%, rgba(28,28,28,0.26) 26%, rgba(28,28,28,0.28) 28%, rgba(28,28,28,0.30) 30%, rgba(28,28,28,0.32) 32%, rgba(28,28,28,0.34) 34%, rgba(28,28,28,0.36) 36%, rgba(28,28,28,0.38) 38%, rgba(28,28,28,0.40) 40%, rgba(28,28,28,0.42) 42%, rgba(28,28,28,0.44) 44%, rgba(28,28,28,0.46) 46%, rgba(28,28,28,0.48) 48%, rgba(28,28,28,0.50) 50%, rgba(28,28,28,0.52) 52%, rgba(28,28,28,0.54) 54%, rgba(28,28,28,0.56) 56%, rgba(28,28,28,0.58) 58%, rgba(28,28,28,0.60) 60%, rgba(28,28,28,0.62) 62%, rgba(28,28,28,0.64) 64%, rgba(28,28,28,0.66) 66%, rgba(28,28,28,0.68) 68%, rgba(28,28,28,0.70) 70%, rgba(28,28,28,0.72) 72%, rgba(28,28,28,0.74) 74%, rgba(28,28,28,0.76) 76%, rgba(28,28,28,0.78) 78%, rgba(28,28,28,0.80) 80%, rgba(28,28,28,0.82) 82%, rgba(28,28,28,0.84) 84%, rgba(28,28,28,0.86) 86%, rgba(28,28,28,0.88) 88%, rgba(28,28,28,0.90) 90%, rgba(28,28,28,0.92) 92%, rgba(28,28,28,0.94) 94%, rgba(28,28,28,0.96) 96%, rgba(28,28,28,0.98) 98%, rgba(28,28,28,1.00) 100%)",
          }}
        />

        <div className="container absolute inset-0 z-10 mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center text-center">
          <div className="label label-gold justify-center mb-4 sm:mb-6">
            {t("solutions.hero.badge")}
          </div>
          <h1
            className="sh mb-4 sm:mb-6"
            style={{ fontSize: "clamp(2rem, 8vw, 6.5rem)" }}
          >
            <T
              keyName="solutions.hero.heading"
              params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
            />
          </h1>
          <p className="hidden min-[392px]:block text-gray-300 text-sm sm:text-lg font-light italic max-w-2xl mx-auto leading-relaxed px-2">
            {t("solutions.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* PDI & Quality Standards */}
      <section id="pdi" className="py-16 sm:py-20 md:py-28 bg-a scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="label mb-6">{t("solutions.pdi.label")}</div>
              <h2 className="sh mb-8">
                <T
                  keyName="solutions.pdi.heading"
                  params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
                />
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-10">
                {t("solutions.pdi.description")}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl border-accent/20">
                  <div className="text-3xl font-black italic text-accent mb-1">
                    100%
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-600">
                    {t("solutions.pdi.inspectionRate")}
                  </div>
                </div>
                <div className="glass p-6 rounded-2xl border-theme/20">
                  <div className="text-3xl font-black italic text-theme mb-1">
                    {t("solutions.pdi.digitalReports").split(" ")[0]}
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-600">
                    {t("solutions.pdi.digitalReports")}
                  </div>
                </div>
              </div>
            </div>

            <div className="glass rounded-[3rem] p-8 md:p-12">
              <div className="text-[10px] font-black tracking-widest uppercase text-accent mb-8 flex items-center gap-3">
                <span className="pulse-dot" /> {t("solutions.pdi.pdiCategories")}
              </div>
              <div className="space-y-6">
                {pdiChecklist.map((cat, i) => (
                  <div key={i}>
                    <h4 className="text-xs font-black uppercase text-white mb-3 tracking-widest">
                      {cat.title}
                    </h4>
                    <div className="grid gap-2">
                      {(Array.isArray(cat.items) ? cat.items : cat.items ? Object.values(cat.items) : []).map((item: string, j: number) => (
                        <div key={j} className="pdi-item">
                          <div className="pdi-check" />
                          <span className="text-xs text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Proof: Video Loading */}
      <section className="py-16 sm:py-20 md:py-28 relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/pic/page/photo-1520038410233-7141be7e6f97.webp"
            className="object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Port Loading"
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

        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="label label-gold justify-center mb-6">
              {t("solutions.loading.badge")}
            </div>
            <h2 className="sh mb-8">
              <T
                keyName="solutions.loading.heading"
                params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
              />
            </h2>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed mb-12">
              {t("solutions.loading.description")}
            </p>
            <div className="inline-flex items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-theme/10 border border-theme text-theme mb-3 font-semibold text-xs">
                  {t("solutions.loading.walkthrough").substring(0, 2)}
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
                  {t("solutions.loading.walkthrough")}
                </span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center bg-accent/10 border border-accent text-accent mb-3 font-semibold text-xs">
                  ✓
                </div>
                <span className="text-[9px] font-black tracking-widest uppercase text-gray-500">
                  {t("solutions.loading.sealVerification")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Starter Parts Kit */}
      <section id="parts" className="py-16 sm:py-20 md:py-28 bg-b scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="glass rounded-[3rem] p-10 md:p-14 border-theme/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-theme/5 rounded-bl-full pointer-events-none" />
                <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-8">
                  {t("solutions.partsKit.kitInventory")}
                </div>
                <div className="space-y-4">
                  {kitItems.map((item, i) => (
                    <div
                      key={i}
                      className="flex justify-between border-b border-white/5 pb-2"
                    >
                      <span className="text-sm text-gray-400 font-light">
                        {item.name}
                      </span>
                      <span className="text-xs font-black text-theme">
                        {item.qty}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-8 text-[9px] text-gray-600 italic">
                  {t("solutions.partsKit.kitDisclaimer")}
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="label mb-6">{t("solutions.partsKit.label")}</div>
              <h2 className="sh mb-8">
                <T
                  keyName="solutions.partsKit.heading"
                  params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
                />
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                {t("solutions.partsKit.description")}
              </p>
              <div className="flex items-start gap-4 mb-10">
                <div className="num-circle bg-accent/10 border border-accent text-accent font-semibold">
                  !
                </div>
                <p className="text-sm text-gray-400 italic">
                  &quot;{t("solutions.partsKit.quote")}&quot;
                </p>
              </div>
              <LocaleLink
                href="/solutions/configure-kit"
                className="btn-outline px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic"
              >
                {t("solutions.partsKit.configureButton")}
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>

      {/* Service Centre Setup */}
      <section id="service" className="py-16 sm:py-20 md:py-28 bg-a scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label label-gold mb-6">
                {t("solutions.serviceCentre.label")}
              </div>
              <h2 className="sh mb-8">
                <T
                  keyName="solutions.serviceCentre.heading"
                  params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
                />
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                {t("solutions.serviceCentre.description")}
              </p>
            </div>
            <div className="grid gap-4">
              {serviceCentreItems.map((item, i) => (
                <div key={i} className="glass rounded-2xl p-6 flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm ${
                      i < 2 ? "text-theme border-theme" : "text-accent border-accent"
                    }`}
                    style={{
                      background:
                        i < 2
                          ? "rgba(197,160,89,.1)"
                          : "rgba(16,185,129,.1)",
                      border: `1px solid ${
                        i < 2
                          ? "rgba(197,160,89,.25)"
                          : "rgba(16,185,129,.25)"
                      }`,
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-widest text-white mb-1">
                      {item.title}
                    </div>
                    <p className="text-xs text-gray-600 font-light">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Marketing Support */}
      <section id="marketing" className="py-16 sm:py-20 md:py-28 relative overflow-hidden scroll-mt-24">
        <div className="absolute inset-0">
          <Image
            src="/pic/hero/photo-1521791136064-7986c2920216.webp"
            className="object-cover"
            style={{ filter: "brightness(.28) grayscale(20%)" }}
            alt="Dealer Support"
            fill
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,.55)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%, transparent 80%, var(--color-mid) 100%)",
            }}
          />
        </div>
        <div className="relative z-10 container mx-auto px-6 md:px-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="label label-gold justify-center mb-6">
              {t("solutions.marketing.badge")}
            </div>
            <h2 className="sh mb-8">
              <T
                keyName="solutions.marketing.heading"
                params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
              />
            </h2>
            <p className="text-gray-400 text-lg font-light italic leading-relaxed mb-12">
              {t("solutions.marketing.description")}
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  title: t("solutions.marketing.visuals"),
                  desc: t("solutions.marketing.visualsDesc"),
                  cls: "text-theme",
                },
                {
                  title: t("solutions.marketing.digital"),
                  desc: t("solutions.marketing.digitalDesc"),
                  cls: "text-accent",
                },
                {
                  title: t("solutions.marketing.technical"),
                  desc: t("solutions.marketing.technicalDesc"),
                  cls: "text-white",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-8 rounded-[2rem]"
                  style={{
                    background: "rgba(0,0,0,.42)",
                    border: "1px solid rgba(255,255,255,.06)",
                  }}
                >
                  <h5
                    className={`text-[10px] font-black uppercase tracking-widest ${item.cls} mb-2`}
                  >
                    {item.title}
                  </h5>
                  <p className="text-xs text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trade Terms */}
      <section id="finance" className="py-16 sm:py-20 md:py-28 bg-b scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="label mb-6">{t("solutions.tradeTerms.label")}</div>
              <h2 className="sh mb-8">
                <T
                  keyName="solutions.tradeTerms.heading"
                  params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
                />
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-8">
                {t("solutions.tradeTerms.description")}
              </p>
              <div className="mb-8 rounded-2xl border border-accent/25 bg-accent/5 px-5 py-4">
                <div className="text-[9px] font-black uppercase tracking-[0.22em] text-accent mb-2">
                  {t("solutions.tradeTerms.paymentLabel")}
                </div>
                <p className="text-sm text-gray-400 font-light leading-relaxed">
                  {t("solutions.tradeTerms.paymentDesc")}
                </p>
              </div>
              <LocaleLink
                href="/contact"
                className="btn-primary px-9 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg"
              >
                {t("solutions.tradeTerms.discussButton")}
              </LocaleLink>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  value: "30%",
                  label: t("solutions.tradeTerms.depositLabel"),
                  cls: "text-theme",
                },
                {
                  value: "CIF",
                  label: t("solutions.tradeTerms.cifLabel"),
                  cls: "text-accent",
                  border: "rgba(16,185,129,.25)",
                },
                {
                  value: "70%",
                  label: t("solutions.tradeTerms.balanceLabel"),
                  cls: "text-theme",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="glass rounded-[2rem] p-8 text-center flex flex-col items-center gap-3"
                  style={
                    item.border
                      ? { borderColor: item.border }
                      : undefined
                  }
                >
                  <div
                    className={`text-4xl font-black italic ${item.cls}`}
                    style={
                      item.value === "CIF"
                        ? { fontSize: "1.5rem" }
                        : undefined
                    }
                  >
                    {item.value}
                  </div>
                  <div className="text-[9px] font-black tracking-widest uppercase text-gray-600 leading-relaxed whitespace-pre-line">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
