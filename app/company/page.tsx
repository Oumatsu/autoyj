"use client";

import { useState } from "react";

const proofStats = [
  { value: "2013", label: "Parent company established" },
  { value: "13+", label: "Years in automotive sector" },
  { value: "300m²", label: "Ethiopia showroom and service facility" },
  { value: "2", label: "Key Africa service nodes" },
];

const capabilities = [
  {
    title: "NEV Export",
    desc: "Sourcing and export coordination for new energy vehicles from China to overseas distributors.",
  },
  {
    title: "Spare Parts Supply",
    desc: "Parts sourcing, starter inventory planning, and long-term replenishment support for exported vehicles.",
  },
  {
    title: "Maintenance Equipment",
    desc: "Workshop tools, diagnostic devices, repair equipment, and service process setup for local partners.",
  },
  {
    title: "After-Sales System",
    desc: "Technical training, diagnostic support, repair solutions, and lifecycle service capability building.",
  },
];

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
      "/pic/company/China Office/0.webp",
      "/pic/company/China Office/2.webp",
      "/pic/company/China Office/1.webp",
    ],
  },
  {
    title: "Core Team",
    label: "Team Member Album",
    images: [
      "/pic/company/Core Team/0.webp",
      "/pic/company/Core Team/1.webp",
      "/pic/company/Core Team/2.webp",
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
    images: [
      "/pic/company/Ethiopia Showroom/0.webp",
    ],
  },
  {
    title: "Ethiopia Contact",
    label: "Local Partner Contact Album",
    images: [
      "/pic/company/Ethiopia Contact/0.webp",
    ],
  },
];

