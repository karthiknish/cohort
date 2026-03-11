'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { CircleAlert, DollarSign, Pause, Play, RefreshCw, Trash2, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StateWrapper } from '@/components/ui/state-wrapper'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { EmptyState } from '@/components/ui/empty-state'

import type { BiddingDraft, Campaign, CampaignGroup, CampaignManagementView } from './campaign-management-card-types'

function isActiveStatus(status: string) {
  const normalized = (status || '').toLowerCase()
  return normalized === 'enabled' || normalized === 'enable' || normalized === 'active'
}

function ActionTooltipButton({
  actionLabel,
  buttonVariant = 'outline',
  disabled,
  icon,
  onClick,
}: {
  actionLabel: string
  buttonVariant?: 'outline' | 'destructive'
  disabled: boolean
  icon: ReactNode
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant={buttonVariant} size="sm" onClick={onClick} disabled={disabled} aria-label={actionLabel}>
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{actionLabel}</p>
      </TooltipContent>
    </Tooltip>
  )
}

function CampaignRowActions({
  actionLoading,
  campaign,
  onAction,
  onOpenBiddingDialog,
  onOpenBudgetDialog,
}: {
  actionLoading: string | null
  campaign: Campaign
  onAction: (campaignId: string, action: 'enable' | 'pause' | 'remove') => Promise<void>
  onOpenBiddingDialog: (campaign: Campaign) => void
  onOpenBudgetDialog: (campaign: Campaign) => void
}) {
  return (
    <TooltipProvider>
      <div className="flex items-center justify-end gap-1">
        <ActionTooltipButton
          actionLabel={isActiveStatus(campaign.status) ? 'Pause campaign' : 'Enable campaign'}
          disabled={actionLoading === campaign.id}
          icon={isActiveStatus(campaign.status) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          onClick={(event) => {
            event.stopPropagation()
            void onAction(campaign.id, isActiveStatus(campaign.status) ? 'pause' : 'enable')
          }}
        />
        <ActionTooltipButton
          actionLabel="Update budget"
          disabled={actionLoading === campaign.id}
          icon={<DollarSign className="h-4 w-4" />}
          onClick={(event) => {
            event.stopPropagation()
            onOpenBudgetDialog(campaign)
          }}
        />
        <ActionTooltipButton
          actionLabel="Bidding strategy"
          disabled={actionLoading === campaign.id}
          icon={<TrendingUp className="h-4 w-4" />}
          onClick={(event) => {
            event.stopPropagation()
            onOpenBiddingDialog(campaign)
          }}
        />
        <ActionTooltipButton
          actionLabel="Remove campaign"
          buttonVariant="destructive"
          disabled={actionLoading === campaign.id}
          icon={<Trash2 className="h-4 w-4" />}
          onClick={(event) => {
            event.stopPropagation()
            void onAction(campaign.id, 'remove')
          }}
        />
      </div>
    </TooltipProvider>
  )
}

function CampaignGroupRowActions({
  actionLoading,
  group,
  onAction,
  onOpenBudgetDialog,
}: {
  actionLoading: string | null
  group: CampaignGroup
  onAction: (groupId: string, action: 'enable' | 'pause') => Promise<void>
  onOpenBudgetDialog: (group: CampaignGroup) => void
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation()
          void onAction(group.id, isActiveStatus(group.status) ? 'pause' : 'enable')
        }}
        disabled={actionLoading === group.id}
        aria-label={isActiveStatus(group.status) ? 'Pause campaign group' : 'Enable campaign group'}
      >
        {isActiveStatus(group.status) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={(event) => {
          event.stopPropagation()
          onOpenBudgetDialog(group)
        }}
        disabled={actionLoading === group.id}
        aria-label="Update campaign group budget"
      >
        <DollarSign className="h-4 w-4" />
      </Button>
    </div>
  )
}

