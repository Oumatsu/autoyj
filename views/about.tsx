"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslation } from "@/i18n/useTranslation";
import { T } from "@tolgee/react";

const mediaSlots = [
  {
    title: "Business License",
    label: "License Scan Album",
    featured: true,
    images: [
      "/pic/company/Business License/4.webp",
      "/pic/company/Business License/3.webp",
      "/pic/company/Business License/0.webp",
      "/pic/company/Business License/1.webp",
      "/pic/company/Business License/2.webp",
    ],
  },
  {
    title: "China Office",
    label: "Office Photo Album",
    images: [
      "/pic/company/Company Activity/0.webp",
      "/pic/company/Company Activity/1.webp",
      "/pic/company/Company Activity/2.webp",
    ],
  },
  {
    title: "Core Team",
    label: "Team Member Album",
    images: [
      "/pic/company/Core Team/0.webp",
      "/pic/company/Core Team/2.webp",
      "/pic/company/Core Team/3.webp",
    ],
  },
  {
    title: "Company Activity",
    label: "Team Building Album",
    images: [
      "/pic/company/Company Activity/1.webp",
      "/pic/company/Company Activity/0.webp",
      "/pic/company/Company Activity/2.webp",
    ],
  },
  {
    title: "Ethiopia Showroom",
    label: "Showroom Album",
    images: ["/pic/company/Ethiopia Showroom/0.webp"],
  },
  {
    title: "Ethiopia Contact",
    label: "Local Partner Contact Album",
    images: ["/pic/company/Ethiopia Contact/0.webp"],
  },
];

