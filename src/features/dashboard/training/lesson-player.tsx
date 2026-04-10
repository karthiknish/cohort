import type { TrainingModule } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function LessonPlayer({ module }: { module: TrainingModule }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Lesson stack</CardTitle>
        <CardDescription>{module.audience}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {module.lessons.map((lesson) => (
          <div key={lesson.id} className="rounded-2xl border border-muted/50 p-4">
            <p className="font-medium text-foreground">{lesson.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{lesson.format} · {lesson.durationLabel}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
