import { redirectToDefaultLocale } from "@/lib/locale-redirect";

export default async function AcademyLessonRedirectPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  redirectToDefaultLocale(`/academy/${category}/${slug}`);
}
