import type { TaskCommentAttachment } from '@/types/task-comments';
import { uploadStorageFile } from '@/lib/upload-storage-file';
const ALLOWED_MIME_TYPES = new Set<string>([
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
    'text/markdown',
    'application/zip',
    'application/x-zip-compressed',
]);
const MAX_BYTES = 15 * 1024 * 1024;
function formatFileSize(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0)
        return '1 KB';
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 * 1024)
        return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
export async function uploadTaskCommentAttachment(args: {
    userId: string;
    taskId: string;
    file: File;
    generateUploadUrl: () => Promise<{
        url: string;
        key: string;
    }>;
    syncMetadata: (args: {
        key: string;
    }) => Promise<unknown>;
    getPublicUrl: (args: {
        storageId: string;
    }) => Promise<{
        url: string | null;
    }>;
}): Promise<TaskCommentAttachment> {
    const { userId, taskId, file, generateUploadUrl, syncMetadata, getPublicUrl } = args;
    if (!userId)
        throw new Error('userId is required');
    if (!taskId)
        throw new Error('taskId is required');
    if (!file)
        throw new Error('file is required');
    if (file.size > MAX_BYTES) {
        throw new Error('Attachment is too large (max 15MB)');
    }
    const contentType = file.type || 'application/octet-stream';
    if (!ALLOWED_MIME_TYPES.has(contentType)) {
        throw new Error('Unsupported attachment file type');
    }
    const storageId = await uploadStorageFile({
        file,
        contentType,
        generateUploadUrl,
        syncMetadata,
    });
    const publicUrl = await getPublicUrl({ storageId });
    if (!publicUrl?.url) {
        throw new Error('Unable to resolve uploaded file URL');
    }
    return {
        name: file.name,
        url: publicUrl.url,
        type: contentType,
        size: formatFileSize(file.size),
    };
}
