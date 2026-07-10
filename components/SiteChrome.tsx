"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { getLocaleFromPath } from "@/i18n/utils";
import { localeLabels } from "@/i18n/config";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  useEffect(() => {
    const locale = getLocaleFromPath(pathname);
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
  }, [pathname]);

  return (
    <>
      {!isPortal && <Navbar />}
      {children}
      {!isPortal && <Footer />}
    </>
  );
}
