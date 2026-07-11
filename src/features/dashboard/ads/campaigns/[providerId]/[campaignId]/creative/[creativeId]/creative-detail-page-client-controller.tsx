'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useEffectEvent, useMemo, useReducer, useRef } from 'react';
import { useBlocker } from '@tanstack/react-router';
import { useParams } from '@/shared/ui/navigation';
import { useClientContext } from '@/shared/contexts/client-context';
import { useAuth } from '@/shared/contexts/auth-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { calculateAlgorithmicInsights, calculateEfficiencyScore } from '@/lib/ad-algorithms';
import { mergeMetaDestinationSpec } from '@/services/integrations/meta-ads';
import { formatMetaCallToActionLabel } from '@/services/integrations/meta-ads/meta-call-to-action';
import { useAction } from 'convex/react';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { adsAdMetricsApi, adsCreativesApi, creativesCopyApi } from '@/lib/convex-api';
import { creativeCopyIsDirty, mergeMetaAssetFeedSpecForSave, normalizeStringList, } from '@/features/dashboard/ads/creative/components/creative-editing-utils';
import { normalizeCreativeCtaValue } from '@/features/dashboard/ads/creative/components/helpers';
import type { Creative } from '@/features/dashboard/ads/creative/components/types';
import { buildCreativePerformanceSummary, buildCreativePreviewCreative, buildPreviewCopySuggestions, buildPreviewCreative, buildPreviewCreativeMetrics, resolveRouteProviderId, type NormalizedAdMetric, } from './creative-detail-page-client-utils';
import { createInitialCreativeDetailPageState, creativeDetailPageReducer, } from './creative-detail-page-client-state';
import { normalizeCurrencyCode } from '@/constants/currencies';
import { PageSkeletonBoundary } from '@/shared/ui/page-skeleton-boundary';
import { CreativeDetailPageContent } from './creative-detail-page-client-sections';
import { CreativeDetailPageLoadingState } from './creative-detail-page-client-loading';
import { CreativeDetailPageNotFoundState } from './creative-detail-page-client-not-found';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
export type CreativeDetailPageClientProps = {
    campaignName?: string | null;
    currency?: string | null;
    searchParamsString?: string;
};
export function useCreativeDetailPageClient(props: CreativeDetailPageClientProps) {
    const { campaignName: initialCampaignName, currency, searchParamsString = '', } = props;
    const params = useParams() as {
        providerId: string;
        campaignId: string;
        creativeId: string;
    };
    const { selectedClientId } = useClientContext();
    const { user } = useAuth();
    const { isPreviewMode } = usePreview();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const listCreatives = useAction(adsCreativesApi.listCreatives);
    const updateCreative = useAction(adsCreativesApi.updateCreative);
    const listAdMetrics = useAction(adsAdMetricsApi.listAdMetrics);
    const generateCopyAction = useAction(creativesCopyApi.generateCopy);
    const [state, dispatch] = useReducer(creativeDetailPageReducer, undefined, createInitialCreativeDetailPageState);
    const { creative, loading, copiedField, isEditing, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex, isSaving, generatingHeadlines, generatingDescriptions, days, creativeMetrics, } = state;
    const metricsLoadingRef = useRef(false);
    const metricsErrorRef = useRef<string | null>(null);
    const setPreviewHeadlineIndex = (value: number) => {
        dispatch({ type: 'setPreviewHeadlineIndex', value });
    };
    const setPreviewDescriptionIndex = (value: number) => {
        dispatch({ type: 'setPreviewDescriptionIndex', value });
    };
    const setEditedCta = (value: string) => {
        dispatch({ type: 'setEditedCta', value });
    };
    const setEditedLandingPage = (value: string) => {
        dispatch({ type: 'setEditedLandingPage', value });
    };
    const campaignName = initialCampaignName || 'Campaign';
    const displayCurrency = normalizeCurrencyCode(currency ?? undefined) ?? 'USD';
    const convexProviderId = resolveRouteProviderId(params.providerId);
    const fetchCreative = useCallback(async () => {
        dispatch({ type: 'setLoading', value: true });
        if (!convexProviderId) {
            dispatch({ type: 'setLoading', value: false });
            notifyFailure({
                title: 'Unsupported provider',
                message: 'This provider is not supported in the creative detail view.',
            });
            return;
        }
        if (isPreviewMode) {
            dispatch({
                type: 'setCreative',
                value: buildPreviewCreative(convexProviderId, params.campaignId, params.creativeId, campaignName),
            });
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        if (!workspaceId) {
            dispatch({ type: 'setLoading', value: false });
            return;
        }
        await listCreatives({
            workspaceId,
            providerId: convexProviderId,
            clientId: selectedClientId ?? null,
            campaignId: params.campaignId,
            includeMedia: convexProviderId === 'facebook',
            maxMetaCreativePages: convexProviderId === 'facebook' ? 40 : undefined,
            maxGoogleAdsSearchPages: convexProviderId === 'google' ? 15 : undefined,
        })
            .then((creatives) => {
            const normalizedCreatives = Array.isArray(creatives) ? (creatives as Creative[]) : [];
            const match = normalizedCreatives.find((c) => (c.creativeId === params.creativeId
                || c.adId === params.creativeId
                || c.platformCreativeId === params.creativeId));
            if (!match) {
                throw new Error('Creative not found');
            }
            dispatch({ type: 'setCreative', value: match });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CreativeDetailPage:fetchCreative',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setLoading', value: false });
        });
    }, [
        dispatch,
        convexProviderId,
        isPreviewMode,
        params,
        campaignName,
        workspaceId,
        selectedClientId,
    ]);
    const fetchMetrics = useCallback(async () => {
        if (!convexProviderId) {
            dispatch({ type: 'setCreativeMetrics', value: null });
            metricsErrorRef.current = 'Unsupported provider';
            metricsLoadingRef.current = false;
            return;
        }
        if (isPreviewMode) {
            metricsLoadingRef.current = true;
            metricsErrorRef.current = null;
            dispatch({
                type: 'setCreativeMetrics',
                value: buildPreviewCreativeMetrics(convexProviderId, params.creativeId, params.campaignId, days),
            });
            metricsLoadingRef.current = false;
            return;
        }
        metricsLoadingRef.current = true;
        metricsErrorRef.current = null;
        if (!workspaceId) {
            dispatch({ type: 'setCreativeMetrics', value: null });
            metricsErrorRef.current = 'Sign in required';
            metricsLoadingRef.current = false;
            return;
        }
        await listAdMetrics({
            workspaceId,
            providerId: convexProviderId,
            clientId: selectedClientId ?? null,
            campaignId: params.campaignId,
            adGroupId: creative?.adGroupId,
            days,
            level: convexProviderId === 'linkedin' ? 'creative' : 'ad',
        })
            .then((response) => {
            const record = response && typeof response === 'object' ? (response as {
                metrics?: unknown;
            }) : null;
            const allMetrics = Array.isArray(record?.metrics) ? (record.metrics as NormalizedAdMetric[]) : [];
            const metricTargetId = creative?.adId ?? params.creativeId;
            const filtered = allMetrics.filter((m) => m.adId === metricTargetId);
            dispatch({ type: 'setCreativeMetrics', value: filtered });
        })
            .catch((error) => {
            logError(error, 'CreativeDetailPage:fetchMetrics');
            dispatch({ type: 'setCreativeMetrics', value: null });
            metricsErrorRef.current = asErrorMessage(error);
        })
            .finally(() => {
            metricsLoadingRef.current = false;
        });
    }, [convexProviderId, isPreviewMode, params.creativeId, params.campaignId, days, workspaceId, selectedClientId, creative?.adGroupId, creative?.adId, listAdMetrics]);
    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            void fetchCreative();
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [params.campaignId, params.creativeId, convexProviderId, isPreviewMode, workspaceId, selectedClientId]);
    useEffect(() => {
        if (!creative)
            return;
        dispatch({ type: 'syncFromCreative', creative });
    }, [creative]);
    useEffect(() => {
        if (!creative)
            return;
        const frameId = requestAnimationFrame(() => {
            void fetchMetrics();
        });
        return () => {
            cancelAnimationFrame(frameId);
        };
    }, [creative, days, convexProviderId, isPreviewMode, workspaceId, selectedClientId, params.campaignId, params.creativeId]);
    const handleCopy = (text: string, field: string) => {
        const canUseClipboardApi = typeof window !== 'undefined' &&
            typeof navigator !== 'undefined' &&
            typeof navigator.clipboard !== 'undefined' &&
            window.isSecureContext;
        const copyPromise = canUseClipboardApi
            ? navigator.clipboard.writeText(text)
            : Promise.resolve().then(() => {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.cssText = 'position:fixed;left:-999999px;top:-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const copied = document.execCommand('copy');
                textArea.remove();
                if (!copied) {
                    throw new Error('Copy command failed');
                }
            });
        void copyPromise
            .then(() => {
            dispatch({ type: 'setCopiedField', value: field });
            notifySuccess({
                title: 'Copied to clipboard',
                message: 'Text has been copied successfully.',
            });
            setTimeout(() => dispatch({ type: 'setCopiedField', value: null }), 2000);
        })
            .catch((err) => {
            reportConvexFailure({
                error: err,
                context: 'CreativeDetailPage:copyField',
                title: 'Copy failed',
                fallbackMessage: 'Copy failed',
            });
        });
    };
    const isDirty = (() => {
        if (!creative)
            return false;
        return creativeCopyIsDirty(creative, {
            headlines: editedHeadlines,
            descriptions: editedDescriptions,
            cta: editedCta,
            landingPage: editedLandingPage,
        });
    })();
    const previewCreative = (() => {
        if (!creative)
            return null;
        return buildCreativePreviewCreative(creative, editedHeadlines, editedDescriptions, editedCta, editedLandingPage, previewHeadlineIndex, previewDescriptionIndex);
    })();
    const cancelEditing = () => {
        if (!creative)
            return;
        dispatch({ type: 'syncFromCreative', creative });
    };
    const generateCopy = async (kind: 'headlines' | 'captions') => {
        if (!creative)
            return;
        const setGenerating = kind === 'headlines'
            ? (value: boolean) => dispatch({ type: 'setGeneratingHeadlines', value })
            : (value: boolean) => dispatch({ type: 'setGeneratingDescriptions', value });
        if (isPreviewMode) {
            setGenerating(true);
            const additions = buildPreviewCopySuggestions(kind, creative, campaignName);
            if (kind === 'headlines') {
                dispatch({
                    type: 'updateEditedHeadlines',
                    updater: (prev) => {
                        const base = prev.length > 0 ? prev : (creative.headlines ?? []);
                        const seen = new Set(base.flatMap((value) => { const v = value.trim().toLowerCase(); return v ? [v] : []; }));
                        const uniqueAdditions = additions.filter((value) => {
                            const key = value.trim().toLowerCase();
                            if (!key || seen.has(key)) {
                                return false;
                            }
                            seen.add(key);
                            return true;
                        });
                        return [...base, ...uniqueAdditions];
                    },
                });
            }
            else {
                dispatch({
                    type: 'updateEditedDescriptions',
                    updater: (prev) => {
                        const base = prev.length > 0 ? prev : (creative.descriptions ?? []);
                        const seen = new Set(base.flatMap((value) => { const v = value.trim().toLowerCase(); return v ? [v] : []; }));
                        const uniqueAdditions = additions.filter((value) => {
                            const key = value.trim().toLowerCase();
                            if (!key || seen.has(key)) {
                                return false;
                            }
                            seen.add(key);
                            return true;
                        });
                        return [...base, ...uniqueAdditions];
                    },
                });
            }
            notifyInfo({
                title: kind === 'headlines' ? 'Sample headlines added' : 'Sample captions added',
                message: 'Preview mode generated local-only sample variants for this session.',
            });
            setGenerating(false);
            return;
        }
        setGenerating(true);
        if (!convexProviderId) {
            setGenerating(false);
            notifyFailure({
                title: 'Unsupported provider',
                message: 'AI copy generation is not available for this ad platform.',
            });
            return;
        }
        if (!workspaceId) {
            setGenerating(false);
            notifyFailure({
                title: 'Sign in required',
                message: 'You need to be signed in to generate AI copy.',
            });
            return;
        }
        const ctaForPrompt = formatMetaCallToActionLabel(editedCta || creative.callToAction)
            || editedCta
            || creative.callToAction;
        await generateCopyAction({
            providerId: convexProviderId,
            clientId: selectedClientId ?? undefined,
            campaignId: params.campaignId,
            creativeId: params.creativeId,
            campaignName,
            creativeName: creative.name,
            landingPageUrl: editedLandingPage || creative.landingPageUrl,
            callToAction: ctaForPrompt,
            creativeType: creative.type,
            pageName: creative.pageName,
            existingHeadlines: (editedHeadlines.length ? editedHeadlines : (creative.headlines ?? [])).filter(Boolean),
            existingCaptions: (editedDescriptions.length ? editedDescriptions : (creative.descriptions ?? [])).filter(Boolean),
            kind: kind === 'headlines' ? 'headlines' : 'captions',
            count: 5,
        })
            .then((result) => {
            const headlines = result.headlines;
            const captions = result.captions;
            if (kind === 'headlines') {
                if (headlines.length === 0) {
                    notifySuccess({ title: 'No new headlines', message: 'Try again with different inputs.' });
                    return;
                }
                dispatch({
                    type: 'updateEditedHeadlines',
                    updater: (prev) => {
                        const base = prev.length ? prev : [];
                        const existing = new Set(base.flatMap((s) => { const v = s.trim().toLowerCase(); return v ? [v] : []; }));
                        const additions = headlines.filter((h: string) => {
                            const key = h.trim().toLowerCase();
                            if (!key)
                                return false;
                            if (existing.has(key))
                                return false;
                            existing.add(key);
                            return true;
                        });
                        return [...base, ...additions];
                    },
                });
                notifySuccess({ title: 'Generated headlines', message: `Added ${headlines.length} new variant(s).` });
                return;
            }
            if (captions.length === 0) {
                notifySuccess({ title: 'No new captions', message: 'Try again with different inputs.' });
                return;
            }
            dispatch({
                type: 'updateEditedDescriptions',
                updater: (prev) => {
                    const base = prev.length ? prev : [];
                    const existing = new Set(base.flatMap((s) => { const v = s.trim().toLowerCase(); return v ? [v] : []; }));
                    const additions = captions.filter((c: string) => {
                        const key = c.trim().toLowerCase();
                        if (!key)
                            return false;
                        if (existing.has(key))
                            return false;
                        existing.add(key);
                        return true;
                    });
                    return [...base, ...additions];
                },
            });
            notifySuccess({ title: 'Generated captions', message: `Added ${captions.length} new variant(s).` });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CreativeDetailPage:generateCopy',
                title: 'AI generation error',
                fallbackMessage: 'AI generation error',
            });
        })
            .finally(() => {
            setGenerating(false);
        });
    };
    const handleSave = async () => {
        if (isPreviewMode) {
            if (!creative) {
                return;
            }
            const normalizedHeadlines = editedHeadlines.flatMap((headline) => { const h = headline.trim(); return h ? [h] : []; });
            const normalizedDescriptions = editedDescriptions.flatMap((description) => { const d = description.trim(); return d ? [d] : []; });
            const normalizedCta = editedCta.trim();
            const normalizedLandingPage = editedLandingPage.trim();
            dispatch({
                type: 'patchCreative',
                updater: (previousCreative) => {
                    if (!previousCreative) {
                        return previousCreative;
                    }
                    return {
                        ...previousCreative,
                        headlines: normalizedHeadlines,
                        descriptions: normalizedDescriptions,
                        callToAction: normalizedCta,
                        landingPageUrl: normalizedLandingPage,
                    };
                },
            });
            dispatch({ type: 'setIsEditing', value: false });
            notifyInfo({
                title: 'Sample creative updated',
                message: 'Preview mode applied your edits locally for this session only.',
            });
            return;
        }
        if (!workspaceId) {
            notifyFailure({
                title: 'Sign in required',
                message: 'You need to be signed in to save creative updates.',
            });
            return;
        }
        if (!creative) {
            notifyFailure({
                title: 'Creative unavailable',
                message: 'Creative details are not loaded yet.',
            });
            return;
        }
        if (!convexProviderId) {
            notifyFailure({
                title: 'Unsupported provider',
                message: 'This provider is not supported for updates.',
            });
            return;
        }
        dispatch({ type: 'setIsSaving', value: true });
        const normalizedHeadlines = normalizeStringList(editedHeadlines);
        const normalizedDescriptions = normalizeStringList(editedDescriptions);
        const normalizedCta = normalizeCreativeCtaValue(editedCta);
        const normalizedLandingPage = editedLandingPage.trim();
        const mergedAssetFeedSpec = convexProviderId === 'facebook'
            ? mergeMetaAssetFeedSpecForSave(creative.assetFeedSpec, normalizedHeadlines, normalizedDescriptions, normalizedLandingPage) ?? creative.assetFeedSpec
            : creative.assetFeedSpec;
        await updateCreative({
            workspaceId,
            providerId: convexProviderId,
            clientId: selectedClientId ?? null,
            creativeId: creative.platformCreativeId ?? creative.creativeId,
            adId: creative.adId ?? creative.creativeId,
            name: creative.name,
            title: normalizedHeadlines[0],
            body: normalizedDescriptions[0],
            description: creative.objectType?.toUpperCase() === 'VIDEO' || creative.videoId
                ? undefined
                : normalizedDescriptions[1],
            callToActionType: normalizedCta || undefined,
            linkUrl: normalizedLandingPage || undefined,
            objectType: creative.objectType,
            imageUrl: creative.imageUrl || creative.thumbnailUrl,
            imageHash: creative.imageHash,
            videoId: creative.videoId,
            pageId: creative.pageId,
            assetFeedSpec: mergedAssetFeedSpec,
            destinationSpec: mergeMetaDestinationSpec(creative.destinationSpec, normalizedLandingPage || undefined),
        })
            .then((result) => {
            if (creative) {
                dispatch({
                    type: 'patchCreative',
                    updater: (previousCreative) => {
                        if (!previousCreative) {
                            return previousCreative;
                        }
                        return {
                            ...previousCreative,
                            platformCreativeId: (result as {
                                creativeId?: string;
                            } | undefined)?.creativeId ?? previousCreative.platformCreativeId,
                            headlines: normalizedHeadlines,
                            descriptions: normalizedDescriptions,
                            callToAction: normalizedCta,
                            landingPageUrl: normalizedLandingPage,
                        };
                    },
                });
            }
            void fetchCreative();
            notifySuccess({
                title: 'Changes saved',
                message: 'Your creative has been updated successfully.',
            });
            dispatch({ type: 'setIsEditing', value: false });
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'CreativeDetailPage:handleSave',
                title: 'Error',
                fallbackMessage: 'Error',
            });
        })
            .finally(() => {
            dispatch({ type: 'setIsSaving', value: false });
        });
    };
    const addHeadline = () => {
        dispatch({ type: 'updateEditedHeadlines', updater: (current) => [...current, ''] });
    };
    const removeHeadline = (index: number) => {
        dispatch({ type: 'updateEditedHeadlines', updater: (current) => current.filter((_, currentIndex) => currentIndex !== index) });
        dispatch({
            type: 'updatePreviewHeadlineIndex',
            updater: (current) => {
                if (index < current)
                    return current - 1;
                if (index === current)
                    return Math.max(0, current - 1);
                return current;
            },
        });
    };
    const updateHeadline = (index: number, value: string) => {
        dispatch({
            type: 'updateEditedHeadlines',
            updater: (current) => {
                const updated = [...current];
                updated[index] = value;
                return updated;
            },
        });
    };
    const addDescription = () => {
        dispatch({ type: 'updateEditedDescriptions', updater: (current) => [...current, ''] });
    };
    const removeDescription = (index: number) => {
        dispatch({ type: 'updateEditedDescriptions', updater: (current) => current.filter((_, currentIndex) => currentIndex !== index) });
        dispatch({
            type: 'updatePreviewDescriptionIndex',
            updater: (current) => {
                if (index < current)
                    return current - 1;
                if (index === current)
                    return Math.max(0, current - 1);
                return current;
            },
        });
    };
    const updateDescription = (index: number, value: string) => {
        dispatch({
            type: 'updateEditedDescriptions',
            updater: (current) => {
                const updated = [...current];
                updated[index] = value;
                return updated;
            },
        });
    };
    const handleGenerateHeadlines = () => {
        void generateCopy('headlines');
    };
    const handleGenerateDescriptions = () => {
        void generateCopy('captions');
    };
    const onSaveShortcut = useEffectEvent(() => {
        if (isDirty && !isSaving) {
            void handleSave();
        }
    });
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 's') {
                event.preventDefault();
                onSaveShortcut();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);
    const backUrl = `/dashboard/ads/campaigns/${params.providerId}/${params.campaignId}${searchParamsString ? `?${searchParamsString}` : ''}`;
    const displayName = (() => {
        if (!creative)
            return params.creativeId;
        return creative.name || creative.headlines?.[0] || creative.creativeId;
    })();
    const performanceSummary = buildCreativePerformanceSummary(creativeMetrics, convexProviderId, days, displayCurrency);
    const efficiencyScore = (() => {
        if (!performanceSummary)
            return null;
        return calculateEfficiencyScore(performanceSummary);
    })();
    const algorithmicInsights = (() => {
        if (!performanceSummary)
            return [];
        return calculateAlgorithmicInsights(performanceSummary);
    })();
    const leaveBlocker = useBlocker({
        shouldBlockFn: () => isDirty && !isSaving,
        enableBeforeUnload: () => isDirty && !isSaving,
        withResolver: true,
    });
    return (<>
    <ConfirmDialog open={leaveBlocker.status === 'blocked'} onOpenChange={(open) => {
            if (!open)
                leaveBlocker.reset?.();
        }} title="Discard unsaved changes?" description="You have unsaved creative edits. Leaving now will discard them." confirmLabel="Discard changes" cancelLabel="Keep editing" variant="warning" onConfirm={() => leaveBlocker.proceed?.()} onCancel={() => leaveBlocker.reset?.()}/>
    <PageSkeletonBoundary loading={loading && !creative} loadingContent={<CreativeDetailPageLoadingState />}>
  {!creative && !loading ? (<CreativeDetailPageNotFoundState backUrl={backUrl}/>) : creative ? (<CreativeDetailPageContent creative={creative} previewCreative={previewCreative ?? creative} backUrl={backUrl} campaignName={campaignName} displayName={displayName} isDirty={isDirty} isSaving={isSaving} copiedField={copiedField} isEditing={isEditing} editedHeadlines={editedHeadlines} editedDescriptions={editedDescriptions} editedCta={editedCta} editedLandingPage={editedLandingPage} previewHeadlineIndex={previewHeadlineIndex} previewDescriptionIndex={previewDescriptionIndex} generatingHeadlines={generatingHeadlines} generatingDescriptions={generatingDescriptions} performanceSummary={performanceSummary} efficiencyScore={efficiencyScore} algorithmicInsights={algorithmicInsights} onCopy={handleCopy} onCancelEditing={cancelEditing} onSave={handleSave} onRefreshCreative={fetchCreative} onRefreshPerformance={fetchMetrics} onPreviewHeadlineIndexChange={setPreviewHeadlineIndex} onPreviewDescriptionIndexChange={setPreviewDescriptionIndex} onAddHeadline={addHeadline} onRemoveHeadline={removeHeadline} onUpdateHeadline={updateHeadline} onAddDescription={addDescription} onRemoveDescription={removeDescription} onUpdateDescription={updateDescription} onChangeCta={setEditedCta} onChangeLandingPage={setEditedLandingPage} onGenerateHeadlines={handleGenerateHeadlines} onGenerateDescriptions={handleGenerateDescriptions}/>) : null}
    </PageSkeletonBoundary>
    </>);
}
