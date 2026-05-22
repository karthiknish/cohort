'use client'

import { useMemo } from 'react'

import { cn } from '@/lib/utils'
import { Label } from '@/shared/ui/label'
import { Separator } from '@/shared/ui/separator'

function FieldSet({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn('flex flex-col gap-4', className)}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: React.ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot="field-legend"
      className={cn(
        variant === 'label' ? 'text-sm font-medium text-foreground' : 'text-base font-semibold text-foreground',
        className,
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-group" className={cn('flex w-full flex-col gap-4', className)} {...props} />
}

function Field({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<'div'> & { orientation?: 'vertical' | 'horizontal' | 'responsive' }) {
  return (
    <div
      role="group"
      data-slot="field"
      className={cn(
        'flex gap-3',
        orientation === 'horizontal' && 'flex-row items-center',
        orientation === 'vertical' && 'flex-col',
        orientation === 'responsive' && 'flex-col @container/field-group sm:flex-row sm:items-center',
        className,
      )}
      {...props}
    />
  )
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-content" className={cn('flex flex-1 flex-col gap-1', className)} {...props} />
}

function FieldLabel({ className, ...props }: React.ComponentProps<typeof Label>) {
  return <Label data-slot="field-label" className={cn('font-medium', className)} {...props} />
}

function FieldTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="field-title" className={cn('text-sm font-medium leading-none', className)} {...props} />
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="field-description"
      className={cn('text-sm leading-relaxed text-muted-foreground', className)}
      {...props}
    />
  )
}

function FieldSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="field-separator" className={cn('my-2', className)} {...props} />
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: React.ComponentProps<'div'> & { errors?: Array<{ message?: string } | undefined> }) {
  const content = useMemo(() => {
    if (children) return children
    if (!errors?.length) return null
    const messages = errors.flatMap((error) => {
      const message = error?.message
      return message ? [message] : []
    })
    if (messages.length === 0) return null
    if (messages.length === 1) return messages[0]
    return (
      <ul className="ml-4 list-disc space-y-1">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    )
  }, [children, errors])

  if (!content) return null

  return (
    <div
      role="alert"
      data-slot="field-error"
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {content}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
}
