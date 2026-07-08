'use client';
import { asErrorMessage } from '@/lib/convex-errors';
import { notifyFailure } from '@/lib/notifications';
import { useCallback, useReducer } from 'react';
import { useAction } from 'convex/react';
import { adsTargetingApi } from '@/lib/convex-api';
import { useAuth } from '@/shared/contexts/auth-context';
import { Card } from '@/shared/ui/card';
import { useClientContext } from '@/shared/contexts/client-context';
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils';
import { AudienceBuilderDialog } from './audience-builder-dialog';
import { AudienceTargetingContent, AudienceTargetingDisconnectedState, AudienceTargetingHeader, } from './audience-targeting-card-sections';
// =============================================================================
// TYPES
// =============================================================================
export type TargetingData = {
    providerId: string;
    entityId: string;
    entityName?: string;
    entityType: 'adGroup' | 'campaign';
    demographics: {
        ageRanges: string[];
        genders: string[];
        languages: string[];
    };
    audiences: {
        included: Array<{
            id: string;
            name: string;
            type: string;
        }>;
        excluded: Array<{
            id: string;
            name: string;
        }>;
    };
    locations: {
        included: Array<{
            id: string;
            name: string;
            type: string;
        }>;
        excluded: Array<{
            id: string;
            name: string;
        }>;
    };
    interests: Array<{
        id: string;
        name: string;
        category?: string;
    }>;
    keywords: Array<{
        text: string;
        matchType?: string;
    }>;
    devices: string[];
    placements: string[];
    professional?: {
        industries: Array<{
            id: string;
            name: string;
        }>;
        jobTitles: Array<{
            id: string;
            name: string;
        }>;
        companySizes: string[];
        seniorities: string[];
    };
};
export type Insights = {
    totalEntities: number;
    demographicCoverage: {
        hasAgeTargeting: boolean;
        hasGenderTargeting: boolean;
        hasLocationTargeting: boolean;
    };
    audienceStats: {
        totalAudiences: number;
        hasCustomAudiences: boolean;
        hasRemarketingLists: boolean;
    };
    interestStats: {
        totalInterests: number;
        totalKeywords: number;
    };
};
type Props = {
    providerId: string;
    providerName: string;
    isConnected: boolean;
};
type AudienceTargetingResponse = {
    targeting?: TargetingData[];
    insights?: Insights | null;
};
type AudienceTargetingState = {
    targeting: TargetingData[];
    insights: Insights | null;
    loading: boolean;
    expandedId: string | null;
    builderOpen: boolean;
};
type AudienceTargetingAction = {
    type: 'setTargeting';
    value: TargetingData[];
} | {
    type: 'setInsights';
    value: Insights | null;
} | {
    type: 'setLoading';
    value: boolean;
} | {
    type: 'setExpandedId';
    value: string | null | ((prev: string | null) => string | null);
} | {
    type: 'setBuilderOpen';
    value: boolean;
};
function createInitialAudienceTargetingState(): AudienceTargetingState {
    return {
        targeting: [],
        insights: null,
        loading: false,
        expandedId: null,
        builderOpen: false,
    };
}
function audienceTargetingReducer(state: AudienceTargetingState, action: AudienceTargetingAction): AudienceTargetingState {
    switch (action.type) {
        case 'setTargeting':
            return { ...state, targeting: action.value };
        case 'setInsights':
            return { ...state, insights: action.value };
        case 'setLoading':
            return { ...state, loading: action.value };
        case 'setExpandedId':
            return {
                ...state,
                expandedId: typeof action.value === 'function' ? action.value(state.expandedId) : action.value,
            };
        case 'setBuilderOpen':
            return { ...state, builderOpen: action.value };
        default:
            return state;
    }
}
// =============================================================================
// COMPONENT
// =============================================================================
export function AudienceTargetingCard({ providerId, providerName, isConnected }: Props) {
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const getTargeting = useAction(adsTargetingApi.getTargeting);
    const [state, dispatch] = useReducer(audienceTargetingReducer, undefined, createInitialAudienceTargetingState);
    const { targeting, insights, loading, expandedId, builderOpen } = state;
    const fetchTargeting = async () => {
        if (!isConnected)
            return;
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Missing workspace id',
            });
            return;
        }
        dispatch({ type: 'setLoading', value: true });
        void getTargeting({
            workspaceId,
            providerId: toAdsProviderId(providerId),
            clientId: selectedClientId ?? null,
        })
            .then((data) => {
            const payload = data as AudienceTargetingResponse | null | undefined;
            dispatch({ type: 'setTargeting', value: Array.isArray(payload?.targeting) ? payload.targeting : [] });
            dispatch({ type: 'setInsights', value: payload?.insights ?? null });
        })
            .catch((error) => {
            const message = asErrorMessage(error, 'Failed to load audience targeting data');
            if (message.includes('not configured') || message.includes('missing token') || message.includes('expired')) {
                notifyFailure({
                    title: 'Integration Issue',
                    message: 'Please connect or refresh your Meta ad account.',
                });
            }
            else if (message.includes('Meta API') || message.includes('Facebook')) {
                notifyFailure({
                    title: 'Meta API Error',
                    message: 'Could not fetch targeting data. Please check your connection and try again.',
                });
            }
            else {
                notifyFailure({
                    title: 'Error',
                    message: message,
                });
            }
        })
            .finally(() => {
            dispatch({ type: 'setLoading', value: false });
        });
    };
    const handleOpenBuilder = () => {
        dispatch({ type: 'setBuilderOpen', value: true });
    };
    const handleEdit = () => { };
    const handleToggleExpanded = (entityId: string) => {
        dispatch({
            type: 'setExpandedId',
            value: (current) => (current === entityId ? null : entityId),
        });
    };
    const handleBuilderOpenChange = (open: boolean) => {
        dispatch({ type: 'setBuilderOpen', value: open });
    };
    const formatAgeRange = (range: string) => {
        return range.replace(/_/g, '-').replace('AGE', '').replace('RANGE', '').trim();
    };
    if (!isConnected) {
        return <AudienceTargetingDisconnectedState providerName={providerName}/>;
    }
    return (<Card>
      <AudienceTargetingHeader insights={insights} loading={loading} onLoadTargeting={fetchTargeting} onOpenBuilder={handleOpenBuilder} providerName={providerName}/>
      <AudienceTargetingContent expandedId={expandedId} formatAgeRange={formatAgeRange} insights={insights} onEdit={handleEdit} onToggleExpanded={handleToggleExpanded} targeting={targeting}/>
      <AudienceBuilderDialog isOpen={builderOpen} onOpenChange={handleBuilderOpenChange} providerId={providerId}/>
    </Card>);
}
