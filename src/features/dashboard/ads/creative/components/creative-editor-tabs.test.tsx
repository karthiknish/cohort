import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CreativeEditorTabs } from './creative-editor-tabs'

const creative = {
  providerId: 'facebook',
  creativeId: 'creative-1',
  campaignId: 'campaign-1',
  name: 'Creative 1',
  type: 'VIDEO',
  status: 'ACTIVE',
  headlines: ['Headline'],
  descriptions: ['Description'],
}

vi.mock('@/shared/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: React.ReactNode }) => <button type="button">{children}</button>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/select', () => ({
  Select: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SelectValue: () => <div />,
}))

describe('CreativeEditorTabs', () => {
  it('renders content editing without a performance tab', () => {
    const markup = renderToStaticMarkup(
      <CreativeEditorTabs
        creative={creative}
        copiedField={null}
        onCopy={vi.fn()}
        isEditing
        editedHeadlines={['Headline']}
        editedDescriptions={['Description']}
        editedCta="LEARN_MORE"
        editedLandingPage="https://example.com"
        onAddHeadline={vi.fn()}
        onRemoveHeadline={vi.fn()}
        onUpdateHeadline={vi.fn()}
        onAddDescription={vi.fn()}
        onRemoveDescription={vi.fn()}
        onUpdateDescription={vi.fn()}
        onChangeCta={vi.fn()}
        onChangeLandingPage={vi.fn()}
        algorithmicInsights={[]}
      />,
    )

    expect(markup).toContain('Headlines')
    expect(markup).toContain('Primary Text')
    expect(markup).not.toContain('Detailed Performance')
    expect(markup).not.toContain('Performance')
  })
})
