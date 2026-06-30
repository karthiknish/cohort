'use client';
import { useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Checkbox } from '@/shared/ui/checkbox';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { MentionInput, type MentionableUser } from '@/shared/ui/mention-input';
import { Textarea } from '@/shared/ui/textarea';
import { cn } from '@/lib/utils';
import type { ProposedImportTask } from './tasks-document-import-types';
import { buildAssigneeReviewPrompt, resolveImportAssigneeUserIds, taskNeedsAssigneeReview, taskNeedsDueDateReview, } from './tasks-document-import-review';
type ImportReviewTaskRowProps = {
    task: ProposedImportTask;
    index: number;
    mentionableUsers: MentionableUser[];
    onUpdateTask: (localId: string, patch: Partial<ProposedImportTask>) => void;
};
export function ImportReviewTaskRow({ task, index, mentionableUsers, onUpdateTask, }: ImportReviewTaskRowProps) {
    const handleIncludeChange = (checked: boolean | 'indeterminate') => {
        onUpdateTask(task.localId, { include: checked === true });
    };
    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onUpdateTask(task.localId, { title: event.target.value });
    };
    const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onUpdateTask(task.localId, { description: event.target.value });
    };
    const handlePriorityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onUpdateTask(task.localId, {
            priority: event.target.value as ProposedImportTask['priority'],
        });
    };
    const handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        onUpdateTask(task.localId, {
            dueDate: value,
            ...(value
                ? { dueDateStatus: 'resolved' as const, dueDateHint: null }
                : {}),
        });
    };
    const handleAssigneesChange = (value: string) => {
        const assignedToUserIds = resolveImportAssigneeUserIds(value, mentionableUsers);
        onUpdateTask(task.localId, {
            assignedTo: value,
            assignedToUserIds,
            assignmentStatus: assignedToUserIds.length > 0
                ? 'resolved'
                : task.suggestions.length > 0
                    ? 'unassigned'
                    : task.assignmentStatus,
        });
    };
    const handleConfirmAssignees = () => {
        onUpdateTask(task.localId, { assignmentStatus: 'resolved' });
    };
    const needsAssigneeReview = taskNeedsAssigneeReview(task);
    const needsDueDateReview = taskNeedsDueDateReview(task);
    const needsReview = needsAssigneeReview || needsDueDateReview;
    return (<div className={cn('space-y-3 rounded-2xl border p-4', needsReview ? 'border-warning/50 bg-warning/5' : 'border-border/60 bg-muted/20')}>
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox checked={task.include} onCheckedChange={handleIncludeChange}/>
          Task {index + 1}
        </label>
        {needsReview ? (<div className="flex flex-col items-end gap-1">
            {needsAssigneeReview ? (<span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                <AlertTriangle className="size-3.5"/>
                {task.assignmentStatus === 'ambiguous' ? 'Assignee unclear' : 'Pick a teammate'}
              </span>) : null}
            {needsDueDateReview ? (<span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                <AlertTriangle className="size-3.5"/>
                {task.dueDateStatus === 'missing' ? 'Due date missing' : 'Due date unclear'}
              </span>) : null}
          </div>) : null}
      </div>

      {needsAssigneeReview ? (<p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-foreground">
          {buildAssigneeReviewPrompt(task)}
        </p>) : null}

      {needsDueDateReview ? (<p className="text-xs text-muted-foreground">
          {task.dueDateHint
                ? `The document says "${task.dueDateHint}" — pick the correct due date.`
                : 'No clear deadline was found in the document. Add one before creating this task.'}
        </p>) : null}

      <div className="space-y-2">
        <Label htmlFor={`import-title-${task.localId}`}>Title</Label>
        <Input id={`import-title-${task.localId}`} value={task.title} onChange={handleTitleChange}/>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`import-description-${task.localId}`}>Notes</Label>
        <Textarea id={`import-description-${task.localId}`} value={task.description} rows={3} onChange={handleDescriptionChange}/>
      </div>

      {task.sourceExcerpt ? (<p className="text-xs italic text-muted-foreground">&ldquo;{task.sourceExcerpt}&rdquo;</p>) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`import-priority-${task.localId}`}>Priority</Label>
          <select id={`import-priority-${task.localId}`} className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm" value={task.priority} onChange={handlePriorityChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`import-due-${task.localId}`}>Due date</Label>
          <Input id={`import-due-${task.localId}`} type="date" value={task.dueDate} onChange={handleDueDateChange} className={needsDueDateReview ? 'border-warning/60 bg-warning/5' : undefined} aria-invalid={needsDueDateReview}/>
        </div>
      </div>

      <MentionInput label="Assignees" value={task.assignedTo} onChange={handleAssigneesChange} users={mentionableUsers} placeholder="Pick teammates from the list" className={needsAssigneeReview ? 'border-warning/60 bg-warning/5' : undefined}/>

      {needsAssigneeReview && task.assignedToUserIds.length > 0 && task.assignmentStatus === 'ambiguous' ? (<Button type="button" size="sm" variant="outline" onClick={handleConfirmAssignees}>
          Confirm these assignees
        </Button>) : null}
    </div>);
}
