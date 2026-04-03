'use client'

import type { ReactNode } from 'react'
import { LazyMotion, MotionConfig, domAnimation } from '@/shared/ui/motion'

interface MotionProviderProps {
  children: ReactNode
}

export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>{children}</LazyMotion>
    </MotionConfig>
  )
}
