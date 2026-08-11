"use client";

import Loading from "../components/Loading";
import { useState, useEffect } from "react";
import { useTranslation, T } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { sanitizeDisplayData } from "@/lib/display-text";
import { translateInsightArticle } from "@/views/insights/articleTranslations";

type SortMode = "recommended" | "newest" | "oldest";

interface Article {
  title: string;
  category: string;
  date: string;
  sortDate: string;
  readTime: string;
  slug: string;
  coverImage: string;
  sortOrder: number;
  overview: string;
}

function getTagClass(category: string): string {
  const cat = category.toLowerCase().trim();
  if (cat === "market analysis" || cat === "product watch") {
    return "bg-white/5 text-white border border-white/10";
  }
  if (cat === "operator hub" || cat === "sourcing intelligence") {
    return "bg-accent/10 text-accent border border-accent/30";
  }
  if (cat === "policy & tariffs" || cat === "pricing & trade") {
    return "bg-gold/10 text-gold border border-gold/30";
  }
  return "bg-accent/10 text-accent border border-accent/30";
}

import { getInsightImage } from "./insights/insightImages";

const PER_PAGE = 8;
const imgPath = (a: { slug: string; coverImage: string }) => getInsightImage(a.slug, a.coverImage);

const ALL_CATEGORIES = ["Market Analysis", "Policy & Tariffs", "Sourcing Intelligence", "Operator Hub", "Product Watch", "Pricing & Trade"] as const;
type Category = (typeof ALL_CATEGORIES)[number];

function getCategoryLabel(category: string, t: any): string {
  const cat = category.toLowerCase().trim();
  if (cat === "market analysis") return t("insights.categories.marketAnalysis");
  if (cat === "policy & tariffs") return t("insights.categories.policyTariffs");
  if (cat === "sourcing intelligence") return t("insights.categories.sourcingIntelligence");
  if (cat === "operator hub") return t("insights.categories.operatorHub");
  if (cat === "product watch") return t("insights.categories.productWatch");
  if (cat === "pricing & trade") return t("insights.categories.pricingTrade");
  return category;
}

