"use client"

import { AlertTriangle, Loader2, Sparkles } from "lucide-react"

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

export function ProposalGenerationOverlay({ isSubmitting }: { isSubmitting: boolean }) {
  if (!isSubmitting) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background/80 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div>
          <p className="text-lg font-semibold text-foreground">Generating your proposal…</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            We&apos;re compiling the summary and building the deck. This can take up to a minute.
          </p>
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
