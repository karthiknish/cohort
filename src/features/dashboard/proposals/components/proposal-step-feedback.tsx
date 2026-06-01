'use client';
import { CircleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProposalStepFeedbackValidationBody } from './proposal-step-feedback-sections';
/** Compact validation strip — step title/progress live in the step nav rail. */
export function ProposalStepFeedback(props: {
    validationMessages: string[];
}) {
    const { validationMessages } = props;
    const hasErrors = validationMessages.length > 0;
    if (!hasErrors) {
        return null;
    }
    return (<div className={cn('rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3')} role="alert">
      <div className="mb-2 flex items-center gap-2 text-sm font-medium text-destructive">
        <CircleAlert className="size-4 shrink-0" aria-hidden/>
        Fix these before continuing
      </div>
      <ProposalStepFeedbackValidationBody hasErrors validationMessages={validationMessages}/>
    </div>);
}
