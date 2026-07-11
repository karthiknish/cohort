'use client';
import { useCallback, useMemo, useState } from 'react';
import { useConvexAuth, useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { adsIntegrationsApi } from '@/lib/convex-api';
import { useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { PROVIDER_IDS } from '../components/constants';
import type { ConvexIntegrationStatusRow, UseAdsConnectionsOptions, UseAdsConnectionsReturn, } from './ads-connections-types';
import { buildAdPlatforms, buildIntegrationStatusMap, deriveConnectedProviders, mapConvexIntegrationStatuses, providerNeedsAccountSelection, } from './use-ads-connections.helpers';
import { useAdsConnectionActions } from './use-ads-connection-actions';
import { useAdsOauthCallback } from './use-ads-oauth-callback';
import { useAdsProviderSetup } from './use-ads-provider-setup';
export type { DisconnectOptions, GoogleAdAccountOption, IntegrationStatusInfo, MetaAdAccountOption, LinkedInAdAccountOption, UseAdsConnectionsOptions, UseAdsConnectionsReturn, } from './ads-connections-types';
export function useAdsConnections(options: UseAdsConnectionsOptions = {}): UseAdsConnectionsReturn {
    void options.onRefresh;
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const { isPreviewMode } = usePreview();
    const { isAuthenticated, isLoading: convexAuthLoading } = useConvexAuth();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const canQueryConvex = isAuthenticated && !convexAuthLoading && Boolean(user?.id);
    const convexStatuses = useQuery(adsIntegrationsApi.listStatuses, isPreviewMode || !workspaceId || !canQueryConvex
        ? 'skip'
        : { workspaceId, clientId: selectedClientId ?? null }) as ConvexIntegrationStatusRow[] | undefined;
    const connectionsQueryError = useConvexQueryError({
        data: convexStatuses,
        skipped: isPreviewMode || !workspaceId || !canQueryConvex,
        loading: convexAuthLoading,
        fallbackMessage: 'Unable to load ad integration statuses.',
    });
    const mappedStatuses = mapConvexIntegrationStatuses({
        rows: Array.isArray(convexStatuses) ? convexStatuses : [],
        isPreviewMode,
        workspaceId,
        canQueryConvex,
    });
    const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
    const [connectionErrors, setConnectionErrors] = useState<Record<string, string>>({});
    const [connectedProviderOverrides, setConnectedProviderOverrides] = useState<Record<string, boolean>>({});
    const [syncingProviders, setSyncingProviders] = useState<Record<string, boolean>>({});
    const [refreshTick, setRefreshTick] = useState(0);
    const triggerRefresh = () => {
        setRefreshTick((tick) => tick + 1);
    };
    const setup = useAdsProviderSetup({
        workspaceId,
        selectedClientId: selectedClientId ?? null,
        triggerRefresh,
    });
    const automationStatuses = mappedStatuses?.statuses ?? [];
    const integrationStatusMap = buildIntegrationStatusMap(automationStatuses);
    const metaStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.FACEBOOK);
    const googleStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.GOOGLE);
    const tiktokStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.TIKTOK);
    const linkedinStatus = automationStatuses.find((s) => s.providerId === PROVIDER_IDS.LINKEDIN);
    const metaNeedsAccountSelection = providerNeedsAccountSelection(metaStatus);
    const googleNeedsAccountSelection = providerNeedsAccountSelection(googleStatus);
    const tiktokNeedsAccountSelection = providerNeedsAccountSelection(tiktokStatus);
    const linkedinNeedsAccountSelection = providerNeedsAccountSelection(linkedinStatus);
    const googleSetupDialogOpen = setup.googleSetupUi.dialogOpen || googleNeedsAccountSelection;
    const connectedProvidersFromStatuses = deriveConnectedProviders(mappedStatuses?.statuses);
    const connectedProviders = ({ ...connectedProvidersFromStatuses, ...connectedProviderOverrides });
    const adPlatforms = buildAdPlatforms();
    useAdsOauthCallback({
        googleNeedsAccountSelection,
        metaNeedsAccountSelection,
        linkedinNeedsAccountSelection,
        googleAccountOptionsLength: setup.googleAccountOptions.length,
        metaAccountOptionsLength: setup.metaAccountOptions.length,
        linkedinAccountOptionsLength: setup.linkedinAccountOptions.length,
        loadingGoogleAccountOptions: setup.loadingGoogleAccountOptions,
        loadingMetaAccountOptions: setup.loadingMetaAccountOptions,
        loadingLinkedInAccountOptions: setup.loadingLinkedInAccountOptions,
        loadGoogleAdAccounts: setup.loadGoogleAdAccounts,
        loadMetaAdAccounts: setup.loadMetaAdAccounts,
        loadLinkedInAdAccounts: setup.loadLinkedInAdAccounts,
        initializeTikTokIntegration: setup.initializeTikTokIntegration,
        setGoogleSetupUi: setup.setGoogleSetupUi,
        setGoogleSetupMessage: setup.setGoogleSetupMessage,
        setMetaSetupMessage: setup.setMetaSetupMessage,
        setLinkedinSetupMessage: setup.setLinkedinSetupMessage,
        setConnectionErrors,
        triggerRefresh,
    });
    const actions = useAdsConnectionActions({
        workspaceId,
        selectedClientId: selectedClientId ?? null,
        convexAuthLoading,
        isAuthenticated,
        setConnectingProvider,
        setConnectionErrors,
        setConnectedProviderOverrides,
        setSyncingProviders,
        setGoogleSetupMessage: setup.setGoogleSetupMessage,
        setMetaSetupMessage: setup.setMetaSetupMessage,
        setTiktokSetupMessage: setup.setTiktokSetupMessage,
        triggerRefresh,
    });
    return {
        connectedProviders,
        connectingProvider,
        connectionErrors,
        integrationStatuses: mappedStatuses,
        connectionsQueryError,
        integrationStatusMap,
        automationStatuses,
        syncingProviders,
        googleSetupMessage: setup.googleSetupMessage,
        metaSetupMessage: setup.metaSetupMessage,
        tiktokSetupMessage: setup.tiktokSetupMessage,
        linkedinSetupMessage: setup.linkedinSetupMessage,
        initializingGoogle: setup.initializingGoogle,
        initializingMeta: setup.initializingMeta,
        initializingTikTok: setup.initializingTikTok,
        initializingLinkedIn: setup.initializingLinkedIn,
        googleNeedsAccountSelection,
        metaNeedsAccountSelection,
        tiktokNeedsAccountSelection,
        linkedinNeedsAccountSelection,
        googleAccountOptions: setup.googleAccountOptions,
        selectedGoogleAccountId: setup.selectedGoogleAccountId,
        setSelectedGoogleAccountId: setup.setSelectedGoogleAccountId,
        loadingGoogleAccountOptions: setup.loadingGoogleAccountOptions,
        googleSetupDialogOpen,
        setGoogleSetupDialogOpen: setup.setGoogleSetupDialogOpen,
        metaAccountOptions: setup.metaAccountOptions,
        selectedMetaAccountId: setup.selectedMetaAccountId,
        setSelectedMetaAccountId: setup.setSelectedMetaAccountId,
        loadingMetaAccountOptions: setup.loadingMetaAccountOptions,
        linkedinAccountOptions: setup.linkedinAccountOptions,
        selectedLinkedInAccountId: setup.selectedLinkedInAccountId,
        setSelectedLinkedInAccountId: setup.setSelectedLinkedInAccountId,
        loadingLinkedInAccountOptions: setup.loadingLinkedInAccountOptions,
        handleConnect: actions.handleConnect,
        handleDisconnect: actions.handleDisconnect,
        handleOauthRedirect: actions.handleOauthRedirect,
        handleSyncNow: actions.handleSyncNow,
        initializeGoogleIntegration: setup.initializeGoogleIntegration,
        initializeMetaIntegration: setup.initializeMetaIntegration,
        initializeTikTokIntegration: setup.initializeTikTokIntegration,
        initializeLinkedInIntegration: setup.initializeLinkedInIntegration,
        reloadGoogleAccountOptions: setup.loadGoogleAdAccounts,
        reloadMetaAccountOptions: setup.loadMetaAdAccounts,
        reloadLinkedInAccountOptions: setup.loadLinkedInAdAccounts,
        adPlatforms,
        triggerRefresh,
        refreshTick,
    };
}
