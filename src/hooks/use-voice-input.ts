'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseVoiceInputOptions {
  onResult?: (transcript: string) => void
  onError?: (error: string) => void
  language?: string
  continuous?: boolean
  silenceTimeout?: number
  maxDuration?: number
  maxRetries?: number
}

export interface UseVoiceInputReturn {
  isSupported: boolean
  isListening: boolean
  startListening: () => void
  stopListening: () => void
  toggleListening: () => void
  transcript: string
  error: string | null
  timeRemaining: number | null
  retryCount: number
  clearError: () => void
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message?: string
}

type SpeechRecognitionType = {
  new (): SpeechRecognition
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

const ERROR_MESSAGES: Record<string, string | null> = {
  'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
  'no-speech': 'No speech detected. Tap the microphone and try speaking again.',
  'network': 'Network error. Retrying...',
  'audio-capture': 'No microphone found. Please check your audio settings.',
  'aborted': null,
  'service-not-allowed': 'Speech service not available. Try using Chrome browser.',
  'language-not-supported': 'Language not supported for speech recognition.',
}

function getSpeechRecognition(): SpeechRecognitionType | null {
  if (typeof window === 'undefined') return null
  return (
    (window as unknown as { SpeechRecognition?: SpeechRecognitionType }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: SpeechRecognitionType }).webkitSpeechRecognition ||
    null
  )
}

// Global singleton to prevent multiple instances
let globalRecognition: SpeechRecognition | null = null
let globalIsListening = false

export function useVoiceInput(options: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const {
    onResult,
    onError,
    language = 'en-US',
    continuous = false,
    silenceTimeout = 10,
    maxDuration = 60,
    maxRetries = 2,
  } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isListeningState, setIsListeningState] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const optionsRef = useRef(options)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isMountedRef = useRef(true)

  // Keep options ref in sync without causing re-renders
  useEffect(() => {
    optionsRef.current = options
  })

  // Check browser support once on mount
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition()
    setIsSupported(SpeechRecognition !== null)

    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Sync with global state
  useEffect(() => {
    const checkGlobalState = setInterval(() => {
      if (isMountedRef.current && globalIsListening !== isListeningState) {
        setIsListeningState(globalIsListening)
      }
    }, 100)
    return () => clearInterval(checkGlobalState)
  }, [isListeningState])

  const clearTimers = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    if (maxDurationTimeoutRef.current) {
      clearTimeout(maxDurationTimeoutRef.current)
      maxDurationTimeoutRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
    setTimeRemaining(null)
  }, [])

  const stopListening = useCallback(() => {
    clearTimers()

    if (globalRecognition) {
      try {
        globalRecognition.stop()
      } catch {
        // Ignore errors during stop
      }
      globalRecognition = null
    }

    globalIsListening = false
    setIsListeningState(false)
  }, [clearTimers])

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()

    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser. Try Chrome.'
      setError(msg)
      optionsRef.current.onError?.(msg)
      return
    }

    // Stop existing recognition
    stopListening()

    clearTimers()
    setError(null)
    setTranscript('')
    setRetryCount(0)

    const recognition = new SpeechRecognition()
    globalRecognition = recognition
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language

    recognition.onstart = () => {
      globalIsListening = true
      setIsListeningState(true)
      setTimeRemaining(maxDuration)

      const startTime = Date.now()
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = Math.max(0, maxDuration - elapsed)
        setTimeRemaining(remaining)

        if (remaining <= 0) {
          clearTimers()
        }
      }, 1000)

      maxDurationTimeoutRef.current = setTimeout(() => {
        if (globalRecognition) {
          stopListening()
        }
      }, maxDuration * 1000)

      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = setTimeout(() => {
        if (globalIsListening && globalRecognition) {
          const msg = 'Stopped listening due to silence. Tap mic to try again.'
          setError(msg)
          optionsRef.current.onError?.(msg)
          stopListening()
        }
      }, silenceTimeout * 1000)
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const results = event.results
        if (!results || results.length === 0) return

        // Reset silence timer
        if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
        silenceTimeoutRef.current = setTimeout(() => {
          if (globalIsListening && globalRecognition) {
            const msg = 'Stopped listening due to silence. Tap mic to try again.'
            setError(msg)
            optionsRef.current.onError?.(msg)
            stopListening()
          }
        }, silenceTimeout * 1000)

        let finalTranscript = ''
        let interimTranscript = ''

        const startIndex = Math.max(0, event.resultIndex ?? 0)
        for (let i = startIndex; i < results.length; i++) {
          const result = results[i]
          const transcriptPart = result?.[0]?.transcript
          if (!transcriptPart) continue

          if (result.isFinal) {
            finalTranscript += transcriptPart
          } else {
            interimTranscript += transcriptPart
          }
        }

        const currentTranscript = (finalTranscript || interimTranscript).trim()
        setTranscript(currentTranscript)

        if (currentTranscript) {
          setError(null)
          setRetryCount(0)
        }

        if (finalTranscript.trim()) {
          optionsRef.current.onResult?.(finalTranscript.trim())
        }
      } catch (err) {
        const msg = 'Voice input encountered an unexpected error'
        setError(msg)
        setIsListeningState(false)
        optionsRef.current.onError?.(msg)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = event.error
      const errorMessage = ERROR_MESSAGES[errorType] ?? event.message ?? `Error: ${errorType}`

      if (errorType === 'aborted') {
        globalIsListening = false
        setIsListeningState(false)
        clearTimers()
        return
      }

      setError(errorMessage)
      globalIsListening = false
      setIsListeningState(false)
      clearTimers()
      if (errorMessage) {
        optionsRef.current.onError?.(errorMessage)
      }
    }

    recognition.onend = () => {
      globalIsListening = false
      setIsListeningState(false)
      clearTimers()

      if (globalRecognition === recognition) {
        globalRecognition = null
      }
    }

    try {
      recognition.start()
    } catch (err) {
      const msg = 'Failed to start voice input. Please try again.'
      setError(msg)
      setIsListeningState(false)
      optionsRef.current.onError?.(msg)
    }
  }, [continuous, language, silenceTimeout, maxDuration, clearTimers, stopListening])

  const toggleListening = useCallback(() => {
    if (globalIsListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [startListening, stopListening])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isSupported,
    isListening: isListeningState,
    startListening,
    stopListening,
    toggleListening,
    transcript,
    error,
    timeRemaining,
    retryCount,
    clearError,
  }
}
