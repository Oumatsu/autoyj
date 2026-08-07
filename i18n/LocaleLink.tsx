"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { createNavigation } from "next-intl/navigation";
import { Locale, isLocale } from "./config";
import { routing } from "./routing";
import { getLocaleFromPath } from "./utils";

type LocaleLinkProps = React.ComponentProps<typeof Link>;
const { getPathname } = createNavigation(routing);

export function localizeHref(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const match = href.match(/^([^?#]*)(.*)$/s);
  const pathname = match?.[1] ?? href;
  const suffix = match?.[2] ?? "";
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (isLocale(firstSegment)) return href;

  return `${getPathname({ href: pathname, locale, forcePrefix: true })}${suffix}`;
}

export function LocaleLink({ href, prefetch = false, ...props }: LocaleLinkProps) {
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);

  const localizedHref = useMemo(() => {
    return typeof href === "string" ? localizeHref(href, locale) : href;
  }, [href, locale]);

  return <Link href={localizedHref} prefetch={prefetch} {...props} />;
}
