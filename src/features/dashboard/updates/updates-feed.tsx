import type { UpdatePost } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'

export function UpdatesFeed({ posts }: { posts: UpdatePost[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Updates feed</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="rounded-2xl border border-muted/50 bg-background p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-foreground">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.audience}</p>
              </div>
              <WorkforceStatusBadge tone={post.status === 'live' ? 'success' : post.status === 'scheduled' ? 'warning' : 'neutral'}>
                {post.status}
              </WorkforceStatusBadge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{post.summary}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>{post.scheduledFor}</span>
              <span>{post.readCount}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
