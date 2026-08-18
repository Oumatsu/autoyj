"use client";

import { useState } from "react";
import Link from "next/link";
import { QrDropdown } from "./QrDropdown";
import { useTranslation, T } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { Button } from "@/components/ui/button";
import { OFFICIAL_WHATSAPP_URL } from "@/lib/constants";

export function Footer() {
  const [mobileFooterOpen, setMobileFooterOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/pic/under/photo-1469854523086-cc02fe5d8800.webp"
          className="w-full h-full object-cover"
          style={{ filter: "brightness(.28) grayscale(20%)" }}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div
          className="absolute inset-0"
          style={{ background: "rgba(10,10,10,.45)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-mid) 0%, transparent 20%)",
          }}
        />
      </div>

      <section
        id="contact"
        className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 pt-16 sm:pt-24 pb-12 sm:pb-20 scroll-mt-16"
      >
        <div
          className="rounded-[2rem] sm:rounded-[3rem] md:rounded-[4rem] p-6 sm:p-10 md:p-20 text-center"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(197,160,89,0.25)",
            backdropFilter: "blur(25px)",
            WebkitBackdropFilter: "blur(25px)",
          }}
        >
          <div className="label justify-center mb-4 sm:mb-6">
            {t("footer.cta")}
          </div>
          <h2
            className="sh mb-4 sm:mb-6"
            style={{ fontSize: "clamp(1.8rem,8vw,5.5rem)" }}
          >
            {t("footer.headingLine1", "Build Your")}
            {t("footer.headingLine1", "Build Your") ? " " : ""}
            <span className="text-accent">{t("footer.headingAccent1", "Green")}</span>{" "}
            <span className="text-theme">{t("footer.headingAccent2", "Empire")}</span>
            <br />
            {t("footer.headingLine2", "Right Here.")}
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg font-light italic mb-8 sm:mb-10 max-w-lg mx-auto">
            {t("footer.response")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <a
              href={OFFICIAL_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="sm:hidden btn-primary inline-flex items-center justify-center gap-2 px-8 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg w-full text-center"
            >
              <svg viewBox="0 0 32 32" width="18" height="18" fill="none" aria-hidden="true">
                <circle cx="16" cy="16" r="16" fill="currentColor" fillOpacity="0.18" />
                <path
                  d="M16 6C10.477 6 6 10.477 6 16c0 1.9.53 3.677 1.45 5.19L6 26l4.93-1.43A9.94 9.94 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6Zm5.6 13.6c-.24.66-1.38 1.28-1.9 1.34-.5.06-1 .24-3.38-.72-2.86-1.18-4.68-4.06-4.82-4.26-.14-.2-1.14-1.52-1.14-2.9 0-1.38.72-2.06 1-2.34.26-.28.58-.34.78-.34h.56c.18 0 .42-.06.66.5.24.56.82 2 .9 2.14.08.14.12.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.3.3-.12.58.18.28.8 1.32 1.72 2.14 1.18 1.04 2.18 1.38 2.46 1.52.28.14.46.12.62-.06.18-.18.76-.88.96-1.18.2-.3.4-.24.66-.14.26.1 1.64.78 1.92.92.28.14.46.2.52.32.06.12.06.68-.18 1.34Z"
                  fill="currentColor"
                />
              </svg>
              {t("footer.whatsapp")}
            </a>
            <QrDropdown>
              <a
                href={OFFICIAL_WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex btn-primary items-center gap-2 px-8 sm:px-12 py-4 sm:py-5 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic shadow-lg"
              >
                <svg viewBox="0 0 32 32" width="18" height="18" fill="none" aria-hidden="true">
                  <circle cx="16" cy="16" r="16" fill="currentColor" fillOpacity="0.18" />
                  <path
                    d="M16 6C10.477 6 6 10.477 6 16c0 1.9.53 3.677 1.45 5.19L6 26l4.93-1.43A9.94 9.94 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6Zm5.6 13.6c-.24.66-1.38 1.28-1.9 1.34-.5.06-1 .24-3.38-.72-2.86-1.18-4.68-4.06-4.82-4.26-.14-.2-1.14-1.52-1.14-2.9 0-1.38.72-2.06 1-2.34.26-.28.58-.34.78-.34h.56c.18 0 .42-.06.66.5.24.56.82 2 .9 2.14.08.14.12.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.3.3-.12.58.18.28.8 1.32 1.72 2.14 1.18 1.04 2.18 1.38 2.46 1.52.28.14.46.12.62-.06.18-.18.76-.88.96-1.18.2-.3.4-.24.66-.14.26.1 1.64.78 1.92.92.28.14.46.2.52.32.06.12.06.68-.18 1.34Z"
                    fill="currentColor"
                  />
                </svg>
                {t("footer.whatsapp")}
              </a>
            </QrDropdown>
            <a
              href="mailto:sales@youguard.net"
              className="btn-outline px-8 sm:px-12 py-4 sm:py-5 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic w-full sm:w-auto text-center"
            >
              {t("footer.enquiry")}
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,.96) 0%, rgba(0,0,0,.82) 45%, rgba(0,0,0,.5) 75%, transparent 100%)",
          }}
        />
        <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-12 pt-6 sm:pt-16 pb-8 sm:pb-16">
          <div className="sm:hidden mb-3">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/favicon.svg" className="h-8 w-auto" alt="Youguard" />
            </div>
            <p className="text-gray-600 text-xs font-light leading-relaxed">
              {t("footer.tagline")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setMobileFooterOpen((open) => !open)}
            className="sm:hidden mb-6 flex w-full items-center justify-center gap-3 py-3 text-gray-300 hover:text-white transition"
            aria-expanded={mobileFooterOpen}
            aria-controls="footer-navigation"
            aria-label={
              mobileFooterOpen
                ? `${t("footer.siteNavigation")} - Collapse`
                : `${t("footer.siteNavigation")} - Expand`
            }
          >
            <span className="h-px flex-1 bg-current opacity-50" />
            <span className="flex min-w-[132px] flex-col items-center gap-1">
              <span className="text-[9px] font-black uppercase tracking-[0.24em]">
                {t("footer.siteNavigation")}
              </span>
              <span className="text-xs leading-none" aria-hidden="true">
                {mobileFooterOpen ? "▲" : "▼"}
              </span>
            </span>
            <span className="h-px flex-1 bg-current opacity-50" />
          </button>

          <div
            id="footer-navigation"
            className={`${mobileFooterOpen ? "block" : "hidden"} sm:block`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-14">
              <div className="hidden sm:block">
                <div className="flex items-center gap-2.5 mb-5">
                  <img
                    src="/favicon.svg"
                    className="h-8 w-auto"
                    alt="Youguard"
                  />
                </div>
                <p className="text-gray-300 text-xs font-light leading-relaxed">
                  {t("footer.tagline")}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  {t("footer.vehicles")}
                </div>
                <ul className="space-y-3 text-xs text-gray-300 font-light">
                  <li>
                    <LocaleLink
                      href="/products/revenue-king"
                      className="hover:text-white transition"
                    >
                      {t("footer.revenueKingEvs")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/products/elite-flagship"
                      className="hover:text-white transition"
                    >
                      {t("footer.eliteFlagshipEvs")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/products/utility-pro"
                      className="hover:text-white transition"
                    >
                      {t("footer.utilityProEvs")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/#tco"
                      className="hover:text-white transition"
                    >
                      {t("footer.dealerProfitEstimate")}
                    </LocaleLink>
                  </li>
                </ul>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  {t("footer.solutions")}
                </div>
                <ul className="space-y-3 text-xs text-gray-300 font-light">
                  <li>
                    <LocaleLink
                      href="/solutions#pdi"
                      className="hover:text-white transition"
                    >
                      {t("footer.pdiQuality")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/solutions#parts"
                      className="hover:text-white transition"
                    >
                      {t("footer.starterPartsKit")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/solutions#marketing"
                      className="hover:text-white transition"
                    >
                      {t("footer.marketingAssets")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/solutions/request-quote"
                      className="hover:text-white transition"
                    >
                      {t("footer.customSourcing")}
                    </LocaleLink>
                  </li>
                </ul>
                <div className="text-[10px] font-black tracking-widest uppercase mb-3 mt-6 text-theme">
                  {t("footer.markets")}
                </div>
                <LocaleLink
                  href="/markets/ethiopia"
                  className="text-xs text-gray-300 hover:text-theme transition"
                >
                  {t("footer.ethiopiaFocus")}
                </LocaleLink>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  {t("footer.resources")}
                </div>
                <ul className="space-y-3 text-xs text-gray-300 font-light mb-6">
                  <li>
                    <LocaleLink
                      href="/insights"
                      className="hover:text-white transition"
                    >
                      {t("nav.insights")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/academy"
                      className="hover:text-white transition"
                    >
                      {t("footer.evAcademy")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/about"
                      className="hover:text-white transition"
                    >
                      {t("footer.aboutUs")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/about#verification"
                      className="hover:text-white transition"
                    >
                      {t("footer.companyVerification")}
                    </LocaleLink>
                  </li>
                  <li>
                    <LocaleLink
                      href="/#contact"
                      className="hover:text-white transition"
                    >
                      {t("footer.contactUs")}
                    </LocaleLink>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8"
            style={{ borderTop: "1px solid rgba(197,160,89,.06)" }}
          >
            <p className="text-[9px] font-black tracking-[.4em] uppercase text-gray-400">
              © {new Date().getFullYear()} Youguard Eco Supply Chain.{" "}
              {t("footer.copyright")}
            </p>
            <div className="flex gap-6">
              <LocaleLink
                href="/privacy"
                className="text-[9px] font-black tracking-widest uppercase text-gray-400 hover:text-white transition"
              >
                {t("footer.privacy")}
              </LocaleLink>
              <LocaleLink
                href="/terms"
                className="text-[9px] font-black tracking-widest uppercase text-gray-400 hover:text-white transition"
              >
                {t("footer.terms")}
              </LocaleLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
