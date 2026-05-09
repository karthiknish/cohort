'use client'

import { useMemo } from 'react'
import { CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import type { DeckProgressStage } from './deck-progress-overlays'

type DeckStageCopy = {
  title: string
  description: string
}

export function DeckProgressOverlayShell({ children, className }: { children: ReactNode; className: string }) {
  return (
    <output className={className} aria-live="polite">
      {children}
    </output>
  )
}

function ProposalGenerationStatusIcon({ isComplete }: { isComplete: boolean }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl" />
      <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-accent/20 bg-background shadow-xl">
        {isComplete ? (
          <div className="animate-in zoom-in fill-mode-forwards duration-500 text-success">
            <CircleCheck className="h-12 w-12" />
          </div>
        ) : (
          <div className="relative">
            <LoaderCircle className="h-12 w-12 animate-[spin_3s_linear_infinite] text-primary" />
          </div>
        )}
      </div>
    </div>
  )
}

export function ProposalGenerationOverlayContent({
  currentStageHelper,
  currentStageLabel,
  isComplete,
  progressPercent,
  stageIndex,
  stageLabels,
}: {
  currentStageHelper: string
  currentStageLabel: string
  isComplete: boolean
  progressPercent: number
  stageIndex: number
  stageLabels: string[]
}) {
  const progressStyle = useMemo(() => ({ width: `${progressPercent}%` }), [progressPercent])

  return (
    <div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-8 p-8">
      <ProposalGenerationStatusIcon isComplete={isComplete} />

      <div className="z-10 flex flex-col items-center gap-4 text-center">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {isComplete ? 'Proposal Generated!' : currentStageLabel}
          </h3>
          <p className="max-w-sm text-sm font-medium text-muted-foreground/80">
            {isComplete ? 'Your strategy and presentation deck are ready for review.' : currentStageHelper}
          </p>
        </div>

        <div className="mt-4 w-full space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full border border-muted/20 bg-muted/30">
            <div
              className="relative h-full bg-primary motion-chromatic-xslow"
              style={progressStyle}
            >
              <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Processing Strategy</span>
            <span className="text-[10px] font-bold text-primary">{Math.round(progressPercent)}%</span>
          </div>
        </div>

        <div className="mt-4 grid w-full grid-cols-5 gap-2">
          {stageLabels.map((label, index) => (
            <div
              key={label}
              className={cn(
                'h-1 rounded-full motion-chromatic-slow',
                index <= stageIndex ? 'bg-primary' : 'bg-muted/40',
                index === stageIndex && !isComplete && 'animate-pulse',
              )}
            />
          ))}
        </div>
      </div>

      <div className="absolute -left-8 top-1/4 h-16 w-16 animate-pulse rounded-full bg-accent/5 blur-xl" />
      <div className="absolute -right-8 bottom-1/4 h-20 w-20 animate-pulse rounded-full bg-accent/10 blur-2xl delay-700" />
    </div>
  )
}

function DeckProgressStageIcon({ stage }: { stage: DeckProgressStage }) {
  if (stage === 'launching') {
    return <CircleCheck className="h-10 w-10 text-primary" />
  }

  if (stage === 'error') {
    return <TriangleAlert className="h-10 w-10 text-destructive" />
  }

  return <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
}

export function DeckProgressOverlayContent({ copy, stage }: { copy: DeckStageCopy; stage: DeckProgressStage }) {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <DeckProgressStageIcon stage={stage} />
      <div>
        <p className="text-lg font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{copy.description}</p>
      </div>
    </div>
  )
}
