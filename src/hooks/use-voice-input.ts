'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for voice input using the Web Speech API.
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
  } = options
  
  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  
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
  
  const startListening = useCallback(() => {
    const SpeechRecognition = getSpeechRecognition()
    
    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser'
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
    
    setError(null)
    setTranscript('')
    
    const recognition = new SpeechRecognition()
    recognition.continuous = continuous
    recognition.interimResults = true
    recognition.lang = language
    
    recognition.onstart = () => {
      setIsListening(true)
    }
    
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      try {
        const results = event.results
        if (!results || results.length === 0) return

        let finalTranscript = ''
        let interimTranscript = ''

        const startIndex = Math.max(0, event.resultIndex ?? 0)
        for (let i = startIndex; i < results.length; i++) {
          const result = results[i]
          const transcript = result?.[0]?.transcript
          if (!transcript) continue

          if (result.isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }

        const currentTranscript = (finalTranscript || interimTranscript).trim()
        setTranscript(currentTranscript)

        if (finalTranscript.trim()) {
          onResultRef.current?.(finalTranscript.trim())
        }
      } catch (err) {
        console.error('Speech recognition onresult error:', err)
        const msg = 'Voice input encountered an unexpected error'
        setError(msg)
        setIsListening(false)
        onErrorRef.current?.(msg)
      }
    }
    
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = 'Speech recognition error'
      
      switch (event.error) {
        case 'not-allowed':
          errorMessage = 'Microphone access denied. Please allow microphone access.'
          break
        case 'no-speech':
          errorMessage = 'No speech detected. Please try again.'
          break
        case 'network':
          errorMessage = 'Network error. Please check your connection.'
          break
        case 'aborted':
          // User or system aborted, not really an error
          setIsListening(false)
          return
        default:
          errorMessage = event.message || `Error: ${event.error}`
      }
      
      setError(errorMessage)
      setIsListening(false)
      onErrorRef.current?.(errorMessage)
    }
    
    recognition.onend = () => {
      setIsListening(false)
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null
      }
    }
    
    recognitionRef.current = recognition
    
    try {
      recognition.start()
    } catch (err) {
      console.error('Speech recognition start error:', err)
      const msg = 'Failed to start voice input'
      setError(msg)
      setIsListening(false)
      onErrorRef.current?.(msg)
    }
  }, [continuous, language])
  
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        // Ignore errors during stop
      }
      recognitionRef.current = null
    }
    setIsListening(false)
  }, [])
  
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
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // Ignore
        }
      }
    }
  }, [])
  
  return {
    isSupported,
    isListening,
    startListening,
    stopListening,
    toggleListening,
    transcript,
    error,
  }
}
