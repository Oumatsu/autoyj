"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type SortMode = "recommended" | "newest" | "oldest";

const articles = [
  { title: "Africa E-Mobility Report 2025: Key Findings Every Dealer Needs to Read", category: "Market Analysis", tagClass: "bg-white/5 text-white border border-white/10", date: "October 15, 2025", sortDate: "2025-10-15", readTime: "8 min", slug: "africa-emobility-report-2025", coverImage: "hero.jpg", sortOrder: 1, overview: "Published in September 2025, the Africa E-Mobility Report 2025 by the Africa E-Mobility Alliance (AEA) is the most comprehensive continent-specific analysis of EV market development currently available." },
  { title: "The Zero-Kilometre Grey Market Is Officially Over", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "January 15, 2026", sortDate: "2026-01-15", readTime: "8 min", slug: "china-zero-km-export-ban-2026", coverImage: "hero.jpg", sortOrder: 2, overview: "For years, a quiet arbitrage existed at the edges of China's automotive export machine." },
  { title: "Which EVs Will Sell Best in Ethiopia in 2026? A Dealer's Prediction Guide", category: "Product Watch", tagClass: "bg-white/5 text-white border border-white/10", date: "January 20, 2026", sortDate: "2026-01-20", readTime: "6 min", slug: "ethiopia-bestseller-ev-predictions-2026", coverImage: "hero.jpg", sortOrder: 3, overview: "Ethiopia's EV market has structural characteristics unlike any other African market — and unlike any other market globally." },
  { title: "The Complete Guide to Importing Through Djibouti Port for Ethiopian EV Dealers", category: "Operator Hub", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "January 30, 2026", sortDate: "2026-01-30", readTime: "8 min", slug: "djibouti-import-guide-ethiopia", coverImage: "hero.jpg", sortOrder: 4, overview: "There is no choice of port for Ethiopian importers." },
  { title: "Ethiopia's EV Tax Policy: Three Years, Three Reversals", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "February 10, 2026", sortDate: "2026-02-10", readTime: "7 min", slug: "ethiopia-ev-tax-policy-2026", coverImage: "hero.jpg", sortOrder: 5, overview: "In September 2022, Ethiopia made international headlines as one of the first African nations to completely waive VAT, excise tax, and surtax on electric vehicle imports." },
  { title: "How RoRo Freight Costs Are Structured: A Framework for African EV Importers", category: "Pricing & Trade", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "February 10, 2026", sortDate: "2026-02-10", readTime: "6 min", slug: "roro-freight-cost-framework", coverImage: "hero.jpg", sortOrder: 6, overview: "Most African EV importers receive a single freight quote from their forwarder and treat it as a fixed cost." },
  { title: "The Complete Document Checklist for Importing a Chinese EV Into Africa", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "February 20, 2026", sortDate: "2026-02-20", readTime: "7 min", slug: "africa-ev-import-customs-checklist", coverImage: "hero.jpg", sortOrder: 7, overview: "African customs clearance for imported vehicles has always been document-intensive." },
  { title: "Charging EVs When the Grid Is Unreliable: A Practical Guide for East African Operators", category: "Operator Hub", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "February 28, 2026", sortDate: "2026-02-28", readTime: "7 min", slug: "charging-solutions-unstable-grid", coverImage: "hero.jpg", sortOrder: 8, overview: "The most common objection to EV adoption in East African commercial markets is not price, range, or technology — it is charging: \"Where will we charge it? The electricity cuts out for hours every day.\" This objection is legitimate." },
  { title: "Nigeria's VAT Exemption Order: What Every EV Dealer Must Know", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "March 5, 2026", sortDate: "2026-03-05", readTime: "5 min", slug: "nigeria-vat-exemption-2024", coverImage: "hero.jpg", sortOrder: 9, overview: "In September 2024, Nigeria's federal government quietly enacted one of the most significant EV import policy changes on the continent." },
  { title: "Mombasa, Djibouti, or Dar es Salaam? The East Africa Port Guide for EV Importers", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "March 5, 2026", sortDate: "2026-03-05", readTime: "7 min", slug: "east-africa-port-guide", coverImage: "hero.jpg", sortOrder: 10, overview: "The choice of East African port is not simply a logistics question — it determines your duty liability jurisdiction, your customs clearance timeline, your road transit costs to destination, and your exposure to port congestion delays." },
  { title: "Building a Chinese EV Spare Parts Supply Chain in Ethiopia Without an Official OEM Network", category: "Operator Hub", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "March 10, 2026", sortDate: "2026-03-10", readTime: "8 min", slug: "chinese-ev-spare-parts-ethiopia", coverImage: "hero.jpg", sortOrder: 11, overview: "The Africa E-Mobility Alliance's 2025 report identified spare parts availability — specifically, parts within 30 days — as the single most important factor in commercial fleet buyer decision-making." },
  { title: "RoRo or Container? How African EV Importers Should Choose Their Shipping Method", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "March 15, 2026", sortDate: "2026-03-15", readTime: "6 min", slug: "roro-vs-container", coverImage: "hero.jpg", sortOrder: 12, overview: "When a Chinese EV leaves a factory in Shenzhen, Tianjin, or Chongqing headed for East or West Africa, it will move by one of two ocean freight methods: RoRo (Roll-on Roll-off) or container." },
  { title: "Kenya's National Electric Mobility Policy: East Africa's Most Mature EV Market Just Got More Serious", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "March 20, 2026", sortDate: "2026-03-20", readTime: "6 min", slug: "kenya-ev-mobility-policy-2026", coverImage: "hero.jpg", sortOrder: 13, overview: "Kenya has been quietly building the most coherent EV policy framework in Sub-Saharan Africa." },
  { title: "The Birr Has Lost Two-Thirds of Its Value. How Ethiopian EV Dealers Should Price and Protect Margins.", category: "Pricing & Trade", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "March 25, 2026", sortDate: "2026-03-25", readTime: "7 min", slug: "ethiopia-birr-depreciation-pricing-strategy", coverImage: "hero.jpg", sortOrder: 14, overview: "On July 29, 2024, the National Bank of Ethiopia announced that the Birr would shift to a market-determined exchange rate — ending two decades of managed peg that had kept the official rate artificially stable." },
  { title: "Ghana's 8-Year Zero-Tariff Window: The Best Local Assembly Deal in West Africa", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "April 2, 2026", sortDate: "2026-04-02", readTime: "5 min", slug: "ghana-zero-tariff-2024", coverImage: "hero.jpg", sortOrder: 15, overview: "Ghana's EV import policy is deliberately narrow — and that specificity is what makes it commercially interesting." },
  { title: "How to Sell EVs to Ethiopian Taxi Associations and Fleet Operators", category: "Operator Hub", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "April 2, 2026", sortDate: "2026-04-02", readTime: "8 min", slug: "selling-to-ethiopian-taxi-fleet-operators", coverImage: "hero.jpg", sortOrder: 16, overview: "Ethiopia's EV market is not primarily a consumer market." },
  { title: "How Long Does It Take to Ship a Car from China to Africa? A Complete Timeline Guide", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "April 5, 2026", sortDate: "2026-04-05", readTime: "6 min", slug: "shipping-time-china-to-africa", coverImage: "hero.jpg", sortOrder: 17, overview: "\"How long does shipping from China to Africa take?\" is the most searched question among first-time African EV importers — and the most consistently underestimated in the answers that circulate online." },
  { title: "Chinese Electric Pickups Are Coming to East Africa. Here's What Matters.", category: "Product Watch", tagClass: "bg-white/5 text-white border border-white/10", date: "April 15, 2026", sortDate: "2026-04-15", readTime: "6 min", slug: "chinese-electric-pickups-ethiopia-2026", coverImage: "hero.jpg", sortOrder: 18, overview: "East Africa runs on pickup trucks." },
  { title: "China Halves Its EV Purchase Tax — And African Dealers Are the Unexpected Winners", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "April 18, 2026", sortDate: "2026-04-18", readTime: "8 min", slug: "china-nev-export-surge-2026", coverImage: "hero.jpg", sortOrder: 19, overview: "Two policy events collided in January 2026 to create the most favourable conditions ever seen for African dealers sourcing EVs from China." },
  { title: "Native RHD vs Converted LHD: The Sourcing Decision That Affects Warranty, Safety, and Resale", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "April 20, 2026", sortDate: "2026-04-20", readTime: "6 min", slug: "rhd-native-vs-conversion", coverImage: "hero.jpg", sortOrder: 20, overview: "Africa's major vehicle markets divide cleanly on steering configuration." },
  { title: "Chinese EV Prices Have Fallen for 32 Consecutive Months. What African Importers Need to Understand.", category: "Pricing & Trade", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "April 28, 2026", sortDate: "2026-04-28", readTime: "7 min", slug: "chinese-ev-factory-price-trends-h1-2026", coverImage: "hero.jpg", sortOrder: 21, overview: "China's EV price war is not a media narrative — it is a documented, sustained market phenomenon that has reshaped the economics of Chinese EV exports to emerging markets." },
  { title: "CATL's 2026 Tech Day Changed the Battery Roadmap. What African Dealers Need to Know.", category: "Product Watch", tagClass: "bg-white/5 text-white border border-white/10", date: "May 2, 2026", sortDate: "2026-05-02", readTime: "7 min", slug: "catl-2026-tech-day", coverImage: "hero.jpg", sortOrder: 22, overview: "On April 21, 2026, CATL — the world's largest battery manufacturer, supplying cells to BYD, Geely, NIO, Li Auto, and most of the major Chinese EV brands — held its annual Technology Day in Ningde, China." },
  { title: "Auto China 2026 Just Closed. Here Are the Signals African Dealers Should Act On.", category: "Product Watch", tagClass: "bg-white/5 text-white border border-white/10", date: "May 8, 2026", sortDate: "2026-05-08", readTime: "6 min", slug: "beijing-auto-show-2026-africa-picks", coverImage: "hero.jpg", sortOrder: 23, overview: "Auto China 2026 — the Beijing International Automotive Exhibition — closed on May 3 as the largest automotive show of the year by product volume." },
  { title: "China Extends Zero Tariffs to 53 African Nations: What It Signals for the EV Supply Chain", category: "Policy & Tariffs", tagClass: "bg-gold/10 text-gold border border-gold/30", date: "May 8, 2026", sortDate: "2026-05-08", readTime: "6 min", slug: "china-zero-tariff-africa-2026", coverImage: "hero.jpg", sortOrder: 24, overview: "On May 1, 2026, China formally implemented zero-tariff treatment for all 53 African nations with which it maintains diplomatic relations." },
  { title: "BYD Seagull: What It Actually Costs to Import One to Ethiopia in 2026", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "May 10, 2026", sortDate: "2026-05-10", readTime: "8 min", slug: "byd-seagull-landed-cost-ethiopia", coverImage: "hero.jpg", sortOrder: 25, overview: "The BYD Seagull has become the reference vehicle for African EV importers asking the same foundational question: what does a credible, mass-market Chinese EV actually cost to land in my country? The Seagull's China domestic price of approximately RMB 69,800–79,800 ($9,600–$11,000 USD) has been widely quoted in trade media and has driven significant importer interest across East Africa." },
  { title: "The 5 Best Chinese EVs for African Markets in 2026", category: "Sourcing Intelligence", tagClass: "bg-accent/10 text-accent border border-accent/30", date: "May 12, 2026", sortDate: "2026-05-12", readTime: "8 min", slug: "best-chinese-evs-for-africa-2026", coverImage: "hero.jpg", sortOrder: 26, overview: "\"Which Chinese EV should I import?\" is the defining question for African dealers in 2026." },
  { title: "IEA Global EV Outlook 2025: What the World's Most Authoritative Report Says About Africa", category: "Market Analysis", tagClass: "bg-white/5 text-white border border-white/10", date: "May 20, 2026", sortDate: "2026-05-20", readTime: "9 min", slug: "iea-global-ev-outlook-2025", coverImage: "hero.jpg", sortOrder: 27, overview: "The International Energy Agency's Global EV Outlook 2025, published in May 2025, is the most comprehensive annual survey of electric vehicle markets worldwide." },
  { title: "Chinese Brands Now Drive 75% of Emerging Market EV Growth. Here's What That Means for Africa.", category: "Market Analysis", tagClass: "bg-white/5 text-white border border-white/10", date: "June 3, 2026", sortDate: "2026-06-03", readTime: "7 min", slug: "china-brands-emerging-markets", coverImage: "hero.jpg", sortOrder: 28, overview: "The IEA's Global EV Outlook 2025 contains a data point that deserves more attention than it has received: across all emerging economies outside China, Chinese-manufactured EVs accounted for 75% of the total increase in electric car sales in 2024." },
  { title: "BYD Is Tripling Its South Africa Dealership Network. What It Means for the Continent.", category: "Market Analysis", tagClass: "bg-white/5 text-white border border-white/10", date: "June 20, 2026", sortDate: "2026-06-20", readTime: "6 min", slug: "byd-south-africa-expansion-2026", coverImage: "hero.jpg", sortOrder: 29, overview: "In June 2025, BYD confirmed it would expand its South Africa dealer network from approximately 13 locations to 60–70 dealerships by the end of 2026." },
  { title: "Morocco and Egypt Are Leading Africa's EV Surge. Sub-Saharan Dealers Should Pay Attention.", category: "Market Analysis", tagClass: "bg-white/5 text-white border border-white/10", date: "July 5, 2026", sortDate: "2026-07-05", readTime: "6 min", slug: "morocco-egypt-ev-surge-2025", coverImage: "hero.jpg", sortOrder: 30, overview: "When the IEA reported that African EV sales more than doubled in 2024, reaching nearly 11,000 units, that headline obscured a critical geographic reality: the vast majority of that growth happened in two countries — Morocco and Egypt — each of which exceeded 2,000 EV sales for the first time." },
];

