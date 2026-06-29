"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { QrDropdown } from "./QrDropdown";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      document.documentElement.style.setProperty("--navbar-h", `${navbar.offsetHeight}px`);
    };
    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(navbar);
    return () => observer.disconnect();
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  return (
    <>
      <nav
        id="navbar"
        className="fixed top-0 left-0 right-0 z-50 glass px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/favicon.svg" className="h-8 w-auto" alt="autoYJ" />
        </Link>

        <div className="hidden lg:flex items-center gap-8 xl:gap-10">
          <div
            className="nav-group relative flex items-center gap-1 cursor-default"
            onMouseEnter={openDropdown}
            onMouseLeave={closeDropdown}
          >
            <Link
              href="/products"
              className="nav-link flex items-center gap-1.5"
            >
              Vehicles
              <svg
                className="w-2 h-2 opacity-50"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                viewBox="0 0 10 6"
              >
                <path d="M1 1l4 4 4-4" />
              </svg>
            </Link>
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
              <Link
                href="/products/revenue-king"
                className="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase text-accent hover:bg-white/5 rounded-t-[14px] transition-colors"
              >
                Revenue King
                <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              </Link>
              <Link
                href="/products/elite-flagship"
                className="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                Elite Flagship
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </Link>
              <Link
                href="/products/utility-pro"
                className="flex items-center justify-between px-4 py-2.5 text-[11px] font-bold tracking-[.12em] uppercase text-gray-400 hover:text-white hover:bg-white/5 rounded-b-[14px] transition-colors"
              >
                Utility Pro
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
              </Link>
            </div>
          </div>

          <Link href="/solutions" className="nav-link">
            Solutions
          </Link>
          <Link href="/insights" className="nav-link">
            Insights
          </Link>
          <Link href="/academy" className="nav-link">
            Academy
          </Link>
          <Link href="/about" className="nav-link">
            About
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/portal"
            className="px-7 py-2.5 rounded-full text-xs font-black tracking-widest uppercase transition border border-white/20 text-gray-300 hover:text-white hover:border-white/40"
          >
            Portal
          </Link>
          <QrDropdown>
          <Link
            href="/#contact"
            className="btn-primary px-7 py-2.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg"
          >
            Contact Us
          </Link>
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
          <Link
            href="/products"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            Vehicles
          </Link>
          <Link
            href="/solutions"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            Solutions
          </Link>
          <Link
            href="/insights"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            Insights
          </Link>
          <Link
            href="/academy"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            Academy
          </Link>
          <Link
            href="/about"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            About
          </Link>
          <Link
            href="/portal"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            Portal
          </Link>
          <Link
            href="/about#verification"
            onClick={closeMobile}
            className="text-white hover:text-theme transition"
          >
            Company Verification
          </Link>
          <Link
            href="/#contact"
            onClick={closeMobile}
            className="mt-4 btn-primary px-10 sm:px-12 py-3 sm:py-4 rounded text-xs sm:text-sm tracking-widest w-48 sm:w-auto text-center"
          >
            Contact Us
          </Link>
        </div>
      )}
    </>
  );
}
