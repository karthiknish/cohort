import type { UpdatePost } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

function getReadProgressWidthClass(status: UpdatePost['status']) {
  if (status === 'live') return 'w-[74%]'
  if (status === 'scheduled') return 'w-[42%]'
  return 'w-[18%]'
}

export function ReadReceiptsPanel({ posts }: { posts: UpdatePost[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Read confirmations</CardTitle>
        <CardDescription>Broadcast visibility without forcing everything into chat threads.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-foreground">{post.title}</span>
              <span className="text-muted-foreground">{post.readCount}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div
                className={`h-2 rounded-full bg-primary ${getReadProgressWidthClass(post.status)}`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
