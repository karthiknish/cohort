'use client'

import { useMemo, type ReactNode } from 'react'
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

type TruncatedTextPreviewTriggerProps = {
  text: string
  className?: string
}

function TruncatedTextPreviewTrigger({ text, className }: TruncatedTextPreviewTriggerProps) {
  return (
    <button type="button" className={cn('block min-w-0 truncate text-left', className)}>
      {text}
    </button>
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
  const trigger = useMemo(
    () => <TruncatedTextPreviewTrigger text={text} className={className} />,
    [text, className],
  )

  return (
    <HoverPreview trigger={trigger}>
      <p className="font-medium text-foreground">{text}</p>
      {detail ? <div className="mt-1 text-xs text-muted-foreground">{detail}</div> : null}
    </HoverPreview>
  )
}

type MetricHintTriggerProps = {
  description: string
  label?: string
  className?: string
}

function MetricHintTrigger({ description, label, className }: MetricHintTriggerProps) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className,
      )}
      aria-label={label ?? description}
    >
      <Info className="size-3" aria-hidden />
    </button>
  )
}

type MetricHintProps = {
  description: string
  label?: string
  className?: string
}

/** Info icon with metric/KPI explanation on hover (replaces tooltip-only hints). */
export function MetricHint({ description, label, className }: MetricHintProps) {
  const trigger = useMemo(
    () => <MetricHintTrigger description={description} label={label} className={className} />,
    [description, label, className],
  )

  return (
    <HoverPreview trigger={trigger} className="max-w-xs">
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </HoverPreview>
  )
}

type MetricCardPreviewTriggerProps = {
  children: ReactNode
}

function MetricCardPreviewTrigger({ children }: MetricCardPreviewTriggerProps) {
  return <div className="cursor-default">{children}</div>
}

type MetricCardPreviewProps = {
  children: ReactNode
  description: string
}

/** Wraps a KPI/metric card so the full explanation appears on hover. */
export function MetricCardPreview({ children, description }: MetricCardPreviewProps) {
  const trigger = useMemo(() => <MetricCardPreviewTrigger>{children}</MetricCardPreviewTrigger>, [children])

  return (
    <HoverPreview trigger={trigger} className="max-w-xs">
      <p className="text-xs leading-relaxed">{description}</p>
    </HoverPreview>
  )
}
