"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { createTolgee, probeTolgee } from "@/lib/tolgee";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { tolgeeStaticData } from "@/i18n/messages";

type TolgeeStaticTree = Record<string, string | Record<string, unknown>>;

/**
 * Fetch per-locale translations from the D1-backed i18n API and merge them
 * with the local static bundle. Feishu translations win for any key they define.
 *
 * Returns a merged staticData object ready to pass to createTolgee().
 */
async function fetchRemoteI18n(): Promise<Record<Locale, TolgeeStaticTree> | null> {
  try {
    const res = await fetch("/api/portal/public/i18n", {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const remote = (await res.json()) as Record<string, Record<string, string>>;

    const merged: Record<string, TolgeeStaticTree> = {};
    for (const locale of locales) {
      const base: TolgeeStaticTree = { ...(tolgeeStaticData[locale] ?? {}) };
      const overrides = remote[locale];
      if (overrides && typeof overrides === "object") {
        // Flatten dot-keys from Feishu into nested Tolgee tree
        for (const [dotKey, value] of Object.entries(overrides)) {
          if (!value) continue;
          const parts = dotKey.split(".");
          if (parts.length === 1) {
            base[dotKey] = value;
          } else {
            // Build nested structure for namespaced keys like "nav.vehicles"
            let cur: Record<string, unknown> = base as Record<string, unknown>;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!cur[parts[i]] || typeof cur[parts[i]] !== "object") {
                cur[parts[i]] = {};
              }
              cur = cur[parts[i]] as Record<string, unknown>;
            }
            cur[parts[parts.length - 1]] = value;
          }
        }
      }
      merged[locale] = base;
    }
    return merged as Record<Locale, TolgeeStaticTree>;
  } catch {
    return null;
  }
}

export function TolgeeWrapper({
  locale,
  children,
}: {
  locale?: string;
  children: React.ReactNode;
}) {
  const [remoteEnabled, setRemoteEnabled] = useState(false);
  const [extraData, setExtraData] = useState<Record<Locale, TolgeeStaticTree> | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    let active = true;

    // Probe Tolgee dev server
    void probeTolgee().then((reachable) => {
      if (active) setRemoteEnabled(reachable);
    });

    // Fetch Feishu i18n translations from D1 (one-time on mount)
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      void fetchRemoteI18n().then((data) => {
        if (active && data) setExtraData(data);
      });
    }

    return () => {
      active = false;
    };
  }, []);

  const tolgee = useMemo(
    () => createTolgee(locale || defaultLocale, { remote: remoteEnabled, extraData }),
    [locale, remoteEnabled, extraData],
  );

  return (
    <TolgeeProvider tolgee={tolgee}>
      {children}
    </TolgeeProvider>
  );
}
