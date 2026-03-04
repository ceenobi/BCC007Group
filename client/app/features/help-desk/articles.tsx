import { FileText } from "lucide-react";
import { PageSection } from "~/components/pageWrapper";
import { helpdeskKnowledgeBase } from "~/lib/support-article";
import { useSearchParams } from "react-router";
import { KnowledgeBasedCard } from "./knowledgeBaseCard";

export default function Articles() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const filteredKnowledgeBase = helpdeskKnowledgeBase.filter(
    (article) =>
      query === "" ||
      article.title.toLowerCase().includes(query.toLowerCase()) ||
      article.content.toLowerCase().includes(query.toLowerCase()) ||
      article.tags.some((tag) =>
        tag.toLowerCase().includes(query.toLowerCase()),
      ),
  );
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">Knowledge Base</h2>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>{helpdeskKnowledgeBase.length} articles</span>
        </div>
      </div>
      <PageSection index={5}>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredKnowledgeBase.map((article, index) => (
            <KnowledgeBasedCard
              key={article.id}
              article={article}
              index={index}
            />
          ))}
        </div>
      </PageSection>
    </>
  );
}
