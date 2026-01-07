'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseAudioAnalyzerReturn {
    volume: number
    isAnalyzing: boolean
    error: string | null
}

export function useAudioAnalyzer(isActive: boolean): UseAudioAnalyzerReturn {
    const [volume, setVolume] = useState(0)
    const [isAnalyzing, setIsAnalyzing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const audioContextRef = useRef<AudioContext | null>(null)
    const analyzerRef = useRef<AnalyserNode | null>(null)
    const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
    const animationFrameRef = useRef<number | null>(null)
    const streamRef = useRef<MediaStream | null>(null)

    useEffect(() => {
        if (!isActive) {
            stopAnalyzing()
            return
        }

        async function startAnalyzing() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                streamRef.current = stream

                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
                audioContextRef.current = audioContext

                const analyzer = audioContext.createAnalyser()
                analyzer.fftSize = 256
                analyzerRef.current = analyzer

                const source = audioContext.createMediaStreamSource(stream)
                source.connect(analyzer)
                sourceRef.current = source

                setIsAnalyzing(true)
                setError(null)

                const bufferLength = analyzer.frequencyBinCount
                const dataArray = new Uint8Array(bufferLength)

                const updateVolume = () => {
                    if (!analyzerRef.current) return

                    analyzerRef.current.getByteFrequencyData(dataArray)

                    // Calculate average volume
                    let sum = 0
                    for (let i = 0; i < bufferLength; i++) {
                        sum += dataArray[i]
                    }
                    const average = sum / bufferLength
                    // Normalize to 0-1 range (roughly)
                    setVolume(Math.min(1, average / 128))

                    animationFrameRef.current = requestAnimationFrame(updateVolume)
                }

                updateVolume()
            } catch (err) {
                console.error('Error accessing microphone:', err)
                setError('Failed to access microphone for visualization')
                setIsAnalyzing(false)
            }
        }

        startAnalyzing()

        return () => {
            stopAnalyzing()
        }
    }, [isActive])

    const stopAnalyzing = () => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current)
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect()
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close()
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
        }

        setVolume(0)
        setIsAnalyzing(false)
    }

    return { volume, isAnalyzing, error }
}
