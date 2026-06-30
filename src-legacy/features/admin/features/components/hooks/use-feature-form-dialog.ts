'use client';
import { notifyFailure, notifyInfo, notifySuccess } from '@/lib/notifications';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, useEffect, useReducer } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAction, useConvex, useMutation } from 'convex/react';
import { api } from '/_generated/api';
import { useAuth } from '@/shared/contexts/auth-context';
import { filesApi } from '@/lib/convex-api';
import { uploadStorageFile } from '@/lib/upload-storage-file';
import { usePreview } from '@/shared/contexts/preview-context';
import { validateFile } from '@/lib/utils';
import type { FeatureItem, FeaturePriority, FeatureStatus } from '@/types/features';
import { FEATURE_PRIORITY_LABELS, FEATURE_STATUS_LABELS, } from '@/types/features';
import { createEmptyFeatureFormState, featureFormReducer, type FeatureFormDialogProps, } from '../feature-form-dialog-types';
export function useFeatureFormDialog({ open, onOpenChange, feature, defaultStatus = 'backlog', onSubmit, }: FeatureFormDialogProps) {
    const { isPreviewMode } = usePreview();
    const { user } = useAuth();
    const convex = useConvex();
    const [state, dispatch] = useReducer(featureFormReducer, createEmptyFeatureFormState(defaultStatus));
    const { isSubmitting, isGeneratingTitle, isGeneratingDescription, title, description, status, priority, imageUrl, references, newRefUrl, newRefLabel, } = state;
    const generateFeatureAi = useAction(api.adminFeaturesAi.generate);
    const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
    const syncMetadata = useMutation(filesApi.syncMetadata);
    const getPublicUrl = (args: {
        storageId: string;
    }) => convex.query(filesApi.getPublicUrl, {
        workspaceId: user?.agencyId ?? '',
        storageId: args.storageId,
    });
    const isEditing = !!feature;
    useEffect(() => {
        if (!open) {
            return;
        }
        const frame = requestAnimationFrame(() => {
            dispatch({ type: 'reset', feature, defaultStatus });
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [open, feature, defaultStatus]);
    const handleUploadImage = async (file: File): Promise<string> => {
        const validation = validateFile(file, {
            allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
            maxSizeMb: 2,
        });
        if (!validation.valid) {
            throw new Error(validation.error || 'Invalid image file');
        }
        if (isPreviewMode) {
            return URL.createObjectURL(file);
        }
        const storageId = await uploadStorageFile({
            file,
            contentType: file.type || 'application/octet-stream',
            generateUploadUrl: () => generateUploadUrl({}),
            syncMetadata: (args) => syncMetadata(args),
        });
        const publicUrl = await getPublicUrl({ storageId });
        if (!publicUrl?.url) {
            throw new Error('Unable to resolve uploaded file URL');
        }
        return publicUrl.url;
    };
    const handleGenerateAI = (field: 'title' | 'description') => {
        if (field === 'title') {
            dispatch({ type: 'setGeneratingTitle', value: true });
        }
        else {
            dispatch({ type: 'setGeneratingDescription', value: true });
        }
        if (isPreviewMode) {
            const previewTitle = title.trim() || `${FEATURE_STATUS_LABELS[status]} ${FEATURE_PRIORITY_LABELS[priority]} initiative`;
            const previewDescription = description.trim() || `Sample feature brief: tighten the ${status.replace('_', ' ')} workflow, improve stakeholder clarity, and keep the next release visible in the admin roadmap.`;
            if (field === 'title') {
                dispatch({ type: 'setTitle', value: previewTitle });
            }
            else {
                dispatch({ type: 'setDescription', value: previewDescription });
            }
            notifyInfo({
                title: 'Preview mode',
                message: `Sample ${field} generated locally for this feature.`,
            });
            dispatch({ type: 'setGeneratingTitle', value: false });
            dispatch({ type: 'setGeneratingDescription', value: false });
            return;
        }
        void generateFeatureAi({
            field,
            context: {
                currentTitle: title,
                currentDescription: description,
                status,
                priority,
            },
        })
            .then((data) => {
            if (field === 'title' && data.title) {
                dispatch({ type: 'setTitle', value: data.title });
                notifySuccess({ title: 'Title generated', message: 'AI has suggested a title for your feature.' });
            }
            else if (field === 'description' && data.description) {
                dispatch({ type: 'setDescription', value: data.description });
                notifySuccess({ title: 'Description generated', message: 'AI has suggested a description for your feature.' });
            }
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'FeatureFormDialog:generateFeatureAi',
                title: 'Generation failed',
                fallbackMessage: 'Generation failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setGeneratingTitle', value: false });
            dispatch({ type: 'setGeneratingDescription', value: false });
        });
    };
    const handleAddReference = () => {
        const trimmedUrl = newRefUrl.trim();
        if (!trimmedUrl)
            return;
        if (!URL.canParse(trimmedUrl)) {
            notifyFailure({
                title: 'Invalid URL',
                message: 'Please enter a valid URL',
            });
            return;
        }
        const parsedUrl = new URL(trimmedUrl);
        const label = newRefLabel.trim() || parsedUrl.hostname;
        dispatch({ type: 'addReference', reference: { url: trimmedUrl, label } });
    };
    const handleRemoveReference = (index: number) => {
        dispatch({ type: 'removeReference', index });
    };
    const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setTitle', value: event.target.value });
    };
    const handleDescriptionChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'setDescription', value: event.target.value });
    };
    const handleStatusChange = (value: string) => {
        dispatch({ type: 'setStatus', value: value as FeatureStatus });
    };
    const handlePriorityChange = (value: string) => {
        dispatch({ type: 'setPriority', value: value as FeaturePriority });
    };
    const handleNewRefUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setNewRefUrl', value: event.target.value });
    };
    const handleNewRefLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'setNewRefLabel', value: event.target.value });
    };
    const handleImageUrlChange = (value: string | null) => {
        dispatch({ type: 'setImageUrl', value });
    };
    const handleGenerateTitleClick = () => {
        handleGenerateAI('title');
    };
    const handleGenerateDescriptionClick = () => {
        handleGenerateAI('description');
    };
    const handleClose = () => {
        onOpenChange(false);
    };
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            notifyFailure({
                title: 'Title required',
                message: 'Please enter a feature title',
            });
            return;
        }
        dispatch({ type: 'setIsSubmitting', value: true });
        void onSubmit({
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            imageUrl,
            references,
        })
            .then(() => {
            onOpenChange(false);
        })
            .catch((error) => {
            reportConvexFailure({
                error: error,
                context: 'FeatureFormDialog:handleSubmit',
                title: 'Save failed',
                fallbackMessage: 'Save failed',
            });
        })
            .finally(() => {
            dispatch({ type: 'setIsSubmitting', value: false });
        });
    };
    return {
        isEditing,
        isSubmitting,
        isGeneratingTitle,
        isGeneratingDescription,
        title,
        description,
        status,
        priority,
        imageUrl,
        references,
        newRefUrl,
        newRefLabel,
        handleUploadImage,
        handleAddReference,
        handleRemoveReference,
        handleTitleChange,
        handleDescriptionChange,
        handleStatusChange,
        handlePriorityChange,
        handleNewRefUrlChange,
        handleNewRefLabelChange,
        handleImageUrlChange,
        handleGenerateTitleClick,
        handleGenerateDescriptionClick,
        handleClose,
        handleSubmit,
    };
}
