"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Locale, localeLabels, locales } from "./config";
import { localizeHref } from "./LocaleLink";
import { getLocaleFromPath } from "./utils";
import { cn } from "@/lib/utils";

export interface LocaleSwitcherProps {
  variant?: "compact" | "full" | "auto";
  className?: string;
  onSelect?: () => void;
}

export function LocaleSwitcher({ variant = "auto", className, onSelect }: LocaleSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLocale = getLocaleFromPath(pathname);

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
    const basePath = segments.length > 0 ? `/${segments.join("/")}` : "/";
    const query = searchParams ? searchParams.toString() : "";
    return localizeHref(query ? `${basePath}?${query}` : basePath, targetLocale);
  };

  if (variant === "full") {
    return (
      <nav aria-label="Language selection" className={cn("flex w-full items-center rounded-2xl bg-white/[0.06] p-1 border border-white/10 shadow-inner", className)}>
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
              onClick={onSelect}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 text-center text-xs font-semibold rounded-xl transition-all duration-200 min-h-[44px] select-none",
                isActive
                  ? "bg-[#22b8aa] text-white font-bold shadow-md shadow-[#22b8aa]/30"
                  : "text-slate-300 hover:text-white hover:bg-white/5 active:scale-95"
              )}
            >
              <span>{label.nativeName}</span>
              <span className="text-[10px] opacity-60 font-mono uppercase">({label.code})</span>
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Language selection"
      className={cn(
        "inline-flex items-center rounded-full p-1 bg-white/5 border border-white/15 shadow-sm backdrop-blur-md transition-all",
        className
      )}
    >
      <div className="pl-2 pr-1 text-slate-400" aria-hidden="true">
        {/* W3C i18n Standard: Global Globe Icon */}
        <svg
          className="w-3.5 h-3.5 opacity-75 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
          <path d="M2 12h20" />
        </svg>
      </div>

      <div className="flex items-center gap-0.5">
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
              onClick={onSelect}
              aria-current={isActive ? "true" : undefined}
              title={label.name}
              className={cn(
                "px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider rounded-full transition-all duration-200 select-none",
                isActive
                  ? "bg-[#22b8aa] text-white font-black shadow-sm shadow-[#22b8aa]/40"
                  : "text-slate-400 hover:text-white hover:bg-white/10 active:scale-95"
              )}
            >
              {label.code}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
