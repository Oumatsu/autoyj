"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QrDropdown } from "./QrDropdown";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { Sheet, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

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

  const [user, setUser] = useState<{ role: string; name?: string } | null>(null);

  const refreshSession = useCallback(() => {
    fetch("/api/portal/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    refreshSession();
    window.addEventListener("youguard-session-changed", refreshSession);
    return () => {
      window.removeEventListener("youguard-session-changed", refreshSession);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 只在 mount 时执行一次；session 变化通过 youguard-session-changed 事件推送

  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 glass px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300"
      >
        <LocaleLink href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" className="h-8 w-auto" alt="Youguard" />
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
          <a
            href="/dashboard"
            className={`px-6 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition border ${
              user
                ? "border-accent/40 bg-accent/10 text-accent hover:bg-accent hover:text-black"
                : "border-white/20 text-gray-300 hover:text-white hover:border-white/40"
            }`}
          >
            {user ? `${user.role.toUpperCase()}` : t("nav.signIn")}
          </a>
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

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen} side="right">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <SheetHeader>
            <SheetTitle>AUTO YJ</SheetTitle>
          </SheetHeader>
          <Button
            variant="ghost"
            size="icon"
            onClick={closeMobile}
            className="text-slate-400 hover:text-white"
          >
            ✕
          </Button>
        </div>

        <div className="flex flex-col gap-6 py-6 text-lg font-black uppercase tracking-tight">
          <div className="w-full flex flex-col">
            <button
              type="button"
              onClick={() => setMobileVehiclesOpen((prev) => !prev)}
              aria-expanded={mobileVehiclesOpen}
              className={`flex w-full items-center justify-between text-lg font-black uppercase tracking-tight transition-all ${
                mobileVehiclesOpen ? "text-[#5ee6d8]" : "text-white hover:text-[#5ee6d8]"
              }`}
            >
              <span>{t("nav.vehicles")}</span>
              <svg
                className={`h-4 w-4 transition-transform duration-200 ${mobileVehiclesOpen ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 10 6"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </button>

            {mobileVehiclesOpen && (
              <div className="mt-3 flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs font-bold uppercase tracking-wider">
                <LocaleLink
                  href="/products/revenue-king"
                  onClick={closeMobile}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    pathname?.includes("/revenue-king") ? "bg-[#22b8aa]/20 text-[#5ee6d8]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{t("nav.revenueKing")}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${pathname?.includes("/revenue-king") ? "bg-[#5ee6d8]" : "bg-white/20"}`} />
                </LocaleLink>
                <LocaleLink
                  href="/products/elite-flagship"
                  onClick={closeMobile}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    pathname?.includes("/elite-flagship") ? "bg-[#22b8aa]/20 text-[#5ee6d8]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{t("nav.eliteFlagship")}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${pathname?.includes("/elite-flagship") ? "bg-[#5ee6d8]" : "bg-white/20"}`} />
                </LocaleLink>
                <LocaleLink
                  href="/products/utility-pro"
                  onClick={closeMobile}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 transition ${
                    pathname?.includes("/utility-pro") ? "bg-[#22b8aa]/20 text-[#5ee6d8]" : "text-slate-300 hover:text-white"
                  }`}
                >
                  <span>{t("nav.utilityPro")}</span>
                  <span className={`h-1.5 w-1.5 rounded-full ${pathname?.includes("/utility-pro") ? "bg-[#5ee6d8]" : "bg-white/20"}`} />
                </LocaleLink>
              </div>
            )}
          </div>

          <LocaleLink href="/solutions" onClick={closeMobile} className="text-white hover:text-[#5ee6d8] transition">
            {t("nav.solutions")}
          </LocaleLink>
          <LocaleLink href="/insights" onClick={closeMobile} className="text-white hover:text-[#5ee6d8] transition">
            {t("nav.insights")}
          </LocaleLink>
          <LocaleLink href="/academy" onClick={closeMobile} className="text-white hover:text-[#5ee6d8] transition">
            {t("nav.academy")}
          </LocaleLink>
          <LocaleLink href="/about" onClick={closeMobile} className="text-white hover:text-[#5ee6d8] transition">
            {t("nav.about")}
          </LocaleLink>

          <a href="/dashboard" onClick={closeMobile} className="text-[#5ee6d8] hover:text-white transition">
            {user ? user.role.toUpperCase() : t("nav.signIn")}
          </a>

          <LocaleLink href="/about#verification" onClick={closeMobile} className="text-slate-400 hover:text-white transition text-xs">
            {t("footer.companyVerification")}
          </LocaleLink>
        </div>

        <div className="mt-auto border-t border-white/10 pt-4 flex flex-col gap-3">
          <LocaleSwitcher />
          <LocaleLink href="/#contact" onClick={closeMobile}>
            <Button className="w-full" variant="default">
              {t("nav.contactUs")}
            </Button>
          </LocaleLink>
        </div>
      </Sheet>
    </>
  );
}
