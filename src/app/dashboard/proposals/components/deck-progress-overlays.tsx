"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2, Sparkles } from "lucide-react"

export type DeckProgressStage = "initializing" | "polling" | "launching" | "queued" | "error"

const deckStageMessages: Record<DeckProgressStage, { title: string; description: string }> = {
  initializing: {
    title: "Starting deck request...",
    description: "Collecting your proposal details and preparing the presentation export.",
  },
  polling: {
    title: "Generating slides & saving...",
    description: "We are exporting the PPT and saving a copy for you in Firebase.",
  },
  launching: {
    title: "Deck ready",
    description: "We saved a copy to Firebase and are opening it for you now.",
  },
  queued: {
    title: "Still processing",
    description: "The presentation export is still processing. We'll save it automatically as soon as it lands.",
  },
  error: {
    title: "Deck preparation failed",
    description: "We could not finish the export. Please retry or regenerate the proposal.",
  },
}

const generationFlow: { label: string; helper: string; duration: number | null }[] = [
  {
    label: "Analyzing your input...",
    helper: "Reviewing your responses and goals to set the brief.",
    duration: 2000,
  },
  {
    label: "Gathering market insights...",
    helper: "Pulling benchmarks, comps, and audience signals.",
    duration: 3000,
  },
  {
    label: "Drafting strategy...",
    helper: "Writing tailored recommendations and messaging.",
    duration: 5000,
  },
  {
    label: "Formatting sections...",
    helper: "Structuring slides, pricing, and CTA blocks.",
    duration: 2000,
  },
  {
    label: "Ready for review!",
    helper: "We have a complete draft waiting for you.",
    duration: null,
  },
]

export function ProposalGenerationOverlay({ isSubmitting }: { isSubmitting: boolean }) {
  const [stageIndex, setStageIndex] = useState(0)

  useEffect(() => {
    if (!isSubmitting) {
      setStageIndex(0)
    }
  }, [isSubmitting])

  useEffect(() => {
    if (!isSubmitting) return
    const current = generationFlow[stageIndex]
    if (!current || current.duration === null) return

    const id = setTimeout(() => {
      setStageIndex((prev) => Math.min(prev + 1, generationFlow.length - 1))
    }, current.duration)

    return () => clearTimeout(id)
  }, [isSubmitting, stageIndex])

  if (!isSubmitting) {
    return null
  }

  const currentStage = generationFlow[stageIndex]
  const isFinalStage = stageIndex === generationFlow.length - 1

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {isFinalStage ? (
          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
        ) : (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        )}
        <div>
          <p className="text-lg font-semibold text-foreground">{currentStage.label}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{currentStage.helper}</p>
        </div>
        <div className="mt-2 w-72 rounded-md border border-muted/60 bg-muted/30 p-3 text-left text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</p>
          <div className="mt-2 space-y-1">
            {generationFlow.map((stage, index) => {
              const isActive = index === stageIndex
              const isDone = index < stageIndex
              const indicatorClass = `h-2.5 w-2.5 rounded-full ${
                isDone ? "bg-emerald-500" : isActive ? "bg-primary" : "bg-muted-foreground/60"
              }`
              const textClass = isActive
                ? "text-foreground"
                : isDone
                  ? "text-emerald-600"
                  : "text-muted-foreground"

              return (
                <div key={stage.label} className="flex items-center gap-2">
                  <span className={indicatorClass} aria-hidden />
                  <span className={`flex-1 truncate text-sm font-medium ${textClass}`}>{stage.label}</span>
                  {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden />}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

interface DeckProgressOverlayProps {
  stage: DeckProgressStage
  isVisible: boolean
}

export function DeckProgressOverlay({ stage, isVisible }: DeckProgressOverlayProps) {
  if (!isVisible) {
    return null
  }

  const copy = deckStageMessages[stage]

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        {stage === "launching" ? (
          <Sparkles className="h-10 w-10 text-primary" />
        ) : stage === "error" ? (
          <AlertTriangle className="h-10 w-10 text-destructive" />
        ) : (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        )}
        <div>
          <p className="text-lg font-semibold text-foreground">{copy.title}</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">{copy.description}</p>
        </div>
      </div>
    </div>
  )
}

export function getDeckStageCopy(stage: DeckProgressStage) {
  return deckStageMessages[stage]
}
