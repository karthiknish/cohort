import type { AdPlatform, IntegrationStatus, IntegrationStatusResponse } from '../components/types';
export const RAW_ADS_PROVIDER_IDS = new Set(['google', 'facebook', 'linkedin', 'tiktok']);
export type ConvexIntegrationStatusRow = {
    providerId: string;
    clientId: string | null;
    accountId: string | null;
    accountName: string | null;
    currency: string | null;
    lastSyncStatus: string | null;
    lastSyncMessage: string | null;
    lastSyncedAtMs: number | null;
    lastSyncRequestedAtMs: number | null;
    linkedAtMs: number | null;
    autoSyncEnabled: boolean | null;
    syncFrequencyMinutes: number | null;
    scheduledTimeframeDays: number | null;
    metaUseAsyncInsights?: boolean | null;
};
export type MetaAdAccountOption = {
    id: string;
    name: string;
    currency: string | null;
    accountStatus: number | null;
    isActive: boolean;
};
export type GoogleAdAccountOption = {
    id: string;
    name: string;
    currencyCode: string | null;
    isManager: boolean;
    isTestAccount: boolean;
    loginCustomerId: string | null;
    managerCustomerId: string | null;
};
export type LinkedInAdAccountOption = {
    id: string;
    name: string;
    currency: string | null;
    status: string | null;
    isActive: boolean;
};
export type DisconnectOptions = {
    clearHistoricalData?: boolean;
};
export interface UseAdsConnectionsOptions {
    /** @deprecated Pass `refreshTick` from this hook into `useAdsMetrics({ refreshTick })` instead. */
    onRefresh?: () => void;
}
export interface IntegrationStatusInfo {
    lastSyncedAt?: string | null;
    lastSyncRequestedAt?: string | null;
    status?: string;
    accountId?: string | null;
    accountName?: string | null;
    currency?: string | null;
}
export interface UseAdsConnectionsReturn {
    connectedProviders: Record<string, boolean>;
    connectingProvider: string | null;
    connectionErrors: Record<string, string>;
    connectionsQueryError: string | null;
    integrationStatuses: IntegrationStatusResponse | null;
    integrationStatusMap: Record<string, IntegrationStatusInfo>;
    automationStatuses: IntegrationStatus[];
    syncingProviders: Record<string, boolean>;
    googleSetupMessage: string | null;
    metaSetupMessage: string | null;
    tiktokSetupMessage: string | null;
    linkedinSetupMessage: string | null;
    initializingGoogle: boolean;
    initializingMeta: boolean;
    initializingTikTok: boolean;
    initializingLinkedIn: boolean;
    googleNeedsAccountSelection: boolean;
    metaNeedsAccountSelection: boolean;
    tiktokNeedsAccountSelection: boolean;
    linkedinNeedsAccountSelection: boolean;
    googleAccountOptions: GoogleAdAccountOption[];
    selectedGoogleAccountId: string;
    setSelectedGoogleAccountId: (accountId: string) => void;
    loadingGoogleAccountOptions: boolean;
    googleSetupDialogOpen: boolean;
    setGoogleSetupDialogOpen: (open: boolean) => void;
    metaAccountOptions: MetaAdAccountOption[];
    selectedMetaAccountId: string;
    setSelectedMetaAccountId: (accountId: string) => void;
    loadingMetaAccountOptions: boolean;
    linkedinAccountOptions: LinkedInAdAccountOption[];
    selectedLinkedInAccountId: string;
    setSelectedLinkedInAccountId: (accountId: string) => void;
    loadingLinkedInAccountOptions: boolean;
    handleConnect: (providerId: string, action: () => Promise<void>) => Promise<void>;
    handleDisconnect: (providerId: string, options?: DisconnectOptions) => Promise<void>;
    handleOauthRedirect: (providerId: string) => Promise<void>;
    handleSyncNow: (providerId: string) => Promise<void>;
    initializeGoogleIntegration: (clientIdOverride?: string | null, accountIdOverride?: string | null) => Promise<void>;
    initializeMetaIntegration: (clientIdOverride?: string | null, accountIdOverride?: string | null) => Promise<void>;
    initializeTikTokIntegration: (clientIdOverride?: string | null) => Promise<void>;
    initializeLinkedInIntegration: (clientIdOverride?: string | null, accountIdOverride?: string | null) => Promise<void>;
    reloadGoogleAccountOptions: (clientIdOverride?: string | null) => Promise<GoogleAdAccountOption[]>;
    reloadMetaAccountOptions: (clientIdOverride?: string | null) => Promise<MetaAdAccountOption[]>;
    reloadLinkedInAccountOptions: (clientIdOverride?: string | null) => Promise<LinkedInAdAccountOption[]>;
    adPlatforms: AdPlatform[];
    triggerRefresh: () => void;
    refreshTick: number;
}
