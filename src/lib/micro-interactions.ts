/**
 * Central micro-interactions: CSS class compositions + Framer variants.
 * Import from `@/lib/motion` in app code.
 */
import type { Transition, Variants } from '@/shared/ui/motion'

import {
  interactiveTransitionClass,
  listRowEnterAnimationClass,
  motionDurationSeconds,
  motionEasing,
  motionLoopSeconds,
  pressableScaleClass,
  hoverLiftClass,
} from '@/lib/animation-system'

// --- CSS micro-interaction classes ---

export const clickableCardClass = [
  interactiveTransitionClass,
  pressableScaleClass,
  hoverLiftClass,
].join(' ')

export const listItemEnterClass = listRowEnterAnimationClass

// --- Framer tokens ---

export const easings = {
  easeOut: motionEasing.out,
  easeInOut: motionEasing.inOut,
  standard: motionEasing.standard,
  spring: { type: 'spring', stiffness: 300, damping: 30 } as const,
}

export const durations = {
  fast: motionDurationSeconds.fast,
  normal: motionDurationSeconds.normal,
  slow: motionDurationSeconds.slow,
  slower: 0.36,
  page: motionDurationSeconds.page,
} as const

export const transitions = {
  fast: { duration: durations.fast, ease: easings.easeOut } as Transition,
  normal: { duration: durations.normal, ease: easings.easeOut } as Transition,
  slow: { duration: durations.slow, ease: easings.easeOut } as Transition,
  slower: { duration: durations.slower, ease: easings.easeOut } as Transition,
  spring: easings.spring,
  pulse: { duration: motionLoopSeconds.pulseSlow, repeat: Infinity, ease: easings.easeInOut } as Transition,
  blob: { duration: motionLoopSeconds.blob, repeat: Infinity, ease: motionEasing.linear } as Transition,
  blobSlow: { duration: motionLoopSeconds.blobSlow, repeat: Infinity, ease: motionEasing.linear } as Transition,
  shimmer: { duration: motionLoopSeconds.shimmer, repeat: Infinity, ease: easings.easeInOut } as Transition,
}

export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
}

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.slower },
  exit: { opacity: 0, y: -10, transition: transitions.fast },
}

export const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transitions.slow },
  exit: { opacity: 0, y: 10, transition: transitions.fast },
}

export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
  exit: { opacity: 0, x: 10, transition: transitions.fast },
}

export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
  exit: { opacity: 0, x: -10, transition: transitions.fast },
}

export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.normal },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
}

export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 0.1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.1, 0.3, 0.1],
    transition: transitions.pulse,
  },
}

export const subtlePulseVariants: Variants = {
  initial: { scale: 1, opacity: 0.2 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.2, 0.4, 0.2],
    transition: { duration: motionLoopSeconds.pulse, repeat: Infinity, ease: easings.easeInOut },
  },
}

export const blobVariants: Variants = {
  animate: {
    x: [0, 100, 0],
    y: [0, 50, 0],
    scale: [1, 1.2, 1],
    transition: transitions.blob,
  },
}

export const blobVariantsSlow: Variants = {
  animate: {
    x: [0, -80, 0],
    y: [0, 100, 0],
    scale: [1, 1.1, 1],
    transition: transitions.blobSlow,
  },
}

export const progressVariants: Variants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: motionLoopSeconds.shimmer, ease: easings.easeOut },
  }),
}

export const shimmerVariants: Variants = {
  animate: {
    x: ['-100%', '100%'],
    transition: transitions.shimmer,
  },
}

export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionDurationSeconds.fast / 2,
      delayChildren: 0,
    },
  },
}

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
}

export const pageTransitionVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.page, ease: easings.easeOut },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: durations.fast, ease: easings.easeOut },
  },
}

/** Subtle card hover — small lift, minimal scale. */
export const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.01, y: -2, transition: { duration: durations.fast, ease: easings.easeOut } },
}

export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.98, transition: { duration: motionDurationSeconds.fast / 2, ease: easings.standard } },
}

export const animationProps = {
  fadeInUp: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: fadeInUpVariants,
  },
  fadeInDown: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: fadeInDownVariants,
  },
  slideInLeft: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: slideInLeftVariants,
  },
  slideInRight: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: slideInRightVariants,
  },
  scale: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: scaleVariants,
  },
  fade: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: fadeVariants,
  },
  pulse: {
    initial: 'initial' as const,
    animate: 'animate' as const,
    variants: pulseVariants,
  },
  subtlePulse: {
    initial: 'initial' as const,
    animate: 'animate' as const,
    variants: subtlePulseVariants,
  },
  blob: {
    animate: 'animate' as const,
    variants: blobVariants,
  },
  blobSlow: {
    animate: 'animate' as const,
    variants: blobVariantsSlow,
  },
  shimmer: {
    animate: 'animate' as const,
    variants: shimmerVariants,
  },
  staggerContainer: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    variants: staggerContainerVariants,
  },
  staggerItem: {
    variants: staggerItemVariants,
  },
  pageTransition: {
    initial: 'hidden' as const,
    animate: 'visible' as const,
    exit: 'exit' as const,
    variants: pageTransitionVariants,
  },
}
