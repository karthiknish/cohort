'use client';
import { notifyFailure, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useMemo, useReducer, useRef, type FormEvent } from 'react';
import { useAction } from 'convex/react';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { adsCreativesApi } from '@/lib/convex-api';
import { getMetaCreativeObjectTypeOptions } from '@/lib/meta-campaign-ui';
import { normalizeMetaCampaignObjective } from '@/lib/meta-ad-set-objective';
import type { CreativeObjectType, CreativeStatus, MetaPageActorOption, } from './create-creative-dialog-sections';
import type { CreateCreativeDialogProps, MetaCreativeObjectType, } from './create-creative-dialog-types';
import { createCreativeDialogReducer, createInitialCreateCreativeDialogState, generateCreativeIdempotencyKey, revokeBlobPreview, toMetaCreativeObjectType, } from './create-creative-dialog-state';
import { useCreateCreativeDialogMedia } from './use-create-creative-dialog-media';
export function useCreateCreativeDialog({ workspaceId, providerId, campaignId, campaignObjective, clientId, adSetId: propAdSetId, availableAdSets: _availableAdSets, onSuccess, }: CreateCreativeDialogProps) {
    const isLeadsCampaign = normalizeMetaCampaignObjective(campaignObjective) === 'OUTCOME_LEADS';
    const isMeta = providerId === 'facebook';
    const allowedObjectTypes = ((): CreativeObjectType[] => {
        if (!isMeta)
            return ['IMAGE', 'VIDEO', 'CAROUSEL'];
        return getMetaCreativeObjectTypeOptions(campaignObjective) as CreativeObjectType[];
    })();
    const [state, dispatch] = useReducer(createCreativeDialogReducer, propAdSetId, createInitialCreateCreativeDialogState);
    const { open, loading, uploadingImage, uploadingVideo, videoPreviewUrl, loadingPageActors, metaPageActors, selectedAdSetId, name, objectType, title, body, description, callToActionType, linkUrl, imageUrl, imageHash, imagePreviewUrl, videoId, pageId, instagramActorId, leadFormId, status, } = state;
    useEffect(() => {
        if (objectType === 'DYNAMIC' && !allowedObjectTypes.includes('DYNAMIC')) {
            dispatch({ type: 'setObjectType', value: 'IMAGE' });
        }
    }, [allowedObjectTypes, objectType]);
    const videoPreviewRef = useRef<string | null>(null);
    useEffect(() => {
        dispatch({ type: 'setSelectedAdSetId', value: propAdSetId });
    }, [propAdSetId]);
    const listMetaPageActors = useAction(adsCreativesApi.listMetaPageActors);
    const createCreative = useAction(adsCreativesApi.createCreative);
    const imagePreviewRef = useRef<string | null>(null);
    const submissionRef = useRef<{
        fingerprint: string;
        key: string;
    } | null>(null);
    const resetForm = () => {
        revokeBlobPreview(imagePreviewRef.current);
        imagePreviewRef.current = null;
        revokeBlobPreview(videoPreviewRef.current);
        videoPreviewRef.current = null;
        dispatch({ type: 'reset', selectedAdSetId: propAdSetId });
        submissionRef.current = null;
    };
    const formFingerprint = JSON.stringify({
        name,
        objectType,
        title,
        body,
        description,
        callToActionType,
        linkUrl,
        imageUrl,
        imageHash,
        videoId,
        pageId,
        instagramActorId,
        leadFormId,
        status,
        selectedAdSetId: selectedAdSetId ?? null,
    });
    const selectedPage = metaPageActors.find((actor) => actor.id === pageId) ?? null;
    const instagramActorOptions = (() => {
        const seen = new Set<string>();
        const options: Array<{
            id: string;
            label: string;
        }> = [];
        for (const actor of metaPageActors) {
            const instagramId = actor.instagramBusinessAccountId;
            if (!instagramId || seen.has(instagramId))
                continue;
            seen.add(instagramId);
            const accountLabel = actor.instagramBusinessAccountName || actor.instagramUsername || instagramId;
            options.push({
                id: instagramId,
                label: accountLabel,
            });
        }
        return options;
    })();
    const handleSelectPage = (nextPageId: string) => {
        const actor = metaPageActors.find((row) => row.id === nextPageId);
        dispatch({
            type: 'selectPage',
            pageId: nextPageId,
            instagramActorId: actor?.instagramBusinessAccountId ?? '',
        });
    };
    const handleOpenChange = (value: boolean) => {
        dispatch({ type: 'setOpen', value });
    };
    const setBody = (value: string) => dispatch({ type: 'setBody', value });
    const setCallToActionType = (value: string) => dispatch({ type: 'setCallToActionType', value });
    const setDescription = (value: string) => dispatch({ type: 'setDescription', value });
    const setImageUrl = (value: string) => dispatch({ type: 'setImageUrl', value });
    const setInstagramActorId = (value: string) => dispatch({ type: 'setInstagramActorId', value });
    const setLeadFormId = (value: string) => dispatch({ type: 'setLeadFormId', value });
    const setLinkUrl = (value: string) => dispatch({ type: 'setLinkUrl', value });
    const setName = (value: string) => dispatch({ type: 'setName', value });
    const setObjectType = (value: CreativeObjectType) => dispatch({ type: 'setObjectType', value });
    const setSelectedAdSetId = (value: string | undefined) => dispatch({ type: 'setSelectedAdSetId', value });
    const setStatus = (value: CreativeStatus) => dispatch({ type: 'setStatus', value });
    const setTitle = (value: string) => dispatch({ type: 'setTitle', value });
    const setVideoId = (value: string) => dispatch({ type: 'setVideoId', value });
    useEffect(() => {
        if (!open || !isMeta || !workspaceId)
            return;
        let cancelled = false;
        dispatch({ type: 'setLoadingPageActors', value: true });
        void listMetaPageActors({
            workspaceId,
            providerId: 'facebook',
            clientId: clientId ?? null,
        })
            .then((actors) => {
            if (cancelled)
                return;
            const normalizedActors = Array.isArray(actors)
                ? (actors as MetaPageActorOption[])
                : [];
            dispatch({
                type: 'applyMetaPageActors',
                actors: normalizedActors,
            });
        })
            .catch((error) => {
            if (cancelled)
                return;
            logError(error, 'CreateCreativeDialog:loadMetaPageActors');
            dispatch({ type: 'clearMetaPageActorsOnError' });
            reportConvexFailure({
                error: error,
                context: 'create-creative-dialog.tsx:catch',
                title: 'Failed to load Meta pages',
                fallbackMessage: 'Failed to load Meta pages',
            });
        })
            .finally(() => {
            if (!cancelled) {
                dispatch({ type: 'setLoadingPageActors', value: false });
            }
        });
        return () => {
            cancelled = true;
        };
    }, [clientId, isMeta, listMetaPageActors, open, workspaceId]);
    const { handleClearImage, handleClearVideo, handleImageUpload, handleVideoUpload } = useCreateCreativeDialogMedia({
        dispatch,
        workspaceId: workspaceId ?? undefined,
        clientId,
        isMeta,
        imagePreviewRef,
        videoPreviewRef,
    });
    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!workspaceId) {
            notifyFailure({
                title: 'Error',
                message: 'Sign in required',
            });
            return;
        }
        if (!name.trim()) {
            notifyFailure({
                title: 'Validation error',
                message: 'Creative name is required',
            });
            return;
        }
        if (!isMeta) {
            notifyFailure({
                title: 'Platform not supported',
                message: 'Creating creatives is currently only supported for Meta (Facebook/Instagram) ads.',
            });
            return;
        }
        if (!selectedAdSetId) {
            notifyFailure({
                title: 'Ad Set required',
                message: 'Please select an ad set to create the ad.',
            });
            return;
        }
        if (!pageId) {
            notifyFailure({
                title: 'Facebook Page required',
                message: 'Select a Facebook Page before creating a Meta creative.',
            });
            return;
        }
        if (!metaPageActors.some((actor) => actor.id === pageId)) {
            notifyFailure({
                title: 'Invalid Facebook Page',
                message: 'The selected page is no longer available. Reload the page list and try again.',
            });
            return;
        }
        if (isLeadsCampaign && !leadFormId) {
            notifyFailure({
                title: 'Lead form required',
                message: 'Select an instant lead form for this leads campaign creative.',
            });
            return;
        }
        const currentSubmission = submissionRef.current;
        const effectiveIdempotencyKey = currentSubmission && currentSubmission.fingerprint === formFingerprint
            ? currentSubmission.key
            : generateCreativeIdempotencyKey();
        submissionRef.current = {
            fingerprint: formFingerprint,
            key: effectiveIdempotencyKey,
        };
        dispatch({ type: 'setLoading', value: true });
        try {
            await createCreative({
                workspaceId,
                providerId: 'facebook',
                clientId: clientId ?? null,
                idempotencyKey: effectiveIdempotencyKey,
                campaignId,
                adSetId: selectedAdSetId,
                name: name.trim(),
                objectType: toMetaCreativeObjectType(objectType),
                title: title.trim() || undefined,
                body: body.trim() || undefined,
                description: description.trim() || undefined,
                callToActionType: callToActionType || undefined,
                linkUrl: linkUrl.trim() || undefined,
                imageUrl: imageUrl.trim() || undefined,
                imageHash: imageHash || undefined,
                videoId: videoId || undefined,
                pageId,
                instagramActorId: instagramActorId || undefined,
                leadgenFormId: leadFormId || undefined,
                status,
            });
            notifySuccess({
                title: 'Creative created',
                message: `Your ad creative "${name}" has been created successfully.`,
            });
            dispatch({ type: 'setOpen', value: false });
            resetForm();
            onSuccess?.();
        }
        catch (error) {
            logError(error, 'CreateCreativeDialog:handleSubmit');
            notifyFailure({
                title: 'Creation failed',
                error,
                fallbackMessage: asErrorMessage(error),
            });
        }
        finally {
            dispatch({ type: 'setLoading', value: false });
        }
    };
    const handleClose = () => {
        dispatch({ type: 'setOpen', value: false });
    };
    return {
        open,
        loading,
        uploadingImage,
        uploadingVideo,
        videoPreviewSrc: videoPreviewUrl,
        imagePreviewSrc: imagePreviewUrl,
        loadingPageActors,
        metaPageActors,
        selectedAdSetId,
        name,
        objectType,
        title,
        body,
        description,
        callToActionType,
        linkUrl,
        imageUrl,
        imageHash,
        videoId,
        pageId,
        instagramActorId,
        leadFormId,
        campaignObjective,
        status,
        isMeta,
        isLeadsCampaign,
        selectedPage,
        instagramActorOptions,
        handleOpenChange,
        setBody,
        setCallToActionType,
        setDescription,
        setImageUrl,
        setInstagramActorId,
        setLeadFormId,
        setLinkUrl,
        setName,
        setObjectType,
        setSelectedAdSetId,
        setStatus,
        setTitle,
        setVideoId,
        handleSelectPage,
        handleClearImage,
        handleClearVideo,
        handleImageUpload,
        handleVideoUpload,
        handleSubmit,
        handleClose,
    };
}
