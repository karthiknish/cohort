'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, LazyMotion, domAnimation, m, useReducedMotion } from '@/shared/ui/motion'

import { fadeVariants } from '@/lib/motion'
import { cn } from '@/lib/utils'

type ContentRevealBoundaryProps = {
  ready: boolean
  className?: string
  children: ReactNode
}

export function ContentRevealBoundary({ ready, className, children }: ContentRevealBoundaryProps) {
  const prefersReducedMotion = useReducedMotion()

  if (prefersReducedMotion) {
    return ready ? <div className={className}>{children}</div> : null
  }

  return (
    <AnimatePresence mode="wait">
      {ready ? (
        <LazyMotion key="content-reveal" features={domAnimation}>
          <m.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeVariants}
            className={cn(className)}
          >
            {children}
          </m.div>
        </LazyMotion>
      ) : null}
    </AnimatePresence>
  )
}
