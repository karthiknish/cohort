'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useReducer } from 'react';
import { useAction } from 'convex/react';
import { Card } from '@/shared/ui/card';
import { toast } from '@/shared/ui/use-toast';
import { useAuth } from '@/shared/contexts/auth-context';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { adsCreativesApi } from '@/lib/convex-api';
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils';
import { CreativeComparisonDialog, CreativesCardContent, CreativesCardHeader, CreativesDisconnectedState, type Creative, } from './creatives-card-sections';
// =============================================================================
// TYPES
// =============================================================================
type Props = {
    providerId: string;
    providerName: string;
    isConnected: boolean;
    /** Meta `listCreatives` Graph page cap (1–100). */
    maxMetaCreativePages?: number;
    /** Google `listCreatives` search page cap (1–50). */
    maxGoogleAdsSearchPages?: number;
};
type CreativesCardState = {
    creatives: Creative[];
    loading: boolean;
    summary: {
        total: number;
        byType: Record<string, number>;
    } | null;
    selectedIds: Set<string>;
    compareOpen: boolean;
};
type CreativesCardAction = {
    type: 'setCreatives';
    value: Creative[];
} | {
    type: 'setLoading';
    value: boolean;
} | {
    type: 'setSummary';
    value: {
        total: number;
        byType: Record<string, number>;
    } | null;
} | {
    type: 'toggleSelected';
    creativeId: string;
} | {
    type: 'setCompareOpen';
    value: boolean;
};
function creativesCardReducer(state: CreativesCardState, action: CreativesCardAction): CreativesCardState {
    switch (action.type) {
        case 'setCreatives':
            return { ...state, creatives: action.value };
        case 'setLoading':
            return { ...state, loading: action.value };
        case 'setSummary':
            return { ...state, summary: action.value };
        case 'toggleSelected': {
            const next = new Set(state.selectedIds);
            if (next.has(action.creativeId)) {
                next.delete(action.creativeId);
            }
            else {
                next.add(action.creativeId);
            }
            return { ...state, selectedIds: next };
        }
        case 'setCompareOpen':
            return { ...state, compareOpen: action.value };
        default:
            return state;
    }
}
// =============================================================================
// COMPONENT
// =============================================================================
export function CreativesCard({ providerId, providerName, isConnected, maxMetaCreativePages, maxGoogleAdsSearchPages }: Props) {
    const { user } = useAuth();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const listCreatives = useAction(adsCreativesApi.listCreatives);
    const [state, dispatch] = useReducer(creativesCardReducer, {
        creatives: [],
        loading: false,
        summary: null,
        selectedIds: new Set<string>(),
        compareOpen: false,
    });
    const { creatives, loading, summary, selectedIds, compareOpen } = state;
    const handleOpenCompare = () => {
        dispatch({ type: 'setCompareOpen', value: true });
    };
    const handleCompareOpenChange = (open: boolean) => {
        dispatch({ type: 'setCompareOpen', value: open });
    };
    const handlePromoteCreative = () => {
        toast({
            title: 'A/B Test Action',
            description: 'Creative promoted to primary. Syncing with platform...',
        });
    };
    const fetchCreatives = async () => {
        if (!isConnected)
            return;
        dispatch({ type: 'setLoading', value: true });
        if (!workspaceId) {
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        void listCreatives({
            workspaceId,
            providerId: toAdsProviderId(providerId),
            clientId: null,
            ...(providerId === 'facebook'
                ? { maxMetaCreativePages: maxMetaCreativePages ?? 40 }
                : {}),
            ...(providerId === 'google'
                ? { maxGoogleAdsSearchPages: maxGoogleAdsSearchPages ?? 12 }
                : {}),
        })
            .then((creativesList) => {
            dispatch({ type: 'setCreatives', value: Array.isArray(creativesList) ? (creativesList as Creative[]) : [] });
            dispatch({ type: 'setSummary', value: null });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CreativesCard:fetchCreatives',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setLoading', value: false });
        });
    };
    const handleToggleSelected = (creativeId: string) => {
        dispatch({ type: 'toggleSelected', creativeId });
    };
    if (!isConnected) {
        return <CreativesDisconnectedState providerName={providerName}/>;
    }
    return (<Card>
      <CreativesCardHeader loading={loading} onCompare={handleOpenCompare} onLoad={fetchCreatives} providerName={providerName} selectedCount={selectedIds.size} summary={summary}/>
      <CreativesCardContent creatives={creatives} onToggleSelected={handleToggleSelected} selectedIds={selectedIds} summary={summary}/>
      <CreativeComparisonDialog creatives={creatives} onOpenChange={handleCompareOpenChange} onPromote={handlePromoteCreative} open={compareOpen} providerName={providerName} selectedIds={selectedIds}/>
    </Card>);
}
