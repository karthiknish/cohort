'use client'

import { AlertTriangle } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { MentionInput } from '@/shared/ui/mention-input'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/lib/utils'

import { teamMembersToMentionable, type TaskParticipant } from './task-types'
import { TASKS_THEME } from './tasks-theme'
import type { ProposedImportTask } from './tasks-document-import-types'

type TasksDocumentImportReviewSheetProps = {
  open: boolean
  documentSummary: string | null
  proposedTasks: ProposedImportTask[]
  participants: TaskParticipant[]
  attachSourceDocuments: boolean
  onAttachSourceDocumentsChange: (value: boolean) => void
  onUpdateTask: (localId: string, patch: Partial<ProposedImportTask>) => void
  onConfirm: () => void
  onDiscard: () => void
}

export function TasksDocumentImportReviewSheet({
  open,
  documentSummary,
  proposedTasks,
  participants,
  attachSourceDocuments,
  onAttachSourceDocumentsChange,
  onUpdateTask,
  onConfirm,
  onDiscard,
}: TasksDocumentImportReviewSheetProps) {
  const mentionableUsers = teamMembersToMentionable(participants)
  const selectedCount = proposedTasks.filter((task) => task.include).length

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onDiscard()}>
      <SheetContent side="right" className={cn(TASKS_THEME.sheet.content, 'overflow-y-auto')}>
        <SheetHeader className="border-b border-border/60 pb-4 text-left">
          <SheetTitle>Review imported tasks</SheetTitle>
          <SheetDescription>
            {documentSummary ??
              'Some assignees need your input. Edit tasks below, then create the ones you want to keep.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              id="attach-source-documents"
              checked={attachSourceDocuments}
              onCheckedChange={(checked) => onAttachSourceDocumentsChange(checked === true)}
            />
            <Label htmlFor="attach-source-documents" className="font-normal">
              Attach source document to created tasks
            </Label>
          </div>

          {proposedTasks.map((task, index) => (
            <div
              key={task.localId}
              className={cn(
                'space-y-3 rounded-2xl border p-4',
                task.assignmentStatus === 'ambiguous'
                  ? 'border-warning/50 bg-warning/5'
                  : 'border-border/60 bg-muted/20',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={task.include}
                    onCheckedChange={(checked) =>
                      onUpdateTask(task.localId, { include: checked === true })
                    }
                  />
                  Task {index + 1}
                </label>
                {task.assignmentStatus === 'ambiguous' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-warning">
                    <AlertTriangle className="size-3.5" />
                    Assignee unclear
                  </span>
                ) : null}
              </div>

              {task.assignmentStatus === 'ambiguous' && task.suggestions.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Did you mean: {task.suggestions.join(', ')}?
                </p>
              ) : null}

              <div className="space-y-2">
                <Label htmlFor={`import-title-${task.localId}`}>Title</Label>
                <Input
                  id={`import-title-${task.localId}`}
                  value={task.title}
                  onChange={(event) => onUpdateTask(task.localId, { title: event.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`import-description-${task.localId}`}>Notes</Label>
                <Textarea
                  id={`import-description-${task.localId}`}
                  value={task.description}
                  rows={3}
                  onChange={(event) => onUpdateTask(task.localId, { description: event.target.value })}
                />
              </div>

              {task.sourceExcerpt ? (
                <p className="text-xs italic text-muted-foreground">&ldquo;{task.sourceExcerpt}&rdquo;</p>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`import-priority-${task.localId}`}>Priority</Label>
                  <select
                    id={`import-priority-${task.localId}`}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={task.priority}
                    onChange={(event) => onUpdateTask(task.localId, { priority: event.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`import-due-${task.localId}`}>Due date</Label>
                  <Input
                    id={`import-due-${task.localId}`}
                    type="date"
                    value={task.dueDate}
                    onChange={(event) => onUpdateTask(task.localId, { dueDate: event.target.value })}
                  />
                </div>
              </div>

              <MentionInput
                label="Assignees"
                value={task.assignedTo}
                onChange={(value) => onUpdateTask(task.localId, { assignedTo: value })}
                users={mentionableUsers}
                placeholder="@[Name] or comma-separated names"
              />
            </div>
          ))}
        </div>

        <div className={TASKS_THEME.sheet.footer}>
          <Button type="button" onClick={onConfirm} disabled={selectedCount === 0}>
            Create {selectedCount} task{selectedCount === 1 ? '' : 's'}
          </Button>
          <Button type="button" variant="outline" onClick={onDiscard}>
            Discard
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
