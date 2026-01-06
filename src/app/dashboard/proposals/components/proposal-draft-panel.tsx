"use client"

import { ReactNode } from "react"
import { ChevronLeft, ChevronRight, Sparkles, RefreshCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ProposalDraftPanelProps {
  draftId: string | null
  autosaveStatus: "idle" | "saving" | "saved" | "error"
  stepContent: ReactNode
  onBack: () => void
  onNext: () => void
  isFirstStep: boolean
  isLastStep: boolean
  currentStep: number
  totalSteps: number
  isSubmitting: boolean
}

export function ProposalDraftPanel({
  draftId,
  autosaveStatus,
  stepContent,
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
  currentStep,
  totalSteps,
  isSubmitting,
}: ProposalDraftPanelProps) {
  return (
    <>
      <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60 px-1">
        <div className="flex items-center gap-2">
          <div className={cn(
             "h-1.5 w-1.5 rounded-full transition-all duration-500",
             autosaveStatus === "saving" ? "bg-primary animate-pulse" : "bg-emerald-500"
          )} />
          <span>{autosaveStatus === "saving" ? "Saving progress..." : "All changes saved"}</span>
        </div>
        <span>Draft #{draftId?.slice(0, 8).toUpperCase() ?? "NEW"}</span>
      </div>

      <div className="relative min-h-[400px] rounded-xl border border-muted/40 bg-muted/5 p-6 backdrop-blur-sm shadow-inner transition-all duration-300">
        {stepContent}
      </div>

      <div className="flex items-center justify-between pt-6 mt-2 border-t border-muted/20">
        <Button 
          variant="outline" 
          onClick={onBack} 
          disabled={isFirstStep}
          className="h-10 px-6 font-medium transition-all hover:bg-primary/5 hover:text-primary hover:border-primary/20"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Step {currentStep + 1}</span>
            <span className="text-xs font-medium text-primary">{Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete</span>
          </div>
          <Button 
            onClick={onNext} 
            disabled={isSubmitting}
            className={cn(
               "h-10 px-8 font-semibold shadow-lg transition-all active:scale-[0.98]",
               isLastStep && "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20"
            )}
          >
            {isLastStep ? (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Strategy
              </span>
            ) : (
              <span className="flex items-center">
                {isSubmitting ? "Submitting…" : "Continue"}
                {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
