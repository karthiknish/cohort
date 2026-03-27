'use client'

import { useCallback } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { PendingAttachmentsList } from '@/features/dashboard/collaboration/components/message-composer'
import { Button } from '@/shared/ui/button'
import { Calendar } from '@/shared/ui/calendar'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { MentionInput } from '@/shared/ui/mention-input'
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
import type { TaskPriority, TaskStatus } from '@/types/tasks'

import { isTaskDueDateDisabled, type TaskFormState } from './task-types'

type MentionableUsers = Array<{ id: string; name: string; role?: string }>

type TaskSheetFieldsProps = {
  ids: {
    title: string
    description: string
    status: string
    priority: string
    client: string
    project: string
    dueDate: string
  }
  formState: TaskFormState
  setFormState: Dispatch<SetStateAction<TaskFormState>>
  disabled: boolean
  mentionableUsers: MentionableUsers
  titlePlaceholder: string
  clientPlaceholder: string
  projectPlaceholder: string
  clientHelpText?: string
  projectHelpText?: string
  dueDateLayout?: 'compact' | 'full'
}

export function TaskSheetFields({
  ids,
  formState,
  setFormState,
  disabled,
  mentionableUsers,
  titlePlaceholder,
  clientPlaceholder,
  projectPlaceholder,
  clientHelpText,
  projectHelpText,
  dueDateLayout = 'full',
}: TaskSheetFieldsProps) {
  const handleDueDateSelect = useCallback(
    (date: Date | undefined) => {
      setFormState((prev) => ({
        ...prev,
        dueDate: date ? format(date, 'yyyy-MM-dd') : '',
      }))
    },
    [setFormState]
  )

  const dueDateField = (
    <div className="space-y-2">
      <Label htmlFor={ids.dueDate}>Due date</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={ids.dueDate}
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !formState.dueDate && 'text-muted-foreground'
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formState.dueDate ? format(parseISO(formState.dueDate), 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={formState.dueDate ? parseISO(formState.dueDate) : undefined}
            disabled={isTaskDueDateDisabled}
            onSelect={handleDueDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )

  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({ ...prev, title: event.target.value }))
    },
    [setFormState]
  )

  const handleDescriptionChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormState((prev) => ({ ...prev, description: event.target.value }))
    },
    [setFormState]
  )

  const handleStatusChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, status: value as TaskStatus }))
    },
    [setFormState]
  )

  const handlePriorityChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, priority: value as TaskPriority }))
    },
    [setFormState]
  )

  const handleAssignedToChange = useCallback(
    (value: string) => {
      setFormState((prev) => ({ ...prev, assignedTo: value }))
    },
    [setFormState]
  )

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor={ids.title}>Title</Label>
        <Input
          id={ids.title}
          value={formState.title}
          onChange={handleTitleChange}
          placeholder={titlePlaceholder}
          required
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.description}>Description</Label>
        <Textarea
          id={ids.description}
          value={formState.description}
          onChange={handleDescriptionChange}
          placeholder="Add context, goals, or next steps"
          rows={4}
          disabled={disabled}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={ids.status}>Status</Label>
          <Select
            value={formState.status}
            onValueChange={handleStatusChange}
            disabled={disabled}
          >
            <SelectTrigger id={ids.status}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To do</SelectItem>
              <SelectItem value="in-progress">In progress</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor={ids.priority}>Priority</Label>
          <Select
            value={formState.priority}
            onValueChange={handlePriorityChange}
            disabled={disabled}
          >
            <SelectTrigger id={ids.priority}>
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
      </div>

      <div className="space-y-2">
        <Label>Assigned to</Label>
        <MentionInput
          value={formState.assignedTo}
          onChange={handleAssignedToChange}
          users={mentionableUsers}
          placeholder="Type @ to assign teammates or admins"
          disabled={disabled}
          allowMultiple
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={ids.client}>Client</Label>
          <Input
            id={ids.client}
            value={formState.clientName}
            placeholder={clientPlaceholder}
            readOnly
            disabled
          />
          {clientHelpText ? <p className="text-xs text-muted-foreground">{clientHelpText}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor={ids.project}>Project</Label>
          <Input
            id={ids.project}
            value={formState.projectName}
            placeholder={projectPlaceholder}
            readOnly
            disabled
          />
          {projectHelpText ? <p className="text-xs text-muted-foreground">{projectHelpText}</p> : null}
        </div>
      </div>

      {dueDateLayout === 'compact' ? <div className="grid gap-4 sm:grid-cols-2">{dueDateField}</div> : dueDateField}
    </>
  )
}

type TaskSheetAttachmentsSectionProps = {
  disabled: boolean
  pendingAttachments: PendingTaskAttachment[]
  onAddAttachments: (files: FileList | null) => void
  onRemoveAttachment: (attachmentId: string) => void
  fileInputRef: RefObject<HTMLInputElement | null>
}

export function TaskSheetAttachmentsSection({
  disabled,
  pendingAttachments,
  onAddAttachments,
  onRemoveAttachment,
  fileInputRef,
}: TaskSheetAttachmentsSectionProps) {
  const handleAttachFilesClick = useCallback(() => {
    fileInputRef.current?.click()
  }, [fileInputRef])

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onAddAttachments(event.target.files)
      event.currentTarget.value = ''
    },
    [onAddAttachments]
  )

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>Attachments</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={handleAttachFilesClick}
          disabled={disabled}
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
        onChange={handleFileInputChange}
      />

      {pendingAttachments.length > 0 ? (
        <PendingAttachmentsList
          attachments={pendingAttachments}
          uploading={disabled}
          onRemove={onRemoveAttachment}
        />
      ) : (
        <p className="text-xs text-muted-foreground">Add up to 10 files (max 15MB each).</p>
      )}
    </div>
  )
}