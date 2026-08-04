"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { vehicles as fallbackRevenue } from "../app/products/revenue-king/data";
import { vehicles as fallbackElite } from "../app/products/elite-flagship/data";
import { vehicles as fallbackUtility } from "../app/products/utility-pro/data";
import { translateOverviewCard } from "./products/productsOverviewTranslations.ts";
import { sanitizeDisplayData } from "@/lib/display-text";

function getBadgeCls(slug: string, badge: string | null): string {
  if (!badge) return "";
  if (slug === "byd-seagull") return "bg-gold text-black";
  if (slug === "gac-aion-rt") return "bg-accent/20 text-accent border border-accent/30";
  if (slug === "byd-qin-plus") return "";
  if (slug === "geely-galaxy-e5") return "bg-white/5 text-gray-500 border border-white/10";
  if (badge === "Global #1") return "bg-gold text-black";
  if (badge === "2025 New King") return "bg-accent/20 text-accent border border-accent/30";
  return "bg-white/5 text-gray-500 border border-white/10";
}

function getLocalizedBadge(slug: string, badge: string | null, t: any): string | null {
  if (!badge) return null;
  if (slug === "byd-seagull" || badge === "Global #1") return t("products.globalNumber1");
  if (slug === "gac-aion-rt" || badge === "2025 New King") return t("products.newKing2025");
  if (slug === "geely-galaxy-e5" || badge === "Global Model") return t("products.globalModel");
  if (badge === "Million-Unit Proof") return t("products.millionUnit");
  return badge;
}

