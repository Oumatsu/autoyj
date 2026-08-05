"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { Locale, locales } from "./config";
import { getLocaleFromPath } from "./utils";

type LocaleLinkProps = React.ComponentProps<typeof Link>;

export function LocaleLink({ href, prefetch = false, ...props }: LocaleLinkProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  const localizedHref = useMemo(() => {
    if (typeof href !== "string" || !href.startsWith("/")) return href;
    if (href.startsWith("//")) return href;
    const segments = href.split("/");
    if (locales.includes(segments[1] as Locale)) return href;
    return `/${locale}${href}`;
  }, [href, locale]);

  return <Link href={localizedHref} prefetch={prefetch} {...props} />;
}
