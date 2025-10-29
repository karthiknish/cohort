'use client'

import type { ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'

const tagMap = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  ul: motion.ul,
  li: motion.li,
  main: motion.main,
  form: motion.form,
} as const

type MotionElement = keyof typeof tagMap

const easeOutBezier = [0.16, 1, 0.3, 1] as const

type BaseMotionProps = HTMLMotionProps<'div'>

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
  duration = 0.35,
  y = 16,
  ...props
}: FadeInProps) {
  const Tag = (as ? tagMap[as] : motion.div) as typeof motion.div
  return (
    <Tag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration, ease: easeOutBezier }}
      {...props}
    >
      {children}
    </Tag>
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
  duration = 0.35,
  stagger = 0.08,
  ...props
}: FadeInStaggerProps) {
  const Tag = (as ? tagMap[as] : motion.div) as typeof motion.div
  return (
    <Tag
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay, duration } },
      }}
      {...props}
    >
      {children}
    </Tag>
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
  duration = 0.35,
  initial,
  whileInView,
  viewport,
  ...props
}: FadeInItemProps) {
  const Tag = (as ? tagMap[as] : motion.div) as typeof motion.div
  return (
    <Tag
      initial={initial ?? 'hidden'}
      whileInView={whileInView ?? 'visible'}
      viewport={viewport ?? { once: true, amount: 0.2 }}
      variants={{
        hidden: { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration, ease: easeOutBezier } },
      }}
      {...props}
    >
      {children}
    </Tag>
  )
}
