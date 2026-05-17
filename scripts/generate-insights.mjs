import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, copyFileSync } from 'fs';
import { join, basename, dirname } from 'path';

const EXAMPLE_DIR = 'example/insights';
const APP_OUT = 'app/insights';
const SITE_OUT = 'site/insights';
const PUBLIC_IMG = 'public/insights/images';
const SITE_IMG = 'site/insights/images';

const CATEGORY_META = {
  'policy-tariffs': { name: 'Policy & Tariffs', tag: 'bg-gold/10 text-gold border border-gold/30' },
  'market-analysis': { name: 'Market Analysis', tag: 'bg-white/5 text-white border border-white/10' },
  'sourcing-intelligence': { name: 'Sourcing Intelligence', tag: 'bg-accent/10 text-accent border border-accent/30' },
  'pricing-trade': { name: 'Pricing & Trade', tag: 'bg-gold/10 text-gold border border-gold/30' },
  'product-watch': { name: 'Product Watch', tag: 'bg-white/5 text-white border border-white/10' },
  'operator-hub': { name: 'Operator Hub', tag: 'bg-accent/10 text-accent border border-accent/30' },
};

function parseArticle(mdPath) {
  const content = readFileSync(mdPath, 'utf-8');
  const lines = content.split('\n');

  let title = '', category = '', date = '', readTime = '', tag = '';
  let inFrontMatter = true;
  let overview = '';
  let coverImage = 'hero.jpg';

  for (const line of lines) {
    if (inFrontMatter) {
      if (line.startsWith('# ')) title = line.slice(2).trim();
      else if (line.startsWith('**Category:**')) category = line.replace(/\*+/g, '').split(':')[1]?.trim() || '';
      else if (line.startsWith('**Date:**')) date = line.replace(/\*+/g, '').split(':')[1]?.trim() || '';
      else if (line.startsWith('**Read Time:**')) readTime = line.replace(/\*+/g, '').split(':')[1]?.trim() || '';
      else if (line.startsWith('**Tag:**')) tag = line.replace(/\*+/g, '').split(':')[1]?.trim() || '';
      else if (line.startsWith('## Overview')) inFrontMatter = false;
    } else {
      if (line.startsWith('## ') && !line.startsWith('## Overview')) break;
      overview += line + ' ';
    }
  }

  // Find first image in markdown (after front matter) for cover
  const imgMatch = content.match(/!\[.*?\]\(([^)]+)\)/);
  if (imgMatch && imgMatch[1] && !imgMatch[1].startsWith('http')) {
    coverImage = imgMatch[1];
  }

  const slug = basename(dirname(mdPath));
  const catDir = basename(dirname(dirname(mdPath)));
  const catInfo = CATEGORY_META[catDir] || { name: category, tag: 'bg-white/5 text-white border border-white/10' };

  // Parse sortable date from display date field
  const MONTHS = { January:'01',February:'02',March:'03',April:'04',May:'05',June:'06',July:'07',August:'08',September:'09',October:'10',November:'11',December:'12' };
  const parseIso = (d) => { const m = d.match(/(\w+)\s+(\d+),\s+(\d+)/); return m ? `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2,'0')}` : '2000-01-01'; };
  const sortDate = parseIso(date);

  // Extract first sentence from overview as plain text
  const plainOverview = overview.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
  const firstSentence = plainOverview.split('. ')[0] + (plainOverview.includes('. ') ? '.' : '');

  return { title, category: catInfo.name, tagClass: catInfo.tag, date, readTime, tag, slug, catDir, overview: firstSentence, coverImage, sortDate, fullContent: content };
}

function copyImages(articleDir, slug) {
  const files = readdirSync(articleDir).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
  const heroFile = files.find(f => f === 'hero.jpg' || f === 'hero.png');
  const otherFiles = files.filter(f => f !== heroFile);

  // Copy to Next.js public
  const nextImgDir = join(PUBLIC_IMG, slug);
  if (!existsSync(nextImgDir)) mkdirSync(nextImgDir, { recursive: true });
  for (const f of files) {
    copyFileSync(join(articleDir, f), join(nextImgDir, f));
  }

  // Copy to static HTML
  const siteImgDir = join(SITE_IMG, slug);
  if (!existsSync(siteImgDir)) mkdirSync(siteImgDir, { recursive: true });
  for (const f of files) {
    copyFileSync(join(articleDir, f), join(siteImgDir, f));
  }

  return { heroFile, otherFiles };
}

