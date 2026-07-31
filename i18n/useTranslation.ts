"use client";

import { usePathname } from "next/navigation";
import { useCallback, useMemo, useState, useEffect } from "react";
import { Locale, defaultLocale, locales } from "./config";
import { translations as staticTranslations } from "./translations";
import { getLocaleFromPath } from "./utils";
import { resolveTranslationValue } from "./translationFallback";

// 用 window 上的属性做全局单例，防止 dev HMR 模块重载后 isLoadingStarted 被重置
// 在 SSR 环境下降级到模块变量
let _globalDynamic: any = null;
let _globalListeners = new Set<() => void>();
let _loadingStarted = false;
let _loadingDone = false;

function getGlobal<T>(key: string, init: T): T {
  if (typeof window === "undefined") return init;
  const w = window as any;
  if (!(key in w)) w[key] = init;
  return w[key] as T;
}

function getDynamicTranslations(): any {
  if (typeof window !== "undefined") return (window as any).__yg_dyn_translations ?? null;
  return _globalDynamic;
}

function setDynamicTranslations(v: any) {
  _globalDynamic = v;
  if (typeof window !== "undefined") (window as any).__yg_dyn_translations = v;
}

function getListeners(): Set<() => void> {
  if (typeof window === "undefined") return _globalListeners;
  const w = window as any;
  if (!w.__yg_trans_listeners) w.__yg_trans_listeners = new Set<() => void>();
  return w.__yg_trans_listeners as Set<() => void>;
}

function isLoadingStarted(): boolean {
  if (typeof window !== "undefined") return !!(window as any).__yg_trans_loading_started;
  return _loadingStarted;
}

function setLoadingStarted() {
  _loadingStarted = true;
  if (typeof window !== "undefined") (window as any).__yg_trans_loading_started = true;
}

function loadDynamicTranslations() {
  if (isLoadingStarted()) return;
  setLoadingStarted();
  fetch("/api/portal/public/translations")
    .then((r) => r.json())
    .then((data) => {
      if (data && data.zh) {
        setDynamicTranslations(data);
        getListeners().forEach((l) => l());
      }
    })
    .catch((err) => {
      console.warn("Failed to load live translations from Feishu. Falling back to static dictionary:", err.message);
    });
}

export function useLocale(): Locale {
  const pathname = usePathname();
  return getLocaleFromPath(pathname);
}

export function useTranslation() {
  const locale = useLocale();
  const [, setTick] = useState(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      loadDynamicTranslations();
      const listener = () => setTick((t) => t + 1);
      const listeners = getListeners();
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    }
  }, []);

  const t = useCallback(
    (key: string, fallback?: string): any => {
      return resolveTranslationValue(key, [
        getDynamicTranslations()?.[locale],
        staticTranslations[locale] as Record<string, unknown>,
        getDynamicTranslations()?.en,
        staticTranslations.en as Record<string, unknown>,
      ], fallback);
    },
    [locale]
  );

  const tArray = useCallback(
    (key: string, fallback: any[] = []): any[] => {
      const val = t(key);
      return Array.isArray(val) ? val : fallback;
    },
    [t]
  );

  return useMemo(() => ({ t, tArray, locale }), [t, tArray, locale]);
}
