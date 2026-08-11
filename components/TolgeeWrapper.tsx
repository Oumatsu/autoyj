"use client";

import { useMemo } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { createTolgee } from "@/lib/tolgee";
import { defaultLocale } from "@/i18n/config";
import { tolgeeStaticData } from "@/i18n/messages";

/**
 * Provides Tolgee translation context for client components.
 *
 * Translations are loaded from local static bundles (i18n/translations/{zh,en,am}.json).
 *
 * When NEXT_PUBLIC_TOLGEE_API_KEY is present in the bundle, DevTools is automatically enabled,
 * attaching InvisibleObserver tags to translated text for Alt+click in-context editing.
 */
export function TolgeeWrapper({
  locale,
  children,
}: {
  locale?: string;
  children: React.ReactNode;
}) {
  const currentLocale = locale || defaultLocale;
  const tolgee = useMemo(
    () => createTolgee(currentLocale),
    [currentLocale],
  );

  return (
    <TolgeeProvider
      key={currentLocale}
      tolgee={tolgee}
      ssr={{
        language: currentLocale,
        staticData: tolgeeStaticData,
      }}
    >
      {children}
    </TolgeeProvider>
  );
}

