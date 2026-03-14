import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CreativeEditorTabs } from './creative-editor-tabs'

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
  it('formats performance summary spend and revenue using the provided currency', () => {
    const markup = renderToStaticMarkup(
      <CreativeEditorTabs
        providerId="google"
        creative={{
          providerId: 'google',
          creativeId: 'creative-1',
          campaignId: 'campaign-1',
          name: 'Creative 1',
          type: 'IMAGE',
          status: 'ACTIVE',
          headlines: ['Headline'],
          descriptions: ['Description'],
        }}
        copiedField={null}
        onCopy={vi.fn()}
        isEditing={false}
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
        days="7"
        onChangeDays={vi.fn()}
        metricsLoading={false}
        metricsError={null}
        currency="GBP"
        performanceSummary={{
          totalSpend: 1234,
          totalRevenue: 2468,
          totalImpressions: 10000,
          totalClicks: 420,
          totalConversions: 24,
          averageRoaS: 2,
          averageCpc: 3,
          averageCtr: 4,
          averageConvRate: 5,
          providerId: 'facebook',
          period: 'current',
          dayCount: 7,
          ctr: 4.2,
          roas: 2,
          cpc: 3,
        }}
        efficiencyScore={82}
        onRefreshPerformance={vi.fn()}
        algorithmicInsights={[]}
      />,
    )

    expect(markup).toContain('£1,234')
    expect(markup).toContain('£2,468')
    expect(markup).not.toContain('$1,234')
  })
})