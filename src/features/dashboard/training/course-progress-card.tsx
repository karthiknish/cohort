import type { TrainingModule } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function CourseProgressCard({ module }: { module: TrainingModule }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Progress spotlight</CardTitle>
        <CardDescription>{module.title}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-2 rounded-full bg-muted">
          <div className="h-2 w-[74%] rounded-full bg-primary" />
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{module.progressLabel}</p>
          <p>{module.completionRate} of assigned teammates are through the module.</p>
        </div>
      </CardContent>
    </Card>
  )
}
