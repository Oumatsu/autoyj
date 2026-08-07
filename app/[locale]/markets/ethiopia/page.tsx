import { buildLocalizedMetadata, resolveMetadataLocale } from "@/i18n/metadata";
import ViewPage from "@/views/markets/ethiopia";

export default ViewPage;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const locale = await resolveMetadataLocale(params);
  return buildLocalizedMetadata(locale, "markets", "/markets/ethiopia");
}
