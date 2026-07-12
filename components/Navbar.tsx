"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrDropdown } from "./QrDropdown";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileVehiclesOpen, setMobileVehiclesOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();
  const { t } = useTranslation();
  const openDropdown = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setDropdownOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 150);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) {
      setMobileVehiclesOpen(false);
    }
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.getElementById("navbar");
      if (!navbar) return;
      const py = window.scrollY > 50 ? "10px" : "16px";
      navbar.style.paddingTop = py;
      navbar.style.paddingBottom = py;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const navbar = document.getElementById("navbar");
    if (!navbar) return;
    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--navbar-h",
        `${navbar.offsetHeight}px`
      );
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  const closeMobile = useCallback(() => {
    setMobileOpen(false);
    setMobileVehiclesOpen(false);
  }, []);

  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 glass px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300"
      >
        <LocaleLink href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" className="h-8 w-auto" alt="autoYJ" />
        </LocaleLink>

        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
          <div
            className="nav-group relative flex items-center gap-1 cursor-default"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            <LocaleLink
              href="/products"
              className="nav-link flex items-center gap-1.5"
            >
              {t("nav.vehicles")}
              <svg
                className="w-2 h-2 opacity-50"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 10 6"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </LocaleLink>
            <div
              className="nav-dropdown glass absolute top-[calc(100%+12px)] left-1/2 min-w-[200px] rounded-[14px] transition-all duration-200"
              style={{
                borderColor: "rgba(16,185,129,0.2)",
                opacity: dropdownOpen ? 1 : 0,
                visibility: dropdownOpen ? "visible" : "hidden",
                pointerEvents: dropdownOpen ? "auto" : "none",
                transform: dropdownOpen
                  ? "translateX(-50%) translateY(0)"
                  : "translateX(-50%) translateY(-4px)",
              }}
              onMouseEnter={openDropdown}
              onMouseLeave={closeDropdown}
            >
              <LocaleLink
                href="/products/revenue-king"
                className={`flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase hover:bg-white/5 rounded-t-[14px] transition-colors ${pathname.includes("/revenue-king") ? "text-accent" : "text-gray-400"}`}
              >
                {t("nav.revenueKing")}
                <span className={`w-1.5 h-1.5 rounded-full ${pathname.includes("/revenue-king") ? "bg-accent" : "bg-white/20"}`} />
              </LocaleLink>
              <LocaleLink
                href="/products/elite-flagship"
                className={`flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase hover:text-white hover:bg-white/5 transition-colors ${pathname.includes("/elite-flagship") ? "text-accent" : "text-gray-400"}`}
              >
                {t("nav.eliteFlagship")}
                <span className={`w-1.5 h-1.5 rounded-full ${pathname.includes("/elite-flagship") ? "bg-accent" : "bg-white/20"}`} />
              </LocaleLink>
              <LocaleLink
                href="/products/utility-pro"
                className={`flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase hover:text-white hover:bg-white/5 rounded-b-[14px] transition-colors ${pathname.includes("/utility-pro") ? "text-accent" : "text-gray-400"}`}
              >
                {t("nav.utilityPro")}
                <span className={`w-1.5 h-1.5 rounded-full ${pathname.includes("/utility-pro") ? "bg-accent" : "bg-white/20"}`} />
              </LocaleLink>
            </div>
          </div>

          <LocaleLink href="/solutions" className="nav-link">
            {t("nav.solutions")}
          </LocaleLink>
          <LocaleLink href="/insights" className="nav-link">
            {t("nav.insights")}
          </LocaleLink>
          <LocaleLink href="/academy" className="nav-link">
            {t("nav.academy")}
          </LocaleLink>
          <LocaleLink href="/about" className="nav-link">
            {t("nav.about")}
          </LocaleLink>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <LocaleSwitcher />
          <Link
            href="/portal"
            className="px-7 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition border border-white/20 text-gray-300 hover:text-white hover:border-white/40"
          >
            {t("nav.portal")}
          </Link>
          <QrDropdown>
            <LocaleLink
              href="/#contact"
              className="btn-primary px-7 py-2.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg"
            >
              {t("nav.contactUs")}
            </LocaleLink>
          </QrDropdown>
        </div>

        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 flex flex-col gap-1.5"
        >
          {mobileOpen ? (
            <span className="text-2xl leading-none text-white">✕</span>
          ) : (
            <>
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-6 h-0.5 bg-white block" />
              <span className="w-4 h-0.5 bg-white block" />
            </>
          )}
        </button>
      </nav>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 sm:gap-8 text-xl sm:text-2xl font-black uppercase italic tracking-tight overflow-y-auto pt-16 pb-8 px-6"
          style={{ background: "rgba(5,5,5,.97)" }}
        >
          <button
            onClick={closeMobile}
            className="absolute top-5 right-5 sm:right-6 w-10 h-10 flex items-center justify-center text-2xl sm:text-3xl text-gray-400 hover:text-white transition rounded-full"
          >
            ✕
          </button>
          <div className="w-full max-w-sm flex flex-col items-center">
            <button
              type="button"
              onClick={() => setMobileVehiclesOpen((prev) => !prev)}
              aria-expanded={mobileVehiclesOpen}
              className={`flex w-full items-center justify-center gap-3 text-xl sm:text-2xl font-black uppercase italic tracking-tight transition-all duration-300 ${mobileVehiclesOpen
                ? "text-accent"
                : "text-white hover:text-theme"}`}
            >
              <span>{t("nav.vehicles")}</span>
              <svg
                className={`h-3 w-3 transition-transform duration-300 ${mobileVehiclesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 10 6"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>
            <div
              className={`grid w-full transition-all duration-400 ease-out ${mobileVehiclesOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"}`}
            >
              <div className="overflow-hidden flex justify-center">
                <div
                  className={`inline-flex min-w-0 flex-col rounded-[12px] border border-white/10 bg-white/[0.06] p-0.5 text-[11px] sm:text-[12px] font-bold not-italic tracking-[.06em] uppercase transition-all duration-300 ${mobileVehiclesOpen ? "translate-y-0 scale-100" : "-translate-y-2 scale-[0.98]"}`}
                >
                  <LocaleLink
                    href="/products/revenue-king"
                    onClick={closeMobile}
                    className={`flex items-center justify-between gap-4 rounded-[9px] pl-1.5 pr-2 py-1.5 transition-all duration-200 ${pathname?.includes("/revenue-king")
                      ? "bg-accent/12 text-accent"
                      : "text-gray-300 hover:bg-white/6 hover:text-white"}`}
                  >
                    <span>{t("nav.revenueKing")}</span>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${pathname?.includes("/revenue-king") ? "bg-accent" : "bg-white/20"}`}
                    />
                  </LocaleLink>
                  <LocaleLink
                    href="/products/elite-flagship"
                    onClick={closeMobile}
                    className={`mt-0.5 flex items-center justify-between gap-4 rounded-[9px] pl-1.5 pr-2 py-1.5 transition-all duration-200 ${pathname?.includes("/elite-flagship")
                      ? "bg-accent/12 text-accent"
                      : "text-gray-300 hover:bg-white/6 hover:text-white"}`}
                  >
                    <span>{t("nav.eliteFlagship")}</span>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${pathname?.includes("/elite-flagship") ? "bg-accent" : "bg-white/20"}`}
                    />
                  </LocaleLink>
                  <LocaleLink
                    href="/products/utility-pro"
                    onClick={closeMobile}
                    className={`mt-0.5 flex items-center justify-between gap-4 rounded-[9px] pl-1.5 pr-2 py-1.5 transition-all duration-200 ${pathname?.includes("/utility-pro")
                      ? "bg-accent/12 text-accent"
                      : "text-gray-300 hover:bg-white/6 hover:text-white"}`}
                  >
                    <span>{t("nav.utilityPro")}</span>
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${pathname?.includes("/utility-pro") ? "bg-accent" : "bg-white/20"}`}
                    />
                  </LocaleLink>
                </div>
              </div>
            </div>
          </div>
          <LocaleLink
            href="/solutions"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            {t("nav.solutions")}
          </LocaleLink>
          <LocaleLink
            href="/insights"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            {t("nav.insights")}
          </LocaleLink>
          <LocaleLink
            href="/academy"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            {t("nav.academy")}
          </LocaleLink>
          <LocaleLink
            href="/about"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            {t("nav.about")}
          </LocaleLink>
          <Link
            href="/portal"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            {t("nav.portal")}
          </Link>
          <LocaleLink
            href="/about#verification"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            {t("footer.companyVerification")}
          </LocaleLink>
          <LocaleLink
            href="/#contact"
            onClick={closeMobile}
            className="mt-4 btn-primary px-10 sm:px-12 py-3 sm:py-4 rounded text-xs sm:text-sm tracking-widest w-48 sm:w-auto text-center"
          >
            {t("nav.contactUs")}
          </LocaleLink>
        </div>
      )}
    </>
  );
}
