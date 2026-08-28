"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X, Sparkles } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

export function PwaUpdateToast() {
  const { locale } = useTranslation();
  const isZh = locale === "zh";
  const [needRefresh, setNeedRefresh] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;

      if (reg.waiting) {
        setWaitingWorker(reg.waiting);
        setNeedRefresh(true);
      }

      reg.addEventListener("updatefound", () => {
        const newWorker = reg.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setNeedRefresh(true);
          }
        });
      });
    }).catch(() => {});
  }, []);

  function handleUpdate() {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  }

  if (!needRefresh) return null;

  return (
    <aside
      aria-label={isZh ? "应用更新提示" : "Application update available"}
      className="fixed bottom-5 right-5 z-50 flex max-w-sm items-center gap-3 rounded-2xl border border-emerald-500/40 bg-[#0f172a]/95 p-4 shadow-2xl backdrop-blur-md text-white animate-fade-in"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
        <Sparkles className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <strong className="block text-xs font-black text-white">
          {isZh ? "Youguard 发现新版本" : "New Version Available"}
        </strong>
        <p className="mt-0.5 text-[11px] text-slate-300">
          {isZh ? "最新功能与体验已就绪" : "Latest updates ready to apply"}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleUpdate}
          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 active:scale-95 transition"
        >
          <RefreshCw className="h-3 w-3" />
          <span>{isZh ? "立即更新" : "Update"}</span>
        </button>
        <button
          type="button"
          aria-label={isZh ? "关闭更新提示" : "Dismiss update prompt"}
          onClick={() => setNeedRefresh(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
