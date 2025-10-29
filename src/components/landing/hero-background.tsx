'use client'

import { motion } from 'framer-motion'

const orbs = [
  {
    size: 260,
    blur: 'blur-3xl',
    gradient: 'from-primary/30 via-primary/10 to-transparent',
    initial: { x: -120, y: -140, scale: 0.9 },
    animate: { x: -80, y: -120, scale: 1.05 },
  },
  {
    size: 220,
    blur: 'blur-2xl',
    gradient: 'from-fuchsia-400/30 via-primary/20 to-transparent',
    initial: { x: 40, y: -60, scale: 0.85 },
    animate: { x: 20, y: -30, scale: 1 },
  },
  {
    size: 200,
    blur: 'blur-3xl',
    gradient: 'from-amber-400/20 via-primary/10 to-transparent',
    initial: { x: 140, y: 160, scale: 0.8 },
    animate: { x: 120, y: 130, scale: 0.94 },
  },
]

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-[32rem] w-full max-w-5xl overflow-visible">
      {orbs.map((orb, index) => (
        <motion.span
          key={index}
          aria-hidden
          className={`absolute inline-block rounded-full bg-gradient-to-br ${orb.gradient} ${orb.blur}`}
          style={{ width: orb.size, height: orb.size }}
          initial={orb.initial}
          animate={orb.animate}
          transition={{ duration: 12, repeat: Infinity, repeatType: 'reverse', ease: [0.16, 1, 0.3, 1], delay: index * 1.5 }}
        />
      ))}
    </div>
  )
}
