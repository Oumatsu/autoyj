"use client";

import { useEffect, useState, useRef, useCallback } from "react";

const tabSectionIds = ["products", "solutions", "tco", "insights", "about"];

export function SectionTabs() {
  const tabBarRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const syncTabTop = useCallback(() => {
    const navbar = document.getElementById("navbar");
    const tabBar = tabBarRef.current;
    if (!tabBar || !navbar) return;
    tabBar.style.top = navbar.offsetHeight - 1 + "px";
  }, []);

  useEffect(() => {
    syncTabTop();

    const handleScroll = () => {
      syncTabTop();

      const hero = document.getElementById("hero");
      const tabBar = tabBarRef.current;
      if (!hero || !tabBar) return;
      const heroBottom = hero.getBoundingClientRect().bottom;
      tabBar.classList.toggle(
        "visible",
        heroBottom < window.innerHeight * 0.25
      );

      const mid = window.innerHeight * 0.45;
      let active: string | null = null;
      tabSectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.getBoundingClientRect().top <= mid) active = id;
      });
      setActiveId(active);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [syncTabTop]);

  const scrollTo = (targetId: string) => {
    const target = document.getElementById(targetId);
    const navbar = document.getElementById("navbar");
    const tabBar = tabBarRef.current;
    if (!target || !navbar || !tabBar) return;
    const offset = navbar.offsetHeight + tabBar.offsetHeight + 10;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <div id="section-tabs" ref={tabBarRef} role="navigation" aria-label="Page sections">
      <div className="tab-inner">
        <button
          className={`tab-btn ${activeId === "products" ? "active" : ""}`}
          onClick={() => scrollTo("products")}
        >
          Top Selection
        </button>
        <button
          className={`tab-btn ${activeId === "solutions" ? "active" : ""}`}
          onClick={() => scrollTo("solutions")}
        >
          Gold Standard
        </button>
        <button
          className={`tab-btn ${activeId === "tco" ? "active" : ""}`}
          onClick={() => scrollTo("tco")}
        >
          TCO Savings
        </button>
        <button
          className={`tab-btn ${activeId === "insights" ? "active" : ""}`}
          onClick={() => scrollTo("insights")}
        >
          Growth Tools
        </button>
        <button
          className={`tab-btn ${activeId === "about" ? "active" : ""}`}
          onClick={() => scrollTo("about")}
        >
          Heritage
        </button>
        <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="tab-wa">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.705 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}
