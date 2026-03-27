import type { Transition, Variants } from '@/shared/ui/motion'

import { motionDurationSeconds, motionEasing, motionLoopSeconds } from '@/lib/animation-system'

export const easings = {
  easeOut: motionEasing.out,
  easeInOut: motionEasing.inOut,
  standard: motionEasing.standard,
  spring: { type: 'spring', stiffness: 300, damping: 30 } as const,
}

// Standard durations (in seconds)
export const durations = {
  fast: motionDurationSeconds.fast,
  normal: motionDurationSeconds.normal,
  slow: motionDurationSeconds.slow,
  slower: 0.36,
  page: motionDurationSeconds.page,
} as const

// Common transitions
export const transitions = {
  fast: { duration: durations.fast, ease: easings.easeOut } as Transition,
  normal: { duration: durations.normal, ease: easings.easeOut } as Transition,
  slow: { duration: durations.slow, ease: easings.easeOut } as Transition,
  slower: { duration: durations.slower, ease: easings.easeOut } as Transition,
  spring: easings.spring,
  // Infinite transitions
  pulse: { duration: motionLoopSeconds.pulseSlow, repeat: Infinity, ease: easings.easeInOut } as Transition,
  blob: { duration: motionLoopSeconds.blob, repeat: Infinity, ease: motionEasing.linear } as Transition,
  blobSlow: { duration: motionLoopSeconds.blobSlow, repeat: Infinity, ease: motionEasing.linear } as Transition,
  shimmer: { duration: motionLoopSeconds.shimmer, repeat: Infinity, ease: easings.easeInOut } as Transition,
}

// Fade animations
export const fadeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: transitions.fast },
}

// Fade in from below (most common pattern)
export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: transitions.slower },
  exit: { opacity: 0, y: -10, transition: transitions.fast },
}

// Fade in from above
export const fadeInDownVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: transitions.slow },
  exit: { opacity: 0, y: 10, transition: transitions.fast },
}

// Slide in from left
export const slideInLeftVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
  exit: { opacity: 0, x: 10, transition: transitions.fast },
}

// Slide in from right
export const slideInRightVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: transitions.slow },
  exit: { opacity: 0, x: -10, transition: transitions.fast },
}

// Scale animations
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: transitions.normal },
  exit: { opacity: 0, scale: 0.95, transition: transitions.fast },
}

// Pulse animation (for loading states, attention)
export const pulseVariants: Variants = {
  initial: { scale: 1, opacity: 0.1 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.1, 0.3, 0.1],
    transition: transitions.pulse,
  },
}

// Subtle pulse for icons/badges
export const subtlePulseVariants: Variants = {
  initial: { scale: 1, opacity: 0.2 },
  animate: {
    scale: [1, 1.2, 1],
    opacity: [0.2, 0.5, 0.2],
    transition: { duration: motionLoopSeconds.pulse, repeat: Infinity, ease: easings.easeInOut },
  },
}

// Blob floating animation (for background decorative elements)
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

// Progress bar animation
export const progressVariants: Variants = {
  hidden: { width: 0 },
  visible: (progress: number) => ({
    width: `${progress}%`,
    transition: { duration: motionLoopSeconds.shimmer, ease: easings.easeOut },
  }),
}

// Shimmer effect (for loading states)
export const shimmerVariants: Variants = {
  animate: {
    x: ['-100%', '100%'],
    transition: transitions.shimmer,
  },
}

// Stagger container for list animations
export const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: motionDurationSeconds.fast / 2,
      delayChildren: 0,
    },
  },
}

// Stagger item (pairs with staggerContainer)
export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.normal,
  },
}

// Page transition variants
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

// Card hover effect
export const cardHoverVariants: Variants = {
  rest: { scale: 1, y: 0 },
  hover: { scale: 1.02, y: -4, transition: { duration: durations.fast, ease: easings.easeOut } },
}

// Button press effect
export const buttonPressVariants: Variants = {
  rest: { scale: 1 },
  tap: { scale: 0.95, transition: { duration: motionDurationSeconds.fast / 2, ease: easings.standard } },
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
