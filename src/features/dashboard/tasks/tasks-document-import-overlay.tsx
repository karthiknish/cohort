'use client';
import { FileUp, X } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { SiriOrb } from '@/shared/ui/siri-orb';
import { cn } from '@/lib/utils';
import type { TaskDocumentImportPhase } from './tasks-document-import-types';
type TasksDocumentImportOverlayProps = {
    phase: TaskDocumentImportPhase;
    statusMessage: string | null;
    errorMessage: string | null;
    visible: boolean;
    onCancel: () => void;
};
function phaseLabel(phase: TaskDocumentImportPhase, statusMessage: string | null, errorMessage: string | null) {
    if (phase === 'error')
        return errorMessage ?? 'Import failed';
    if (statusMessage)
        return statusMessage;
    if (phase === 'dragging')
        return 'Drop PDF, Word, or image files to create tasks from notes';
    return null;
}
export function TasksDocumentImportOverlay({ phase, statusMessage, errorMessage, visible, onCancel, }: TasksDocumentImportOverlayProps) {
    if (!visible)
        return null;
    const label = phaseLabel(phase, statusMessage, errorMessage);
    const showOrb = phase === 'extracting' || phase === 'analyzing' || phase === 'creating';
    const canCancel = phase === 'extracting' || phase === 'analyzing' || phase === 'error';
    return (<div className={cn('fixed inset-0 z-50 flex items-center justify-center p-6', phase === 'dragging' ? 'pointer-events-none bg-primary/5 backdrop-blur-[2px]' : 'pointer-events-auto bg-background/80 backdrop-blur-sm')} role="presentation">
      <div className={cn('flex max-w-lg flex-col items-center gap-6 rounded-3xl border border-dashed px-8 py-10 text-center shadow-lg', phase === 'dragging' ? 'border-primary/50 bg-primary/5' : 'border-border/70 bg-card/90', phase === 'error' && 'border-destructive/40')}>
        {showOrb ? (<SiriOrb size="128px" animationDuration={18}/>) : (<div className="flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FileUp className="size-10" aria-hidden/>
          </div>)}

        {label ? (<p className={cn('max-w-md text-sm', phase === 'error' ? 'text-destructive' : 'text-muted-foreground')}>
            {label}
          </p>) : null}

        {canCancel ? (<Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={onCancel}>
            <X className="size-3.5"/>
            Cancel
          </Button>) : null}
      </div>
    </div>);
}
