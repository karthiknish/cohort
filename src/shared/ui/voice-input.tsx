'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import { interactiveTransitionClass } from '@/lib/animation-system'
import { Button } from '@/shared/ui/button'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/shared/hooks/use-voice-input'
import { VoiceWaveform } from './voice-waveform'

export interface VoiceInputButtonProps {
  /** Called with final transcript text */
  onTranscript: (transcript: string) => void
  /** Called with interim (real-time) transcript while user is still speaking */
  onInterimTranscript?: (transcript: string) => void
  disabled?: boolean
  className?: string
  /** 'inline' = compact button for toolbars (collaboration), 'standalone' = larger with built-in waveform (agent) */
  variant?: 'inline' | 'standalone'
  /** Show the waveform visualizer when listening */
  showWaveform?: boolean
}

export function VoiceInputButton({
  onTranscript,
  onInterimTranscript,
  disabled = false,
  className,
  variant = 'inline',
  showWaveform = false,
}: VoiceInputButtonProps) {
  const onTranscriptRef = useRef(onTranscript)
  useEffect(() => {
    onTranscriptRef.current = onTranscript
  }, [onTranscript])

  const onInterimRef = useRef(onInterimTranscript)
  useEffect(() => {
    onInterimRef.current = onInterimTranscript
  }, [onInterimTranscript])

  const handleResult = useCallback((transcript: string) => {
    onTranscriptRef.current(transcript)
  }, [])

  const {
    isSupported,
    isListening,
    toggleListening,
    transcript,
    error: voiceError,
    timeRemaining,
    clearError,
  } = useVoiceInput({
    onResult: handleResult,
  })

  // Forward interim transcripts
  useEffect(() => {
    if (transcript && isListening && onInterimRef.current) {
      onInterimRef.current(transcript)
    }
  }, [transcript, isListening])

  if (!isSupported) {
    return null
  }

  // Inline variant: compact mic button for toolbars
  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {showWaveform && isListening && <VoiceWaveform isActive={isListening} barCount={8} className="h-8" />}
        <Button
          type="button"
          size="sm"
          variant={isListening ? 'destructive' : 'ghost'}
          onClick={toggleListening}
          disabled={disabled}
          className={cn(
            'h-7 w-7 p-0',
            interactiveTransitionClass,
            isListening && 'animate-pulse'
          )}
          title={isListening ? `Stop listening (${timeRemaining}s)` : 'Start voice input'}
        >
          <Mic className={cn('h-3.5 w-3.5', isListening && 'text-white')} />
        </Button>
      </div>
    )
  }

  // Standalone variant: larger button with optional built-in waveform + error display
  return (
    <div className={cn('flex flex-col items-center', className)}>
      {/* Waveform */}
      {showWaveform && isListening && (
        <div className="flex flex-col items-center py-3">
          <VoiceWaveform isActive={isListening} />
          {timeRemaining !== null && (
            <p className="mt-1 text-xs text-muted-foreground">
              {timeRemaining}s remaining
            </p>
          )}
        </div>
      )}

      {/* Error display */}
      {voiceError && (
        <div className="mb-2 flex items-center gap-2 text-xs">
          <p className="text-destructive flex-1">{voiceError}</p>
          <Button variant="ghost" size="sm" onClick={clearError} className="h-6 px-2 text-xs">
            Dismiss
          </Button>
        </div>
      )}

      {/* Mic button */}
      <Button
        type="button"
        variant={isListening ? 'destructive' : 'outline'}
        size="icon"
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          'h-10 w-10 shrink-0 rounded-full',
          interactiveTransitionClass,
          isListening && 'animate-pulse ring-2 ring-destructive/50'
        )}
        title={isListening ? `Stop listening (${timeRemaining}s)` : 'Start voice input'}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </Button>
    </div>
  )
}

export { useVoiceInput, VoiceWaveform }
