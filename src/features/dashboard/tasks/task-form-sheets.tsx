'use client'

import { useRef, type FormEvent, type Dispatch, type SetStateAction } from 'react'
import { ListTodo, LoaderCircle, Pencil } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Sheet, SheetClose, SheetContent } from '@/shared/ui/sheet'
import type { PendingTaskAttachment } from '@/services/task-attachments'
import { TaskCommentsPanel } from './task-comments'
import { TaskSheetAttachmentsSection, TaskSheetFields } from './task-form-sheet-sections'
import { TaskModalError, TaskSheetHeader } from './task-modal-primitives'
import { TASKS_THEME } from './tasks-theme'
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
      <SheetContent side="right" className={TASKS_THEME.sheet.content}>
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <TaskSheetHeader
            icon={ListTodo}
            title="Create task"
            description="Capture work, assign teammates, and set a due date."
          />
          <div className={TASKS_THEME.sheet.body}>
            <TaskSheetFields
              ids={CREATE_TASK_FIELD_IDS}
              formState={formState}
              setFormState={setFormState}
              disabled={creating}
              mentionableUsers={mentionableUsers}
              titlePlaceholder="e.g. Prepare Q4 campaign brief"
              clientPlaceholder="Select a client from the dashboard"
              projectPlaceholder="Open tasks from a project to link automatically"
              clientHelpText="Switch clients in the header to change assignment."
              projectHelpText="Start from a project view to attach tasks here."
              dueDateLayout="compact"
              showStatus={false}
            />
            <TaskSheetAttachmentsSection
              disabled={creating}
              pendingAttachments={pendingAttachments}
              onAddAttachments={onAddAttachments}
              onRemoveAttachment={onRemoveAttachment}
              fileInputRef={fileInputRef}
            />
            {createError ? <TaskModalError message={createError} /> : null}
          </div>
          <div className={TASKS_THEME.sheet.footer}>
            <Button type="submit" disabled={creating} className={TASKS_THEME.footerPrimary}>
              {creating ? 'Creating…' : 'Create task'}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" className="h-9" disabled={creating}>
                Cancel
              </Button>
            </SheetClose>
          </div>
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
      <SheetContent side="right" className={TASKS_THEME.sheet.content}>
        <form className="flex h-full flex-col" onSubmit={onSubmit}>
          <TaskSheetHeader icon={Pencil} title="Edit task" description="Update details, assignments, and scheduling." />
          <div className={TASKS_THEME.sheet.body}>
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
            {updateError ? <TaskModalError message={updateError} /> : null}

            {taskId ? (
              <section className={TASKS_THEME.formSection}>
                <h3 className={TASKS_THEME.formSectionTitle}>Discussion</h3>
                <TaskCommentsPanel
                  taskId={taskId}
                  workspaceId={currentWorkspaceId}
                  userId={currentUserId}
                  userName={currentUserName}
                  userRole={currentUserRole}
                  participants={participants}
                />
              </section>
            ) : null}
          </div>
          <div className={TASKS_THEME.sheet.footer}>
            <Button type="submit" disabled={updating} className={TASKS_THEME.footerPrimary}>
              {updating ? (
                <span className="inline-flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Saving…
                </span>
              ) : (
                'Save changes'
              )}
            </Button>
            <SheetClose asChild>
              <Button type="button" variant="outline" className="h-9" disabled={updating}>
                Cancel
              </Button>
            </SheetClose>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
