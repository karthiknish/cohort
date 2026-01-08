'use client'

import type { FormEvent, Dispatch, SetStateAction } from 'react'
import { LoaderCircle, Calendar as CalendarIcon } from 'lucide-react'
import { format, parseISO, isValid } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import type { ClientTeamMember } from '@/types/clients'
import { TaskFormState } from './task-types'
import { TaskCommentsPanel } from './task-comments'

export type CreateTaskSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  formState: TaskFormState
  setFormState: Dispatch<SetStateAction<TaskFormState>>
  creating: boolean
  createError: string | null
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export function CreateTaskSheet({
  open,
  onOpenChange,
  formState,
  setFormState,
  creating,
  createError,
  onSubmit,
}: CreateTaskSheetProps) {
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
                autoFocus
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
              <Label htmlFor="task-assigned">Assigned to</Label>
              <Input
                id="task-assigned"
                value={formState.assignedTo}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, assignedTo: event.target.value }))
                }
                placeholder="Separate multiple names with commas"
                disabled={creating}
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
                      onSelect={(date) =>
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
              <Label htmlFor="task-tags">Tags</Label>
              <Input
                id="task-tags"
                value={formState.tags}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="Separate tags with commas"
                disabled={creating}
              />
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
  participants: ClientTeamMember[]
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
                autoFocus
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
              <Label htmlFor="edit-task-assignees">Assigned to</Label>
              <Input
                id="edit-task-assignees"
                value={formState.assignedTo}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, assignedTo: event.target.value }))
                }
                placeholder="e.g. Alice, Bob (comma separated)"
                disabled={updating}
              />
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
                    onSelect={(date) =>
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
            <div className="space-y-2">
              <Label htmlFor="edit-task-tags">Tags</Label>
              <Input
                id="edit-task-tags"
                value={formState.tags}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, tags: event.target.value }))
                }
                placeholder="e.g. urgent, marketing (comma separated)"
                disabled={updating}
              />
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
