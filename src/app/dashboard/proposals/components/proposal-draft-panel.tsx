"use client"

import { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Draft ID: {draftId ?? "pending..."}</span>
        <span>
          {autosaveStatus === "saving" && "Preparing proposal..."}
          {autosaveStatus === "saved" && "Proposal saved"}
          {autosaveStatus === "idle" && "Awaiting generation"}
          {autosaveStatus === "error" && "Sync failed, retrying..."}
        </span>
      </div>
      {stepContent}
      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <div className="flex items-center gap-3">
          <Badge variant="outline">Step {currentStep + 1} of {totalSteps}</Badge>
          <Button onClick={onNext} disabled={isSubmitting}>
            {isLastStep ? (
              "Generate proposal"
            ) : (
              <span className="flex items-center">
                {isSubmitting ? "Submitting…" : "Next"}
                {!isSubmitting && <ChevronRight className="ml-2 h-4 w-4" />}
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  )
}
