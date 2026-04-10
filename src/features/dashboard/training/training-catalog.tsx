import type { TrainingModule } from '@/types/workforce'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'

export function TrainingCatalog({ modules }: { modules: TrainingModule[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Training catalog</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <div key={module.id} className="rounded-2xl border border-muted/50 bg-background p-4">
            <p className="font-medium text-foreground">{module.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{module.audience}</p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>{module.progressLabel}</p>
              <p>{module.completionRate} completion</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
