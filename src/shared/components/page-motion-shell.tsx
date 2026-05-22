'use client'

import { lazy, Suspense, type ReactNode } from 'react'
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
function PageMotionFadeIn({ children, className }: { children: ReactNode; className?: string }) {
  return <FadeInStagger className={className ?? 'flex flex-col gap-6'}>{children}</FadeInStagger>
}

function PageMotionSuspenseFallback({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return <PageMotionFadeIn className={className}>{children}</PageMotionFadeIn>
}

export function PageMotionShell({ children, className, reveal = true }: PageMotionShellProps) {
  if (!reveal) {
    return <PageMotionFadeIn className={className}>{children}</PageMotionFadeIn>
  }

  return (
    <Suspense
      fallback={<PageMotionSuspenseFallback className={className}>{children}</PageMotionSuspenseFallback>}
    >
      <LazyRevealTransition>
        <PageMotionFadeIn className={className}>{children}</PageMotionFadeIn>
      </LazyRevealTransition>
    </Suspense>
  )
}
