// =============================================================================
// GOOGLE ADS CAMPAIGN CRUD - Campaign listing and mutation operations
// =============================================================================

import { googleAdsSearch } from './client'
import { GoogleAdsApiError } from './errors'
import {
    GOOGLE_API_BASE,
    GoogleCampaign,
    GoogleAdsApiErrorResponse,
} from './types'

// =============================================================================
// LIST CAMPAIGNS
// =============================================================================

export async function listGoogleCampaigns(options: {
    accessToken: string
    developerToken: string
    customerId: string
    loginCustomerId?: string | null
    statusFilter?: ('ENABLED' | 'PAUSED' | 'REMOVED')[]
    maxRetries?: number
}): Promise<GoogleCampaign[]> {
    const {
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        statusFilter = ['ENABLED', 'PAUSED'],
        maxRetries = 3,
    } = options

    const statusCondition = statusFilter.length > 0
        ? `WHERE campaign.status IN (${statusFilter.map(s => `'${s}'`).join(', ')})`
        : ''

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
      campaign_budget.id
    FROM campaign
    ${statusCondition}
    ORDER BY campaign.name
    LIMIT 1000
  `.replace(/\s+/g, ' ').trim()

    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 1000,
        maxPages: 10,
        maxRetries,
    })

    return rows.map((row) => {
        const campaign = row.campaign as {
            id?: string
            name?: string
            status?: string
            startDate?: string
            endDate?: string
            advertisingChannelType?: string
            biddingStrategyType?: string
            targetCpa?: { targetCpaMicros?: string }
            targetRoas?: { targetRoas?: number }
            maximizeConversions?: { targetCpaMicros?: string }
            maximizeConversionValue?: { targetRoas?: number }
            adSchedule?: Array<{
                dayOfWeek?: string
                startHour?: number
                startMinute?: string
                endHour?: number
                endMinute?: string
            }>
        } | undefined

        const budget = row.campaignBudget as {
            id?: string
            amountMicros?: string
        } | undefined

        // Extract bidding strategy info
        const biddingInfo: GoogleCampaign['biddingStrategyInfo'] = {}
        if (campaign?.targetCpa?.targetCpaMicros) {
            biddingInfo.targetCpaMicros = parseInt(campaign.targetCpa.targetCpaMicros, 10)
        } else if (campaign?.maximizeConversions?.targetCpaMicros) {
            biddingInfo.targetCpaMicros = parseInt(campaign.maximizeConversions.targetCpaMicros, 10)
        }

        if (campaign?.targetRoas?.targetRoas) {
            biddingInfo.targetRoas = campaign.targetRoas.targetRoas
        } else if (campaign?.maximizeConversionValue?.targetRoas) {
            biddingInfo.targetRoas = campaign.maximizeConversionValue.targetRoas
        }

        // Extract schedule
        const schedule = campaign?.adSchedule?.map((s: { dayOfWeek?: string; startHour?: number; endHour?: number }) => ({
            dayOfWeek: s.dayOfWeek ?? '',
            startHour: s.startHour ?? 0,
            endHour: s.endHour ?? 24,
        }))

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
        }
    })
}

// =============================================================================
// UPDATE CAMPAIGN STATUS
// =============================================================================

export async function updateGoogleCampaignStatus(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId: string
    status: 'ENABLED' | 'PAUSED'
    loginCustomerId?: string | null
}): Promise<{ success: boolean; message?: string }> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        status,
        loginCustomerId,
    } = options

    const url = `${GOOGLE_API_BASE}/customers/${customerId}/campaigns:mutate`

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
        headers['login-customer-id'] = loginCustomerId
    }

    const mutation = {
        operations: [{
            update: {
                resourceName: `customers/${customerId}/campaigns/${campaignId}`,
                status,
            },
            updateMask: 'status',
        }],
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(mutation),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
        throw new GoogleAdsApiError({
            message: errorData?.error?.message ?? 'Campaign update failed',
            httpStatus: response.status,
            errorCode: 'MUTATION_ERROR',
        })
    }

    return { success: true, message: `Campaign ${status.toLowerCase()}` }
}

// =============================================================================
// UPDATE AD STATUS
// =============================================================================

export async function updateGoogleAdStatus(options: {
    accessToken: string
    developerToken: string
    customerId: string
    adId: string
    adGroupId: string
    status: 'ENABLED' | 'PAUSED'
    loginCustomerId?: string | null
}): Promise<{ success: boolean; message?: string }> {
    const {
        accessToken,
        developerToken,
        customerId,
        adId,
        adGroupId,
        status,
        loginCustomerId,
    } = options

    const url = `${GOOGLE_API_BASE}/customers/${customerId}/adGroupAds:mutate`

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
        headers['login-customer-id'] = loginCustomerId
    }

    const mutation = {
        operations: [{
            update: {
                resourceName: `customers/${customerId}/adGroupAds/${adGroupId}~${adId}`,
                status,
            },
            updateMask: 'status',
        }],
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(mutation),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
        throw new GoogleAdsApiError({
            message: errorData?.error?.message ?? 'Ad update failed',
            httpStatus: response.status,
            errorCode: 'MUTATION_ERROR',
        })
    }

    return { success: true, message: `Ad ${status.toLowerCase()}` }
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET
// =============================================================================

export async function updateGoogleCampaignBudget(options: {
    accessToken: string
    developerToken: string
    customerId: string
    budgetId: string
    amountMicros: number
    loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
    const {
        accessToken,
        developerToken,
        customerId,
        budgetId,
        amountMicros,
        loginCustomerId,
    } = options

    const url = `${GOOGLE_API_BASE}/customers/${customerId}/campaignBudgets:mutate`

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
        headers['login-customer-id'] = loginCustomerId
    }

    const mutation = {
        operations: [{
            update: {
                resourceName: `customers/${customerId}/campaignBudgets/${budgetId}`,
                amountMicros: amountMicros.toString(),
            },
            updateMask: 'amount_micros',
        }],
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(mutation),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
        throw new GoogleAdsApiError({
            message: errorData?.error?.message ?? 'Budget update failed',
            httpStatus: response.status,
            errorCode: 'MUTATION_ERROR',
        })
    }

    return { success: true }
}

// =============================================================================
// GET BUDGET ID FROM CAMPAIGN
// =============================================================================

export async function getGoogleCampaignBudgetId(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId: string
    loginCustomerId?: string | null
    maxRetries?: number
}): Promise<string | null> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        loginCustomerId,
        maxRetries = 3,
    } = options

    const query = `
    SELECT
      campaign.id,
      campaign_budget.id
    FROM campaign
    WHERE campaign.id = ${campaignId}
    LIMIT 1
  `.replace(/\s+/g, ' ').trim()

    const rows = await googleAdsSearch({
        accessToken,
        developerToken,
        customerId,
        loginCustomerId,
        query,
        pageSize: 1,
        maxPages: 1,
        maxRetries,
    })

    if (rows.length === 0) return null

    const budget = rows[0].campaignBudget as { id?: string } | undefined
    return budget?.id ?? null
}

// =============================================================================
// UPDATE CAMPAIGN BUDGET BY CAMPAIGN ID (auto-fetches budgetId)
// =============================================================================

export async function updateGoogleCampaignBudgetByCampaign(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId: string
    amountMicros: number
    loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        amountMicros,
        loginCustomerId,
    } = options

    // First, get the budget ID for this campaign
    const budgetId = await getGoogleCampaignBudgetId({
        accessToken,
        developerToken,
        customerId,
        campaignId,
        loginCustomerId,
    })

    if (!budgetId) {
        throw new GoogleAdsApiError({
            message: 'Campaign budget not found',
            httpStatus: 404,
            errorCode: 'BUDGET_NOT_FOUND',
        })
    }

    // Now update the budget
    return updateGoogleCampaignBudget({
        accessToken,
        developerToken,
        customerId,
        budgetId,
        amountMicros,
        loginCustomerId,
    })
}

// =============================================================================
// UPDATE CAMPAIGN BIDDING
// =============================================================================

export async function updateGoogleCampaignBidding(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId: string
    biddingType: string
    biddingValue: number
    loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
    const {
        accessToken,
        developerToken,
        customerId,
        campaignId,
        biddingType,
        biddingValue,
        loginCustomerId,
    } = options

    const url = `${GOOGLE_API_BASE}/customers/${customerId}/campaigns:mutate`

    const headers: Record<string, string> = {
        Authorization: `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
    }

    if (loginCustomerId) {
        headers['login-customer-id'] = loginCustomerId
    }

    const update: Record<string, unknown> = {
        resourceName: `customers/${customerId}/campaigns/${campaignId}`,
    }

    let updateMask = ''
    const type = biddingType.toUpperCase()

    if (type.includes('TARGET_CPA')) {
        update.targetCpa = { targetCpaMicros: Math.round(biddingValue * 1_000_000).toString() }
        updateMask = 'target_cpa.target_cpa_micros'
    } else if (type.includes('TARGET_ROAS')) {
        update.targetRoas = { targetRoas: biddingValue }
        updateMask = 'target_roas.target_roas'
    } else if (type.includes('MAXIMIZE_CONVERSIONS')) {
        update.maximizeConversions = { targetCpaMicros: Math.round(biddingValue * 1_000_000).toString() }
        updateMask = 'maximize_conversions.target_cpa_micros'
    } else if (type.includes('MAXIMIZE_CONVERSION_VALUE')) {
        update.maximizeConversionValue = { targetRoas: biddingValue }
        updateMask = 'maximize_conversion_value.target_roas'
    } else {
        throw new GoogleAdsApiError({
            message: `Bidding strategy type ${biddingType} is not directly adjustable via this tool yet.`,
            httpStatus: 400,
            errorCode: 'UNSUPPORTED_ACTION',
        })
    }

    const mutation = {
        operations: [{
            update,
            updateMask,
        }],
    }

    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(mutation),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as GoogleAdsApiErrorResponse
        throw new GoogleAdsApiError({
            message: errorData?.error?.message ?? 'Bidding update failed',
            httpStatus: response.status,
            errorCode: 'MUTATION_ERROR',
        })
    }

    return { success: true }
}

// =============================================================================
// DELETE (REMOVE) CAMPAIGN
// =============================================================================

export async function removeGoogleCampaign(options: {
    accessToken: string
    developerToken: string
    customerId: string
    campaignId: string
    loginCustomerId?: string | null
}): Promise<{ success: boolean }> {
    return updateGoogleCampaignStatus({
        ...options,
        status: 'PAUSED',
    }) as Promise<{ success: boolean }>
}
