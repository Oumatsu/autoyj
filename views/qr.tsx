"use client";

import { useState } from "react";
import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { T } from "@tolgee/react";
import { OFFICIAL_WHATSAPP_URL, OFFICIAL_WHATSAPP_NUMBER } from "@/lib/constants";

export default function QrPage() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleSave = () => {
    const a = document.createElement("a");
    a.href = "/pic/0.webp";
    a.download = "Youguard-WhatsApp-QR.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(OFFICIAL_WHATSAPP_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      <main className="min-h-screen bg-b flex flex-col items-center justify-center px-4 sm:px-6 py-16">
        <div className="glass rounded-[2.5rem] p-6 sm:p-10 flex flex-col items-center gap-6 max-w-md w-full border border-white/10 shadow-2xl">
          <div className="text-center">
            <div className="label justify-center mb-3">{t("qr.badge", "Connect on WhatsApp")}</div>
            <h1 className="text-xl sm:text-2xl font-black italic text-white uppercase tracking-tight">
              <T keyName="qr.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
            </h1>
          </div>

          {/* Primary Action: Direct Click to Chat */}
          <a
            href={OFFICIAL_WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full py-4 rounded-xl text-xs sm:text-sm font-black tracking-widest uppercase flex items-center justify-center gap-2.5 shadow-lg shadow-[#5ee6d8]/15 hover:shadow-[#5ee6d8]/25 transition-all text-center"
          >
            <svg viewBox="0 0 32 32" width="18" height="18" fill="none" aria-hidden="true">
              <circle cx="16" cy="16" r="16" fill="currentColor" fillOpacity="0.18" />
              <path
                d="M16 6C10.477 6 6 10.477 6 16c0 1.9.53 3.677 1.45 5.19L6 26l4.93-1.43A9.94 9.94 0 0 0 16 26c5.523 0 10-4.477 10-10S21.523 6 16 6Zm5.6 13.6c-.24.66-1.38 1.28-1.9 1.34-.5.06-1 .24-3.38-.72-2.86-1.18-4.68-4.06-4.82-4.26-.14-.2-1.14-1.52-1.14-2.9 0-1.38.72-2.06 1-2.34.26-.28.58-.34.78-.34h.56c.18 0 .42-.06.66.5.24.56.82 2 .9 2.14.08.14.12.3.02.48-.1.18-.14.3-.28.46-.14.16-.3.36-.42.48-.14.14-.3.3-.12.58.18.28.8 1.32 1.72 2.14 1.18 1.04 2.18 1.38 2.46 1.52.28.14.46.12.62-.06.18-.18.76-.88.96-1.18.2-.3.4-.24.66-.14.26.1 1.64.78 1.92.92.28.14.46.2.52.32.06.12.06.68-.18 1.34Z"
                fill="currentColor"
              />
            </svg>
            <span>{t("contact.whatsapp.cta", "Chat Directly on WhatsApp")}</span>
            <span className="text-sm">↗</span>
          </a>

          {/* Interactive QR Code (Clickable to open directly, or scan with camera) */}
          <div className="relative w-full max-w-[260px] flex flex-col items-center gap-2">
            <a
              href={OFFICIAL_WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block w-full rounded-2xl overflow-hidden border border-white/10 hover:border-[#5ee6d8]/60 transition-all shadow-inner"
              title="Click or scan to chat on WhatsApp"
            >
              <img
                src="/qrcode.jpg"
                alt="WhatsApp QR Code"
                className="w-full block aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-2 text-center backdrop-blur-[2px]">
                <span className="text-xs font-black text-white uppercase tracking-wider">Click to Open ↗</span>
                <span className="text-[10px] text-gray-300">Or scan with phone</span>
              </div>
            </a>
            <p className="text-gray-400 text-[11px] font-light italic text-center">
              {t("qr.instruction", "Click the button above, click the QR code, or scan with WhatsApp camera")}
            </p>
          </div>

          {/* Direct Link & Copy Helper */}
          <div className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/5 text-xs">
            <div className="truncate text-gray-300 font-mono text-[11px]">
              +{OFFICIAL_WHATSAPP_NUMBER}
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-[10px] font-bold text-white uppercase tracking-wider transition-colors shrink-0"
            >
              {copied ? "✓ Copied" : "Copy Link"}
            </button>
          </div>

          {/* Secondary Actions */}
          <div className="flex flex-col gap-2.5 w-full">
            <button
              onClick={handleSave}
              className="btn-outline w-full py-3 rounded-xl text-xs font-black tracking-widest uppercase text-center"
            >
              {t("qr.saveButton", "Save QR Code Image")}
            </button>
          </div>

          <LocaleLink
            href="/"
            className="text-[10px] font-black tracking-widest uppercase text-gray-500 hover:text-white transition"
          >
            {t("qr.backHome", "← Back to Home")}
          </LocaleLink>
        </div>
      </main>
    </>
  );
}
