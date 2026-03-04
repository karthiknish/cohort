'use client'

import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { useAudioAnalyzer } from '@/hooks/use-audio-analyzer'

interface VoiceWaveformProps {
  isActive: boolean
  barCount?: number
  className?: string
}

export function VoiceWaveform({ isActive, barCount = 12, className }: VoiceWaveformProps) {
  const { frequencies } = useAudioAnalyzer(isActive)

  const bars = useMemo(() => {
    if (!isActive) {
      return new Array(barCount).fill(8)
    }

    return frequencies.map((freq, index) => {
      const baseHeight = 8
      const amplifiedFreq = Math.pow(freq, 0.8)
      const dynamicHeight = amplifiedFreq * 40
      const jitter = (index % 5) * 0.75
      return Math.max(baseHeight, dynamicHeight + jitter)
    })
  }, [frequencies, isActive, barCount])

  return (
    <div className={`flex items-center justify-center gap-1.5 h-12 ${className || ''}`}>
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-2 bg-primary rounded-full transition-colors"
          animate={{
            height: isActive ? height : 8,
            opacity: isActive ? [0.7, 1, 0.7] : 0.3,
            backgroundColor: isActive ? 'var(--primary)' : 'var(--muted-foreground)',
          }}
          transition={{
            height: {
              type: 'spring',
              stiffness: 400,
              damping: 25,
              mass: 0.5
            },
            opacity: {
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
            }
          }}
        />
      ))}
    </div>
  )
}
