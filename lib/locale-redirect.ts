import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

export function redirectToDefaultLocale(path: string): never {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  redirect(`/${defaultLocale}${normalizedPath}`);
}
