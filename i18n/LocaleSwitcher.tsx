"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, localeLabels, locales } from "./config";
import { COOKIE_TTL_1Y, LOCALE_COOKIE_NAME } from "@/lib/constants";
import { getLocaleFromPath } from "./utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; max-age=${COOKIE_TTL_1Y}; path=/; samesite=lax`;
}

export function LocaleSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  const currentLocale = getLocaleFromPath(pathname);
  const current = localeLabels[currentLocale];

  /**
   * Next.js App Router 官方标准 i18n URL 构造方法：
   * 1. 基于当前 pathname 替换首段 locale 前缀 (/en/dashboard -> /zh/dashboard)
   * 2. 完整保留当前选中的所有 searchParams (如 ?tab=vehicle_models)
   */
  const getLocalizedHref = (targetLocale: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (locales.includes(segments[0] as Locale)) {
      segments[0] = targetLocale;
    } else {
      segments.unshift(targetLocale);
    }
    const basePath = "/" + segments.join("/");
    const query = searchParams ? searchParams.toString() : "";
    return query ? `${basePath}?${query}` : basePath;
  };

  const handleLocaleSelect = (targetLocale: Locale) => {
    setLocaleCookie(targetLocale);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full gap-1.5 px-3 py-1.5 font-mono uppercase tracking-widest text-[11px]"
        aria-label={localeLabels[currentLocale].name}
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span>{current.code}</span>
        <svg
          className={cn("w-3 h-3 ml-0.5 transition-transform", open && "rotate-180")}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      <DropdownMenuContent open={open} align="end" className="min-w-[140px] p-1 rounded-2xl">
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
              onClick={() => {
                startTransition(() => {
                  handleLocaleSelect(locale);
                });
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors cursor-pointer select-none outline-none",
                isActive
                  ? "bg-[#22b8aa]/15 text-[#5ee6d8]"
                  : "text-slate-300 hover:bg-white/10 hover:text-white"
              )}
            >
              <span className="text-sm leading-none">{label.flag}</span>
              <span>{label.code}</span>
              <span className="ml-auto text-[10px] opacity-70">
                {label.name}
              </span>
            </Link>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

