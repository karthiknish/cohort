'use client'

import type { ReactNode } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation, m } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface MotionProviderProps {
  children: ReactNode
}

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
}

const transition = { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const }

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
