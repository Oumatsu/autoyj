"use client";

import Link from "next/link";

export default function QrPage() {
  const handleSave = () => {
    const a = document.createElement("a");
    a.href = "/qrcode.jpg";
    a.download = "autoYJ-WhatsApp-QR.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="h-14 sm:hidden bg-black w-full" />
      <main className="min-h-screen bg-b flex flex-col items-center justify-center px-6 py-16">
        <div className="glass rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center gap-8 max-w-sm w-full">
          <div className="text-center">
            <div className="label justify-center mb-3">Scan to WhatsApp</div>
            <h1 className="text-xl font-black italic text-white uppercase tracking-tight">
              Connect on <span className="text-accent">WhatsApp</span>
            </h1>
          </div>

          <img
            src="/qrcode.jpg"
            alt="WhatsApp QR Code"
            className="w-full rounded-2xl border border-white/10"
          />

          <p className="text-gray-400 text-xs font-light italic text-center">
            Please scan the QR code in WhatsApp
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleSave}
              className="btn-outline w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase"
            >
              Save QR Image
            </button>
          </div>

          <Link
            href="/"
            className="text-[10px] font-black tracking-widest uppercase text-gray-600 hover:text-white transition"
          >
            ← Back to Home
          </Link>
        </div>
      </main>
    </>
  );
}
