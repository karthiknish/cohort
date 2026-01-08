'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for voice input using the Web Speech API.
 * 
 * Features:
 * - Automatic timeout on silence
 * - Auto-retry on network errors
 * - Max duration safety limit
 * - Detailed error messages
 * 
 * Note: Web Speech API has limited browser support (mainly Chrome).
 * For production, consider using a cloud speech-to-text service.
 */

export interface UseVoiceInputOptions {
  /** Called when speech is recognized */
  onResult?: (transcript: string) => void
  /** Called when an error occurs */
  onError?: (error: string) => void
  /** Language for recognition (default: 'en-US') */
  language?: string
  /** Continuous listening mode (default: false) */
  continuous?: boolean
  /** Auto-stop after this many seconds of silence (default: 10) */
  silenceTimeout?: number
  /** Maximum listening duration in seconds (default: 60) */
  maxDuration?: number
  /** Maximum retry attempts on network errors (default: 2) */
  maxRetries?: number
}

export interface UseVoiceInputReturn {
  /** Whether the browser supports speech recognition */
  isSupported: boolean
  /** Whether currently listening for speech */
  isListening: boolean
  /** Start listening for speech */
  startListening: () => void
  /** Stop listening for speech */
  stopListening: () => void
  /** Toggle listening state */
  toggleListening: () => void
  /** Current transcript (interim or final) */
  transcript: string
  /** Error message, if any */
  error: string | null
  /** Seconds remaining until max duration (null if not listening) */
  timeRemaining: number | null
  /** Current retry attempt (0 if not retrying) */
  retryCount: number
  /** Clear the current error */
  clearError: () => void
}

// Type for the Web Speech API (not available in all browsers)
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
  onspeechend: (() => void) | null
  onsoundend: (() => void) | null
}

// Human-friendly error messages
const ERROR_MESSAGES: Record<string, string | null> = {
  'not-allowed': 'Microphone access denied. Please allow microphone access in your browser settings.',
  'no-speech': 'No speech detected. Tap the microphone and try speaking again.',
  'network': 'Network error. Retrying...',
  'audio-capture': 'No microphone found. Please check your audio settings.',
  'aborted': null, // Not an error - user or system aborted
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
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const maxDurationTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(Date.now())
  const retryCountRef = useRef(0)
  const shouldRetryRef = useRef(false)
  
  // Keep refs in sync
  useEffect(() => {
    onResultRef.current = onResult
    onErrorRef.current = onError
  }, [onResult, onError])
  
  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = getSpeechRecognition()
    setIsSupported(SpeechRecognition !== null)
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

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

  const resetSilenceTimer = useCallback(() => {
    lastSpeechTimeRef.current = Date.now()
    
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
    }
    
    silenceTimeoutRef.current = setTimeout(() => {
      if (recognitionRef.current && isListening) {
        console.log('[useVoiceInput] Silence timeout reached, stopping')
        const msg = 'Stopped listening due to silence. Tap mic to try again.'
        setError(msg)
        onErrorRef.current?.(msg)
        recognitionRef.current.stop()
      }
    }, silenceTimeout * 1000)
  }, [silenceTimeout, isListening])

  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    
    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser. Try Chrome.'
      setError(msg)
      onErrorRef.current?.(msg)
      return
    }
    
    // Clean up any existing instance
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // Ignore errors during cleanup
      }
    }
    
    clearTimers()
    setError(null)
    setTranscript('')
    retryCountRef.current = 0
    setRetryCount(0)
    shouldRetryRef.current = false
    
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language
    
    recognition.onstart = () => {
      setIsListening(true)
      setTimeRemaining(maxDuration)
      
      // Start max duration countdown
      const startTime = Date.now()
      countdownIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const remaining = Math.max(0, maxDuration - elapsed)
        setTimeRemaining(remaining)
        
        if (remaining <= 0) {
          clearTimers()
        }
      }, 1000)
      
      // Set max duration safety timeout
      maxDurationTimeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          console.log('[useVoiceInput] Max duration reached, stopping')
          recognitionRef.current.stop()
        }
      }, maxDuration * 1000)
      
      // Start initial silence timer
      resetSilenceTimer()
    }
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const results = event.results
        if (!results || results.length === 0) return

        // Reset silence timer on any result
        resetSilenceTimer()

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

        // Clear error on successful speech
        if (currentTranscript) {
          setError(null)
          // Reset retry count on successful speech
          retryCountRef.current = 0
          setRetryCount(0)
        }

        if (finalTranscript.trim()) {
          onResultRef.current?.(finalTranscript.trim())
        }
      } catch (err) {
        console.error('[useVoiceInput] onresult error:', err)
        const msg = 'Voice input encountered an unexpected error'
        setError(msg)
        setIsListening(false)
        onErrorRef.current?.(msg)
      }
    }
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = event.error
      const errorMessage = ERROR_MESSAGES[errorType] ?? event.message ?? `Error: ${errorType}`
      
      console.log('[useVoiceInput] Error:', errorType, event.message)

      // Handle aborted - not an error
      if (errorType === 'aborted') {
        setIsListening(false)
        clearTimers()
        return
      }

      // Handle network error with retry
      if (errorType === 'network' && retryCountRef.current < maxRetries) {
        retryCountRef.current++
        setRetryCount(retryCountRef.current)
        shouldRetryRef.current = true
        setError(`Network error. Retrying (${retryCountRef.current}/${maxRetries})...`)
        // Don't call onError for retryable errors
        return
      }

      // Final error
      setError(errorMessage)
      setIsListening(false)
      clearTimers()
      if (errorMessage) {
        onErrorRef.current?.(errorMessage)
      }
    }
    
    recognition.onend = () => {
      setIsListening(false)
      clearTimers()
      
      const currentRecognition = recognitionRef.current
      if (currentRecognition === recognition) {
        recognitionRef.current = null
      }

      // Auto-retry on network error
      if (shouldRetryRef.current && retryCountRef.current <= maxRetries) {
        shouldRetryRef.current = false
        console.log('[useVoiceInput] Auto-retrying after network error...')
        setTimeout(() => {
          startListening()
        }, 500)
      }
    }
    
    recognitionRef.current = recognition
    
    try {
      recognition.start()
    } catch (err) {
      console.error('[useVoiceInput] Start error:', err)
      const msg = 'Failed to start voice input. Please try again.'
      setError(msg)
      setIsListening(false)
      onErrorRef.current?.(msg)
    }
  }, [continuous, language, clearTimers, resetSilenceTimer, maxDuration, maxRetries])
  
  const stopListening = useCallback(() => {
    shouldRetryRef.current = false // Prevent auto-retry when manually stopped
    clearTimers()
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore errors during stop
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [clearTimers])
  
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimers()
      shouldRetryRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Ignore
        }
      }
    }
  }, [clearTimers])
  
  return {
    isSupported,
    isListening,
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
