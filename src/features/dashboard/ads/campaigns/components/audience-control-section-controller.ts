'use client';
import { notifyFailure } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useEffect, useEffectEvent, useReducer } from 'react';
import { useAction } from 'convex/react';
import { adsAdSetsApi, adsTargetingApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { useAuth } from '@/shared/contexts/auth-context';
import type { LocationMarker } from '@/shared/ui/location-map';
import { useGeocodeResolveBatch } from '@/shared/hooks/use-geocode';
import { aggregateAudienceTargetingData } from './audience-control-aggregate';
import { buildAudienceLocationMarkers } from './audience-control-location-markers';
import { LOCATION_COORDINATES, findLocationCoordinates } from './audience-control-utils';
import type { TargetingData } from './audience-control-types';
import { toAdsProviderId } from '@/features/dashboard/ads/components/utils';
import { audienceControlSectionReducer, createInitialAudienceControlSectionState, type Insights, } from './audience-control-section-state';
import type { AudienceControlInterestEditorSectionProps } from './audience-control-sections';
import { useAudienceControlTargetingHandlers } from './use-audience-control-targeting-handlers';
type AudienceControlSectionArgs = {
    providerId: string;
    campaignId: string;
    clientId?: string | null;
    isPreviewMode?: boolean;
};
type AudienceTargetingResponse = {
    targeting?: TargetingData[];
    insights?: Insights | null;
};
export function useAudienceControlSection({ providerId, campaignId, clientId, isPreviewMode, }: AudienceControlSectionArgs) {
    const { user } = useAuth();
    const getTargeting = useAction(adsTargetingApi.getTargeting);
    const updateAdSetTargeting = useAction(adsAdSetsApi.updateAdSetTargeting);
    const convexProviderId = toAdsProviderId(providerId);
    const canEditMetaTargeting = convexProviderId === 'facebook' && !isPreviewMode;
    const [state, dispatch] = useReducer(audienceControlSectionReducer, undefined, createInitialAudienceControlSectionState);
    const { targeting, insights, loading, expandedSections, builderOpen, hasLoaded, editingSection, selectedTargetingId, draftInterests, draftLocations, draftAudiences, draftDemographics, draftPlacements, draftPlacementDetail, savingTargeting, } = state;
    const canLoad = !isPreviewMode;
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const unknownLocationNames = (() => {
        const unknowns: string[] = [];
        targeting.forEach((t) => {
            t.locations.included.forEach((loc) => {
                const name = loc.name.toLowerCase().trim();
                if (!LOCATION_COORDINATES[name] && !findLocationCoordinates(loc.name) && !(loc.lat && loc.lng)) {
                    unknowns.push(loc.name);
                }
            });
        });
        return [...new Set(unknowns)];
    })();
    const { data: geocodeBatch } = useGeocodeResolveBatch(unknownLocationNames, {
        enabled: unknownLocationNames.length > 0 && hasLoaded,
    });
    const resolvedCoordinates = geocodeBatch?.coordinates ?? {};
    const geocodeFailedNames = geocodeBatch?.failedNames ?? [];
    const fetchTargeting = useEffectEvent(async () => {
        if (!canLoad) {
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Missing workspace id',
            });
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        dispatch({ type: 'setLoading', value: true });
        void getTargeting({
            workspaceId,
            providerId: toAdsProviderId(providerId),
            clientId: clientId ?? null,
            campaignId,
        })
            .then((data) => {
            const payload = data as AudienceTargetingResponse | null | undefined;
            const nextTargetingRaw = payload?.targeting;
            const nextTargeting = Array.isArray(nextTargetingRaw) ? nextTargetingRaw : [];
            dispatch({
                type: 'applyTargetingFetch',
                targeting: nextTargeting,
                insights: payload?.insights ?? null,
            });
        })
            .catch((error) => {
            const message = asErrorMessage(error, 'Failed to load audience targeting');
            if (message.includes('Unknown Meta API error') || message.includes('INTERNAL_ERROR')) {
                logError(new Error(message), 'AudienceControl:fetchTargeting:suppressedMeta');
            }
            else {
                reportConvexFailure({
                    error,
                    context: 'AudienceControlSection:fetchTargeting',
                    title: 'Error',
                    message,
                });
            }
        })
            .finally(() => {
            dispatch({ type: 'setLoading', value: false });
        });
    });
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            void fetchTargeting();
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [canLoad, campaignId, clientId, providerId, workspaceId]);
    const toggleSection = (section: string) => {
        dispatch({ type: 'toggleSection', section });
    };
    const handleOpenBuilder = () => {
        dispatch({ type: 'setBuilderOpen', value: true });
    };
    const handleBuilderOpenChange = (value: boolean) => {
        dispatch({ type: 'setBuilderOpen', value });
    };
    const handleSelectedTargetingIdChange = (value: string) => {
        dispatch({ type: 'setSelectedTargetingId', value });
    };
    const visibleTargeting = (() => {
        if (targeting.length <= 1)
            return targeting;
        if (selectedTargetingId === 'all')
            return targeting;
        return targeting.filter((t) => t.entityId === selectedTargetingId);
    })();
    const locationMarkers: LocationMarker[] = buildAudienceLocationMarkers(visibleTargeting, resolvedCoordinates);
    const aggregatedData = aggregateAudienceTargetingData(visibleTargeting);
    const activeAdSetId = (() => {
        if (selectedTargetingId !== 'all')
            return selectedTargetingId;
        return targeting[0]?.entityId;
    })();
    const { handleToggleEditing, handlePersistInterests, handleAddInterestDraft, handleRemoveInterestDraft, handleAddLocationDraft, handleRemoveLocationDraft, handlePersistLocations, handleAddAudienceDraft, handleRemoveAudienceDraft, handlePersistAudiences, handlePersistDemographics, handlePersistPlacements, handleTogglePlatformDraft, handleTogglePlacementPositionDraft, handleDraftDemographicsChange, } = useAudienceControlTargetingHandlers({
        dispatch,
        aggregatedData,
        drafts: {
            draftInterests,
            draftLocations,
            draftAudiences,
            draftDemographics,
            draftPlacements,
            draftPlacementDetail,
            editingSection,
        },
        canEditMetaTargeting,
        workspaceId,
        activeAdSetId,
        clientId,
        updateAdSetTargeting,
        fetchTargeting,
    });
    const displayInterests = draftInterests ?? aggregatedData.interests;
    const displayLocations = draftLocations ?? aggregatedData.locations;
    const displayAudiences = draftAudiences ?? aggregatedData.audiences;
    const editorAggregatedData = ({
        ...aggregatedData,
        interests: displayInterests,
        locations: displayLocations,
        audiences: displayAudiences,
    });
    const audienceStats = [
        {
            label: 'Configs',
            value: insights?.totalEntities ?? targeting.length,
        },
        {
            label: 'Locations',
            value: aggregatedData.locations.included.length,
        },
        {
            label: 'Interests',
            value: aggregatedData.interests.length,
        },
        {
            label: 'Audiences',
            value: aggregatedData.audiences.included.length,
        },
    ];
    const headerActionsProps = ({
        loading,
        onOpenBuilder: handleOpenBuilder,
        onRefresh: fetchTargeting,
    });
    const customAudiencesSectionProps = ({
        aggregatedData: editorAggregatedData,
        expandedSections,
        toggleSection,
        editingSection,
        onToggleEditing: handleToggleEditing,
        canEdit: canEditMetaTargeting,
        workspaceId,
        clientId,
        onAddAudience: canEditMetaTargeting ? handleAddAudienceDraft : undefined,
        onRemoveAudience: canEditMetaTargeting ? handleRemoveAudienceDraft : undefined,
        onSaveTargeting: canEditMetaTargeting && editingSection === 'audiences' ? handlePersistAudiences : undefined,
        savingTargeting,
    });
    const interestSectionProps = ({
        aggregatedData: editorAggregatedData,
        expandedSections,
        toggleSection,
        editingSection,
        onToggleEditing: handleToggleEditing,
        canEditMetaTargeting,
        workspaceId,
        clientId,
        onAddInterest: canEditMetaTargeting ? handleAddInterestDraft : undefined,
        onRemoveInterest: canEditMetaTargeting ? handleRemoveInterestDraft : undefined,
        onSaveTargeting: canEditMetaTargeting && editingSection === 'interests' ? handlePersistInterests : undefined,
        savingTargeting,
    });
    return {
        providerId,
        canLoad,
        loading,
        hasLoaded,
        targeting,
        insights,
        builderOpen,
        expandedSections,
        selectedTargetingId,
        editingSection,
        canEditMetaTargeting,
        workspaceId,
        clientId,
        aggregatedData: editorAggregatedData,
        locationMarkers,
        geocodeFailedNames,
        audienceStats,
        headerActionsProps,
        interestSectionProps,
        customAudiencesSectionProps,
        handleBuilderOpenChange,
        handleSelectedTargetingIdChange,
        handleToggleEditing,
        toggleSection,
        handleAddLocationDraft,
        handleRemoveLocationDraft,
        handlePersistLocations,
        handlePersistDemographics,
        handleDraftDemographicsChange,
        draftDemographics,
        handlePersistPlacements,
        handleTogglePlatformDraft,
        handleTogglePlacementPositionDraft,
        draftPlacements,
        draftPlacementDetail,
        savingTargeting,
    };
}
