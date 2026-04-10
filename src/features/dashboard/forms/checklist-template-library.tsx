import type { ChecklistTemplate } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function ChecklistTemplateLibrary({ templates }: { templates: ChecklistTemplate[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template library</CardTitle>
        <CardDescription>Operational workflows converted into repeatable templates.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {templates.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-10 text-center text-sm text-muted-foreground">
            No checklist templates yet. Create one from the builder or seed the forms module to load starter templates.
          </div>
        ) : null}
        {templates.map((template) => (
          <div key={template.id} className="rounded-2xl border border-muted/50 bg-background p-4">
            <p className="font-medium text-foreground">{template.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{template.category}</p>
            <div className="mt-4 space-y-1 text-sm text-muted-foreground">
              <p>{template.fieldsCount} fields</p>
              <p>{template.frequency}</p>
              <p>{template.completionRate} completion rate</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