function mdToHtml(md, slug) {
  let html = '';
  const lines = md.split('\n');
  let skipUntilOverview = true;
  let inTable = false;
  let tableHtml = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith('## Overview')) { skipUntilOverview = false; continue; }
    if (skipUntilOverview) continue;

    if (line.startsWith('---') || line.startsWith('> **')) continue;

    if (line.startsWith('## ') && !line.startsWith('## Overview')) {
      if (inTable) { html += tableHtml + '</div></div>\n'; inTable = false; }
      html += `<h2>${line.replace('## ', '')}</h2>\n`;
      continue;
    }

    if (line.startsWith('### ')) {
      if (inTable) { html += tableHtml + '</div></div>\n'; inTable = false; }
      html += `<h3>${line.replace('### ', '')}</h3>\n`;
      continue;
    }

    if (line.startsWith('|')) {
      if (!inTable) { inTable = true; tableHtml = '<div class="overflow-x-auto my-8"><table class="w-full border-collapse text-sm">'; }
      const isHeader = line.includes('---');
      if (!isHeader) {
        const cells = line.split('|').filter(c => c.trim());
        const tag = i > 0 && lines[i-1].startsWith('|') && !lines[i-1].includes('---') ? 'td' : 'th';
        const cellClass = tag === 'th' ? 'py-3 px-4 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-white/10 text-left' : 'py-3 px-4 text-sm text-gray-300 border-b border-white/5';
        tableHtml += `<tr>${cells.map(c => `<${tag} class="${cellClass}">${c.trim()}</${tag}>`).join('')}</tr>\n`;
      }
      continue;
    } else if (inTable) {
      html += tableHtml + '</table></div>\n';
      inTable = false;
    }

    if (line.startsWith('![', 0)) {
      const altMatch = line.match(/!\[([^\]]*)\]/);
      const srcMatch = line.match(/\(([^)]+)\)/);
      const alt = altMatch ? altMatch[1] : '';
      let imgSrc = srcMatch ? srcMatch[1] : '';

      const caption = lines[i+1]?.startsWith('*') ? lines[i+1].replace(/^\*/, '').replace(/\*$/, '').trim() : '';
      if (caption) i++;

      // Use local image if available
      let localImg = `images/${slug}/`;
      if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
        localImg += imgSrc;
      } else {
        localImg += 'hero.jpg'; // fallback
      }

      html += `<div class="rounded-[1.5rem] overflow-hidden my-10">\n`;
      html += `  <img src="${localImg}" alt="${alt}" class="w-full h-auto object-cover" style="max-height:450px;">\n`;
      if (caption) {
        html += `  <div class="px-6 py-4 bg-white/[0.02] border-t border-white/5">\n`;
        html += `    <p class="text-xs text-gray-500 font-light italic leading-relaxed">${caption}</p>\n`;
        html += `  </div>\n`;
      }
      html += `</div>\n`;
      continue;
    }

    if (line.startsWith('*') && !line.startsWith('**')) {
      html += `<ul>\n`;
      while (i < lines.length && lines[i].startsWith('*')) {
        const item = lines[i].replace(/^\*\s*/, '');
        html += `  <li>${item}</li>\n`;
        i++;
      }
      html += `</ul>\n`;
      i--;
      continue;
    }

    if (line.match(/^\d+\.\s/)) {
      html += `<ol>\n`;
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        const item = lines[i].replace(/^\d+\.\s*/, '');
        html += `  <li>${item}</li>\n`;
        i++;
      }
      html += `</ol>\n`;
      i--;
      continue;
    }

    if (line.trim() && !line.startsWith('![') && !line.startsWith('*') && !line.match(/^\d+\.\s/)) {
      // Highlight key patterns with gold/green spans, then process bold
      let processed = line
        .replace(/\b(\d{1,3}(?:,\d{3})*\+?\s*(?:%\s|percent|km|kWh|ETB|\$|USD|EUR))\b/g, '<span class="hl-gold">$1</span>')
        .replace(/\b(important|crucial|essential|critical|key takeaway)\b/gi, '<span class="hl-green">$1</span>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      html += `<p>${processed}</p>\n`;
    }
  }

  if (inTable) { html += tableHtml + '</table></div>\n'; }
  return html;
}

