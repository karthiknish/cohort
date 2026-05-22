'use client'

export function ProposalStepIndicatorSummary({
  activeStepTitle,
  currentStep,
  percentage,
  totalSteps,
}: {
  activeStepTitle: string
  currentStep: number
  percentage: number
  totalSteps: number
}) {
  return (
    <div className="flex items-center justify-between text-xs font-medium">
      <div className="flex items-center gap-2">
        <span className="font-bold text-primary">Step {currentStep + 1}</span>
        <span className="text-muted-foreground">of {totalSteps}</span>
        <span className="mx-1 text-muted-foreground/30">•</span>
        <span className="text-foreground">{activeStepTitle}</span>
      </div>
      <span className="text-primary/70">{Math.round(percentage)}%</span>
    </div>
  )
}
