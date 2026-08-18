"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { getLocaleFromPath } from "@/i18n/utils";
import { localeLabels } from "@/i18n/config";

import { TolgeeWrapper } from "./TolgeeWrapper";
import { PwaInstallPrompt } from "./PwaInstallPrompt";

const LOCALE_FONT_MAP: Record<string, string> = {
  zh: "font-sans",
  en: "font-inter",
  am: "font-ethiopic",
};

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const isPortalRoute =
    pathSegments[0] === "portal" ||
    pathSegments[1] === "portal";
  const isDashboardRoute =
    pathSegments[0] === "dashboard" ||
    pathSegments[1] === "dashboard";
  const isAppConsole = isPortalRoute || isDashboardRoute;
  const hidePublicFooter = isAppConsole;
  const hidePublicNavbar = isAppConsole;
  const locale = getLocaleFromPath(pathname);
  const fontClass = LOCALE_FONT_MAP[locale] || "font-sans";
  const textDir = localeLabels[locale]?.dir || "ltr";

  return (
    <TolgeeWrapper locale={locale}>
      <div lang={locale} dir={textDir} className={`min-h-screen ${fontClass}`}>
        {!hidePublicNavbar && <Navbar />}
        {children}
        {!hidePublicFooter && <Footer />}
        <PwaInstallPrompt />
      </div>
    </TolgeeWrapper>
  );
}
