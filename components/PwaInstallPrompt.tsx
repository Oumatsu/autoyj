"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, X, Share, PlusSquare, MoreVertical, Smartphone, Monitor, ExternalLink, Apple, Laptop, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export type PlatformTarget = "ios" | "android" | "mac" | "mac_safari" | "windows" | "inapp" | "desktop";

export function checkIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const nav = window.navigator as unknown as { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    window.matchMedia("(display-mode: minimal-ui)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    nav.standalone === true ||
    (typeof document !== "undefined" && document.referrer.includes("android-app://")) ||
    window.location.search.includes("source=pwa") ||
    window.location.search.includes("mode=standalone")
  );
}

export function PwaInstallPrompt() {
  const { locale } = useTranslation();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [platform, setPlatform] = useState<PlatformTarget>("desktop");
  const [activeTab, setActiveTab] = useState<PlatformTarget>("desktop");
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isStandalone, setIsStandalone] = useState(() => (typeof window !== "undefined" ? checkIsStandalone() : false));
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [promptTriggered, setPromptTriggered] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsMounted(true);

    // 1. Immediate Standalone Check
    if (checkIsStandalone()) {
      setIsStandalone(true);
      return;
    }

    // 2. Check persistent installed status & dismissal cooldown
    try {
      if (typeof window !== "undefined") {
        if (window.localStorage?.getItem("youguard_pwa_installed") === "true") {
          setDismissed(true);
        }
        const dismissedUntil = window.localStorage?.getItem("youguard_pwa_dismissed_until");
        if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
          setDismissed(true);
        }
      }
    } catch {}

    // 3. Dynamic display-mode change listener
    const standaloneMql = window.matchMedia("(display-mode: standalone)");
    const overlayMql = window.matchMedia("(display-mode: window-controls-overlay)");
    const minimalMql = window.matchMedia("(display-mode: minimal-ui)");

    const onDisplayModeChange = () => {
      if (checkIsStandalone()) {
        setIsStandalone(true);
      }
    };

    standaloneMql.addEventListener?.("change", onDisplayModeChange);
    overlayMql.addEventListener?.("change", onDisplayModeChange);
    minimalMql.addEventListener?.("change", onDisplayModeChange);

    // 4. Precise Platform Detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isTouchMac = window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1;
    const isIos = /iphone|ipad|ipod/.test(userAgent) || isTouchMac;
    const isAndroid = /android/.test(userAgent);
    const isInApp = /micromessenger|wechat|lark|feishu|telegram|fbav|instagram|line\//.test(userAgent);
    const isMac = !isIos && (/macintosh|mac os x/.test(userAgent) || (window.navigator.platform || "").toLowerCase().includes("mac"));
    const isWin = !isAndroid && (/windows|win32|win64/.test(userAgent) || (window.navigator.platform || "").toLowerCase().includes("win"));
    const isSafari = /safari/.test(userAgent) && !/chrome|chromium|edg|crios|fxios|opr/.test(userAgent);

    let detected: PlatformTarget = "desktop";
    if (isInApp) {
      detected = "inapp";
    } else if (isIos) {
      detected = "ios";
    } else if (isAndroid) {
      detected = "android";
    } else if (isMac && isSafari) {
      detected = "mac_safari";
    } else if (isMac) {
      detected = "mac";
    } else if (isWin) {
      detected = "windows";
    }

    setPlatform(detected);
    setActiveTab(detected);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setInstallPrompt(null);
      try {
        window.localStorage?.setItem("youguard_pwa_installed", "true");
      } catch {}
    };

    const handleCustomOpen = () => {
      setDismissed(false);
      if (detected === "ios") {
        setActiveTab("ios");
        setShowGuideModal(true);
      } else if (installPrompt) {
        void installPrompt.prompt();
      } else {
        setActiveTab(detected);
        setShowGuideModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    window.addEventListener("youguard-open-pwa-guide", handleCustomOpen);

    return () => {
      standaloneMql.removeEventListener?.("change", onDisplayModeChange);
      overlayMql.removeEventListener?.("change", onDisplayModeChange);
      minimalMql.removeEventListener?.("change", onDisplayModeChange);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      window.removeEventListener("youguard-open-pwa-guide", handleCustomOpen);
    };
  }, [installPrompt]);

  const handleDismiss = useCallback(() => {
    setDismissed(true);
    try {
      window.localStorage?.setItem("youguard_pwa_dismissed_until", (Date.now() + 7 * 86400000).toString());
    } catch {}
  }, []);

  const handleInstallAction = useCallback(async () => {
    if (platform === "ios") {
      setActiveTab("ios");
      setShowGuideModal(true);
      return;
    }

    if (installPrompt) {
      try {
        setPromptTriggered(true);
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setIsStandalone(true);
          setShowGuideModal(false);
          try {
            window.localStorage?.setItem("youguard_pwa_installed", "true");
          } catch {}
        } else {
          setPromptTriggered(false);
        }
      } catch {
        setPromptTriggered(false);
        setActiveTab(platform);
        setShowGuideModal(true);
      } finally {
        setInstallPrompt(null);
      }
    } else {
      setActiveTab(platform);
      setShowGuideModal(true);
    }
  }, [platform, installPrompt]);

  if (!isMounted || isStandalone) return null;
  if (dismissed && !showGuideModal) return null;

  const canShowBanner = !dismissed;

  // Banner text per platform
  const bannerLabel = promptTriggered
    ? (locale === "zh"
        ? "☝️ 请在浏览器顶部（地址栏旁）弹窗中确认安装"
        : locale === "am"
        ? "☝️ እባክዎ ከላይ ባለው መስኮት ላይ 'ጫን' ን ያረጋግጡ"
        : "☝️ Please confirm 'Install' in the prompt at the top")
    : platform === "ios"
    ? (locale === "zh"
        ? "添加到 iPhone / iPad 主屏幕，实时接收商机通知"
        : locale === "am"
        ? "ወደ iPhone/iPad መነሻ ማያ ገጽ ያክሉ"
        : "Add to Home Screen for instant alerts")
    : platform === "mac" || platform === "mac_safari"
    ? (locale === "zh"
        ? "安装 Mac 桌面客户端，常驻 Dock 程序坞"
        : locale === "am"
        ? "የ Mac መተግበሪያን ጫን"
        : "Install Mac desktop app for instant alerts")
    : platform === "windows"
    ? (locale === "zh"
        ? "安装 Windows 桌面客户端，固定到任务栏"
        : locale === "am"
        ? "የ Windows መተግበሪያን ጫን"
        : "Install Windows desktop app for instant alerts")
    : platform === "android"
    ? (locale === "zh"
        ? "安装 Android 应用，秒开与即时商机通知"
        : locale === "am"
        ? "የ Android መተግበሪያን ጫን"
        : "Install Android app for instant alerts")
    : (locale === "zh"
        ? "安装桌面应用，实时接收询价与商机通知"
        : locale === "am"
        ? "ፈጣን ማሳወቂያዎችን ለማግኘት መተግበሪያውን ጫን"
        : "Install app for instant notifications");

  // Modal Title per platform
  const modalTitle =
    activeTab === "ios"
      ? (locale === "zh" ? "添加到 iPhone / iPad 主屏幕" : locale === "am" ? "ወደ iPhone/iPad ማያ ገጽ ያክሉ" : "Add to iOS Home Screen")
      : activeTab === "android"
      ? (locale === "zh" ? "安装 Android 手机客户端" : locale === "am" ? "የ Android መተግበሪያን ጫን" : "Install Android App")
      : activeTab === "mac"
      ? (locale === "zh" ? "安装 Mac 桌面客户端 (Edge / Chrome)" : locale === "am" ? "የ Mac መተግበሪያን ጫን" : "Install Mac Desktop App")
      : activeTab === "mac_safari"
      ? (locale === "zh" ? "添加到 Mac 程序坞 (Safari)" : locale === "am" ? "ወደ Mac Dock አክል" : "Add to Mac Dock (Safari)")
      : activeTab === "windows"
      ? (locale === "zh" ? "安装 Windows 桌面客户端" : locale === "am" ? "የ Windows መተግበሪያን ጫን" : "Install Windows Desktop App")
      : activeTab === "inapp"
      ? (locale === "zh" ? "请在默认浏览器中打开" : locale === "am" ? "በነባሪ አሳሽ ውስጥ ይክፈቱ" : "Open in Default Browser")
      : (locale === "zh" ? "安装 Youguard 应用" : locale === "am" ? "Youguard መተግበሪያን ጫን" : "Install Youguard App");

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
                <div className="text-[10px] text-gray-300">{bannerLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => void handleInstallAction()}
                className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#dfba73] px-3 py-2 text-[11px] font-black uppercase tracking-wider text-black shadow-md transition hover:opacity-90 active:scale-95 cursor-pointer"
              >
                {platform === "ios" ? <Share className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
                <span>
                  {locale === "zh" ? (platform === "ios" ? "添加" : "安装") : locale === "am" ? "ጫን" : "Install"}
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

      {/* Hyper-Targeted Platform Installation Modal */}
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
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <img
                  src="/icons/icon-192.png"
                  alt="Youguard Logo"
                  className="h-10 w-10 rounded-xl border border-white/10 object-contain"
                />
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    {modalTitle}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    {locale === "zh"
                      ? "无需应用商店，像原生客户端一样独立运行"
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

            {/* In-App Browser Warning Guide */}
            {activeTab === "inapp" && (
              <div className="space-y-3.5">
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200">
                  <p className="font-bold">
                    {locale === "zh"
                      ? "⚠️ 当前处于应用内置浏览器环境中"
                      : locale === "am"
                      ? "⚠️ በመተግበሪያ አሳሽ ውስጥ ነዎት"
                      : "⚠️ Currently in an In-App Browser"}
                  </p>
                  <p className="mt-1 text-[11px] text-amber-300/80">
                    {locale === "zh"
                      ? "微信、飞书或 Telegram 等内置视图无法直接安装 PWA，请按以下步骤切换至系统浏览器："
                      : locale === "am"
                      ? "እባክዎ በነባሪ አሳሽዎ ውስጥ ይክፈቱት፦"
                      : "Please switch to your system browser to install the standalone application:"}
                  </p>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
                      1
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>
                          {locale === "zh"
                            ? "点击右上角的「...」更多选项"
                            : locale === "am"
                            ? "የበለጠ አማራጮችን '...' ይጫኑ"
                            : "Tap '...' at top right"}
                        </span>
                        <MoreVertical className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {locale === "zh" ? "在屏幕右上角打开选项菜单" : "Open the options menu in the top right"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                    <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-xs">
                      2
                    </div>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>
                          {locale === "zh"
                            ? "选择「在系统默认浏览器中打开」"
                            : locale === "am"
                            ? "በነባሪ አሳሽ ውስጥ ክፈት የሚለውን ይምረጡ"
                            : "Choose 'Open in Default Browser'"}
                        </span>
                        <ExternalLink className="h-4 w-4 text-emerald-400 inline shrink-0" />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        {locale === "zh"
                          ? "使用 Safari、Chrome 或 Edge 打开后即可一键安装"
                          : "Open with Safari, Chrome, or Edge to install"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* iOS Safari Guide */}
            {activeTab === "ios" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>
                        {locale === "zh"
                          ? "点击 Safari 底部工具栏的「分享」按钮"
                          : locale === "am"
                          ? "በ Safari ታችኛው ክፍል 'Share' ን ይጫኑ"
                          : "Tap Safari bottom 'Share' button"}
                      </span>
                      <Share className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "屏幕底部正中央的方框带向上箭头图标"
                        : "Square icon with an upward arrow at bottom"}
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
                          ? "向下滑动并选择「添加到主屏幕」"
                          : locale === "am"
                          ? "'Add to Home Screen' ን ይምረጡ"
                          : "Scroll down and select 'Add to Home Screen'"}
                      </span>
                      <PlusSquare className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "在弹出的操作列表中找到「添加到主屏幕」选项"
                        : "Find 'Add to Home Screen' option in the sheet"}
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
                        ? "点击右上角「添加」完成"
                        : locale === "am"
                        ? "በላይኛው ቀኝ ጥግ ላይ 'Add' ን ይጫኑ"
                        : "Tap 'Add' at top right"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "应用图标将出现在手机主屏幕上，点击即可独立运行并接收通知"
                        : "Icon appears on your home screen for instant standalone launch"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Android Guide */}
            {activeTab === "android" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>
                        {locale === "zh"
                          ? "点击 Chrome/浏览器右上角「⋮」菜单"
                          : locale === "am"
                          ? "የ Chrome ምናሌውን '⋮' ይጫኑ"
                          : "Tap browser menu '⋮' at top right"}
                      </span>
                      <MoreVertical className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh" ? "在地址栏右侧的三点菜单图标" : "Three-dot menu icon next to the address bar"}
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
                          ? "'መተግበሪያ ጫን' ወይም 'ወደ መነሻ ማያ ገጽ' ይምረጡ"
                          : "Select 'Install app' or 'Add to Home screen'"}
                      </span>
                      <Download className="h-4 w-4 text-[#c5a059] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh" ? "选择安装选项以创建独立桌面图标" : "Create a standalone app shortcut"}
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
                        ? "在系统弹窗中点击「安装」确认"
                        : locale === "am"
                        ? "'ጫን' ን በመጫን ያረጋግጡ"
                        : "Tap 'Install' to confirm"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "应用将作为原生 App 安装并显示在桌面与应用抽屉中"
                        : "The app installs directly and runs in full-screen standalone mode"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mac Edge / Chrome Guide */}
            {activeTab === "mac" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>
                        {locale === "zh"
                          ? "点击顶部地址栏最右侧的「安装」图标"
                          : locale === "am"
                          ? "በአድራሻ አሞሌው ውስጥ 'ጫን' ን ይጫኑ"
                          : "Click 'Install' icon in address bar"}
                      </span>
                      <Download className="h-4 w-4 text-[#5ee6d8] inline shrink-0" />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "看 Edge / Chrome 浏览器地址栏右端（⭐五角星旁边的小电脑图标 ⊕）"
                        : locale === "am"
                        ? "በ Chrome/Edge አድራሻ አሞሌ ውስጥ"
                        : "On the right side of the address bar next to bookmarks"}
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
                        ? "点击弹窗中的「安装」常驻 Mac 程序坞"
                        : locale === "am"
                        ? "'ጫን' ን በመጫን ወደ Mac Dock አክል"
                        : "Click 'Install' to pin to Mac Dock"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "生成独立的 Mac 应用窗口，并可常驻在底部 Dock 栏随开随用"
                        : "Runs as a dedicated Mac desktop app in the Dock with push alerts"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Mac Safari Guide */}
            {activeTab === "mac_safari" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
                    1
                  </div>
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span>
                        {locale === "zh"
                          ? "点击屏幕顶部菜单栏「文件 (File)」"
                          : "Click 'File' in top menu bar"}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh" ? "在 Mac 顶部菜单栏左侧找到「文件」" : "In the macOS top system menu bar"}
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
                        ? "选择「添加到程序坞... (Add to Dock...)」"
                        : "Select 'Add to Dock...'"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "点击添加后，应用图标将固定到 Mac 程序坞中独立启动"
                        : "Adds the Web App directly to macOS Dock for standalone launch"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Windows Guide */}
            {(activeTab === "windows" || activeTab === "desktop") && (
              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.04] p-3 border border-white/5">
                  <div className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#c5a059]/20 text-[#c5a059] font-black text-xs">
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
                        ? "在 Chrome / Edge 浏览器地址栏右侧点击安装小图标 ⊕"
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
                        ? "在弹窗中点击「安装」固定到任务栏"
                        : locale === "am"
                        ? "'ጫን' ን በመጫን ያረጋግጡ"
                        : "Click 'Install' to confirm"}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {locale === "zh"
                        ? "将作为独立的桌面客户端运行，可固定到任务栏与开始菜单"
                        : "Runs as a dedicated desktop app pinned to Taskbar / Start Menu"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Optional Other Platform Switcher (Collapsed by Default) */}
            <div className="mt-4 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowOtherPlatforms(!showOtherPlatforms)}
                className="flex items-center justify-between w-full text-[11px] text-gray-400 hover:text-[#5ee6d8] transition py-1 cursor-pointer"
              >
                <span>{locale === "zh" ? "在其他设备上安装？" : "Install on another device?"}</span>
                {showOtherPlatforms ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              {showOtherPlatforms && (
                <div className="grid grid-cols-3 gap-1.5 mt-2.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ios")}
                    className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      activeTab === "ios" ? "bg-[#c5a059] text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Apple className="h-3 w-3" />
                    <span>iOS</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("android")}
                    className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      activeTab === "android" ? "bg-[#c5a059] text-black" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Smartphone className="h-3 w-3" />
                    <span>Android</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("mac")}
                    className={`py-1.5 px-2 rounded-lg font-bold transition flex items-center justify-center gap-1 ${
                      activeTab === "mac" || activeTab === "mac_safari" || activeTab === "windows"
                        ? "bg-[#c5a059] text-black"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    <Laptop className="h-3 w-3" />
                    <span>Desktop</span>
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="w-full rounded-xl bg-white/10 py-2.5 text-xs font-bold text-white hover:bg-white/20 transition cursor-pointer"
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
