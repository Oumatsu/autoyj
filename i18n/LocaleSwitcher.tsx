"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, localeLabels, locales } from "./config";
import { getLocaleFromPath } from "./utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";

export function LocaleSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const currentLocale = getLocaleFromPath(pathname);
  const current = localeLabels[currentLocale];

  const switchLocale = (locale: Locale) => {
    if (locale === currentLocale) {
      setOpen(false);
      return;
    }

    // Persist locale preference so middleware remembers it on future visits
    document.cookie = `NEXT_LOCALE=${locale}; max-age=${60 * 60 * 24 * 365}; path=/; samesite=lax`;

    const segments = pathname.split("/").filter(Boolean);
    if (locales.includes(segments[0] as Locale)) {
      segments[0] = locale;
    } else {
      segments.unshift(locale);
    }

    const newPath = "/" + segments.join("/");
    router.push(newPath);
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
          className={`w-3 h-3 ml-0.5 transition-transform ${open ? "rotate-180" : ""}`}
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
          return (
            <DropdownMenuItem
              key={locale}
              active={isActive}
              onClick={() => switchLocale(locale)}
              className="py-2 px-3 text-xs"
            >
              <span className="text-sm leading-none">{label.flag}</span>
              <span>{label.code}</span>
              <span className="ml-auto text-[10px] opacity-70">
                {label.name}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
