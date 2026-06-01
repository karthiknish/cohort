import type { ColumnDef } from '@tanstack/react-table';
import type { Campaign, CampaignGroup } from './campaign-management-card-types';
import { CampaignActionsCell, CampaignActionsHeader, CampaignBudgetCell, CampaignBudgetHeader, CampaignNameCell, CampaignNameHeader, CampaignObjectiveCell, CampaignObjectiveHeader, CampaignRunsCell, CampaignStatusCell, CampaignStatusHeader, GroupActionsCell, GroupActionsHeader, GroupBudgetCell, GroupBudgetHeader, GroupNameCell, GroupNameHeader, GroupStatusCell, GroupStatusHeader, } from './campaign-management-card-table-cells';
export function buildCampaignColumns(): ColumnDef<Campaign>[] {
    return [
        { accessorKey: 'name', header: CampaignNameHeader, cell: CampaignNameCell },
        { accessorKey: 'status', header: CampaignStatusHeader, cell: CampaignStatusCell },
        { id: 'runs', header: 'Runs', cell: CampaignRunsCell },
        { accessorKey: 'budget', header: CampaignBudgetHeader, cell: CampaignBudgetCell },
        { accessorKey: 'objective', header: CampaignObjectiveHeader, cell: CampaignObjectiveCell },
        { id: 'actions', header: CampaignActionsHeader, cell: CampaignActionsCell },
    ];
}
export function buildGroupColumns(): ColumnDef<CampaignGroup>[] {
    return [
        { accessorKey: 'name', header: GroupNameHeader, cell: GroupNameCell },
        { accessorKey: 'status', header: GroupStatusHeader, cell: GroupStatusCell },
        { accessorKey: 'totalBudget', header: GroupBudgetHeader, cell: GroupBudgetCell },
        { id: 'actions', header: GroupActionsHeader, cell: GroupActionsCell },
    ];
}
