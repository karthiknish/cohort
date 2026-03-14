import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import type { TaskFormState } from './task-types'
import { TaskSheetAttachmentsSection, TaskSheetFields } from './task-form-sheet-sections'

vi.mock('@/shared/ui/mention-input', () => ({
  MentionInput: () => <div data-mention-input="true">Mention input</div>,
}))

const formState: TaskFormState = {
  title: 'Draft campaign brief',
  description: 'Add goals and next steps',
  status: 'todo',
  priority: 'high',
  assignedTo: '@alex',
  clientId: 'client-1',
  clientName: 'Acme Corp',
  projectId: 'project-1',
  projectName: 'Spring Launch',
  dueDate: '',
}

describe('task form sheet sections', () => {
  it('renders shared sheet fields with helper text', () => {
    const markup = renderToStaticMarkup(
      <TaskSheetFields
        ids={{
          title: 'task-title',
          description: 'task-description',
          status: 'task-status',
          priority: 'task-priority',
          client: 'task-client',
          project: 'task-project',
          dueDate: 'task-due-date',
        }}
        formState={formState}
        setFormState={vi.fn()}
        disabled={false}
        mentionableUsers={[{ id: 'user-1', name: 'Alex' }]}
        titlePlaceholder="e.g. Prepare Q4 campaign brief"
        clientPlaceholder="Select a client from the dashboard"
        projectPlaceholder="Open tasks from a project to link them automatically"
        clientHelpText="Switch clients from the main dashboard to change this assignment."
        projectHelpText="Start from a project workspace or filtered project task view to attach tasks here."
        dueDateLayout="compact"
      />,
    )

    expect(markup).toContain('Draft campaign brief')
    expect(markup).toContain('Mention input')
    expect(markup).toContain('Switch clients from the main dashboard')
    expect(markup).toContain('Pick a date')
  })

  it('renders the empty attachments helper', () => {
    const markup = renderToStaticMarkup(
      <TaskSheetAttachmentsSection
        disabled={false}
        pendingAttachments={[]}
        onAddAttachments={vi.fn()}
        onRemoveAttachment={vi.fn()}
        fileInputRef={{ current: null }}
      />,
    )

    expect(markup).toContain('Attach files')
    expect(markup).toContain('Add up to 10 files')
  })
})