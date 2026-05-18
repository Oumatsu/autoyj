import Link from "next/link";

const IMGS = [
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=600&q=80",
];

const articles = [
  { title: "The 5 EV Objections Every African Dealer Will Face — And How to Answer Them", date: "May 16, 2026", readTime: "8 min", slug: "ev-objections-african-dealers", overview: "Battery life, charging, parts, resale, price — the five objections that account for most stalled EV deals." },
  { title: "The TCO Conversation Guide: How to Win EV Sales on Total Cost, Not Sticker Price", date: "May 16, 2026", readTime: "9 min", slug: "tco-conversation-guide", overview: "The TCO conversation is the most powerful tool an EV dealer has in Africa." },
  { title: "How to Run an EV Test Drive That Closes Deals", date: "May 17, 2026", readTime: "7 min", slug: "ev-test-drive-guide", overview: "A well-structured 20-minute drive converts more fence-sitters than any amount of objection handling." },
];

export default function DealerPlaybookPage() {
  return (
    <>
      <header className="pt-32 pb-16 bg-a relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex items-center gap-2 mb-4">
            <Link href="/" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Home</Link>
            <span className="text-gray-600">/</span>
            <Link href="/academy" className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 hover:text-gold transition">Academy</Link>
            <span className="text-gray-600">/</span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Dealer Playbook</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black italic text-white uppercase tracking-tighter mb-4">Dealer <span className="text-theme">Playbook</span>.</h1>
          <p className="text-gray-400 text-lg font-light max-w-2xl">Practical sales techniques, objection handling, and conversation frameworks to help dealers close more EV deals.</p>
        </div>
      </header>
      <main className="py-16 bg-bg min-h-screen">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-3xl mx-auto space-y-6">
            {articles.map((a, i) => (
              <Link key={a.slug} href={`/academy/dealer-playbook/${a.slug}`} className="glass rounded-[1.5rem] p-8 block hover:border-gold/30 transition-all duration-300 group relative overflow-hidden">
                <img src={IMGS[i]} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-500 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent z-[1]" />
                <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">0{i + 1}</span>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", border: "1px solid rgba(197,160,89,.3)" }}>Dealer Playbook</span>
                  <span className="text-[9px] text-gray-600">{a.readTime}</span>
                </div>
                <h2 className="text-xl font-black italic text-white uppercase tracking-tight mb-2 group-hover:text-theme transition-colors">{a.title}</h2>
                <p className="text-gray-300 text-sm font-light leading-relaxed mb-3">{a.overview}</p>
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{a.date}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
