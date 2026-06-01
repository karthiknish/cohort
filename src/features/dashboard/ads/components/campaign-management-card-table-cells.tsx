'use client';
import type { CellContext, HeaderContext } from '@tanstack/react-table';
import { ViewTransition } from 'react';
import { formatMoney } from '@/constants/currencies';
import { DataTableColumnHeader } from '@/shared/ui/data-table';
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils';
import type { Campaign, CampaignGroup } from './campaign-management-card-types';
import { formatCampaignDateRange } from './campaign-management-card-date-utils';
import { CampaignStatusBadge } from './campaign-management-card-status-badge';
import { useCampaignManagementActions } from './campaign-management-card-table-context';
import { CampaignGroupRowActions, CampaignRowActions } from './campaign-management-card-sections';
export function CampaignNameHeader({ column }: HeaderContext<Campaign, unknown>) {
    return <DataTableColumnHeader column={column} title="Name"/>;
}
export function CampaignNameCell({ row }: CellContext<Campaign, unknown>) {
    return (<ViewTransition name={`campaign-title-${row.original.providerId}-${row.original.id}`} share="text-morph" default="none">
      <div className="flex items-center gap-2">
        <span className="font-medium hover:underline">{row.getValue('name')}</span>
        {row.original.isHistorical ? (<span className="rounded-full border border-border/60 bg-muted/40 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Historical
          </span>) : null}
      </div>
    </ViewTransition>);
}
export function CampaignStatusHeader({ column }: HeaderContext<Campaign, unknown>) {
    return <DataTableColumnHeader column={column} title="Status"/>;
}
export function CampaignStatusCell({ row }: CellContext<Campaign, unknown>) {
    return (<ViewTransition name={`campaign-status-${row.original.providerId}-${row.original.id}`} share="morph" default="none">
      <CampaignStatusBadge status={String(row.getValue('status'))}/>
    </ViewTransition>);
}
export function CampaignRunsCell({ row }: CellContext<Campaign, unknown>) {
    return <span className="text-sm text-muted-foreground">{formatCampaignDateRange(row.original.startTime, row.original.stopTime)}</span>;
}
export function CampaignBudgetHeader({ column }: HeaderContext<Campaign, unknown>) {
    return <DataTableColumnHeader column={column} title="Budget"/>;
}
export function CampaignBudgetCell({ row }: CellContext<Campaign, unknown>) {
    const budget = row.getValue('budget') as number | undefined;
    if (budget === undefined) {
        return <span className="text-muted-foreground">-</span>;
    }
    return <span>{formatMoney(budget, row.original.currency)}/{row.original.budgetType || 'day'}</span>;
}
export function CampaignObjectiveHeader({ column }: HeaderContext<Campaign, unknown>) {
    return <DataTableColumnHeader column={column} title="Objective"/>;
}
export function CampaignObjectiveCell({ row }: CellContext<Campaign, unknown>) {
    const objective = row.getValue('objective') as string | undefined;
    return <span className="capitalize text-sm text-muted-foreground">{objective?.toLowerCase().replace(/_/g, ' ') || '-'}</span>;
}
export function CampaignActionsHeader() {
    return <div className="text-right">Actions</div>;
}
export function CampaignActionsCell({ row }: CellContext<Campaign, unknown>) {
    const { actionLoading, handleAction, openCampaignBiddingDialog, openCampaignBudgetDialog } = useCampaignManagementActions();
    const isTikTok = toAdsProviderId(row.original.providerId) === 'tiktok';
    return (<CampaignRowActions actionLoading={actionLoading} biddingDisabled={isTikTok} biddingDisabledReason={isTikTok
            ? 'TikTok bidding is managed in TikTok Ads Manager (ad group level)'
            : undefined} campaign={row.original} onAction={handleAction} onOpenBiddingDialog={openCampaignBiddingDialog} onOpenBudgetDialog={openCampaignBudgetDialog}/>);
}
export function GroupNameHeader({ column }: HeaderContext<CampaignGroup, unknown>) {
    return <DataTableColumnHeader column={column} title="Name"/>;
}
export function GroupNameCell({ row }: CellContext<CampaignGroup, unknown>) {
    return <span className="font-medium hover:underline">{row.getValue('name')}</span>;
}
export function GroupStatusHeader({ column }: HeaderContext<CampaignGroup, unknown>) {
    return <DataTableColumnHeader column={column} title="Status"/>;
}
export function GroupStatusCell({ row }: CellContext<CampaignGroup, unknown>) {
    return <CampaignStatusBadge status={String(row.getValue('status'))}/>;
}
export function GroupBudgetHeader({ column }: HeaderContext<CampaignGroup, unknown>) {
    return <DataTableColumnHeader column={column} title="Budget"/>;
}
export function GroupBudgetCell({ row }: CellContext<CampaignGroup, unknown>) {
    const budget = row.getValue('totalBudget') as number | undefined;
    if (budget === undefined) {
        return <span className="text-muted-foreground">-</span>;
    }
    return <span>{formatMoney(budget, row.original.currency)} total</span>;
}
export function GroupActionsHeader() {
    return <div className="text-right">Actions</div>;
}
export function GroupActionsCell({ row }: CellContext<CampaignGroup, unknown>) {
    const { actionLoading, handleGroupAction, openGroupBudgetDialog } = useCampaignManagementActions();
    return (<CampaignGroupRowActions actionLoading={actionLoading} group={row.original} onAction={handleGroupAction} onOpenBudgetDialog={openGroupBudgetDialog}/>);
}
