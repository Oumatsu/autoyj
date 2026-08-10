"use client";

import { useEffect, useMemo, useState } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { createTolgee, probeTolgee } from "@/lib/tolgee";
import { defaultLocale } from "@/i18n/config";

/**
 * Provides Tolgee translation context for client components.
 *
 * Translations are loaded exclusively from local static bundles
 * (i18n/translations/{zh,en,am}.json) managed via `bun run tolgee:push/pull`.
 *
 * The Tolgee dev server is probed at runtime only to enable in-context
 * editing (Alt+click) — it is never the source of truth for translations.
 */
export function TolgeeWrapper({
  locale,
  children,
}: {
  locale?: string;
  children: React.ReactNode;
}) {
  const [remoteEnabled, setRemoteEnabled] = useState(false);

  useEffect(() => {
    let active = true;
    // Probe Tolgee dev server for in-context editing (Alt+click) only
    void probeTolgee().then((reachable) => {
      if (active) setRemoteEnabled(reachable);
    });
    return () => {
      active = false;
    };
  }, []);

  const tolgee = useMemo(
    () => createTolgee(locale || defaultLocale, { remote: remoteEnabled }),
    [locale, remoteEnabled],
  );

  return (
    <TolgeeProvider key={locale || defaultLocale} tolgee={tolgee}>
      {children}
    </TolgeeProvider>
  );
}

