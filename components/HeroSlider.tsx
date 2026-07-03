"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Locale } from "@/i18n/config";

type H1Seg = string | { text: string; cls: string };

type Slide = {
  img: string;
  alt: string;
  label: string;
  lines: H1Seg[][];
  sub: string;
  cta: string;
};

function getSlidesData(locale: Locale): Slide[] {
  if (locale === "zh") {
    return [
      {
        img: "/pic/hero/ChatGPT Image 2026年5月18日 19_47_04.webp",
        alt: "专业买家网络",
        label: "专业买家网络",
        lines: [
          ["您专属的"],
          [{ text: "电动汽车采购", cls: "text-theme" }],
          ["专家"],
        ],
        sub: "针对非洲市场的数据驱动选型和严格质量把控",
        cta: "查看精选",
      },
      {
        img: "/pic/hero/photo-1578575437130-527eed3abbec.webp",
        alt: "港口物流",
        label: "无缝港口物流",
        lines: [
          ["从中国到您的港口"],
          [{ text: "无缝", cls: "text-theme" }, "交付"],
        ],
        sub: "我们处理复杂的航运、报关文件和安全的集装箱装载",
        cta: "了解我们的流程",
      },
      {
        img: "/pic/hero/title3 (2).webp",
        alt: "非洲道路",
        label: "为非洲道路而生",
        lines: [
          ["专为您的"],
          ["", { text: "生态", cls: "text-accent" }, " ", { text: "盈利", cls: "text-theme" }],
        ],
        sub: "高离地间隙、耐用的电动汽车，完美适配非洲道路和气候",
        cta: "探索实用之选",
      },
      {
        img: "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
        alt: "售后服务",
        label: "无忧售后",
        lines: [
          ["每一批货物"],
          [{ text: "全程", cls: "text-accent" }, " ", { text: "支持", cls: "text-theme" }],
        ],
        sub: "包含Starter Parts Kit、数字维修手册和远程技术支持",
        cta: "了解经销商支持",
      },
      {
        img: "/pic/hero/photo-1521791136064-7986c2920216.webp",
        alt: "合作伙伴",
        label: "生态合作伙伴",
        lines: [["不止于"], ["卖", { text: "车", cls: "text-theme" }]],
        sub: "我们打造经销商体系，从营销素材到展厅策略的一站式解决方案",
        cta: "成为合作伙伴",
      },
    ];
  }

  if (locale === "am") {
    return [
      {
        img: "/pic/hero/ChatGPT Image 2026年5月18日 19_47_04.webp",
        alt: "የባለሙያ ገዢዎች አውታር",
        label: "የባለሙያ ገዢዎች አውታር",
        lines: [
          ["የእርስዎ የተላከ"],
          [{ text: "የኤሌክትሪክ መኪና ምንጭ", cls: "text-theme" }],
          ["ባለሙያ"],
        ],
        sub: "ለአፍሪካ ገበያ የተቀናነሰ የውሂብ የሚመራ መርጦና ጥብቅ የጥራት ፍተሻ",
        cta: "ምርጫውን ይመልከቱ",
      },
      {
        img: "/pic/hero/photo-1578575437130-527eed3abbec.webp",
        alt: "የወደብ ትራንስፖርት",
        label: "ያለተቋረጠ የወደብ ሎጂስቲክስ",
        lines: [
          ["ከቻይና ወደ እርስዎ ወደብ"],
          [{ text: "ያለማቋረጥ", cls: "text-theme" }, " የተላከ"],
        ],
        sub: "የሚያበቁ የመርከብ፣ የአጋር ሰነዶች እና የደህናን የኮንቴይነር ጭነት እናስተዳድራለን",
        cta: "ሂደታችንን ይመልከቱ",
      },
      {
        img: "/pic/hero/title3 (2).webp",
        alt: "የአፍሪካ መንገዶች",
        label: "ለአፍሪካ መንገዶች የተሰራ",
        lines: [
          ["ለእርስዎ የተመረጠ"],
          ["", { text: "ኢኮ", cls: "text-accent" }, " ", { text: "ትርፍ", cls: "text-theme" }],
        ],
        sub: "ከፍተኛ የመሬት ርቀት፣ የሚያጸዱ የኤሌክትሪክ መኪናዎች ለአፍሪካ መንገዶች እና አየር ንብረት በጣም ተስማሚ",
        cta: "ዩቲሊቲ ፕሮን ይስሱ",
      },
      {
        img: "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
        alt: "ከሽያጭ በኋላ አገልግሎት",
        label: "ያለጭንቀት ከሽያጭ በኋላ አገልግሎት",
        lines: [
          ["እያንዳንዱ ጭነት"],
          [{ text: "ሙሉ", cls: "text-accent" }, " ", { text: "ድጋፍ", cls: "text-theme" }],
        ],
        sub: "Starter Parts Kit፣ የዲጂታል የጥገና እጆች እና የርቀት ቴክኒካዊ ድጋፍ ያካትታል",
        cta: "የደላል ድጋፍን ይወቁ",
      },
      {
        img: "/pic/hero/photo-1521791136064-7986c2920216.webp",
        alt: "አጋርነት",
        label: "የኢኮስስተም አጋርነት",
        lines: [["ከማሸጥ በላይ"], ["መኪናዎችን ", { text: "መሸጥ", cls: "text-theme" }]],
        sub: "ከማርኬቲንግ መረጃዎች እስከ ሾሩም ስትራቴጂዎች ድረስ ደላሎችን ከማቆረብ ጋር አንድ ላይ እናድጋለን",
        cta: "አጋር ይሁኑ",
      },
    ];
  }

  return [
    {
      img: "/pic/hero/ChatGPT Image 2026年5月18日 19_47_04.webp",
      alt: "Expert Buyer",
      label: "Expert Buyer Network",
      lines: [
        ["Your Dedicated"],
        [{ text: "EV Sourcing", cls: "text-theme" }],
        ["Expert"],
      ],
      sub: "Data-driven selection and rigorous quality checks tailored for the African market",
      cta: "View Selection",
    },
    {
      img: "/pic/hero/photo-1578575437130-527eed3abbec.webp",
      alt: "Port Logistics",
      label: "Seamless Port Logistics",
      lines: [
        ["China to Your Port"],
        [{ text: "Seamlessly", cls: "text-theme" }, " Delivered"],
      ],
      sub: "We handle complex shipping, customs documentation, and secure container loading",
      cta: "Explore Our Process",
    },
    {
      img: "/pic/hero/title3 (2).webp",
      alt: "African Roads",
      label: "Built for African Roads",
      lines: [
        ["Selected for"],
        ["Your ", { text: "Eco", cls: "text-accent" }, " ", { text: "Profit", cls: "text-theme" }],
      ],
      sub: "High-clearance, durable EVs perfectly suited for African roads and climates",
      cta: "Explore Utility Pro",
    },
    {
      img: "/pic/hero/photo-1486262715619-67b85e0b08d3.webp",
      alt: "Aftersales",
      label: "Zero-Headache Aftersales",
      lines: [
        ["Every Shipment"],
        [{ text: "Fully", cls: "text-accent" }, " ", { text: "Supported", cls: "text-theme" }],
      ],
      sub: "Starter Parts Kit + digital repair manuals + remote tech support included",
      cta: "Discover Dealer Support",
    },
    {
      img: "/pic/hero/photo-1521791136064-7986c2920216.webp",
      alt: "Partnership",
      label: "Ecosystem Partnership",
      lines: [["More Than"], ["Selling ", { text: "Cars", cls: "text-theme" }]],
      sub: "We build dealerships Turnkey solutions from marketing assets to showroom strategies",
      cta: "Become a Partner",
    },
  ];
}

