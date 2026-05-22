'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { getIconContainerClasses } from '@/lib/dashboard-theme'
import { cn } from '@/lib/utils'
import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'

import { TASKS_THEME } from './tasks-theme'

export function TaskSheetHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description?: string
}) {
  return (
    <div className={TASKS_THEME.sheet.header}>
      <div className="flex items-start gap-3">
        <div className={cn(getIconContainerClasses('medium'), 'size-10 shrink-0')}>
          <Icon className="size-5" aria-hidden />
        </div>
        <div className="min-w-0 space-y-1">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>
    </div>
  )
}

export function TaskFormSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={cn(TASKS_THEME.formSection, className)} aria-labelledby={undefined}>
      <h3 className={TASKS_THEME.formSectionTitle}>{title}</h3>
      <div className="space-y-3.5">{children}</div>
    </section>
  )
}

export function TaskFormField({
  id,
  label,
  hint,
  children,
  required,
}: {
  id?: string
  label: string
  hint?: string
  children: ReactNode
  required?: boolean
}) {
  return (
    <div className={TASKS_THEME.field}>
      <Label htmlFor={id} className={TASKS_THEME.label}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className={TASKS_THEME.hint}>{hint}</p> : null}
    </div>
  )
}

export function TaskContextChip({ children }: { children: ReactNode }) {
  return <div className={TASKS_THEME.contextChip}>{children}</div>
}

export function TaskModalError({ message }: { message: string }) {
  return (
    <div className={TASKS_THEME.error} role="alert">
      {message}
    </div>
  )
}

export function TaskModalActions({
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel,
  loadingLabel,
  isLoading,
  submitDisabled,
}: {
  onCancel: () => void
  cancelLabel?: string
  submitLabel: string
  loadingLabel?: string
  isLoading: boolean
  submitDisabled?: boolean
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
      <Button type="button" variant="outline" className="h-9" onClick={onCancel} disabled={isLoading}>
        {cancelLabel}
      </Button>
      <Button type="submit" className={TASKS_THEME.footerPrimary} disabled={isLoading || submitDisabled}>
        {isLoading ? (loadingLabel ?? 'Saving…') : submitLabel}
      </Button>
    </div>
  )
}
