"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const { t, locale } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if already in standalone (installed) mode
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (standalone) {
      setIsStandalone(true);
      return;
    }

    // Check if dismissed in this session
    const isDismissed =
      typeof window !== "undefined" &&
      window.sessionStorage?.getItem?.("youguard_pwa_dismissed") === "true";
    if (isDismissed) {
      setDismissed(true);
    }

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);

    setIsIOS(isIosDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
    };

    const handleCustomOpen = () => {
      setDismissed(false);
      if (isIosDevice) {
        setShowIOSModal(true);
      } else if (installPrompt) {
        void installPrompt.prompt();
      } else {
        setShowIOSModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("youguard-open-pwa-guide", handleCustomOpen);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("youguard-open-pwa-guide", handleCustomOpen);
    };
  }, [installPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    if (typeof window !== "undefined") {
      window.sessionStorage?.setItem?.("youguard_pwa_dismissed", "true");
    }
  }, []);

  const handleInstallAction = useCallback(async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsStandalone(true);
      }
      setInstallPrompt(null);
    } else {
      setShowIOSModal(true);
    }
  }, [isIOS, installPrompt]);

  if (isStandalone) return null;

  const canShowBanner = !dismissed && (Boolean(installPrompt) || isIOS);

  return (
    <>
      {canShowBanner && (
        <aside
          aria-label="Install Youguard Application"
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-5 sm:bottom-6 sm:left-auto sm:right-6"
        >
          <div className="flex items-center justify-between gap-3.5 rounded-2xl border border-[#c5a059]/40 bg-[#0b1425]/95 p-3.5 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <img
                src="/icons/icon-192.png"
                alt="Youguard"
                className="h-10 w-10 rounded-xl border border-white/10 shadow-md object-contain"
              />
              <div>
                <div className="text-xs font-black text-white">Youguard Auto</div>
                <div className="text-[10px] text-gray-300">
                  {isIOS
                    ? (locale === "zh"
                        ? "添加到主屏幕，实时接收商机通知"
                        : locale === "am"
                        ? "ወደ መነሻ ማያ ገጽ ያክሉ"
                        : "Add to Home Screen for instant alerts")
                    : (locale === "zh"
                        ? "安装应用，实时接收询价与商机通知"
                        : locale === "am"
                        ? "ፈጣን ማሳወቂያዎችን ለማግኘት መተግበሪያውን ጫን"
                        : "Install app for instant notifications")}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => void handleInstallAction()}
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba73] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-black shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
              >
                {isIOS ? <Share className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                <span>
                  {locale === "zh" ? (isIOS ? "添加" : "安装") : locale === "am" ? "ጫን" : "Install"}
                </span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                aria-label="Dismiss app install prompt"
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "zh" ? "iOS 安装指南" : locale === "am" ? "የመጫኛ መመሪያ" : "iOS Install Guide"}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowIOSModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#0c1322] p-6 shadow-2xl text-foreground text-left max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/icon-192.png"
                  alt="Youguard Logo"
                  className="h-10 w-10 rounded-xl border border-white/10 object-contain"
                />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {locale === "zh"
                      ? "安装 Youguard 到主屏幕"
                      : locale === "am"
                      ? "Youguard ን ወደ መነሻ ማያ ገጽ ያክሉ"
                      : "Install Youguard to Home Screen"}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {locale === "zh"
                      ? "像原生 App 一样快速启动与离线访问"
                      : locale === "am"
                      ? "ፈጣን እና ምቹ መዳረሻ"
                      : "Instant standalone app experience"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3.5 py-2 text-xs text-gray-200">
              <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#22b8aa]/20 text-[#5ee6d8] font-black text-xs">
                  1
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>
                      {locale === "zh"
                        ? "点击 Safari 底部栏的分享图标"
                        : locale === "am"
                        ? "የማጋሪያ አዶውን ይጫኑ"
                        : "Tap the Safari Share button"}
                    </span>
                    <Share className="h-4 w-4 text-[#5ee6d8] inline shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {locale === "zh"
                      ? "位于屏幕底部的工具栏中间（方块带向上箭头）"
                      : locale === "am"
                      ? "በማያ ገጹ ግርጌ የሚገኘው"
                      : "Located in the bottom toolbar of Safari"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
                  2
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>
                      {locale === "zh"
                        ? "向下滑动选择「添加到主屏幕」"
                        : locale === "am"
                        ? "ወደ መነሻ ማያ ገጽ አክል የሚለውን ይምረጡ"
                        : "Select 'Add to Home Screen'"}
                    </span>
                    <PlusSquare className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {locale === "zh"
                      ? "在弹出的系统分享菜单中找到该选项"
                      : locale === "am"
                      ? "በአማራጮች ዝርዝር ውስጥ"
                      : "In the share sheet menu options"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs">
                  3
                </div>
                <div>
                  <div className="font-bold text-white">
                    {locale === "zh"
                      ? "点击右上角「添加」完成安装"
                      : locale === "am"
                      ? "ከላይ በቀኝ በኩል 'አክል' ን ይጫኑ"
                      : "Tap 'Add' in the top right"}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {locale === "zh"
                      ? "桌面上将生成 Youguard 图标，点击即可秒开"
                      : locale === "am"
                      ? "አዶው በመነሻ ማያዎ ላይ ይታያል"
                      : "The app icon will be added to your home screen"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  handleDismiss();
                }}
                className="w-full rounded-xl bg-white/10 py-3 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
              >
                {locale === "zh" ? "我知道了" : locale === "am" ? "ገባኝ" : "Got it"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
