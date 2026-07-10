import { redirect } from "next/navigation";

export default async function InsightRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/zh/insights/${slug}`);
}
