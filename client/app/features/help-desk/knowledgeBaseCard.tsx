import type { FC } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { FileText } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { formatDate } from "~/lib/utils";
import type { HelpdeskKnowledgeBase } from "~/lib/support-article";

export const KnowledgeBasedCard: FC<{
  article: HelpdeskKnowledgeBase;
  index?: number;
}> = ({ article, index = 0 }) => (
  <Card
    className="rounded-sm hover:shadow-md transition-shadow cursor-pointer animate-in fade-in slide-in-from-bottom-4 duration-300 dark:bg-lightBlue/20"
    style={{ animationDelay: `${(index + 1) * 100}ms` }}
  >
    <CardContent className="p-4">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <h3 className="font-medium line-clamp-1">{article.title}</h3>
            </div>
            <Badge variant="outline" className="text-xs capitalize">
              {article.category}
            </Badge>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {article.content}
        </p>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Updated {formatDate(article.lastUpdated.toString())}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);
