'use client'

import { useRef, useCallback } from 'react'
import { Mic } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useVoiceInput } from '@/hooks/use-voice-input'
import { VoiceWaveform } from './voice-waveform'

export interface VoiceInputButtonProps {
  onTranscript: (transcript: string) => void
  disabled?: boolean
  className?: string
  size?: 'sm' | 'default' | 'icon'
  showWaveform?: boolean
}

export function VoiceInputButton({
  onTranscript,
  disabled = false,
  className,
  size = 'icon',
  showWaveform = false,
}: VoiceInputButtonProps) {
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  const handleResult = useCallback((transcript: string) => {
    onTranscriptRef.current(transcript)
  }, [])

  const {
    isSupported,
    isListening,
    toggleListening,
    timeRemaining,
  } = useVoiceInput({
    onResult: handleResult,
  })

  if (!isSupported) {
    return null
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showWaveform && isListening && <VoiceWaveform isActive={isListening} />}
      <Button
        type="button"
        size={size === 'icon' ? 'icon' : 'sm'}
        variant={isListening ? 'destructive' : 'ghost'}
        onClick={toggleListening}
        disabled={disabled}
        className={cn(
          'transition-all duration-200',
          isListening && 'animate-pulse',
          size === 'sm' && 'h-7 w-auto px-2'
        )}
        title={isListening ? `Stop listening (${timeRemaining}s)` : 'Start voice input'}
      >
        <Mic className={cn('h-3.5 w-3.5', isListening && 'text-white')} />
      </Button>
    </div>
  )
}

export { useVoiceInput, VoiceWaveform }