export function HeroSlider() {
  const { locale, t } = useTranslation();
  const slidesData = getSlidesData(locale);
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
      const scales = [1, 1, 1, 1, 0.82, 0.7, 0.6, 0.52, 0.46];
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
    const onResize = () => {
      checkOverlap();
      checkTitleLines();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [cur, checkOverlap, checkTitleLines]);

  const goSlide = (n: number) => {
    setCur(n);
    resetTimer();
  };

  const d = slidesData[cur];

  return (
    <section
      id="hero"
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "4/3" }}
    >
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
            style={{
              fontSize: `calc(clamp(1.8rem, 7vw, 6.5rem) * ${fontSizeScale})`,
            }}
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
                  )
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
              {t("home.hero.process", "Our Process")}
            </a>
          </div>
        </div>
      </div>

      <div
        ref={dotsRef}
        className={`absolute bottom-4 sm:bottom-10 z-10 flex gap-2 sm:gap-3 items-center transition-all duration-300 ${
          dotsOnRight
            ? "right-4 sm:right-6 md:right-20"
            : "left-4 sm:left-6 md:left-20"
        }`}
      >
        {slidesData.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === cur ? "active" : ""}`}
            onClick={() => goSlide(i)}
          />
        ))}
      </div>

      <div
        className={`absolute bottom-4 sm:bottom-10 z-10 text-[9px] sm:text-[10px] font-black tracking-widest text-gray-700 uppercase transition-all duration-300 ${
          dotsOnRight
            ? "left-4 sm:left-6 md:left-20"
            : "right-4 sm:right-6 md:right-20"
        }`}
      >
        <span className="text-theme">
          {String(cur + 1).padStart(2, "0")}
        </span>{" "}
        / 05
      </div>
    </section>
  );
}
