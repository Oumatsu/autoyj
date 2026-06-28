"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Lesson {
  title: string;
  category: string;
  tag: string;
  desc: string;
  img: string;
  content: string;
}

interface SiblingLesson {
  title: string;
  slug: string;
  tag: string;
  desc: string;
  img: string;
}

export default function DynamicLessonPage({ params }: any) {
  const resolvedParams: any = params && typeof params.then === "function" ? use(params) : params;
  const { category, slug } = resolvedParams || {};

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [siblings, setSiblings] = useState<SiblingLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!category || !slug) return;
    setLoading(true);
    setError(false);

    // Fetch the specific lesson
    fetch(`/api/portal/public/academy/${category}/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Lesson not found");
        return res.json();
      })
      .then((data) => {
        setLesson(data);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [category, slug]);

  useEffect(() => {
    if (!category) return;
    
    // Fetch all lessons to find siblings in the same category
    fetch("/api/portal/public/academy")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        const meta = getCategoryMeta(category);
        const categoryKey = meta.key; // e.g. "fundamentals", "playbook", "workshop"
        
        if (data?.lessons && data.lessons[categoryKey]) {
          const filtered = data.lessons[categoryKey].filter(
            (item: any) => item.slug !== slug
          );
          setSiblings(filtered);
        }
      })
      .catch(() => {
        // Silently ignore sibling fetch errors to avoid breaking the page
      })
      .finally(() => {
        setLoading(false);
      });
  }, [category, slug]);

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 bg-a">
        <h2 className="text-2xl font-black italic text-white uppercase mb-4">Lesson Not Found</h2>
        <p className="text-gray-400 text-sm max-w-md mb-8">
          The requested academy lesson could not be loaded. It may have been moved or unpublished.
        </p>
        <Link href="/academy" className="btn-primary px-8 py-3 rounded-full text-xs font-black uppercase tracking-wider">
          Return to Academy
        </Link>
      </div>
    );
  }

  if (loading || !lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-a">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-xs tracking-widest uppercase">Loading lesson...</p>
        </div>
      </div>
    );
  }

  const meta = getCategoryMeta(category);

  // Parse estimated read time based on length of content
  const wordCount = lesson.content ? lesson.content.replace(/<[^>]*>/g, "").split(/\s+/).length : 0;
  const readTime = Math.max(3, Math.ceil(wordCount / 180)) + " min";

  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          {/* Breadcrumbs */}
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link>
            <span className="mx-2">/</span>
            <Link href={`/academy/${meta.path}`} className="hover:text-gold transition">
              {meta.label}
            </Link>
            <span className="mx-2">/</span>
            <span className="text-white">{lesson.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            {/* Main Content */}
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span
                  className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border"
                  style={meta.style}
                >
                  {meta.label}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  {lesson.title}
                </h1>
                {lesson.desc && (
                  <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                    {lesson.desc}
                  </p>
                )}
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                    </div>
                    <span className="text-white">Youguard Academy</span>
                  </div>
                  <div>May 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {readTime}
                  </div>
                </div>
              </header>

              {/* Cover Image */}
              {lesson.img && (
                <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
                  <img src={lesson.img} alt={lesson.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none" />
                </div>
              )}

              {/* HTML Body */}
              <article
                className="article-body max-w-3xl"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />

              {/* Footer tags */}
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">
                    {lesson.tag || meta.label}
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">
                    Youguard
                  </span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">
                    B2B Enablement
                  </span>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-4 xl:col-span-4">
              <div className="sticky top-28 space-y-6">
                {/* Siblings Widget */}
                {siblings.length > 0 && (
                  <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                    <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                      </div>
                      <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">
                        Academy Library
                      </div>
                      <h3 className="text-xl font-black italic text-white mb-4">
                        {meta.sidebarTitle}
                      </h3>
                      <div className="space-y-3">
                        {siblings.map((sib) => (
                          <Link
                            key={sib.slug}
                            href={`/academy/${meta.path}/${sib.slug}`}
                            className={`block text-xs text-gray-400 hover:text-white transition border-l-2 pl-3 py-1 ${
                              meta.key === "workshop" ? "border-accent/30 hover:border-accent" : "border-gold/30 hover:border-gold"
                            }`}
                          >
                            {sib.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Consult Expert / Parts Widget */}
                <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <img
                      src="/pic/academy/photo-1560250097-0b93528c311a.webp"
                      className="w-12 h-12 rounded-full border-2 border-green/50 object-cover"
                      alt=""
                    />
                    <div>
                      <div className="text-sm font-bold text-white">
                        {meta.key === "workshop" ? "Need Parts?" : "Speak to an Expert"}
                      </div>
                      <div className="text-[10px] text-green flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse" />
                        Available Now
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">
                    {meta.key === "workshop"
                      ? "We can help source AGM batteries and EV diagnostic tools for your workshop stock."
                      : `Have questions about ${meta.label.toLowerCase()} in African conditions? We're here to help.`}
                  </p>
                  <a
                    href="/qr"
                    className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2"
                  >
                    WhatsApp Us
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}

function getCategoryMeta(category: string) {
  const normalized = category?.toLowerCase().trim();
  if (normalized === "ev-fundamentals" || normalized === "fundamentals") {
    return {
      label: "EV Fundamentals",
      key: "fundamentals",
      path: "ev-fundamentals",
      sidebarTitle: "More EV Fundamentals",
      colorClass: "text-green",
      style: { background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }
    };
  }
  if (normalized === "dealer-playbook" || normalized === "playbook") {
    return {
      label: "Dealer Playbook",
      key: "playbook",
      path: "dealer-playbook",
      sidebarTitle: "More Sales Curriculums",
      colorClass: "text-gold",
      style: { background: "rgba(197,160,89,.15)", color: "var(--color-gold)", borderColor: "rgba(197,160,89,.3)" }
    };
  }
  if (normalized === "technical-workshop" || normalized === "workshop") {
    return {
      label: "Technical Workshop",
      key: "workshop",
      path: "technical-workshop",
      sidebarTitle: "More Technical Workshops",
      colorClass: "text-accent",
      style: { background: "rgba(16,185,129,.1)", color: "#10B981", borderColor: "rgba(16,185,129,.3)" }
    };
  }
  return {
    label: category,
    key: category,
    path: category,
    sidebarTitle: `More ${category}`,
    colorClass: "text-white",
    style: { background: "rgba(255,255,255,.1)", color: "#ffffff", borderColor: "rgba(255,255,255,.3)" }
  };
}
