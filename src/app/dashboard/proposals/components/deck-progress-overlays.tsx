"use client"

import { useEffect, useState } from "react"
import { TriangleAlert, CircleCheck, LoaderCircle, Sparkles } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

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

const generationFlow: { label: string; helper: string; icon: LucideIcon; duration: number | null }[] = [
  {
    label: "Analyzing your input...",
    helper: "Reviewing your responses and goals to set the brief.",
    icon: Sparkles,
    duration: 3000,
  },
  {
    label: "Gathering market insights...",
    helper: "Pulling benchmarks, comps, and audience signals.",
    icon: LoaderCircle,
    duration: 4000,
  },
  {
    label: "Drafting strategy...",
    helper: "Writing tailored recommendations and messaging.",
    icon: Sparkles,
    duration: 6000,
  },
  {
    label: "Formatting sections...",
    helper: "Structuring slides, pricing, and CTA blocks.",
    icon: LoaderCircle,
    duration: 8000,
  },
  {
    label: "Generating presentation...",
    helper: "Gamma is creating your presentation slides. This may take a moment.",
    icon: Sparkles,
    duration: null, // This stage waits for actual completion
  },
]

interface ProposalGenerationOverlayProps {
  isSubmitting: boolean
  isPresentationReady?: boolean
}

export function ProposalGenerationOverlay({ isSubmitting, isPresentationReady = false }: ProposalGenerationOverlayProps) {
  const [stageIndex, setStageIndex] = useState(0)
  const [shouldShowOverlay, setShouldShowOverlay] = useState(false)
  const [showCompletionState, setShowCompletionState] = useState(false)

  // Track when overlay should be shown (starts when isSubmitting, stays until isPresentationReady)
  useEffect(() => {
    if (isSubmitting) {
      setShouldShowOverlay(true)
      setShowCompletionState(false)
    }
  }, [isSubmitting])

  // When presentation is ready, show completion state and then dismiss after delay
  useEffect(() => {
    if (isPresentationReady && shouldShowOverlay) {
      setShowCompletionState(true)
      const dismissTimer = setTimeout(() => {
        setShouldShowOverlay(false)
        setShowCompletionState(false)
        setStageIndex(0)
      }, 1500) // Show success state for 1.5 seconds before dismissing
      return () => clearTimeout(dismissTimer)
    }
  }, [isPresentationReady, shouldShowOverlay])

  // Progress through stages while submitting and overlay is active
  useEffect(() => {
    if (!shouldShowOverlay || showCompletionState) return
    const current = generationFlow[stageIndex]
    if (!current || current.duration === null) return

    const id = setTimeout(() => {
      setStageIndex((prev) => Math.min(prev + 1, generationFlow.length - 1))
    }, current.duration)

    return () => clearTimeout(id)
  }, [shouldShowOverlay, showCompletionState, stageIndex])

  if (!shouldShowOverlay) {
    return null
  }

  const currentStage = generationFlow[stageIndex]
  const isFinalStage = stageIndex === generationFlow.length - 1
  const isComplete = showCompletionState || (isFinalStage && isPresentationReady)
  const progressPercent = ((stageIndex + (isComplete ? 1 : 0)) / generationFlow.length) * 100

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-xl animate-in fade-in duration-500"
      role="status"
      aria-live="polite"
    >
      <div className="relative w-full max-w-lg mx-auto p-8 flex flex-col items-center gap-8">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
          <div className="relative h-24 w-24 rounded-full bg-background border-4 border-primary/20 flex items-center justify-center shadow-xl">
            {isComplete ? (
              <div className="animate-in zoom-in duration-500 fill-mode-forwards text-emerald-500">
                <CircleCheck className="h-12 w-12" />
              </div>
            ) : (
              <div className="relative">
                <LoaderCircle className="h-12 w-12 animate-[spin_3s_linear_infinite] text-primary" />
                <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-primary animate-pulse" />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 text-center z-10">
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              {isComplete ? "Proposal Generated!" : currentStage.label}
            </h3>
            <p className="text-sm text-muted-foreground/80 font-medium max-w-sm">
              {isComplete ? "Your strategy and presentation deck are ready for review." : currentStage.helper}
            </p>
          </div>

          <div className="w-full mt-4 space-y-3">
            <div className="h-2 w-full bg-muted/30 rounded-full overflow-hidden border border-muted/20">
              <div 
                className="h-full bg-primary transition-all duration-1000 ease-out relative"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
              </div>
            </div>
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                Processing Strategy
              </span>
              <span className="text-[10px] font-bold text-primary">
                {Math.round(progressPercent)}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 w-full mt-4">
            {generationFlow.map((_, index) => (
              <div 
                key={index}
                className={cn(
                  "h-1 rounded-full transition-all duration-500",
                  index <= stageIndex ? "bg-primary" : "bg-muted/40",
                  index === stageIndex && !isComplete && "animate-pulse"
                )}
              />
            ))}
          </div>
        </div>

        {/* Floating elements for visual interest */}
        <div className="absolute top-1/4 -left-8 w-16 h-16 bg-primary/5 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-1/4 -right-8 w-20 h-20 bg-primary/10 rounded-full blur-2xl animate-pulse delay-700" />
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
          <TriangleAlert className="h-10 w-10 text-destructive" />
        ) : (
          <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
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
