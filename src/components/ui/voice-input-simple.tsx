'use client'

import { useEffect, useState, useCallback } from 'react'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

let globalRecognition: SpeechRecognition | null = null
let isListeningGlobal = false
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((cb) => cb())
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
  onstart: (() => void) | null
}

const TRANSCRIPT_EVENT = 'voice-transcript'

export function VoiceInputButton({
  onTranscript,
  disabled = false,
  className,
}: {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  className?: string
}) {
  const [isListening, setIsListening] = useState(isListeningGlobal)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    const updateState = () => setIsListening(isListeningGlobal)
    listeners.add(updateState)

    const handleTranscript = (e: Event) => {
      const customEvent = e as CustomEvent<string>
      onTranscript(customEvent.detail)
    }
    window.addEventListener(TRANSCRIPT_EVENT, handleTranscript)

    return () => {
      listeners.delete(updateState)
      window.removeEventListener(TRANSCRIPT_EVENT, handleTranscript)
    }
  }, [onTranscript])

  const toggleListening = useCallback(() => {
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition

    if (!SpeechRecognition) return

    if (isListeningGlobal) {
      if (globalRecognition) {
        try {
          globalRecognition.stop()
        } catch {}
        globalRecognition = null
      }
      isListeningGlobal = false
      notifyListeners()
    } else {
      if (globalRecognition) {
        try {
          globalRecognition.abort()
        } catch {}
      }

      const recognition = new SpeechRecognition()
      globalRecognition = recognition
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        isListeningGlobal = true
        notifyListeners()
      }

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0]?.[0]?.transcript
        if (transcript) {
          window.dispatchEvent(new CustomEvent(TRANSCRIPT_EVENT, { detail: transcript }))
        }
        isListeningGlobal = false
        notifyListeners()
      }

      recognition.onerror = () => {
        isListeningGlobal = false
        notifyListeners()
      }

      recognition.onend = () => {
        isListeningGlobal = false
        notifyListeners()
        globalRecognition = null
      }

      try {
        recognition.start()
      } catch {
        isListeningGlobal = false
        notifyListeners()
      }
    }
  }, [])

  if (!isSupported) return null

  return (
    <Button
      type="button"
      size="sm"
      variant={isListening ? 'destructive' : 'ghost'}
      onClick={toggleListening}
      disabled={disabled}
      className={cn('h-7 w-7 p-0', className)}
    >
      <Mic className="h-3.5 w-3.5" />
    </Button>
  )
}
