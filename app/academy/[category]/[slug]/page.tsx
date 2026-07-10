import { redirect } from "next/navigation";

export default async function AcademyLessonRedirectPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  redirect(`/zh/academy/${category}/${slug}`);
}
