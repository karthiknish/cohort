'use client';
import { CircleAlert } from 'lucide-react';
export function ProposalStepFeedbackValidationBody({ hasErrors, validationMessages, }: {
    hasErrors: boolean;
    validationMessages: string[];
}) {
    if (hasErrors) {
        return (<ul className="space-y-1 text-sm text-muted-foreground">
        {validationMessages.map((message) => (<li key={message} className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-3.5 text-destructive"/>
            <span>{message}</span>
          </li>))}
      </ul>);
    }
    return <p className="text-sm text-muted-foreground">Everything required for this step is in place. You can continue now or refine the optional details first.</p>;
}
