import Link from "next/link";

const content = `<p>An EV test drive is not the same as an ICE test drive — and dealers who run it the same way leave most of the conversion opportunity on the table. The EV's advantages (instant torque, silence, smoothness, single-pedal driving) are things a customer must experience physically to believe.</p>
<h2>Why the EV Test Drive Is Your Best Closer</h2>
<p>When a customer books a test drive, they have already passed through the awareness and consideration stages. Their objections are front of mind. But objections are largely rational — and the EV's most compelling advantages are largely sensory.</p>
<p><strong>What happens in test drives that close:</strong> The salesperson sets up the experience before it begins. The route includes a standing start, stop-go urban driving, and a moment of regen. The salesperson is mostly quiet during the drive and lets the vehicle do the selling. The debrief focuses on what the customer just felt, not on specifications.</p>
<h2>Before the Drive: The 5-Minute Setup</h2>
<p><strong>Step 1:</strong> Explain what is different before they start. "When you press the accelerator, the power is instant. When you lift your foot, the car slows down on its own — that's regenerative braking."</p>
<p><strong>Step 2:</strong> Show them the range display. "It shows X km of range right now. After our test drive, we'll check it again."</p>
<p><strong>Step 3:</strong> Let them set up the seat and mirrors. A customer who adjusts the car to their body is already treating it as theirs.</p>
<h2>The Route: What to Include</h2>
<p><strong>Segment 1: The standing start</strong> — Let them experience instant torque. Do not say anything for 10 seconds after the acceleration.</p>
<p><strong>Segment 2: Stop-go urban driving</strong> — This is where EVs genuinely outperform ICE in African cities. No clutch, no gear changes, no stalling.</p>
<p><strong>Segment 3: Silence moment</strong> — Ask them to switch off the radio. A genuinely quiet car interior is something many customers have never experienced.</p>
<p><strong>Segment 4: The return and range check</strong> — "We drove about X km and used Y km of range. How does that compare to what you expected?"</p>
<h2>During the Drive: What to Say and What Not to Say</h2>
<p><strong>Say:</strong> Contextual prompts that draw attention to what they're experiencing. Brief questions that keep them engaged.</p>
<p><strong>Do not say:</strong> Specification recitation, competitor comparisons, anything about price, long explanations that require split attention.</p>
<h2>The Debrief: Converting the Experience to a Decision</h2>
<p><strong>Opening question:</strong> "What was your strongest impression from the drive?" Let them answer. Most customers will mention either the torque, the silence, or the regen braking.</p>
<p><strong>Transition to practicalities:</strong> "The two things people usually want to clarify after a test drive are range and charging. Do you want to go through those numbers now?"</p>
<h2>Handling the Customer Not Ready to Decide</h2>
<p>Give them something concrete to take away, and set a specific next step. "I'll send you a summary on WhatsApp. When you've had a chance to look at it, let me know if you have questions. Are you free to talk again on [specific day]?"</p>
<h2>Sources</h2>
<p>Africa E-Mobility Alliance — EV Consumer Research: Test Drive Conversion Data (2025)</p>
<p>Youguard dealer feedback: field observations from EV sales conversations, Ethiopia market (2025–2026)</p>
<p class="text-gray-500 text-xs font-light italic mt-8">Published by Youguard Academy · May 2026</p>`;

const CAT_ARTICLES = [
  { title: "The 5 EV Objections Every African Dealer Will Face", slug: "ev-objections-african-dealers" },
  { title: "The TCO Conversation Guide: How to Win EV Sales on Total Cost", slug: "tco-conversation-guide" },
];

export default function EvTestDriveGuidePage() {
  return (
    <>
      <main className="pt-32 pb-24 relative z-10 bg-a">
        <div className="container mx-auto px-6 md:px-12">
          <div className="mb-10 text-[10px] font-black uppercase tracking-widest text-gray-500">
            <Link href="/" className="hover:text-gold transition">Home</Link><span className="mx-2">/</span>
            <Link href="/academy" className="hover:text-gold transition">Academy</Link><span className="mx-2">/</span>
            <Link href="/academy/dealer-playbook" className="hover:text-gold transition">Dealer Playbook</Link><span className="mx-2">/</span>
            <span className="text-white">Test Drive</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
            <div className="lg:col-span-8 xl:col-span-8">
              <header className="mb-12">
                <span className="inline-block px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider mb-6 border" style={{ background: "rgba(197,160,89,.15)", color: "var(--color-gold)", borderColor: "rgba(197,160,89,.3)" }}>Dealer Playbook</span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black italic text-white uppercase tracking-tighter leading-[1.05] mb-6">How to Run an EV Test Drive That Closes Deals</h1>
                <p className="text-xl text-gray-400 font-light italic border-l-2 border-theme/30 pl-6 mb-8 max-w-2xl">The test drive is the single most powerful tool in EV sales. A well-structured 20-minute drive converts more fence-sitters than any amount of objection handling.</p>
                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-gray-500 border-t border-white/10 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-mid flex items-center justify-center border border-white/5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <span className="text-white">Youguard Academy</span>
                  </div>
                  <div>May 17, 2026</div>
                  <div className="flex items-center gap-2 text-gold">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    7 min
                  </div>
                </div>
              </header>
              <div className="w-full aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 relative bg-mid">
                <img src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80" alt="EV Test Drive" className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/10 rounded-[2rem] pointer-events-none"></div>
              </div>
              <article className="article-body max-w-3xl" dangerouslySetInnerHTML={{ __html: content }} />
              <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex flex-wrap gap-2">
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Test Drive</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Sales</span>
                  <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase text-gray-400">Conversion</span>
                </div>
              </div>
            </div>
            <aside className="lg:col-span-4 xl:col-span-4">
              <div className="sticky top-28 space-y-6">
                <div className="glass rounded-[2rem] p-8 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mb-6 text-gold">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </div>
                    <div className="text-[10px] font-black tracking-[.2em] uppercase text-gray-500 mb-2">Academy Library</div>
                    <h3 className="text-xl font-black italic text-white mb-4">More Dealer Playbook</h3>
                    <div className="space-y-3">
                      {CAT_ARTICLES.map((a) => (
                        <Link key={a.slug} href={`/academy/dealer-playbook/${a.slug}`} className="block text-xs text-gray-400 hover:text-white transition border-l-2 border-gold/30 pl-3 py-1">{a.title}</Link>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="glass rounded-[2rem] p-8 bg-mid/50 border-white/5 hover:border-green/30 transition-all duration-300 group">
                  <div className="flex items-center gap-4 mb-6">
                    <img src="/pic/academy/photo-1560250097-0b93528c311a.webp" className="w-12 h-12 rounded-full border-2 border-green/50 object-cover" alt="" />
                    <div>
                      <div className="text-sm font-bold text-white">Speak to an Expert</div>
                      <div className="text-[10px] text-green flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green animate-pulse"></span> Available Now</div>
                    </div>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed mb-6">Need help structuring your sales process? Let's talk.</p>
                  <a href="/qr" className="w-full btn-primary py-3 rounded text-[10px] font-black tracking-widest uppercase flex items-center justify-center gap-2">WhatsApp Us</a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </>
  );
}
