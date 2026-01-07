'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useAudioAnalyzer } from '@/hooks/use-audio-analyzer'

interface VoiceWaveformProps {
    isActive: boolean
}

export function VoiceWaveform({ isActive }: VoiceWaveformProps) {
    const { volume } = useAudioAnalyzer(isActive)
    const [bars, setBars] = useState<number[]>(new Array(12).fill(8))

    useEffect(() => {
        if (isActive) {
            // Add some randomness and reactivity to bars based on volume
            const newBars = bars.map(() => {
                const baseHeight = 8
                const dynamicHeight = volume * 32
                const randomExtra = Math.random() * 8
                return Math.max(baseHeight, dynamicHeight + randomExtra)
            })
            setBars(newBars)
        } else {
            setBars(new Array(12).fill(8))
        }
    }, [volume, isActive])

    return (
        <div className="flex items-center justify-center gap-1 h-12">
            {bars.map((height, i) => (
                <motion.div
                    key={i}
                    className="w-1.5 bg-primary rounded-full"
                    animate={{
                        height: isActive ? height : 8,
                        opacity: isActive ? [0.6, 1, 0.6] : 0.4,
                    }}
                    transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        opacity: {
                            duration: 1.5,
                            repeat: Infinity,
                            delay: i * 0.1,
                        }
                    }}
                />
            ))}
        </div>
    )
}
