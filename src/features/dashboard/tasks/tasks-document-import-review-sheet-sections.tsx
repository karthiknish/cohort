'use client'

import { useCallback } from 'react'
import { AlertTriangle } from 'lucide-react'

import { Checkbox } from '@/shared/ui/checkbox'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { MentionInput, type MentionableUser } from '@/shared/ui/mention-input'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/lib/utils'

import type { ProposedImportTask } from './tasks-document-import-types'

type ImportReviewTaskRowProps = {
  task: ProposedImportTask
  index: number
  mentionableUsers: MentionableUser[]
  onUpdateTask: (localId: string, patch: Partial<ProposedImportTask>) => void
}

export function ImportReviewTaskRow({
  task,
  index,
  mentionableUsers,
  onUpdateTask,
}: ImportReviewTaskRowProps) {
  const handleIncludeChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      onUpdateTask(task.localId, { include: checked === true })
    },
    [onUpdateTask, task.localId],
  )

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateTask(task.localId, { title: event.target.value })
    },
    [onUpdateTask, task.localId],
  )

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdateTask(task.localId, { description: event.target.value })
    },
    [onUpdateTask, task.localId],
  )

  const handlePriorityChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onUpdateTask(task.localId, {
        priority: event.target.value as ProposedImportTask['priority'],
      })
    },
    [onUpdateTask, task.localId],
  )

  const handleDueDateChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onUpdateTask(task.localId, { dueDate: event.target.value })
    },
    [onUpdateTask, task.localId],
  )

  const handleAssigneesChange = useCallback(
    (value: string) => {
      onUpdateTask(task.localId, { assignedTo: value })
    },
    [onUpdateTask, task.localId],
  )

  return (
    <div
      className={cn(
        'space-y-3 rounded-2xl border p-4',
        task.assignmentStatus === 'ambiguous'
          ? 'border-warning/50 bg-warning/5'
          : 'border-border/60 bg-muted/20',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <Checkbox checked={task.include} onCheckedChange={handleIncludeChange} />
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
        <Input id={`import-title-${task.localId}`} value={task.title} onChange={handleTitleChange} />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`import-description-${task.localId}`}>Notes</Label>
        <Textarea
          id={`import-description-${task.localId}`}
          value={task.description}
          rows={3}
          onChange={handleDescriptionChange}
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
            onChange={handlePriorityChange}
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
            onChange={handleDueDateChange}
          />
        </div>
      </div>

      <MentionInput
        label="Assignees"
        value={task.assignedTo}
        onChange={handleAssigneesChange}
        users={mentionableUsers}
        placeholder="@[Name] or comma-separated names"
      />
    </div>
  )
}
