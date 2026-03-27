'use client'

import { useRef, type FormEvent, type Dispatch, type SetStateAction } from 'react'
import { LoaderCircle } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/shared/ui/sheet'
import type { PendingTaskAttachment } from '@/services/task-attachments'
import { TaskCommentsPanel } from './task-comments'
import { TaskSheetAttachmentsSection, TaskSheetFields } from './task-form-sheet-sections'
import { teamMembersToMentionable, type TaskFormState, type TaskParticipant } from './task-types'

const EDIT_TASK_FIELD_IDS = {
  title: 'edit-task-title',
  description: 'edit-task-description',
  status: 'edit-task-status',
  priority: 'edit-task-priority',
  client: 'edit-task-client',
  project: 'edit-task-project',
  dueDate: 'edit-task-due-date',
}

const CREATE_TASK_FIELD_IDS = {
  title: 'task-title',
  description: 'task-description',
  status: 'task-status',
  priority: 'task-priority',
  client: 'task-client',
  project: 'task-project',
  dueDate: 'task-due-date',
}

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
            <TaskSheetFields
              ids={CREATE_TASK_FIELD_IDS}
              formState={formState}
              setFormState={setFormState}
              disabled={creating}
              mentionableUsers={mentionableUsers}
              titlePlaceholder="e.g. Prepare Q4 campaign brief"
              clientPlaceholder="Select a client from the dashboard"
              projectPlaceholder="Open tasks from a project to link them automatically"
              clientHelpText="Switch clients from the main dashboard to change this assignment."
              projectHelpText="Start from a project workspace or filtered project task view to attach tasks here."
              dueDateLayout="compact"
            />
            <TaskSheetAttachmentsSection
              disabled={creating}
              pendingAttachments={pendingAttachments}
              onAddAttachments={onAddAttachments}
              onRemoveAttachment={onRemoveAttachment}
              fileInputRef={fileInputRef}
            />
            {createError && <p className="text-sm text-destructive">{createError}</p>}
          </div>
          <SheetFooter className="sm:flex-row-reverse">
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create task'}
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
            <TaskSheetFields
              ids={EDIT_TASK_FIELD_IDS}
              formState={formState}
              setFormState={setFormState}
              disabled={updating}
              mentionableUsers={mentionableUsers}
              titlePlaceholder="Task title"
              clientPlaceholder="No client linked"
              projectPlaceholder="No project linked"
            />
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