function genNextJSPage(article, bodyHtml) {
  const safeTitle = article.title.replace(/'/g, "\\'").replace(/"/g, '&quot;');
  const safeDesc = article.overview.replace(/'/g, "\\'").replace(/"/g, '&quot;').slice(0, 160);

  return `import Link from "next/link";

const content = \`${bodyHtml.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')}\`;

export default function ArticlePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/insights" className="hover:text-gold transition">Insights</Link>
            <span className="mx-2">/</span>
            <span className="text-white">${article.category.split(' ')[0]}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border ${article.tagClass}" style={{ background: "rgba(16,185,129,.1)", color: "var(--color-green)", borderColor: "rgba(16,185,129,.3)" }}>
                  ${article.category}
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">
                  ${safeTitle}
                </h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">
                  ${safeDesc}
                </p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">autoYJ Intelligence</span>
                  </div>
                  <div>${article.date}</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    ${article.readTime}
                  </div>
                </div>
              </header>

              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
                <img src="/insights/images/${article.slug}/hero.jpg" alt="${safeTitle}" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>

              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content.replace(/images\\//g, '/insights/images/') }} />

              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  ${article.tag.split('·').map(t => `<span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">${t.trim()}</span>`).join('\n                  ')}
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4 xl:col-span-4">
              <div className="sticky top-[120px] space-y-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl group-hover:bg-gold/30 transition-all"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                    <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">Free Download</div>
                    <h3 className="text-xl font-black italic text-white mb-4">The 50-Point Factory PDI Checklist</h3>
                    <p className="text-gray-400 text-xs font-light leading-relaxed mb-8">Don't import blind. Download the exact technical inspection checklist our engineers use before loading any vehicle in Shanghai.</p>
                    <a href="https://wa.me/qr/F7M2RQADCE3KN1" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.705 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Get PDF via WhatsApp
                    </a>
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" alt="Consultant" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover group-hover:border-green transition-colors" />
                    <div>
                      <div className="text-sm font-bold text-white group-hover:text-green transition-colors">Speak to an Expert</div>
                      <div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Available Now</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Have specific questions about vehicle models or wholesale pricing? Our procurement team responds in 15 minutes.</p>
                  <Link href="/contact" className="w-full block text-center btn-outline py-3 rounded text-[10px] font-black tracking-widest uppercase hover:bg-green hover:text-black hover:border-green transition-colors">
                    Book a Consultation
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
`;
}

function genStaticHTML(article, bodyHtml) {
  const tags = article.tag.split('·').map(t => t.trim());
  const tagSpans = tags.map(t => `<span class="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">${t}</span>`).join('\n              ');

  const bodyWithPaths = bodyHtml.replace(/images\//g, 'images/');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} — autoYJ Insights</title>
  <meta name="description" content="${article.overview.replace(/<[^>]+>/g, '').slice(0, 160)}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,600;0,700;0,800;0,900;1,300;1,400;1,700;1,800;1,900&display=swap" rel="stylesheet">
  <style>
    :root { --gold:#C5A059; --gold-lt:#D4AF37; --green:#10B981; --bg:#161616; --bg2:#232323; --bg3:#2a2a2a; --mid:#1c1c1c; }
    *,*::before,*::after{box-sizing:border-box}
    html{scroll-behavior:smooth}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:#E5E7EB;-webkit-font-smoothing:antialiased;overflow-x:hidden}
    .bg-a{background:linear-gradient(to bottom,var(--mid) 0%,var(--bg) 20%,var(--bg) 80%,var(--mid) 100%)}
    .glass{background:rgba(0,0,0,0.35);-webkit-backdrop-filter:blur(24px);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px) saturate(1.3);backdrop-filter:blur(24px) saturate(1.3);border:1px solid rgba(197,160,89,0.15);box-shadow:0 8px 32px rgba(0,0,0,0.4)}
    .btn-primary{background:linear-gradient(135deg,#D4AF37 0%,#C5A059 100%);color:#000;transition:transform .25s,box-shadow .25s;display:inline-flex;justify-content:center;align-items:center}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 24px -6px rgba(197,160,89,.45)}
    .btn-outline{border:1px solid rgba(197,160,89,.4);color:var(--gold);transition:background .2s,color .2s}
    .btn-outline:hover{background:var(--gold);color:#000}
    .text-theme{color:var(--gold)}
    .text-accent{color:var(--green)}
    .nav-link{font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);transition:color .2s}
    .nav-link:hover{color:#fff}
    .article-body p{font-size:1rem;line-height:1.9;color:#9CA3AF;margin-bottom:1.5rem;font-weight:300;text-indent:2em}
    .article-body p:first-of-type{text-indent:0}
    .article-body h2{font-size:2rem;font-weight:900;font-style:italic;color:#fff;margin-top:3.5rem;margin-bottom:1.5rem;letter-spacing:-0.02em}
    .article-body h3{font-size:1.5rem;font-weight:700;color:#E5E7EB;margin-top:2.5rem;margin-bottom:1rem}
    .article-body ul{margin-bottom:1.5rem;padding-left:1.5rem}
    .article-body li{font-size:1rem;line-height:1.8;color:#9CA3AF;margin-bottom:0.5rem;font-weight:300;position:relative}
    .article-body li::before{content:'\u2022';color:var(--gold);position:absolute;left:-1.5rem;font-weight:bold}
    .article-body strong{color:#E5E7EB;font-weight:600}
    .article-body .hl-gold{color:var(--gold);font-weight:600}
    .article-body .hl-green{color:var(--green);font-weight:600}
    .article-body table{width:100%;border-collapse:collapse;margin:2rem 0}
    .article-body th{text-align:left;padding:12px 16px;font-size:10px;font-weight:900;letter-spacing:.15em;text-transform:uppercase;color:#9CA3AF;border-bottom:1px solid rgba(255,255,255,.1)}
    .article-body td{padding:12px 16px;font-size:14px;color:#D1D5DB;border-bottom:1px solid rgba(255,255,255,.05)}
    .sticky-sidebar{position:sticky;top:120px}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--bg2)}::-webkit-scrollbar-thumb{background:var(--gold);border-radius:2px}
  </style>
</head>
<body class="antialiased">

<nav class="fixed top-0 left-0 right-0 z-50 glass px-6 md:px-10 py-4 flex items-center justify-between transition-all duration-300">
  <a href="../index.html" class="flex items-center gap-2.5">
    <div class="w-8 h-8 rounded flex items-center justify-center font-black italic text-black" style="background:linear-gradient(135deg,#D4AF37,#C5A059);">A</div>
    <span class="text-lg font-black tracking-tighter uppercase italic"><span class="text-gray-400">auto</span><span class="text-theme">YJ</span></span>
  </a>
  <div class="hidden lg:flex items-center gap-10">
    <a href="../products/products-index-v5.html" class="nav-link">Vehicles</a>
    <a href="../solutions/solutions.html" class="nav-link">Solutions</a>
    <a href="insights.html" class="nav-link active" style="color:#fff;">Insights</a>
    <a href="../academy/academy.html" class="nav-link green">Academy</a>
    <a href="../about.html" class="nav-link">About</a>
  </div>
  <a href="../contact/contact.html" class="hidden lg:block btn-primary px-7 py-2.5 rounded-full text-xs font-black tracking-widest uppercase shadow-lg">Contact Us</a>
  <button id="mob-open" class="lg:hidden p-2 flex flex-col gap-1.5"><span class="w-6 h-0.5 bg-white block"></span><span class="w-6 h-0.5 bg-white block"></span><span class="w-4 h-0.5 bg-white block"></span></button>
</nav>

<div id="mob-menu" class="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-8 text-2xl font-black uppercase italic tracking-tight hidden" style="background:rgba(5,5,5,.97);">
  <button id="mob-close" class="absolute top-5 right-6 text-3xl text-gray-600">\u2715</button>
  <a href="../products/products-index-v5.html" onclick="closeMob()" class="text-white hover:text-theme transition">Vehicles</a>
  <a href="../solutions/solutions.html" onclick="closeMob()" class="text-white hover:text-theme transition">Solutions</a>
  <a href="insights.html" onclick="closeMob()" class="text-white hover:text-theme transition">Insights</a>
  <a href="../academy/academy.html" onclick="closeMob()" class="text-accent">Academy</a>
  <a href="../about.html" onclick="closeMob()" class="text-white hover:text-theme transition">About</a>
  <a href="../contact/contact.html" onclick="closeMob()" class="mt-4 btn-primary px-12 py-4 rounded text-sm tracking-widest">Contact Us</a>
</div>

<main class="pt-32 pb-24 relative z-10">
  <div class="container mx-auto px-6 md:px-12">
    <div class="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
      <a href="../index.html" class="hover:text-gold transition">Home</a> <span class="mx-2">/</span>
      <a href="insights.html" class="hover:text-gold transition">Insights</a> <span class="mx-2">/</span>
      <span class="text-white">${article.category}</span>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
      <div class="lg:col-span-8 xl:col-span-8">
        <header class="mb-12">
          <span class="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border ${article.tagClass}" style="background:rgba(16,185,129,.1);color:var(--green);border-color:rgba(16,185,129,.3);">${article.category}</span>
          <h1 class="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">${article.title}</h1>
          <p class="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">${article.overview.replace(/<[^>]+>/g, '')}</p>
          <div class="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <span class="text-white">autoYJ Intelligence</span>
            </div>
            <div>${article.date}</div>
            <div class="flex items-center gap-2 text-gold">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${article.readTime}
            </div>
          </div>
        </header>
        <div class="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative">
          <img src="images/${article.slug}/hero.jpg" alt="${article.title}" class="w-full h-full object-cover">
          <div class="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
        </div>
        <article class="article-body max-w-3xl">
          ${bodyWithPaths}
        </article>
        <div class="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-2">
          ${tagSpans}
        </div>
      </div>
      <aside class="lg:col-span-4 xl:col-span-4">
        <div class="sticky-sidebar space-y-6">
          <div class="glass rounded-[2rem] p-8 relative overflow-hidden group">
            <div class="absolute -top-20 -right-20 w-40 h-40 bg-gold/20 rounded-full blur-3xl"></div>
            <div class="relative z-10">
              <div class="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              </div>
              <div class="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">Free Download</div>
              <h3 class="text-xl font-black italic text-white mb-4">The 50-Point Factory PDI Checklist</h3>
              <p class="text-gray-400 text-xs font-light leading-relaxed mb-8">Don't import blind. Download the exact technical inspection checklist our engineers use before loading any vehicle in Shanghai.</p>
              <a href="https://wa.me/qr/F7M2RQADCE3KN1" class="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.938 3.659 1.434 5.705 1.435h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Get PDF via WhatsApp
              </a>
            </div>
          </div>
          <div class="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
            <div class="flex items-center gap-4 mb-6">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&q=80" alt="Consultant" class="w-12 h-12 rounded-full border-2 border-green/50 object-cover">
              <div>
                <div class="text-sm font-bold text-white group-hover:text-green transition-colors">Speak to an Expert</div>
                <div class="text-[10px] text-green flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-green animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Available Now</div>
              </div>
            </div>
            <p class="text-gray-400 text-xs font-light leading-relaxed mb-6">Have specific questions about vehicle models or wholesale pricing? Our procurement team responds in 15 minutes.</p>
            <a href="../contact/contact.html" class="w-full block text-center btn-outline py-3 rounded text-[10px] font-black tracking-widest uppercase hover:bg-green hover:text-black hover:border-green transition-colors">Book a Consultation</a>
          </div>
        </div>
      </aside>
    </div>
  </div>
</main>

<script>
const mobOpen=document.getElementById('mob-open'),mobClose=document.getElementById('mob-close'),mobMenu=document.getElementById('mob-menu');
if(mobOpen&&mobClose&&mobMenu){mobOpen.addEventListener('click',()=>{mobMenu.classList.remove('hidden')});mobClose.addEventListener('click',()=>{mobMenu.classList.add('hidden')})}
function closeMob(){if(mobMenu)mobMenu.classList.add('hidden')}
</script>
</body>
</html>`;
}

