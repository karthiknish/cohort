'use client';
import { useCallback, type ChangeEvent, type Dispatch, type RefObject } from 'react';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { adsCreativesApi } from '@/lib/convex-api';
import { useAction } from 'convex/react';
import { notifySuccess } from '@/lib/notifications';
import { parseImageHashFromCreativeSpec, revokeBlobPreview, type CreateCreativeDialogAction, } from './create-creative-dialog-state';
type UseCreateCreativeDialogMediaArgs = {
    dispatch: Dispatch<CreateCreativeDialogAction>;
    workspaceId: string | undefined;
    clientId: string | null | undefined;
    isMeta: boolean;
    imagePreviewRef: RefObject<string | null>;
    videoPreviewRef: RefObject<string | null>;
};
export function useCreateCreativeDialogMedia({ dispatch, workspaceId, clientId, isMeta, imagePreviewRef, videoPreviewRef, }: UseCreateCreativeDialogMediaArgs) {
    const uploadMedia = useAction(adsCreativesApi.uploadMedia);
    const handleClearImage = () => {
        revokeBlobPreview(imagePreviewRef.current);
        imagePreviewRef.current = null;
        dispatch({ type: 'clearImage' });
    };
    const handleClearVideo = () => {
        revokeBlobPreview(videoPreviewRef.current);
        videoPreviewRef.current = null;
        dispatch({ type: 'clearVideo' });
    };
    const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (!isMeta) {
            notifySuccess({
                title: 'Platform not supported',
                message: 'Image upload is currently only supported for Meta (Facebook/Instagram) ads.',
            });
            return;
        }
        if (!workspaceId) {
            notifySuccess({
                title: 'Upload failed',
                message: 'Sign in required',
            });
            return;
        }
        dispatch({ type: 'setUploadingImage', value: true });
        const blobUrl = URL.createObjectURL(file);
        revokeBlobPreview(imagePreviewRef.current);
        imagePreviewRef.current = blobUrl;
        dispatch({ type: 'setImagePreviewUrl', value: blobUrl });
        dispatch({ type: 'setImageUrl', value: '' });
        try {
            const fileData = await file.arrayBuffer();
            const result = await uploadMedia({
                workspaceId,
                providerId: 'facebook',
                clientId: clientId ?? null,
                fileName: file.name,
                fileData,
                mimeType: file.type || undefined,
            });
            if (!result.success) {
                throw new Error('Failed to upload media');
            }
            const spec = typeof result.creativeSpec === 'string'
                ? result.creativeSpec
                : result.creativeSpec
                    ? JSON.stringify(result.creativeSpec)
                    : '';
            const hash = spec ? parseImageHashFromCreativeSpec(spec) : null;
            if (hash) {
                dispatch({ type: 'setImageHash', value: hash });
                notifySuccess({
                    title: 'Image uploaded',
                    message: 'Your image has been uploaded successfully.',
                });
            }
        }
        catch (error) {
            logError(error, 'CreateCreativeDialog:handleImageUpload');
            revokeBlobPreview(imagePreviewRef.current);
            imagePreviewRef.current = null;
            dispatch({ type: 'clearImage' });
            notifySuccess({
                title: 'Upload failed',
                message: asErrorMessage(error),
            });
        }
        finally {
            dispatch({ type: 'setUploadingImage', value: false });
            event.target.value = '';
        }
    };
    const handleVideoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        if (!isMeta) {
            notifySuccess({
                title: 'Platform not supported',
                message: 'Video upload is currently only supported for Meta (Facebook/Instagram) ads.',
            });
            return;
        }
        if (!workspaceId) {
            notifySuccess({
                title: 'Upload failed',
                message: 'Sign in required',
            });
            return;
        }
        dispatch({ type: 'setUploadingVideo', value: true });
        const blobUrl = URL.createObjectURL(file);
        revokeBlobPreview(videoPreviewRef.current);
        videoPreviewRef.current = blobUrl;
        dispatch({ type: 'setVideoPreviewUrl', value: blobUrl });
        try {
            const fileData = await file.arrayBuffer();
            const result = await uploadMedia({
                workspaceId,
                providerId: 'facebook',
                clientId: clientId ?? null,
                fileName: file.name,
                fileData,
                mimeType: file.type || undefined,
            });
            if (!result.success) {
                throw new Error('Failed to upload media');
            }
            if (result.videoId) {
                dispatch({ type: 'setVideoId', value: result.videoId });
                notifySuccess({
                    title: 'Video uploaded',
                    message: 'Your video has been uploaded successfully.',
                });
            }
        }
        catch (error) {
            logError(error, 'CreateCreativeDialog:handleVideoUpload');
            revokeBlobPreview(videoPreviewRef.current);
            videoPreviewRef.current = null;
            dispatch({ type: 'clearVideo' });
            notifySuccess({
                title: 'Upload failed',
                message: asErrorMessage(error),
            });
        }
        finally {
            dispatch({ type: 'setUploadingVideo', value: false });
            event.target.value = '';
        }
    };
    return {
        handleClearImage,
        handleClearVideo,
        handleImageUpload,
        handleVideoUpload,
    };
}
