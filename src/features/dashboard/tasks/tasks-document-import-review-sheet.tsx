'use client'

import { useCallback, useMemo } from 'react'

import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { Label } from '@/shared/ui/label'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/shared/ui/sheet'
import { cn } from '@/lib/utils'

import { teamMembersToMentionable, type TaskParticipant } from './task-types'
import { TASKS_THEME } from './tasks-theme'
import type { ProposedImportTask } from './tasks-document-import-types'
import { ImportReviewTaskRow } from './tasks-document-import-review-sheet-sections'

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
  const mentionableUsers = useMemo(() => teamMembersToMentionable(participants), [participants])
  const selectedCount = proposedTasks.filter((task) => task.include).length

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) onDiscard()
    },
    [onDiscard],
  )

  const handleAttachChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      onAttachSourceDocumentsChange(checked === true)
    },
    [onAttachSourceDocumentsChange],
  )

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
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
              onCheckedChange={handleAttachChange}
            />
            <Label htmlFor="attach-source-documents" className="font-normal">
              Attach source document to created tasks
            </Label>
          </div>

          {proposedTasks.map((task, index) => (
            <ImportReviewTaskRow
              key={task.localId}
              task={task}
              index={index}
              mentionableUsers={mentionableUsers}
              onUpdateTask={onUpdateTask}
            />
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
