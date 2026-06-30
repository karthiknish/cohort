import type { CampaignAd, CreativePerformanceMetrics, CreativeSortKey } from './campaign-creative-metrics';
export type { CampaignAd } from './campaign-creative-metrics';
export type Summary = {
    total: number;
    byType: Record<string, number>;
    byStatus?: Record<string, number>;
};
export type CampaignAdsSectionProps = {
    providerId: string;
    campaignId: string;
    campaignObjective?: string | null;
    clientId?: string | null;
    isPreviewMode?: boolean;
    currency?: string | null;
};
export type ViewMode = 'grid' | 'list';
export type SupportedProviderId = 'google' | 'tiktok' | 'linkedin' | 'facebook';
export type CampaignAdSetRow = {
    id: string;
    name: string;
    status: string;
};
export type CampaignAdsSectionState = {
    adSets: CampaignAdSetRow[];
    adSetDialogOpen: boolean;
    ads: CampaignAd[];
    loading: boolean;
    summary: Summary | null;
    searchQuery: string;
    typeFilter: string;
    statusFilter: string;
    hasLoaded: boolean;
    viewMode: ViewMode;
    adMetrics: Record<string, CreativePerformanceMetrics | undefined>;
    metricsLoading: boolean;
    periodDays: string;
    sortKey: CreativeSortKey;
    togglingAdSetId: string | null;
    togglingAdId: string | null;
};
export type CampaignAdsSectionAction = {
    type: 'setAdSets';
    value: CampaignAdSetRow[];
} | {
    type: 'setTogglingAdSetId';
    value: string | null;
} | {
    type: 'setAdSetDialogOpen';
    value: boolean;
} | {
    type: 'setAds';
    value: CampaignAd[];
} | {
    type: 'setLoading';
    value: boolean;
} | {
    type: 'setSummary';
    value: Summary | null;
} | {
    type: 'setSearchQuery';
    value: string;
} | {
    type: 'setTypeFilter';
    value: string;
} | {
    type: 'setStatusFilter';
    value: string;
} | {
    type: 'setHasLoaded';
    value: boolean;
} | {
    type: 'setViewMode';
    value: ViewMode;
} | {
    type: 'setAdMetrics';
    value: Record<string, CreativePerformanceMetrics | undefined>;
} | {
    type: 'setMetricsLoading';
    value: boolean;
} | {
    type: 'setPeriodDays';
    value: string;
} | {
    type: 'setSortKey';
    value: CreativeSortKey;
} | {
    type: 'setTogglingAdId';
    value: string | null;
} | {
    type: 'clearFilters';
};
export type AdMetricRow = {
    adId?: string;
    spend?: number;
    impressions?: number;
    clicks?: number;
    conversions?: number;
    revenue?: number;
};
