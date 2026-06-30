'use client';
import { useCallback, useMemo } from 'react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Label } from '@/shared/ui/label';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet';
import { cn } from '@/lib/utils';
import { assignableImportParticipants, teamMembersToMentionable, type TaskParticipant } from './task-types';
import { TASKS_THEME } from './tasks-theme';
import type { ProposedImportTask } from './tasks-document-import-types';
import { buildImportReviewDescription, getImportReviewBlocker, } from './tasks-document-import-review';
import { ImportReviewTaskRow } from './tasks-document-import-review-sheet-sections';
type TasksDocumentImportReviewSheetProps = {
    open: boolean;
    documentSummary: string | null;
    proposedTasks: ProposedImportTask[];
    participants: TaskParticipant[];
    attachSourceDocuments: boolean;
    onAttachSourceDocumentsChange: (value: boolean) => void;
    onUpdateTask: (localId: string, patch: Partial<ProposedImportTask>) => void;
    onConfirm: () => void;
    onDiscard: () => void;
};
export function TasksDocumentImportReviewSheet({ open, documentSummary, proposedTasks, participants, attachSourceDocuments, onAttachSourceDocumentsChange, onUpdateTask, onConfirm, onDiscard, }: TasksDocumentImportReviewSheetProps) {
    const mentionableUsers = teamMembersToMentionable(assignableImportParticipants(participants));
    const selectedCount = proposedTasks.filter((task) => task.include).length;
    const reviewBlocker = getImportReviewBlocker(proposedTasks);
    const reviewDescription = buildImportReviewDescription(documentSummary, proposedTasks);
    const handleOpenChange = (next: boolean) => {
        if (!next)
            onDiscard();
    };
    const handleAttachChange = (checked: boolean | 'indeterminate') => {
        onAttachSourceDocumentsChange(checked === true);
    };
    return (<Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className={cn(TASKS_THEME.sheet.content, 'overflow-y-auto')}>
        <SheetHeader className="border-b border-border/60 pb-4 text-left">
          <SheetTitle>Review imported tasks</SheetTitle>
          <SheetDescription>{reviewDescription}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox id="attach-source-documents" checked={attachSourceDocuments} onCheckedChange={handleAttachChange}/>
            <Label htmlFor="attach-source-documents" className="font-normal">
              Attach source document to created tasks
            </Label>
          </div>

          {proposedTasks.map((task, index) => (<ImportReviewTaskRow key={task.localId} task={task} index={index} mentionableUsers={mentionableUsers} onUpdateTask={onUpdateTask}/>))}
        </div>

        <div className={TASKS_THEME.sheet.footer}>
          {reviewBlocker ? (<p className="text-sm text-warning">{reviewBlocker}</p>) : null}
          <Button type="button" onClick={onConfirm} disabled={selectedCount === 0 || Boolean(reviewBlocker)}>
            Create {selectedCount} task{selectedCount === 1 ? '' : 's'}
          </Button>
          <Button type="button" variant="outline" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      </SheetContent>
    </Sheet>);
}
