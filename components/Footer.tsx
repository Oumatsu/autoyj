"use client";

import { useState } from "react";
import Link from "next/link";
import { QrDropdown } from "./QrDropdown";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { Button } from "@/components/ui/button";

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
            {t("footer.headingLine1")}
            {t("footer.headingLine1") ? " " : ""}
            <span className="text-accent">{t("footer.headingAccent1")}</span>{" "}
            <span className="text-theme">{t("footer.headingAccent2")}</span>
            <br />
            {t("footer.headingLine2")}
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg font-light italic mb-8 sm:mb-10 max-w-lg mx-auto">
            {t("footer.response")}
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
            <LocaleLink
              href="/qr"
              className="sm:hidden btn-primary px-8 py-4 rounded text-xs font-black tracking-widest uppercase italic shadow-lg w-full text-center"
            >
              {t("footer.whatsapp")}
            </LocaleLink>
            <QrDropdown>
              <LocaleLink
                href="/qr"
                className="hidden sm:inline-flex btn-primary px-8 sm:px-12 py-4 sm:py-5 rounded text-xs sm:text-sm font-black tracking-widest uppercase italic shadow-lg"
              >
                {t("footer.whatsapp")}
              </LocaleLink>
            </QrDropdown>
            <a
              href="mailto:alan@youguard.cn"
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
            className="sm:hidden mb-6 flex w-full items-center justify-center gap-3 py-3 text-gray-500 hover:text-white transition"
            aria-expanded={mobileFooterOpen}
            aria-controls="footer-navigation"
            aria-label={
              mobileFooterOpen
                ? "Collapse footer navigation"
                : "Expand footer navigation"
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
                <p className="text-gray-600 text-xs font-light leading-relaxed">
                  {t("footer.tagline")}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  {t("footer.vehicles")}
                </div>
                <ul className="space-y-3 text-xs text-gray-600 font-light">
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
                <ul className="space-y-3 text-xs text-gray-600 font-light">
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
                  className="text-xs text-gray-600 hover:text-theme transition"
                >
                  {t("footer.ethiopiaFocus")}
                </LocaleLink>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-widest uppercase mb-5 text-theme">
                  {t("footer.resources")}
                </div>
                <ul className="space-y-3 text-xs text-gray-600 font-light mb-6">
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
            <p className="text-[9px] font-black tracking-[.4em] uppercase text-gray-700">
              © {new Date().getFullYear()} Youguard Eco Supply Chain.{" "}
              {t("footer.copyright")}
            </p>
            <div className="flex gap-6">
              <LocaleLink
                href="/privacy"
                className="text-[9px] font-black tracking-widest uppercase text-gray-700 hover:text-gray-500 transition"
              >
                {t("footer.privacy")}
              </LocaleLink>
              <LocaleLink
                href="/terms"
                className="text-[9px] font-black tracking-widest uppercase text-gray-700 hover:text-gray-500 transition"
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
