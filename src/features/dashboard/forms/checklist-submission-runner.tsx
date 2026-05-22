'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LoaderCircle, Send } from 'lucide-react'

import type { FormFieldDefinition } from '@/types/workforce'
import { validateChecklistRequiredFields } from './checklist-answers-validation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { LiveRegion } from '@/shared/ui/live-region'

type AnswerMap = Record<string, string>

function ChecklistFieldInput({
  field,
  value,
  disabled,
  pending,
  error,
  onFieldChange,
}: {
  field: FormFieldDefinition
  value: string
  disabled: boolean
  pending: boolean
  error?: string
  onFieldChange: (fieldId: string, value: string) => void
}) {
  const onFieldInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange(field.id, event.target.value)
    },
    [field.id, onFieldChange],
  )

  return (
    <div className="space-y-1">
      <Label htmlFor={`f-${field.id}`}>
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === 'number' ? (
        <Input
          id={`f-${field.id}`}
          type="number"
          className="rounded-xl"
          value={value}
          onChange={onFieldInputChange}
          disabled={disabled || pending}
        />
      ) : field.type === 'checklist' ? (
        <Input
          id={`f-${field.id}`}
          placeholder="Done / notes"
          className="rounded-xl"
          value={value}
          onChange={onFieldInputChange}
          disabled={disabled || pending}
        />
      ) : (
        <Input
          id={`f-${field.id}`}
          className="rounded-xl"
          value={value}
          onChange={onFieldInputChange}
          disabled={disabled || pending}
        />
      )}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">Type: {field.type}</p>
      )}
    </div>
  )
}

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
  const [submissionAnnouncement, setSubmissionAnnouncement] = useState('')
  const previousPendingRef = useRef(pending)

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

  const handleSendClick = useCallback(() => {
    void handleSend()
  }, [handleSend])

  useEffect(() => {
    const previousPending = previousPendingRef.current

    if (pending && !previousPending) {
      setSubmissionAnnouncement(`Submitting ${templateTitle}.`)
    } else if (!pending && previousPending) {
      setSubmissionAnnouncement(`${templateTitle} submission finished.`)
    }

    previousPendingRef.current = pending
  }, [pending, templateTitle])

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
      <LiveRegion message={submissionAnnouncement} />
      <CardHeader>
        <CardTitle className="text-lg">Run: {templateTitle}</CardTitle>
        <CardDescription>Fill required fields. Values save as a workspace submission in Convex.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4" aria-busy={pending}>
        {fields.map((field) => (
          <ChecklistFieldInput
            key={field.id}
            field={field}
            value={values[field.id] ?? ''}
            disabled={disabled}
            pending={pending}
            error={fieldErrors[field.id]}
            onFieldChange={handleChange}
          />
        ))}
        <Button
          type="button"
          className="w-full gap-2 rounded-xl"
          onClick={handleSendClick}
          disabled={disabled || pending || isPreviewMode}
        >
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
          {isPreviewMode ? 'Preview: submission disabled' : 'Submit checklist'}
        </Button>
      </CardContent>
    </Card>
  )
}
