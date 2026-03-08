'use client'

import { useRef, type FormEvent, type Dispatch, type SetStateAction } from 'react'
import { LoaderCircle, Calendar as CalendarIcon, Paperclip } from 'lucide-react'
import { format, parseISO } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MentionInput } from '@/components/ui/mention-input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { TaskPriority, TaskStatus } from '@/types/tasks'
import { isTaskDueDateDisabled, TaskFormState, TaskParticipant, teamMembersToMentionable } from './task-types'
import { TaskCommentsPanel } from './task-comments'
import { PendingAttachmentsList } from '@/app/dashboard/collaboration/components/message-composer'
import type { PendingTaskAttachment } from '@/services/task-attachments'

export type CreateTaskSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  formState: TaskFormState
  setFormState: Dispatch<SetStateAction<TaskFormState>>
  creating: boolean
  createError: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  participants: TaskParticipant[]
  pendingAttachments: PendingTaskAttachment[]
  onAddAttachments: (files: FileList | null) => void
  onRemoveAttachment: (attachmentId: string) => void
}

export function CreateTaskSheet({
  open,
  onOpenChange,
  formState,
  setFormState,
  creating,
  createError,
  onSubmit,
  participants,
  pendingAttachments,
  onAddAttachments,
  onRemoveAttachment,
}: CreateTaskSheetProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const mentionableUsers = teamMembersToMentionable(participants)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md px-0">
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <SheetHeader>
            <SheetTitle>Create task</SheetTitle>
            <SheetDescription>
              Provide task details, assignments, and scheduling information.
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="e.g. Prepare Q4 campaign brief"
                required
                disabled={creating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Add context, goals, or next steps"
                rows={4}
                disabled={creating}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-status">Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, status: value as TaskStatus }))
                  }
                  disabled={creating}
                >
                  <SelectTrigger id="task-status">
                    <SelectValue />
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
                <Label htmlFor="task-priority">Priority</Label>
                <Select
                  value={formState.priority}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, priority: value as TaskPriority }))
                  }
                  disabled={creating}
                >
                  <SelectTrigger id="task-priority">
                    <SelectValue />
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
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, assignedTo: value }))
                }
                users={mentionableUsers}
                placeholder="Type @ to assign teammates or admins"
                disabled={creating}
                allowMultiple
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-client">Client</Label>
                <Input
                  id="task-client"
                  value={formState.clientName}
                  placeholder="Select a client from the dashboard"
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Switch clients from the main dashboard to change this assignment.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="task-project">Project</Label>
                <Input
                  id="task-project"
                  value={formState.projectName}
                  placeholder="Open tasks from a project to link them automatically"
                  readOnly
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Start from a project workspace or filtered project task view to attach tasks here.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="task-due-date">Due date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="task-due-date"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !formState.dueDate && 'text-muted-foreground'
                      )}
                      disabled={creating}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formState.dueDate ? (
                        format(parseISO(formState.dueDate), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formState.dueDate ? parseISO(formState.dueDate) : undefined}
                      disabled={isTaskDueDateDisabled}
                      onSelect={(date: Date | undefined) =>
                        setFormState((prev) => ({
                          ...prev,
                          dueDate: date ? format(date, 'yyyy-MM-dd') : '',
                        }))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Attachments</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={creating}
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
                onChange={(event) => {
                  onAddAttachments(event.target.files)
                  event.currentTarget.value = ''
                }}
              />

              {pendingAttachments.length > 0 ? (
                <PendingAttachmentsList
                  attachments={pendingAttachments}
                  uploading={creating}
                  onRemove={onRemoveAttachment}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Add up to 10 files (max 15MB each).
                </p>
              )}
            </div>
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <SheetFooter className="sm:flex-row-reverse">
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating...' : 'Create task'}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={creating}>
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}

export type EditTaskSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string | null
  formState: TaskFormState
  setFormState: Dispatch<SetStateAction<TaskFormState>>
  updating: boolean
  updateError: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  currentWorkspaceId: string | null
  currentUserId: string | null
  currentUserName: string | null
  currentUserRole: string | null
  participants: TaskParticipant[]
}

export function EditTaskSheet({
  open,
  onOpenChange,
  taskId,
  formState,
  setFormState,
  updating,
  updateError,
  onSubmit,
  currentWorkspaceId,
  currentUserId,
  currentUserName,
  currentUserRole,
  participants,
}: EditTaskSheetProps) {
  const mentionableUsers = teamMembersToMentionable(participants)
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full max-w-md px-0">
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <SheetHeader>
            <SheetTitle>Edit task</SheetTitle>
            <SheetDescription>Update task details, assignments, and scheduling.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-4">
            <div className="space-y-2">
              <Label htmlFor="edit-task-title">Title</Label>
              <Input
                id="edit-task-title"
                value={formState.title}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, title: event.target.value }))
                }
                placeholder="Task title"
                required
                disabled={updating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-description">Description</Label>
              <Textarea
                id="edit-task-description"
                value={formState.description}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Add context, goals, or next steps"
                rows={4}
                disabled={updating}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-task-status">Status</Label>
                <Select
                  value={formState.status}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, status: value as TaskStatus }))
                  }
                  disabled={updating}
                >
                  <SelectTrigger id="edit-task-status">
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
                <Label htmlFor="edit-task-priority">Priority</Label>
                <Select
                  value={formState.priority}
                  onValueChange={(value) =>
                    setFormState((prev) => ({ ...prev, priority: value as TaskPriority }))
                  }
                  disabled={updating}
                >
                  <SelectTrigger id="edit-task-priority">
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
                onChange={(value) =>
                  setFormState((prev) => ({ ...prev, assignedTo: value }))
                }
                users={mentionableUsers}
                placeholder="Type @ to assign teammates or admins"
                disabled={updating}
                allowMultiple
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-task-client">Client</Label>
                <Input
                  id="edit-task-client"
                  value={formState.clientName}
                  placeholder="No client linked"
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-task-project">Project</Label>
                <Input
                  id="edit-task-project"
                  value={formState.projectName}
                  placeholder="No project linked"
                  readOnly
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-task-due-date">Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-task-due-date"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formState.dueDate && 'text-muted-foreground'
                    )}
                    disabled={updating}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formState.dueDate ? (
                      format(parseISO(formState.dueDate), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formState.dueDate ? parseISO(formState.dueDate) : undefined}
                    disabled={isTaskDueDateDisabled}
                    onSelect={(date: Date | undefined) =>
                      setFormState((prev) => ({
                        ...prev,
                        dueDate: date ? format(date, 'yyyy-MM-dd') : '',
                      }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            {updateError && <p className="text-sm text-destructive">{updateError}</p>}

            {taskId ? (
              <TaskCommentsPanel
                taskId={taskId}
                workspaceId={currentWorkspaceId}
                userId={currentUserId}
                userName={currentUserName}
                userRole={currentUserRole}
                participants={participants}
              />
            ) : null}
          </div>
          <SheetFooter className="border-t px-4 py-4">
            <SheetClose asChild>
              <Button type="button" variant="outline" disabled={updating}>
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" disabled={updating}>
              {updating ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Saving…
                </span>
              ) : (
                'Save changes'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
