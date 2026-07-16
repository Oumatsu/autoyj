"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import {
  getAcademyLessonDate,
  translateAcademyLesson,
} from "@/views/academy/academyTranslations";

const IMGS = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
];

const getReadTime = (slug: string) => {
  if (slug.includes("objections")) return "8 min";
  if (slug.includes("tco")) return "9 min";
  if (slug.includes("drive")) return "7 min";
  return "8 min";
};

export default function DealerPlaybookPage() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<any[]>([]);
  const localizedArticles = articles.map((article) =>
    translateAcademyLesson(
      { ...article, date: getAcademyLessonDate(article.slug) },
      t,
    ),
  );

  useEffect(() => {
    fetch("/api/portal/public/academy")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data: any) => {
        if (data?.lessons?.playbook) {
          setArticles(data.lessons.playbook);
        }
      })
      .catch((err) => console.error("Failed to fetch Dealer Playbook:", err));
  }, []);

  return (
    <>
      <header className="pt-32 pb-16 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <LocaleLink href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">
              {t("academyDealerPlaybook.breadcrumb.home")}
            </LocaleLink>
            <span className="text-gray-600">/</span>
            <LocaleLink href="/academy" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">
              {t("academyDealerPlaybook.breadcrumb.academy")}
            </LocaleLink>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
              {t("academyDealerPlaybook.breadcrumb.current")}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
            {t("academyDealerPlaybook.heading")}{" "}
            <span className="text-theme">{t("academyDealerPlaybook.headingAccent")}</span>
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">
            {t("academyDealerPlaybook.description")}
          </p>
        </div>
      </header>
      <main className="py-16 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {localizedArticles.map((a, i) => (
              <LocaleLink key={a.slug} href={`/academy/dealer-playbook/${a.slug}`} className="glass rounded-[1.5rem] p-8 block hover:border-gold/30 transition-all duration-300 group relative overflow-hidden">
                <img src={a.img || IMGS[i % IMGS.length]} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">0{i + 1}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", border: "1px solid rgba(197,160,89,.3)" }}>
                      {t("academyDealerPlaybook.tag")}
                    </span>
                    <span className="text-[9px] text-gray-600">{getReadTime(a.slug)}</span>
                  </div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2 group-hover:text-theme transition-colors">{a.title}</h2>
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
