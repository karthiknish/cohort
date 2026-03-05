'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'

import { motionEasing, motionLoopSeconds } from '@/lib/animation-system'
import { cn } from '@/lib/utils'

type GlowVariant = 'features' | 'testimonials' | 'integrations' | 'contact'

interface GlowShape {
  id: string
  size: number
  className: string
  initial: { x: number; y: number; scale: number; opacity: number }
  animate: { x: number; y: number; scale: number; opacity: number }
  duration: number
  delay?: number
}

const variantShapes: Record<GlowVariant, GlowShape[]> = {
  features: [
    {
      id: 'features-primary',
      size: 280,
      className: 'bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-3xl',
      initial: { x: -120, y: -60, scale: 0.9, opacity: 0.5 },
      animate: { x: -80, y: -40, scale: 1.05, opacity: 0.65 },
      duration: motionLoopSeconds.glowA,
      delay: 0,
    },
    {
      id: 'features-accent',
      size: 220,
      className: 'bg-gradient-to-br from-fuchsia-400/25 via-primary/10 to-transparent blur-3xl',
      initial: { x: 140, y: 140, scale: 0.85, opacity: 0.4 },
      animate: { x: 120, y: 100, scale: 0.95, opacity: 0.55 },
      duration: motionLoopSeconds.glowC,
      delay: 2,
    },
  ],
  testimonials: [
    {
      id: 'testimonials-warm',
      size: 260,
      className: 'bg-gradient-to-br from-amber-400/30 via-primary/10 to-transparent blur-3xl',
      initial: { x: -140, y: 60, scale: 0.8, opacity: 0.45 },
      animate: { x: -120, y: 20, scale: 0.95, opacity: 0.55 },
      duration: motionLoopSeconds.glowE,
      delay: 0,
    },
    {
      id: 'testimonials-cool',
      size: 220,
      className: 'bg-gradient-to-br from-primary/25 via-sky-300/20 to-transparent blur-2xl',
      initial: { x: 160, y: 120, scale: 0.85, opacity: 0.35 },
      animate: { x: 130, y: 80, scale: 1, opacity: 0.5 },
      duration: motionLoopSeconds.glowB,
      delay: 1.2,
    },
  ],
  integrations: [
    {
      id: 'integrations-primary',
      size: 280,
      className: 'bg-gradient-to-br from-primary/20 via-purple-400/10 to-transparent blur-3xl',
      initial: { x: -130, y: -40, scale: 0.85, opacity: 0.45 },
      animate: { x: -100, y: -10, scale: 1, opacity: 0.6 },
      duration: motionLoopSeconds.glowD,
      delay: 0,
    },
    {
      id: 'integrations-emerald',
      size: 220,
      className: 'bg-gradient-to-br from-emerald-400/20 via-primary/10 to-transparent blur-2xl',
      initial: { x: 140, y: 150, scale: 0.8, opacity: 0.35 },
      animate: { x: 110, y: 120, scale: 0.95, opacity: 0.5 },
      duration: motionLoopSeconds.glowB,
      delay: 1.8,
    },
  ],
  contact: [
    {
      id: 'contact-primary',
      size: 320,
      className: 'bg-gradient-to-br from-primary/25 via-primary/10 to-transparent blur-3xl',
      initial: { x: -140, y: 20, scale: 0.85, opacity: 0.4 },
      animate: { x: -110, y: -10, scale: 1, opacity: 0.55 },
      duration: motionLoopSeconds.glowE,
      delay: 0,
    },
    {
      id: 'contact-cool',
      size: 240,
      className: 'bg-gradient-to-br from-primary/15 via-sky-300/20 to-transparent blur-2xl',
      initial: { x: 130, y: 180, scale: 0.8, opacity: 0.3 },
      animate: { x: 100, y: 150, scale: 0.92, opacity: 0.45 },
      duration: motionLoopSeconds.glowC,
      delay: 2.2,
    },
  ],
}

interface SectionGlowProps {
  variant: GlowVariant
  className?: string
}

export function SectionGlow({ variant, className }: SectionGlowProps) {
  const shapes = variantShapes[variant]

  return (
    <LazyMotion features={domAnimation}>
      <div className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}>
        {shapes.map((shape) => (
          <m.span
            key={shape.id}
            aria-hidden
            className={cn('absolute inline-block rounded-full', shape.className)}
            style={{ width: shape.size, height: shape.size }}
            initial={shape.initial}
            animate={shape.animate}
            transition={{
              duration: shape.duration,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: motionEasing.out,
              delay: shape.delay ?? 0,
            }}
          />
        ))}
      </div>
    </LazyMotion>
  )
}
