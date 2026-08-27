"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

export type FeaturedVehicleCarouselResource = {
  id: string;
  brand: string;
  model: string;
  trim?: string | null;
  imageUrl: string;
  priceLabel: string;
};

function resourceName(resource: FeaturedVehicleCarouselResource) {
  return [resource.brand, resource.model].filter(Boolean).join(" ");
}

export function FeaturedVehicleCarousel({
  resources,
  onSelect,
  title = "Top featured vehicle resources",
}: {
  resources: FeaturedVehicleCarouselResource[];
  onSelect: (vehicleId: string) => void;
  title?: string;
}) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const resourceCount = resources.length;

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  if (resourceCount === 0) return null;

  return (
    <section
      aria-label="Featured vehicle resources"
      aria-roledescription="carousel"
      className="overflow-hidden rounded-2xl border border-[#d5ad49]/35 bg-[#070e1b] p-4 shadow-xl shadow-black/20 sm:p-5"
    >
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#d5ad49]">Featured stock</p>
          <h2 className="mt-1 text-lg font-black text-white sm:text-xl">{title}</h2>
        </div>
        <div className="flex shrink-0 gap-2" aria-label="Featured vehicle carousel controls">
          <button
            type="button"
            onClick={() => api?.scrollPrev()}
            aria-label="Previous featured vehicle"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-lg text-slate-200 transition hover:border-[#d5ad49] hover:text-[#d5ad49] disabled:opacity-30 disabled:pointer-events-none"
            disabled={!api?.canScrollPrev() && resourceCount <= 1}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => api?.scrollNext()}
            aria-label="Next featured vehicle"
            className="grid h-10 w-10 place-items-center rounded-lg border border-white/15 text-lg text-slate-200 transition hover:border-[#d5ad49] hover:text-[#d5ad49] disabled:opacity-30 disabled:pointer-events-none"
            disabled={!api?.canScrollNext() && resourceCount <= 1}
          >
            →
          </button>
        </div>
      </div>

      <Carousel
        setApi={setApi}
        opts={{
          align: "center",
          loop: resourceCount > 1,
        }}
        plugins={[
          Autoplay({
            delay: 5000,
            stopOnInteraction: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent data-featured-carousel-track="true" className="-ml-4">
          {resources.map((resource, index) => {
            const isActive = index === current;
            const name = resourceName(resource);
            return (
              <CarouselItem
                key={resource.id}
                className="pl-4 basis-[88%] sm:basis-[78%] md:basis-[68%] lg:basis-[58%] max-w-[620px]"
              >
                <article
                  data-featured-card-position={isActive ? "active" : "adjacent"}
                  aria-label={`${isActive ? "Current" : "Featured"} vehicle: ${name}`}
                  className={`relative h-[320px] sm:h-[380px] lg:h-[420px] w-full overflow-hidden rounded-2xl border bg-[#0c1424] shadow-2xl shadow-black/40 transition-all duration-500 ${
                    isActive
                      ? "scale-100 border-white/20 opacity-100 ring-1 ring-[#d5ad49]/40"
                      : "scale-95 border-white/10 opacity-60 hover:opacity-80"
                  }`}
                >
                  {resource.imageUrl ? (
                    <Image
                      src={
                        resource.imageUrl.startsWith("http://") ||
                        resource.imageUrl.startsWith("https://") ||
                        resource.imageUrl.startsWith("/")
                          ? resource.imageUrl
                          : `/${resource.imageUrl}`
                      }
                      alt={name}
                      fill
                      sizes="(max-width: 768px) 88vw, (max-width: 1200px) 70vw, 60vw"
                      className="object-cover"
                      priority={isActive}
                      loading={isActive ? "eager" : "lazy"}
                    />
                  ) : (
                    <div
                      aria-label={`${name} image unavailable`}
                      className="grid h-full place-items-center bg-[#0c1424] text-xs font-bold text-slate-500"
                    >
                      Image unavailable
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050a13] via-[#050a13]/40 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f3cf6a]">Featured resource</p>
                    <h3 className="mt-1.5 text-xl font-black text-white sm:text-2xl lg:text-3xl">{name}</h3>
                    {resource.trim ? <p className="mt-1 text-xs sm:text-sm text-slate-200">{resource.trim}</p> : null}
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <strong className="font-mono text-lg text-[#f3cf6a] sm:text-xl">{resource.priceLabel}</strong>
                      <button
                        type="button"
                        onClick={() => onSelect(resource.id)}
                        aria-label={`View featured vehicle ${name}`}
                        className="rounded-lg bg-[#d5ad49] px-4 py-2 text-xs sm:text-sm font-black text-[#07111f] transition hover:bg-[#f3cf6a]"
                      >
                        View stock
                      </button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Pagination Dots */}
      {resourceCount > 1 && (
        <div className="mt-4 flex justify-center gap-1.5">
          {resources.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => api?.scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-[#d5ad49]" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      <p className="sr-only">Showing featured vehicle {current + 1} of {resourceCount}</p>
    </section>
  );
}
