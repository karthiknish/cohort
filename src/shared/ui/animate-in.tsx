'use client'

import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { LazyMotion, domAnimation, m, type HTMLMotionProps, useReducedMotion } from '@/shared/ui/motion'

import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'

const tagMap = {
  div: m.div,
  section: m.section,
  article: m.article,
  ul: m.ul,
  li: m.li,
  main: m.main,
  form: m.form,
} as const

type MotionElement = keyof typeof tagMap

const defaultFadeInDuration = motionDurationSeconds.normal
const defaultStaggerInterval = motionDurationSeconds.fast * 0.5

type BaseMotionProps = HTMLMotionProps<'div'>

const WHILE_IN_VIEW_FADE = { opacity: 1 }
const VIEWPORT_DEFAULT = { once: true, amount: 0.2 }
const HIDDEN_VARIANTS_STAGGER = {}

type FadeInProps = Omit<BaseMotionProps, 'initial' | 'animate' | 'variants' | 'whileInView' | 'viewport' | 'transition'> & {
  as?: MotionElement
  delay?: number
  duration?: number
  y?: number
  children?: ReactNode
  className?: string
}

export function FadeIn({
  children,
  as,
  delay = 0,
  duration = defaultFadeInDuration,
  y = 16,
  ...props
}: FadeInProps) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = (as ? tagMap[as] : m.div) as typeof m.div

  const initial = useMemo(() => ({ opacity: 0, y }), [y])
  const whileInViewFull = useMemo(() => ({ opacity: 1, y: 0 }), [])
  const transition = useMemo(
    () => ({ delay, duration, ease: motionEasing.out }),
    [delay, duration],
  )

  if (prefersReducedMotion) {
    return (
      <LazyMotion features={domAnimation}>
        <Tag initial={false} whileInView={WHILE_IN_VIEW_FADE} viewport={VIEWPORT_DEFAULT} {...props}>
          {children}
        </Tag>
      </LazyMotion>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <Tag
        initial={initial}
        whileInView={whileInViewFull}
        viewport={VIEWPORT_DEFAULT}
        transition={transition}
        {...props}
      >
        {children}
      </Tag>
    </LazyMotion>
  )
}

type FadeInStaggerProps = Omit<BaseMotionProps, 'initial' | 'animate' | 'variants' | 'whileInView' | 'viewport'> & {
  as?: MotionElement
  delay?: number
  duration?: number
  stagger?: number
  children?: ReactNode
  className?: string
}

export function FadeInStagger({
  children,
  as,
  delay = 0,
  duration = defaultFadeInDuration,
  stagger = defaultStaggerInterval,
  ...props
}: FadeInStaggerProps) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = (as ? tagMap[as] : m.div) as typeof m.div

  const variants = useMemo(
    () => ({
      hidden: HIDDEN_VARIANTS_STAGGER,
      visible: { transition: { staggerChildren: stagger, delayChildren: delay, duration } },
    }),
    [stagger, delay, duration],
  )

  if (prefersReducedMotion) {
    return (
      <LazyMotion features={domAnimation}>
        <Tag
          initial={false}
          whileInView={WHILE_IN_VIEW_FADE}
          viewport={VIEWPORT_DEFAULT}
          {...props}
        >
          {children}
        </Tag>
      </LazyMotion>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <Tag
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_DEFAULT}
        variants={variants}
        {...props}
      >
        {children}
      </Tag>
    </LazyMotion>
  )
}

type FadeInItemProps = Omit<BaseMotionProps, 'initial' | 'animate' | 'variants' | 'whileInView' | 'viewport' | 'transition'> & {
  as?: MotionElement
  y?: number
  duration?: number
  children?: ReactNode
  className?: string
  initial?: BaseMotionProps['initial']
  whileInView?: BaseMotionProps['whileInView']
  viewport?: BaseMotionProps['viewport']
}

export function FadeInItem({
  children,
  as,
  y = 18,
  duration = defaultFadeInDuration,
  initial,
  whileInView,
  viewport,
  ...props
}: FadeInItemProps) {
  const prefersReducedMotion = useReducedMotion()
  const Tag = (as ? tagMap[as] : m.div) as typeof m.div

  const resolvedViewport = useMemo(
    () => viewport ?? VIEWPORT_DEFAULT,
    [viewport],
  )

  const variants = useMemo(
    () => ({
      hidden: { opacity: 0, y },
      visible: { opacity: 1, y: 0, transition: { duration, ease: motionEasing.out } },
    }),
    [y, duration],
  )

  if (prefersReducedMotion) {
    return (
      <LazyMotion features={domAnimation}>
        <Tag
          initial={false}
          whileInView={WHILE_IN_VIEW_FADE}
          viewport={resolvedViewport}
          {...props}
        >
          {children}
        </Tag>
      </LazyMotion>
    )
  }

  return (
    <LazyMotion features={domAnimation}>
      <Tag
        initial={initial ?? 'hidden'}
        whileInView={whileInView ?? 'visible'}
        viewport={resolvedViewport}
        variants={variants}
        {...props}
      >
        {children}
      </Tag>
    </LazyMotion>
  )
}
