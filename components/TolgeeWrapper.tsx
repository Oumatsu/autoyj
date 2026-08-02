"use client";

import { useMemo } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { createTolgee } from "@/lib/tolgee";

export function TolgeeWrapper({
  locale,
  children,
}: {
  locale?: string;
  children: React.ReactNode;
}) {
  const tolgee = useMemo(() => createTolgee(locale || "zh"), [locale]);

  return (
    <TolgeeProvider tolgee={tolgee} fallback={<div className="animate-pulse">{children}</div>}>
      {children}
    </TolgeeProvider>
  );
}