// ── MAIN ──
const articleDirs = [];
const catDirs = readdirSync(EXAMPLE_DIR, { withFileTypes: true }).filter(d => d.isDirectory());
for (const catDir of catDirs) {
  const catPath = join(EXAMPLE_DIR, catDir.name);
  const subDirs = readdirSync(catPath, { withFileTypes: true }).filter(d => d.isDirectory());
  for (const subDir of subDirs) {
    articleDirs.push(join(catPath, subDir.name));
  }
}

console.log(`Found ${articleDirs.length} articles`);

const allArticles = [];

for (const articleDir of articleDirs) {
  const mdPath = join(articleDir, 'article.md');
  if (!existsSync(mdPath)) { console.log(`  SKIP (no article.md): ${articleDir}`); continue; }

  const article = parseArticle(mdPath);
  const images = copyImages(articleDir, article.slug);
  const bodyHtml = mdToHtml(article.fullContent, article.slug);

  allArticles.push(article);

  // Generate Next.js page
  const appDir = join(APP_OUT, article.slug);
  if (!existsSync(appDir)) mkdirSync(appDir, { recursive: true });
  writeFileSync(join(appDir, 'page.tsx'), genNextJSPage(article, bodyHtml));
  console.log(`  ✅ Next.js: /insights/${article.slug}  (cover: ${article.coverImage}, inline: ${images.otherFiles.length})`);

  // Generate static HTML page
  const staticPath = join(SITE_OUT, `${article.slug}.html`);
  writeFileSync(staticPath, genStaticHTML(article, bodyHtml));
  console.log(`  ✅ Static:  site/insights/${article.slug}.html`);
}