export default function AboutPage() {
  const { t, tArray } = useTranslation();
  const [lightbox, setLightbox] = useState<{
    albumIndex: number;
    imageIndex: number;
  } | null>(null);

  const activeAlbum =
    lightbox === null ? null : mediaSlots[lightbox.albumIndex];
  const activeImage =
    lightbox === null
      ? null
      : mediaSlots[lightbox.albumIndex].images[lightbox.imageIndex];

  const moveLightbox = (direction: -1 | 1) => {
    if (lightbox === null) return;
    const imageCount = mediaSlots[lightbox.albumIndex].images.length;
    setLightbox({
      albumIndex: lightbox.albumIndex,
      imageIndex: (lightbox.imageIndex + direction + imageCount) % imageCount,
    });
  };

  const heritageStats = tArray("about.heritage.stats");
  const proofStats = tArray("about.verification.stats");
  const capabilities = tArray("about.capability.items");
  const presenceNodes = tArray("about.presence.nodes");
  const galleryAlbums = tArray("about.gallery.albums");
  const logisticsItems = tArray("about.logistics.features");

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/pic/hero/3.webp"
            className="object-cover"
            alt="Mission"
            fill
            priority
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.45)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-mid) 10%, rgba(28,28,28,0.5) 45%, transparent 100%)",
            }}
          />
        </div>

        <div className="relative z-10 container mx-auto px-6 md:px-12 pt-24 pb-20">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="pulse-dot" />
              <span className="text-accent text-[10px] font-black uppercase tracking-[.3em]">
                {t("about.hero.badge")}
              </span>
            </div>
            <h1
              className="sh mb-8"
              style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}
            >
              <T keyName="about.hero.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
            </h1>
            <p
              className="text-xl text-gray-400 font-light italic border-l-2 pl-8 leading-relaxed max-w-xl"
              style={{ borderColor: "rgba(197,160,89,.3)" }}
            >
              {t("about.hero.description")}
            </p>
          </div>
        </div>
      </section>

      {/* Heritage */}
      <section className="py-24 sm:py-32 bg-a scroll-mt-48">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="label label-gold mb-6">{t("about.heritage.label")}</div>
              <h2 className="sh mb-8">
                <T keyName="about.heritage.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
              </h2>
              <p className="text-gray-500 text-lg font-light leading-relaxed mb-12">
                {t("about.heritage.description")}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {heritageStats.map((stat, i) => (
                  <div
                    key={i}
                    className="glass rounded-[2rem] p-6 text-center shadow-2xl glass-sm"
                  >
                    <div
                      className={`text-4xl font-black italic mb-2 ${
                        i === 0
                          ? "text-theme"
                          : i === 1
                          ? "text-accent"
                          : "text-white"
                      }`}
                    >
                      {stat.value}
                    </div>
                    <div className="text-[9px] font-black tracking-widest uppercase text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-[3rem] p-12 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="text-gold"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-2xl md:text-3xl font-light italic text-white leading-relaxed mb-8 relative z-10">
                &quot;{t("about.heritage.quote")}&quot;
              </p>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-px bg-theme" />
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                  {t("about.heritage.quoteLabel")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Company Verification */}
      <section id="verification" className="py-24 sm:py-32 bg-b scroll-mt-48">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="label label-gold mb-6">{t("about.verification.label")}</div>
              <h2 className="sh mb-8">
                <T keyName="about.verification.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {proofStats.map((stat, i) => (
                  <div key={i} className="glass rounded-[2rem] p-6">
                    <div className="text-3xl md:text-4xl font-black italic text-theme mb-2">
                      {stat.value}
                    </div>
                    <div className="text-[9px] font-black tracking-widest uppercase text-gray-500 leading-relaxed">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 space-y-6 text-gray-400 text-base md:text-lg font-light leading-relaxed">
              <p>{t("about.verification.paragraph1")}</p>
              <p>{t("about.verification.paragraph2")}</p>
              <p>{t("about.verification.paragraph3")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Verified Business Scope */}
      <section className="py-24 sm:py-32 bg-a scroll-mt-48">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div className="max-w-2xl">
              <div className="label label-gold mb-5">{t("about.capability.label")}</div>
              <h2 className="sh">
                <T keyName="about.capability.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
              </h2>
            </div>
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-xl">
              {t("about.capability.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((item, i) => (
              <div key={i} className="glass rounded-[2rem] p-7">
                <div className="num-circle mb-6 border border-theme text-theme">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-white text-lg font-black italic uppercase tracking-tight mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed font-light">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local Presence */}
      <section className="relative py-24 md:py-36 overflow-hidden scroll-mt-48">
        <div className="absolute inset-0">
          <Image
            src="/pic/page/photo-1523805009345-7448845a9e53.webp"
            className="object-cover"
            style={{ filter: "brightness(.34) grayscale(15%)" }}
            alt="Ethiopia local presence"
            fill
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/45" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 18%, transparent 78%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="label mb-6">{t("about.presence.label")}</div>
              <h2 className="sh mb-8">
                <T keyName="about.presence.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
              </h2>
              <p className="text-gray-300 text-lg font-light leading-relaxed mb-6">
                {t("about.presence.description1")}
              </p>
              <p className="text-gray-400 text-base font-light leading-relaxed">
                {t("about.presence.description2")}
              </p>
            </div>

            <div className="glass rounded-[3rem] p-8 md:p-10">
              <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-8">
                {t("about.presence.crossBorder")}
              </div>
              <div className="space-y-5">
                {presenceNodes.map((node: any, i: number) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-3 h-3 rounded-full bg-green mt-1.5 shadow-[0_0_18px_rgba(16,185,129,.6)]" />
                    <div>
                      <div className="text-white text-sm font-black uppercase tracking-wider mb-1">
                        {node.place}
                      </div>
                      <div className="text-gray-500 text-xs font-light leading-relaxed">
                        {node.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Evidence Gallery */}
      <section className="py-24 sm:py-32 bg-a scroll-mt-48">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="label justify-center mb-5">{t("about.gallery.label")}</div>
            <h2 className="sh">
              <T keyName="about.gallery.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto mt-6">
              {t("about.gallery.description")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[260px] xl:auto-rows-[300px] gap-6">
            {mediaSlots.map((slot, albumIndex) => {
              const albumTranslation = galleryAlbums[albumIndex] || {};
              const title = albumTranslation.title || slot.title;
              const label = albumTranslation.label || slot.label;
              return (
                <div
                  key={albumIndex}
                  className={`glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col ${
                    slot.featured ? "lg:col-span-2 lg:row-span-2" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setLightbox({ albumIndex, imageIndex: 0 })}
                    className="group block w-full flex-1 min-h-0 text-left"
                    aria-label={t("about.gallery.lightbox.openAlbum", { title }) as string}
                  >
                    <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                      <Image
                        src={slot.images[0]}
                        alt={title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                        style={{ filter: "brightness(.72) saturate(.85)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                      <div className="absolute top-5 right-5 rounded-full bg-black/55 border border-white/10 px-3 py-1 text-[8px] font-black uppercase tracking-[.18em] text-gray-300">
                        {slot.images.length} {t("about.gallery.photos")}
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="text-[8px] font-black uppercase tracking-[.2em] text-accent mb-2">
                          {label}
                        </div>
                        <h3
                          className={`text-white font-black italic uppercase tracking-tight drop-shadow-lg ${
                            slot.featured ? "text-xl md:text-2xl" : "text-base"
                          }`}
                        >
                          {title}
                        </h3>
                      </div>
                    </div>
                  </button>
                  <div className="grid grid-cols-3 gap-2 p-3 border-t border-white/5 shrink-0">
                    {slot.images.slice(0, 3).map((image, imageIndex) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setLightbox({ albumIndex, imageIndex })}
                        className="relative aspect-[4/3] overflow-hidden rounded-lg border border-white/5 hover:border-gold transition-colors"
                        aria-label={t("about.gallery.lightbox.viewPhoto", { index: imageIndex + 1 }) as string}
                      >
                        <Image
                          src={image}
                          alt={`${title} ${imageIndex + 1}`}
                          fill
                          sizes="150px"
                          className="object-cover"
                          style={{ filter: "brightness(.7)" }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Global Logistics Network */}
      <section className="relative py-24 sm:py-32 md:py-48 scroll-mt-48 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/pic/page/photo-1451187580459-43490279c0fa.webp"
            className="object-cover"
            style={{ filter: "brightness(.4) contrast(1.2) grayscale(40%)" }}
            alt="Global Network"
            fill
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: "rgba(10,10,10,0.5)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--color-mid) 0%, transparent 18%, transparent 78%, var(--color-mid) 100%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12">
          <div className="max-w-3xl mb-12 sm:mb-16">
            <div className="label label-gold mb-4">
              {t("about.logistics.label")}
            </div>
            <h2 className="sh text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6">
              <T
                keyName="about.logistics.heading"
                params={{
                  accent: (chunks: any) => <span className="text-accent">{chunks}</span>,
                  theme: (chunks: any) => <span className="text-theme">{chunks}</span>,
                }}
              />
            </h2>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
              {t("about.logistics.sub")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {logisticsItems.map((item, i) => (
              <div
                key={i}
                className="group relative rounded-2xl border border-white/5 bg-black/60 p-6 sm:p-8 backdrop-blur-sm hover:border-gold/30 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="text-3xl sm:text-4xl font-black italic text-accent/20 group-hover:text-accent/40 transition-colors mb-4 font-mono">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="text-white font-bold text-base sm:text-lg mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t("about.gallery.lightbox.dialog") as string}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in-0 duration-200"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-5xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 text-xs text-gray-400">
              <div>
                <span className="font-bold text-white uppercase tracking-wider">
                  {galleryAlbums[lightbox.albumIndex]?.title || activeAlbum.title}
                </span>
                <span className="mx-2 text-gray-600">/</span>
                <span>
                  {lightbox.imageIndex + 1} of {activeAlbum.images.length}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="text-2xl text-gray-400 hover:text-white transition-colors"
                aria-label={t("about.gallery.lightbox.close") as string}
              >
                &times;
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
              <Image
                src={activeImage}
                alt={`${galleryAlbums[lightbox.albumIndex]?.title || activeAlbum.title} enlarged`}
                width={1920}
                height={1080}
                className="max-h-[72vh] w-full object-contain"
              />
              {activeAlbum.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveLightbox(-1)}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-2xl text-white hover:border-gold transition-colors"
                    aria-label={t("about.gallery.lightbox.prev") as string}
                  >
                    {"<"}
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLightbox(1)}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-2xl text-white hover:border-gold transition-colors"
                    aria-label={t("about.gallery.lightbox.next") as string}
                  >
                    {">"}
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              {t("about.gallery.lightbox.photoCounter", {
                current: lightbox.imageIndex + 1,
                total: activeAlbum.images.length,
              }) as string}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
