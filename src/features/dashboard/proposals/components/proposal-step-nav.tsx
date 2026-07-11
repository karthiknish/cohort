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
        <nav aria-label="Proposal steps" className="flex flex-col gap-3">
            <ol className="flex flex-col gap-1">
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
                    'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                    canNavigate && 'hover:bg-muted/40',
                    isCurrent && 'bg-muted/60',
                    !canNavigate && 'opacity-50',
                )}
            >
                <span
                    className={cn(
                        'flex size-8 shrink-0 items-center justify-center rounded-md transition-colors',
                        isCurrent && 'bg-primary text-primary-foreground',
                        isComplete && !isCurrent && 'bg-primary/10 text-primary',
                        !isComplete && !isCurrent && 'bg-muted text-foreground/70',
                    )}
                >
                    {isComplete && !isCurrent ? (
                        <Check className="size-4" aria-hidden />
                    ) : (
                        <Icon className="size-4" aria-hidden />
                    )}
                </span>
                <div className="flex min-w-0 flex-col gap-0.5">
                    <span className={cn('truncate text-sm font-medium', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                        {step.title}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                        {step.description}
                    </span>
                </div>
            </button>
        </li>
    );
}

export const ProposalStepNav = ProposalStepNavComponent;
