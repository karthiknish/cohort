import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CreateProjectFormFields } from './create-project-dialog-form'

describe('CreateProjectFormFields', () => {
  it('renders the create-project fields and tag count', () => {
    const markup = renderToStaticMarkup(
      <CreateProjectFormFields
        loading={false}
        clients={[{ id: 'client-1', name: 'Acme Corp' }]}
        state={{
          name: 'Launch microsite',
          description: 'Build a campaign microsite.',
          status: 'planning',
          clientId: 'client-1',
          startDate: new Date('2026-03-01T00:00:00.000Z'),
          endDate: new Date('2026-03-15T00:00:00.000Z'),
          tags: ['launch', 'web'],
          tagInput: 'seo',
        }}
        onNameChange={vi.fn()}
        onDescriptionChange={vi.fn()}
        onStatusChange={vi.fn()}
        onClientChange={vi.fn()}
        onStartDateChange={vi.fn()}
        onEndDateChange={vi.fn()}
        onTagInputChange={vi.fn()}
        onTagKeyDown={vi.fn()}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        formatStatusLabel={(value) => value}
      />,
    )

    expect(markup).toContain('Project name')
    expect(markup).toContain('Description')
    expect(markup).toContain('Client / Workspace')
    expect(markup).toContain('Launch microsite')
    expect(markup).toContain('2/10 tags added')
  })
})