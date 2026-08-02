"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { Popover, PopoverContent } from "@/components/ui/popover";

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
        <PopoverContent open={open} align="center" className="w-56 p-3 border-[#c5a059]/30">
          <img
            src="/pic/0.webp"
            alt={t("qr.badge", "Scan to Connect on WhatsApp") as string}
            className="w-full block rounded-lg aspect-square"
          />
          <p className="text-[10px] font-bold tracking-widest uppercase text-center text-slate-400 mt-2">
            {t("qr.badge", "Scan to Connect on WhatsApp")}
          </p>
        </PopoverContent>
      </Popover>
    </div>
  );
}

