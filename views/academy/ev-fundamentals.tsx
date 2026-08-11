"use client";

import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { useTranslation, T } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { sanitizeDisplayData } from "@/lib/display-text";
import {
  getAcademyLessonDate,
  translateAcademyLesson,
} from "@/views/academy/academyTranslations";
import { resolveLessonImage } from "@/lib/static-assets";

const getReadTime = (slug: string) => {
  if (slug.includes("range")) return "7 min";
  if (slug.includes("degrade")) return "8 min";
  return "9 min";
};

export default function EvFundamentalsPage() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const localizedArticles = articles.map((article) =>
    translateAcademyLesson(
      { ...article, date: article.date || getAcademyLessonDate(article.slug) },
      t,
    ),
  );

  useEffect(() => {
    let isMounted = true;
    fetch("/api/portal/public/academy")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json().then(sanitizeDisplayData);
      })
      .then((data: any) => {
        if (!Array.isArray(data?.lessons?.fundamentals)) throw new Error();
        if (isMounted) setArticles(data.lessons.fundamentals);
      })
      .catch(() => {
        if (isMounted) setError(true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      <header className="pt-32 pb-16 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <LocaleLink href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">
              {t("academyEvFundamentals.breadcrumb.home")}
            </LocaleLink>
            <span className="text-gray-600">/</span>
            <LocaleLink href="/academy" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">
              {t("academyEvFundamentals.breadcrumb.academy")}
            </LocaleLink>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {t("academyEvFundamentals.breadcrumb.current")}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
            <T
              keyName="academyEvFundamentals.heading"
              params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
            />
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">
            {t("academyEvFundamentals.description")}
          </p>
        </div>
      </header>
      <main className="py-16 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {loading ? (
              <Loading
                fullscreen={false}
                text={t("academyEvFundamentals.loading", "Loading lessons...")}
              />
            ) : error ? (
              <p role="alert" className="py-12 text-center text-gray-400">
                {t(
                  "academyEvFundamentals.loadError",
                  "Academy lessons are temporarily unavailable. Please try again.",
                )}
              </p>
            ) : localizedArticles.length === 0 ? (
              <p role="status" className="py-12 text-center text-gray-400">
                {t(
                  "academyEvFundamentals.empty",
                  "No lessons are currently available.",
                )}
              </p>
            ) : localizedArticles.map((a, i) => (
              <LocaleLink key={a.slug} href={`/academy/ev-fundamentals/${a.slug}`} className="glass rounded-[1.5rem] p-8 block hover:border-green/30 transition-all duration-300 group relative overflow-hidden">
                <img src={resolveLessonImage("fundamentals", a.slug, a.img)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">0{i + 1}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", border: "1px solid rgba(16,185,129,.3)" }}>
                      {t("academyEvFundamentals.tag")}
                    </span>
                    <span className="text-[9px] text-gray-600">{getReadTime(a.slug)}</span>
                  </div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2 group-hover:text-accent transition-colors">{a.title}</h2>
                  <p className="text-gray-300 text-sm font-light leading-relaxed mb-3">{a.desc}</p>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{a.date}</span>
                </div>
              </LocaleLink>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
