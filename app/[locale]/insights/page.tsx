import ViewPage from "@/views/insights";
import articles from "@/app/insights/articles.json";

export default function Page() {
  return <ViewPage initialArticles={articles} />;
}
