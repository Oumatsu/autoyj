"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useTranslation, T } from "@/i18n/useTranslation";
import { toStaticAssetUrl } from "@/lib/static-asset-url";

const SLIDE_IMAGES = [
  "/pic/hero/ChatGPT Image 2026年5月18日 19_47_04.webp",
  "/pic/hero/photo-1578575437130-527eed3abbec.webp",
  "/pic/hero/title3 (2).webp",
  "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
  "/pic/hero/photo-1521791136064-7986c2920216.webp",
];

const SLIDE_COUNT = 5;

export function HeroSlider() {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOverlap, setIsOverlap] = useState(false);
  const btnRowRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  const checkOverlap = useCallback(() => {
    const btnRow = btnRowRef.current;
    const dots = dotsRef.current;
    if (!btnRow || !dots) return;
    const btnRect = btnRow.getBoundingClientRect();
    const dotsRect = dots.getBoundingClientRect();
    const overlap = !(
      btnRect.right < dotsRect.left ||
      btnRect.left > dotsRect.right ||
      btnRect.bottom < dotsRect.top ||
      btnRect.top > dotsRect.bottom
    );
    setIsOverlap(overlap);
  }, []);

  const goSlide = useCallback((n: number) => {
    const next = ((n % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
    setCurrentIndex(next);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDE_COUNT);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    checkOverlap();
    const onResize = () => checkOverlap();
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, [checkOverlap, currentIndex]);

  const slides = Array.from({ length: SLIDE_COUNT }, (_, i) => i);

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "4/3" }}
    >
      <style>{`@media (min-width: 1024px) { #hero { aspect-ratio: auto; height: 100vh; } }`}</style>

      {/* Background images */}
      {slides.map((i) => (
        <div
          key={i}
          className={`slide ${i === currentIndex ? "active" : ""}`}
        >
          <img
            src={toStaticAssetUrl(SLIDE_IMAGES[i])}
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(.95)" }}
            alt={t(`home.hero.slides.s${i}.label`)}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : "low"}
            decoding={i === 0 ? "sync" : "async"}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to top, rgba(28,28,28,.95) 0%, rgba(28,28,28,.45) 35%, transparent 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to right, rgba(28,28,28,.5) 28%, transparent 75%)",
            }}
          />
        </div>
      ))}

      {/* Content panels — each t() call is inline JSX so Tolgee can inject _tolgee DOM attributes */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 md:px-12 lg:px-20 pt-4 lg:pt-20 pb-8 lg:pb-24">
        <div className="grid max-w-3xl w-full">
          {slides.map((slideIndex) => {
            const isActive = slideIndex === currentIndex;
            const base = `home.hero.slides.s${slideIndex}`;
            return (
              <div
                key={slideIndex}
                aria-hidden={!isActive}
                inert={!isActive ? true : undefined}
                className={`transition-opacity duration-700 ${
                  isActive ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                }`}
                style={{ gridArea: "1 / 1" }}
              >
                {/* Label badge */}
                <div className="flex items-center gap-2 mb-3 lg:mb-6">
                  <div className="pulse-dot" />
                  <span className="text-accent text-[8px] lg:text-[10px] font-black uppercase tracking-[.2em] lg:tracking-[.3em]">
                    {t(`${base}.label`)}
                  </span>
                </div>
                {slideIndex === 0 ? (
                  <h1
                    className="sh mb-3 lg:mb-8"
                    style={{ fontSize: "calc(clamp(1.8rem, 7vw, 6.5rem) * 1)" }}
                  >
                    <T
                      keyName={`${base}.heading`}
                      params={{
                        accent: (chunks: any) => <span className="text-accent">{chunks}</span>,
                        theme: (chunks: any) => <span className="text-theme">{chunks}</span>,
                        br: () => <br />,
                      }}
                    />
                  </h1>
                ) : (
                  <div
                    role="heading"
                    aria-level={2}
                    className="sh mb-3 lg:mb-8"
                    style={{ fontSize: "calc(clamp(1.8rem, 7vw, 6.5rem) * 1)" }}
                  >
                    <T
                      keyName={`${base}.heading`}
                      params={{
                        accent: (chunks: any) => <span className="text-accent">{chunks}</span>,
                        theme: (chunks: any) => <span className="text-theme">{chunks}</span>,
                        br: () => <br />,
                      }}
                    />
                  </div>
                )}

                {/* Sub-copy (High-contrast for WCAG 2.1 AA) */}
                <p
                  className="hidden sm:block text-xs md:text-lg lg:text-xl text-gray-300 mb-6 lg:mb-12 max-w-xl leading-relaxed italic border-l-2 pl-4 lg:pl-8"
                  style={{ borderColor: "rgba(197,160,89,.3)" }}
                >
                  {t(`${base}.sub`)}
                </p>

                {/* CTA buttons */}
                <div
                  ref={isActive ? btnRowRef : undefined}
                  data-hero-buttons
                  className="flex flex-wrap gap-2 lg:gap-4"
                >
                  <a
                    href="#products"
                    tabIndex={isActive ? 0 : -1}
                    className="btn-primary px-6 lg:px-10 py-3 lg:py-5 rounded text-[10px] lg:text-sm font-black tracking-widest uppercase italic"
                  >
                    {t(`${base}.cta`)}
                  </a>
                  <a
                    href="#solutions"
                    tabIndex={isActive ? 0 : -1}
                    className="btn-outline px-6 lg:px-10 py-3 lg:py-5 rounded text-[10px] lg:text-sm font-black tracking-widest uppercase italic"
                  >
                    {t("home.hero.process")}
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation dots */}
      <div
        ref={dotsRef}
        className={`absolute bottom-4 sm:bottom-10 z-10 flex gap-2 sm:gap-3 items-center transition-all duration-300 ${
          isOverlap ? "right-4 sm:right-6 md:right-20" : "left-4 sm:left-6 md:left-20"
        }`}
      >
        {slides.map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`Go to hero slide ${i + 1}`}
            className={`dot ${i === currentIndex ? "active" : ""}`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div
        className={`absolute bottom-4 sm:bottom-10 z-10 text-[9px] sm:text-[10px] font-black tracking-widest text-gray-700 uppercase transition-all duration-300 ${
          isOverlap ? "left-4 sm:left-6 md:left-20" : "right-4 sm:right-6 md:right-20"
        }`}
      >
        <span className="text-theme">{String(currentIndex + 1).padStart(2, "0")}</span>
        <span> / {String(SLIDE_COUNT).padStart(2, "0")}</span>
      </div>
    </section>
  );
}


