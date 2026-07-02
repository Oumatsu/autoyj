"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";

type H1Seg = string | { text: string; cls: string };

const slidesData = [
  {
    img: "/pic/hero/ChatGPT Image 2026年5月18日 19_47_04.webp",
    alt: "Expert Buyer",
    label: "Expert Buyer Network",
    lines: [
      ["Your Dedicated"],
      [{ text: "EV Sourcing", cls: "text-theme" }],
      ["Expert"],
    ] as H1Seg[][],
    sub: "Data-driven selection and rigorous quality checks tailored for the African market",
    cta: "View Selection",
  },
  {
    img: "/pic/hero/photo-1578575437130-527eed3abbec.webp",
    alt: "Port Logistics",
    label: "Seamless Port Logistics",
    lines: [
      ["China to Your Port"],
      [
        { text: "Seamlessly", cls: "text-theme" },
        " Delivered",
      ],
    ] as H1Seg[][],
    sub: "We handle complex shipping, customs documentation, and secure container loading",
    cta: "Explore Our Process",
  },
  {
    img: "/pic/hero/title3 (2).webp",
    alt: "African Roads",
    label: "Built for African Roads",
    lines: [
      ["Selected for"],
      [
        "Your ",
        { text: "Eco", cls: "text-accent" },
        " ",
        { text: "Profit", cls: "text-theme" },
      ],
    ] as H1Seg[][],
    sub: "High-clearance, durable EVs perfectly suited for African roads and climates",
    cta: "Explore Utility Pro",
  },
  {
    img: "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
    alt: "Aftersales",
    label: "Zero-Headache Aftersales",
    lines: [
      ["Every Shipment"],
      [
        { text: "Fully", cls: "text-accent" },
        " ",
        { text: "Supported", cls: "text-theme" },
      ],
    ] as H1Seg[][],
    sub: "Starter Parts Kit + digital repair manuals + remote tech support included",
    cta: "Discover Dealer Support",
  },
  {
    img: "/pic/hero/photo-1521791136064-7986c2920216.webp",
    alt: "Partnership",
    label: "Ecosystem Partnership",
    lines: [
      ["More Than"],
      [
        "Selling ",
        { text: "Cars", cls: "text-theme" },
      ],
    ] as H1Seg[][],
    sub: "We build dealerships Turnkey solutions from marketing assets to showroom strategies",
    cta: "Become a Partner",
  },
];

export function HeroSlider() {
  const [cur, setCur] = useState(0);
  const [dotsOnRight, setDotsOnRight] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const btnRowRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);

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
    setDotsOnRight(overlap);
  }, []);

  const checkTitleLines = useCallback(() => {
    const el = h1Ref.current;
    if (!el) return;
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
    if (isNaN(lineHeight) || lineHeight === 0) return;
    const lines = Math.round(el.scrollHeight / lineHeight);
    if (lines > 4) {
      const scales = [1, 1, 1, 1, 0.82, 0.70, 0.60, 0.52, 0.46];
      setFontSizeScale(scales[lines - 1] || 0.46);
    } else {
      setFontSizeScale(1);
    }
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCur((prev) => (prev + 1) % 5);
    }, 5500);
  }, []);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  useEffect(() => {
    checkOverlap();
    checkTitleLines();
    const onResize = () => { checkOverlap(); checkTitleLines(); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [cur, checkOverlap, checkTitleLines]);

  const goSlide = (n: number) => {
    setCur(n);
    resetTimer();
  };

  const d = slidesData[cur];

  return (
    <section id="hero" className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
      <style>{`@media (min-width: 1024px) { #hero { aspect-ratio: auto; height: 100vh; } }`}</style>
      {slidesData.map((slide, i) => (
        <div key={i} className={`slide ${i === cur ? "active" : ""}`}>
          <img
            src={slide.img}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(.95)" }}
            alt={slide.alt}
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

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-4 md:px-12 lg:px-20 pt-4 lg:pt-20 pb-8 lg:pb-24">
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-2 mb-3 lg:mb-6">
            <div className="pulse-dot" />
            <span className="text-accent text-[8px] lg:text-[10px] font-black uppercase tracking-[.2em] lg:tracking-[.3em]">
              {d.label}
            </span>
          </div>

          <h1
            ref={h1Ref}
            className="sh mb-3 lg:mb-8"
            style={{ fontSize: `calc(clamp(1.8rem, 7vw, 6.5rem) * ${fontSizeScale})` }}
          >
            {d.lines.map((line, i) => (
              <React.Fragment key={i}>
                {i > 0 && <br />}
                {line.map((seg, j) =>
                  typeof seg === "string" ? (
                    seg
                  ) : (
                    <span key={j} className={seg.cls}>
                      {seg.text}
                    </span>
                  ),
                )}
              </React.Fragment>
            ))}
          </h1>

          <p
            className="hidden min-[376px]:block text-xs lg:text-lg md:text-xl text-gray-500 mb-6 lg:mb-12 max-w-xl leading-relaxed italic border-l-2 pl-4 lg:pl-8"
            style={{ borderColor: "rgba(197,160,89,.3)" }}
          >
            {d.sub}
          </p>

          <div ref={btnRowRef} className="flex flex-wrap gap-2 lg:gap-4">
            <a
              href="#products"
              className="btn-primary px-6 lg:px-10 py-3 lg:py-5 rounded text-[10px] lg:text-sm font-black tracking-widest uppercase italic"
            >
              {d.cta}
            </a>
            <a
              href="#solutions"
              className="btn-outline px-6 lg:px-10 py-3 lg:py-5 rounded text-[10px] lg:text-sm font-black tracking-widest uppercase italic"
            >
              Our Process
            </a>
          </div>
        </div>
      </div>

      <div
        ref={dotsRef}
        className={`absolute bottom-4 sm:bottom-10 z-10 flex gap-2 sm:gap-3 items-center transition-all duration-300 ${dotsOnRight ? "right-4 sm:right-6 md:right-20" : "left-4 sm:left-6 md:left-20"}`}
      >
        {slidesData.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === cur ? "active" : ""}`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>

      <div className={`absolute bottom-4 sm:bottom-10 z-10 text-[9px] sm:text-[10px] font-black tracking-widest text-gray-700 uppercase transition-all duration-300 ${dotsOnRight ? "left-4 sm:left-6 md:left-20" : "right-4 sm:right-6 md:right-20"}`}>
        <span className="text-theme">
          {String(cur + 1).padStart(2, "0")}
        </span>{" "}
        / 05
      </div>
    </section>
  );
}
