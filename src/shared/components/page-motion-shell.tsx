'use client'

import { lazy, Suspense, useMemo, type ReactNode } from 'react'
import { FadeInStagger } from '@/shared/ui/animate-in'

const LazyRevealTransition = lazy(() =>
  import('@/shared/ui/page-transition').then((module) => ({ default: module.RevealTransition })),
)

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
  const content = useMemo(
    () => <FadeInStagger className={className ?? 'flex flex-col gap-6'}>{children}</FadeInStagger>,
    [children, className],
  )

  if (!reveal) {
    return content
  }

  return (
    <Suspense fallback={content}>
      <LazyRevealTransition>{content}</LazyRevealTransition>
    </Suspense>
  )
}
