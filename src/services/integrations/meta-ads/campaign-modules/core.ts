// =============================================================================
// CAMPAIGNS CORE - Basic campaign CRUD operations
// =============================================================================
import { asErrorMessage } from '@/lib/convex-errors';
import { appendMetaAuthParams, META_API_BASE, sleep, } from '../client';
import { metaAdsClient } from '@/services/integrations/shared/base-client';
import { isMutableAdvantageState, type MetaCampaign } from '../types';
import type { CreateCampaignOptions, UpdateCampaignOptions, UpdateCampaignBiddingOptions, } from './types';
const DEPRECATED_ADVANTAGE_STATE_ERROR = 'Meta Marketing API no longer supports advantage_plus_sales or advantage_plus_app campaign mutations. Create a classic campaign instead.';
// =============================================================================
// LIST CAMPAIGNS
// =============================================================================
const DEFAULT_META_CAMPAIGN_STATUS_FILTER = [
    'ACTIVE',
    'PAUSED',
    'IN_PROCESS',
    'WITH_ISSUES',
    'ARCHIVED',
] as const;
export async function listMetaCampaigns(options: {
    accessToken: string;
    adAccountId: string;
    statusFilter?: ('ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'IN_PROCESS' | 'WITH_ISSUES')[];
    maxPages?: number;
    maxRetries?: number;
}): Promise<MetaCampaign[]> {
    const { accessToken, adAccountId, statusFilter = [...DEFAULT_META_CAMPAIGN_STATUS_FILTER], maxPages = 10, maxRetries = 3, } = options;
    const fields = ['id', 'name', 'status', 'effective_status', 'objective', 'daily_budget', 'lifetime_budget', 'start_time', 'stop_time', 'bid_strategy'].join(',');
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    let filteringJson: string | undefined;
    if (statusFilter.length > 0) {
        const filtering = [
            {
                field: 'effective_status',
                operator: 'IN',
                value: statusFilter,
            },
        ];
        filteringJson = JSON.stringify(filtering);
    }

    const fetchPage = async (page: number, after?: string): Promise<MetaCampaign[]> => {
        const params = new URLSearchParams({
            fields,
            limit: '100',
        });
        if (filteringJson) {
            params.set('filtering', filteringJson);
        }
        if (after) {
            params.set('after', after);
        }
        await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
        const url = `${META_API_BASE}/${formattedAccountId}/campaigns?${params.toString()}`;
        const { payload } = await metaAdsClient.executeRequest<{
            data?: Array<{
                id?: string;
                name?: string;
                status?: string;
                effective_status?: string;
                objective?: string;
                daily_budget?: string;
                lifetime_budget?: string;
                start_time?: string;
                stop_time?: string;
                bid_strategy?: string;
            }>;
            paging?: {
                cursors?: {
                    after?: string;
                };
                next?: string;
            };
        }>({
            url,
            operation: `listCampaigns:page${page}`,
            maxRetries,
        });
        const campaigns = Array.isArray(payload?.data) ? payload.data : [];
        const mapped = campaigns.map((c) => ({
            id: c.id ?? '',
            name: c.name ?? '',
            status: (c.effective_status ?? c.status ?? 'PAUSED') as 'ACTIVE' | 'PAUSED' | 'DELETED' | 'ARCHIVED',
            objective: c.objective,
            dailyBudget: c.daily_budget ? parseInt(c.daily_budget, 10) / 100 : undefined,
            lifetimeBudget: c.lifetime_budget ? parseInt(c.lifetime_budget, 10) / 100 : undefined,
            startTime: c.start_time,
            stopTime: c.stop_time,
            bidStrategy: c.bid_strategy,
        }));
        const nextCursor = payload?.paging?.cursors?.after ?? null;
        if (!nextCursor || page + 1 >= maxPages) {
            return mapped;
        }
        const nextPage = await fetchPage(page + 1, nextCursor);
        return [...mapped, ...nextPage];
    };
    return fetchPage(0);
}
// =============================================================================
// CREATE CAMPAIGN
// =============================================================================
export async function createMetaCampaign(options: CreateCampaignOptions): Promise<{
    success: boolean;
    campaignId?: string;
    error?: string;
}> {
    const { accessToken, adAccountId, name, objective, status = 'PAUSED', dailyBudget, lifetimeBudget, startTime, stopTime, specialAdCategories, advantageState, isAdsetBudgetSharingEnabled, maxRetries = 3, } = options;
    const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    const params = new URLSearchParams();
    params.set('name', name);
    params.set('objective', objective);
    params.set('status', status);
    if (dailyBudget !== undefined) {
        params.set('daily_budget', String(Math.round(dailyBudget * 100)));
    }
    if (lifetimeBudget !== undefined) {
        params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)));
    }
    if (startTime) {
        params.set('start_time', startTime);
    }
    if (stopTime) {
        params.set('stop_time', stopTime);
    }
    params.set('special_ad_categories', JSON.stringify(specialAdCategories && specialAdCategories.length > 0 ? specialAdCategories : []));
    // Post-v25.0 only `classic` remains valid in Marketing API mutations.
    if (advantageState) {
        if (!isMutableAdvantageState(advantageState)) {
            return {
                success: false,
                error: DEPRECATED_ADVANTAGE_STATE_ERROR,
            };
        }
        params.set('advantage_state', advantageState);
    }
    if (isAdsetBudgetSharingEnabled !== undefined) {
        params.set('is_adset_budget_sharing_enabled', String(isAdsetBudgetSharingEnabled));
    }
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${formattedAccountId}/campaigns?${params.toString()}`;
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            id?: string;
            error?: {
                message?: string;
            };
        }>({
            url,
            operation: 'createCampaign',
            method: 'POST',
            maxRetries,
        });
        if (payload?.error) {
            return {
                success: false,
                error: payload.error.message || 'Failed to create campaign',
            };
        }
        return {
            success: true,
            campaignId: payload?.id,
        };
    }
    catch (error) {
        return {
            success: false,
            error: asErrorMessage(error, 'Unknown error creating campaign'),
        };
    }
}
// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================
export async function updateMetaCampaignStatus(options: {
    accessToken: string;
    campaignId: string;
    status: 'ACTIVE' | 'PAUSED' | 'ARCHIVED' | 'DELETED';
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, campaignId, status, maxRetries = 3, } = options;
    const params = new URLSearchParams();
    params.set('status', status);
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${campaignId}?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        success?: boolean;
    }>({
        url,
        operation: 'updateCampaignStatus',
        method: 'POST',
        maxRetries,
    });
    return { success: payload?.success ?? true };
}
// =============================================================================
// UPDATE CAMPAIGN
// =============================================================================
export async function updateMetaCampaign(options: UpdateCampaignOptions): Promise<{
    success: boolean;
    error?: string;
}> {
    const { accessToken, campaignId, name, status, dailyBudget, lifetimeBudget, startTime, stopTime, maxRetries = 3, } = options;
    const params = new URLSearchParams();
    if (name !== undefined) {
        params.set('name', name);
    }
    if (status !== undefined) {
        params.set('status', status);
    }
    if (dailyBudget !== undefined) {
        params.set('daily_budget', String(Math.round(dailyBudget * 100)));
    }
    if (lifetimeBudget !== undefined) {
        params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)));
    }
    if (startTime) {
        params.set('start_time', startTime);
    }
    if (stopTime) {
        params.set('stop_time', stopTime);
    }
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${campaignId}?${params.toString()}`;
    try {
        const { payload } = await metaAdsClient.executeRequest<{
            success?: boolean;
            error?: {
                message?: string;
            };
        }>({
            url,
            operation: 'updateCampaign',
            method: 'POST',
            maxRetries,
        });
        if (payload?.error) {
            return {
                success: false,
                error: payload.error.message || 'Failed to update campaign',
            };
        }
        return { success: payload?.success ?? true };
    }
    catch (error) {
        return {
            success: false,
            error: asErrorMessage(error, 'Unknown error updating campaign'),
        };
    }
}
// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================
export async function updateMetaCampaignBudget(options: {
    accessToken: string;
    campaignId: string;
    dailyBudget?: number;
    lifetimeBudget?: number;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, campaignId, dailyBudget, lifetimeBudget, maxRetries = 3, } = options;
    const params = new URLSearchParams();
    // Meta uses cents for budget
    if (dailyBudget !== undefined) {
        params.set('daily_budget', String(Math.round(dailyBudget * 100)));
    }
    if (lifetimeBudget !== undefined) {
        params.set('lifetime_budget', String(Math.round(lifetimeBudget * 100)));
    }
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const url = `${META_API_BASE}/${campaignId}?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        success?: boolean;
    }>({
        url,
        operation: 'updateCampaignBudget',
        method: 'POST',
        maxRetries,
    });
    return { success: payload?.success ?? true };
}
// =============================================================================
// ARCHIVE (DELETE) CAMPAIGN
// =============================================================================
export async function removeMetaCampaign(options: {
    accessToken: string;
    campaignId: string;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    return updateMetaCampaignStatus({
        ...options,
        status: 'ARCHIVED', // Meta doesn't truly delete; archive the campaign
    });
}
// =============================================================================
// UPDATE CAMPAIGN BIDDING
// =============================================================================
export async function updateMetaCampaignBidding(options: UpdateCampaignBiddingOptions): Promise<{
    success: boolean;
    error?: string;
}> {
    const { accessToken, campaignId, biddingType, biddingValue, maxRetries = 3, } = options;
    if (!biddingType) {
        return { success: false, error: 'Missing biddingType for campaign bidding update' };
    }
    // 1. Fetch all ad sets for this campaign
    const params = new URLSearchParams({
        fields: 'id',
        limit: '100',
    });
    await appendMetaAuthParams({ params, accessToken, appSecret: process.env.META_APP_SECRET });
    const listUrl = `${META_API_BASE}/${campaignId}/adsets?${params.toString()}`;
    const { payload } = await metaAdsClient.executeRequest<{
        data?: Array<{
            id: string;
        }>;
    }>({
        url: listUrl,
        operation: 'listAdSetsForBidding',
        maxRetries,
    });
    const adSets = payload?.data ?? [];
    if (adSets.length === 0) {
        return { success: true }; // No ad sets to update
    }
    // 2. Update each ad set's bid strategy and amount in small concurrent chunks.
    // Meta uses "bid_amount" in cents (like budgets) if the strategy allows it.
    // Note: Some bidding strategies don't support manual bids.
    const results: { success: boolean; adSetId?: string; error?: string }[] = [];
    const chunkSize = 5;
    const chunkDelayMs = 100;
    const updateAdSetBid = async (adSet: { id: string }) => {
        const updateParams = new URLSearchParams();
        updateParams.set('bid_strategy', biddingType);
        updateParams.set('bid_amount', String(Math.round(biddingValue * 100)));
        await appendMetaAuthParams({ params: updateParams, accessToken, appSecret: process.env.META_APP_SECRET });
        const updateUrl = `${META_API_BASE}/${adSet.id}?${updateParams.toString()}`;
        try {
            await metaAdsClient.executeRequest({
                url: updateUrl,
                operation: 'updateAdSetBid',
                method: 'POST',
                maxRetries: 1, // Don't retry individual failures too much
            });
            return { success: true, adSetId: adSet.id };
        }
        catch (error) {
            return { success: false, adSetId: adSet.id, error: asErrorMessage(error, 'Failed to update ad set bid') };
        }
    };
    for (let i = 0; i < adSets.length; i += chunkSize) {
        const chunk = adSets.slice(i, i + chunkSize);
        const chunkResults = await Promise.all(chunk.map(updateAdSetBid));
        results.push(...chunkResults);
        // Pace chunks to stay well under Meta's ~100 QPS per-ad-account limit.
        if (i + chunkSize < adSets.length) {
            await sleep(chunkDelayMs);
        }
    }
    const failed = results.filter((r) => !r.success);
    if (failed.length === 0) {
        return { success: true };
    }
    const firstError = failed[0]?.error ?? `Failed to update ${failed.length} ad set(s)`;
    return { success: false, error: firstError };
}
