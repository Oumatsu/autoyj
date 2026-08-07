import ViewPage from "@/views/products/[category]/[slug]";
import { buildLocalizedMetadata, resolveMetadataLocale } from "@/i18n/metadata";

export default function Page(props: any) {
  return <ViewPage {...props} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; category: string; slug: string }>;
}) {
  const { locale: localeParam, category, slug } = await params;
  const locale = await resolveMetadataLocale(Promise.resolve({ locale: localeParam }));
  return buildLocalizedMetadata(locale, "products", `/products/${category}/${slug}`);
}
