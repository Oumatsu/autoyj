import ViewPage from "@/views/academy/ev-fundamentals";
import { buildLocalizedMetadata, resolveMetadataLocale } from "@/i18n/metadata";

export default ViewPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveMetadataLocale(params);
  return buildLocalizedMetadata(locale, "academy", "/academy/ev-fundamentals");
}
