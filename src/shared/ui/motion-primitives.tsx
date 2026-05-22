'use client'

import type { ReactNode } from 'react'
import {
  m,
  useReducedMotion,
  type HTMLMotionProps,
} from '@/shared/ui/motion'

import {
  buttonPressVariants,
  cardHoverVariants,
  listItemEnterClass,
  staggerContainerVariants,
  staggerItemVariants,
  subtlePulseVariants,
} from '@/lib/motion'
import { cn } from '@/lib/utils'

type MotionPressableProps = Omit<
  HTMLMotionProps<'button'>,
  'initial' | 'animate' | 'whileHover' | 'whileTap' | 'variants'
> & {
  className?: string
  children?: ReactNode
}

export function MotionPressable({ className, children, ...props }: MotionPressableProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <m.button
      type="button"
      initial={prefersReducedMotion ? false : 'rest'}
      animate={prefersReducedMotion ? undefined : 'rest'}
      whileHover={prefersReducedMotion ? undefined : 'rest'}
      whileTap={prefersReducedMotion ? undefined : 'tap'}
      variants={prefersReducedMotion ? undefined : buttonPressVariants}
      className={className}
      {...props}
    >
      {children}
    </m.button>
  )
}

type MotionCardProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'whileHover' | 'variants'> & {
  interactive?: boolean
  className?: string
  children?: ReactNode
}

export function MotionCard({
  interactive = false,
  className,
  children,
  ...props
}: MotionCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const motionEnabled = interactive && !prefersReducedMotion

  return (
    <m.div
      initial={motionEnabled ? 'rest' : false}
      animate={motionEnabled ? 'rest' : undefined}
      whileHover={motionEnabled ? 'hover' : undefined}
      variants={motionEnabled ? cardHoverVariants : undefined}
      className={className}
      {...props}
    >
      {children}
    </m.div>
  )
}

type MotionListProps = Omit<HTMLMotionProps<'ul'>, 'initial' | 'animate' | 'variants'> & {
  className?: string
  children?: ReactNode
}

export function MotionList({ className, children, ...props }: MotionListProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <m.ul
      initial={prefersReducedMotion ? false : 'hidden'}
      animate={prefersReducedMotion ? undefined : 'visible'}
      variants={prefersReducedMotion ? undefined : staggerContainerVariants}
      className={className}
      {...props}
    >
      {children}
    </m.ul>
  )
}

type MotionListItemProps = Omit<HTMLMotionProps<'li'>, 'variants'> & {
  className?: string
  children?: ReactNode
}

export function MotionListItem({ className, children, ...props }: MotionListItemProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <m.li
      variants={prefersReducedMotion ? undefined : staggerItemVariants}
      className={className}
      {...props}
    >
      {children}
    </m.li>
  )
}

type MotionBadgeProps = Omit<HTMLMotionProps<'span'>, 'initial' | 'animate' | 'variants'> & {
  className?: string
  children?: ReactNode
  pulse?: boolean
}

export function MotionBadge({ pulse = false, className, children, ...props }: MotionBadgeProps) {
  const prefersReducedMotion = useReducedMotion()
  const motionEnabled = pulse && !prefersReducedMotion

  return (
    <m.span
      initial={motionEnabled ? 'initial' : false}
      animate={motionEnabled ? 'animate' : undefined}
      variants={motionEnabled ? subtlePulseVariants : undefined}
      className={className}
      {...props}
    >
      {children}
    </m.span>
  )
}

