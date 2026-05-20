'use client'

import type { ReactNode } from 'react'
import { Info } from 'lucide-react'

import { cn } from '@/lib/utils'
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/shared/ui/hover-card'

type HoverPreviewProps = {
  trigger: ReactNode
  children: ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  className?: string
}

export function HoverPreview({
  trigger,
  children,
  side = 'top',
  align = 'center',
  className,
}: HoverPreviewProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>{trigger}</HoverCardTrigger>
      <HoverCardContent side={side} align={align} className={cn('text-sm leading-relaxed', className)}>
        {children}
      </HoverCardContent>
    </HoverCard>
  )
}

type TruncatedTextPreviewProps = {
  text: string
  className?: string
  /** Extra lines in the hover panel (e.g. email, role). */
  detail?: ReactNode
}

/** Truncated inline text that expands in a hover card — no navigation. */
export function TruncatedTextPreview({ text, className, detail }: TruncatedTextPreviewProps) {
  return (
    <HoverPreview
      trigger={
        <span className={cn('block min-w-0 truncate', className)} tabIndex={0}>
          {text}
        </span>
      }
    >
      <p className="font-medium text-foreground">{text}</p>
      {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
    </HoverPreview>
  )
}

type MetricHintProps = {
  description: string
  label?: string
  className?: string
}

/** Info icon with metric/KPI explanation on hover (replaces tooltip-only hints). */
export function MetricHint({ description, label, className }: MetricHintProps) {
  return (
    <HoverPreview
      trigger={
        <button
          type="button"
          className={cn(
            'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            className,
          )}
          aria-label={label ?? description}
        >
          <Info className="h-3 w-3" aria-hidden />
        </button>
      }
      className="max-w-xs"
    >
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </HoverPreview>
  )
}

type MetricCardPreviewProps = {
  children: ReactNode
  description: string
}

/** Wraps a KPI/metric card so the full explanation appears on hover. */
export function MetricCardPreview({ children, description }: MetricCardPreviewProps) {
  return (
    <HoverPreview trigger={<div className="cursor-default">{children}</div>} className="max-w-xs">
      <p className="text-xs leading-relaxed">{description}</p>
    </HoverPreview>
  )
}
