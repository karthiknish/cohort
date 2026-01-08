'use client'

import { useEffect, useRef, useState } from 'react'

export interface UseAudioAnalyzerReturn {
    volume: number
    frequencies: number[]
    isAnalyzing: boolean
    error: string | null
}

export function useAudioAnalyzer(isActive: boolean): UseAudioAnalyzerReturn {
    const [volume, setVolume] = useState(0)
    const [frequencies, setFrequencies] = useState<number[]>(new Array(12).fill(0))
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
                if (typeof window === 'undefined') {
                    return
                }

                if (!navigator?.mediaDevices?.getUserMedia) {
                    setError('Microphone is not supported in this browser')
                    setIsAnalyzing(false)
                    return
                }

                const AudioContextCtor =
                    window.AudioContext ||
                    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
                if (!AudioContextCtor) {
                    setError('Audio analysis is not supported in this browser')
                    setIsAnalyzing(false)
                    return
                }

                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                streamRef.current = stream

                const audioContext = new AudioContextCtor()
                audioContextRef.current = audioContext

                const analyzer = audioContext.createAnalyser()
                // Smaller fftSize for snappier updates, specifically for visualization
                analyzer.fftSize = 128
                analyzer.smoothingTimeConstant = 0.6
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

                    // Provide raw frequencies for mapping
                    // We only take the lower half as voice is typically there
                    const binCount = 12
                    const bins = new Array(binCount).fill(0)
                    const samplesPerBin = Math.floor(bufferLength * 0.7 / binCount)

                    for (let i = 0; i < binCount; i++) {
                        let sum = 0
                        for (let j = 0; j < samplesPerBin; j++) {
                            sum += dataArray[i * samplesPerBin + j] || 0
                        }
                        bins[i] = (sum / samplesPerBin) / 255
                    }
                    setFrequencies(bins)

                    // Calculate average volume for backward compatibility or simple scale
                    let totalSum = 0
                    for (let i = 0; i < bufferLength; i++) {
                        totalSum += dataArray[i]
                    }
                    const average = totalSum / bufferLength
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
            animationFrameRef.current = null
        }

        if (sourceRef.current) {
            sourceRef.current.disconnect()
            sourceRef.current = null
        }

        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
            audioContextRef.current.close()
            audioContextRef.current = null
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
        }

        setVolume(0)
        setFrequencies(new Array(12).fill(0))
        setIsAnalyzing(false)
    }

    return { volume, frequencies, isAnalyzing, error }
}