const PER_PAGE = 8;
const imgPath = (a: { slug: string; coverImage: string }) => `/insights/images/${a.slug}/${a.coverImage}`;

const ALL_CATEGORIES = ["Market Analysis", "Policy & Tariffs", "Sourcing Intelligence", "Operator Hub", "Product Watch", "Pricing & Trade"] as const;
type Category = (typeof ALL_CATEGORIES)[number];

export default function InsightsPage() {
  const [filterCat, setFilterCat] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>("recommended");
  const [page, setPage] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sorted = [...articles].sort((a, b) => {
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
  }, [page, filterCat, sortBy]);

  const handleFilter = (cat: Category) => {
    setFilterCat((prev) => (prev === cat ? null : cat));
    setPage(0);
  };

  const pages = Array.from({ length: totalPages }, (_, i) => i);

  return (
    <>
      <header className="pt-32 pb-12 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-theme" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Market <span className="text-accent">Intelligence</span></span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">The <span className="text-theme">Insights</span> <span className="text-accent">Desk</span>.</h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">Real-time policy updates, tariff analyses, and export logistics tracking for the African EV sector.</p>
        </div>
      </header>

      <main className="py-12 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          {heroArticle && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-16">
              <Link href={`/insights/${heroArticle.slug}`} className="lg:col-span-8 relative rounded-2xl overflow-hidden flex flex-col justify-end p-8 min-h-[500px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1 group">
                <img src={imgPath(heroArticle)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.6)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                <div className="relative z-20">
                  <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 ${heroArticle.tagClass}`}>{heroArticle.category}</span>
                  <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight mb-3">{heroArticle.title}</h2>
                  <p className="text-gray-300 font-light text-sm mb-4 max-w-xl">{heroArticle.overview}</p>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-3"><span>autoYJ Intelligence</span> <span>•</span> <span>{heroArticle.date}</span></div>
                </div>
              </Link>
              <div className="lg:col-span-4 flex flex-col gap-6">
                {sideArticles.map((item) => (
                  <Link key={item.slug} href={`/insights/${item.slug}`} className="relative rounded-2xl overflow-hidden flex flex-col justify-end p-6 min-h-[235px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1 group flex-1">
                    <img src={imgPath(item)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.6)" }} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                    <div className="relative z-20">
                      <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${item.tagClass}`}>{item.category}</span>
                      <h3 className="text-xl font-black italic text-white leading-tight mb-2">{item.title}</h3>
                      <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{item.date}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-8">
              <div id="insights-feed" className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                <div className="text-xs font-black uppercase tracking-widest text-white">Latest Intelligence</div>
                <div className="flex items-center gap-1">
                  {(["recommended", "newest", "oldest"] as const).map((mode) => (
                    <button key={mode} onClick={() => { setSortBy(mode); setPage(0); }} className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full transition-all ${sortBy === mode ? "bg-gold text-black" : "text-gray-500 hover:text-white"}`}>
                      {mode === "recommended" ? "Recommended" : mode === "newest" ? "Newest" : "Oldest"}
                    </button>
                  ))}
                </div>
                <div className="h-px bg-white/10 flex-grow" />
              </div>
              {paged.length === 0 ? (
                 feedArticles.length === 0 && filtered.length > 0 ? (
                   <p className="text-gray-500 text-sm font-light italic py-8 text-center">No more articles to show. All results are displayed above.</p>
                 ) : (
                   <p className="text-gray-500 text-sm font-light italic py-8 text-center">No articles match the selected filter.</p>
                 )
              ) : (
                <div className="space-y-2">
                  {paged.map((item) => (
                    <Link key={item.slug} href={`/insights/${item.slug}`}
                      className="flex flex-col md:flex-row gap-8 py-8 border-b border-white/5 hover:bg-white/[0.02] hover:px-4 hover:rounded-2xl hover:border-b-0 transition-all duration-300 group">
                      <div className="hidden md:block w-[200px] h-[140px] rounded-xl overflow-hidden flex-shrink-0">
                        <img src={imgPath(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ filter: "grayscale(20%)" }} alt="" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${item.tagClass}`}>{item.category}</span>
                        <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                        <p className="text-gray-400 text-sm font-light leading-relaxed mb-4">{item.overview}</p>
                        <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{item.date} <span>•</span> {item.readTime}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 text-gray-400 hover:text-white hover:border-gold transition disabled:opacity-30 disabled:cursor-not-allowed">Prev</button>
                  {pages.map((p) => (
                    <button key={p} onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg text-xs font-black transition ${p === page ? "bg-gold text-black" : "border border-white/10 text-gray-400 hover:text-white hover:border-gold"}`}>{p + 1}</button>
                  ))}
                  <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page === totalPages - 1} className="px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10 text-gray-400 hover:text-white hover:border-gold transition disabled:opacity-30 disabled:cursor-not-allowed">Next</button>
                </div>
              )}
            </div>
            <aside className="lg:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="glass rounded-[2rem] p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[10px] font-black uppercase tracking-widest text-accent">Filter by Category</div>
                    {filterCat && <button onClick={() => { setFilterCat(null); setPage(0); }} className="text-[8px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition">Clear All</button>}
                  </div>
                  <div className="flex flex-col gap-2">
                    {ALL_CATEGORIES.map((cat) => {
                      const count = articles.filter((a) => a.category === cat).length;
                      const active = filterCat === cat;
                      return (
                        <button key={cat} onClick={() => handleFilter(cat)} className={`group flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${active ? "bg-gold text-black" : "text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"}`}>
                          <span className="flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${active ? "bg-black" : "bg-gold"}`} />
                            {cat}
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
                    <div className="text-[10px] font-black uppercase tracking-widest text-theme mb-4">Intelligence Briefing</div>
                    <h3 className="text-2xl font-black italic text-white mb-4">Don't Miss the Next Tariff Shift.</h3>
                    <p className="text-gray-400 text-sm font-light leading-relaxed mb-6">Get our monthly digest of African EV policy changes and exclusive wholesale pricing updates delivered straight to your WhatsApp.</p>
                    <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">Subscribe Now</a>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
