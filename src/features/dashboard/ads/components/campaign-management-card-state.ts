import type { BiddingDraft, Campaign, CampaignGroup, CampaignManagementView } from './campaign-management-card-types';
export type CampaignManagementState = {
    campaigns: Campaign[];
    loading: boolean;
    actionLoading: string | null;
    budgetDialogOpen: boolean;
    biddingDialogOpen: boolean;
    selectedCampaign: Campaign | null;
    selectedGroup: CampaignGroup | null;
    newBudget: string;
    newBidding: BiddingDraft;
    view: CampaignManagementView;
    groups: CampaignGroup[];
    groupsLoading: boolean;
};
export type CampaignManagementAction = {
    type: 'setCampaigns';
    campaigns: Campaign[];
} | {
    type: 'setLoading';
    loading: boolean;
} | {
    type: 'setActionLoading';
    actionLoading: string | null;
} | {
    type: 'openCampaignBudgetDialog';
    campaign: Campaign;
} | {
    type: 'openGroupBudgetDialog';
    group: CampaignGroup;
} | {
    type: 'setBudgetDialogOpen';
    open: boolean;
} | {
    type: 'resetBudgetDialog';
} | {
    type: 'openCampaignBiddingDialog';
    campaign: Campaign;
} | {
    type: 'setBiddingDialogOpen';
    open: boolean;
} | {
    type: 'closeBiddingDialog';
} | {
    type: 'setNewBudget';
    newBudget: string;
} | {
    type: 'setNewBidding';
    newBidding: BiddingDraft;
} | {
    type: 'setView';
    view: CampaignManagementView;
} | {
    type: 'setGroups';
    groups: CampaignGroup[];
} | {
    type: 'setGroupsLoading';
    groupsLoading: boolean;
};
export const INITIAL_CAMPAIGN_MANAGEMENT_STATE: CampaignManagementState = {
    campaigns: [],
    loading: false,
    actionLoading: null,
    budgetDialogOpen: false,
    biddingDialogOpen: false,
    selectedCampaign: null,
    selectedGroup: null,
    newBudget: '',
    newBidding: {
        type: '',
        value: '',
    },
    view: 'campaigns',
    groups: [],
    groupsLoading: false,
};
export function campaignManagementReducer(state: CampaignManagementState, action: CampaignManagementAction): CampaignManagementState {
    switch (action.type) {
        case 'setCampaigns':
            return { ...state, campaigns: action.campaigns };
        case 'setLoading':
            return { ...state, loading: action.loading };
        case 'setActionLoading':
            return { ...state, actionLoading: action.actionLoading };
        case 'openCampaignBudgetDialog':
            return {
                ...state,
                selectedGroup: null,
                selectedCampaign: action.campaign,
                newBudget: action.campaign.budget?.toString() || '',
                budgetDialogOpen: true,
            };
        case 'openGroupBudgetDialog':
            return {
                ...state,
                selectedCampaign: null,
                selectedGroup: action.group,
                newBudget: action.group.totalBudget?.toString() || '',
                budgetDialogOpen: true,
            };
        case 'setBudgetDialogOpen':
            return { ...state, budgetDialogOpen: action.open };
        case 'resetBudgetDialog':
            return {
                ...state,
                budgetDialogOpen: false,
                selectedCampaign: null,
                selectedGroup: null,
                newBudget: '',
            };
        case 'openCampaignBiddingDialog':
            return {
                ...state,
                selectedGroup: null,
                selectedCampaign: action.campaign,
                newBidding: {
                    type: action.campaign.biddingStrategy?.type || '',
                    value: (action.campaign.biddingStrategy?.targetCpa ||
                        action.campaign.biddingStrategy?.targetRoas ||
                        action.campaign.biddingStrategy?.bidCeiling ||
                        0).toString(),
                },
                biddingDialogOpen: true,
            };
        case 'setBiddingDialogOpen':
            return { ...state, biddingDialogOpen: action.open };
        case 'closeBiddingDialog':
            return {
                ...state,
                biddingDialogOpen: false,
                selectedCampaign: null,
            };
        case 'setNewBudget':
            return { ...state, newBudget: action.newBudget };
        case 'setNewBidding':
            return { ...state, newBidding: action.newBidding };
        case 'setView':
            return { ...state, view: action.view };
        case 'setGroups':
            return { ...state, groups: action.groups };
        case 'setGroupsLoading':
            return { ...state, groupsLoading: action.groupsLoading };
        default:
            return state;
    }
}
