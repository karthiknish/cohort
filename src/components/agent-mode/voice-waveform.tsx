'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAudioAnalyzer } from '@/hooks/use-audio-analyzer'

interface VoiceWaveformProps {
    isActive: boolean
}

export function VoiceWaveform({ isActive }: VoiceWaveformProps) {
    const { frequencies } = useAudioAnalyzer(isActive)
    const [bars, setBars] = useState<number[]>(new Array(12).fill(8))

    useEffect(() => {
        if (isActive) {
            // Map the normalized frequencies (0-1) to heights (8-40)
            const newBars = frequencies.map((freq, i) => {
                const baseHeight = 8
                // Amplify frequencies slightly for more visual impact
                const amplifiedFreq = Math.pow(freq, 0.8) // Bring up lower volumes
                const dynamicHeight = amplifiedFreq * 40
                
                // Add a small amount of persistent jitter for "life"
                const jitter = Math.random() * 4
                
                return Math.max(baseHeight, dynamicHeight + jitter)
            })
            setBars(newBars)
        } else {
            setBars(new Array(12).fill(8))
        }
    }, [frequencies, isActive])

    return (
        <div className="flex items-center justify-center gap-1.5 h-12">
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
                            stiffness: 400, // Faster response
                            damping: 25,    // Less bounce
                            mass: 0.5       // Lighter feel
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
