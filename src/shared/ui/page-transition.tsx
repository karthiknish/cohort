'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { ViewTransition } from 'react'

const DIRECTIONAL_TRANSITIONS = {
  'nav-forward': 'nav-forward',
  'nav-back': 'nav-back',
  default: 'none',
} as const

type TransitionProps = {
  children: ReactNode
}

export function DirectionalPageTransition({ children }: TransitionProps) {
  return (
    <ViewTransition
      enter={DIRECTIONAL_TRANSITIONS}
      exit={DIRECTIONAL_TRANSITIONS}
      default="none"
    >
      {children}
    </ViewTransition>
  )
}

export function RevealTransition({ children }: TransitionProps) {
  return (
    <ViewTransition enter="slide-up" default="none">
      {children}
    </ViewTransition>
  )
}

export function RevealTransitionFallback({ children }: TransitionProps) {
  return <ViewTransition exit="slide-down">{children}</ViewTransition>
}

/**
 * Wraps route segment `children` in a View Transition keyed by pathname so
 * in-app navigation (same layout) animates without double-wrapping each page.
 */
export function ShellRouteTransition({ children }: TransitionProps) {
  const pathname = usePathname()

  return (
    <ViewTransition enter="slide-up" exit="fade-out" default="none">
      <div key={pathname} className="contents min-w-0">
        {children}
      </div>
    </ViewTransition>
  )
}