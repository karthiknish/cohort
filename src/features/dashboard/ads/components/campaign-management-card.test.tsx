import type { ComponentProps, ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'

import { CampaignManagementCard } from './campaign-management-card'

vi.mock('convex/react', () => ({
  useAction: () => vi.fn(async () => []),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

vi.mock('@/shared/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { agencyId: 'agency-1' },
  }),
}))

vi.mock('@/shared/contexts/client-context', () => ({
  useClientContext: () => ({
    selectedClientId: null,
  }),
}))

vi.mock('@/shared/ui/use-toast', () => ({
  toast: vi.fn(),
}))

vi.mock('@/shared/ui/data-table', () => ({
  DataTable: ({ data }: { data: unknown[] }) => <div>Rows: {data.length}</div>,
  DataTableColumnHeader: ({ title }: { title: string }) => <span>{title}</span>,
}))

vi.mock('@/shared/ui/state-wrapper', () => ({
  StateWrapper: ({ children, emptyTitle, isEmpty, isLoading }: {
    children: ReactNode
    emptyTitle: string
    isEmpty: boolean
    isLoading: boolean
  }) => {
    if (isLoading) return <div>Loading table</div>
    if (isEmpty) return <div>{emptyTitle}</div>
    return <>{children}</>
  },
}))

vi.mock('@/shared/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/shared/ui/tabs', () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}))

function renderCard(overrides: Partial<ComponentProps<typeof CampaignManagementCard>> = {}) {
  return renderToStaticMarkup(
    <CampaignManagementCard
      providerId="google"
      providerName="Google Ads"
      isConnected
      dateRange={{
        start: new Date('2026-01-01T00:00:00.000Z'),
        end: new Date('2026-01-31T00:00:00.000Z'),
      }}
      {...overrides}
    />,
  )
}

describe('CampaignManagementCard composition', () => {
  it('renders the disconnected state', () => {
    const markup = renderCard({ isConnected: false })

    expect(markup).toContain('Campaign Management')
    expect(markup).toContain('Connect Google Ads to manage campaigns')
  })

  it('renders the setup-required state', () => {
    const markup = renderCard({
      setupRequired: true,
      setupTitle: 'Complete Google Ads setup',
      setupDescription: 'Finish configuration before managing campaigns.',
    })

    expect(markup).toContain('Complete Google Ads setup')
    expect(markup).toContain('Finish configuration before managing campaigns.')
  })

  it('renders the linkedin header tabs and empty campaigns state', () => {
    const markup = renderCard({
      providerId: 'linkedin',
      providerName: 'LinkedIn Ads',
    })

    expect(markup).toContain('Campaigns')
    expect(markup).toContain('Group (Ad Sets)')
    expect(markup).toContain('No campaigns found')
  })
})