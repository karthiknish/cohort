import type { Dispatch } from 'react';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { logError } from '@/lib/convex-errors';
import { buildMetaTargetingFromNormalized } from '@/services/integrations/meta-ads/meta-targeting-serialize';
type MetaTargetingPayload = Record<string, unknown>;
import type { AggregatedAudienceData } from './audience-control-aggregate';
import type { AudienceControlSectionAction } from './audience-control-section-state';
export type AudienceControlDispatch = Dispatch<AudienceControlSectionAction>;
type UpdateAdSetTargeting = (args: {
    workspaceId: string;
    providerId: 'facebook';
    clientId: string | null;
    adSetId: string;
    targeting: MetaTargetingPayload;
}) => Promise<unknown>;
export function mapMetaExcludedLocations(excluded: Array<{
    id: string;
    name: string;
}>) {
    return excluded.map((loc) => ({
        id: loc.id,
        name: loc.name,
        type: 'country' as const,
    }));
}
export function buildBaseMetaTargetingPayload(aggregatedData: AggregatedAudienceData, audiences: AggregatedAudienceData['audiences']) {
    return {
        demographics: aggregatedData.demographics,
        locations: {
            included: aggregatedData.locations.included,
            excluded: mapMetaExcludedLocations(aggregatedData.locations.excluded),
        },
        interests: aggregatedData.interests,
        audiences,
    };
}
type PersistAdSetTargetingArgs = {
    canEditMetaTargeting: boolean;
    workspaceId: string | null;
    activeAdSetId: string | undefined;
    clientId: string | null | undefined;
    updateAdSetTargeting: UpdateAdSetTargeting;
    fetchTargeting: () => Promise<void>;
    dispatch: AudienceControlDispatch;
    selectAdSetDescription: string;
    successDescription: string;
    logContext: string;
    targeting: MetaTargetingPayload;
    clearDrafts: () => void;
};
export async function persistAdSetTargeting({ canEditMetaTargeting, workspaceId, activeAdSetId, clientId, updateAdSetTargeting, fetchTargeting, dispatch, selectAdSetDescription, successDescription, logContext, targeting, clearDrafts, }: PersistAdSetTargetingArgs): Promise<boolean> {
    if (!canEditMetaTargeting || !workspaceId || !activeAdSetId) {
        notifySuccess({
            title: 'Select an ad set',
            message: selectAdSetDescription,
        });
        return false;
    }
    dispatch({ type: 'setSavingTargeting', value: true });
    try {
        await updateAdSetTargeting({
            workspaceId,
            providerId: 'facebook',
            clientId: clientId ?? null,
            adSetId: activeAdSetId,
            targeting,
        });
        notifySuccess({ title: 'Targeting saved', message: successDescription });
        clearDrafts();
        dispatch({ type: 'setEditingSection', value: null });
        await fetchTargeting();
        return true;
    }
    catch (error) {
        logError(error, logContext);
        notifyFailure({
            title: 'Could not save targeting',
            message: 'Check Meta permissions and try again.',
        });
        return false;
    }
    finally {
        dispatch({ type: 'setSavingTargeting', value: false });
    }
}