// Generate listing data (articles.json) with coverImage
const listingData = JSON.stringify(allArticles.map(a => ({
  title: a.title, category: a.category, tagClass: a.tagClass, date: a.date,
  readTime: a.readTime, slug: a.slug, coverImage: a.coverImage, overview: a.overview
})));
writeFileSync(join(APP_OUT, 'articles.json'), listingData);
writeFileSync(join(SITE_OUT, 'articles.json'), listingData);
console.log(`\n  ✅ articles.json written (${allArticles.length} articles with coverImage)`);

// Sort by sortDate descending (newest first)
const MONTHS = { January:'01',February:'02',March:'03',April:'04',May:'05',June:'06',July:'07',August:'08',September:'09',October:'10',November:'11',December:'12' };
allArticles.sort((a, b) => {
  const toIso = (d) => { const m = d.match(/(\w+)\s+(\d+),\s+(\d+)/); return m ? `${m[3]}-${MONTHS[m[1]]}-${m[2].padStart(2,'0')}` : '2000-01-01'; };
  return toIso(b.date).localeCompare(toIso(a.date));
});

// Generate Next.js listing page
const artData = allArticles.map(a => `  { title: ${JSON.stringify(a.title)}, category: ${JSON.stringify(a.category)}, tagClass: ${JSON.stringify(a.tagClass)}, date: ${JSON.stringify(a.date)}, sortDate: ${JSON.stringify(a.sortDate)}, readTime: ${JSON.stringify(a.readTime)}, slug: ${JSON.stringify(a.slug)}, coverImage: ${JSON.stringify(a.coverImage)}, overview: ${JSON.stringify(a.overview)} }`).join(',\n');

