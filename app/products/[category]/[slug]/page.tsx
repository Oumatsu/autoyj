import { redirectToDefaultLocale } from "@/lib/locale-redirect";

export default async function ProductRedirectPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  redirectToDefaultLocale(`/products/${category}/${slug}`);
}
