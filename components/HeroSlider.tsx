"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const slidesData = [
  {
    img: "https://6a0327d1fc46b5b25f3480d6.imgix.net/banner/ChatGPT%20Image%202026%E5%B9%B45%E6%9C%8818%E6%97%A5%2019_47_04.png",
    alt: "Expert Buyer",
    label: "Expert Buyer Network",
    h1: 'Your Dedicated<br><span class="text-theme">EV Sourcing</span><br>Expert',
    sub: "Data-driven selection and rigorous quality checks tailored for the African market",
    cta: "View Selection",
  },
  {
    img: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2000&q=80",
    alt: "Port Logistics",
    label: "Seamless Port Logistics",
    h1: 'China to Your Port<br><span class="text-theme">Seamlessly</span> Delivered',
    sub: "We handle complex shipping, customs documentation, and secure container loading",
    cta: "Explore Our Process",
  },
  {
    img: "/pic/hero/title3 (2).webp",
    alt: "African Roads",
    label: "Built for African Roads",
    h1: 'Selected for<br>Your <span class="text-accent">Eco</span> <span class="text-theme">Profit</span>',
    sub: "High-clearance, durable EVs perfectly suited for African roads and climates",
    cta: "Explore Utility Pro",
  },
  {
    img: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=2000&q=80",
    alt: "Aftersales",
    label: "Zero-Headache Aftersales",
    h1: 'Every Shipment<br><span class="text-accent">Fully</span> <span class="text-theme">Supported</span>',
    sub: "Starter Parts Kit + digital repair manuals + remote tech support included",
    cta: "Discover Dealer Support",
  },
  {
    img: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=2000&q=80",
    alt: "Partnership",
    label: "Ecosystem Partnership",
    h1: 'More Than<br>Selling <span class="text-theme">Cars</span>',
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
    <section id="hero" className="snap-section relative h-screen w-full overflow-hidden">
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
                "linear-gradient(to top, rgba(28,28,28,.95) 10%, rgba(28,28,28,.35) 42%, transparent 100%)",
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

      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-20 pb-24">
        <div className="max-w-3xl w-full">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="pulse-dot" />
            <span className="text-accent text-[10px] font-black uppercase tracking-[.3em]">
              {d.label}
            </span>
          </div>

          <h1
            ref={h1Ref}
            className="sh mb-8"
            style={{ fontSize: `calc(clamp(3rem, 8vw, 6.5rem) * ${fontSizeScale})` }}
            dangerouslySetInnerHTML={{ __html: d.h1 }}
          />

          <p
            className="text-lg md:text-xl text-gray-500 mb-12 max-w-xl leading-relaxed italic border-l-2 pl-8"
            style={{ borderColor: "rgba(197,160,89,.3)" }}
          >
            {d.sub}
          </p>

          <div ref={btnRowRef} className="flex flex-wrap gap-4">
            <a
              href="#products"
              className="btn-primary px-10 py-5 rounded text-sm font-black tracking-widest uppercase italic"
            >
              {d.cta}
            </a>
            <a
              href="#solutions"
              className="btn-outline px-10 py-5 rounded text-sm font-black tracking-widest uppercase italic"
            >
              Our Process
            </a>
          </div>
        </div>
      </div>

      <div
        ref={dotsRef}
        className={`absolute bottom-10 z-10 flex gap-3 items-center transition-all duration-300 ${dotsOnRight ? "right-6 md:right-20" : "left-6 md:left-20"}`}
      >
        {slidesData.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === cur ? "active" : ""}`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>

      <div className={`absolute bottom-10 z-10 text-[10px] font-black tracking-widest text-gray-700 uppercase transition-all duration-300 ${dotsOnRight ? "left-6 md:left-20" : "right-6 md:right-20"}`}>
        <span className="text-theme">
          {String(cur + 1).padStart(2, "0")}
        </span>{" "}
        / 05
      </div>
    </section>
  );
}
