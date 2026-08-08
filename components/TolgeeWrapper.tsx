"use client";

import { useEffect, useMemo, useState } from "react";
import { TolgeeProvider } from "@tolgee/react";
import { createTolgee, probeTolgee } from "@/lib/tolgee";
import { defaultLocale } from "@/i18n/config";

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
    <TolgeeProvider tolgee={tolgee}>
      {children}
    </TolgeeProvider>
  );
}
