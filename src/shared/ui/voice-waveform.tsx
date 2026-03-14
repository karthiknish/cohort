'use client'

import { LazyMotion, domAnimation, m } from 'framer-motion'
import { useMemo } from 'react'

import { motionDurationSeconds, motionEasing } from '@/lib/animation-system'
import { useAudioAnalyzer } from '@/shared/hooks/use-audio-analyzer'

interface VoiceWaveformProps {
  isActive: boolean
  barCount?: number
  className?: string
}

const waveformPulseDurationSeconds = motionDurationSeconds.xslow * 2

export function VoiceWaveform({ isActive, barCount = 12, className }: VoiceWaveformProps) {
  const { frequencies } = useAudioAnalyzer(isActive)

  const bars = useMemo(() => {
    const heights = !isActive
      ? new Array(barCount).fill(8)
      : frequencies.map((freq, index) => {
          const baseHeight = 8
          const amplifiedFreq = Math.pow(freq, 0.8)
          const dynamicHeight = amplifiedFreq * 40
          const jitter = (index % 5) * 0.75
          return Math.max(baseHeight, dynamicHeight + jitter)
        })

    return heights.map((height, index) => ({
      id: `wave-bar-${index}`,
      height,
      delay: index * 0.15,
    }))
  }, [frequencies, isActive, barCount])

  return (
    <LazyMotion features={domAnimation}>
      <div className={`flex items-center justify-center gap-1.5 h-12 ${className || ''}`}>
        {bars.map((bar) => (
          <m.div
            key={bar.id}
            className="w-2 bg-primary rounded-full transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none"
            animate={{
              height: isActive ? bar.height : 8,
              opacity: isActive ? [0.7, 1, 0.7] : 0.3,
              backgroundColor: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
            }}
            transition={{
              height: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
                mass: 0.5,
              },
              opacity: {
                duration: waveformPulseDurationSeconds,
                ease: motionEasing.inOut,
                repeat: Infinity,
                delay: bar.delay,
              },
            }}
          />
        ))}
      </div>
    </LazyMotion>
  )
}
