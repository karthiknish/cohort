'use client'

import { useCallback, type RefObject } from 'react'
import { Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { PendingAttachmentsList } from '@/features/dashboard/collaboration/components/message-composer'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
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

import { isTaskDueDateDisabled } from './task-types'

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
  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onTitleChange(event.target.value)
  }, [onTitleChange])

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onDescriptionChange(event.target.value)
  }, [onDescriptionChange])

  const handlePriorityChange = useCallback((value: string) => {
    onPriorityChange(value as TaskPriority)
  }, [onPriorityChange])

  const handleOpenFileDialog = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleFilesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onAddAttachments(event.target.files)
    event.currentTarget.value = ''
  }, [onAddAttachments])

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="title">Task Title *</Label>
        <Input
          id="title"
          placeholder="Enter task title…"
          value={title}
          onChange={handleTitleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Enter task description…"
          value={description}
          onChange={handleDescriptionChange}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select value={priority} onValueChange={handlePriorityChange}>
            <SelectTrigger id="priority">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="dueDate"
                variant="outline"
                className={cn('w-full justify-start text-left font-normal', !dueDate && 'text-muted-foreground')}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
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
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Client</Label>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">{clientName || 'None'}</div>
        </div>

        <div className="space-y-2">
          <Label>Project</Label>
          <div className="rounded-md bg-muted px-3 py-2 text-sm">{projectName || 'None'}</div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Assigned To</Label>
        <div className="rounded-md bg-muted px-3 py-2 text-sm">{assigneeCount > 0 ? `${assigneeCount} user(s)` : 'Unassigned'}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Attachments</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isLoading}
            onClick={handleOpenFileDialog}
          >
            <Paperclip className="h-4 w-4" />
            Attach files
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFilesChange}
        />

        {pendingAttachments.length > 0 ? (
          <PendingAttachmentsList
            attachments={pendingAttachments}
            uploading={isLoading}
            onRemove={onRemoveAttachment}
          />
        ) : (
          <p className="text-xs text-muted-foreground">Add up to 10 files (max 15MB each).</p>
        )}
      </div>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading || !title.trim()}>
          {isLoading ? 'Creating…' : 'Create Task'}
        </Button>
      </div>
    </>
  )
}