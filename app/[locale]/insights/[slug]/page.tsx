import ViewPage from "@/views/insights/[slug]";
import { buildLocalizedMetadata, resolveMetadataLocale } from "@/i18n/metadata";

export default function Page(props: any) {
  return <ViewPage {...props} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: localeParam, slug } = await params;
  const locale = await resolveMetadataLocale(Promise.resolve({ locale: localeParam }));
  return buildLocalizedMetadata(locale, "insights", `/insights/${slug}`);
}
