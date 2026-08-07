import { redirectToDefaultLocale } from "@/lib/locale-redirect";

export default async function InsightRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirectToDefaultLocale(`/insights/${slug}`);
}
