"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPortal = pathname?.startsWith("/portal");

  return (
    <>
      {!isPortal && <Navbar />}
      {children}
      {!isPortal && <Footer />}
    </>
  );
}
