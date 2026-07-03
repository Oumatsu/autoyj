"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Locale, localeLabels, locales } from "./config";
import { getLocaleFromPath } from "./utils";

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-black tracking-widest uppercase transition border border-white/20 text-gray-300 hover:text-white hover:border-white/40"
        aria-label={localeLabels[currentLocale].name}
      >
        <span className="text-base leading-none">{current.flag}</span>
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
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 z-50 min-w-[120px] rounded-[14px] border border-white/10 bg-[#0b0b0f]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
            {locales.map((locale) => {
              const label = localeLabels[locale];
              return (
                <button
                  key={locale}
                  type="button"
                  onClick={() => switchLocale(locale)}
                  className={`w-full flex items-center gap-2 px-4 py-3 text-left text-xs font-bold tracking-widest uppercase transition ${
                    locale === currentLocale
                      ? "text-white bg-white/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className="text-base leading-none">{label.flag}</span>
                  <span>{label.code}</span>
                  <span className="ml-auto text-[10px] font-medium normal-case tracking-normal opacity-70">
                    {label.name}
                  </span>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
