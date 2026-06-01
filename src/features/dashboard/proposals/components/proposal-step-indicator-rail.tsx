'use client';
import { cn } from '@/lib/utils';
import type { ProposalStep } from './proposal-step-types';
export function ProposalStepIndicatorRail({ steps, currentStep, submitted, }: {
    steps: ProposalStep[];
    currentStep: number;
    submitted: boolean;
}) {
    return (<ol className="flex flex-wrap items-center gap-2" aria-label="Proposal steps overview">
      {steps.map((step, index) => {
            const isComplete = submitted || index < currentStep;
            const isCurrent = !submitted && index === currentStep;
            return (<li key={step.id} aria-current={isCurrent ? 'step' : undefined}>
            <span title={step.title} className={cn('block size-2.5 rounded-full transition-[background-color,box-shadow,transform] duration-200 motion-reduce:transition-none', isComplete && 'bg-success ring-1 ring-success/25', isCurrent && 'scale-110 bg-primary ring-[3px] ring-primary/20', !isComplete && !isCurrent && 'bg-muted-foreground/25')}/>
            <span className="sr-only">
              {index + 1}. {step.title}
              {isComplete ? ' (completed)' : isCurrent ? ' (current)' : ''}
            </span>
          </li>);
        })}
    </ol>);
}
