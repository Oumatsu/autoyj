"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const IMGS = [
  "/pic/academy/photo-1581092160562-40aa08e78837.webp",
  "/pic/academy/photo-1486312338219-ce68d2c6f44d.webp",
  "/pic/academy/0.webp",
  "/pic/academy/photo-1473341304170-971dccb5ac1e.webp",
  "/pic/academy/photo-1504328345606-18bbc8c9d7d1.webp",
  "/pic/academy/photo-1581092160562-40aa08e78837.webp",
];

const getReadTime = (slug: string) => {
  if (slug.includes("safety")) return "10 min";
  if (slug.includes("diagnostic")) return "9 min";
  if (slug.includes("12v") || slug.includes("auxiliary")) return "8 min";
  if (slug.includes("charge")) return "9 min";
  if (slug.includes("fault") || slug.includes("ethiopia")) return "9 min";
  if (slug.includes("voltage")) return "8 min";
  return "9 min";
};

export default function TechnicalWorkshopPage() {
  const [articles, setArticles] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/portal/public/academy")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        if (data?.lessons?.workshop) {
          setArticles(data.lessons.workshop);
        }
      })
      .catch((err) => console.error("Failed to fetch Technical Workshop:", err));
  }, []);

  return (
    <>
      <header className="pt-32 pb-16 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/academy" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Academy</Link>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Technical Workshop</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">Technical <span className="text-accent">Workshop</span></h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">Hands-on guides for EV technicians — safety, diagnostics, charging, and common faults in African operating conditions.</p>
        </div>
      </header>
      <main className="py-16 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {articles.map((a, i) => (
              <Link key={a.slug} href={`/academy/technical-workshop/${a.slug}`} className="glass rounded-[1.5rem] p-8 block hover:border-accent/30 transition-all duration-300 group relative overflow-hidden">
                <img src={a.img || IMGS[i % IMGS.length]} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(16,185,129,.1)", color: "#10B981", border: "1px solid rgba(16,185,129,.3)" }}>Technical Workshop</span>
                    <span className="text-[9px] text-gray-600">{getReadTime(a.slug)}</span>
                  </div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2 group-hover:text-accent transition-colors">{a.title}</h2>
                  <p className="text-gray-300 text-sm font-light leading-relaxed mb-3">{a.desc}</p>
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">May 16, 2026</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
