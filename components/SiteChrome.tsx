"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { getLocaleFromPath } from "@/i18n/utils";
import { localeLabels } from "@/i18n/config";

import { TolgeeWrapper } from "./TolgeeWrapper";
import { PwaInstallPrompt } from "./PwaInstallPrompt";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const pathSegments = pathname?.split("/").filter(Boolean) ?? [];
  const isPortalRoute =
    pathSegments[0] === "portal" ||
    pathSegments[1] === "portal";
  const isDashboardRoute =
    pathSegments[0] === "dashboard" ||
    pathSegments[1] === "dashboard";
  const hidePublicFooter = isPortalRoute || isDashboardRoute;
  const locale = getLocaleFromPath(pathname);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = localeLabels[locale].dir;
    
    // 渐进式切换 html 字体类，不直接覆写整个 className
    if (locale === "en") {
      document.documentElement.classList.add("font-inter");
      document.documentElement.classList.remove("font-sans", "font-ethiopic");
    } else if (locale === "am") {
      document.documentElement.classList.add("font-ethiopic");
      document.documentElement.classList.remove("font-inter", "font-sans");
    } else {
      document.documentElement.classList.add("font-sans");
      document.documentElement.classList.remove("font-inter", "font-ethiopic");
    }
  }, [pathname, locale]);

  return (
    <TolgeeWrapper locale={locale}>
      {!isPortalRoute && <Navbar />}
      {children}
      {!hidePublicFooter && <Footer />}
      <PwaInstallPrompt />
    </TolgeeWrapper>
  );
}
