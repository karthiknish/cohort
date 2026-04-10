import type { KnowledgeCollection } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function CollectionBrowser({ collections }: { collections: KnowledgeCollection[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Collections</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {collections.map((collection) => (
          <div key={collection.id} className="rounded-2xl border border-muted/50 bg-background p-4">
            <p className="font-medium text-foreground">{collection.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{collection.summary}</p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>{collection.articleCount} articles</p>
              <p>Owner: {collection.owner}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
