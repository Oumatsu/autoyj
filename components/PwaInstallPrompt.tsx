"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, Share, PlusSquare, MoreVertical, Smartphone, Monitor, ExternalLink } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

type PlatformTab = "android" | "ios" | "desktop" | "inapp";

export function PwaInstallPrompt() {
  const { locale } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInApp, setIsInApp] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [activeTab, setActiveTab] = useState<PlatformTab>("android");
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

    // Device detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(userAgent);
    const isInAppBrowser = /micromessenger|wechat|lark|feishu|telegram|fbav|instagram|line\//.test(userAgent);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsInApp(isInAppBrowser);

    if (isInAppBrowser) {
      setActiveTab("inapp");
    } else if (isIosDevice) {
      setActiveTab("ios");
    } else if (isAndroidDevice) {
      setActiveTab("android");
    } else {
      setActiveTab("desktop");
    }

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
        setActiveTab("ios");
        setShowGuideModal(true);
      } else if (installPrompt) {
        void installPrompt.prompt();
      } else {
        if (isInAppBrowser) {
          setActiveTab("inapp");
        } else if (isAndroidDevice) {
          setActiveTab("android");
        } else {
          setActiveTab("desktop");
        }
        setShowGuideModal(true);
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
      setActiveTab("ios");
      setShowGuideModal(true);
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
      if (isInApp) {
        setActiveTab("inapp");
      } else if (isAndroid) {
        setActiveTab("android");
      } else {
        setActiveTab("desktop");
      }
      setShowGuideModal(true);
    }
  }, [isIOS, isAndroid, isInApp, installPrompt]);

  if (isStandalone) return null;

  const canShowBanner = !dismissed;

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

      {/* Multi-Platform Step-by-Step Installation Modal */}
      {showGuideModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={locale === "zh" ? "安装指南" : locale === "am" ? "የመጫኛ መመሪያ" : "Install Guide"}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in-0 duration-200"
        >
          <div
            className="fixed inset-0"
            onClick={() => setShowGuideModal(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md rounded-t-3xl sm:rounded-3xl border border-white/15 bg-[#0c1322] p-6 shadow-2xl text-foreground text-left max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/icon-192.png"
                  alt="Youguard Logo"
                  className="h-10 w-10 rounded-xl border border-white/10 object-contain"
                />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {locale === "zh"
                      ? "安装 Youguard 应用"
                      : locale === "am"
                      ? "Youguard መተግበሪያን ጫን"
                      : "Install Youguard App"}
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
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Platform Tabs Selector */}
            <div className="flex rounded-xl bg-white/[0.04] p-1 border border-white/5 mb-4 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("android")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
                  activeTab === "android"
                    ? "bg-[#c5a059] text-black font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span>Android</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("ios")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
                  activeTab === "ios"
                    ? "bg-[#c5a059] text-black font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Share className="h-3.5 w-3.5" />
                <span>iOS (Safari)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("desktop")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition ${
                  activeTab === "desktop"
                    ? "bg-[#c5a059] text-black font-bold shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span>Desktop</span>
              </button>
            </div>

            {/* TAB CONTENT: In-App Browser Warning (WeChat / Lark / Telegram) */}
            {activeTab === "inapp" && (
              <div className="flex flex-col gap-3.5 py-2 text-xs text-gray-200">
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-3.5 border border-amber-500/20">
                  <ExternalLink className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-amber-300">
                      {locale === "zh"
                        ? "请在系统默认浏览器中打开"
                        : locale === "am"
                        ? "በነባሪ አሳሽዎ ውስጥ ይክፈቱ"
                        : "Open in Default Browser"}
                    </div>
                    <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                      {locale === "zh"
                        ? "当前应用内置浏览器不支持直接安装。请点击右上角「…」菜单，选择「在浏览器中打开」（Chrome 或 Safari），即可畅享 PWA 桌面级体验。"
                        : locale === "am"
                        ? "እባክዎ ከላይ በቀኝ በኩል ያለውን ምናሌ በመጫን 'በአሳሽ ውስጥ ክፈት' ን ይምረጡ።"
                        : "In-app browsers don't support direct installation. Tap the top-right menu and select 'Open in Browser' (Chrome or Safari)."}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Android Guide */}
            {activeTab === "android" && (
              <div className="flex flex-col gap-3.5 py-2 text-xs text-gray-200">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#22b8aa]/20 text-[#5ee6d8] font-black text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>
                        {locale === "zh"
                          ? "点击 Chrome/浏览器右上角菜单"
                          : locale === "am"
                          ? "በላይኛው ቀኝ ጥግ ያለውን ምናሌ ይጫኑ"
                          : "Tap browser menu icon (3 dots)"}
                      </span>
                      <MoreVertical className="h-4 w-4 text-[#5ee6d8] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "位于浏览器右上角的三点图标"
                        : locale === "am"
                        ? "በChrome ወይም በEdge አሳሽ የላይኛው ቀኝ ጥግ"
                        : "Located in the top right corner of Chrome/Edge"}
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
                          ? "选择「安装应用」或「添加到主屏幕」"
                          : locale === "am"
                          ? "'መተግበሪያ ጫን' ወይም 'ወደ መነሻ ማያ አክል' ን ይምረጡ"
                          : "Select 'Install app' or 'Add to Home screen'"}
                      </span>
                      <Download className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "在下拉菜单中找到「安装应用」或「添加到主屏幕」"
                        : locale === "am"
                        ? "በተቆልቋይ ምናሌው ውስጥ"
                        : "In the browser menu options"}
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
                        ? "点击「安装」确认完成"
                        : locale === "am"
                        ? "ለማጠናቀቅ 'ጫን' ን ይጫኑ"
                        : "Tap 'Install' to confirm"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "桌面将生成 Youguard 图标，支持全屏极速启动"
                        : locale === "am"
                        ? "መተግበሪያው በመነሻ ማያዎ ላይ ይታያል"
                        : "The app icon will be added to your home screen"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: iOS Guide */}
            {activeTab === "ios" && (
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
                          ? "የSafari ማጋሪያ አዶውን ይጫኑ"
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
            )}

            {/* TAB CONTENT: Desktop Guide */}
            {activeTab === "desktop" && (
              <div className="flex flex-col gap-3.5 py-2 text-xs text-gray-200">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#22b8aa]/20 text-[#5ee6d8] font-black text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>
                        {locale === "zh"
                          ? "点击地址栏右侧的「安装」图标"
                          : locale === "am"
                          ? "በአድራሻ አሞሌው ውስጥ 'ጫን' ን ይጫኑ"
                          : "Click 'Install' icon in address bar"}
                      </span>
                      <Download className="h-4 w-4 text-[#5ee6d8] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "在 Chrome/Edge 浏览器地址栏右端（或右上角菜单中选择「安装 Youguard」）"
                        : locale === "am"
                        ? "በ Chrome/Edge አድራሻ አሞሌ ውስጥ"
                        : "Right side of the address bar or via browser settings menu"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs">
                    2
                  </div>
                  <div>
                    <div className="font-bold text-white">
                      {locale === "zh"
                        ? "在弹窗中点击「安装」即可独立启动"
                        : locale === "am"
                        ? "'ጫን' ን በመጫን ያረጋግጡ"
                        : "Click 'Install' to confirm"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "将作为独立的桌面客户端运行，并可固定到任务栏/程序坞"
                        : locale === "am"
                        ? "እንደ ገለልተኛ የዴስክቶፕ መተግበሪያ ይሰራል"
                        : "Runs as a dedicated desktop app pinned to Dock / Taskbar"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setShowGuideModal(false);
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
