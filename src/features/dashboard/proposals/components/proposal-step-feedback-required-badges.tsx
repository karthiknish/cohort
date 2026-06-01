'use client';
import { Badge } from '@/shared/ui/badge';
export function ProposalStepFeedbackRequiredBadges({ requiredFieldLabels }: {
    requiredFieldLabels: string[];
}) {
    return (<div className="flex flex-wrap gap-2">
      {requiredFieldLabels.map((label) => (<Badge key={label} variant="secondary" className="rounded-full">{label}</Badge>))}
    </div>);
}
