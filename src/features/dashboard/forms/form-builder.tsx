import { LoaderCircle, Plus } from 'lucide-react'

import type { FormFieldDefinition } from '@/types/workforce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { WorkforceStatusBadge } from '@/features/dashboard/workforce/workforce-page-shell'
import { Button } from '@/shared/ui/button'

interface FormBuilderProps {
  fields: FormFieldDefinition[]
  pending: boolean
  onCreateTemplate: () => void
}

export function FormBuilder({ fields, pending, onCreateTemplate }: FormBuilderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Template fields</CardTitle>
        <CardDescription>Field definitions for the first template. Create another template to clone the same field set.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed border-muted/60 bg-muted/10 px-4 py-6 text-center text-sm text-muted-foreground">
            No field definitions yet. Seed the forms module or create a template to define reusable checklist fields.
          </p>
        ) : null}
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center justify-between gap-3 rounded-2xl border border-muted/50 p-4">
            <div>
              <p className="font-medium text-foreground">{index + 1}. {field.label}</p>
              <p className="text-sm text-muted-foreground">Field type: {field.type}</p>
            </div>
            <WorkforceStatusBadge tone={field.required ? 'warning' : 'neutral'}>
              {field.required ? 'required' : 'optional'}
            </WorkforceStatusBadge>
          </div>
        ))}
        <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={onCreateTemplate} disabled={pending}>
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Create checklist template
        </Button>
      </CardContent>
    </Card>
  )
}
