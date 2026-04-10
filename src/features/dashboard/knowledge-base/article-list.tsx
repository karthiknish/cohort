import type { KnowledgeArticle } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function ArticleList({ articles }: { articles: KnowledgeArticle[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent articles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {articles.map((article) => (
          <div key={article.id} className="rounded-2xl border border-muted/50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{article.title}</p>
                <p className="text-sm text-muted-foreground">{article.collection}</p>
              </div>
              <WorkforceStatusBadge tone={article.status === 'published' ? 'success' : article.status === 'needs-review' ? 'warning' : 'neutral'}>
                {article.status}
              </WorkforceStatusBadge>
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{article.updatedAt}</span>
              <span>Owner: {article.owner}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
