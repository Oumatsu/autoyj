"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { getLocaleFromPath } from "@/i18n/utils";
import { localeLabels } from "@/i18n/config";

import { TolgeeWrapper } from "./TolgeeWrapper";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");
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
      {!isPortal && <Navbar />}
      {children}
      {!isPortal && <Footer />}
    </TolgeeWrapper>
  );
}
