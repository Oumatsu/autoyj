import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createTolgee } from "@/lib/tolgee";
import { getNestedValue } from "./utils";
import { defaultLocale, fallbackLocale, isLocale, locales, type Locale } from "./config";
import { messages } from "./messages";

export type MetadataPage =
  | "home"
  | "about"
  | "company"
  | "contact"
  | "academy"
  | "insights"
  | "products"
  | "solutions"
  | "markets"
  | "privacy"
  | "terms"
  | "qr"
  | "portal";

type LocaleParams = Promise<{ locale: string }>;

function getMetadataTolgee(locale: Locale) {
  return createTolgee(locale);
}

function translateMetadata(locale: Locale, key: string, fallback: string): string {
  const fallbackMessage = getNestedValue(messages[fallbackLocale], key);
  const defaultValue =
    typeof fallbackMessage === "string" && fallbackMessage.trim()
      ? fallbackMessage
      : fallback;
  const value = getMetadataTolgee(locale).t(key, { defaultValue });
  return typeof value === "string" && value.trim() ? value : defaultValue;
}

function normalizePathname(pathname: string): string {
  const normalized = pathname.trim().replace(/^\/+|\/+$/g, "");
  return normalized === "/" ? "" : normalized;
}

function localizedPath(locale: Locale, normalizedPath: string): string {
  return `/${locale}${normalizedPath ? `/${normalizedPath}` : ""}`;
}

export async function resolveMetadataLocale(params: LocaleParams): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  return locale;
}

export function buildLocalizedMetadata(
  locale: Locale,
  page: MetadataPage,
  pathname: string
): Metadata {
  const normalizedPath = normalizePathname(pathname);
  const canonical = localizedPath(locale, normalizedPath);
  const languages = Object.fromEntries(
    locales.map((candidate) => [candidate, localizedPath(candidate, normalizedPath)])
  );

  return {
    title: translateMetadata(locale, `seo.pages.${page}.title`, "Youguard"),
    description: translateMetadata(
      locale,
      `seo.pages.${page}.description`,
      "Youguard electric vehicle sourcing and dealer support."
    ),
    alternates: {
      canonical,
      languages: {
        ...languages,
        "x-default": localizedPath(defaultLocale, normalizedPath),
      },
    },
  };
}