function CampaignManagementHeader({
  isRefreshing,
  onRefresh,
  onViewChange,
  providerId,
  providerName,
  view,
}: {
  isRefreshing: boolean
  onRefresh: () => void
  onViewChange: (view: CampaignManagementView) => void
  providerId: string
  providerName: string
  view: CampaignManagementView
}) {
  return (
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <div className="flex-1">
        <CardTitle className="text-lg">Campaign Management</CardTitle>
        <CardDescription>
          Manage {providerName} {providerId === 'linkedin' ? (view === 'groups' ? 'campaign groups' : 'campaigns') : 'campaigns'}
        </CardDescription>
        {providerId === 'linkedin' ? (
          <Tabs value={view} onValueChange={(value) => onViewChange(value as CampaignManagementView)} className="mt-4">
            <TabsList className="grid w-[300px] grid-cols-2">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="groups">Group (Ad Sets)</TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
      </div>
      <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
    </CardHeader>
  )
}

function CampaignManagementTableSection({
  campaignColumns,
  campaigns,
  groupColumns,
  groups,
  groupsLoading,
  loading,
  onRowClick,
  providerName,
  view,
}: {
  campaignColumns: ColumnDef<Campaign>[]
  campaigns: Campaign[]
  groupColumns: ColumnDef<CampaignGroup>[]
  groups: CampaignGroup[]
  groupsLoading: boolean
  loading: boolean
  onRowClick: (id: string, name: string) => void
  providerName: string
  view: CampaignManagementView
}) {
  const showingGroups = view === 'groups'
  const tableData = showingGroups ? groups : campaigns

  return (
    <StateWrapper
      isLoading={loading || groupsLoading}
      loadingVariant="skeleton-table"
      skeletonRows={5}
      skeletonColumns={showingGroups ? 3 : 6}
      isEmpty={tableData.length === 0}
      emptyTitle={`No ${showingGroups ? 'campaign groups' : 'campaigns'} found`}
      emptyDescription={`Connect ${providerName} and create ${showingGroups ? 'campaign groups' : 'campaigns'} to see them here.`}
    >
      {showingGroups ? (
        <DataTable
          columns={groupColumns}
          data={groups}
          showPagination={false}
          maxHeight={420}
          enableVirtualization={groups.length > 50}
          rowHeight={48}
          onRowClick={(row) => onRowClick(row.id, row.name)}
          rowClassName="cursor-pointer"
          getRowId={(row) => row.id}
        />
      ) : (
        <DataTable
          columns={campaignColumns}
          data={campaigns}
          showPagination={false}
          maxHeight={420}
          enableVirtualization={campaigns.length > 50}
          rowHeight={48}
          onRowClick={(row) => onRowClick(row.id, row.name)}
          rowClassName="cursor-pointer"
          getRowId={(row) => row.id}
        />
      )}
    </StateWrapper>
  )
}

function BudgetUpdateDialog({
  currencyCode,
  currencyLabel,
  isSubmitting,
  onBudgetChange,
  onOpenChange,
  onSubmit,
  open,
  targetName,
  value,
}: {
  currencyCode: string
  currencyLabel: string
  isSubmitting: boolean
  onBudgetChange: (value: string) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  open: boolean
  targetName: string | undefined
  value: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Budget</DialogTitle>
          <DialogDescription>Update the budget for {targetName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="budget">New Budget ({currencyLabel})</Label>
            <Input
              id="budget"
              type="number"
              step="0.01"
              value={value}
              onChange={(event) => onBudgetChange(event.target.value)}
              placeholder={`Enter new budget amount (${currencyCode})`}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Update Budget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function BiddingStrategyDialog({
  isSubmitting,
  onChange,
  onOpenChange,
  onSubmit,
  open,
  selectedCampaignName,
  value,
}: {
  isSubmitting: boolean
  onChange: (nextValue: BiddingDraft) => void
  onOpenChange: (open: boolean) => void
  onSubmit: () => void
  open: boolean
  selectedCampaignName: string | undefined
  value: BiddingDraft
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bidding Strategy</DialogTitle>
          <DialogDescription>Update bidding strategy for {selectedCampaignName}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="biddingType">Strategy Type</Label>
            <Input
              id="biddingType"
              value={value.type}
              onChange={(event) => onChange({ ...value, type: event.target.value })}
              placeholder="e.g. TARGET_CPA, MAXIMIZE_CONVERSIONS"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="biddingValue">Target Value / Bid Ceiling</Label>
            <Input
              id="biddingValue"
              type="number"
              step="0.01"
              value={value.value}
              onChange={(event) => onChange({ ...value, value: event.target.value })}
              placeholder="0.00"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            Update Bidding
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function CampaignManagementDisconnectedTitle({ providerName }: { providerName: string }) {
  return (
    <>
      <CardTitle className="text-lg">Campaign Management</CardTitle>
      <CardDescription>Connect {providerName} to manage campaigns</CardDescription>
    </>
  )
}

function CampaignManagementSetupTitle({ providerName }: { providerName: string }) {
  return (
    <>
      <CardTitle className="text-lg">Campaign Management</CardTitle>
      <CardDescription>Finish {providerName} setup before loading campaigns</CardDescription>
    </>
  )
}

function CampaignManagementDialogs({
  actionLoading,
  biddingDialogOpen,
  budgetDialogOpen,
  newBidding,
  newBudget,
  onBiddingChange,
  onBiddingOpenChange,
  onBudgetChange,
  onBudgetOpenChange,
  onSubmitBidding,
  onSubmitBudget,
  selectedCampaignName,
  selectedCurrencyCode,
  selectedCurrencyLabel,
  selectedTargetName,
}: {
  actionLoading: string | null
  biddingDialogOpen: boolean
  budgetDialogOpen: boolean
  newBidding: BiddingDraft
  newBudget: string
  onBiddingChange: (value: BiddingDraft) => void
  onBiddingOpenChange: (open: boolean) => void
  onBudgetChange: (value: string) => void
  onBudgetOpenChange: (open: boolean) => void
  onSubmitBidding: () => void
  onSubmitBudget: () => void
  selectedCampaignName?: string
  selectedCurrencyCode: string
  selectedCurrencyLabel: string
  selectedTargetName?: string
}) {
  return (
    <>
      <BudgetUpdateDialog
        currencyCode={selectedCurrencyCode}
        currencyLabel={selectedCurrencyLabel}
        isSubmitting={actionLoading !== null}
        onBudgetChange={onBudgetChange}
        onOpenChange={onBudgetOpenChange}
        onSubmit={onSubmitBudget}
        open={budgetDialogOpen}
        targetName={selectedTargetName}
        value={newBudget}
      />

      <BiddingStrategyDialog
        isSubmitting={actionLoading !== null}
        onChange={onBiddingChange}
        onOpenChange={onBiddingOpenChange}
        onSubmit={onSubmitBidding}
        open={biddingDialogOpen}
        selectedCampaignName={selectedCampaignName}
        value={newBidding}
      />
    </>
  )
}

function CampaignManagementDisconnectedState({ providerName }: { providerName: string }) {
  return (
    <Card>
      <CardHeader>
        <CampaignManagementDisconnectedTitle providerName={providerName} />
      </CardHeader>
    </Card>
  )
}

function CampaignManagementSetupState({
  onSetupAction,
  providerName,
  setupActionLabel,
  setupDescription,
  setupTitle,
}: {
  onSetupAction?: () => void
  providerName: string
  setupActionLabel?: string
  setupDescription?: string
  setupTitle?: string
}) {
  return (
    <Card>
      <CardHeader>
        <CampaignManagementSetupTitle providerName={providerName} />
      </CardHeader>
      <CardContent>
        <EmptyState
          icon={CircleAlert}
          variant="default"
          title={setupTitle ?? `Complete ${providerName} setup`}
          description={
            setupDescription ??
            `Finish the remaining ${providerName} configuration step before loading campaigns and controls.`
          }
          action={
            onSetupAction
              ? {
                  label: setupActionLabel ?? 'Complete setup',
                  onClick: onSetupAction,
                }
              : undefined
          }
          className="py-10"
        />
      </CardContent>
    </Card>
  )
}

function CampaignManagementConnectedView({
  actionLoading,
  biddingDialogOpen,
  budgetDialogOpen,
  campaignColumns,
  campaigns,
  groupColumns,
  groups,
  groupsLoading,
  loading,
  newBidding,
  newBudget,
  onBiddingChange,
  onBiddingOpenChange,
  onBudgetChange,
  onBudgetOpenChange,
  onRefresh,
  onRowClick,
  onSubmitBidding,
  onSubmitBudget,
  onViewChange,
  providerId,
  providerName,
  selectedCampaignName,
  selectedCurrencyCode,
  selectedCurrencyLabel,
  selectedTargetName,
  view,
}: {
  actionLoading: string | null
  biddingDialogOpen: boolean
  budgetDialogOpen: boolean
  campaignColumns: ColumnDef<Campaign>[]
  campaigns: Campaign[]
  groupColumns: ColumnDef<CampaignGroup>[]
  groups: CampaignGroup[]
  groupsLoading: boolean
  loading: boolean
  newBidding: BiddingDraft
  newBudget: string
  onBiddingChange: (value: BiddingDraft) => void
  onBiddingOpenChange: (open: boolean) => void
  onBudgetChange: (value: string) => void
  onBudgetOpenChange: (open: boolean) => void
  onRefresh: () => void
  onRowClick: (id: string, name: string) => void
  onSubmitBidding: () => void
  onSubmitBudget: () => void
  onViewChange: (view: CampaignManagementView) => void
  providerId: string
  providerName: string
  selectedCampaignName?: string
  selectedCurrencyCode: string
  selectedCurrencyLabel: string
  selectedTargetName?: string
  view: CampaignManagementView
}) {
  return (
    <>
      <Card>
        <CampaignManagementHeader
          isRefreshing={loading || groupsLoading}
          onRefresh={onRefresh}
          onViewChange={onViewChange}
          providerId={providerId}
          providerName={providerName}
          view={view}
        />
        <CardContent>
          <CampaignManagementTableSection
            campaignColumns={campaignColumns}
            campaigns={campaigns}
            groupColumns={groupColumns}
            groups={groups}
            groupsLoading={groupsLoading}
            loading={loading}
            onRowClick={onRowClick}
            providerName={providerName}
            view={view}
          />
        </CardContent>
      </Card>

      <CampaignManagementDialogs
        actionLoading={actionLoading}
        biddingDialogOpen={biddingDialogOpen}
        budgetDialogOpen={budgetDialogOpen}
        newBidding={newBidding}
        newBudget={newBudget}
        onBiddingChange={onBiddingChange}
        onBiddingOpenChange={onBiddingOpenChange}
        onBudgetChange={onBudgetChange}
        onBudgetOpenChange={onBudgetOpenChange}
        onSubmitBidding={onSubmitBidding}
        onSubmitBudget={onSubmitBudget}
        selectedCampaignName={selectedCampaignName}
        selectedCurrencyCode={selectedCurrencyCode}
        selectedCurrencyLabel={selectedCurrencyLabel}
        selectedTargetName={selectedTargetName}
      />
    </>
  )
}

export {
  BiddingStrategyDialog,
  BudgetUpdateDialog,
  CampaignManagementConnectedView,
  CampaignManagementDisconnectedState,
  CampaignGroupRowActions,
  CampaignManagementHeader,
  CampaignManagementSetupState,
  CampaignManagementTableSection,
  CampaignRowActions,
}
