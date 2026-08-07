import { resolveInsightImage } from "@/lib/static-assets";

export function getInsightImage(slug: string, coverImage?: string): string {
  return resolveInsightImage(slug, coverImage);
}
