import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { TaskCreationModalFormFields } from './task-creation-modal-form'

describe('TaskCreationModalFormFields', () => {
  it('renders modal form sections and summaries', () => {
    const markup = renderToStaticMarkup(
      <TaskCreationModalFormFields
        title="Plan launch retro"
        description="Prepare questions and stakeholders."
        priority="urgent"
        dueDate="2026-03-20"
        projectName="Spring Launch"
        clientName="Acme Corp"
        assigneeCount={2}
        error={null}
        isLoading={false}
        pendingAttachments={[]}
        fileInputRef={{ current: null }}
        onTitleChange={vi.fn()}
        onDescriptionChange={vi.fn()}
        onPriorityChange={vi.fn()}
        onDateSelect={vi.fn()}
        onAddAttachments={vi.fn()}
        onRemoveAttachment={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(markup).toContain('Task Title *')
    expect(markup).toContain('Plan launch retro')
    expect(markup).toContain('Acme Corp')
    expect(markup).toContain('2 user(s)')
    expect(markup).toContain('Create Task')
  })
})