function formatSaving(value: string | undefined, t: any): string {
  if (!value) return "";
  const amount = value
    .replace(/^Save\s*/i, "")
    .replace(/\s*\/\s*mo(?:nth)?$/i, "")
    .trim();
  const template = t("products.savePerMonthTemplate", "Save {amount}/month");
  return typeof template === "string"
    ? template.replace("{amount}", amount)
    : `Save ${amount}/month`;
}

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/portal/public/products")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: any) => setProducts(sanitizeDisplayData(data)))
      .catch(() => {});
  }, []);

  const revenueSlugs = ["byd-seagull", "gac-aion-rt", "byd-qin-plus", "geely-galaxy-e5"];
  const revenueKingList = products
    ? revenueSlugs.map(slug => products.find(p => p.slug === slug)).filter(Boolean)
    : [
        {
          name: "BYD Seagull",
          slug: "byd-seagull",
          badge: "Global #1",
          stat2Value: "Save $250",
          tags: ["LFP Blade", "405km Range"],
          img: "/pic/revenue-king/seagull/7cut.webp",
          link: "/products/revenue-king/byd-seagull",
        },
        {
          name: "GAC Aion RT",
          slug: "gac-aion-rt",
          badge: "2025 New King",
          stat2Value: "Save $380",
          tags: ["LiDAR ADAS", "520km Range"],
          img: "/pic/revenue-king/RT/7cut.webp",
          link: "/products/revenue-king/gac-aion-rt",
        },
        {
          name: "BYD Qin PLUS",
          slug: "byd-qin-plus",
          badge: null,
          stat2Value: "Save $350",
          tags: ["Million-Unit Proof", "510km Range"],
          img: "/pic/revenue-king/qinplusev/5cut.webp",
          link: "/products/revenue-king/byd-qin-plus",
        },
        {
          name: "Galaxy E5",
          slug: "geely-galaxy-e5",
          badge: "Global Model",
          stat2Value: "Save $220",
          tags: ["Aegis Battery", "530km Range"],
          img: "/pic/hero/Galaxye5 display.webp",
          link: "/products/revenue-king/geely-galaxy-e5",
        },
      ];

  const aitoM9 = products
    ? products.find(p => p.slug === "aito-m9")
    : {
        name: "AITO M9",
        tag: t("products.eliteFlagship.performanceKing"),
        desc: t("products.eliteFlagship.description"),
        label: t("products.eliteFlagship.techPinnacle").replace("{label}", t("products.eliteFlagship.performanceKing")),
        img: "/pic/hero/M9 display.webp",
        link: "/products/elite-flagship/aito-m9",
      };

  const eliteSmallList = products
    ? ["zeekr-001", "xiaomi-su7-ultra"].map(slug => products.find(p => p.slug === slug)).filter(Boolean)
    : [
        {
          name: "Zeekr 001",
          tag: "800V Ultra-Fast Charge",
          desc: "Extreme handling and range. The fastest charging executive shooting brake in the market.",
          label: t("products.eliteFlagship.techIcon"),
          img: "/pic/elite-flagship/001/0.webp",
          link: "/products/elite-flagship/zeekr-001",
        },
        {
          name: "Xiaomi SU7 Ultra",
          tag: "1500+ Horsepower",
          desc: "The ultimate social currency for tech-elite buyers. Carbon-fiber aero with peak acceleration.",
          label: t("products.eliteFlagship.performanceIcon"),
          img: "/pic/hero/SU7ultra display.webp",
          link: "/products/elite-flagship/xiaomi-su7-ultra",
        },
      ];

  const utilityList = products
    ? ["byd-shark", "radar-rd6", "farizon-xingxiang-v"].map(slug => products.find(p => p.slug === slug)).filter(Boolean)
    : [
        {
          name: "BYD Shark",
          tag: t("products.utilityPro.hybridPower"),
          desc: "PHEV Pickup with DMO off-road platform. 1000km+ total range for the hardest jobs.",
          label: t("products.utilityPro.hybridPower"),
          img: "/pic/utility-pro/shark/4cut.webp",
          link: "/products/utility-pro/byd-shark",
        },
        {
          name: "Radar RD6",
          tag: t("products.utilityPro.productionPower"),
          desc: "Pure electric efficiency for urban logistics and farms. 6kW external discharge capacity.",
          label: t("products.utilityPro.productionPower"),
          img: "/pic/hero/RD6 display0.webp",
          link: "/products/utility-pro/radar-rd6",
        },
        {
          name: "Farizon Xingxiang V",
          tag: t("products.utilityPro.digitalCargo"),
          desc: "Farizon urban delivery van with 6 m³ cargo capacity, proven reliability, and mature aftersales support.",
          label: t("products.utilityPro.digitalCargo"),
          img: "/pic/utility-pro/xingxiangv/5.webp",
          link: "/products/utility-pro/farizon-xingxiang-v",
        },
      ];

  const revenueCount = products
    ? products.filter((p) => p.category === "revenue-king").length
    : fallbackRevenue.length;

  const eliteCount = products
    ? products.filter((p) => p.category === "elite-flagship").length
    : fallbackElite.length;

  const utilityCount = products
    ? products.filter((p) => p.category === "utility-pro").length
    : fallbackUtility.length;

  const localizedRevenueKingList = revenueKingList.map((card) => translateOverviewCard(card, t));
  const localizedAitoM9 = translateOverviewCard(aitoM9, t);
  const localizedEliteSmallList = eliteSmallList.map((card) => translateOverviewCard(card, t));
  const localizedUtilityList = utilityList.map((card) => translateOverviewCard(card, t));

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero */}
      <section className="relative min-h-[720px] sm:min-h-[780px] lg:min-h-[900px] xl:min-h-[960px] overflow-hidden">
        <img
          src="/pic/hero/Our-solutions-durability-and-fatigue.webp"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "contrast(1.1)" }}
          alt={t("products.hero.imageAlt", "Curated vehicle selection")}
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(0, 0, 0, 0.45)" }}
        />
        {/* Vertical vignette: center clear → edges fade 35% */}
        <div
          className="absolute inset-0"
          style={{
            background: [
              `linear-gradient(to bottom,`,
              `  rgba(0,0,0,0.35) 0%,`,
              `  transparent 35%,`,
              `  transparent 65%,`,
              `  rgba(0,0,0,0.35) 100%`,
              `)`,
            ].join("\n"),
          }}
        />
        <div
          className="absolute bottom-0 left-0 right-0"
          style={{
            top: "60%",
            background: [
              `linear-gradient(to bottom,`,
              `  transparent 0%,`,
              `  rgba(28,28,28,0.05) 5%,`,
              `  rgba(28,28,28,0.10) 10%,`,
              `  rgba(28,28,28,0.15) 15%,`,
              `  rgba(28,28,28,0.20) 20%,`,
              `  rgba(28,28,28,0.25) 25%,`,
              `  rgba(28,28,28,0.30) 30%,`,
              `  rgba(28,28,28,0.35) 35%,`,
              `  rgba(28,28,28,0.40) 40%,`,
              `  rgba(28,28,28,0.45) 45%,`,
              `  rgba(28,28,28,0.50) 50%,`,
              `  rgba(28,28,28,0.55) 55%,`,
              `  rgba(28,28,28,0.60) 60%,`,
              `  rgba(28,28,28,0.65) 65%,`,
              `  rgba(28,28,28,0.70) 70%,`,
              `  rgba(28,28,28,0.75) 75%,`,
              `  rgba(28,28,28,0.80) 80%,`,
              `  rgba(28,28,28,0.85) 85%,`,
              `  rgba(28,28,28,0.90) 90%,`,
              `  rgba(28,28,28,0.95) 95%,`,
              `  rgba(28,28,28,1.00) 100%`,
              `)`,
            ].join("\n"),
          }}
        />

        <div className="container absolute inset-0 z-10 mx-auto px-4 sm:px-6 md:px-12 flex flex-col items-center justify-center text-center">
          <div className="label justify-center mb-4 sm:mb-6">
            {t("products.hero.badge")}
          </div>
          <h1
            className="sh mb-4 sm:mb-6"
            style={{ fontSize: "clamp(2rem, 8vw, 6.5rem)" }}
          >
            {t("products.hero.heading1")}{" "}
            <span className="text-theme">{t("products.hero.headingAccent1")}</span>
            <br />
            <span className="text-accent">{t("products.hero.headingAccent2")}</span>
          </h1>
          <p className="hidden min-[392px]:block text-gray-300 text-sm sm:text-lg font-light italic max-w-2xl mx-auto leading-relaxed px-2">
            {t("products.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Product Gallery */}
      <section className="py-16 sm:py-24 bg-a overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          {/* Category 01: Revenue King */}
          <div id="cat-01" className="mb-24 sm:mb-40 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label mb-4">{t("products.revenueKing.badge")}</div>
                <h2
                  className="sh mb-4"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {t("products.revenueKing.heading")}{" "}
                  <span className="text-accent">{t("products.revenueKing.headingAccent")}</span>.
                </h2>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  {t("products.revenueKing.description")}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="w-8 h-px bg-white/10" />
                {t("products.revenueKing.avgSaving")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {localizedRevenueKingList.map((localizedCar: any, i: number) => {
                const CardContent = (
                  <div className="group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-500 cursor-pointer">
                    <div className="aspect-[4/5] overflow-hidden relative">
                      <img
                        src={localizedCar.img}
                        alt={localizedCar.name}
                        className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                      {localizedCar.badge && (
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <span
                            className={`text-[8px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-wider ${getBadgeCls(
                              localizedCar.slug,
                              localizedCar.badge
                            )}`}
                          >
                            {getLocalizedBadge(localizedCar.slug, localizedCar.badge, t)}
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
                          {formatSaving(localizedCar.stat2Value, t)}
                        </div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tight">
                          {localizedCar.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5 sm:p-8">
                      <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
                        {(localizedCar.tags || []).map((tag: string, j: number) => (
                          <span
                            key={j}
                            className="text-[8px] font-black px-2 py-1 rounded bg-white/5 text-gray-500 uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-[10px] font-black text-theme uppercase tracking-widest flex items-center gap-2">
                        {localizedCar.link
                          ? t("products.revenueKing.cardLink")
                          : t("products.revenueKing.cardComingSoon")}
                      </div>
                    </div>
                  </div>
                );

                return localizedCar.link ? (
                  <LocaleLink key={i} href={localizedCar.link}>
                    {CardContent}
                  </LocaleLink>
                ) : (
                  <div key={i}>{CardContent}</div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <LocaleLink
                href="/products/revenue-king"
                className="group flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-3 sm:py-4 rounded-full border border-white/10 hover:border-accent/40 transition-all"
              >
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-500 group-hover:text-white">
                  {t("products.revenueKing.discoverMore").replace("{count}", String(revenueCount))}
                </span>
                <span className="w-4 sm:w-6 h-px bg-white/10 group-hover:bg-accent/50 transition-all" />
                <span className="text-accent group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </LocaleLink>
            </div>
          </div>

          {/* Category 02: Elite Flagship */}
          <div id="cat-02" className="mb-24 sm:mb-40 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label label-gold mb-4">{t("products.eliteFlagship.badge")}</div>
                <h2
                  className="sh mb-4"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {t("products.eliteFlagship.heading")}{" "}
                  <span className="text-theme">{t("products.eliteFlagship.headingAccent")}</span>.
                </h2>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  {t("products.eliteFlagship.description")}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="w-8 h-px bg-white/10" />
                {t("products.eliteFlagship.avgSaving")}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* AITO M9 - Mobile Card (matches Zeekr 001 style) */}
              <LocaleLink
                href={localizedAitoM9.link || "/products/elite-flagship/aito-m9"}
                className="lg:hidden group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-theme/30 transition-all duration-500 cursor-pointer"
              >
                <div className="aspect-[16/10] overflow-hidden relative">
                  <img
                    src={localizedAitoM9.img}
                    alt={localizedAitoM9.name}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-[9px] font-black text-theme uppercase tracking-[0.2em] mb-1">
                      {localizedAitoM9.tag || t("products.eliteFlagship.performanceKing")}
                    </div>
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                      {localizedAitoM9.name}
                    </h3>
                  </div>
                </div>
                <div className="p-5 sm:p-8">
                  <p className="text-gray-500 text-xs font-light leading-relaxed mb-4 sm:mb-6">
                    {localizedAitoM9.desc}
                  </p>
                  <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/5">
                    <div className="text-[10px] font-black text-theme uppercase tracking-widest">
                      {localizedAitoM9.label || t("products.eliteFlagship.techPinnacleLabel")}
                    </div>
                    <div className="text-[10px] font-black text-gray-600 uppercase">
                      {t("products.viewDetails")}
                    </div>
                  </div>
                </div>
              </LocaleLink>

              {/* AITO M9 - Desktop Large Card */}
              <LocaleLink
                href={localizedAitoM9.link || "/products/elite-flagship/aito-m9"}
                className="hidden lg:block group relative bg-bg3/30 rounded-[3rem] overflow-hidden border border-white/5 hover:border-theme/30 transition-all duration-500 cursor-pointer col-span-1 lg:col-span-2"
              >
                <div className="aspect-[21/9] overflow-hidden relative">
                  <img
                    src={localizedAitoM9.img}
                    alt={localizedAitoM9.name}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/20 to-transparent opacity-80" />
                  <div className="absolute inset-0 flex flex-col justify-center p-8 md:p-16">
                    <div className="label label-gold mb-4">
                      {localizedAitoM9.label || t("products.eliteFlagship.techPinnacleLabel")}
                    </div>
                    <h3 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
                      {localizedAitoM9.name}
                    </h3>
                    <p className="text-gray-400 text-sm md:text-base font-light italic max-w-md leading-relaxed mb-8">
                      {localizedAitoM9.desc}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <div className="px-6 py-3 rounded-full bg-theme text-black text-[10px] font-black uppercase tracking-widest">
                        {localizedAitoM9.tag || t("products.eliteFlagship.performanceKing")}
                      </div>
                      <div className="px-6 py-3 rounded-full border border-white/10 text-white text-[10px] font-black uppercase tracking-widest">
                        {formatSaving(localizedAitoM9.stat2Value, t) || t("products.eliteFlagship.savePerMonth")}
                      </div>
                    </div>
                  </div>
                </div>
              </LocaleLink>

              {localizedEliteSmallList.map((localizedCar: any, i: number) => {
                const CardContent = (
                  <div className="group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-theme/30 transition-all duration-500 cursor-pointer">
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={localizedCar.img}
                        alt={localizedCar.name}
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="text-[9px] font-black text-theme uppercase tracking-[0.2em] mb-1">
                          {localizedCar.tag}
                        </div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                          {localizedCar.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5 sm:p-8">
                      <p className="text-gray-500 text-xs font-light leading-relaxed mb-4 sm:mb-6">
                        {localizedCar.desc}
                      </p>
                      <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/5">
                        <div className="text-[10px] font-black text-theme uppercase tracking-widest">
                          {localizedCar.label}
                        </div>
                        <div className="text-[10px] font-black text-gray-600 uppercase">
                          {t("products.viewDetails")}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return localizedCar.link ? (
                  <LocaleLink key={i} href={localizedCar.link}>
                    {CardContent}
                  </LocaleLink>
                ) : (
                  <div key={i}>{CardContent}</div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <LocaleLink
                href="/products/elite-flagship"
                className="group flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-3 sm:py-4 rounded-full border border-white/10 hover:border-theme/40 transition-all"
              >
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-500 group-hover:text-white">
                  {t("products.eliteFlagship.discoverMore").replace("{count}", String(eliteCount))}
                </span>
                <span className="w-4 sm:w-6 h-px bg-white/10 group-hover:bg-theme/50 transition-all" />
                <span className="text-theme group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </LocaleLink>
            </div>
          </div>

          {/* Category 03: Utility Pro */}
          <div id="cat-03" className="mb-24 scroll-mt-40">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-xl">
                <div className="label mb-4">{t("products.utilityPro.badge")}</div>
                <h2
                  className="sh mb-4"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                >
                  {t("products.utilityPro.heading")}{" "}
                  <span className="text-accent">{t("products.utilityPro.headingAccent")}</span>.
                </h2>
                <p className="text-gray-500 text-sm font-light italic leading-relaxed">
                  {t("products.utilityPro.description")}
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-gray-700">
                <span className="w-8 h-px bg-white/10" />
                {t("products.utilityPro.fuelSaving")}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {localizedUtilityList.map((localizedCar: any, i: number) => {
                const CardContent = (
                  <div className="group relative bg-bg3/30 rounded-[2.5rem] overflow-hidden border border-white/5 hover:border-accent/30 transition-all duration-500 cursor-pointer">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img
                        src={localizedCar.img}
                        alt={localizedCar.name}
                        className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="text-[9px] font-black text-accent uppercase tracking-[0.2em] mb-1">
                          {localizedCar.tag}
                        </div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                          {localizedCar.name}
                        </h3>
                      </div>
                    </div>
                    <div className="p-5 sm:p-8">
                      <p className="text-gray-500 text-xs font-light leading-relaxed mb-4 sm:mb-6">
                        {localizedCar.desc}
                      </p>
                      <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/5">
                        <div className="text-[10px] font-black text-accent uppercase tracking-widest">
                          {localizedCar.label}
                        </div>
                        <div className="text-[10px] font-black text-gray-600 uppercase italic">
                          {t("products.viewDetails")}
                        </div>
                      </div>
                    </div>
                  </div>
                );

                return localizedCar.link ? (
                  <LocaleLink key={i} href={localizedCar.link}>
                    {CardContent}
                  </LocaleLink>
                ) : (
                  <div key={i}>{CardContent}</div>
                );
              })}
            </div>

            <div className="flex justify-center">
              <LocaleLink
                href="/products/utility-pro"
                className="group flex items-center gap-3 sm:gap-4 px-6 sm:px-10 py-3 sm:py-4 rounded-full border border-white/10 hover:border-accent/40 transition-all"
              >
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-gray-500 group-hover:text-white">
                  {t("products.utilityPro.discoverMore").replace("{count}", String(utilityCount))}
                </span>
                <span className="w-4 sm:w-6 h-px bg-white/10 group-hover:bg-accent/50 transition-all" />
                <span className="text-accent group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
