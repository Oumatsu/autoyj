/**
 * Root page — intentionally left minimal.
 *
 * The middleware (middleware.ts) handles locale detection and redirects
 * non-localized paths (including "/") to "/<detected-locale>/". This means
 * this component is only reached if middleware is bypassed, which should
 * not happen in normal operation.
 *
 * Fallback: redirect to the default locale.
 */
import { redirect } from "next/navigation";
import { defaultLocale } from "@/i18n/config";

export default function HomeRedirectPage() {
  redirect(`/${defaultLocale}`);
}
