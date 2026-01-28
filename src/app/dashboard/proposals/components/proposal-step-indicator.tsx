"use client"

import { memo } from "react"
import { CircleCheck } from "lucide-react"

import { cn } from "@/lib/utils"

import type { ProposalStepId } from "./proposal-step-content"

export interface ProposalStep {
  id: ProposalStepId
  title: string
  description: string
}

interface ProposalStepIndicatorProps {
  steps: ProposalStep[]
  currentStep: number
  submitted: boolean
}

function ProposalStepIndicatorComponent({
  steps,
  currentStep,
  submitted,
}: ProposalStepIndicatorProps) {
  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold">Step {currentStep + 1}</span>
          <span className="text-muted-foreground">of {steps.length}</span>
          <span className="mx-1 text-muted-foreground/30">•</span>
          <span className="text-foreground">{steps[currentStep]!.title}</span>
        </div>
        <span className="text-primary/70">{Math.round(submitted ? 100 : progress)}%</span>
      </div>
      
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted/30">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${submitted ? 100 : progress}%` }}
        />
      </div>
    </div>
  )
}

export const ProposalStepIndicator = memo(ProposalStepIndicatorComponent)
