import { renderToStaticMarkup } from 'react-dom/server'
import type { ReactNode } from 'react'

import { describe, expect, it, vi } from 'vitest'

vi.mock('@/components/ui/data-table', () => ({
  DataTable: ({ data }: { data: unknown[] }) => <div>Rows: {data.length}</div>,
}))

vi.mock('@/components/ui/state-wrapper', () => ({
  StateWrapper: ({ children, emptyTitle, isEmpty }: { children: ReactNode; emptyTitle: string; isEmpty: boolean }) =>
    isEmpty ? <div>{emptyTitle}</div> : children,
}))

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ title, description, action }: { title: string; description: string; action?: { label: string } }) => (
    <div>
      <div>{title}</div>
      <div>{description}</div>
      {action ? <button type="button">{action.label}</button> : null}
    </div>
  ),
}))

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children }: { children: ReactNode }) => <button type="button">{children}</button>,
}))

vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipProvider: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}))

import {
  BiddingStrategyDialog,
  BudgetUpdateDialog,
  CampaignManagementConnectedView,
  CampaignManagementDisconnectedState,
  CampaignGroupRowActions,
  CampaignManagementHeader,
  CampaignManagementSetupState,
  CampaignManagementTableSection,
  CampaignRowActions,
} from './campaign-management-card-sections'

describe('campaign management card sections', () => {
  it('renders the header, tables, and row actions', () => {
    const markup = renderToStaticMarkup(
      <>
        <CampaignManagementHeader
          isRefreshing={true}
          onRefresh={vi.fn()}
          onViewChange={vi.fn()}
          providerId="linkedin"
          providerName="LinkedIn Ads"
          view="groups"
        />
        <CampaignManagementTableSection
          campaignColumns={[]}
          campaigns={[]}
          groupColumns={[]}
          groups={[{ id: 'g1', name: 'Group 1', status: 'enabled', totalBudget: 100, currency: 'USD' }]}
          groupsLoading={false}
          loading={false}
          onRowClick={vi.fn()}
          providerName="LinkedIn Ads"
          view="groups"
        />
        <CampaignRowActions
          actionLoading={null}
          campaign={{ id: 'c1', name: 'Campaign 1', providerId: 'google', status: 'enabled' }}
          onAction={vi.fn(async () => {})}
          onOpenBiddingDialog={vi.fn()}
          onOpenBudgetDialog={vi.fn()}
        />
        <CampaignGroupRowActions
          actionLoading={null}
          group={{ id: 'g1', name: 'Group 1', status: 'paused' }}
          onAction={vi.fn(async () => {})}
          onOpenBudgetDialog={vi.fn()}
        />
      </>,
    )

    expect(markup).toContain('Campaign Management')
    expect(markup).toContain('Group (Ad Sets)')
    expect(markup).toContain('Refresh')
    expect(markup).toContain('Rows: 1')
    expect(markup).toContain('Pause campaign')
    expect(markup).toContain('Enable campaign group')
  })

  it('renders the budget and bidding dialogs', () => {
    const markup = renderToStaticMarkup(
      <>
        <BudgetUpdateDialog
          currencyCode="USD"
          currencyLabel="$ USD"
          isSubmitting={false}
          onBudgetChange={vi.fn()}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
          open={true}
          targetName="Campaign 1"
          value="100"
        />
        <BiddingStrategyDialog
          isSubmitting={false}
          onChange={vi.fn()}
          onOpenChange={vi.fn()}
          onSubmit={vi.fn()}
          open={true}
          selectedCampaignName="Campaign 1"
          value={{ type: 'TARGET_CPA', value: '50' }}
        />
      </>,
    )

    expect(markup).toContain('Update Budget')
    expect(markup).toContain('New Budget ($ USD)')
    expect(markup).toContain('Update bidding strategy for Campaign 1')
    expect(markup).toContain('Strategy Type')
    expect(markup).toContain('Update Bidding')
  })

  it('renders the disconnected, setup, and connected layout shells', () => {
    const markup = renderToStaticMarkup(
      <>
        <CampaignManagementDisconnectedState providerName="LinkedIn Ads" />
        <CampaignManagementSetupState
          onSetupAction={vi.fn()}
          providerName="LinkedIn Ads"
          setupActionLabel="Complete setup"
          setupDescription="Finish setup first"
          setupTitle="Complete LinkedIn Ads setup"
        />
        <CampaignManagementConnectedView
          actionLoading={null}
          biddingDialogOpen={false}
          budgetDialogOpen={false}
          campaignColumns={[]}
          campaigns={[]}
          groupColumns={[]}
          groups={[]}
          groupsLoading={false}
          loading={false}
          newBidding={{ type: 'TARGET_CPA', value: '50' }}
          newBudget="100"
          onBiddingChange={vi.fn()}
          onBiddingOpenChange={vi.fn()}
          onBudgetChange={vi.fn()}
          onBudgetOpenChange={vi.fn()}
          onRefresh={vi.fn()}
          onRowClick={vi.fn()}
          onSubmitBidding={vi.fn()}
          onSubmitBudget={vi.fn()}
          onViewChange={vi.fn()}
          providerId="linkedin"
          providerName="LinkedIn Ads"
          selectedCampaignName="Campaign 1"
          selectedCurrencyCode="USD"
          selectedCurrencyLabel="$ USD"
          selectedTargetName="Campaign 1"
          view="campaigns"
        />
      </>,
    )

    expect(markup).toContain('Connect LinkedIn Ads to manage campaigns')
    expect(markup).toContain('Complete LinkedIn Ads setup')
    expect(markup).toContain('Finish setup first')
    expect(markup).toContain('Complete setup')
    expect(markup).toContain('No campaigns found')
  })
})