const sorted = allArticles;

const listingPage = `"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const articles = [
${artData},
];

const PER_PAGE = 8;
const imgPath = (a: { slug: string; coverImage: string }) => \`/insights/images/\${a.slug}/\${a.coverImage}\`;

const ALL_CATEGORIES = ["Market Analysis", "Policy & Tariffs", "Sourcing Intelligence", "Operator Hub", "Product Watch", "Pricing & Trade"] as const;
type Category = (typeof ALL_CATEGORIES)[number];

export default function InsightsPage() {
  const [filterCat, setFilterCat] = useState<Category | null>(null);
  const [page, setPage] = useState(0);

  const filtered = filterCat ? articles.filter((a) => a.category === filterCat) : articles;
  const heroArticle = filtered[0];
  const sideArticles = filtered.slice(1, 3);
  const feedArticles = filtered.slice(3);
  const totalPages = Math.ceil(feedArticles.length / PER_PAGE);
  const start = page * PER_PAGE;
  const paged = feedArticles.slice(start, start + PER_PAGE);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [page, filterCat]);

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
              <Link href={\`/insights/\${heroArticle.slug}\`} className="lg:col-span-8 relative rounded-2xl overflow-hidden flex flex-col justify-end p-8 min-h-[500px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1 group">
                <img src={imgPath(heroArticle)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.6)" }} alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                <div className="relative z-20">
                  <span className={\`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-4 \${heroArticle.tagClass}\`}>{heroArticle.category}</span>
                  <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-tight mb-3">{heroArticle.title}</h2>
                  <p className="text-gray-300 font-light text-sm mb-4 max-w-xl">{heroArticle.overview}</p>
                  <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-3"><span>autoYJ Intelligence</span> <span>•</span> <span>{heroArticle.date}</span></div>
                </div>
              </Link>
              <div className="lg:col-span-4 flex flex-col gap-6">
                {sideArticles.map((item) => (
                  <Link key={item.slug} href={\`/insights/\${item.slug}\`} className="relative rounded-2xl overflow-hidden flex flex-col justify-end p-6 min-h-[235px] cursor-pointer border border-white/5 hover:border-gold transition-all duration-300 hover:-translate-y-1 group flex-1">
                    <img src={imgPath(item)} className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.6)" }} alt="" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />
                    <div className="relative z-20">
                      <span className={\`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 \${item.tagClass}\`}>{item.category}</span>
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
              <div className="flex items-center gap-4 mb-8 pb-4 border-b border-white/10">
                <div className="text-xs font-black uppercase tracking-widest text-white">Latest Intelligence</div>
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
                    <Link key={item.slug} href={\`/insights/\${item.slug}\`}
                      className="flex flex-col md:flex-row gap-8 py-8 border-b border-white/5 hover:bg-white/[0.02] hover:px-4 hover:rounded-2xl hover:border-b-0 transition-all duration-300 group">
                      <div className="hidden md:block w-[200px] h-[140px] rounded-xl overflow-hidden flex-shrink-0">
                        <img src={imgPath(item)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ filter: "grayscale(20%)" }} alt="" />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className={\`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 \${item.tagClass}\`}>{item.category}</span>
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
                    <button key={p} onClick={() => setPage(p)} className={\`w-10 h-10 rounded-lg text-xs font-black transition \${p === page ? "bg-gold text-black" : "border border-white/10 text-gray-400 hover:text-white hover:border-gold"}\`}>{p + 1}</button>
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
                        <button key={cat} onClick={() => handleFilter(cat)} className={\`group flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all \${active ? "bg-gold text-black" : "text-gray-400 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"}\`}>
                          <span className="flex items-center gap-2">
                            <span className={\`w-1.5 h-1.5 rounded-full \${active ? "bg-black" : "bg-gold"}\`} />
                            {cat}
                          </span>
                          <span className={\`text-[8px] px-2 py-0.5 rounded-full \${active ? "bg-black/20 text-black" : "bg-white/5 text-gray-500"}\`}>{count}</span>
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
`;

writeFileSync(join(APP_OUT, 'page.tsx'), listingPage);
console.log(`  ✅ Next.js listing page generated (${allArticles.length} articles with local cover images)`);

console.log(`\n--- Generation Complete: ${articleDirs.length} articles ---`);
console.log(`Images copied to: public/insights/images/ and site/insights/images/`);
