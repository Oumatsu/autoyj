"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, localeLabels, locales } from "./config";
import { localizeHref } from "./LocaleLink";
import { getLocaleFromPath } from "./utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentLocale = getLocaleFromPath(pathname);
  const current = localeLabels[currentLocale] ?? localeLabels.en;

  /**
   * Next.js App Router 官方标准 i18n URL 构造方法：
   * 1. 基于当前 pathname 替换首段 locale 前缀 (/en/dashboard -> /zh/dashboard)
   * 2. 完整保留当前选中的所有 searchParams (如 ?tab=vehicle_models)
   */
  const getLocalizedHref = (targetLocale: Locale) => {
    const segments = (pathname ?? "/").split("/").filter(Boolean);
    if (locales.includes(segments[0] as Locale)) {
      segments.shift();
    }
    const basePath = `/${segments.join("/")}` || "/";
    const query = searchParams ? searchParams.toString() : "";
    return localizeHref(query ? `${basePath}?${query}` : basePath, targetLocale);
  };

  const handleLocaleSelect = () => {
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full gap-1.5 px-3 py-1.5 font-mono uppercase tracking-widest text-[11px] border-white/15 bg-white/5 hover:bg-white/10 hover:text-white transition-all shadow-sm"
        aria-label={`Select language, current: ${current.nativeName}`}
      >
        {/* W3C i18n Standard: Global Globe Icon instead of country flags */}
        <svg
          className="w-3.5 h-3.5 opacity-80 shrink-0 text-current"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
        <span className="font-semibold">{current.code}</span>
        <svg
          className={cn("w-3 h-3 ml-0.5 opacity-70 transition-transform duration-200", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      <DropdownMenuContent open={open} align="end" className="min-w-[150px] p-1.5 rounded-2xl bg-[#0b1425]/95 border border-white/10 shadow-2xl backdrop-blur-xl">
        {locales.map((locale) => {
          const label = localeLabels[locale];
          const isActive = locale === currentLocale;
          const targetHref = getLocalizedHref(locale);

          return (
            <Link
              key={locale}
              href={targetHref}
              hrefLang={locale}
              rel="alternate"
              onClick={handleLocaleSelect}
              className={cn(
                "flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-colors cursor-pointer select-none outline-none",
                isActive
                  ? "bg-[#22b8aa]/20 text-[#5ee6d8] font-bold"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <div className="flex items-center gap-2">
                <span className={cn("w-1.5 h-1.5 rounded-full transition-opacity", isActive ? "bg-[#5ee6d8]" : "bg-transparent")} />
                <span>{label.nativeName}</span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                {label.code}
              </span>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
