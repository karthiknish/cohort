'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { MeetingProcessingState } from '../types'

type MeetingAutomationPipelineProps = {
  captureErrorPresent?: boolean
  captureListening: boolean
  finalizingSession: boolean
  hasTranscriptSaved: boolean
  inRoom: boolean
  notesProcessingState: MeetingProcessingState
  summaryReady: boolean
  transcriptProcessingState: MeetingProcessingState
  className?: string
}

type PipelineStep = { label: string; description: string; badge: string; variant: 'secondary' | 'outline' | 'info' | 'destructive' }

function createPipelineSteps(props: MeetingAutomationPipelineProps): PipelineStep[] {
  const { captureErrorPresent = false, captureListening, finalizingSession, hasTranscriptSaved, inRoom, notesProcessingState, summaryReady, transcriptProcessingState } = props
  const hasCapturedContent = captureListening || hasTranscriptSaved || transcriptProcessingState === 'processing' || notesProcessingState === 'processing' || summaryReady

  const captureStep: PipelineStep = captureErrorPresent
    ? { label: 'Capture', badge: 'Check mic', variant: 'destructive', description: 'Capture needs attention before transcript syncing can continue.' }
    : captureListening
      ? { label: 'Capture', badge: 'Recording', variant: 'info', description: 'Transcript lines are being captured live right now.' }
      : hasCapturedContent
        ? { label: 'Capture', badge: 'Captured', variant: 'secondary', description: 'The meeting already has captured transcript content.' }
        : { label: 'Capture', badge: 'Waiting', variant: 'outline', description: inRoom ? 'The room is live. Start speaking to begin transcript capture.' : 'Join the room to begin transcript capture.' }

  const transcriptStep: PipelineStep = transcriptProcessingState === 'failed'
    ? { label: 'Transcript', badge: 'Needs attention', variant: 'destructive', description: 'Final transcript packaging failed. Review the latest processing error.' }
    : finalizingSession || transcriptProcessingState === 'processing'
      ? { label: 'Transcript', badge: 'Finalizing', variant: 'info', description: 'Post-call transcript finalization is currently running.' }
      : hasTranscriptSaved
        ? { label: 'Transcript', badge: 'Saved', variant: 'secondary', description: 'A saved transcript is available for notes generation and review.' }
        : { label: 'Transcript', badge: 'Waiting', variant: 'outline', description: hasCapturedContent ? 'Transcript will finish saving during sync or when the room wraps up.' : 'Waiting for transcript content first.' }

  const notesStep: PipelineStep = notesProcessingState === 'failed'
    ? { label: 'AI notes', badge: 'Needs attention', variant: 'destructive', description: 'AI notes generation failed. Retry after more transcript is captured.' }
    : notesProcessingState === 'processing'
      ? { label: 'AI notes', badge: 'Generating', variant: 'info', description: 'AI notes are being generated from the saved transcript.' }
      : summaryReady
        ? { label: 'AI notes', badge: 'Ready', variant: 'secondary', description: 'AI notes are ready to review.' }
        : { label: 'AI notes', badge: 'Waiting', variant: 'outline', description: hasTranscriptSaved ? 'Transcript is ready. Generate notes now or wait for automatic post-call notes.' : 'Waiting for a saved transcript first.' }

  return [captureStep, transcriptStep, notesStep]
}

export function MeetingAutomationPipeline(props: MeetingAutomationPipelineProps) {
  const steps = createPipelineSteps(props)

  return (
    <div className={cn('rounded-2xl border border-border/70 bg-muted/20 p-3', props.className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Automation pipeline</p>
        <p className="text-xs text-muted-foreground">Capture → Transcript → AI notes</p>
      </div>
      <ol className="mt-3 grid gap-2 lg:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step.label} className="rounded-xl border border-border/60 bg-background px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">{index + 1}. {step.label}</p>
              <Badge variant={step.variant}>{step.badge}</Badge>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">{step.description}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}