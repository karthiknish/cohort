'use client'

import { useCallback, type RefObject } from 'react'
import { Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { PendingAttachmentsList } from '@/features/dashboard/collaboration/components/message-composer'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Input } from '@/shared/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import { cn } from '@/lib/utils'
import type { PendingTaskAttachment } from '@/services/task-attachments'
import type { TaskPriority } from '@/types/tasks'

import {
  TaskContextChip,
  TaskFormField,
  TaskFormSection,
  TaskModalActions,
  TaskModalError,
} from './task-modal-primitives'
import { TASKS_THEME } from './tasks-theme'
import {
  formatPriorityLabel,
  isTaskDueDateDisabled,
  priorityAccentColors,
} from './task-types'

type TaskCreationModalFormFieldsProps = {
  title: string
  description: string
  priority: TaskPriority
  dueDate: string
  projectName: string
  clientName: string | null | undefined
  assigneeCount: number
  error: string | null
  isLoading: boolean
  pendingAttachments: PendingTaskAttachment[]
  fileInputRef: RefObject<HTMLInputElement | null>
  onTitleChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onPriorityChange: (value: TaskPriority) => void
  onDateSelect: (date: Date | undefined) => void
  onAddAttachments: (files: FileList | null) => void
  onRemoveAttachment: (attachmentId: string) => void
  onCancel: () => void
}

function PrioritySelectItem({ value }: { value: TaskPriority }) {
  return (
    <span className="flex items-center gap-2">
      <span className={cn('h-2 w-2 shrink-0 rounded-full', priorityAccentColors[value])} aria-hidden />
      {formatPriorityLabel(value)}
    </span>
  )
}

export function TaskCreationModalFormFields({
  title,
  description,
  priority,
  dueDate,
  projectName,
  clientName,
  assigneeCount,
  error,
  isLoading,
  pendingAttachments,
  fileInputRef,
  onTitleChange,
  onDescriptionChange,
  onPriorityChange,
  onDateSelect,
  onAddAttachments,
  onRemoveAttachment,
  onCancel,
}: TaskCreationModalFormFieldsProps) {
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => onTitleChange(event.target.value),
    [onTitleChange],
  )

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => onDescriptionChange(event.target.value),
    [onDescriptionChange],
  )

  const handlePriorityChange = useCallback(
    (value: string) => onPriorityChange(value as TaskPriority),
    [onPriorityChange],
  )

  const handleOpenFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleFilesChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onAddAttachments(event.target.files)
      event.currentTarget.value = ''
    },
    [onAddAttachments],
  )

  return (
    <>
      <TaskFormSection title="Essentials">
        <TaskFormField id="quick-task-title" label="Title" required>
          <Input
            id="quick-task-title"
            placeholder="What needs to get done?"
            value={title}
            onChange={handleTitleChange}
            required
            disabled={isLoading}
            className={TASKS_THEME.input}
          />
        </TaskFormField>

        <TaskFormField id="quick-task-description" label="Description">
          <Textarea
            id="quick-task-description"
            placeholder="Optional context or next steps"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            disabled={isLoading}
            className={TASKS_THEME.textarea}
          />
        </TaskFormField>
      </TaskFormSection>

      <TaskFormSection title="Scheduling">
        <div className="grid grid-cols-2 gap-3.5">
          <TaskFormField id="quick-task-priority" label="Priority">
            <Select value={priority} onValueChange={handlePriorityChange} disabled={isLoading}>
              <SelectTrigger id="quick-task-priority" className={TASKS_THEME.selectTrigger} disabled={isLoading}>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <PrioritySelectItem value="low" />
                </SelectItem>
                <SelectItem value="medium">
                  <PrioritySelectItem value="medium" />
                </SelectItem>
                <SelectItem value="high">
                  <PrioritySelectItem value="high" />
                </SelectItem>
                <SelectItem value="urgent">
                  <PrioritySelectItem value="urgent" />
                </SelectItem>
              </SelectContent>
            </Select>
          </TaskFormField>

          <TaskFormField id="quick-task-due" label="Due date">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="quick-task-due"
                  type="button"
                  variant="outline"
                  className={cn(
                    TASKS_THEME.selectTrigger,
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground',
                  )}
                  disabled={isLoading}
                  aria-label="Due date, open calendar"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                  {dueDate ? format(parseISO(dueDate), 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate ? parseISO(dueDate) : undefined}
                  disabled={isTaskDueDateDisabled}
                  onSelect={onDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </TaskFormField>
        </div>
      </TaskFormSection>

      <TaskFormSection title="Context">
        <div className="grid grid-cols-2 gap-3.5">
          <TaskFormField label="Client">
            <TaskContextChip>
              <span className={cn(!clientName && 'text-muted-foreground')}>{clientName || 'None'}</span>
            </TaskContextChip>
          </TaskFormField>
          <TaskFormField label="Project">
            <TaskContextChip>
              <span className={cn(!projectName && 'text-muted-foreground')}>{projectName || 'None'}</span>
            </TaskContextChip>
          </TaskFormField>
        </div>
        <TaskFormField label="Assigned to">
          <TaskContextChip>
            {assigneeCount > 0 ? `${assigneeCount} teammate${assigneeCount === 1 ? '' : 's'}` : 'Unassigned'}
          </TaskContextChip>
        </TaskFormField>
      </TaskFormSection>

      <TaskFormSection title="Attachments">
        <div className="flex items-center justify-between gap-2">
          <p className={TASKS_THEME.hint}>Up to 10 files, 15MB each.</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 shrink-0 gap-1.5"
            disabled={isLoading}
            onClick={handleOpenFileDialog}
          >
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </Button>
        </div>
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFilesChange} />
        {pendingAttachments.length > 0 ? (
          <PendingAttachmentsList
            attachments={pendingAttachments}
            uploading={isLoading}
            onRemove={onRemoveAttachment}
          />
        ) : null}
      </TaskFormSection>

      {error ? <TaskModalError message={error} /> : null}

      <div className={TASKS_THEME.dialog.footer}>
        <TaskModalActions
          onCancel={onCancel}
          submitLabel="Create task"
          loadingLabel="Creating…"
          isLoading={isLoading}
          submitDisabled={!title.trim()}
        />
      </div>
    </>
  )
}
