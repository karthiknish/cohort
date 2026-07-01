'use client';
import { useEffect, useState } from 'react';
import { Check, CircleCheck, LoaderCircle, TriangleAlert } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { DeckProgressStage } from './deck-progress-overlays';
type DeckStageCopy = {
    title: string;
    description: string;
};
export function DeckProgressOverlayShell({ children, className }: {
    children: ReactNode;
    className: string;
}) {
    return (<output className={className} aria-live="polite">
      {children}
    </output>);
}
function ProposalGenerationStatusIcon({ isComplete }: {
    isComplete: boolean;
}) {
    return (<div className="relative">
      <div className="absolute inset-0 rounded-full bg-accent/20 blur-3xl"/>
      <div className="relative flex size-24 items-center justify-center rounded-full border-4 border-accent/20 bg-background shadow-xl">
        {isComplete ? (<div className="animate-in zoom-in fill-mode-forwards duration-500 text-success">
            <CircleCheck className="size-12"/>
          </div>) : (<div className="relative">
            <LoaderCircle className="size-12 animate-[spin_3s_linear_infinite] text-primary"/>
          </div>)}
      </div>
    </div>);
}
function useElapsedSeconds(isActive: boolean): number {
    const [seconds, setSeconds] = useState(0);
    useEffect(() => {
        if (!isActive) return;
        setSeconds(0);
        const id = setInterval(() => setSeconds((s) => s + 1), 1000);
        return () => clearInterval(id);
    }, [isActive]);
    return seconds;
}
function formatElapsed(totalSeconds: number): string {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
}
export function ProposalGenerationOverlayContent({ currentStageHelper, currentStageLabel, isComplete, progressPercent, stageIndex, stageLabels, }: {
    currentStageHelper: string;
    currentStageLabel: string;
    isComplete: boolean;
    progressPercent: number;
    stageIndex: number;
    stageLabels: string[];
}) {
    const progressStyle = ({ width: `${progressPercent}%` });
    const elapsed = useElapsedSeconds(!isComplete);
    return (<div className="relative mx-auto flex w-full max-w-lg flex-col items-center gap-8 p-8">
      <ProposalGenerationStatusIcon isComplete={isComplete}/>

      <div className="z-10 flex flex-col items-center gap-4 text-center">
        <div className="space-y-1">
          <h3 className="text-2xl tracking-tight text-foreground">
            {isComplete ? 'Proposal Generated!' : currentStageLabel}
          </h3>
          <p className="max-w-sm text-sm font-medium text-muted-foreground/80">
            {isComplete ? 'Your strategy and presentation deck are ready for review.' : currentStageHelper}
          </p>
        </div>

        <div className="mt-4 w-full space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full border border-muted/20 bg-muted/30">
            <div className="relative h-full bg-primary motion-chromatic-xslow" style={progressStyle}>
              <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"/>
            </div>
          </div>
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {isComplete ? 'Complete' : 'Processing Strategy'}
            </span>
            <span className="text-[10px] font-bold text-primary">
              {Math.round(progressPercent)}% · {formatElapsed(elapsed)}
            </span>
          </div>
        </div>

        <div className="mt-4 w-full space-y-1.5">
          {stageLabels.map((label, index) => {
            const isDone = isComplete || index < stageIndex;
            const isCurrent = index === stageIndex && !isComplete;
            return (<div key={label} className={cn('flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors', isCurrent && 'bg-primary/5', !isCurrent && 'opacity-60')}>
                <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-full', isDone ? 'bg-success/15 text-success' : isCurrent ? 'bg-primary/15 text-primary' : 'bg-muted/30 text-muted-foreground')}>
                  {isDone ? <Check className="size-3"/> : isCurrent ? <LoaderCircle className="size-3 animate-spin"/> : <span className="size-1.5 rounded-full bg-current"/>}
                </span>
                <span className={cn('text-xs font-medium', isCurrent ? 'text-foreground' : 'text-muted-foreground')}>
                  {label}
                </span>
              </div>);
          })}
        </div>
      </div>

      <div className="absolute -left-8 top-1/4 size-16 animate-pulse rounded-full bg-accent/5 blur-xl"/>
      <div className="absolute -right-8 bottom-1/4 size-20 animate-pulse rounded-full bg-accent/10 blur-2xl delay-700"/>
    </div>);
}
function DeckProgressStageIcon({ stage }: {
    stage: DeckProgressStage;
}) {
    if (stage === 'launching') {
        return <CircleCheck className="size-10 text-primary"/>;
    }
    if (stage === 'error') {
        return <TriangleAlert className="size-10 text-destructive"/>;
    }
    return <LoaderCircle className="size-10 animate-spin text-primary"/>;
}
export function DeckProgressOverlayContent({ copy, stage }: {
    copy: DeckStageCopy;
    stage: DeckProgressStage;
}) {
    return (<div className="flex flex-col items-center gap-3 text-center">
      <DeckProgressStageIcon stage={stage}/>
      <div>
        <p className="text-lg font-semibold text-foreground">{copy.title}</p>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{copy.description}</p>
      </div>
    </div>);
}
