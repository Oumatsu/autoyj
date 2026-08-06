"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";
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
  const currentIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const btnRowRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const panelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const h1Refs = useRef<Array<HTMLHeadingElement | null>>([]);

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
    dots.classList.toggle("right-4", overlap);
    dots.classList.toggle("sm:right-6", overlap);
    dots.classList.toggle("md:right-20", overlap);
    dots.classList.toggle("left-4", !overlap);
    dots.classList.toggle("sm:left-6", !overlap);
    dots.classList.toggle("md:left-20", !overlap);

    const counter = counterRef.current?.parentElement;
    if (counter) {
      counter.classList.toggle("left-4", overlap);
      counter.classList.toggle("sm:left-6", overlap);
      counter.classList.toggle("md:left-20", overlap);
      counter.classList.toggle("right-4", !overlap);
      counter.classList.toggle("sm:right-6", !overlap);
      counter.classList.toggle("md:right-20", !overlap);
    }
  }, []);

  const checkTitleLines = useCallback(() => {
    const el = h1Refs.current[currentIndexRef.current];
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (isNaN(lineHeight) || lineHeight === 0) return;
    const lines = Math.round(el.scrollHeight / lineHeight);
    let scale = 1;
    if (lines > 4) {
      const scales = [1, 1, 1, 1, 0.82, 0.7, 0.6, 0.52, 0.46];
      scale = scales[lines - 1] || 0.46;
    }
    el.style.fontSize = `calc(clamp(1.8rem, 7vw, 6.5rem) * ${scale})`;
  }, []);

  const showSlide = useCallback(
    (nextIndex: number) => {
      const normalizedIndex = ((nextIndex % SLIDE_COUNT) + SLIDE_COUNT) % SLIDE_COUNT;
      currentIndexRef.current = normalizedIndex;

      slideRefs.current.forEach((slide, index) => {
        slide?.classList.toggle("active", index === normalizedIndex);
      });
      panelRefs.current.forEach((panel, index) => {
        if (!panel) return;
        const active = index === normalizedIndex;
        panel.classList.toggle("opacity-100", active);
        panel.classList.toggle("pointer-events-auto", active);
        panel.classList.toggle("opacity-0", !active);
        panel.classList.toggle("pointer-events-none", !active);
        panel.setAttribute("aria-hidden", String(!active));
      });
      dotRefs.current.forEach((dot, index) => {
        dot?.classList.toggle("active", index === normalizedIndex);
      });
      if (counterRef.current) {
        counterRef.current.textContent = String(normalizedIndex + 1).padStart(2, "0");
      }

      btnRowRef.current =
        panelRefs.current[normalizedIndex]?.querySelector("[data-hero-buttons]") ?? null;
      checkOverlap();
      checkTitleLines();
    },
    [checkOverlap, checkTitleLines]
  );

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      showSlide(currentIndexRef.current + 1);
    }, 5500);
  }, [showSlide]);

  useEffect(() => {
    currentIndexRef.current = 0;
    showSlide(0);
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer, showSlide]);

  useEffect(() => {
    checkOverlap();
    checkTitleLines();
    const onResize = () => {
      checkOverlap();
      checkTitleLines();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [checkOverlap, checkTitleLines]);

  const goSlide = (n: number) => {
    showSlide(n);
    resetTimer();
  };

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
          ref={(node) => { slideRefs.current[i] = node; }}
          className={`slide ${i === 0 ? "active" : ""}`}
        >
          <img
            src={toStaticAssetUrl(SLIDE_IMAGES[i])}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(.95)" }}
            alt={t(`home.hero.slides.s${i}.label`)}
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
            const isActive = slideIndex === 0;
            const base = `home.hero.slides.s${slideIndex}`;
            return (
              <div
                key={slideIndex}
                ref={(node) => { panelRefs.current[slideIndex] = node; }}
                aria-hidden={!isActive}
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

                {/* Main heading — all t() calls inline for Tolgee DOM tagging */}
                <h1
                  ref={(node) => { h1Refs.current[slideIndex] = node; }}
                  className="sh mb-3 lg:mb-8"
                  style={{ fontSize: "calc(clamp(1.8rem, 7vw, 6.5rem) * 1)" }}
                >
                  <SlideHeading
                    line1={t(`${base}.line1`)}
                    line2={t(`${base}.line2`)}
                    line2Accent={t(`${base}.line2Accent`)}
                    line2Theme={t(`${base}.line2Theme`)}
                    line3={t(`${base}.line3`)}
                  />
                </h1>

                {/* Sub-copy */}
                <p
                  className="hidden sm:block text-xs md:text-lg lg:text-xl text-gray-500 mb-6 lg:mb-12 max-w-xl leading-relaxed italic border-l-2 pl-4 lg:pl-8"
                  style={{ borderColor: "rgba(197,160,89,.3)" }}
                >
                  {t(`${base}.sub`)}
                </p>

                {/* CTA buttons */}
                <div
                  ref={(node) => {
                    if (slideIndex === 0) btnRowRef.current = node;
                  }}
                  data-hero-buttons
                  className="flex flex-wrap gap-2 lg:gap-4"
                >
                  <a
                    href="#products"
                    className="btn-primary px-6 lg:px-10 py-3 lg:py-5 rounded text-[10px] lg:text-sm font-black tracking-widest uppercase italic"
                  >
                    {t(`${base}.cta`)}
                  </a>
                  <a
                    href="#solutions"
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
        className="absolute bottom-4 sm:bottom-10 z-10 flex gap-2 sm:gap-3 items-center transition-all duration-300 left-4 sm:left-6 md:left-20"
      >
        {slides.map((i) => (
          <button
            key={i}
            ref={(node) => { dotRefs.current[i] = node; }}
            type="button"
            aria-label={`Go to hero slide ${i + 1}`}
            className={`dot ${i === 0 ? "active" : ""}`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>

      {/* Slide counter */}
      <div className="absolute bottom-4 sm:bottom-10 z-10 text-[9px] sm:text-[10px] font-black tracking-widest text-gray-700 uppercase transition-all duration-300 right-4 sm:right-6 md:right-20">
        <span ref={counterRef} className="text-theme">01</span>
        <span> / {String(SLIDE_COUNT).padStart(2, "0")}</span>
      </div>
    </section>
  );
}

/**
 * SlideHeading renders the multi-line heading segments.
 * Lines with no content are skipped cleanly.
 */
function SlideHeading({
  line1,
  line2,
  line2Accent,
  line2Theme,
  line3,
}: {
  line1: string;
  line2: string;
  line2Accent: string;
  line2Theme: string;
  line3: string;
}) {
  const hasLine2 = line2 || line2Accent || line2Theme;

  return (
    <>
      {line1 && <span>{line1}</span>}
      {line1 && hasLine2 && <br />}
      {hasLine2 && (
        <>
          {line2 && <span>{line2}</span>}
          {line2Accent && <span className="text-accent">{line2Accent}</span>}
          {line2Theme && <span className="text-theme">{line2Theme}</span>}
        </>
      )}
      {hasLine2 && line3 && <br />}
      {line3 && <span>{line3}</span>}
    </>
  );
}
