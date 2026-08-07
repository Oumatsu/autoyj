import ViewPage from "@/app/portal/page";
import { buildLocalizedMetadata, resolveMetadataLocale } from "@/i18n/metadata";

export default ViewPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; module: string }>;
}) {
  const { locale: localeParam, module } = await params;
  const locale = await resolveMetadataLocale(Promise.resolve({ locale: localeParam }));
  return buildLocalizedMetadata(locale, "portal", `/dashboard/${module}`);
}
