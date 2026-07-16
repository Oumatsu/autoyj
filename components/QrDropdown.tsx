"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";

export function QrDropdown({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const openDropdown = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setOpen(true);
  }, []);

  const closeDropdown = useCallback(() => {
    timerRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
    >
      {children}
      <div
        className="glass absolute top-[calc(100%+10px)] left-0 right-0 mx-auto w-full rounded-2xl transition-all duration-200 p-3"
        style={{
          borderColor: "rgba(197,160,89,0.3)",
          opacity: open ? 1 : 0,
          visibility: open ? "visible" : "hidden",
          pointerEvents: open ? "auto" : "none",
          transform: open
            ? "translateY(0)"
            : "translateY(-4px)",
        }}
      >
        <img
          src="/pic/0.webp"
          alt={t("qr.badge", "Scan to Connect on WhatsApp") as string}
          className="w-full block rounded-lg"
          style={{ aspectRatio: "1 / 1" }}
        />
        <p className="text-[8px] font-black tracking-widest uppercase text-center text-gray-500 mt-2">
          {t("qr.badge", "Scan to Connect on WhatsApp")}
        </p>
      </div>
    </div>
  );
}