export default function CompanyPage() {
  const [lightbox, setLightbox] = useState<{
    albumIndex: number;
    imageIndex: number;
  } | null>(null);

  const activeAlbum =
    lightbox === null ? null : mediaSlots[lightbox.albumIndex];
  const activeImage =
    lightbox === null ? null : mediaSlots[lightbox.albumIndex].images[lightbox.imageIndex];

  const moveLightbox = (direction: -1 | 1) => {
    if (lightbox === null) return;
    const imageCount = mediaSlots[lightbox.albumIndex].images.length;
    setLightbox({
      albumIndex: lightbox.albumIndex,
      imageIndex: (lightbox.imageIndex + direction + imageCount) % imageCount,
    });
  };

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />

      <section className="relative min-h-[82vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/pic/page/photo-1451187580459-43490279c0fa.webp"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.45) contrast(1.15)" }}
            alt="Company background"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, var(--color-mid) 0%, rgba(28,28,28,.68) 34%, transparent 76%)",
            }}
          />
        </div>

        <div className="container relative z-10 mx-auto px-6 md:px-12 pt-24 pb-20">
          <div className="max-w-4xl">
            <div className="label label-gold mb-6">Company Verification</div>
            <h1
              className="sh mb-8"
              style={{ fontSize: "clamp(2.7rem, 7vw, 6.2rem)" }}
            >
              Youguard
              <br />
              <span className="text-theme">Technology</span>
              <br />
              Limited
            </h1>
            <p
              className="text-lg md:text-xl text-gray-300 font-light italic border-l-2 pl-6 md:pl-8 leading-relaxed max-w-2xl"
              style={{ borderColor: "rgba(197,160,89,.35)" }}
            >
              A China-based automotive enterprise focused on new energy vehicle
              export, integrated automotive solutions, and long-term overseas
              service capability.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="lg:col-span-5">
              <div className="label mb-6">Industrial Foundation</div>
              <h2 className="sh mb-8">
                Built on
                <br />
                <span className="text-theme">Automotive</span>
                <br />
                Experience.
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {proofStats.map((stat) => (
                  <div key={stat.label} className="glass rounded-[2rem] p-6">
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
              <p>
                Youguard Technology Limited is a China-based automotive
                enterprise with a strong industrial foundation and over 13 years
                of experience in the automotive sector. Its parent company,
                established in 2013, has been deeply involved in the automotive
                industry and has developed extensive expertise across vehicle
                supply chains, international trade, and after-sales systems.
              </p>
              <p>
                The group is recognized as a National High-Tech Enterprise in
                China and serves as a Vice Chairman Member of the Shanghai
                Science and Technology Enterprise Federation, reflecting its
                technological capability and industry influence.
              </p>
              <p>
                Building on this foundation, Youguard focuses on new energy
                vehicle export and integrated automotive solutions. Beyond
                vehicle trading, the company is committed to building a
                full-service ecosystem that supports overseas distributors and
                end users with technical training, repair solutions, diagnostic
                support, and long-term service capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14">
            <div className="max-w-2xl">
              <div className="label label-gold mb-5">Core Business</div>
              <h2 className="sh">
                Complete
                <br />
                Lifecycle Support.
              </h2>
            </div>
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-xl">
              Youguard delivers not only vehicles, but also the parts,
              equipment, training, and support systems required to operate them
              reliably in overseas markets.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {capabilities.map((item, i) => (
              <div key={item.title} className="glass rounded-[2rem] p-7">
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

      <section className="relative py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/pic/page/photo-1523805009345-7448845a9e53.webp"
            className="w-full h-full object-cover"
            style={{ filter: "brightness(.34) grayscale(15%)" }}
            alt="Ethiopia local presence"
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
              <div className="label mb-6">Africa Service Network</div>
              <h2 className="sh mb-8">
                Local
                <br />
                <span className="text-theme">Presence</span>
                <br />
                Matters.
              </h2>
              <p className="text-gray-300 text-lg font-light leading-relaxed mb-6">
                To strengthen its international service network, Youguard has
                established strategic partnerships in key African markets. In
                Ethiopia, the company works closely with local partners and
                operates a 300-square-meter automotive showroom and service
                facility, providing vehicle display, sales support, and
                after-sales maintenance capabilities.
              </p>
              <p className="text-gray-400 text-base font-light leading-relaxed">
                In Djibouti, Youguard&apos;s partner company provides critical
                logistical and trade facilitation support, including customs
                clearance services and import coordination for vehicles entering
                Ethiopia via Djibouti.
              </p>
            </div>

            <div className="glass rounded-[3rem] p-8 md:p-10">
              <div className="text-[10px] font-black tracking-widest uppercase text-theme mb-8">
                Cross-Border Structure
              </div>
              <div className="space-y-5">
                {[
                  ["China", "Vehicle sourcing, export preparation, documentation"],
                  ["Djibouti", "Port coordination, customs clearance, transit support"],
                  ["Ethiopia", "Showroom display, sales support, service response"],
                ].map(([place, desc]) => (
                  <div key={place} className="flex gap-4 items-start">
                    <div className="w-3 h-3 rounded-full bg-green mt-1.5 shadow-[0_0_18px_rgba(16,185,129,.6)]" />
                    <div>
                      <div className="text-white text-sm font-black uppercase tracking-wider mb-1">
                        {place}
                      </div>
                      <div className="text-gray-500 text-xs font-light leading-relaxed">
                        {desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="text-center mb-16">
            <div className="label justify-center mb-5">Evidence Gallery</div>
            <h2 className="sh">
              Verification
              <br />
              <span className="text-theme">Materials</span>.
            </h2>
            <p className="text-gray-500 text-sm md:text-base font-light leading-relaxed max-w-2xl mx-auto mt-6">
              These image positions are reserved for company office photos,
              team records, activity materials, business license scans,
              showroom materials, and local partner contact proof. Current
              images are placeholders and can be replaced with final assets
              later.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-[260px] xl:auto-rows-[300px] gap-6">
            {mediaSlots.map((slot, albumIndex) => (
              <div
                key={slot.title}
                className={`glass rounded-[2rem] overflow-hidden border border-white/5 flex flex-col ${
                  slot.featured ? "lg:col-span-2 lg:row-span-2" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setLightbox({ albumIndex, imageIndex: 0 })}
                  className="group block w-full flex-1 min-h-0 text-left"
                  aria-label={`Open ${slot.title} album`}
                >
                  <div className="aspect-[4/3] lg:aspect-auto lg:h-full relative overflow-hidden">
                    <img
                      src={slot.images[0]}
                      alt={slot.title}
                      className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
                      style={{ filter: "brightness(.72) saturate(.85)" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                    <div className="absolute top-5 right-5 rounded-full bg-black/55 border border-white/10 px-3 py-1 text-[8px] font-black uppercase tracking-[.18em] text-gray-300">
                      {slot.images.length} Photos
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <div className="text-[8px] font-black uppercase tracking-[.2em] text-accent mb-2">
                        {slot.label}
                      </div>
                      <h3
                        className={`text-white font-black italic uppercase tracking-tight drop-shadow-lg ${
                          slot.featured ? "text-xl md:text-2xl" : "text-base"
                        }`}
                      >
                        {slot.title}
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
                      className="aspect-[4/3] overflow-hidden rounded-lg border border-white/5 hover:border-gold transition-colors"
                      aria-label={`Open ${slot.title} photo ${imageIndex + 1}`}
                    >
                      <img
                        src={image}
                        alt={`${slot.title} ${imageIndex + 1}`}
                        className="w-full h-full object-cover"
                        style={{ filter: "brightness(.7)" }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 md:py-28 bg-b">
        <div className="container mx-auto px-6 md:px-12">
          <div className="glass rounded-[3rem] p-10 md:p-16 text-center">
            <div className="label justify-center label-gold mb-6">
              Long-Term Partner
            </div>
            <h2
              className="sh mb-8"
              style={{ fontSize: "clamp(2.4rem,6vw,5rem)" }}
            >
              Vehicles Plus
              <br />
              <span className="text-accent">Lifecycle Support</span>.
            </h2>
            <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-3xl mx-auto">
              Through its combination of industrial experience, technical
              capability, and localized overseas infrastructure, Youguard is
              positioned as a reliable long-term partner in the global new
              energy automotive industry, delivering complete lifecycle support
              solutions for distributors and end users.
            </p>
          </div>
        </div>
      </section>

      {lightbox !== null && activeAlbum !== null && activeImage !== null && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/92 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${activeAlbum.title} enlarged gallery`}
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            onClick={() => setLightbox(null)}
            aria-label="Close gallery"
          />
          <div className="relative z-10 w-full max-w-6xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="text-[9px] font-black uppercase tracking-[.24em] text-accent mb-1">
                  {activeAlbum.label}
                </div>
                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white">
                  {activeAlbum.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(null)}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/5 text-white text-2xl leading-none hover:border-gold transition-colors"
                aria-label="Close gallery"
              >
                ×
              </button>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-2xl">
              <img
                src={activeImage}
                alt={`${activeAlbum.title} enlarged`}
                className="max-h-[72vh] w-full object-contain"
              />
              {activeAlbum.images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => moveLightbox(-1)}
                    className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-2xl text-white hover:border-gold transition-colors"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => moveLightbox(1)}
                    className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/60 text-2xl text-white hover:border-gold transition-colors"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                Photo {lightbox.imageIndex + 1} / {activeAlbum.images.length}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {activeAlbum.images.map((image, imageIndex) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() =>
                      setLightbox({
                        albumIndex: lightbox.albumIndex,
                        imageIndex,
                      })
                    }
                    className={`h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg border transition-colors ${
                      imageIndex === lightbox.imageIndex
                        ? "border-gold"
                        : "border-white/10"
                    }`}
                    aria-label={`View photo ${imageIndex + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${activeAlbum.title} thumbnail ${imageIndex + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
