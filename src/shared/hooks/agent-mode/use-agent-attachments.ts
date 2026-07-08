'use client';
import { useCallback, useState } from 'react';
import { useAction, useConvex, useMutation } from 'convex/react';
import { agentApi, filesApi } from '@/lib/convex-api';
import { buildAgentAttachmentContext, createPendingAttachmentPlaceholder, getPdfUploadSizeError, readFileAsBase64, type AgentAttachmentContext, type ServerPdfExtractionResult, } from '@/lib/agent-attachments';
import { isPreviewModeEnabled } from '@/lib/preview-data';
import { uploadStorageFileWithPublicUrl } from '@/lib/upload-storage-file';
import { asErrorMessage, logError } from '@/lib/convex-errors';
export function useAgentAttachments(workspaceId: string | null) {
    const convex = useConvex();
    const extractPdfTextAction = useAction(agentApi.extractPdfText);
    const generateUploadUrl = useMutation(filesApi.generateUploadUrl);
    const syncMetadata = useMutation(filesApi.syncMetadata);
    const [pendingAttachments, setPendingAttachments] = useState<AgentAttachmentContext[]>([]);
    const [isExtractingAttachments, setIsExtractingAttachments] = useState(false);
    const getPublicUrl = (args: {
        storageId: string;
    }) => {
        if (!workspaceId) {
            throw new Error('Workspace context missing');
        }
        return convex.query(filesApi.getPublicUrl, {
            workspaceId,
            storageId: args.storageId,
        });
    };
    const extractPdfOnServer = async (file: File): Promise<ServerPdfExtractionResult | null> => {
        if (!workspaceId || isPreviewModeEnabled())
            return null;
        const sizeError = getPdfUploadSizeError(file);
        if (sizeError) {
            return { extractionStatus: 'failed', errorMessage: sizeError };
        }
        try {
            const dataBase64 = await readFileAsBase64(file);
            const result = (await extractPdfTextAction({
                workspaceId,
                fileName: file.name,
                dataBase64,
            })) as ServerPdfExtractionResult;
            return result;
        }
        catch (err) {
            logError(err, 'useAgentMode:serverPdfExtraction');
            return null;
        }
    };
    const persistAttachmentFile = async (file: File, attachment: AgentAttachmentContext): Promise<AgentAttachmentContext> => {
        if (isPreviewModeEnabled() || !workspaceId) {
            return attachment;
        }
        try {
            const { storageId, url } = await uploadStorageFileWithPublicUrl({
                file,
                contentType: file.type || 'application/octet-stream',
                generateUploadUrl: () => generateUploadUrl({}),
                syncMetadata: (args) => syncMetadata(args),
                getPublicUrl,
            });
            return { ...attachment, storageId, url };
        }
        catch (err) {
            logError(err, 'useAgentMode:attachmentUpload');
            return {
                ...attachment,
                errorMessage: attachment.errorMessage ?? 'File was read but could not be saved to storage.',
            };
        }
    };
    const addAttachments = async (files: FileList | File[]) => {
        const nextFiles = Array.from(files);
        if (nextFiles.length === 0)
            return;
        const placeholders = nextFiles.map((file) => createPendingAttachmentPlaceholder(file));
        setPendingAttachments((prev) => [...prev, ...placeholders]);
        setIsExtractingAttachments(true);
        try {
            await Promise.all(nextFiles.map(async (file, index) => {
                const placeholderId = placeholders[index]?.id;
                if (!file || !placeholderId)
                    return;
                try {
                    const extracted = await buildAgentAttachmentContext(file, { extractPdfOnServer });
                    const withStorage = await persistAttachmentFile(file, extracted);
                    setPendingAttachments((prev) => prev.map((attachment) => (attachment.id === placeholderId ? withStorage : attachment)));
                }
                catch (err) {
                    logError(err, 'useAgentMode:attachmentProcessing');
                    setPendingAttachments((prev) => prev.map((attachment) => attachment.id === placeholderId
                        ? {
                            ...attachment,
                            extractionStatus: 'failed',
                            excerpt: 'Could not read this file.',
                            errorMessage: asErrorMessage(err, 'Could not process this attachment.'),
                        }
                        : attachment));
                }
            }));
        }
        finally {
            setIsExtractingAttachments(false);
        }
    };
    const removeAttachment = (attachmentId: string) => {
        setPendingAttachments((prev) => prev.filter((attachment) => attachment.id !== attachmentId));
    };
    const clearAttachments = () => {
        setPendingAttachments([]);
    };
    return {
        pendingAttachments,
        setPendingAttachments,
        isExtractingAttachments,
        addAttachments,
        removeAttachment,
        clearAttachments,
    };
}
