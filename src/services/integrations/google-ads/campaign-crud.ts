// =============================================================================
// GOOGLE ADS CAMPAIGN CRUD - Campaign listing and mutation operations
// =============================================================================
import { googleAdsSearch, executeGoogleAdsApiRequest, buildGoogleHeaders, DEFAULT_RETRY_CONFIG } from './client';
import { asErrorMessage } from '@/lib/convex-errors';
import { GoogleAdsApiError } from './errors';
import { GOOGLE_API_BASE, } from './types';
import type { GoogleCampaign, GoogleAdsMutateResponse, GoogleAdsResult } from './types';
import type { CreateGoogleCampaignOptions } from './campaign-modules/types';
import { getGoogleObjectiveConfig } from './campaign-modules/objectives';
// =============================================================================
// LIST CAMPAIGNS
// =============================================================================
export async function listGoogleCampaigns(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    loginCustomerId?: string | null;
    statusFilter?: ('ENABLED' | 'PAUSED' | 'REMOVED')[];
    maxRetries?: number;
}): Promise<GoogleCampaign[]> {
    const { accessToken, developerToken, customerId, loginCustomerId, statusFilter = ['ENABLED', 'PAUSED'], maxRetries = 3, } = options;
    const statusCondition = statusFilter.length > 0
        ? `WHERE campaign.status IN (${statusFilter.map(s => `'${s}'`).join(', ')})`
        : '';
    const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.start_date,
      campaign.end_date,
      campaign.advertising_channel_type,
      campaign.bidding_strategy_type,
      campaign.target_cpa.target_cpa_micros,
      campaign.target_roas.target_roas,
      campaign.maximize_conversions.target_cpa_micros,
      campaign.maximize_conversion_value.target_roas,
      campaign.ad_schedule,
      campaign_budget.amount_micros,
      campaign_budget.id,
      campaign.ai_max_setting.enable_ai_max,
      campaign.ai_max_setting.bundling_required,
      campaign.contains_eu_political_advertising,
      campaign.brand_guidelines_enabled
    FROM campaign
    ${statusCondition}
    ORDER BY campaign.name
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim();
    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 1000,
        maxPages: 10,
        maxRetries,
    });
    return rows.map((row) => {
        const campaign = row.campaign as {
            id?: string;
            name?: string;
            status?: string;
            startDate?: string;
            endDate?: string;
            advertisingChannelType?: string;
            biddingStrategyType?: string;
            targetCpa?: {
                targetCpaMicros?: string;
            };
            targetRoas?: {
                targetRoas?: number;
            };
            maximizeConversions?: {
                targetCpaMicros?: string;
            };
            maximizeConversionValue?: {
                targetRoas?: number;
            };
            adSchedule?: Array<{
                dayOfWeek?: string;
                startHour?: number;
                startMinute?: string;
                endHour?: number;
                endMinute?: string;
            }>;
            // v22.0 AI Max for Search campaigns
            aiMaxSetting?: {
                enableAiMax?: boolean;
                bundlingRequired?: boolean;
            };
            // v22.0 EU political advertising
            containsEuPoliticalAdvertising?: boolean;
            // v22.0 Performance Max brand guidelines
            brandGuidelinesEnabled?: boolean;
        } | undefined;
        const budget = row.campaignBudget as {
            id?: string;
            amountMicros?: string;
        } | undefined;
        // Extract bidding strategy info
        const biddingInfo: GoogleCampaign['biddingStrategyInfo'] = {};
        if (campaign?.targetCpa?.targetCpaMicros) {
            biddingInfo.targetCpaMicros = parseInt(campaign.targetCpa.targetCpaMicros, 10);
        }
        else if (campaign?.maximizeConversions?.targetCpaMicros) {
            biddingInfo.targetCpaMicros = parseInt(campaign.maximizeConversions.targetCpaMicros, 10);
        }
        if (campaign?.targetRoas?.targetRoas) {
            biddingInfo.targetRoas = campaign.targetRoas.targetRoas;
        }
        else if (campaign?.maximizeConversionValue?.targetRoas) {
            biddingInfo.targetRoas = campaign.maximizeConversionValue.targetRoas;
        }
        // Extract schedule
        const schedule = campaign?.adSchedule?.map((s: {
            dayOfWeek?: string;
            startHour?: number;
            endHour?: number;
        }) => ({
            dayOfWeek: s.dayOfWeek ?? '',
            startHour: s.startHour ?? 0,
            endHour: s.endHour ?? 24,
        }));
        return {
            id: campaign?.id ?? '',
            name: campaign?.name ?? '',
            status: (campaign?.status ?? 'PAUSED') as 'ENABLED' | 'PAUSED' | 'REMOVED',
            budgetAmountMicros: budget?.amountMicros ? parseInt(budget.amountMicros, 10) : undefined,
            budgetId: budget?.id,
            biddingStrategyType: campaign?.biddingStrategyType,
            biddingStrategyInfo: biddingInfo,
            adSchedule: schedule,
            startDate: campaign?.startDate,
            endDate: campaign?.endDate,
            advertisingChannelType: campaign?.advertisingChannelType,
            // v22.0 AI Max for Search campaigns
            aiMaxSetting: campaign?.aiMaxSetting?.enableAiMax ? {
                enableAiMax: campaign.aiMaxSetting.enableAiMax,
                bundlingRequired: campaign.aiMaxSetting.bundlingRequired,
            } : undefined,
            // v22.0 EU political advertising self-declaration
            containsEuPoliticalAdvertising: campaign?.containsEuPoliticalAdvertising,
            // v22.0 Performance Max brand guidelines
            brandGuidelinesEnabled: campaign?.brandGuidelinesEnabled,
        };
    });
}
// =============================================================================
// CREATE CAMPAIGN
// =============================================================================
function buildCampaignBiddingFields(options: CreateGoogleCampaignOptions): Record<string, unknown> {
    const biddingType = (options.biddingStrategyType ?? '').toUpperCase();
    if (biddingType.includes('TARGET_CPA') && options.targetCpa !== undefined) {
        return {
            targetCpa: { targetCpaMicros: Math.round(options.targetCpa * 1000000).toString() },
        };
    }
    if (biddingType.includes('TARGET_ROAS') && options.targetRoas !== undefined) {
        return { targetRoas: { targetRoas: options.targetRoas } };
    }
    if (biddingType.includes('MAXIMIZE_CONVERSIONS')) {
        return options.targetCpa !== undefined
            ? { maximizeConversions: { targetCpaMicros: Math.round(options.targetCpa * 1000000).toString() } }
            : { maximizeConversions: {} };
    }
    if (biddingType.includes('MAXIMIZE_CONVERSION_VALUE')) {
        return options.targetRoas !== undefined
            ? { maximizeConversionValue: { targetRoas: options.targetRoas } }
            : { maximizeConversionValue: {} };
    }
    return { manualCpc: {} };
}
export async function createGoogleCampaign(options: CreateGoogleCampaignOptions): Promise<{
    success: boolean;
    campaignId?: string;
    budgetId?: string;
    error?: string;
}> {
    const { accessToken, developerToken, customerId, name, advertisingChannelType, status = 'PAUSED', dailyBudget, loginCustomerId, startDate, endDate, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, } = options;
    const objectiveConfig = getGoogleObjectiveConfig(options.objective);
    const channelType = advertisingChannelType || objectiveConfig?.advertisingChannelTypes[0] || 'SEARCH';
    const headers = buildGoogleHeaders({ accessToken, developerToken, loginCustomerId, contentType: 'application/json' });
    const budgetAmountMicros = dailyBudget !== undefined
        ? Math.max(Math.round(dailyBudget * 1000000), 1000000)
        : 1000000;
    let budgetResourceName: string;
    try {
        const { payload: budgetPayload } = await executeGoogleAdsApiRequest<GoogleAdsMutateResponse>({
            url: `${GOOGLE_API_BASE}/customers/${customerId}/campaignBudgets:mutate`,
            method: 'POST',
            headers,
            body: JSON.stringify({
                operations: [{
                        create: {
                            name: `${name} Budget`,
                            amountMicros: budgetAmountMicros.toString(),
                            deliveryMethod: 'STANDARD',
                            explicitlyShared: false,
                        },
                    }],
            }),
            operation: 'createGoogleCampaignBudget',
            maxRetries,
        });
        const budgetResourceNameResult = budgetPayload.results?.[0]?.resourceName;
        if (!budgetResourceNameResult) {
            return { success: false, error: 'Campaign budget resource was not returned' };
        }
        budgetResourceName = budgetResourceNameResult;
    }
    catch (error) {
        return { success: false, error: asErrorMessage(error, 'Failed to create campaign budget') };
    }
    const campaignCreate: Record<string, unknown> = {
        name,
        status,
        advertisingChannelType: channelType,
        campaignBudget: budgetResourceName,
        containsEuPoliticalAdvertising: 'DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING',
        ...buildCampaignBiddingFields(options),
    };
    if (startDate)
        campaignCreate.startDate = startDate.replace(/-/g, '');
    if (endDate)
        campaignCreate.endDate = endDate.replace(/-/g, '');
    try {
        const { payload: campaignPayload } = await executeGoogleAdsApiRequest<GoogleAdsMutateResponse>({
            url: `${GOOGLE_API_BASE}/customers/${customerId}/campaigns:mutate`,
            method: 'POST',
            headers,
            body: JSON.stringify({
                operations: [{ create: campaignCreate }],
            }),
            operation: 'createGoogleCampaign',
            maxRetries,
        });
        const campaignResourceName = campaignPayload.results?.[0]?.resourceName;
        return {
            success: true,
            campaignId: campaignResourceName?.split('/').pop(),
            budgetId: budgetResourceName.split('/').pop(),
        };
    }
    catch (error) {
        return { success: false, error: asErrorMessage(error, 'Failed to create campaign') };
    }
}
// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================
export async function updateGoogleCampaignStatus(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    campaignId: string;
    status: 'ENABLED' | 'PAUSED' | 'REMOVED';
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<{
    success: boolean;
    message?: string;
}> {
    const { accessToken, developerToken, customerId, campaignId, status, loginCustomerId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, } = options;
    const mutation = {
        operations: [{
                update: {
                    resourceName: `customers/${customerId}/campaigns/${campaignId}`,
                    status,
                },
                updateMask: 'status',
            }],
    };
    await executeGoogleAdsApiRequest<GoogleAdsMutateResponse>({
        url: `${GOOGLE_API_BASE}/customers/${customerId}/campaigns:mutate`,
        method: 'POST',
        headers: buildGoogleHeaders({ accessToken, developerToken, loginCustomerId, contentType: 'application/json' }),
        body: JSON.stringify(mutation),
        operation: 'updateGoogleCampaignStatus',
        maxRetries,
    });
    return { success: true, message: `Campaign ${status.toLowerCase()}` };
}
// =============================================================================
// UPDATE AD STATUS
// =============================================================================
export async function updateGoogleAdStatus(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    adId: string;
    adGroupId: string;
    status: 'ENABLED' | 'PAUSED' | 'REMOVED';
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<{
    success: boolean;
    message?: string;
}> {
    const { accessToken, developerToken, customerId, adId, adGroupId, status, loginCustomerId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, } = options;
    const mutation = {
        operations: [{
                update: {
                    resourceName: `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`,
                    status,
                },
                updateMask: 'status',
            }],
    };
    await executeGoogleAdsApiRequest<GoogleAdsMutateResponse>({
        url: `${GOOGLE_API_BASE}/customers/${customerId}/adGroupAds:mutate`,
        method: 'POST',
        headers: buildGoogleHeaders({ accessToken, developerToken, loginCustomerId, contentType: 'application/json' }),
        body: JSON.stringify(mutation),
        operation: 'updateGoogleAdStatus',
        maxRetries,
    });
    return { success: true, message: `Ad ${status.toLowerCase()}` };
}
// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================
export async function updateGoogleCampaignBudget(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    budgetId: string;
    amountMicros: number;
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, developerToken, customerId, budgetId, amountMicros, loginCustomerId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, } = options;
    const mutation = {
        operations: [{
                update: {
                    resourceName: `customers/${customerId}/campaignBudgets/${budgetId}`,
                    amountMicros: amountMicros.toString(),
                },
                updateMask: 'amount_micros',
            }],
    };
    await executeGoogleAdsApiRequest<GoogleAdsMutateResponse>({
        url: `${GOOGLE_API_BASE}/customers/${customerId}/campaignBudgets:mutate`,
        method: 'POST',
        headers: buildGoogleHeaders({ accessToken, developerToken, loginCustomerId, contentType: 'application/json' }),
        body: JSON.stringify(mutation),
        operation: 'updateGoogleCampaignBudget',
        maxRetries,
    });
    return { success: true };
}
// =============================================================================
// GET BUDGET ID FROM CAMPAIGN
// =============================================================================
export async function getGoogleCampaignBudgetId(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    campaignId: string;
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<string | null> {
    const { accessToken, developerToken, customerId, campaignId, loginCustomerId, maxRetries = 3, } = options;
    const query = `
    SELECT
      campaign.id,
      campaign_budget.id
    FROM campaign
    WHERE campaign.id = ${campaignId}
    LIMIT 1
  `.replace(/\s+/g, ' ').trim();
    const runSearch = async (loginId: string | null | undefined): Promise<GoogleAdsResult[]> => {
        return googleAdsSearch({
            accessToken,
            developerToken,
            customerId,
            loginCustomerId: loginId,
            query,
            pageSize: 1,
            maxPages: 1,
            maxRetries,
        });
    };
    let rows: GoogleAdsResult[] = [];
    try {
        rows = await runSearch(loginCustomerId);
    }
    catch {
        try {
            rows = await runSearch(undefined);
        }
        catch {
            return null;
        }
    }
    if (rows.length === 0)
        return null;
    const budget = rows[0]!.campaignBudget as {
        id?: string;
    } | undefined;
    return budget?.id ?? null;
}
// =============================================================================
// UPDATE CAMPAIGN BUDGET BY CAMPAIGN ID (auto-fetches budgetId)
// =============================================================================
export async function updateGoogleCampaignBudgetByCampaign(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    campaignId: string;
    amountMicros: number;
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, developerToken, customerId, campaignId, amountMicros, loginCustomerId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, } = options;
    // First, get the budget ID for this campaign
    const budgetId = await getGoogleCampaignBudgetId({
        accessToken,
        developerToken,
        customerId,
        campaignId,
        loginCustomerId,
        maxRetries,
    });
    if (!budgetId) {
        throw new GoogleAdsApiError({
            message: 'Campaign budget not found',
            httpStatus: 404,
            errorCode: 'BUDGET_NOT_FOUND',
        });
    }
    // Now update the budget
    return updateGoogleCampaignBudget({
        accessToken,
        developerToken,
        customerId,
        budgetId,
        amountMicros,
        loginCustomerId,
        maxRetries,
    });
}
// =============================================================================
// UPDATE CAMPAIGN BIDDING
// =============================================================================
export async function updateGoogleCampaignBidding(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    campaignId: string;
    biddingType: string;
    biddingValue: number;
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<{
    success: boolean;
}> {
    const { accessToken, developerToken, customerId, campaignId, biddingType, biddingValue, loginCustomerId, maxRetries = DEFAULT_RETRY_CONFIG.maxRetries, } = options;
    const update: Record<string, unknown> = {
        resourceName: `customers/${customerId}/campaigns/${campaignId}`,
    };
    let updateMask = '';
    const type = biddingType.toUpperCase();
    if (type.includes('TARGET_CPA')) {
        update.targetCpa = { targetCpaMicros: Math.round(biddingValue * 1000000).toString() };
        updateMask = 'target_cpa.target_cpa_micros';
    }
    else if (type.includes('TARGET_ROAS')) {
        update.targetRoas = { targetRoas: biddingValue };
        updateMask = 'target_roas.target_roas';
    }
    else if (type.includes('MAXIMIZE_CONVERSIONS')) {
        update.maximizeConversions = { targetCpaMicros: Math.round(biddingValue * 1000000).toString() };
        updateMask = 'maximize_conversions.target_cpa_micros';
    }
    else if (type.includes('MAXIMIZE_CONVERSION_VALUE')) {
        update.maximizeConversionValue = { targetRoas: biddingValue };
        updateMask = 'maximize_conversion_value.target_roas';
    }
    else {
        throw new GoogleAdsApiError({
            message: `Bidding strategy type ${biddingType} is not directly adjustable via this tool yet.`,
            httpStatus: 400,
            errorCode: 'UNSUPPORTED_ACTION',
        });
    }
    const mutation = {
        operations: [{
                update,
                updateMask,
            }],
    };
    await executeGoogleAdsApiRequest<GoogleAdsMutateResponse>({
        url: `${GOOGLE_API_BASE}/customers/${customerId}/campaigns:mutate`,
        method: 'POST',
        headers: buildGoogleHeaders({ accessToken, developerToken, loginCustomerId, contentType: 'application/json' }),
        body: JSON.stringify(mutation),
        operation: 'updateGoogleCampaignBidding',
        maxRetries,
    });
    return { success: true };
}
// =============================================================================
// DELETE (REMOVE) CAMPAIGN
// =============================================================================
export async function removeGoogleCampaign(options: {
    accessToken: string;
    developerToken: string;
    customerId: string;
    campaignId: string;
    loginCustomerId?: string | null;
    maxRetries?: number;
}): Promise<{
    success: boolean;
    message?: string;
}> {
    return updateGoogleCampaignStatus({
        ...options,
        status: 'REMOVED',
    });
}
