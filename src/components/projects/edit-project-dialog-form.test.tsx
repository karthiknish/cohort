import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { EditProjectFormFields } from './edit-project-dialog-form'

describe('EditProjectFormFields', () => {
  it('renders the main fields and tag summary', () => {
    const markup = renderToStaticMarkup(
      <EditProjectFormFields
        loading={false}
        name="Website refresh"
        description="Refresh the public site."
        status="active"
        clientId="client-1"
        startDate={new Date('2026-03-01T00:00:00.000Z')}
        endDate={new Date('2026-03-31T00:00:00.000Z')}
        tags={['design', 'marketing']}
        tagInput="seo"
        validationErrors={{}}
        clients={[{ id: 'client-1', name: 'Acme Corp' }]}
        onDispatch={vi.fn()}
        onAddTag={vi.fn()}
        onRemoveTag={vi.fn()}
        onTagKeyDown={vi.fn()}
        formatStatusLabel={(value) => value}
      />,
    )

    expect(markup).toContain('Project name')
    expect(markup).toContain('Description')
    expect(markup).toContain('Client / Workspace')
    expect(markup).toContain('2/10 tags')
    expect(markup).toContain('Website refresh')
  })
})
