'use client'

import { useCallback, useState } from 'react'
import { LoaderCircle, Send } from 'lucide-react'

import type { FormFieldDefinition } from '@/types/workforce'
import { validateChecklistRequiredFields } from './checklist-answers-validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

type AnswerMap = Record<string, string>

export function ChecklistSubmissionRunner({
  templateLegacyId,
  templateTitle,
  fields,
  isPreviewMode,
  onSubmit,
  pending,
  disabled,
}: {
  templateLegacyId: string
  templateTitle: string
  fields: FormFieldDefinition[]
  isPreviewMode: boolean
  onSubmit: (answers: { fieldId: string; value: string }[]) => Promise<void>
  pending: boolean
  disabled: boolean
}) {
  const [values, setValues] = useState<AnswerMap>({})
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleChange = useCallback((fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }))
    setFieldErrors((prev) => {
      if (!prev[fieldId]) return prev
      const next = { ...prev }
      delete next[fieldId]
      return next
    })
  }, [])

  const handleSend = useCallback(async () => {
    if (isPreviewMode) {
      return
    }
    const nextErrors = validateChecklistRequiredFields(fields, values)
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors)
      return
    }
    setFieldErrors({})
    const answers = fields.map((f) => ({
      fieldId: f.id,
      value: (values[f.id] ?? '').trim(),
    }))
    await onSubmit(answers)
    setValues({})
  }, [fields, isPreviewMode, onSubmit, values])

  if (!templateLegacyId || fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Submit a checklist</CardTitle>
          <CardDescription>Load or create a template with fields to run an entry from here.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No template fields in context yet.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Run: {templateTitle}</CardTitle>
        <CardDescription>Fill required fields. Values save as a workspace submission in Convex.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field) => (
          <div key={field.id} className="space-y-1">
            <Label htmlFor={`f-${field.id}`}>
              {field.label}
              {field.required ? <span className="text-destructive"> *</span> : null}
            </Label>
            {field.type === 'number' ? (
              <Input
                id={`f-${field.id}`}
                type="number"
                className="rounded-xl"
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled || pending}
              />
            ) : field.type === 'checklist' ? (
              <Input
                id={`f-${field.id}`}
                placeholder="Done / notes"
                className="rounded-xl"
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled || pending}
              />
            ) : (
              <Input
                id={`f-${field.id}`}
                className="rounded-xl"
                value={values[field.id] ?? ''}
                onChange={(e) => handleChange(field.id, e.target.value)}
                disabled={disabled || pending}
              />
            )}
            {fieldErrors[field.id] ? (
              <p className="text-xs text-destructive" role="alert">
                {fieldErrors[field.id]}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">Type: {field.type}</p>
            )}
          </div>
        ))}
        <Button
          type="button"
          className="w-full gap-2 rounded-xl"
          onClick={() => void handleSend()}
          disabled={disabled || pending || isPreviewMode}
        >
          {pending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {isPreviewMode ? 'Preview: submission disabled' : 'Submit checklist'}
        </Button>
      </CardContent>
    </Card>
  )
}
