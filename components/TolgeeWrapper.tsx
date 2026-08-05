"use client";

import { useMemo } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { createTolgee } from "@/lib/tolgee";
import { defaultLocale } from "@/i18n/config";

export function TolgeeWrapper({
  locale,
  children,
}: {
  locale?: string;
  children: React.ReactNode;
}) {
  const tolgee = useMemo(() => createTolgee(locale || defaultLocale), [locale]);

  return (
    <TolgeeProvider tolgee={tolgee} fallback={<div className="animate-pulse">{children}</div>}>
      {children}
    </TolgeeProvider>
  );
}
