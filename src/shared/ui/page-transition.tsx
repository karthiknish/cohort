'use client'

import type { ReactNode } from 'react'
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