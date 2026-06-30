import type { DateRange } from '@/features/dashboard/ads/components/date-range-picker';
import type { Campaign, CampaignInsightsResponse, ProviderId } from './campaign-insights-page-types';
type CampaignInsightsPageState = {
    dateRange: DateRange;
    campaignLoading: boolean;
    campaignError: string | null;
    campaign: Campaign | null;
    insightsLoading: boolean;
    insightsError: string | null;
    insights: CampaignInsightsResponse | null;
};
type CampaignInsightsPageAction = {
    type: 'setDateRange';
    value: DateRange;
} | {
    type: 'setCampaignLoading';
    value: boolean;
} | {
    type: 'setCampaignError';
    value: string | null;
} | {
    type: 'setCampaign';
    value: Campaign | null;
} | {
    type: 'patchCampaign';
    updater: (prev: Campaign | null) => Campaign | null;
} | {
    type: 'setInsightsLoading';
    value: boolean;
} | {
    type: 'setInsightsError';
    value: string | null;
} | {
    type: 'setInsights';
    value: CampaignInsightsResponse | null;
};
export function toIsoDateOnly(date: Date): string {
    return date.toISOString().split('T')[0]!;
}
export function parseIsoDateOnly(value: string | null): Date | null {
    if (!value)
        return null;
    const d = new Date(`${value}T00:00:00.000Z`);
    if (Number.isNaN(d.getTime()))
        return null;
    return d;
}
export function parseIsoDateTime(value: string | null): Date | null {
    if (!value)
        return null;
    let normalizedValue = value;
    if (/[+-]\d{4}$/.test(value)) {
        normalizedValue = value.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');
    }
    const d = new Date(normalizedValue);
    if (Number.isNaN(d.getTime()))
        return null;
    return d;
}
function clampDateRange(range: {
    start: Date;
    end: Date;
}): {
    start: Date;
    end: Date;
} {
    const end = range.end;
    const start = range.start.getTime() > end.getTime() ? end : range.start;
    return { start, end };
}
export function createCampaignLifetimeDateRange(campaignStart: Date | null, campaignStop: Date | null): DateRange | null {
    if (!campaignStart && !campaignStop) {
        return null;
    }
    const now = new Date();
    const end = campaignStop && campaignStop <= now ? campaignStop : now;
    const start = campaignStart ?? new Date(new Date(end).setDate(end.getDate() - 30));
    return clampDateRange({ start, end });
}
export function isProviderId(value: string): value is ProviderId {
    return value === 'google' || value === 'tiktok' || value === 'linkedin' || value === 'facebook';
}
export function campaignInsightsPageReducer(state: CampaignInsightsPageState, action: CampaignInsightsPageAction): CampaignInsightsPageState {
    switch (action.type) {
        case 'setDateRange':
            return { ...state, dateRange: action.value };
        case 'setCampaignLoading':
            return { ...state, campaignLoading: action.value };
        case 'setCampaignError':
            return { ...state, campaignError: action.value };
        case 'setCampaign':
            return { ...state, campaign: action.value };
        case 'patchCampaign':
            return { ...state, campaign: action.updater(state.campaign) };
        case 'setInsightsLoading':
            return { ...state, insightsLoading: action.value };
        case 'setInsightsError':
            return { ...state, insightsError: action.value };
        case 'setInsights':
            return { ...state, insights: action.value };
        default:
            return state;
    }
}
export function createInitialDateRange(searchParams: URLSearchParams, campaignStartFromUrl: Date | null, campaignStopFromUrl: Date | null, initialStart: Date | null, initialEnd: Date | null): DateRange {
    const lifetimeRange = createCampaignLifetimeDateRange(campaignStartFromUrl, campaignStopFromUrl);
    if (lifetimeRange) {
        return lifetimeRange;
    }
    if (initialStart || initialEnd) {
        const end = initialEnd ?? (initialStart ? new Date(new Date(initialStart).setDate(initialStart.getDate() + 6)) : new Date());
        const start = initialStart ?? new Date(new Date(end).setDate(end.getDate() - 6));
        return clampDateRange({ start, end });
    }
    const end = new Date();
    const start = new Date(new Date(end).setDate(end.getDate() - 30));
    return { start, end };
}
export function createInitialCampaign(searchParams: URLSearchParams, campaignId: string, providerId: string): Campaign | null {
    const name = searchParams.get('campaignName');
    if (!name)
        return null;
    return {
        id: campaignId,
        providerId,
        name,
        status: 'UNKNOWN',
        startTime: searchParams.get('campaignStartTime') ?? undefined,
        stopTime: searchParams.get('campaignStopTime') ?? undefined,
    };
}
