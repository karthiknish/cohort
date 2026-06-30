'use client';
import { Building2, Megaphone, Target, Layers, Calendar, Wallet, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProposalStep, ProposalStepId } from './proposal-step-types';

const STEP_ICONS: Record<ProposalStepId, typeof Building2> = {
    company: Building2,
    marketing: Megaphone,
    goals: Target,
    scope: Layers,
    timelines: Calendar,
    value: Wallet,
};

type ProposalStepNavProps = {
    steps: ProposalStep[];
    currentStep: number;
    submitted: boolean;
    onGoToStep: (index: number) => void;
};

function ProposalStepNavComponent({ steps, currentStep, submitted, onGoToStep }: ProposalStepNavProps) {
    return (
        <nav aria-label="Proposal steps" className="flex flex-col justify-between gap-y-4">
            <ol className="flex flex-col gap-y-2">
                {steps.map((step, index) => (
                    <ProposalStepNavItem
                        key={step.id}
                        step={step}
                        index={index}
                        submitted={submitted}
                        currentStep={currentStep}
                        onGoToStep={onGoToStep}
                    />
                ))}
            </ol>
        </nav>
    );
}

function ProposalStepNavItem({ step, index, submitted, currentStep, onGoToStep }: {
    step: ProposalStep;
    index: number;
    submitted: boolean;
    currentStep: number;
    onGoToStep: (index: number) => void;
}) {
    const isComplete = submitted || index < currentStep;
    const isCurrent = !submitted && index === currentStep;
    const canNavigate = !submitted && index <= currentStep;
    const Icon = STEP_ICONS[step.id] ?? Building2;

    return (
        <li>
            <button
                type="button"
                disabled={!canNavigate}
                onClick={() => onGoToStep(index)}
                aria-current={isCurrent ? 'step' : undefined}
                className={cn(
                    'group/button inline-flex h-auto w-full shrink-0 cursor-pointer items-center justify-start gap-2.5 rounded p-0 transition-all',
                    !canNavigate && 'cursor-default opacity-55',
                )}
            >
                <span
                    className={cn(
                        'relative flex size-9.5 shrink-0 items-center justify-center rounded-lg transition-colors',
                        isCurrent && 'bg-primary text-primary-foreground shadow-sm',
                        isComplete && !isCurrent && 'bg-primary/10 text-primary',
                        !isComplete && !isCurrent && 'bg-muted text-muted-foreground',
                    )}
                >
                    {isComplete && !isCurrent ? (
                        <Check className="size-4" aria-hidden />
                    ) : (
                        <Icon className="size-4" aria-hidden />
                    )}
                </span>
                <div className="flex flex-col items-start gap-0.5">
                    <span className={cn('text-sm font-medium', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.title}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                        {step.description}
                    </span>
                </div>
            </button>
        </li>
    );
}

export const ProposalStepNav = ProposalStepNavComponent;
