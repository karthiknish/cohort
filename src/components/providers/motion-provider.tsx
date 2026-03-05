'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion'
import { usePathname } from 'next/navigation'

import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'

interface MotionProviderProps {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

const transition = { duration: motionDurationSeconds.page, ease: motionEasing.out }

export function MotionProvider({ children }: MotionProviderProps) {
  const pathname = usePathname()

  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="h-full"
          >
            {children}
          </m.div>
        </AnimatePresence>
      </LazyMotion>
    </MotionConfig>
  )
}
