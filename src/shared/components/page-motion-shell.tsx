'use client'

import type { ReactNode } from 'react'
import { FadeInStagger } from '@/shared/ui/animate-in'
import { RevealTransition } from '@/shared/ui/page-transition'

type PageMotionShellProps = {
  children: ReactNode
  className?: string
  /** Set false when the route segment already uses `ShellRouteTransition` in `template.tsx`. */
  reveal?: boolean
}

/**
 * Standard page entrance: optional route reveal + staggered section fade-in.
 * Use once at the feature page root.
 */
export function PageMotionShell({ children, className, reveal = true }: PageMotionShellProps) {
  const content = (
    <FadeInStagger className={className ?? 'flex flex-col gap-6'}>{children}</FadeInStagger>
  )

  if (!reveal) {
    return content
  }

  return <RevealTransition>{content}</RevealTransition>
}
