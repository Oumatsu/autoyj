import ViewPage from "@/views/academy";
import { buildLocalizedMetadata, resolveMetadataLocale } from "@/i18n/metadata";

export default ViewPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveMetadataLocale(params);
  return buildLocalizedMetadata(locale, "academy", "/academy");
}
