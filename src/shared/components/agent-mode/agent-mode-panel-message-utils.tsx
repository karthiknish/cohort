'use client'

import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'

export const MOTION_FADE_SLIDE_UP = { opacity: 0, y: -10 } as const
export const MOTION_VISIBLE = { opacity: 1, y: 0 } as const
export const MOTION_FADE_SLIDE_UP_EXIT = { opacity: 0, y: -10 } as const
export const MOTION_FADE_IN = { opacity: 0 } as const
export const MOTION_FADE_IN_VISIBLE = { opacity: 1 } as const
export const MOTION_FADE_STILL = { opacity: 0, y: 0 } as const
export const MOTION_FADE_STILL_VISIBLE = { opacity: 1, y: 0 } as const
export const MOTION_FADE_STILL_EXIT = { opacity: 0, y: 0 } as const
export const MOTION_PANEL_TRANSITION = { duration: motionDurationSeconds.fast, ease: motionEasing.out } as const

export const AGENT_PANEL_SURFACE =
  'relative bg-background before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-24 before:bg-gradient-to-b before:from-primary/[0.04] before:to-transparent'

export const AGENT_MESSAGE_THREAD =
  'relative min-h-full bg-[radial-gradient(circle_at_1px_1px,color-mix(in_srgb,var(--foreground)_6%,transparent)_1px,transparent_0)] [background-size:20px_20px]'

export function stopPropagation(event: { stopPropagation: () => void }) {
  event.stopPropagation()
}

function startOfLocalDay(date: Date): number {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

export function formatMessageDayLabel(date: Date): string {
  const now = new Date()
  const todayStart = startOfLocalDay(now)
  const messageStart = startOfLocalDay(date)
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000

  if (messageStart === todayStart) return 'Today'
  if (messageStart === yesterdayStart) return 'Yesterday'
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export function messageDayKey(timestamp: Date): string {
  return String(startOfLocalDay(timestamp))
}

export function AgentMessageDayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1" role="separator" aria-label={label}>
      <div className="h-px flex-1 bg-border/60" />
      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="h-px flex-1 bg-border/60" />
    </div>
  )
}
