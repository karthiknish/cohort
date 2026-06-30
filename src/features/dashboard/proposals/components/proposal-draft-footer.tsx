'use client';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { cn } from '@/lib/utils';
export function ProposalDraftFooter({ currentStep, isFirstStep, isLastStep, isSubmitting, onBack, onNext, totalSteps, }: {
    currentStep: number;
    isFirstStep: boolean;
    isLastStep: boolean;
    isSubmitting: boolean;
    onBack: () => void;
    onNext: () => void;
    totalSteps: number;
}) {
    const progressPercent = Math.round(((currentStep + 1) / totalSteps) * 100);
    return (<div className="mt-auto shrink-0 space-y-3 border-t border-border/50 pt-4">
      <progress className="h-1 w-full overflow-hidden rounded-full bg-muted/60 [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-bar]:bg-muted/60 [&::-webkit-progress-value]:rounded-full [&::-webkit-progress-value]:bg-primary [&::-webkit-progress-value]:transition-[width] duration-300 ease-out" value={progressPercent} max={100} aria-label={`Step ${currentStep + 1} of ${totalSteps}`}/>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack} disabled={isFirstStep} className="h-10 gap-1.5 rounded-full px-4 font-medium">
          <ChevronLeft className="size-4" aria-hidden/>
          Previous
        </Button>
        <p className="hidden text-center text-xs text-muted-foreground sm:block">
          Step {currentStep + 1} of {totalSteps}
          <span className="mx-1.5 text-border">·</span>
          <span className="font-medium text-foreground">{progressPercent}%</span>
        </p>
        <Button onClick={onNext} disabled={isSubmitting} className={cn('h-10 gap-1.5 rounded-full px-6 font-semibold shadow-sm', isLastStep && 'bg-success text-success-foreground hover:bg-success/90')}>
          {isLastStep ? (<>
              <FileText className="size-4" aria-hidden/>
              {isSubmitting ? 'Generating…' : 'Generate strategy'}
            </>) : (<>
              {isSubmitting ? 'Saving…' : 'Continue'}
              {!isSubmitting ? <ChevronRight className="size-4" aria-hidden/> : null}
            </>)}
        </Button>
      </div>
    </div>);
}
