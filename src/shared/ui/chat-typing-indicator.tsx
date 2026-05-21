'use client'

import { Sparkles } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

type ChatTypingIndicatorProps = {
  /** Full sentence, e.g. "Alex is typing…" */
  label: string
  variant?: 'bubble' | 'inline' | 'composer'
  icon?: ReactNode
  className?: string
}

function TypingDots({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1', className)} aria-hidden>
      <span
        key="typing-dot-0"
        className="h-1.5 w-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:0ms]"
      />
      <span
        key="typing-dot-150"
        className="h-1.5 w-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:150ms]"
      />
      <span
        key="typing-dot-300"
        className="h-1.5 w-1.5 rounded-full bg-primary animate-subtle-dot-drift [animation-delay:300ms]"
      />
    </span>
  )
}

export function ChatTypingIndicator({
  label,
  variant = 'bubble',
  icon,
  className,
}: ChatTypingIndicatorProps) {
  if (variant === 'inline') {
    return (
      <p
        className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}
        role="status"
        aria-live="polite"
      >
        <TypingDots />
        <span>{label}</span>
      </p>
    )
  }

  if (variant === 'composer') {
    return (
      <p
        className={cn(
          'flex min-h-[1rem] items-center gap-2 text-[11px] leading-snug text-muted-foreground',
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <TypingDots className="scale-90" />
        <span className="truncate">{label}</span>
      </p>
    )
  }

  return (
    <div
      className={cn('flex items-end gap-2.5 px-1 py-2 motion-reduce:py-1', className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/60 ring-1 ring-border/50">
        {icon ?? <Sparkles className="h-4 w-4 text-primary" aria-hidden />}
      </div>
      <div className="max-w-[min(100%,20rem)] rounded-2xl rounded-tl-md border border-border/60 bg-card/95 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <TypingDots />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
      </div>
    </div>
  )
}
