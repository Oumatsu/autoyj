import { redirect } from "next/navigation";

export default async function ProductRedirectPage({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params;
  redirect(`/zh/products/${category}/${slug}`);
}
