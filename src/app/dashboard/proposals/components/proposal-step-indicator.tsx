"use client"

import { memo } from "react"
import { CircleCheck, Circle } from "lucide-react"

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
    <div className="space-y-6">
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-4 left-0 h-0.5 w-full bg-muted/30" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-4 left-0 h-0.5 bg-primary transition-all duration-500 ease-in-out"
          style={{ width: `${submitted ? 100 : progress}%` }}
        />

        <ol className="relative flex justify-between">
          {steps.map((item, index) => {
            const isCurrent = index === currentStep && !submitted
            const isComplete = index < currentStep || submitted
            const isFuture = index > currentStep && !submitted

            return (
              <li key={item.id} className="flex flex-col items-center">
                <div
                  className={cn(
                    "relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300",
                    isComplete
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                      ? "border-primary bg-background text-primary ring-4 ring-primary/10"
                      : "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isComplete ? (
                    <CircleCheck className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                
                <div className="mt-3 text-center">
                  <p
                    className={cn(
                      "text-[10px] font-bold uppercase tracking-wider transition-colors duration-300",
                      isCurrent || isComplete ? "text-primary" : "text-muted-foreground/60"
                    )}
                  >
                    {item.title.split(' ')[0]}
                  </p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
      
      {/* Current Step Mobile-Friendly Label */}
      <div className="flex items-center justify-between rounded-lg bg-primary/[0.03] border border-primary/10 p-3 sm:hidden">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Step {currentStep + 1} of {steps.length}</p>
          <p className="text-sm font-semibold">{steps[currentStep].title}</p>
        </div>
        <p className="text-xs text-muted-foreground">{steps[currentStep].description}</p>
      </div>

      <div className="hidden sm:block">
        <div className="flex items-center gap-3 rounded-xl bg-primary/[0.03] border border-primary/10 p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="text-sm font-bold">{currentStep + 1}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold tracking-tight">{steps[currentStep].title}</h4>
            <p className="text-xs text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProposalStepIndicator = memo(ProposalStepIndicatorComponent)