export default function InsightsPage() {
  const { t } = useTranslation();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [filterCat, setFilterCat] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>("recommended");
  const [page, setPage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/portal/public/insights")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch insights");
        return res.json().then(sanitizeDisplayData);
      })
      .then((data: any) => {
        if (!Array.isArray(data)) throw new Error("Invalid insights response");
        if (isMounted) setArticles(data);
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [filterCat, sortBy]);

  const localizedArticles = articles.map((article) => translateInsightArticle(article, t));
  const sorted = [...localizedArticles].sort((a, b) => {
    if (sortBy === "newest") return b.sortDate.localeCompare(a.sortDate);
    if (sortBy === "oldest") return a.sortDate.localeCompare(b.sortDate);
    return a.sortOrder - b.sortOrder;
  });
  const filtered = filterCat ? sorted.filter((a) => a.category === filterCat) : sorted;
  const heroArticle = filtered[0];
  const sideArticles = filtered.slice(1, 3);
  const feedArticles = filtered.slice(3);
  const totalPages = Math.ceil(feedArticles.length / PER_PAGE);
  const start = page * PER_PAGE;
  const paged = feedArticles.slice(start, start + PER_PAGE);

  useEffect(() => {
    const el = document.getElementById("insights-feed");
    if (el) {
      const navbar = document.getElementById("navbar");
      const offset = navbar ? navbar.offsetHeight + 12 : 80;
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }, [page]);

  const handleFilter = (cat: Category) => {
    setFilterCat((prev) => (prev === cat ? null : cat));
    setPage(0);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <>
      <header className="pt-24 sm:pt-32 pb-8 sm:pb-12 bg-a relative z-10">
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-theme" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">
              {t("insights.badge")} <span className="text-accent">{t("insights.badgeAccent")}</span>
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">
            <T
              keyName="insights.heading"
              params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" />, br: <br /> }}
            />
          </h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">
            {t("insights.description")}
          </p>
        </div>
      </header>

      <main className="py-8 sm:py-12 min-h-screen" style={{ background: "var(--color-mid)" }}>
        <div className="container mx-auto px-4 sm:px-6 md:px-12">
          {loading ? (
            <Loading text={t("insights.loading")} />
          ) : error ? (
            <p role="alert" className="py-20 text-center text-gray-400">
              {t(
                "insights.loadError",
                "Insights are temporarily unavailable. Please try again.",
              )}
            </p>
          ) : articles.length === 0 ? (
            <p role="status" className="py-20 text-center text-gray-400">
              {t("insights.empty", "No insights are currently available.")}
            </p>
          ) : (
            <>
              {heroArticle && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
                  <LocaleLink href={`/insights/${heroArticle.slug}`} className="lg:col-span-8 relative rounded-2xl overflow-hidden flex flex-col justify-end p-6 sm:p-8 min-h-[300px] sm:min-h-[450px] md:min-h-[500px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1 group">
                    <img src={imgPath(heroArticle)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.6)" }} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                    <div className="relative z-20">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${getTagClass(heroArticle.category)}`}>
                        {getCategoryLabel(heroArticle.category, t)}
                      </span>
                      <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight mb-3">{heroArticle.title}</h2>
                      <p className="text-gray-300 font-light text-sm mb-4 max-w-xl">{heroArticle.overview}</p>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-3">
                        <span>{t("insights.authorLabel")}</span> <span>•</span> <span>{heroArticle.date}</span>
                      </div>
                    </div>
                  </LocaleLink>
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {sideArticles.map((item) => (
                      <LocaleLink key={item.slug} href={`/insights/${item.slug}`} className="relative rounded-2xl overflow-hidden flex flex-col justify-end p-5 sm:p-6 min-h-[180px] sm:min-h-[220px] md:min-h-[235px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1 group flex-1">
                        <img src={imgPath(item)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.6)" }} alt="" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                        <div className="relative z-20">
                          <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${getTagClass(item.category)}`}>
                            {getCategoryLabel(item.category, t)}
                          </span>
                          <h3 className="text-xl font-black italic text-white leading-tight mb-2">{item.title}</h3>
                          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{item.date}</div>
                        </div>
                      </LocaleLink>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-8">
                  <div id="insights-feed" className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                    <div className="text-xs font-black uppercase tracking-widest text-white">{t("insights.latestIntelligence")}</div>
                    <div className="flex items-center gap-1">
                      {(["recommended", "newest", "oldest"] as const).map((mode) => (
                        <button key={mode} onClick={() => { setSortBy(mode); setPage(0); }} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full transition-all ${sortBy === mode ? "bg-gold text-black" : "text-gray-500 hover:text-white"}`}>
                          {mode === "recommended" ? t("insights.sortRecommended") : mode === "newest" ? t("insights.sortNewest") : t("insights.sortOldest")}
                        </button>
                      ))}
                    </div>
                    <div className="h-px bg-white/10 flex-grow" />
                  </div>
                  {paged.length === 0 ? (
                     feedArticles.length === 0 && filtered.length > 0 ? (
                       <p className="text-gray-500 text-sm font-light italic py-8 text-center">{t("insights.emptyFeed")}</p>
                     ) : (
                       <p className="text-gray-500 text-sm font-light italic py-8 text-center">{t("insights.noMatchFilter")}</p>
                     )
                  ) : (
                    <div className="space-y-2">
                      {paged.map((item) => (
                        <LocaleLink key={item.slug} href={`/insights/${item.slug}`}
                          className="flex flex-col md:flex-row gap-8 py-8 border-b border-white/5 hover:bg-white/[0.02] hover:px-4 hover:rounded-2xl hover:border-b-0 transition-all duration-300 group">
                          <div className="hidden md:block w-[200px] h-[140px] rounded-xl overflow-hidden flex-shrink-0">
                            <img src={imgPath(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ filter: "grayscale(20%)" }} alt="" />
                          </div>
                          <div className="flex flex-col justify-center">
                            <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${getTagClass(item.category)}`}>
                              {getCategoryLabel(item.category, t)}
                            </span>
                            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                            <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">{item.overview}</p>
                            <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{item.date} <span>•</span> {item.readTime}</div>
                          </div>
                        </LocaleLink>
                      ))}
                    </div>
                  )}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-12">
                      <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 text-gray-400 hover:text-white hover:border-gold transition disabled:opacity-30 disabled:cursor-not-allowed">
                        {t("insights.prev")}
                      </button>
                      {pages.map((p) => (
                        <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-xs font-black transition ${p === page ? "bg-gold text-black" : "border border-white/10 text-gray-400 hover:text-white hover:border-gold"}`}>{p + 1}</button>
                      ))}
                      <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 text-gray-400 hover:text-white hover:border-gold transition disabled:opacity-30 disabled:cursor-not-allowed">
                        {t("insights.next")}
                      </button>
                    </div>
                  )}
                </div>
                <aside className="lg:col-span-4">
                  <div className="sticky top-28 space-y-6">
                    <div className="glass rounded-[2rem] p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="text-[10px] font-black uppercase tracking-widest text-accent">{t("insights.filterByCategory")}</div>
                        {filterCat && <button onClick={() => { setFilterCat(null); setPage(0); }} className="text-[8px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">{t("insights.clearAll")}</button>}
                      </div>
                      <div className="flex flex-col gap-2">
                        {ALL_CATEGORIES.map((cat) => {
                          const count = localizedArticles.filter((a) => a.category === cat).length;
                          const active = filterCat === cat;
                          return (
                            <button key={cat} onClick={() => handleFilter(cat)} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-gold text-black" : "text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                              <span className="flex items-center gap-2">
                                <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-black" : "bg-gold"}`} />
                                {getCategoryLabel(cat, t)}
                              </span>
                              <span className={`text-[8px] px-2 py-0.5 rounded-full ${active ? "bg-black/20 text-black" : "bg-white/5 text-gray-500"}`}>{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div className="glass rounded-[2rem] p-8 border-theme/30 bg-gradient-to-b from-mid to-bg2 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/20 rounded-full blur-2xl"></div>
                      <div className="relative z-10">
                        <div className="text-[10px] font-black uppercase tracking-widest text-theme mb-4">{t("insights.sidebar.title")}</div>
                        <h3 className="text-2xl font-black italic text-white mb-4">{t("insights.sidebar.heading")}</h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">{t("insights.sidebar.description")}</p>
                        <LocaleLink href="/qr" className="w-full btn-primary py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">{t("insights.sidebar.subscribeButton")}</LocaleLink>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
