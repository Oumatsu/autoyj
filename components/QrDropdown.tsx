"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Popover, PopoverContent } from "@/components/ui/popover";

import { OFFICIAL_WHATSAPP_URL } from "@/lib/constants";

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
      onMouseEnter={openDropdown}
      onMouseLeave={closeDropdown}
      className="inline-block"
    >
      <Popover open={open} onOpenChange={setOpen}>
        {children}
        <PopoverContent open={open} align="center" className="w-60 p-3.5 border-[#c5a059]/30 bg-[#0b1425]/95 backdrop-blur-xl shadow-2xl">
          <a
            href={OFFICIAL_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block w-full rounded-xl overflow-hidden border border-white/10 hover:border-[#5ee6d8]/60 transition-all"
            title="Click to open WhatsApp directly"
          >
            <img
              src="/pic/0.webp"
              alt={t("qr.badge", "Scan or Click to Connect on WhatsApp") as string}
              className="w-full block aspect-square object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-[2px]">
              Click to Open ↗
            </div>
          </a>
          <p className="text-[10px] font-bold tracking-wider uppercase text-center text-slate-400 mt-2.5">
            {t("qr.badge", "Scan to Connect on WhatsApp")}
          </p>
          <a
            href={OFFICIAL_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 w-full btn-primary py-2 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow text-center"
          >
            <span>Chat Directly</span>
            <span className="text-xs">↗</span>
          </a>
        </PopoverContent>
      </Popover>
    </div>
  );
}

