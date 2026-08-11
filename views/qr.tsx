"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { LocaleLink } from "@/i18n/LocaleLink";
import { T } from "@tolgee/react";

export default function QrPage() {
  const { t } = useTranslation();

  const handleSave = () => {
    const a = document.createElement("a");
    a.href = "/pic/0.webp"; // 修正反斜杠路径为标准相对路径
    a.download = "Youguard-WhatsApp-QR.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <div className="h-[var(--navbar-h,56px)] lg:hidden bg-black w-full" />
      <main className="min-h-screen bg-b flex flex-col items-center justify-center px-6 py-16">
        <div className="glass rounded-[2.5rem] p-8 sm:p-12 flex flex-col items-center gap-8 max-w-sm w-full">
          <div className="text-center">
            <div className="label justify-center mb-3">{t("qr.badge")}</div>
            <h1 className="text-xl font-black italic text-white uppercase tracking-tight">
              <T keyName="qr.heading" params={{ theme: <span className="text-theme" />, accent: <span className="text-accent" /> }} />
            </h1>
          </div>

          <img
            src="/qrcode.jpg"
            alt="WhatsApp QR Code"
            className="w-full rounded-2xl border border-white/10"
          />

          <p className="text-gray-400 text-xs font-light italic text-center">
            {t("qr.instruction")}
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleSave}
              className="btn-outline w-full py-4 rounded-xl text-xs font-black tracking-widest uppercase"
            >
              {t("qr.saveButton")}
            </button>
          </div>

          <LocaleLink
            href="/"
            className="text-[10px] font-black tracking-widest uppercase text-gray-600 hover:text-white transition"
          >
            {t("qr.backHome")}
          </LocaleLink>
        </div>
      </main>
    </>
  );
}
