'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/shared/ui/field'

type FormFieldProps = {
  id?: string
  label: ReactNode
  description?: ReactNode
  error?: string | null
  /** Icon or element shown before the label */
  labelPrefix?: ReactNode
  children: ReactNode
  orientation?: 'vertical' | 'horizontal' | 'responsive'
  className?: string
  /** Use FieldTitle for group headings without a single control id */
  labelVariant?: 'label' | 'title'
}

/** Standard label + description + error + control layout using Field primitives. */
export function FormField({
  id,
  label,
  description,
  error,
  labelPrefix,
  children,
  orientation = 'vertical',
  className,
  labelVariant = 'label',
}: FormFieldProps) {
  const labelNode =
    labelVariant === 'title' ? (
      <FieldTitle>{label}</FieldTitle>
    ) : (
      <FieldLabel htmlFor={id} className={cn(labelPrefix && 'flex items-center gap-2')}>
        {labelPrefix}
        {label}
      </FieldLabel>
    )

  if (orientation === 'horizontal' || orientation === 'responsive') {
    return (
      <Field orientation={orientation} className={cn('items-center justify-between', className)}>
        <FieldContent className="flex-1">
          {labelNode}
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
        {children}
      </Field>
    )
  }

  return (
    <Field orientation={orientation} className={className}>
      <FieldContent>
        {labelNode}
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        {children}
        {error ? <FieldError>{error}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}

type FieldSectionProps = {
  title: ReactNode
  description?: ReactNode
  error?: string | null
  children: ReactNode
  className?: string
}

/** Section heading + description + controls (multi-select grids, etc.). */
export function FieldSection({ title, description, error, children, className }: FieldSectionProps) {
  return (
    <FieldGroup className={className}>
      <Field>
        <FieldContent>
          <FieldTitle>{title}</FieldTitle>
          {description ? <FieldDescription>{description}</FieldDescription> : null}
          {children}
          {error ? <FieldError>{error}</FieldError> : null}
        </FieldContent>
      </Field>
    </FieldGroup>
  )
}

export { FieldGroup, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle }
