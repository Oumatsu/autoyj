"use client";

import Loading from "@/components/Loading";
import { use, useEffect, useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { sanitizeDisplayData } from "@/lib/display-text";
import { asStringArray } from "@/i18n/translationFallback";
import { translateInsightArticle } from "@/views/insights/articleTranslations";

interface ArticleData {
  title: string;
  category: string;
  date: string;
  sortDate: string;
  readTime: string;
  slug: string;
  coverImage: string;
  overview: string;
  content: string;
}

function getTagStyle(category: string): { bg: string; color: string; border: string } {
  const cat = category.toLowerCase().trim();
  if (cat === "operator hub" || cat === "sourcing intelligence") {
    return { bg: "rgba(16,185,129,.1)", color: "var(--color-green)", border: "rgba(16,185,129,.3)" };
  }
  if (cat === "policy & tariffs" || cat === "pricing & trade") {
    return { bg: "rgba(197,160,89,.1)", color: "var(--color-gold)", border: "rgba(197,160,89,.3)" };
  }
  if (cat === "market analysis" || cat === "product watch") {
    return { bg: "rgba(255,255,255,.05)", color: "var(--color-green)", border: "rgba(16,185,129,.3)" };
  }
  return { bg: "rgba(16,185,129,.1)", color: "var(--color-green)", border: "rgba(16,185,129,.3)" };
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

function getSubcategory(category: string, t: any): string {
  const cat = category?.toLowerCase().trim() || "";
  if (cat.includes("market")) return t("insightsDetail.subcategories.market") || "Market";
  if (cat.includes("policy")) return t("insightsDetail.subcategories.policy") || "Policy";
  if (cat.includes("sourcing")) return t("insightsDetail.subcategories.sourcing") || "Sourcing";
  if (cat.includes("operator")) return t("insightsDetail.subcategories.operator") || "Operator";
  if (cat.includes("product")) return t("insightsDetail.subcategories.product") || "Product";
  if (cat.includes("pricing") || cat.includes("trade")) return t("insightsDetail.subcategories.pricing") || "Pricing";
  return t("insightsDetail.subcategories.default") || "Insight";
}

function getTagsForCategory(category: string, t: any): string[] {
  const cat = category?.toLowerCase().trim() || "";
  if (cat.includes("market")) return asStringArray(t("insightsDetail.tags.market"), ["Market Analysis", "Africa EV Market", "Industry Report"]);
  if (cat.includes("policy")) return asStringArray(t("insightsDetail.tags.policy"), ["China Export Policy", "Import Compliance", "Africa Market"]);
  if (cat.includes("sourcing")) return asStringArray(t("insightsDetail.tags.sourcing"), ["Sourcing Intelligence", "Supplier Vetting", "China Export"]);
  if (cat.includes("operator")) return asStringArray(t("insightsDetail.tags.operator"), ["Operator Hub", "Charging Solutions", "Local Infrastructure"]);
  if (cat.includes("product")) return asStringArray(t("insightsDetail.tags.product"), ["Product Watch", "Chinese EV Brands", "Battery Technology"]);
  if (cat.includes("pricing") || cat.includes("trade")) return asStringArray(t("insightsDetail.tags.pricing"), ["Pricing & Trade", "Exchange Rates", "Freight Costs"]);
  return asStringArray(t("insightsDetail.tags.default"), ["EV Export", "Africa EV Sourcing"]);
}

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

export default function DynamicInsightPage({ params }: any) {
  const { t } = useTranslation();
  const resolvedParams: any = params && typeof params.then === "function" ? use(params) : params;
  const { slug } = resolvedParams || {};
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/portal/public/insights/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json().then(sanitizeDisplayData);
      })
      .then((data: any) => setArticle(data))
      .catch(() => setError(true));
  }, [slug]);

  if (error) {
    return (
      <main className="pt-32 pb-24 relative z-10 bg-a min-h-screen flex items-center justify-center">
        <div className="text-center py-20 text-gray-500">
          <h1 className="text-2xl font-bold mb-4 text-white">{t("insightsDetail.articleNotFound")}</h1>
          <p className="mb-8">{t("insightsDetail.articleNotFoundDesc")}</p>
          <LocaleLink href="/insights" className="btn-primary px-6 py-2.5 rounded text-[10px] font-black tracking-widest uppercase">
            {t("insightsDetail.backToInsights")}
          </LocaleLink>
        </div>
      </main>
    );
  }

  if (!article) {
    return <Loading text={t("insightsDetail.loading")} />;
  }

  const localizedArticle = translateInsightArticle(article, t);
  const subcategory = getSubcategory(localizedArticle.category, t);
  const tags = getTagsForCategory(localizedArticle.category, t);
  const coverImageUrl = `/insights/images/${localizedArticle.slug}/${localizedArticle.coverImage}`;

  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <LocaleLink href="/" className="hover:text-gold transition">{t("insightsDetail.breadcrumb.home")}</LocaleLink>
            <span className="mx-2">/</span>
            <LocaleLink href="/insights" className="hover:text-gold transition">{t("insightsDetail.breadcrumb.insights")}</LocaleLink>
            <span className="mx-2">/</span>
            <span className="text-white">{subcategory}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span
                  className={`inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border ${getTagClass(localizedArticle.category)}`}
                  style={{
                    background: getTagStyle(localizedArticle.category).bg,
                    color: getTagStyle(localizedArticle.category).color,
                    borderColor: getTagStyle(localizedArticle.category).border,
                  }}
                >
                  {getCategoryLabel(localizedArticle.category, t)}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  {localizedArticle.title}
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  {localizedArticle.overview}
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <span className="text-white">{t("insightsDetail.authorLabel")}</span>
                  </div>
                  <div>{localizedArticle.date}</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    {localizedArticle.readTime}
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src={coverImageUrl} alt={localizedArticle.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl">
                <MarkdownRenderer content={localizedArticle.content} imageBasePath={`/insights/images/${localizedArticle.slug}`} />
              </article>

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 xl:col-span-4">
              <div className="sticky top-[120px] space-y-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl group-hover:bg-gold/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                    <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">{t("insightsDetail.sidebar.freeDownload")}</div>
                    <h3 className="text-xl font-black italic text-white mb-4">{t("insightsDetail.sidebar.checklistTitle")}</h3>
                    <p className="text-gray-400 text-xs font-light leading-relaxed mb-8">{t("insightsDetail.sidebar.checklistDesc")}</p>
                    <LocaleLink href="/qr" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.705 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      {t("insightsDetail.sidebar.getPdfButton")}
                    </LocaleLink>
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="/pic/academy/photo-1560250097-0b93528c311a.webp" alt="Consultant" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover group-hover:border-green transition-colors" />
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-green transition-colors">{t("insightsDetail.sidebar.speakToExpert")}</div>
                      <div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> {t("insightsDetail.sidebar.availableNow")}</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">{t("insightsDetail.sidebar.expertDesc")}</p>
                  <LocaleLink href="/contact" className="w-full block text-center btn-outline py-3 rounded text-[10px] font-black tracking-widest uppercase hover:bg-green hover:text-black hover:border-green transition-colors">
                    {t("insightsDetail.sidebar.bookConsultation")}
                  </LocaleLink>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
