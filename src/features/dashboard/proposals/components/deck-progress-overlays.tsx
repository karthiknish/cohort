'use client';
import { LoaderCircle, type LucideIcon } from 'lucide-react';
import { useEffect, useReducer } from 'react';
import { DeckProgressOverlayContent, DeckProgressOverlayShell, ProposalGenerationOverlayContent, } from './deck-progress-overlays-sections';
import type { DeckProgressStage } from './deck-progress-overlays-types';
import { getDeckStageCopy } from './deck-progress-overlays-utils';
export type { DeckProgressStage } from './deck-progress-overlays-types';
const generationFlow: {
    label: string;
    helper: string;
    icon: LucideIcon;
    duration: number | null;
}[] = [
    {
        label: 'Analyzing your input...',
        helper: 'Reviewing your responses and goals to set the brief.',
        icon: LoaderCircle,
        duration: 3000,
    },
    {
        label: 'Gathering market insights...',
        helper: 'Pulling benchmarks, comps, and audience signals.',
        icon: LoaderCircle,
        duration: 4000,
    },
    {
        label: 'Drafting strategy...',
        helper: 'Writing tailored recommendations and messaging.',
        icon: LoaderCircle,
        duration: 6000,
    },
    {
        label: 'Formatting sections...',
        helper: 'Structuring slides, pricing, and CTA blocks.',
        icon: LoaderCircle,
        duration: 8000,
    },
    {
        label: 'Generating presentation...',
        helper: 'We are creating your presentation slides. This may take a moment.',
        icon: LoaderCircle,
        duration: null, // This stage waits for actual completion
    },
];
interface ProposalGenerationOverlayProps {
    isSubmitting: boolean;
    isPresentationReady?: boolean;
}
type ProposalGenerationOverlayState = {
    stageIndex: number;
    shouldShowOverlay: boolean;
    showCompletionState: boolean;
};
type ProposalGenerationOverlayAction = {
    type: 'startSubmitting';
} | {
    type: 'showCompletionState';
} | {
    type: 'dismissOverlay';
} | {
    type: 'advanceStage';
};
const INITIAL_PROPOSAL_GENERATION_OVERLAY_STATE: ProposalGenerationOverlayState = {
    stageIndex: 0,
    shouldShowOverlay: false,
    showCompletionState: false,
};
function proposalGenerationOverlayReducer(state: ProposalGenerationOverlayState, action: ProposalGenerationOverlayAction): ProposalGenerationOverlayState {
    switch (action.type) {
        case 'startSubmitting':
            return {
                stageIndex: 0,
                shouldShowOverlay: true,
                showCompletionState: false,
            };
        case 'showCompletionState':
            return {
                ...state,
                showCompletionState: true,
            };
        case 'dismissOverlay':
            return INITIAL_PROPOSAL_GENERATION_OVERLAY_STATE;
        case 'advanceStage':
            return {
                ...state,
                stageIndex: Math.min(state.stageIndex + 1, generationFlow.length - 1),
            };
        default:
            return state;
    }
}
export function ProposalGenerationOverlay({ isSubmitting, isPresentationReady = false }: ProposalGenerationOverlayProps) {
    const [{ stageIndex, shouldShowOverlay, showCompletionState }, dispatch] = useReducer(proposalGenerationOverlayReducer, INITIAL_PROPOSAL_GENERATION_OVERLAY_STATE);
    // Track when overlay should be shown (starts when isSubmitting, stays until isPresentationReady)
    useEffect(() => {
        if (!isSubmitting)
            return;
        const frameId = requestAnimationFrame(() => {
            dispatch({ type: 'startSubmitting' });
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [isSubmitting]);
    // When presentation is ready, show completion state and then dismiss after delay
    useEffect(() => {
        if (!isPresentationReady || !shouldShowOverlay)
            return;
        const frameId = requestAnimationFrame(() => {
            dispatch({ type: 'showCompletionState' });
        });
        const dismissTimer = setTimeout(() => {
            dispatch({ type: 'dismissOverlay' });
        }, 1500); // Show success state for 1.5 seconds before dismissing
        return () => {
            cancelAnimationFrame(frameId);
            clearTimeout(dismissTimer);
        };
    }, [isPresentationReady, shouldShowOverlay]);
    // Progress through stages while submitting and overlay is active
    useEffect(() => {
        if (!shouldShowOverlay || showCompletionState)
            return;
        const current = generationFlow[stageIndex];
        if (!current || current.duration === null)
            return;
        const id = setTimeout(() => {
            dispatch({ type: 'advanceStage' });
        }, current.duration);
        return () => clearTimeout(id);
    }, [shouldShowOverlay, showCompletionState, stageIndex]);
    if (!shouldShowOverlay) {
        return null;
    }
    const currentStage = generationFlow[stageIndex];
    const currentStageLabel = currentStage?.label ?? 'Generating presentation...';
    const currentStageHelper = currentStage?.helper ?? 'We are creating your presentation slides. This may take a moment.';
    const isFinalStage = stageIndex === generationFlow.length - 1;
    const isComplete = showCompletionState || (isFinalStage && isPresentationReady);
    const progressPercent = ((stageIndex + (isComplete ? 1 : 0)) / generationFlow.length) * 100;
    return (<DeckProgressOverlayShell className="fixed inset-0 z-[3000] flex items-center justify-center animate-in fade-in bg-background/95 backdrop-blur-sm duration-500 pointer-events-auto">
      <ProposalGenerationOverlayContent currentStageHelper={currentStageHelper} currentStageLabel={currentStageLabel} isComplete={isComplete} progressPercent={progressPercent} stageIndex={stageIndex} stageLabels={generationFlow.map((flowStage) => flowStage.label)}/>
    </DeckProgressOverlayShell>);
}
interface DeckProgressOverlayProps {
    stage: DeckProgressStage;
    isVisible: boolean;
}
export function DeckProgressOverlay({ stage, isVisible }: DeckProgressOverlayProps) {
    if (!isVisible) {
        return null;
    }
    const copy = getDeckStageCopy(stage);
    return (<DeckProgressOverlayShell className="fixed inset-0 z-[3000] flex flex-col items-center justify-center gap-6 bg-background/95 backdrop-blur-sm pointer-events-auto">
      <DeckProgressOverlayContent copy={copy} stage={stage}/>
    </DeckProgressOverlayShell>);
}
